import os
import pandas as pd

from config import CLEANED_CSV, UPDATED_MASTER_CSV, BASE_MASTER_CSV, REQUIRED_COLS


def update_master():
    # Load the master (use updated version if it exists, else start from base)
    master_path = UPDATED_MASTER_CSV if os.path.exists(UPDATED_MASTER_CSV) else BASE_MASTER_CSV
    master = pd.read_csv(master_path)
    daily  = pd.read_csv(CLEANED_CSV)

    print(f"Master: {master.shape} | Daily: {daily.shape}")

    master = master[REQUIRED_COLS]
    daily  = daily[REQUIRED_COLS]

    master["date"] = pd.to_datetime(master["date"])
    daily["date"]  = pd.to_datetime(daily["date"])

    merged = pd.concat([master, daily], ignore_index=True)

    before = len(merged)
    merged.drop_duplicates(subset=["date", "area"], keep="last", inplace=True)
    print(f"Duplicates removed: {before - len(merged)}")

    merged = merged.sort_values(["area", "date"]).reset_index(drop=True)
    merged.to_csv(UPDATED_MASTER_CSV, index=False)

    print(f"\nUpdated master saved: {UPDATED_MASTER_CSV}")
    print(f"Shape: {merged.shape}")
    print(f"Date range: {merged['date'].min()} -> {merged['date'].max()}")
    print(f"Cities: {merged['area'].nunique()} | States: {merged['state'].nunique()}")
    print(f"Missing values:\n{merged.isnull().sum()}")
    return merged


if __name__ == "__main__":
    update_master()
