# AgriIntel (MarketMind AI)

> **Intelligent Agricultural Market Price Forecasting, Real-Time Weather Forecasting & Farmer Advisory System**

AgriIntel is a full-stack agricultural decision-support and market intelligence platform. It brings together multi-horizon commodity price forecasting powered by machine learning, live meteorological forecasting via Open-Meteo, and a 100% text-based bilingual (English & Telugu) agronomy advisory suite grounded in verified packages of practices from **ICAR, ANGRAU, and KVK**.

---

## Key Modules & Capabilities

### 1. 📈 Agricultural Market Price Forecasting
- **11.9M+ AGMARKNET Records:** Pre-indexed Parquet cache covering 31 Indian states, 581 districts, 6,254 mandis, and 357 commodities across multiple historical years.
- **14 Forecasting Models:**
  - *Baselines:* Naive, Drift, Seasonal Naive
  - *Statistical:* ARIMA, SARIMA, SARIMAX, Prophet, ETS / Holt-Winters
  - *Machine Learning:* Random Forest, XGBoost, LightGBM, SVR
  - *Deep Learning:* LSTM, GRU (PyTorch)
- **Multi-Step Recursive Forecasting:** Prevents constant or flatline future price projections through dynamic feature updates (lag 1, 3, 7, 14, 30, rolling statistics, calendar seasonality).
- **Interactive Visualizations:** Historical price trends, modal vs. min/max price distributions, mandi-level comparisons, and prediction intervals.

### 2. 🌦️ Independent Weather Forecasting (`/weather`)
- **Completely Decoupled:** Operates as an independent module with zero coupling to ML price models.
- **Open-Meteo API Integration:**
  - *Weather Forecast API:* `https://api.open-meteo.com/v1/forecast`
  - *Geocoding API:* `https://geocoding-api.open-meteo.com/v1/search`
- **Location Search & GPS:** Auto-detect coordinates via browser geolocation or search any village, district, or city globally.
- **Current Weather Cards:** Temperature, feels-like, min/max, relative humidity, wind speed, wind direction, atmospheric pressure, rainfall, cloud cover, and UV index.
- **Hourly & 7-Day Forecasts:** Interactive 24-hour Plotly charts and 7-day outlook cards with weather icons and rainfall probabilities.
- **Weather Analytics:** Multi-metric trend charts for temperature, rainfall volume, humidity, and wind velocity.

### 3. 🌱 Farmer Advisory Platform (`/advisory`)
- **100% Text-Based Agronomy:** Strictly zero camera, image classification, or computer vision dependencies—accessible on any low-bandwidth mobile or desktop browser.
- **Bilingual Support:** One-click toggle between **English** and **Telugu (తెలుగు)** across all cards, filters, and AI assistant outputs.
- **Verified Scientific Knowledge:** Grounded in official packages of practices from **ICAR, ANGRAU, KVK, and State Agricultural Universities**.
- **Six Specialized Modules:**
  1. **Crop Advisory:** High-yielding varieties, soil compatibility, seed rate per acre, fungicidal & bio-inoculant seed treatment protocols, and spacing.
  2. **Fertilizer Advisory:** Dynamic acre-scalable calculator (0.5 to 50 acres) mapping N-P-K (kg/acre) to commercial bags (Urea, DAP, MOP, SSP), split application schedules, and biofertilizers.
  3. **Pest Management:** Diagnostic symptom search filtered by plant part (**Leaves, Stem, Flowers, Fruits/Pods**), Economic Threshold Levels (ETL), cultural/mechanical methods, bio-controls, and exact chemical dosages (g/L or ml/L).
  4. **Irrigation Advisory:** Yield-critical moisture stress stages, soil water-retention intervals (Clay, Loam, Sandy), and irrigation methods (Drip, Furrow, Sprinkler).
  5. **Crop Calendar:** Step-by-step Days After Sowing (DAS) timeline, critical field operations, and do's/don'ts.
  6. **AI Farmer Assistant:** Conversational bilingual agronomy assistant with instant suggestion prompts and ICAR/ANGRAU citations.

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend** | Python 3.10+, FastAPI, Uvicorn, Pydantic v2, SQLAlchemy, AioSQLite |
| **Data & ML** | Pandas, PyArrow (Parquet), NumPy, Scikit-learn, Statsmodels, Prophet, XGBoost, LightGBM, PyTorch |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Plotly.js |
| **External APIs** | Open-Meteo (Forecast & Geocoding) |

---

## Project Structure

