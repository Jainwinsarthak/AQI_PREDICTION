import pandas as pd

# ==========================
# LOAD FILES
# ==========================

new = pd.read_csv(
    "aqi_extracted_2025_2026.csv"
)

import os
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
old = pd.read_csv(os.path.join(project_root, "data", "aqi_final_merged_291cities.csv"))

# ==========================
# CLEAN CITY NAMES
# ==========================

new["area"] = (
    new["area"]
    .astype(str)
    .str.replace("\n", " ", regex=False)
    .str.replace(r"\s+", " ", regex=True)
    .str.strip()
)

old["area"] = (
    old["area"]
    .astype(str)
    .str.replace("\n", " ", regex=False)
    .str.replace(r"\s+", " ", regex=True)
    .str.strip()
)


# ==========================
# CREATE CITY-STATE MAP
# ==========================

city_state = (
    old[
        ["area", "state"]
    ]
    .drop_duplicates()
)

# ==========================
# MERGE STATE
# ==========================

new = new.merge(
    city_state,
    on="area",
    how="left"
)

print(
    "Missing States Before Manual Fix:",
    new["state"].isna().sum()
)

# ==========================
# MANUAL STATE MAP
# ==========================

manual_state_map = {
    "Ambernath": "Maharashtra",
    "Aurangabad (Bihar)": "Bihar",
    "Aurangabad (Maharashtra)": "Maharashtra",
    "Beed": "Maharashtra",
    "Bhavnagar": "Gujarat",
    "Byrnihat (Assam)": "Assam",
    "Byrnihat (Meghalaya)": "Meghalaya",
    "Dombivli": "Maharashtra",
    "Eluru": "Andhra Pradesh",
    "Fatehpur Sikri": "Uttar Pradesh",
    "Gandhinagar": "Gujarat",
    "Guntur": "Andhra Pradesh",
    "Hingoli": "Maharashtra",
    "Khairthal": "Rajasthan",
    "Khora": "Uttar Pradesh",
    "Machilipatnam": "Andhra Pradesh",
    "Mathura": "Uttar Pradesh",
    "Mehsana": "Gujarat",
    "Mira-Bhayandar": "Maharashtra",
    "Modinagar": "Uttar Pradesh",
    "Nellore": "Andhra Pradesh",
    "Noida": "Uttar Pradesh",
    "Pampore": "Jammu and Kashmir",
    "Perundurai": "Tamil Nadu",
    "Pimpri-Chinchwad": "Maharashtra",
    "Raebareli": "Uttar Pradesh",
    "Rajkot": "Gujarat",
    "Satara": "Maharashtra",
    "Tirupur": "Tamil Nadu",
    "Vadodara": "Gujarat",
    "Yamuna Nagar": "Haryana"
}

mask = new["state"].isna()

new.loc[mask, "state"] = (
    new.loc[mask, "area"]
    .map(manual_state_map)
)

print(
    "Missing States After Manual Fix:",
    new["state"].isna().sum()
)

# ==========================
# REMOVE STATION COLUMN
# ==========================

if "number_of_stations" in new.columns:
    new.drop(
        columns=["number_of_stations"],
        inplace=True
    )

# ==========================
# REORDER COLUMNS
# ==========================

new = new[
    [
        "date",
        "state",
        "area",
        "prominent_pollutants",
        "aqi_value",
        "air_quality_status"
    ]
]

# ==========================
# SAVE FINAL FILE
# ==========================

new.to_csv(
    "aqi_extracted_with_state.csv",
    index=False
)

print("\nSaved Successfully")

print("\nShape:")
print(new.shape)

print("\nRemaining Missing States:")
print(
    new["state"].isna().sum()
)

print("\nCities Still Missing:")
print(
    new[
        new["state"].isna()
    ]["area"].unique()
)

print("\nOutput File:")
print("aqi_extracted_with_state.csv")