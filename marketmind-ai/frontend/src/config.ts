// API base URL — empty string routes via Vite proxy (/api -> backend)
export const API_BASE = import.meta.env.VITE_API_URL ?? "";

export const MODELS = [
  { id: "naive",          label: "Naive",           category: "Baseline" },
  { id: "drift",          label: "Drift",           category: "Baseline" },
  { id: "seasonal_naive", label: "Seasonal Naive",  category: "Baseline" },
  { id: "arima",          label: "ARIMA",           category: "Statistical" },
  { id: "sarima",         label: "SARIMA",          category: "Statistical" },
  { id: "sarimax",        label: "SARIMAX",         category: "Statistical" },
  { id: "prophet",        label: "Prophet",         category: "Statistical" },
  { id: "ets",            label: "ETS / Holt-Winters", category: "Statistical" },
  { id: "random_forest",  label: "Random Forest",   category: "Machine Learning" },
  { id: "xgboost",        label: "XGBoost",         category: "Machine Learning" },
  { id: "lightgbm",       label: "LightGBM",        category: "Machine Learning" },
  { id: "svr",            label: "SVR",             category: "Machine Learning" },
  { id: "lstm",           label: "LSTM",            category: "Deep Learning" },
  { id: "gru",            label: "GRU",             category: "Deep Learning" },
] as const;

export type ModelId = typeof MODELS[number]["id"];

export const FORECAST_HORIZONS = [1, 7, 14, 30, 60, 90] as const;
export const FREQUENCIES = ["D", "W", "M", "Q"] as const;
