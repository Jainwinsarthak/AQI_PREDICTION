import json
import pandas as pd
import joblib
from datetime import datetime
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, r2_score, root_mean_squared_error

from config import FEATURES_CSV, MODEL_PKL, TRAINING_META_JSON, FEATURE_COLS, TARGET_COL


def train():
    df = pd.read_csv(FEATURES_CSV)
    df["date"] = pd.to_datetime(df["date"])

    print(f"Dataset: {df.shape} | Dates: {df['date'].min().date()} -> {df['date'].max().date()}")

    X = df[FEATURE_COLS]
    y = df[TARGET_COL]

    # Temporal split — last 6 months as test (correct approach for time-series)
    cutoff = df["date"].max() - pd.DateOffset(months=6)
    train_mask = df["date"] <= cutoff

    X_train, y_train = X[train_mask],  y[train_mask]
    X_test,  y_test  = X[~train_mask], y[~train_mask]

    print(f"Cutoff: {cutoff.date()} | Train: {len(X_train)} | Test: {len(X_test)}")

    model = XGBRegressor(
        n_estimators=1000,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        early_stopping_rounds=50,
        random_state=42,
    )

    model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=50)

    y_pred = model.predict(X_test)
    mae  = mean_absolute_error(y_test, y_pred)
    rmse = root_mean_squared_error(y_test, y_pred)
    r2   = r2_score(y_test, y_pred)

    print(f"\n{'='*40}")
    print(f"MODEL EVALUATION (Temporal Split)")
    print(f"{'='*40}")
    print(f"Best Iteration : {model.best_iteration}")
    print(f"MAE  : {mae:.2f}")
    print(f"RMSE : {rmse:.2f}")
    print(f"R²   : {r2:.4f}")

    # Feature importance — top 10
    importance = sorted(
        zip(FEATURE_COLS, model.feature_importances_),
        key=lambda x: x[1], reverse=True
    )
    print("\nTop 10 Feature Importances:")
    for feat, score in importance[:10]:
        print(f"  {feat:25s} {score:.4f}")

    joblib.dump(model, MODEL_PKL)
    print(f"\nModel saved: {MODEL_PKL}")

    metadata = {
        "trained_at": datetime.now().isoformat(),
        "dataset_shape": list(df.shape),
        "train_rows": int(len(X_train)),
        "test_rows": int(len(X_test)),
        "cutoff_date": str(cutoff.date()),
        "features": FEATURE_COLS,
        "metrics": {"mae": round(mae, 2), "rmse": round(rmse, 2), "r2": round(r2, 4)},
        "hyperparameters": {
            "n_estimators": 1000,
            "max_depth": 6,
            "learning_rate": 0.05,
            "subsample": 0.8,
            "colsample_bytree": 0.8,
        },
    }
    with open(TRAINING_META_JSON, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"Metadata saved: {TRAINING_META_JSON}")

    return model, metadata


if __name__ == "__main__":
    train()
