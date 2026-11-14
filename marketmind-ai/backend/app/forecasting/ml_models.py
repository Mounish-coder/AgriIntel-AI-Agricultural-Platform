"""
ML-based forecasters: Random Forest, XGBoost, LightGBM, SVR.
All use lag + rolling + calendar feature engineering and
recursive multi-step forecasting to prevent target leakage.
"""
import numpy as np
import pandas as pd
from typing import Optional
from sklearn.preprocessing import StandardScaler
from app.forecasting.base import BaseForecaster


def _make_features(series: pd.Series, lags: int = 14, rolling: tuple = (7, 14, 28)) -> pd.DataFrame:
    """Build supervised learning features from a univariate time series."""
    df = pd.DataFrame({"y": series})
    for lag in range(1, lags + 1):
        df[f"lag_{lag}"] = df["y"].shift(lag)
    for w in rolling:
        df[f"roll_mean_{w}"] = df["y"].shift(1).rolling(w).mean()
        df[f"roll_std_{w}"] = df["y"].shift(1).rolling(w).std()
    if hasattr(series.index, "dayofweek"):
        df["dow"] = series.index.dayofweek
        df["month"] = series.index.month
        df["quarter"] = series.index.quarter
        df["dayofyear"] = series.index.dayofyear
    df = df.dropna()
    return df


class _SupervisedMixin:
    """Mixin providing fast recursive multi-step prediction for ML models."""

    def _recursive_predict(self, steps: int) -> np.ndarray:
        """Recursively predict `steps` ahead using stored last window and advancing calendar features."""
        history = list(self._history)
        predictions = []
        lags = self._lags
        rolling_windows = self._rolling_windows
        last_date = getattr(self, "_last_date", None)

        for step_i in range(steps):
            feats = []
            for lag in range(1, lags + 1):
                feats.append(history[-lag])
            for w in rolling_windows:
                if len(history) >= w:
                    feats.append(float(np.mean(history[-w:])))
                    feats.append(float(np.std(history[-w:])))
                else:
                    feats.append(float(np.mean(history)))
                    feats.append(float(np.std(history)) if len(history) > 1 else 0.0)
            # Calendar features (dow, month, quarter, dayofyear) matched dynamically to forecast horizon
            if last_date is not None:
                step_date = pd.Timestamp(last_date) + pd.Timedelta(days=step_i + 1)
                feats.extend([
                    float(step_date.dayofweek),
                    float(step_date.month),
                    float(step_date.quarter),
                    float(step_date.dayofyear),
                ])
            else:
                feats.extend([0.0, 0.0, 0.0, 0.0])

            # Convert to DataFrame with feature_cols to match sklearn/xgboost expected input
            X = pd.DataFrame([feats], columns=self._feature_cols)
            if self._scaler:
                X = self._scaler.transform(X)
            pred = float(self._regressor.predict(X)[0])
            predictions.append(pred)
            history.append(pred)

        return np.array(predictions)


class RandomForestForecaster(_SupervisedMixin, BaseForecaster):
    name = "random_forest"

    def fit(self, train: pd.Series, val=None, exog_train=None, exog_val=None):
        from sklearn.ensemble import RandomForestRegressor
        self._lags = self.config.get("lags", 14)
        self._rolling_windows = (7, 14, 28)
        feat_df = _make_features(train, self._lags, self._rolling_windows)
        X = feat_df.drop(columns=["y"])
        y = feat_df["y"]
        self._feature_cols = X.columns.tolist()
        self._scaler = None
        n_estimators = self.config.get("rf_n_estimators", 80)
        max_depth = self.config.get("rf_max_depth", 10)
        self._regressor = RandomForestRegressor(
            n_estimators=n_estimators, max_depth=max_depth, n_jobs=-1, random_state=42
        )
        self._regressor.fit(X, y)
        self._history = train.values.tolist()
        self._last_date = train.index[-1] if hasattr(train, "index") and len(train.index) > 0 else None

    def predict(self, steps: int, exog_future=None) -> np.ndarray:
        return self._recursive_predict(steps)

    @property
    def feature_importance(self) -> dict:
        imp = self._regressor.feature_importances_
        return dict(sorted(zip(self._feature_cols, imp.tolist()), key=lambda x: -x[1])[:20])


