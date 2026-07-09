#  AirSight India

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
- 🏷️ **AQI Category Labels** — Good / Satisfactory / Moderate / Poor / Severe
- 🔄 **Daily Data Refresh** — Dataset updated automatically every evening via GitHub Actions

---

## 🚀 How It Works

1. Select a city and a future date from the dashboard.
2. The system finds the last recorded AQI for that city.
3. It predicts day-by-day from the last known date up to your chosen date.
4. A 7-day forecast chart is generated from that point onwards.
5. Health impact scores are displayed alongside the forecast.

> Predictions are computed in real-time and are never stored back into the training data.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Machine Learning | XGBoost · scikit-learn |
| Backend API | FastAPI · Python 3.11 |
| Frontend | React 18 · Vite · Recharts |
| Data Pipeline | Python · pdfplumber · Pandas |
| Automation | GitHub Actions (daily cron) |
| Deployment | Vercel (frontend) · Render (backend) |

---

## 🏗️ Architecture

<img width="1024" height="1024" alt="architecture" src="https://github.com/user-attachments/assets/91bba22e-fcad-40cd-89e8-dee9b392dda8" />


---

## 📸 Screenshots



width="1124" height="833" alt="image" src="https://github.com/user-attachments/assets/d467dbfc-911c-435f-82e5-4048f6f471f5" />
" />

---

## 📊 Model Performance

Trained on 3+ years of daily AQI records across 308 Indian cities.

| Metric | Score |
|---|---|
| R² Score | **0.83** |
| Mean Absolute Error | **14 AQI** |

---

## 🌐 Deployment

| Component | Platform |
|---|---|
| Frontend | [Vercel](https://vercel.com) — auto-deploys on push |
| Backend API | [Render](https://render.com) — FastAPI via Uvicorn |
| Data Pipeline | GitHub Actions — runs daily at 6 PM IST |

---

## ⚠️ Known Limitations

- AQI data is updated once daily, not in real-time.
- Forecast accuracy decreases beyond 5–7 days ahead.
- Model is retrained manually; CI only updates the dataset.

---

## 🔭 Future Improvements

- [ ] Real-time AQI integration
- [ ] Automated model retraining
- [ ] Forecast confidence intervals
- [ ] Enhanced city coverage
- [ ] Mobile application support

---

## 👤 Author

**Sarthak Jain**

[![GitHub](https://img.shields.io/badge/GitHub-Jainwinsarthak-181717?logo=github)](https://github.com/Jainwinsarthak)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?logo=linkedin)](https://www.linkedin.com/in/jainwin-sarthak/)

---

<div align="center">

*AQI data sourced from [CPCB India](https://cpcb.nic.in/) (public domain).*

</div>
