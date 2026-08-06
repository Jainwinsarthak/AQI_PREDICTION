import os
import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime

app = FastAPI(title="AirSight India Prediction API")  #api setup

# allow frontend requests
raw = os.environ.get("ALLOWED_ORIGINS", "")
origins = [o.strip() for o in raw.split(",") if o.strip()] or ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

#path of project
base_dir = os.path.dirname(os.path.abspath(__file__))
root = os.path.dirname(base_dir)

MODEL_PATH = os.path.join(root, "models", "aqi_production_model.pkl")
DATA_PATH  = os.path.join(root, "data", "features.csv")
ENC_DISTRICT  = os.path.join(root, "models", "district_encoder.pkl")
ENC_POLLUTANT = os.path.join(root, "models", "pollutant_encoder.pkl")


#load aqi dateset
print("Loading historical features dataset...")
try:
    df = pd.read_csv(DATA_PATH)
    df["date"] = pd.to_datetime(df["date"])


    #Map city names
    city_lookup = {c.lower(): c for c in df["area"].unique()}

    dist_map = (
        df[["area", "district_encoded"]]
        .drop_duplicates()
        .set_index("area")["district_encoded"]
        .to_dict()
    )

    # Store data city-wise
    city_groups = {
        city: grp.sort_values("date")
        for city, grp in df.groupby("area")
    }

    print("Dataset loaded. Shape:", df.shape)
    print("Cities:", len(city_lookup))

except Exception as e:
    print(f"Failed to load dataset from {DATA_PATH}: {e}")
    df = None
    city_lookup = {}
    dist_map = {}
    city_groups = {}


print("Loading model...")
try:
    model = joblib.load(MODEL_PATH)
    print("Model loaded ok")
except Exception as e:
    print(f"Couldn't load model: {e}")
    model = None

dist_enc = None
poll_enc = None
try:
    if os.path.exists(ENC_DISTRICT):
        dist_enc = joblib.load(ENC_DISTRICT)
        print("District encoder loaded.")
    if os.path.exists(ENC_POLLUTANT):
        poll_enc = joblib.load(ENC_POLLUTANT)
        print("Pollutant encoder loaded.")
except Exception as e:
    print(f"Warning: encoder load failed: {e}")


@app.get("/health")
def health_check():
    latest = str(df["date"].max().date()) if df is not None else None
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "dataset_loaded": df is not None,
        "cities_indexed": len(city_lookup),
        "latest_date": latest,
    }


class PredictionRequest(BaseModel):
    state: str
    city: str
    date: str  #YMD


def validate_req(req: PredictionRequest):
    if not req.state or not req.state.strip():
        raise HTTPException(status_code=400, detail="'state' field is required and cannot be empty.")

    if not req.city or not req.city.strip():
        raise HTTPException(status_code=400, detail="'city' field is required and cannot be empty.")

    try:
        ts = pd.Timestamp(req.date)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid date format '{req.date}'. Use YYYY-MM-DD (e.g. 2026-07-15)."
        )

    if ts.year < 2020 or ts.year > 2030:
        raise HTTPException(
            status_code=400,
            detail=f"Date {req.date} is out of the supported range (2020-2030)."
        )

    return ts


def build_features(dist_enc_val, hist, curr_date, poll_enc_val):
    #Lag features
    lag1 = hist[-1]
    lag3 = hist[-3] if len(hist) >= 3 else hist[0]
    lag7 = hist[-7] if len(hist) >= 7 else hist[0]

    win = hist[-7:] if len(hist) >= 7 else hist
    roll = sum(win) / len(win)

    m = curr_date.month
    msin = np.sin(2 * np.pi * m / 12)
    mcos = np.cos(2 * np.pi * m / 12)

    #Seasonal features
    is_winter  = 1 if m in [11, 12, 1, 2] else 0
    is_summer  = 1 if m in [4, 5, 6] else 0
    is_monsoon = 1 if m in [7, 8, 9] else 0
    crop_burn  = 1 if m in [10, 11] else 0

    #input data
    cols = [
        "district_encoded", "lag_1", "lag_3", "lag_7", "rolling_mean_7",
        "day", "month", "year",
        "month_sin", "month_cos",
        "pollutant_encoded",
        "is_winter", "is_summer", "is_monsoon", "crop_burning"
    ]
    vals = [[
        dist_enc_val, lag1, lag3, lag7, roll,
        curr_date.day, m, curr_date.year,
        msin, mcos,
        poll_enc_val,
        is_winter, is_summer, is_monsoon, crop_burn
    ]]
    return pd.DataFrame(vals, columns=cols)


@app.post("/predict")
def predict_aqi(req: PredictionRequest):

    if model is None or df is None:
        raise HTTPException(
            status_code=500,
            detail="Model or Dataset not loaded. Server may still be warming up - please retry."
        )

    target_date = validate_req(req)

    area = city_lookup.get(req.city.lower())
    if not area:
        raise HTTPException(
            status_code=404,
            detail=f"City '{req.city}' not found. Check spelling or select from the dropdown."
        )

    city_df = city_groups.get(area)
    if city_df is None or city_df.empty:
        raise HTTPException(
            status_code=404,
            detail=f"No historical records found for city '{area}'."
        )

    dist_val  = dist_map[area]
    last_row  = city_df.iloc[-1]

    poll_val    = int(last_row["pollutant_encoded"])
    cur_aqi     = float(last_row["aqi_value"])
    last_date   = pd.Timestamp(last_row["date"]).normalize()
    target_norm = pd.Timestamp(target_date).normalize()
    days_ahead  = (target_norm - last_date).days

    # Save latest AQI values
    hist = city_df["aqi_value"].tail(7).tolist()


    #predict future aqi
    if days_ahead > 0:
        for i in range(1, days_ahead + 1):
            d = last_date + pd.Timedelta(days=i)
            X = build_features(dist_val, hist, d, poll_val)
            p = float(model.predict(X)[0])
            p = max(0.0, p)
            hist.append(p)

        prediction = hist[-1]

    else:
        row = city_df[city_df["date"] == target_norm]
        if not row.empty:
            prediction = float(row.iloc[0]["aqi_value"])
        else:
            prediction = cur_aqi

    # Generate Next 7 days  forecast
    forecast = []

    forecast.append({
        "label": "Today",
        "aqi": round(cur_aqi),
        "isLive": True
    })

    if days_ahead > 0:
        forecast.append({
            "label": target_norm.strftime("%d %b"),
            "aqi": round(prediction),
            "isLive": False
        })
        n_days = 6
    else:
        n_days = 7

    for i in range(1, n_days + 1):
        fd = target_norm + pd.Timedelta(days=i)
        X = build_features(dist_val, hist, fd, poll_val)
        p = float(model.predict(X)[0])
        p = max(0.0, p)

        forecast.append({
            "label": fd.strftime("%d %b"),
            "aqi": round(p),
            "isLive": False
        })
        hist.append(p)

    pred_rounded = round(prediction)

    #Return prediction result
    return {
        "city": area,
        "state": req.state,
        "date": req.date,
        "latestAqi": round(cur_aqi),
        "liveAqi": round(cur_aqi),
        "aqi": pred_rounded,
        "aqiChange": round(pred_rounded - cur_aqi),
        "cigarettes": max(1, round(pred_rounded / 22)),
        "lungStress": min(100, round((pred_rounded / 500) * 100)),
        "riskScore": round((pred_rounded / 500) * 10, 1),
        "forecast": forecast
    }