class XGBoostForecaster(_SupervisedMixin, BaseForecaster):
    name = "xgboost"

    def _check_availability(self):
        try:
            import xgboost  # noqa: F401
        except ImportError:
            raise ImportError("xgboost is required. Install with: pip install xgboost")

    def fit(self, train: pd.Series, val=None, exog_train=None, exog_val=None):
        import xgboost as xgb
        self._lags = self.config.get("lags", 14)
        self._rolling_windows = (7, 14, 28)
        feat_df = _make_features(train, self._lags, self._rolling_windows)
        X = feat_df.drop(columns=["y"])
        y = feat_df["y"]
        self._feature_cols = X.columns.tolist()
        self._scaler = None
        n_estimators = self.config.get("xgb_n_estimators", 80)
        max_depth = self.config.get("xgb_max_depth", 4)
        self._regressor = xgb.XGBRegressor(
            n_estimators=n_estimators, learning_rate=0.08, max_depth=max_depth,
            subsample=0.8, colsample_bytree=0.8, random_state=42,
            n_jobs=-1, verbosity=0,
        )
        if val is not None and len(val) > 0:
            val_feat = _make_features(pd.concat([train, val]), self._lags, self._rolling_windows)
            val_feat = val_feat.iloc[-len(val):]
            Xv = val_feat.drop(columns=["y"])
            yv = val_feat["y"]
            self._regressor.fit(X, y, eval_set=[(Xv, yv)], verbose=False)
        else:
            self._regressor.fit(X, y)
        self._history = train.values.tolist()
        self._last_date = train.index[-1] if hasattr(train, "index") and len(train.index) > 0 else None

    def predict(self, steps: int, exog_future=None) -> np.ndarray:
        return self._recursive_predict(steps)

    @property
    def feature_importance(self) -> dict:
        scores = self._regressor.feature_importances_
        return dict(sorted(zip(self._feature_cols, scores.tolist()), key=lambda x: -x[1])[:20])


class LightGBMForecaster(_SupervisedMixin, BaseForecaster):
    name = "lightgbm"

    def _check_availability(self):
        try:
            import lightgbm  # noqa: F401
        except ImportError:
            raise ImportError("lightgbm is required. Install with: pip install lightgbm")

    def fit(self, train: pd.Series, val=None, exog_train=None, exog_val=None):
        import lightgbm as lgb
        self._lags = self.config.get("lags", 14)
        self._rolling_windows = (7, 14, 28)
        feat_df = _make_features(train, self._lags, self._rolling_windows)
        X = feat_df.drop(columns=["y"])
        y = feat_df["y"]
        self._feature_cols = X.columns.tolist()
        self._scaler = None
        self._regressor = lgb.LGBMRegressor(
            n_estimators=300, learning_rate=0.05, num_leaves=31,
            subsample=0.8, colsample_bytree=0.8, random_state=42,
            n_jobs=-1, verbose=-1,
        )
        self._regressor.fit(X, y)
        self._history = train.values.tolist()
        self._last_date = train.index[-1] if hasattr(train, "index") and len(train.index) > 0 else None

    def predict(self, steps: int, exog_future=None) -> np.ndarray:
        return self._recursive_predict(steps)

    @property
    def feature_importance(self) -> dict:
        scores = self._regressor.feature_importances_
        return dict(sorted(zip(self._feature_cols, scores.tolist()), key=lambda x: -x[1])[:20])


class SVRForecaster(_SupervisedMixin, BaseForecaster):
    name = "svr"

    def fit(self, train: pd.Series, val=None, exog_train=None, exog_val=None):
        from sklearn.svm import SVR
        self._lags = self.config.get("lags", 14)
        self._rolling_windows = (7, 14)
        feat_df = _make_features(train, self._lags, self._rolling_windows)
        X = feat_df.drop(columns=["y"])
        y = feat_df["y"]
        self._feature_cols = X.columns.tolist()
        self._scaler = StandardScaler()
        X_scaled = self._scaler.fit_transform(X)
        self._regressor = SVR(kernel="rbf", C=1.0, epsilon=0.1)
        self._regressor.fit(X_scaled, y)
        self._history = train.values.tolist()
        self._last_date = train.index[-1] if hasattr(train, "index") and len(train.index) > 0 else None

    def predict(self, steps: int, exog_future=None) -> np.ndarray:
        return self._recursive_predict(steps)
