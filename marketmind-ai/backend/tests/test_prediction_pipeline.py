"""
Comprehensive automated test suite for AGMARKNET ML Prediction Pipeline.
Audits and verifies:
1. Historical price loading.
2. Data preprocessing & cleaning.
3. Feature generation (lags, rolling stats, calendar features).
4. Model loading & registry availability.
5. Future date generation (continuity from historical end).
6. 7-day prediction (non-constant, realistic variations).
7. 15-day prediction.
8. 30-day prediction.
9. Prediction API response structure.
10. Dynamic predictions across different crops and markets (non-identical).
"""
import pytest
import pandas as pd
import numpy as np

from app.services.agmarknet_service import agmarknet_service
from app.forecasting.registry import get_forecaster, ALL_MODELS
from app.forecasting.ml_models import _make_features, RandomForestForecaster, XGBoostForecaster
from app.forecasting.baseline_models import DriftForecaster, SeasonalNaiveForecaster
from app.forecasting.arima_model import ARIMAForecaster, SARIMAForecaster


@pytest.fixture(scope="module")
def dataset():
    """Ensure dataset is loaded once for all tests."""
    df = agmarknet_service.load_dataset()
    assert df is not None and not df.empty, "Dataset must load successfully"
    return df


# 1. Historical price loading
def test_historical_price_loading(dataset):
    status = agmarknet_service.get_status()
    assert status.get("status") == "ready"
    records = status.get("metadata", {}).get("records", len(dataset))
    assert records > 1_000_000

    ts_tn = agmarknet_service.get_state_time_series("Tamil Nadu", "Onion")
    assert "series" in ts_tn
    assert len(ts_tn["series"]) > 100
    assert ts_tn["series"].isna().sum() == 0, "Clean series must have no NaNs"


# 2. Data preprocessing
def test_data_preprocessing_no_flat_tail(dataset):
    ts_tn = agmarknet_service.get_state_time_series("Tamil Nadu", "Onion")
    series = ts_tn["series"]
    
    # Verify that the series does NOT end in hundreds of identical values
    last_50 = series.iloc[-50:].values
    assert not np.all(last_50 == last_50[0]), "Series must not be padded with identical ffilled values"
    
    # End date must equal the last parsed observation date in the dataset
    df = dataset
    actual_max = df[(df["State"] == "Tamil Nadu") & (df["Commodity"] == "Onion")]["_parsed_date"].max()
    assert series.index.max() == actual_max, "Time series end date must match actual observation max date"


# 3. Feature generation
def test_feature_generation(dataset):
    ts = agmarknet_service.get_state_time_series("Maharashtra", "Tomato")["series"]
    feat_df = _make_features(ts, lags=14, rolling=(7, 14, 28))
    
    # Check required feature columns
    for lag in range(1, 15):
        assert f"lag_{lag}" in feat_df.columns
    for w in [7, 14, 28]:
        assert f"roll_mean_{w}" in feat_df.columns
        assert f"roll_std_{w}" in feat_df.columns
    for cal in ["dow", "month", "quarter", "dayofyear"]:
        assert cal in feat_df.columns
        
    # Check that lag 1 matches shifted series
    assert np.allclose(feat_df["lag_1"].iloc[1:].values, feat_df["y"].iloc[:-1].values)
    # Calendar features should have realistic non-zero ranges
    assert feat_df["month"].min() >= 1 and feat_df["month"].max() <= 12
    assert feat_df["dow"].min() >= 0 and feat_df["dow"].max() <= 6


# 4. Model loading
def test_model_loading():
    for model_name in ["naive", "drift", "seasonal_naive", "arima", "sarima", "random_forest", "xgboost"]:
        forecaster = get_forecaster(model_name, {"lags": 7, "seasonal_period": 7})
        assert forecaster is not None
        assert forecaster.name == model_name


# 5. Future date generation
def test_future_date_generation(dataset):
    ts = agmarknet_service.get_state_time_series("Uttar Pradesh", "Potato")["series"]
    forecaster = DriftForecaster({})
    
    horizon = 14
    res = forecaster.run(
        train=ts.iloc[:-28],
        val=ts.iloc[-28:-14],
        test=ts.iloc[-14:],
        horizon=horizon,
    )
    
    future_preds = res.future_predictions
    assert len(future_preds) == horizon
    
    # Verify continuous sequence of dates starting day after series end
    expected_start = (ts.index[-1] + pd.Timedelta(days=1)).strftime("%Y-%m-%d")
    assert future_preds[0][0] == expected_start
    
    for i in range(1, len(future_preds)):
        d_prev = pd.Timestamp(future_preds[i - 1][0])
        d_curr = pd.Timestamp(future_preds[i][0])
        assert (d_curr - d_prev).days == 1, "Future dates must be strictly consecutive daily steps"


