import os
import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime

# -------------------------
# SETUP FASTAPI
# -------------------------
app = FastAPI(title="AirSight India Prediction API")

# Configure CORS to allow our Vite frontend to talk to this server
# In production set ALLOWED_ORIGINS env var to your Vercel URL
_raw_origins = os.environ.get("ALLOWED_ORIGINS", "")
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()] or ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,  # must be False when allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

backend_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(backend_dir)
MODEL_PATH = os.path.join(project_root, "models", "aqi_production_model.pkl")
DATA_PATH = os.path.join(project_root, "data", "aqi_features.csv")
DISTRICT_ENCODER_PATH = os.path.join(project_root, "models", "district_encoder.pkl")
POLLUTANT_ENCODER_PATH = os.path.join(project_root, "models", "pollutant_encoder.pkl")

# -------------------------
# LOAD DATASET & DICTIONARIES
# -------------------------
print("Loading historical features dataset...")
try:
    df = pd.read_csv(DATA_PATH)
    df["date"] = pd.to_datetime(df["date"])

    # Pre-compute city lookup for O(1) lookups per request
    # Maps lowercase city name -> original-case city name
    city_lookup = {c.lower(): c for c in df["area"].unique()}

    # Create district mapping from the deduplicated dataframe
    district_mapping = (
        df[["area", "district_encoded"]]
        .drop_duplicates()
        .set_index("area")["district_encoded"]
        .to_dict()
    )

    # Pre-group by city for fast per-city access
    city_groups = {
        city: group.sort_values("date")
        for city, group in df.groupby("area")
    }

    print("Dataset loaded successfully. Shape:", df.shape)
    print("Cities indexed:", len(city_lookup))

except Exception as e:
    print(f"Error loading dataset from {DATA_PATH}: {e}")
    df = None
    city_lookup = {}
    district_mapping = {}
    city_groups = {}

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
# LOAD ENCODERS (if saved by feature_engineering.py)
# -------------------------
district_encoder = None
pollutant_encoder = None
try:
    if os.path.exists(DISTRICT_ENCODER_PATH):
        district_encoder = joblib.load(DISTRICT_ENCODER_PATH)
        print("District encoder loaded from disk.")
    if os.path.exists(POLLUTANT_ENCODER_PATH):
        pollutant_encoder = joblib.load(POLLUTANT_ENCODER_PATH)
        print("Pollutant encoder loaded from disk.")
except Exception as e:
    print(f"Warning: Could not load encoders: {e}. Falling back to CSV mapping.")


# -------------------------
# HEALTH CHECK ENDPOINT
# -------------------------
@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "dataset_loaded": df is not None,
        "cities_indexed": len(city_lookup),
        "latest_date": str(df["date"].max().date()) if df is not None else None,
    }


# -------------------------
# REQUEST & RESPONSE MODELS
# -------------------------
class PredictionRequest(BaseModel):
    state: str
    city: str
    date: str  # YYYY-MM-DD format


def _validate_request(req: PredictionRequest):
    """Validate all incoming fields and raise clear HTTPExceptions."""
    # Validate state
    if not req.state or not req.state.strip():
        raise HTTPException(status_code=400, detail="'state' field is required and cannot be empty.")

    # Validate city
    if not req.city or not req.city.strip():
        raise HTTPException(status_code=400, detail="'city' field is required and cannot be empty.")

    # Validate date format
    try:
        target_date = pd.Timestamp(req.date)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid date format '{req.date}'. Use YYYY-MM-DD (e.g. 2026-07-15)."
        )

    # Reject obviously wrong dates
    if target_date.year < 2020 or target_date.year > 2030:
        raise HTTPException(
            status_code=400,
            detail=f"Date {req.date} is out of the supported range (2020–2030)."
        )

    return target_date


