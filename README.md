<div align="center">

# 🌬️ AirSight India

**Real-time AQI forecasting for 300+ Indian cities.**

Predict Air Quality Index up to 30 days ahead — with a 7-day visual forecast, health insights, and daily automated data updates.

[![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://reactjs.org)
[![XGBoost](https://img.shields.io/badge/XGBoost-ML_Model-orange)](https://xgboost.ai)

[Live Demo](https://predictaqi.vercel.app/) · [Report Bug](https://github.com/Jainwinsarthak/AQI_PREDICTION/issues) · [GitHub Repo](https://github.com/Jainwinsarthak/AQI_PREDICTION)

</div>

---

## ✨ Features

- 📍 **308 Cities & 15+ States** — All major CPCB-monitored areas across India
- 📅 **Date-Based Forecasting** — Select any future date within 30 days
- 📈 **7-Day Forecast Graph** — Visual AQI trend chart from your chosen date
- 💊 **Health Insights** — Cigarette equivalent, lung stress %, and risk score
- 🏷️ **AQI Category Labels** — Good / Satisfactory / Moderate / Poor / Very Poor / Severe
- 🔄 **Daily Data Refresh** — Dataset updated automatically every evening via GitHub Actions

---

## 📂 Project Structure

```
AQI_PREDICTION/
├── .github/workflows/
│   └── daily-aqi-pipeline.yml   # Daily automated workflow (runs at 6 PM IST)
├── backend/
│   └── api_server.py            # FastAPI prediction server
├── data/
│   ├── aqi_base.csv             # Base historical dataset
│   ├── aqi_master.csv           # Continuously updated master dataset
│   └── features.csv             # Feature matrix with lag variables
├── frontend/                    # React + Vite + Tailwind CSS dashboard
├── models/
│   ├── aqi_production_model.pkl # Trained XGBoost Regressor model
│   ├── district_encoder.pkl     # Categorical encoder for districts/cities
│   ├── pollutant_encoder.pkl    # Categorical encoder for pollutants
│   └── training_metadata.json   # Model evaluation metrics & metadata
├── pipelines/
│   ├── 01_download.py           # Download CPCB daily bulletin PDF
│   ├── 02_extract.py            # Parse PDF tables into raw CSV
│   ├── 03_preprocess.py         # Normalize state names & clean pollutants
│   ├── 04_merge.py              # Update master dataset with daily batch
│   ├── 05_features.py           # Compute lag & rolling feature vectors
│   ├── 06_train.py              # Retrain XGBoost model & evaluate
│   ├── 07_run_pipeline.py       # Pipeline orchestrator
│   └── config.py                # Centralized paths and configuration
├── requirements.txt             # Backend & pipeline Python dependencies
└── README.md
```

---

## 🚀 How It Works

1. Select a city and a future date from the dashboard.
2. The system finds the last recorded AQI for that city.
3. It predicts day-by-day from the last known date up to your chosen date using lag feature vectors.
4. A 7-day forecast chart is generated from that point onwards.
5. Health impact scores are displayed alongside the forecast.

> Predictions are computed in real-time and are never stored back into the training data.

---

## 💻 Local Setup & Execution Guide

### 1. Backend API Server
```bash
# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn backend.api_server:app --reload --port 8000
```

### 2. Frontend Development Server
```bash
cd frontend
npm install
npm run dev
```

### 3. Running Data Pipeline & Training
```bash
# Run complete data update & retraining pipeline
python pipelines/07_run_pipeline.py
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Machine Learning | XGBoost · scikit-learn · Pandas · NumPy |
| Backend API | FastAPI · Uvicorn · Pydantic · Python 3.11 |
| Frontend | React 18 · Vite · Tailwind CSS · Recharts · Framer Motion |
| Data Pipeline | Python · pdfplumber · requests · joblib |
| Automation | GitHub Actions (daily cron at 6 PM IST) |
| Deployment | Vercel (frontend) · Render (backend) |

---

## 🏗️ Architecture

<img width="1024" height="1024" alt="architecture" src="https://github.com/user-attachments/assets/91bba22e-fcad-40cd-89e8-dee9b392dda8" />

---

## 📸 Screenshots

<p align="center">
  <img width="100%" alt="AirSight Dashboard" src="https://github.com/user-attachments/assets/d467dbfc-911c-435f-82e5-4048f6f471f5" />
</p>

---

## 📊 Model Performance

Best validation results achieved during model development (using an 80/20 train-test split across 300+ Indian cities):

| Metric | Score |
|---|---|
| **Model** | **XGBoost Regressor** |
| **Evaluation Method** | **80/20 Train-Test Split (Best Validation)** |
| **R² Score** | **0.8387** |
| **Mean Absolute Error (MAE)** | **13.64 AQI** |

---

## 🌐 Deployment

| Component | Platform |
|---|---|
| Frontend | [Vercel](https://vercel.com) — auto-deploys on push |
| Backend API | [Render](https://render.com) — FastAPI via Uvicorn |
| Data Pipeline | GitHub Actions — runs daily at 6 PM IST |

---

## ⚠️ Known Limitations

- AQI bulletin data is updated once daily by CPCB, not real-time per minute.
- Multi-step autoregressive forecast variance increases beyond 7 days ahead.

---

## 👤 Author

**Sarthak Jain**

[![GitHub](https://img.shields.io/badge/GitHub-Jainwinsarthak-181717?logo=github)](https://github.com/Jainwinsarthak)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?logo=linkedin)](https://www.linkedin.com/in/jainwin-sarthak/)

---

<div align="center">

*AQI data sourced from [CPCB India](https://cpcb.nic.in/) (public domain).*

</div>
