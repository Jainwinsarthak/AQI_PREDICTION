import pandas as pd
import re

# Load file
df = pd.read_csv("aqi_extracted_with_state.csv")

# -------------------------
# CLEAN POLLUTANTS
# -------------------------

def clean_pollutants(text):

    text = str(text).upper()

    pollutants = []

    # PM2.5
    if re.search(r'PM\s*2\.?5', text):
        pollutants.append("PM2.5")

    # PM10
    if (
        re.search(r'PM\s*10', text)
        or re.search(r'PM.*10', text)
        or re.search(r'3\s*10', text)
    ):
        pollutants.append("PM10")

    # O3
    if re.search(r'O\s*3', text):
        pollutants.append("O3")

    # NO2
    if re.search(r'NO\s*2', text):
        pollutants.append("NO2")

    # SO2
    if re.search(r'SO\s*2', text):
        pollutants.append("SO2")

    # CO
    if re.search(r'\bCO\b', text):
        pollutants.append("CO")

    pollutants = list(dict.fromkeys(pollutants))

    if len(pollutants) == 0:
        return "UNKNOWN"

    return " ".join(pollutants)

# Apply cleaning
df["prominent_pollutants"] = (
    df["prominent_pollutants"]
    .astype(str)
    .apply(clean_pollutants)
)

# -------------------------
# CREATE MAIN POLLUTANT
# -------------------------

df["main_pollutant"] = (
    df["prominent_pollutants"]
    .str.split()
    .str[0]
)

# -------------------------
# SAVE
# -------------------------

df.to_csv(
    "aqi_extracted_cleaned.csv",
    index=False
)

print("Saved Successfully")

print("\nPollutant Distribution:")
print(
    df["main_pollutant"]
    .value_counts()
)

print("\nSample:")
print(
    df[
        [
            "prominent_pollutants",
            "main_pollutant"
        ]
    ].head(20)
)