# -------------------------
# API ROUTES
# -------------------------
@app.post("/predict")
def predict_aqi(req: PredictionRequest):

    if model is None or df is None:
        raise HTTPException(
            status_code=500,
            detail="Model or Dataset not loaded. Server may still be warming up — please retry."
        )

    # Validate all inputs (raises HTTPException on failure)
    target_date = _validate_request(req)

    # Look for matching city using pre-computed O(1) lookup
    matched_area = city_lookup.get(req.city.lower())
    if not matched_area:
        raise HTTPException(
            status_code=404,
            detail=f"City '{req.city}' not found. Check spelling or select from the dropdown."
        )

    # Use pre-grouped city data
    city_df = city_groups.get(matched_area)
    if city_df is None or city_df.empty:
        raise HTTPException(
            status_code=404,
            detail=f"No historical records found for city '{matched_area}'."
        )

    district_encoded = district_mapping[matched_area]
    last_row = city_df.iloc[-1]

    pollutant_encoded = int(last_row["pollutant_encoded"])
    current_aqi = float(last_row["aqi_value"])
    last_date = pd.Timestamp(last_row["date"]).normalize()
    target_date_norm = pd.Timestamp(target_date).normalize()
    days_to_predict = (target_date_norm - last_date).days

    # Recursive prediction loop from last_date + 1 up to target_date
    recent_aqi = city_df["aqi_value"].tail(7).tolist()

    if days_to_predict > 0:
        for day_idx in range(1, days_to_predict + 1):
            curr_date = last_date + pd.Timedelta(days=day_idx)

            # Compute lags from our moving history buffer
            temp_lag1 = recent_aqi[-1]
            temp_lag3 = recent_aqi[-3] if len(recent_aqi) >= 3 else recent_aqi[0]
            temp_lag7 = recent_aqi[-7] if len(recent_aqi) >= 7 else recent_aqi[0]
            window = recent_aqi[-7:] if len(recent_aqi) >= 7 else recent_aqi
            temp_roll = sum(window) / len(window)

            month_sin = np.sin(2 * np.pi * curr_date.month / 12)
            month_cos = np.cos(2 * np.pi * curr_date.month / 12)
            crop_burning = 1 if curr_date.month in [10, 11] else 0

            X_step = pd.DataFrame(
                [[
                    district_encoded,
                    temp_lag1,
                    temp_lag3,
                    temp_lag7,
                    temp_roll,
                    curr_date.day,
                    curr_date.month,
                    curr_date.year,
                    month_sin,
                    month_cos,
                    pollutant_encoded,
                    1 if curr_date.month in [11, 12, 1, 2] else 0,
                    1 if curr_date.month in [4, 5, 6] else 0,
                    1 if curr_date.month in [7, 8, 9] else 0,
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

            pred_val = float(model.predict(X_step)[0])
            pred_val = max(0.0, pred_val)
            recent_aqi.append(pred_val)

        prediction = recent_aqi[-1]
    else:
        # Check if the requested target date exists in our historical dataset.
        existing_row = city_df[city_df["date"] == target_date_norm]
        if not existing_row.empty:
            prediction = float(existing_row.iloc[0]["aqi_value"])
        else:
            prediction = current_aqi

    # -----------------------------------------------------
    # AUTOREGRESSIVE FORECAST LOOP (7 Days starting from target_date)
    # -----------------------------------------------------
    forecast = []
    
    # 1. Today point showing Today's live AQI
    forecast.append({
        "label": "Today",
        "aqi": round(current_aqi),
        "isLive": True
    })

    # 2. Predicted values starting from target_date
    if days_to_predict > 0:
        forecast.append({
            "label": target_date_norm.strftime("%d %b"),
            "aqi": round(prediction),
            "isLive": False
        })
        forecast_days = 6
    else:
        forecast_days = 7

    for i in range(1, forecast_days + 1):
        future_date = target_date_norm + pd.Timedelta(days=i)

        # Compute lags from our moving history buffer
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
        pred_future = max(0.0, pred_future)

        forecast.append({
            "label": future_date.strftime("%d %b"),
            "aqi": round(pred_future),
            "isLive": False
        })

        recent_aqi.append(pred_future)

    # Calculate metrics
    prediction_value = round(prediction)
    return {
        "city": matched_area,
        "state": req.state,
        "date": req.date,                          # FIX 1: return the predicted date
        "latestAqi": round(current_aqi),           # FIX 8: renamed from liveAqi
        "liveAqi": round(current_aqi),             # kept for backward-compat
        "aqi": prediction_value,
        "aqiChange": round(prediction_value - current_aqi),
        "cigarettes": max(1, round(prediction_value / 22)),
        "lungStress": min(100, round((prediction_value / 500) * 100)),
        "riskScore": round((prediction_value / 500) * 10, 1),
        "forecast": forecast
    }