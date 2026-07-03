# AirSight India — AQI Prediction Platform

An end-to-end machine learning platform that predicts Air Quality Index (AQI) for Indian cities up to 7 days in the future, built using XGBoost and trained on CPCB bulletin data from 2022–2026.

---

## Project Overview

India has one of the world's most serious air pollution problems, yet most AQI tools only show current conditions. This project was built to answer: **"How bad will the air be in my city next week?"**

The system downloads daily AQI bulletins published by the Central Pollution Control Board (CPCB), extracts structured data from PDF tables, trains an XGBoost regression model on the historical records, and serves predictions via a FastAPI backend to a React frontend.

---

## Features

- **AQI Prediction** — Predict AQI for any of 293 Indian cities for any date up to 30 days ahead
- **7-Day Autoregressive Forecast** — Rolls predictions forward using lag features for a full week of daily estimates
- **Health Impact Analysis** — Converts AQI into cigarette equivalents, lung stress index, and a risk score
- **Daily Data Pipeline** — GitHub Actions downloads the CPCB bulletin every evening and updates the dataset automatically
- **293 Cities, 15+ States** — Covers all major CPCB-monitored urban areas across India

---

## Dataset

| Property | Value |
|---|---|
| **Source** | CPCB Daily AQI Bulletins (PDF → structured CSV) |
| **Date Range** | April 2022 – Present (updated daily) |
| **Total Records** | ~4,14,964 rows |
| **Cities** | 293 unique monitoring areas |
| **States** | 28 states + UTs |
| **Features** | date, state, area, AQI value, prominent pollutant, air quality status |

Raw data is stored in `data/aqi_master_updated.csv`. The processed feature set (lag features, seasonality) is stored in `data/aqi_features.csv`.

---

## Model

| Property | Value |
|---|---|
| **Algorithm** | XGBoost Regressor |
| **R² Score** | 0.8387 |
| **MAE** | 13.642 AQI units |
| **Target** | `aqi_value` (next-day AQI) |

### Features Used

| Feature | Description |
|---|---|
| `lag_1` | AQI from 1 day ago (per city) |
| `lag_3` | AQI from 3 days ago |
| `lag_7` | AQI from 7 days ago |
| `rolling_mean_7` | 7-day rolling average of AQI (leak-safe) |
| `month_sin / month_cos` | Cyclical seasonal encoding |
| `is_winter / is_summer / is_monsoon` | Season binary flags |
| `crop_burning` | October–November stubble burning flag |
| `district_encoded` | Label-encoded city name |
| `pollutant_encoded` | Dominant pollutant (PM2.5, PM10, O3, etc.) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **ML / Data** | Python, XGBoost, scikit-learn, pandas, numpy |
| **PDF Extraction** | pdfplumber |
| **Backend API** | FastAPI, uvicorn, joblib |
| **Frontend** | React 18, Vite, Tailwind CSS v4 |
| **Charts** | Recharts |
| **Animations** | Framer Motion |
| **CI / Data Pipeline** | GitHub Actions (runs daily at 6 PM IST) |
| **Backend Hosting** | Render |
| **Frontend Hosting** | Vercel |

---

## Architecture

```
                    CPCB Website (PDF Bulletin)
                            │
                    aqi_dowloader.py
                            │
                    bulletins/CPCB_AQI_Bulletin_YYYY-MM-DD.pdf
                            │
                    pdf_extractor.py (pdfplumber)
                            │
                    aqi_extracted_2025_2026.csv
                            │
                    state_mapping.py
                            │
                    pollutant_cleaning.py
                            │
                    update_master_dataset.py
                            │
                    data/aqi_master_updated.csv
                            │
                    feature_engineering.py
                            │
                    data/aqi_features.csv ──────────────────────┐
                                                                 │
                                                         backend/api_server.py
                                                         (FastAPI + XGBoost)
                                                                 │
                                                         /predict (POST)
                                                                 │
                                                     React Frontend (Vite)
                                                     ┌───────────────────┐
                                                     │ PredictionEngine  │
                                                     │ PredictionResult  │
                                                     │ ForecastChart     │
                                                     │ HealthImpact      │
                                                     └───────────────────┘
```

