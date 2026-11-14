"""Baseline forecasting models: Naive, Drift, Seasonal Naive."""
import numpy as np
import pandas as pd
from typing import Optional
from app.forecasting.base import BaseForecaster


class NaiveForecaster(BaseForecaster):
    name = "naive"

    def fit(self, train: pd.Series, val=None, exog_train=None, exog_val=None):
        self._last_value = float(train.iloc[-1])
        self._freq = pd.infer_freq(train.index) or "D"

    def predict(self, steps: int, exog_future=None) -> np.ndarray:
        return np.full(steps, self._last_value)


class DriftForecaster(BaseForecaster):
    name = "drift"

    def fit(self, train: pd.Series, val=None, exog_train=None, exog_val=None):
        self._first = float(train.iloc[0])
        self._last = float(train.iloc[-1])
        self._n = len(train)

    def predict(self, steps: int, exog_future=None) -> np.ndarray:
        slope = (self._last - self._first) / (self._n - 1) if self._n > 1 else 0.0
        return np.array([self._last + slope * i for i in range(1, steps + 1)])


class SeasonalNaiveForecaster(BaseForecaster):
    name = "seasonal_naive"

    def __init__(self, config: dict):
        self._m = config.get("seasonal_period", 7)
        super().__init__(config)

    def fit(self, train: pd.Series, val=None, exog_train=None, exog_val=None):
        self._season = train.values[-self._m:].tolist()

    def predict(self, steps: int, exog_future=None) -> np.ndarray:
        m = len(self._season)
        return np.array([self._season[i % m] for i in range(steps)])
