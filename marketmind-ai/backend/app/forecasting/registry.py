"""
Model registry — maps model name → forecaster class.
New models can be added here without touching other code.
"""
from app.forecasting.base import BaseForecaster
from app.forecasting.baseline_models import NaiveForecaster, DriftForecaster, SeasonalNaiveForecaster
from app.forecasting.arima_model import ARIMAForecaster, SARIMAForecaster, SARIMAXForecaster
from app.forecasting.prophet_model import ProphetForecaster
from app.forecasting.ets_model import ETSForecaster
from app.forecasting.ml_models import (
    RandomForestForecaster, XGBoostForecaster, LightGBMForecaster, SVRForecaster
)
from app.forecasting.deep_models import LSTMForecaster, GRUForecaster

MODEL_REGISTRY: dict[str, type[BaseForecaster]] = {
    "naive": NaiveForecaster,
    "drift": DriftForecaster,
    "seasonal_naive": SeasonalNaiveForecaster,
    "arima": ARIMAForecaster,
    "sarima": SARIMAForecaster,
    "sarimax": SARIMAXForecaster,
    "prophet": ProphetForecaster,
    "ets": ETSForecaster,
    "random_forest": RandomForestForecaster,
    "xgboost": XGBoostForecaster,
    "lightgbm": LightGBMForecaster,
    "svr": SVRForecaster,
    "lstm": LSTMForecaster,
    "gru": GRUForecaster,
}

ALL_MODELS = list(MODEL_REGISTRY.keys())


def get_forecaster(name: str, config: dict) -> BaseForecaster:
    cls = MODEL_REGISTRY.get(name)
    if cls is None:
        raise ValueError(f"Unknown model: {name}. Available: {ALL_MODELS}")
    return cls(config)


def check_model_availability(name: str, config: dict) -> tuple[bool, str]:
    """Returns (available, error_message)."""
    try:
        get_forecaster(name, config)
        return True, ""
    except ImportError as e:
        return False, str(e)
    except Exception as e:
        return False, str(e)
