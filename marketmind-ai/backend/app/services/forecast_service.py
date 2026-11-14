"""
Orchestrator service — runs all selected models in background,
updates DB status, computes metrics, stores results.
"""
import asyncio
import json
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.logging import logger
from app.database.models import ForecastRun, Dataset
from app.database.session import AsyncSessionLocal
from app.evaluation.metrics import chronological_split, compute_all_metrics
from app.forecasting.registry import get_forecaster, check_model_availability
from app.preprocessing.analyzer import load_dataframe, preprocess_dataframe
from app.schemas.schemas import ForecastConfig, PreprocessingConfig


def _best_model(results: list[dict]) -> Optional[str]:
    """Pick the best completed model by lowest test MAE."""
    completed = [r for r in results if r.get("status") == "COMPLETED" and r.get("test_mae") is not None]
    if not completed:
        return None
    return min(completed, key=lambda r: r["test_mae"])["model_name"]


async def _update_run(run_id: str, **kwargs) -> None:
    """Async DB update helper."""
    async with AsyncSessionLocal() as session:
        run = await session.get(ForecastRun, run_id)
        if run:
            for k, v in kwargs.items():
                setattr(run, k, v)
            run.updated_at = datetime.now(timezone.utc)
            await session.commit()


def _run_models_sync(run_id: str, config_dict: dict, df_path: str) -> None:
    """
    Synchronous worker executed in a thread pool.
    Loads data, splits chronologically, trains each model, stores results.
    """
    import asyncio as _asyncio

    loop = _asyncio.new_event_loop()
    _asyncio.set_event_loop(loop)

    try:
        cfg = ForecastConfig(**config_dict)
        prep_cfg = cfg.preprocessing

        # Load and preprocess
        raw_df = load_dataframe(Path(df_path))
        df = preprocess_dataframe(
            raw_df,
            date_column=cfg.date_column,
            target_column=cfg.target_column,
            config=prep_cfg,
            feature_columns=cfg.feature_columns or [],
            crop=cfg.crop,
            market=cfg.market,
            state=cfg.state,
        )

        if len(df) < 5:
            raise ValueError(
                f"Insufficient historical data ({len(df)} records) for "
                f"Crop='{cfg.crop or 'All'}' and Market='{cfg.market or 'All'}'. "
                f"Please select a different crop or market with more history."
            )

        target = df[cfg.target_column]
        feat_cols = [c for c in cfg.feature_columns if c in df.columns]

        # Chronological split
        train, val, test = chronological_split(df, cfg.target_column, cfg.train_ratio, cfg.val_ratio)
        train_s = train[cfg.target_column]
        val_s = val[cfg.target_column]
        test_s = test[cfg.target_column]

        exog_train = train[feat_cols] if feat_cols else None
        exog_val = val[feat_cols] if feat_cols else None
        exog_test = test[feat_cols] if feat_cols else None

        # Determine seasonal period
        freq = cfg.frequency or pd.infer_freq(target.index) or "D"
        seasonal_map = {"D": 7, "W": 52, "M": 12, "Q": 4, "A": 1}
        seasonal_period = cfg.seasonal_period or seasonal_map.get(freq[:1], 7)

        model_config = {
            "arima_max_p": cfg.arima_max_p,
            "arima_max_q": cfg.arima_max_q,
            "arima_max_d": cfg.arima_max_d,
            "seasonal_period": seasonal_period,
            "confidence_level": cfg.confidence_level,
            "lags": 14,
        }

        results = []
        total = len(cfg.models)

        for idx, model_name in enumerate(cfg.models):
            loop.run_until_complete(_update_run(
                run_id,
                current_model=model_name,
                progress=int((idx / total) * 100),
                status="RUNNING",
            ))

            avail, err_msg = check_model_availability(model_name, model_config)
            if not avail:
                results.append({
                    "model_name": model_name,
                    "status": "UNAVAILABLE",
                    "error": err_msg,
                })
                continue

            try:
                forecaster = get_forecaster(model_name, model_config)
                result = forecaster.run(
                    train=train_s, val=val_s, test=test_s,
                    horizon=cfg.forecast_horizon,
                    confidence=cfg.confidence_level,
                    exog_train=exog_train, exog_val=exog_val,
                    exog_test=exog_test, exog_future=None,
                )
                r = {
                    "model_name": model_name,
                    "status": result.status,
                    "error": result.error,
                    "train_duration_s": result.train_duration_s,
                    "test_mae": result.metrics.get("mae"),
                    "test_rmse": result.metrics.get("rmse"),
                    "test_mape": result.metrics.get("mape"),
                    "test_smape": result.metrics.get("smape"),
                    "test_wape": result.metrics.get("wape"),
                    "test_r2": result.metrics.get("r2"),
                    "val_mae": result.val_metrics.get("mae"),
                    "val_rmse": result.val_metrics.get("rmse"),
                    "test_predictions": result.test_predictions,
                    "future_predictions": result.future_predictions,
                    "feature_importance": result.feature_importance,
                }
                results.append(r)
                logger.info(f"[{run_id}] {model_name}: MAE={r['test_mae']:.4f}")
            except Exception as exc:
                logger.exception(f"[{run_id}] {model_name} FAILED: {exc}")
                results.append({"model_name": model_name, "status": "FAILED", "error": str(exc)})

        # Build historical series for frontend
        historical = [
            {"date": str(idx)[:10], "value": float(v)}
            for idx, v in target.items()
            if v is not None and not np.isnan(float(v))
        ]

        best = _best_model(results)
        final_payload = {
            "historical": historical,
            "results": results,
            "best_model": best,
            "crop": cfg.crop,
            "market": cfg.market,
            "state": cfg.state,
            "target_column": cfg.target_column,
            "current_price": float(target.iloc[-1]) if len(target) > 0 else None,
            "mean_price": float(target.mean()) if len(target) > 0 else None,
            "min_price": float(target.min()) if len(target) > 0 else None,
            "max_price": float(target.max()) if len(target) > 0 else None,
        }

        loop.run_until_complete(_update_run(
            run_id,
            status="COMPLETED",
            progress=100,
            current_model=None,
            results_json=json.dumps(final_payload, default=str),
            best_model=best,
            completed_at=datetime.now(timezone.utc),
        ))
        logger.info(f"[{run_id}] Run COMPLETED. Best model: {best}")

    except Exception as exc:
        logger.exception(f"[{run_id}] Fatal error: {exc}")
        loop.run_until_complete(_update_run(
            run_id, status="FAILED", error_message=str(exc)
        ))
    finally:
        loop.close()