# 6. Seven-day prediction non-constant
def test_seven_day_prediction(dataset):
    ts = agmarknet_service.get_state_time_series("Maharashtra", "Tomato")["series"]
    rf = RandomForestForecaster({"lags": 14, "rf_n_estimators": 40})
    res = rf.run(ts.iloc[:-28], ts.iloc[-28:-14], ts.iloc[-14:], horizon=7)
    
    preds = [p[1] for p in res.future_predictions]
    assert len(preds) == 7
    # Future predictions must have variation across dates (not all identical)
    assert len(set(preds)) > 1, f"7-day predictions must not be constant: {preds}"


# 7. Fifteen-day prediction non-constant
def test_fifteen_day_prediction(dataset):
    ts = agmarknet_service.get_state_time_series("Tamil Nadu", "Onion")["series"]
    rf = RandomForestForecaster({"lags": 14, "rf_n_estimators": 40})
    res = rf.run(ts.iloc[:-30], ts.iloc[-30:-15], ts.iloc[-15:], horizon=15)
    
    preds = [p[1] for p in res.future_predictions]
    assert len(preds) == 15
    assert len(set(preds)) > 5, f"15-day predictions must have substantial variation: {preds}"


# 8. Thirty-day prediction non-constant
def test_thirty_day_prediction(dataset):
    ts = agmarknet_service.get_state_time_series("Uttar Pradesh", "Potato")["series"]
    xgb = XGBoostForecaster({"lags": 14, "xgb_n_estimators": 40})
    res = xgb.run(ts.iloc[:-40], ts.iloc[-40:-30], ts.iloc[-30:], horizon=30)
    
    preds = [p[1] for p in res.future_predictions]
    assert len(preds) == 30
    assert len(set(preds)) > 5, f"30-day predictions must have dynamic trajectory: {preds}"


# 9. Prediction API response structure
def test_prediction_schema_formatting(dataset):
    ts = agmarknet_service.get_state_time_series("Tamil Nadu", "Onion")["series"]
    arima = ARIMAForecaster({"arima_max_p": 2, "arima_max_q": 2, "arima_max_d": 1})
    res = arima.run(ts.iloc[:-28], ts.iloc[-28:-14], ts.iloc[-14:], horizon=14)
    
    schema = res.to_schema()
    assert schema.model_name == "arima"
    assert schema.metrics.mae is not None
    assert schema.metrics.rmse is not None
    assert len(schema.future_predictions) == 14
    for fp in schema.future_predictions:
        assert fp.is_forecast is True
        assert fp.value is not None
        assert fp.date is not None


# 10. Different crops and markets must produce distinct predictions
def test_distinct_predictions_across_crops(dataset):
    ts_onion = agmarknet_service.get_state_time_series("Tamil Nadu", "Onion")["series"]
    ts_tomato = agmarknet_service.get_state_time_series("Maharashtra", "Tomato")["series"]
    ts_potato = agmarknet_service.get_state_time_series("Uttar Pradesh", "Potato")["series"]
    
    rf1 = RandomForestForecaster({"lags": 14, "rf_n_estimators": 40})
    res1 = rf1.run(ts_onion.iloc[:-28], ts_onion.iloc[-28:-14], ts_onion.iloc[-14:], horizon=14)
    preds1 = [p[1] for p in res1.future_predictions]
    
    rf2 = RandomForestForecaster({"lags": 14, "rf_n_estimators": 40})
    res2 = rf2.run(ts_tomato.iloc[:-28], ts_tomato.iloc[-28:-14], ts_tomato.iloc[-14:], horizon=14)
    preds2 = [p[1] for p in res2.future_predictions]
    
    rf3 = RandomForestForecaster({"lags": 14, "rf_n_estimators": 40})
    res3 = rf3.run(ts_potato.iloc[:-28], ts_potato.iloc[-28:-14], ts_potato.iloc[-14:], horizon=14)
    preds3 = [p[1] for p in res3.future_predictions]
    
    # Values should be in different price regimes (e.g. Onion ~2400, Tomato ~1400, Potato ~500)
    assert abs(np.mean(preds1) - np.mean(preds2)) > 200, "Onion and Tomato predictions must reflect distinct price levels"
    assert abs(np.mean(preds2) - np.mean(preds3)) > 200, "Tomato and Potato predictions must reflect distinct price levels"
