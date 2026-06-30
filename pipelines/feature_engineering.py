import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder

# ====================================
# LOAD DATA
# ====================================


import os
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
df = pd.read_csv(os.path.join(project_root, "data", "aqi_master_updated.csv"))

print("Original Shape:", df.shape)

# ====================================
# DATE CONVERSION
# ====================================

df["date"] = pd.to_datetime(df["date"])

# ====================================
# SORT DATA
# ====================================

df = df.sort_values(
    ["area", "date"]
)

# ====================================
# DATE FEATURES
# ====================================

df["day"] = df["date"].dt.day
df["month"] = df["date"].dt.month
df["year"] = df["date"].dt.year

# ====================================
# SEASON FEATURES
# ====================================

# Winter
df["is_winter"] = (
    df["month"].isin([11, 12, 1, 2])
).astype(int)

# Summer
df["is_summer"] = (
    df["month"].isin([4, 5, 6])
).astype(int)

# Monsoon
df["is_monsoon"] = (
    df["month"].isin([7, 8, 9])
).astype(int)

# Crop Burning
df["crop_burning"] = (
    df["month"].isin([10, 11])
).astype(int)

# ====================================
# CYCLICAL MONTH FEATURES
# ====================================

df["month_sin"] = np.sin(
    2 * np.pi * df["month"] / 12
)

df["month_cos"] = np.cos(
    2 * np.pi * df["month"] / 12
)

# ====================================
# LAG FEATURES
# ====================================

df["lag_1"] = (
    df.groupby("area")["aqi_value"]
    .shift(1)
)

df["lag_3"] = (
    df.groupby("area")["aqi_value"]
    .shift(3)
)

df["lag_7"] = (
    df.groupby("area")["aqi_value"]
    .shift(7)
)

# ====================================
# ROLLING MEAN
# ====================================

df["rolling_mean_7"] = (
    df.groupby("area")["aqi_value"]
    .transform(
        lambda x: x.shift(1)
        .rolling(7)
        .mean()
    )
)

# ====================================
# LABEL ENCODING
# ====================================

district_encoder = LabelEncoder()

df["district_encoded"] = (
    district_encoder.fit_transform(
        df["area"]
    )
)

pollutant_encoder = LabelEncoder()

df["pollutant_encoded"] = (
    pollutant_encoder.fit_transform(
        df["prominent_pollutants"]
    )
)

# ====================================
# REMOVE NULLS
# ====================================

print("\nNull Values Before Drop:")
print(df.isnull().sum())

df.dropna(inplace=True)

print("\nShape After Dropna:")
print(df.shape)

# ====================================
# SAVE FEATURES
# ====================================

save_path = os.path.join(project_root, "data", "aqi_features.csv")

df.to_csv(
    save_path,
    index=False
)

# ====================================
# SUMMARY
# ====================================

print("\nFEATURE ENGINEERING COMPLETED")

print("Final Shape:", df.shape)

print(
    "Date Range:",
    df["date"].min(),
    "to",
    df["date"].max()
)

print(
    "Cities:",
    df["area"].nunique()
)

print(
    "States:",
    df["state"].nunique()
)

print(
    "\nSaved To:"
)

print(save_path)