import pandas as pd
import numpy as np
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, r2_score, root_mean_squared_error
import joblib
import json
import os
from datetime import datetime

# ====================================
# LOAD DATA
# ====================================

project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
df = pd.read_csv(os.path.join(project_root, "data", "aqi_features.csv"))
df["date"] = pd.to_datetime(df["date"])

print("Dataset Shape:", df.shape)
print("Date Range:", df["date"].min().date(), "to", df["date"].max().date())

# ====================================
# SELECT FEATURES
# ====================================

feature_columns = [
    "district_encoded",
    "lag_1", "lag_3", "lag_7",
    "rolling_mean_7",
    "day", "month", "year",
    "month_sin", "month_cos",
    "pollutant_encoded",
    "is_winter", "is_summer", "is_monsoon",
    "crop_burning"
]

X = df[feature_columns]
y = df["aqi_value"]

# ====================================
# TEMPORAL TRAIN/TEST SPLIT
# ====================================
# Instead of random split, we use the last 6 months as test data.
# This is the correct approach for time-series — the model should
# only learn from the past and be evaluated on the future.

cutoff_date = df["date"].max() - pd.DateOffset(months=6)
train_mask = df["date"] <= cutoff_date

X_train = X[train_mask]
y_train = y[train_mask]
X_test = X[~train_mask]
y_test = y[~train_mask]

print(f"\nTemporal Split Cutoff: {cutoff_date.date()}")
print(f"Train: {X_train.shape[0]} rows  |  Test: {X_test.shape[0]} rows")

# ====================================
# TRAIN MODEL
# ====================================

model = XGBRegressor(
    n_estimators=1000,
    max_depth=6,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    early_stopping_rounds=50,
    random_state=42
)

model.fit(
    X_train, y_train,
    eval_set=[(X_test, y_test)],
    verbose=50
)

best_iteration = model.best_iteration

# ====================================
# EVALUATE
# ====================================

y_pred = model.predict(X_test)

mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)
rmse = root_mean_squared_error(y_test, y_pred)

print(f"\n{'='*40}")
print(f"MODEL EVALUATION (Temporal Split)")
print(f"{'='*40}")
print(f"Best Iteration: {best_iteration}")
print(f"MAE  : {mae:.2f}")
print(f"RMSE : {rmse:.2f}")
print(f"R²   : {r2:.4f}")

# ====================================
# FEATURE IMPORTANCE
# ====================================

importance = dict(zip(feature_columns, model.feature_importances_))
sorted_importance = sorted(importance.items(), key=lambda x: x[1], reverse=True)

print(f"\nTop 10 Feature Importances:")
for feature, score in sorted_importance[:10]:
    print(f"  {feature:25s} {score:.4f}")

# ====================================
# SAVE MODEL
# ====================================

model_path = os.path.join(project_root, "models", "aqi_production_model.pkl")
joblib.dump(model, model_path)
print(f"\nModel saved to: {model_path}")

# ====================================
# SAVE TRAINING METADATA
# ====================================

metadata = {
    "trained_at": datetime.now().isoformat(),
    "dataset_shape": list(df.shape),
    "train_rows": int(X_train.shape[0]),
    "test_rows": int(X_test.shape[0]),
    "cutoff_date": str(cutoff_date.date()),
    "features": feature_columns,
    "metrics": {
        "mae": round(mae, 2),
        "rmse": round(rmse, 2),
        "r2": round(r2, 4)
    },
    "hyperparameters": {
        "n_estimators": 1000,
        "max_depth": 6,
        "learning_rate": 0.05,
        "subsample": 0.8,
        "colsample_bytree": 0.8
    }
}

metadata_path = os.path.join(project_root, "models", "training_metadata.json")
with open(metadata_path, "w") as f:
    json.dump(metadata, f, indent=2)

print(f"Metadata saved to: {metadata_path}")