```
AgriIntel/
├── data/
│   └── uploads/
│       ├── agmarknet_cache.parquet        # 11.9M+ precomputed Parquet records
│       └── agmarknet_cache_meta.json      # Metadata index (crops, states, mandis)
├── marketmind-ai/
│   ├── backend/
│   │   ├── app/
│   │   │   ├── main.py                    # FastAPI application entry point
│   │   │   ├── api/
│   │   │   │   ├── agmarknet.py           # Agmarknet dataset & ML forecast routes
│   │   │   │   ├── advisory.py            # Farmer Advisory endpoints
│   │   │   │   ├── datasets.py            # Custom dataset management
│   │   │   │   ├── forecasts.py           # Custom forecasting jobs
│   │   │   │   └── system.py              # Health check & audit history
│   │   │   ├── core/                      # Configuration, CORS & logging
│   │   │   ├── database/                  # SQLite models & async sessions
│   │   │   ├── forecasting/               # 14 statistical & ML model classes
│   │   │   └── services/
│   │   │       ├── advisory_data.py       # Verified ICAR/ANGRAU agronomy database
│   │   │       ├── advisory_service.py    # Advisory calculation & chat engine
│   │   │       └── agmarknet_service.py   # Parquet query & ML prediction pipeline
│   │   ├── tests/
│   │   │   ├── test_advisory_pipeline.py  # 7 automated tests for Farmer Advisory
│   │   │   └── test_prediction_pipeline.py# 10 automated tests for ML forecasting
│   │   └── requirements.txt
│   └── frontend/
│       ├── src/
│       │   ├── components/
│       │   │   ├── advisory/              # 6 Farmer Advisory UI modules
│       │   │   ├── weather/               # Open-Meteo cards, charts & search
│       │   │   ├── ForecastPanel.tsx      # Agmarknet prediction panel
│       │   │   └── Sidebar.tsx            # Navigation sidebar
│       │   ├── pages/
│       │   │   ├── FarmerAdvisoryPage.tsx # Farmer Advisory dashboard
│       │   │   ├── WeatherPage.tsx        # Weather Forecasting dashboard
│       │   │   ├── ForecastWorkspacePage.tsx # ML training workspace
│       │   │   └── DatasetAnalysisPage.tsx# Exploratory data analysis
│       │   ├── services/
│       │   │   ├── advisoryApi.ts         # Advisory REST client
│       │   │   ├── api.ts                 # Agmarknet & dataset client
│       │   │   ├── geocodingApi.ts        # Open-Meteo Geocoding client
│       │   │   └── weatherApi.ts          # Open-Meteo Forecast client
│       │   └── types/                     # TypeScript definitions
│       ├── package.json
│       └── vite.config.ts
└── README.md
```

---

## Getting Started

### Prerequisites
- **Python:** 3.10 to 3.13
- **Node.js:** 18+ and `npm`

---

### 1. Backend Setup

```powershell
# Navigate to backend directory
cd marketmind-ai/backend

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

- **API Documentation (Swagger UI):** `http://127.0.0.1:8000/docs`
- **Alternative Docs (ReDoc):** `http://127.0.0.1:8000/redoc`

---

### 2. Frontend Setup

```powershell
# In a separate terminal, navigate to frontend directory
cd marketmind-ai/frontend

# Install node dependencies
npm install

# Start Vite development server
npm run dev
```

- **Application URL:** `http://127.0.0.1:5173`
- **Farmer Advisory:** `http://127.0.0.1:5173/advisory`
- **Weather Forecast:** `http://127.0.0.1:5173/weather`

---

## API Endpoints Reference

### Farmer Advisory Endpoints (`/api/advisory/*`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/advisory/meta` | Get supported crops, soils, growth stages, and states |
| `POST` | `/api/advisory/crop` | Retrieve crop cultivation, varieties, seed rate & spacing |
| `POST` | `/api/advisory/fertilizer` | Calculate split NPK & commercial bags scaled by acre |
| `POST` | `/api/advisory/pests` | Text-based diagnostic pest search with IPM recommendations |
| `POST` | `/api/advisory/irrigation` | Critical moisture stress stages and soil intervals |
| `POST` | `/api/advisory/calendar` | Step-by-step Days After Sowing (DAS) growth schedule |
| `POST` | `/api/advisory/assistant` | Conversational bilingual AI assistant (English/Telugu) |

### Agmarknet Forecasting Endpoints (`/api/agmarknet/*`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/agmarknet/status` | Dataset status, active records, and date boundaries |
| `GET` | `/api/agmarknet/filters` | Dynamic state, crop, and mandi cascade filters |
| `GET` | `/api/agmarknet/crop-history` | Historical daily modal, min, and max prices |
| `POST` | `/api/agmarknet/predict` | Multi-step recursive ML prediction for future dates |
| `GET` | `/api/agmarknet/mandis` | Reporting mandis with record density counts |

---

## Verification & Testing

Both the backend and frontend have automated validation test suites.

### Backend Automated Tests
```powershell
# Run Farmer Advisory tests
python -m pytest marketmind-ai/backend/tests/test_advisory_pipeline.py

# Run ML Prediction Pipeline tests
python -m pytest marketmind-ai/backend/tests/test_prediction_pipeline.py

# Run all tests
python -m pytest marketmind-ai/backend/tests/
```
*Current test suite status: 17 passed (100% pass rate).*

### Frontend Build & Lint Verification
```powershell
cd marketmind-ai/frontend

# TypeScript check & production bundle build
npm run build

# ESLint validation
npm run lint
```

---

## Scientific & Agricultural Citations

The agricultural recommendations, nutrient dosages, diagnostic markers, and economic threshold levels implemented in AgriIntel are referenced from:
1. **ICAR (Indian Council of Agricultural Research):** *Handbook of Agriculture (6th Edition)* & Crop-specific *Package of Practices*.
2. **ANGRAU (Acharya N.G. Ranga Agricultural University):** *Vyavasaya Panchangam (వ్యవసాయ పంచాంగం)* & Technical Bulletins.
3. **KVK (Krishi Vigyan Kendra):** Field advisories and IPM diagnostic schedules.
4. **Directorate of Plant Protection, Quarantine & Storage (DPPQS):** Approved insecticides and pre-harvest intervals (PHI).

---

## License

This project is licensed under the MIT License.
