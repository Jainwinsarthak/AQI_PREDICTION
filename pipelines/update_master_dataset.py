import pandas as pd
import os

# ====================================
# LOAD MASTER DATASET
# ====================================

project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
updated_path = os.path.join(project_root, "data", "aqi_master_updated.csv")
base_path = os.path.join(project_root, "data", "aqi_final_merged_291cities.csv")
master = pd.read_csv(updated_path if os.path.exists(updated_path) else base_path)

# ====================================
# LOAD TODAY'S CLEANED DATA
# ====================================

daily = pd.read_csv(
    "aqi_extracted_cleaned.csv"
)

print("Master Shape:", master.shape)
print("Daily Shape :", daily.shape)

# ====================================
# KEEP SAME COLUMNS
# ====================================

required_columns = [
    "date",
    "state",
    "area",
    "prominent_pollutants",
    "aqi_value",
    "air_quality_status"
]

master = master[required_columns]
daily = daily[required_columns]

# ====================================
# DATE FORMAT
# ====================================

master["date"] = pd.to_datetime(
    master["date"]
)

daily["date"] = pd.to_datetime(
    daily["date"]
)

# ====================================
# MERGE
# ====================================

merged = pd.concat(
    [master, daily],
    ignore_index=True
)

# ====================================
# REMOVE DUPLICATES
# ====================================

before = len(merged)

merged.drop_duplicates(
    subset=["date", "area"],
    keep="last",
    inplace=True
)

after = len(merged)

print(
    "Duplicates Removed:",
    before - after
)

# ====================================
# SORT
# ====================================

merged = merged.sort_values(
    ["area", "date"]
)

merged.reset_index(
    drop=True,
    inplace=True
)

# ====================================
# SAVE UPDATED MASTER
# ====================================

save_path = os.path.join(project_root, "data", "aqi_master_updated.csv")

merged.to_csv(
    save_path,
    index=False
)

# ====================================
# REPORT
# ====================================

print("\n" + "=" * 50)
print("UPDATED MASTER DATASET")
print("=" * 50)

print("Shape:", merged.shape)

print("\nDate Range:")
print(merged["date"].min())
print(merged["date"].max())

print("\nCities:")
print(merged["area"].nunique())

print("\nStates:")
print(merged["state"].nunique())

print("\nMissing Values:")
print(merged.isnull().sum())

print("\nSaved To:")
print(save_path)