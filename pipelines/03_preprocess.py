import re
import pandas as pd

from config import (
    RAW_EXTRACTED_CSV, BASE_MASTER_CSV,
    WITH_STATE_CSV, CLEANED_CSV,
    MANUAL_STATE_MAP, REQUIRED_COLS,
)


def normalize_city_names(df):
    """Strip newlines, collapse whitespace, and title-case the 'area' column."""
    df["area"] = (
        df["area"]
        .astype(str)
        .str.replace("\n", " ", regex=False)
        .str.replace(r"\s+", " ", regex=True)
        .str.strip()
        .str.title()
    )
    return df


def add_state_column(new_df, base_df):
    """Merge state info from the base master dataset, fill gaps with manual map."""
    city_state = base_df[["area", "state"]].drop_duplicates()
    new_df = new_df.merge(city_state, on="area", how="left")

    print(f"Missing states before manual fix: {new_df['state'].isna().sum()}")

    # Fill remaining NaNs using the manual state map
    mask = new_df["state"].isna()
    new_df.loc[mask, "state"] = new_df.loc[mask, "area"].map(MANUAL_STATE_MAP)

    print(f"Missing states after manual fix:  {new_df['state'].isna().sum()}")
    missing = new_df[new_df["state"].isna()]["area"].unique()
    if len(missing):
        print(f"Cities still missing state: {missing}")

    return new_df


def clean_pollutant_text(text):
    """Parse a raw pollutant string and return a clean, space-separated list of known pollutants."""
    text = str(text).upper()
    found = []

    if re.search(r"PM\s*2\.?5", text):
        found.append("PM2.5")
    if re.search(r"PM\s*10", text) or re.search(r"PM.*10", text) or re.search(r"3\s*10", text):
        found.append("PM10")
    if re.search(r"O\s*3", text):
        found.append("O3")
    if re.search(r"NO\s*2", text):
        found.append("NO2")
    if re.search(r"SO\s*2", text):
        found.append("SO2")
    if re.search(r"\bCO\b", text):
        found.append("CO")

    # deduplicate while preserving order
    found = list(dict.fromkeys(found))
    return " ".join(found) if found else "UNKNOWN"


def run_state_mapping():
    new_df  = pd.read_csv(RAW_EXTRACTED_CSV)
    base_df = pd.read_csv(BASE_MASTER_CSV)

    new_df  = normalize_city_names(new_df)
    base_df = normalize_city_names(base_df)

    new_df = add_state_column(new_df, base_df)

    if "number_of_stations" in new_df.columns:
        new_df.drop(columns=["number_of_stations"], inplace=True)

    new_df = new_df[REQUIRED_COLS]

    new_df.to_csv(WITH_STATE_CSV, index=False)
    print(f"Saved with-state CSV: {WITH_STATE_CSV} | Shape: {new_df.shape}")
    return new_df


def run_pollutant_cleaning():
    df = pd.read_csv(WITH_STATE_CSV)

    df["prominent_pollutants"] = df["prominent_pollutants"].astype(str).apply(clean_pollutant_text)
    df["main_pollutant"]       = df["prominent_pollutants"].str.split().str[0]

    df.to_csv(CLEANED_CSV, index=False)
    print(f"Saved cleaned CSV: {CLEANED_CSV}")
    print("\nPollutant distribution:")
    print(df["main_pollutant"].value_counts())
    print(df[["prominent_pollutants", "main_pollutant"]].head(20))
    return df


if __name__ == "__main__":
    run_state_mapping()
    run_pollutant_cleaning()