**GitHub Actions runs the full pipeline daily and commits updated CSVs back to the repository. The Render backend auto-deploys on new commits.**

---

## Running Locally

### Prerequisites
- Python 3.11+
- Node.js 18+

### Backend

```bash
# From project root
pip install -r requirements.txt

# Start the FastAPI server
uvicorn backend.api_server:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.  
Swagger docs: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will start at `http://localhost:5173`.

**Note:** Set `VITE_API_URL=http://localhost:8000` in `frontend/.env` if the backend runs on a different port.

---

## Environment Variables

### Backend (Render)

| Variable | Description | Default |
|---|---|---|
| `ALLOWED_ORIGINS` | Comma-separated list of allowed frontend URLs | `*` (dev only) |

### Frontend (Vercel)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Full URL of the FastAPI backend | `https://airsight-api.onrender.com` |

## Data Pipeline

The GitHub Actions workflow (`.github/workflows/daily-aqi-pipeline.yml`) runs automatically every day at **~6 PM IST**.

Steps:
1. Download today's AQI bulletin PDF from `cpcb.gov.in`
2. Extract city-level AQI table rows using `pdfplumber`
3. Map city names to states
4. Standardise pollutant names
5. Append to master dataset (removing duplicates)
6. Re-generate feature-engineered CSV
7. Commit and push updated data files

---

## Project Structure

```
AQI_PREDICTION/
├── .github/
│   └── workflows/
│       └── daily-aqi-pipeline.yml
├── backend/
│   └── api_server.py
├── data/
│   ├── aqi_master_updated.csv     # raw master dataset
│   ├── aqi_features.csv           # feature-engineered dataset
│   └── aqi_final_merged_291cities.csv
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── components/
│       └── data/
├── models/
│   ├── aqi_production_model.pkl   # trained XGBoost model
│   ├── district_encoder.pkl       # saved LabelEncoder
│   └── pollutant_encoder.pkl      # saved LabelEncoder
├── pipelines/
│   ├── aqi_dowloader.py
│   ├── pdf_extractor.py
│   ├── state_mapping.py
│   ├── pollutant_cleaning.py
│   ├── update_master_dataset.py
│   ├── feature_engineering.py
│   └── run_pipeline.py
└── requirements.txt
```

---

## Known Limitations

- **Latest Recorded AQI is not real-time.** It shows the most recent value from the dataset (updated once daily). It is not a live API call.
- **No model retraining in CI.** The XGBoost model is trained manually. Daily pipeline only updates the data, not the model weights.
- **Autoregressive forecast degrades over 7+ days.** Error compounds with each step forward. Treat Day 5–7 estimates as approximate.
- **CPCB PDF format dependency.** If CPCB changes their table layout, the PDF extractor may need an update.
- **490 rows with missing state.** Some new cities added by CPCB are not yet in the state mapping table.

---

## Future Improvements

- [ ] Add model retraining to the CI pipeline when sufficient new data is collected
- [ ] Integrate WAQI API for real-time current AQI values
- [ ] Improve state mapping coverage for newer cities
- [ ] Add confidence intervals to forecasts
- [ ] Move large binary files (model + CSVs) to cloud storage (S3 / Hugging Face)
- [ ] Add unit tests for pipeline scripts and API endpoints
- [ ] Add city-level model specialisation (separate model per region)

---

## Screenshots

<img width="1916" height="869" alt="image" src="https://github.com/user-attachments/assets/d638fe1d-da6e-486e-937c-c955f182b78c" />





## License

This project is for educational purposes. AQI data is sourced from [CPCB India](https://cpcb.nic.in/) (public domain).
