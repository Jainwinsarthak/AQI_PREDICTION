import os
import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# -------------------------
# SETUP FASTAPI
# -------------------------
app = FastAPI(title="AirSight India Prediction API")

# Configure CORS to allow our Vite frontend to talk to this server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to ["http://localhost:5173"] in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TOKEN = os.environ.get("WAQI_TOKEN", "b129e9cd385f00b22ef7a24a44e786175d799cf3")
backend_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(backend_dir)
MODEL_PATH = os.path.join(project_root, "models", "aqi_production_model.pkl")
DATA_PATH = os.path.join(project_root, "data", "aqi_features.csv")

# -------------------------
# LOAD DATASET & DICTIONARIES
# -------------------------
print("Loading historical features dataset...")
try:
    df = pd.read_csv(DATA_PATH)
    df["date"] = pd.to_datetime(df["date"])

    # Create district mapping from the deduplicated dataframe
    district_mapping = (
        df[["area", "district_encoded"]]
        .drop_duplicates()
        .set_index("area")["district_encoded"]
        .to_dict()
    )

    print("Dataset loaded successfully. Shape:", df.shape)
    print("District Mapping Loaded:", len(district_mapping))

except Exception as e:
    print(f"Error loading dataset from {DATA_PATH}: {e}")
    df = None
    district_mapping = {}

# -------------------------
# LOAD MACHINE LEARNING MODEL
# -------------------------
print("Loading Model...")
try:
    model = joblib.load(MODEL_PATH)
    print("Model Loaded Successfully")
except Exception as e:
    print(f"Error loading ML model: {e}")
    model = None


# -------------------------
# REQUEST & RESPONSE MODELS
# -------------------------
class PredictionRequest(BaseModel):
    state: str
    city: str
    date: str  # YYYY-MM-DD format


# -------------------------
# API ROUTES
# -------------------------
@app.post("/predict")
def predict_aqi(req: PredictionRequest):

    if model is None or df is None:
        raise HTTPException(
            status_code=500,
            detail="Model or Dataset not loaded"
        )

    # Look for matching city (case-insensitive)
    matches = [
        c for c in df["area"].unique()
        if c.lower() == req.city.lower()
    ]

    if not matches:
        raise HTTPException(
            status_code=404,
            detail=f"City '{req.city}' not found in the historical data"
        )

    matched_area = matches[0]

    # Filter data for the requested city
    city_df = df[df["area"] == matched_area].sort_values("date")
    
    if city_df.empty:
        raise HTTPException(
            status_code=404,
            detail="No historical rows found for this city"
        )

    district_encoded = district_mapping[matched_area]
    last_row = city_df.iloc[-1]

    # Extract historical lag values
    lag_1 = float(last_row["lag_1"])
    lag_3 = float(last_row["lag_3"])
    lag_7 = float(last_row["lag_7"])
    rolling_mean_7 = float(last_row["rolling_mean_7"])
    pollutant_encoded = int(last_row["pollutant_encoded"])

    # Process requested target date
    try:
        target_date = pd.Timestamp(req.date)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    month_sin = np.sin(2 * np.pi * target_date.month / 12)
    month_cos = np.cos(2 * np.pi * target_date.month / 12)
    crop_burning = 1 if target_date.month in [10, 11] else 0

    # Build feature DataFrame for target date prediction
    X_new = pd.DataFrame(
        [[
            district_encoded,
            lag_1,
            lag_3,
            lag_7,
            rolling_mean_7,
            target_date.day,
            target_date.month,
            target_date.year,
            month_sin,
            month_cos,
            pollutant_encoded,
            1 if target_date.month in [11, 12, 1, 2] else 0,  # is_winter
            1 if target_date.month in [4, 5, 6] else 0,       # is_summer
            1 if target_date.month in [7, 8, 9] else 0,       # is_monsoon
            crop_burning
        ]],
        columns=[
            "district_encoded",
            "lag_1",
            "lag_3",
            "lag_7",
            "rolling_mean_7",
            "day",
            "month",
            "year",
            "month_sin",
            "month_cos",
            "pollutant_encoded",
            "is_winter",
            "is_summer",
            "is_monsoon",
            "crop_burning"
        ]
    )

    prediction = float(model.predict(X_new)[0])
    current_aqi = float(last_row["aqi_value"])

    # -----------------------------------------------------
    # AUTOREGRESSIVE FORECAST LOOP (7 Days)
    # -----------------------------------------------------
    forecast = []
    forecast.append({
        "label": "Today",
        "aqi": round(current_aqi),
        "isLive": True
    })

    # Build history buffer from recent AQI values for correct lag propagation
    recent_aqi = city_df["aqi_value"].tail(7).tolist()
    recent_aqi.append(prediction)

    for i in range(1, 8):
        future_date = target_date + pd.Timedelta(days=i)

        # Compute lags from history buffer
        temp_lag1 = recent_aqi[-1]
        temp_lag3 = recent_aqi[-3] if len(recent_aqi) >= 3 else recent_aqi[0]
        temp_lag7 = recent_aqi[-7] if len(recent_aqi) >= 7 else recent_aqi[0]
        window = recent_aqi[-7:] if len(recent_aqi) >= 7 else recent_aqi
        temp_roll = sum(window) / len(window)

        month_sin_f = np.sin(2 * np.pi * future_date.month / 12)
        month_cos_f = np.cos(2 * np.pi * future_date.month / 12)
        crop_burning_f = 1 if future_date.month in [10, 11] else 0

        X_future = pd.DataFrame(
            [[
                district_encoded,
                temp_lag1,
                temp_lag3,
                temp_lag7,
                temp_roll,
                future_date.day,
                future_date.month,
                future_date.year,
                month_sin_f,
                month_cos_f,
                pollutant_encoded,
                1 if future_date.month in [11, 12, 1, 2] else 0,
                1 if future_date.month in [4, 5, 6] else 0,
                1 if future_date.month in [7, 8, 9] else 0,
                crop_burning_f
            ]],
            columns=[
                "district_encoded",
                "lag_1",
                "lag_3",
                "lag_7",
                "rolling_mean_7",
                "day",
                "month",
                "year",
                "month_sin",
                "month_cos",
                "pollutant_encoded",
                "is_winter",
                "is_summer",
                "is_monsoon",
                "crop_burning"
            ]
        )

        pred_future = float(model.predict(X_future)[0])

        forecast.append({
            "label": f"+{i}d",
            "aqi": round(pred_future),
            "isLive": False
        })

        # Append prediction to history for next iteration
        recent_aqi.append(pred_future)

    # Calculate metrics
    prediction_value = round(prediction)
    return {
        "city": matched_area,
        "state": req.state,
        "liveAqi": round(current_aqi),
        "aqi": prediction_value,
        "aqiChange": round(prediction_value - current_aqi),
        "cigarettes": max(1, round(prediction_value / 22)),
        "lungStress": min(100, round((prediction_value / 500) * 100)),
        "riskScore": round((prediction_value / 500) * 10, 1),
        "forecast": forecast
    }