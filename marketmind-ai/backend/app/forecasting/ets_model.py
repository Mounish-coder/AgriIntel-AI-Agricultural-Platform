"""Exponential Smoothing (Holt-Winters ETS) forecasting model."""
import numpy as np
import pandas as pd
from typing import Optional
from app.forecasting.base import BaseForecaster


class ETSForecaster(BaseForecaster):
    name = "ets"

    def fit(self, train: pd.Series, val=None, exog_train=None, exog_val=None):
        from statsmodels.tsa.holtwinters import ExponentialSmoothing
        m = self.config.get("seasonal_period", None)
        n = len(train)

        # Determine whether to use seasonality
        use_seasonal = m is not None and m > 1 and n >= 2 * m

        if use_seasonal:
            self._model = ExponentialSmoothing(
                train,
                trend="add",
                seasonal="add",
                seasonal_periods=m,
                initialization_method="estimated",
            ).fit(optimized=True)
        else:
            self._model = ExponentialSmoothing(
                train,
                trend="add",
                seasonal=None,
                initialization_method="estimated",
            ).fit(optimized=True)

    def predict(self, steps: int, exog_future=None) -> np.ndarray:
        return self._model.forecast(steps).values

    def predict_interval(self, steps: int, confidence: float = 0.95, exog_future=None):
        point = self.predict(steps)
        # Statsmodels ETS simulation-based intervals
        try:
            sim = self._model.simulate(nsimulations=steps, repetitions=200, error="add")
            alpha = (1 - confidence) / 2
            lo = np.percentile(sim.values, alpha * 100, axis=1)
            hi = np.percentile(sim.values, (1 - alpha) * 100, axis=1)
        except Exception:
            lo = np.full(steps, np.nan)
            hi = np.full(steps, np.nan)
        return point, lo, hi
