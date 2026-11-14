"""ARIMA and SARIMA forecasting models using pmdarima."""
import numpy as np
import pandas as pd
from typing import Optional
from app.forecasting.base import BaseForecaster


class ARIMAForecaster(BaseForecaster):
    name = "arima"

    def __init__(self, config: dict):
        super().__init__(config)
        self._best_order = None

    def _check_availability(self):
        try:
            import pmdarima  # noqa: F401
        except ImportError:
            raise ImportError("pmdarima is required for ARIMA. Install with: pip install pmdarima")

    def fit(self, train: pd.Series, val=None, exog_train=None, exog_val=None):
        import pmdarima as pm
        if self._best_order is not None:
            # Fast direct fit on subsequent refits using discovered optimal order
            self._model = pm.ARIMA(order=self._best_order, maxiter=25).fit(train.values)
            return

        max_p = min(self.config.get("arima_max_p", 2), 2)
        max_q = min(self.config.get("arima_max_q", 2), 2)
        max_d = min(self.config.get("arima_max_d", 1), 1)
        self._model = pm.auto_arima(
            train.values,
            start_p=1, max_p=max_p,
            start_q=1, max_q=max_q,
            max_d=max_d,
            stepwise=True,
            maxiter=20,
            information_criterion="aic",
            error_action="ignore",
            suppress_warnings=True,
        )
        self._best_order = self._model.order

    def predict(self, steps: int, exog_future=None) -> np.ndarray:
        return np.array(self._model.predict(n_periods=steps))

    def predict_interval(self, steps: int, confidence: float = 0.95, exog_future=None):
        alpha = 1 - confidence
        preds, ci = self._model.predict(n_periods=steps, return_conf_int=True, alpha=alpha)
        return np.array(preds), np.array(ci[:, 0]), np.array(ci[:, 1])


class SARIMAForecaster(BaseForecaster):
    name = "sarima"

    def __init__(self, config: dict):
        super().__init__(config)
        self._best_order = None
        self._best_seasonal_order = None

    def _check_availability(self):
        try:
            import pmdarima  # noqa: F401
        except ImportError:
            raise ImportError("pmdarima is required for SARIMA. Install with: pip install pmdarima")

    def fit(self, train: pd.Series, val=None, exog_train=None, exog_val=None):
        import pmdarima as pm
        if self._best_order is not None:
            # Fast direct fit on subsequent refits using discovered optimal orders
            self._model = pm.ARIMA(
                order=self._best_order,
                seasonal_order=self._best_seasonal_order,
                maxiter=25,
            ).fit(train.values)
            return

        m = self.config.get("seasonal_period", 7)
        self._model = pm.auto_arima(
            train.values,
            seasonal=True, m=m,
            start_p=1, max_p=2,
            start_q=1, max_q=2,
            max_d=1,
            start_P=0, max_P=1,
            start_Q=0, max_Q=1,
            max_D=1,
            stepwise=True,
            maxiter=15,
            information_criterion="aic",
            error_action="ignore",
            suppress_warnings=True,
        )
        self._best_order = self._model.order
        self._best_seasonal_order = self._model.seasonal_order

    def predict(self, steps: int, exog_future=None) -> np.ndarray:
        return np.array(self._model.predict(n_periods=steps))

    def predict_interval(self, steps: int, confidence: float = 0.95, exog_future=None):
        alpha = 1 - confidence
        preds, ci = self._model.predict(n_periods=steps, return_conf_int=True, alpha=alpha)
        return np.array(preds), np.array(ci[:, 0]), np.array(ci[:, 1])


class SARIMAXForecaster(BaseForecaster):
    name = "sarimax"

    def _check_availability(self):
        try:
            import pmdarima  # noqa: F401
        except ImportError:
            raise ImportError("pmdarima is required for SARIMAX.")

    def fit(self, train: pd.Series, val=None, exog_train=None, exog_val=None):
        import pmdarima as pm
        m = self.config.get("seasonal_period", 12)
        X = exog_train.values if exog_train is not None else None
        self._model = pm.auto_arima(
            train.values,
            exogenous=X,
            seasonal=True, m=m,
            max_p=3, max_q=3, max_d=2,
            max_P=2, max_Q=2, max_D=1,
            stepwise=True,
            information_criterion="aic",
            error_action="ignore",
            suppress_warnings=True,
        )

    def predict(self, steps: int, exog_future=None) -> np.ndarray:
        X = exog_future.values[:steps] if exog_future is not None else None
        return np.array(self._model.predict(n_periods=steps, exogenous=X))

    def predict_interval(self, steps: int, confidence: float = 0.95, exog_future=None):
        alpha = 1 - confidence
        X = exog_future.values[:steps] if exog_future is not None else None
        preds, ci = self._model.predict(n_periods=steps, exogenous=X, return_conf_int=True, alpha=alpha)
        return np.array(preds), np.array(ci[:, 0]), np.array(ci[:, 1])
