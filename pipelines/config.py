import os

# Resolve project root (one level above pipelines/)
PIPELINES_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT  = os.path.dirname(PIPELINES_DIR)

# --- Directory paths ---
DATA_DIR    = os.path.join(PROJECT_ROOT, "data")
MODELS_DIR  = os.path.join(PROJECT_ROOT, "models")
BULLETS_DIR = os.path.join(PIPELINES_DIR, "bulletins")

# --- Data files ---
RAW_EXTRACTED_CSV  = os.path.join(PIPELINES_DIR, "aqi_raw.csv")
WITH_STATE_CSV     = os.path.join(PIPELINES_DIR, "aqi_with_state.csv")
CLEANED_CSV        = os.path.join(PIPELINES_DIR, "aqi_cleaned.csv")
BASE_MASTER_CSV    = os.path.join(DATA_DIR, "aqi_base.csv")
UPDATED_MASTER_CSV = os.path.join(DATA_DIR, "aqi_master.csv")
FEATURES_CSV       = os.path.join(DATA_DIR, "features.csv")

# --- Model files ---
MODEL_PKL           = os.path.join(MODELS_DIR, "aqi_production_model.pkl")
DISTRICT_ENC_PKL    = os.path.join(MODELS_DIR, "district_encoder.pkl")
POLLUTANT_ENC_PKL   = os.path.join(MODELS_DIR, "pollutant_encoder.pkl")
TRAINING_META_JSON  = os.path.join(MODELS_DIR, "training_metadata.json")

# --- CPCB bulletin URL pattern ---
BULLETIN_URL = "https://cpcb.gov.in/upload/Downloads/AQI_Bulletin_{date_suffix}.pdf"

# --- Feature columns used for training ---
FEATURE_COLS = [
    "district_encoded",
    "lag_1", "lag_3", "lag_7",
    "rolling_mean_7",
    "day", "month", "year",
    "month_sin", "month_cos",
    "pollutant_encoded",
    "is_winter", "is_summer", "is_monsoon",
    "crop_burning"
]

TARGET_COL = "aqi_value"

REQUIRED_COLS = [
    "date", "state", "area",
    "prominent_pollutants", "aqi_value", "air_quality_status"
]

# Manual state assignments for cities not in the master dataset
MANUAL_STATE_MAP = {
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
    "Yamuna Nagar": "Haryana",
}

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}
