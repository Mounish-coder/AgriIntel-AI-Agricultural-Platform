"""
Abstract base class for all forecasting models.
Every model must implement this interface.
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Optional
import time
import numpy as np
import pandas as pd

from app.evaluation.metrics import compute_all_metrics
from app.schemas.schemas import ForecastPoint, ModelForecastResult, ModelMetrics


@dataclass
class ModelResult:
    model_name: str
    status: str  # COMPLETED | FAILED | UNAVAILABLE
    metrics: dict = field(default_factory=dict)
    val_metrics: dict = field(default_factory=dict)
    test_predictions: list = field(default_factory=list)   # list of (date, value, lower, upper)
    future_predictions: list = field(default_factory=list) # list of (date, value, lower, upper)
    feature_importance: Optional[dict] = None
    diagnostics: Optional[dict] = None
    error: Optional[str] = None
    train_duration_s: float = 0.0

    def to_schema(self) -> ModelForecastResult:
        def _to_fp(rows: list, is_forecast: bool) -> list[ForecastPoint]:
            pts = []
            for row in rows:
                if len(row) == 4:
                    date, val, lo, hi = row
                else:
                    date, val = row[0], row[1]
                    lo, hi = None, None
                pts.append(ForecastPoint(
                    date=str(date)[:10],
                    value=round(float(val), 6) if val is not None and not np.isnan(float(val)) else None,
                    lower=round(float(lo), 6) if lo is not None and not np.isnan(float(lo)) else None,
                    upper=round(float(hi), 6) if hi is not None and not np.isnan(float(hi)) else None,
                    is_forecast=is_forecast,
                ))
            return pts

        metrics = ModelMetrics(
            model_name=self.model_name,
            status=self.status,
            error=self.error,
            train_duration_s=self.train_duration_s,
            **{k: (round(v, 6) if isinstance(v, float) and not np.isnan(v) else None)
               for k, v in self.metrics.items()},
        )
        if self.val_metrics:
            metrics.val_mae = self.val_metrics.get("mae")
            metrics.val_rmse = self.val_metrics.get("rmse")
        return ModelForecastResult(
            model_name=self.model_name,
            metrics=metrics,
            test_predictions=_to_fp(self.test_predictions, False),
            future_predictions=_to_fp(self.future_predictions, True),
            feature_importance=self.feature_importance,
            diagnostics=self.diagnostics,
        )


class BaseForecaster(ABC):
    """All forecasting models inherit from this class."""

    name: str = "base"
    requires: list[str] = []  # pip packages required

    def __init__(self, config: dict):
        self.config = config
        self._check_availability()

    def _check_availability(self) -> None:
        """Raise ImportError listing missing packages if unavailable."""
        pass  # Override in subclasses that need optional deps

    @abstractmethod
    def fit(
        self,
        train: pd.Series,
        val: Optional[pd.Series] = None,
        exog_train: Optional[pd.DataFrame] = None,
        exog_val: Optional[pd.DataFrame] = None,
    ) -> None:
        ...

    @abstractmethod
    def predict(self, steps: int, exog_future: Optional[pd.DataFrame] = None) -> np.ndarray:
        """Return point forecast for `steps` periods ahead."""
        ...

    def predict_interval(
        self,
        steps: int,
        confidence: float = 0.95,
        exog_future: Optional[pd.DataFrame] = None,
    ) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
        """Return (point, lower, upper). Defaults to point-only."""
        pred = self.predict(steps, exog_future)
        nans = np.full(len(pred), np.nan)
        return pred, nans, nans

    def run(
        self,
        train: pd.Series,
        val: pd.Series,
        test: pd.Series,
        horizon: int,
        confidence: float = 0.95,
        exog_train: Optional[pd.DataFrame] = None,
        exog_val: Optional[pd.DataFrame] = None,
        exog_test: Optional[pd.DataFrame] = None,
        exog_future: Optional[pd.DataFrame] = None,
    ) -> ModelResult:
        """Full training + evaluation pipeline."""
        t0 = time.perf_counter()
        try:
            # Fit on train only (val used for early stopping if supported)
            self.fit(train, val, exog_train, exog_val)
            duration = time.perf_counter() - t0

            # Validation predictions
            val_preds = self.predict(len(val))
            val_metrics = compute_all_metrics(val.values, val_preds[:len(val)])

            # Refit on train+val for test evaluation
            train_val = pd.concat([train, val])
            self.fit(train_val, exog_train=(
                pd.concat([exog_train, exog_val]) if exog_train is not None and exog_val is not None else None
            ))

            # Test predictions
            point, lo, hi = self.predict_interval(len(test), confidence, exog_test)
            test_metrics = compute_all_metrics(test.values, point[:len(test)])

            # Empirical 95% confidence intervals fallback for test predictions if not computed analytically
            if np.isnan(lo).all() or lo is None:
                val_residuals = val.values - val_preds[:len(val)]
                valid_vres = val_residuals[~np.isnan(val_residuals)]
                val_sigma = float(np.std(valid_vres)) if len(valid_vres) > 0 else 0.0
                if val_sigma <= 1e-4:
                    recent_train = train.iloc[-min(len(train), 30):]
                    val_sigma = float(np.std(recent_train.values)) if len(recent_train) > 1 else float(np.mean(recent_train.values)) * 0.05
                margin_test = 1.96 * max(val_sigma, 1.0) * np.sqrt(np.arange(1, len(point) + 1))
                lo = np.maximum(0.0, point - margin_test)
                hi = point + margin_test

            # Build test prediction rows
            test_rows = list(zip(
                test.index.astype(str),
                point[:len(test)].tolist(),
                lo[:len(test)].tolist(),
                hi[:len(test)].tolist(),
            ))

            # Refit on all data for future forecast
            all_data = pd.concat([train, val, test])
            self.fit(all_data, exog_train=(
                pd.concat([exog_train, exog_val, exog_test])
                if exog_train is not None and exog_val is not None and exog_test is not None
                else None
            ))
            fut_point, fut_lo, fut_hi = self.predict_interval(horizon, confidence, exog_future)

            # Empirical 95% confidence intervals fallback for future forecast if not computed analytically
            if np.isnan(fut_lo).all() or fut_lo is None:
                test_residuals = test.values - point[:len(test)]
                valid_tres = test_residuals[~np.isnan(test_residuals)]
                sigma = float(np.std(valid_tres)) if len(valid_tres) > 0 else 0.0
                if sigma <= 1e-4:
                    recent_all = all_data.iloc[-min(len(all_data), 30):]
                    sigma = float(np.std(recent_all.values)) if len(recent_all) > 1 else float(np.mean(recent_all.values)) * 0.05
                h_steps = np.arange(1, len(fut_point) + 1)
                margin_fut = 1.96 * max(sigma, 1.0) * np.sqrt(h_steps)
                fut_lo = np.maximum(0.0, fut_point - margin_fut)
                fut_hi = fut_point + margin_fut

            # Build future dates forward from the end of the historical series
            base_date = pd.Timestamp(all_data.index[-1]).normalize()
            freq = pd.infer_freq(all_data.index) or "D"
            future_dates = pd.date_range(base_date, periods=horizon + 1, freq=freq)[1:]
            future_rows = list(zip(
                future_dates.strftime("%Y-%m-%d"),
                fut_point.tolist(),
                fut_lo.tolist(),
                fut_hi.tolist(),
            ))

            return ModelResult(
                model_name=self.name,
                status="COMPLETED",
                metrics=test_metrics,
                val_metrics=val_metrics,
                test_predictions=test_rows,
                future_predictions=future_rows,
                train_duration_s=round(duration, 3),
            )

        except Exception as exc:
            return ModelResult(
                model_name=self.name,
                status="FAILED",
                error=str(exc),
                train_duration_s=round(time.perf_counter() - t0, 3),
            )
