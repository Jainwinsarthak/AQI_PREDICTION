import os
import numpy as np
import pandas as pd
import joblib
from sklearn.preprocessing import LabelEncoder

from config import (
    UPDATED_MASTER_CSV, FEATURES_CSV,
    DISTRICT_ENC_PKL, POLLUTANT_ENC_PKL,
    MODELS_DIR, FEATURE_COLS, TARGET_COL,
)


def safe_label_encode(encoder, series, fallback="UNKNOWN"):
    """Transform a series using an existing encoder, mapping unseen values to fallback."""
    if fallback not in encoder.classes_:
        encoder.classes_ = np.append(encoder.classes_, fallback)
    clean = series.map(lambda x: x if x in encoder.classes_ else fallback)
    return encoder.transform(clean)


def load_or_fit_encoder(pkl_path, series):
    """Load encoder from disk if it exists; otherwise fit a new one and save it."""
    if os.path.exists(pkl_path):
        enc = joblib.load(pkl_path)
        print(f"Loaded encoder: {os.path.basename(pkl_path)}")
        return enc, safe_label_encode(enc, series)
    else:
        enc = LabelEncoder()
        encoded = enc.fit_transform(series)
        joblib.dump(enc, pkl_path)
        print(f"Fitted and saved encoder: {os.path.basename(pkl_path)}")
        return enc, encoded


def build_features():
    """Load the updated master CSV, compute all ML features, encode categoricals, and save aqi_features.csv."""
    os.makedirs(MODELS_DIR, exist_ok=True)

    df = pd.read_csv(UPDATED_MASTER_CSV)
    print(f"Loaded master: {df.shape}")

    df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values(["area", "date"])

    # Date features
    df["day"]   = df["date"].dt.day
    df["month"] = df["date"].dt.month
    df["year"]  = df["date"].dt.year

    # Season flags
    df["is_winter"]   = df["month"].isin([11, 12, 1, 2]).astype(int)
    df["is_summer"]   = df["month"].isin([4, 5, 6]).astype(int)
    df["is_monsoon"]  = df["month"].isin([7, 8, 9]).astype(int)
    df["crop_burning"] = df["month"].isin([10, 11]).astype(int)

    # Cyclical month encoding
    df["month_sin"] = np.sin(2 * np.pi * df["month"] / 12)
    df["month_cos"] = np.cos(2 * np.pi * df["month"] / 12)

    # Lag features (per city)
    g = df.groupby("area")["aqi_value"]
    df["lag_1"] = g.shift(1)
    df["lag_3"] = g.shift(3)
    df["lag_7"] = g.shift(7)

    # 7-day rolling mean (uses values strictly before the current row)
    df["rolling_mean_7"] = g.transform(lambda x: x.shift(1).rolling(7).mean())

    # Label encoding — stable across runs
    _, df["district_encoded"]  = load_or_fit_encoder(DISTRICT_ENC_PKL,  df["area"])
    _, df["pollutant_encoded"] = load_or_fit_encoder(POLLUTANT_ENC_PKL, df["prominent_pollutants"])

    print(f"\nNull counts before drop:\n{df.isnull().sum()}")

    # Drop rows only where model columns are missing
    model_cols = FEATURE_COLS + [TARGET_COL]
    df.dropna(subset=model_cols, inplace=True)
    print(f"Shape after dropna: {df.shape}")

    df.to_csv(FEATURES_CSV, index=False)
    print(f"\nFeatures saved: {FEATURES_CSV}")
    print(f"Date range: {df['date'].min()} -> {df['date'].max()}")
    print(f"Cities: {df['area'].nunique()} | States: {df['state'].nunique()}")
    return df


if __name__ == "__main__":
    build_features()