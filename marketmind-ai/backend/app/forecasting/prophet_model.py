"""Prophet forecasting model."""
import numpy as np
import pandas as pd
from typing import Optional
from app.forecasting.base import BaseForecaster


class ProphetForecaster(BaseForecaster):
    name = "prophet"

    def _check_availability(self):
        try:
            from prophet import Prophet  # noqa: F401
        except ImportError:
            raise ImportError("prophet is required. Install with: pip install prophet")

    def fit(self, train: pd.Series, val=None, exog_train=None, exog_val=None):
        from prophet import Prophet
        self._freq = pd.infer_freq(train.index) or "D"
        df = pd.DataFrame({"ds": train.index, "y": train.values})
        self._model = Prophet(
            yearly_seasonality="auto",
            weekly_seasonality="auto",
            daily_seasonality=False,
            interval_width=self.config.get("confidence_level", 0.95),
        )
        self._model.fit(df)
        self._last_date = train.index[-1]

    def predict(self, steps: int, exog_future=None) -> np.ndarray:
        future = self._model.make_future_dataframe(periods=steps, freq=self._freq, include_history=False)
        forecast = self._model.predict(future)
        return forecast["yhat"].values[:steps]

    def predict_interval(self, steps: int, confidence: float = 0.95, exog_future=None):
        future = self._model.make_future_dataframe(periods=steps, freq=self._freq, include_history=False)
        forecast = self._model.predict(future)
        return (
            forecast["yhat"].values[:steps],
            forecast["yhat_lower"].values[:steps],
            forecast["yhat_upper"].values[:steps],
        )

    def get_components(self) -> Optional[dict]:
        """Return trend and seasonality components for explainability."""
        try:
            all_dates = pd.date_range(end=self._last_date, periods=100, freq=self._freq)
            future_df = pd.DataFrame({"ds": all_dates})
            forecast = self._model.predict(future_df)
            comps = {"trend": forecast["trend"].tolist(), "ds": forecast["ds"].astype(str).tolist()}
            if "weekly" in forecast.columns:
                comps["weekly"] = forecast["weekly"].tolist()
            if "yearly" in forecast.columns:
                comps["yearly"] = forecast["yearly"].tolist()
            return comps
        except Exception:
            return None
