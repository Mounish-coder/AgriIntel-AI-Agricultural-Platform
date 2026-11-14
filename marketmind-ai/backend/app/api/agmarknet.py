"""
AgriIntel AGMARKNET API Endpoints
Provides direct access to the active AGMARKNET dataset, dynamic filters,
real model forecasting, and analysis.
"""
import asyncio
import concurrent.futures
import json
import uuid
from datetime import datetime, timezone
from typing import Optional, Any
import numpy as np
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import logger
from app.database.models import ForecastRun
from app.database.session import get_db, AsyncSessionLocal
from app.evaluation.metrics import chronological_split, compute_all_metrics
from app.forecasting.registry import get_forecaster, check_model_availability
from app.services.agmarknet_service import agmarknet_service

router = APIRouter(prefix="/api/agmarknet", tags=["agmarknet"])

# In-memory cache for fast, non-blocking analysis results
_analysis_cache: Optional[dict[str, Any]] = None


class CropPredictRequest(BaseModel):
    state: str = Field(..., description="Target Indian state (e.g. Maharashtra)")
    crop: str = Field(..., description="Target agricultural crop/commodity (e.g. Onion)")
    target_price: str = Field("Modal_Price", description="Target price type: Modal_Price, Min_Price, or Max_Price")
    horizon: int = Field(14, ge=1, le=90, description="Forecast horizon in days (e.g. 7, 14, 30)")
    models: list[str] = Field(
        default_factory=lambda: ["naive", "drift", "seasonal_naive", "arima", "sarima", "prophet", "random_forest", "xgboost"],
        description="Algorithms to evaluate automatically"
    )
    train_ratio: float = Field(0.75, ge=0.4, le=0.9)


@router.get("/status")
async def get_dataset_status():
    """Return verification metadata for the active AGMARKNET dataset."""
    status = agmarknet_service.get_status()
    if status.get("status") == "error":
        raise HTTPException(
            status_code=404,
            detail={
                "message": status.get("error"),
                "searched_directories": status.get("searched_directories", []),
            },
        )
    return status


@router.get("/filters")
async def get_filters(
    crop: Optional[str] = Query(None, description="Selected crop/commodity"),
    state: Optional[str] = Query(None, description="Selected state"),
    district: Optional[str] = Query(None, description="Selected district"),
):
    """Return dynamic cascading filter options (states, crops) and state-level price statistics."""
    try:
        return agmarknet_service.get_filters(crop=crop, state=state, district=district)
    except Exception as e:
        logger.exception(f"Error fetching filters: {e}")
        raise HTTPException(500, detail=str(e))


def _compute_dataset_analysis(df: pd.DataFrame, meta: dict) -> dict[str, Any]:
    """Vectorized aggregation across 12M rows to avoid blocking Python loops."""
    crop_col = meta.get("column_mapping", {}).get("crop", "Commodity")
    modal_col = meta.get("column_mapping", {}).get("modal_price", "Modal_Price")
    state_col = meta.get("column_mapping", {}).get("state", "State")

    crop_stats = []
    if crop_col and crop_col in df.columns and modal_col in df.columns:
        c_agg = df.groupby(crop_col, observed=True)[modal_col].agg(["count", "min", "mean", "max"]).reset_index()
        c_agg = c_agg.sort_values(by="count", ascending=False)
        for _, row in c_agg.iterrows():
            cnt = int(row["count"])
            if cnt == 0:
                continue
            crop_stats.append({
                "crop": str(row[crop_col]),
                "records": cnt,
                "min_price": float(round(row["min"], 2)) if pd.notna(row["min"]) else None,
                "max_price": float(round(row["max"], 2)) if pd.notna(row["max"]) else None,
                "mean_price": float(round(row["mean"], 2)) if pd.notna(row["mean"]) else None,
            })

    state_stats = []
    if state_col and state_col in df.columns and modal_col in df.columns:
        s_agg = df.groupby(state_col, observed=True).agg(
            records=(modal_col, "count"),
            avg_price=(modal_col, "mean"),
            crops_count=(crop_col, "nunique") if crop_col in df.columns else (modal_col, "count")
        ).reset_index().sort_values(by="records", ascending=False)
        for _, row in s_agg.iterrows():
            cnt = int(row["records"])
            if cnt == 0:
                continue
            state_stats.append({
                "state": str(row[state_col]),
                "records": cnt,
                "crops_count": int(row["crops_count"]),
                "avg_price": float(round(row["avg_price"], 2)) if pd.notna(row["avg_price"]) else None,
            })

    num_cols = [c for c in [modal_col, "Min_Price", "Max_Price"] if c in df.columns]
    desc = df[num_cols].describe().to_dict() if num_cols else {}

    display_cols = [c for c in df.columns if not c.startswith("_")]
    preview = df[display_cols].head(15).where(pd.notna(df[display_cols]), None).to_dict(orient="records")

    return {
        "metadata": meta,
        "crop_distribution": crop_stats,
        "state_distribution": state_stats,
        "descriptive_stats": desc,
        "preview_rows": preview,
        "display_columns": display_cols,
    }


@router.get("/analysis")
async def get_dataset_analysis():
    """Return descriptive stats, crop distribution, and preview rows for Data Analysis (cached & non-blocking)."""
    global _analysis_cache
    if _analysis_cache is not None:
        return _analysis_cache

    try:
        df = agmarknet_service.load_dataset()
        status = agmarknet_service.get_status()
        meta = status.get("metadata", {})
        result = await asyncio.to_thread(_compute_dataset_analysis, df, meta)
        _analysis_cache = result
        return _analysis_cache
    except Exception as e:
        logger.exception(f"Error fetching analysis: {e}")
        raise HTTPException(500, detail=str(e))


def _evaluate_single_model(
    model_name: str,
    model_config: dict[str, Any],
    train_s: pd.Series,
    val_s: pd.Series,
    test_s: pd.Series,
    horizon: int,
    state: str,
    crop: str,
) -> dict[str, Any]:
    avail, err_msg = check_model_availability(model_name, model_config)
    if not avail:
        return {
            "model_name": model_name,
            "status": "UNAVAILABLE",
            "error": err_msg,
            "metrics": {"model_name": model_name, "status": "UNAVAILABLE", "error": err_msg},
            "test_predictions": [],
            "future_predictions": [],
        }

    try:
        forecaster = get_forecaster(model_name, model_config)
        result = forecaster.run(
            train=train_s,
            val=val_s,
            test=test_s,
            horizon=horizon,
            confidence=0.95,
        )
        schema_res = result.to_schema()
        metrics = schema_res.metrics.model_dump()
        test_pts = [p.model_dump() for p in schema_res.test_predictions]
        future_pts = [p.model_dump() for p in schema_res.future_predictions]
        logger.info(f"[{state} - {crop}] {model_name}: status={result.status}, MAE={metrics.get('mae')}")
        return {
            "model_name": model_name,
            "status": result.status,
            "metrics": metrics,
            "test_predictions": test_pts,
            "future_predictions": future_pts,
            "feature_importance": result.feature_importance,
        }
    except Exception as e:
        logger.exception(f"Model {model_name} failed: {e}")
        return {
            "model_name": model_name,
            "status": "FAILED",
            "error": str(e),
            "metrics": {"model_name": model_name, "status": "FAILED", "error": str(e)},
            "test_predictions": [],
            "future_predictions": [],
        }


def _run_models_sync(
    train_s: pd.Series,
    val_s: pd.Series,
    test_s: pd.Series,
    horizon: int,
    models: list[str],
    state: str,
    crop: str,
) -> list[dict[str, Any]]:
    """Train and evaluate models in parallel worker threads so total time is bounded by the slowest model."""
    model_config = {
        "arima_max_p": 2,
        "arima_max_q": 2,
        "arima_max_d": 1,
        "seasonal_period": 7,
        "confidence_level": 0.95,
        "lags": min(14, max(3, len(train_s) // 4)),
        "rf_n_estimators": 60,
        "xgb_n_estimators": 60,
    }

    max_workers = min(len(models), 6)
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {
            executor.submit(
                _evaluate_single_model,
                m,
                model_config,
                train_s,
                val_s,
                test_s,
                horizon,
                state,
                crop,
            ): m
            for m in models
        }
        results = []
        for future in concurrent.futures.as_completed(futures):
            results.append(future.result())

    # Keep original model ordering for clean display
    order_map = {m: i for i, m in enumerate(models)}
    results.sort(key=lambda r: order_map.get(r.get("model_name"), 999))
    return results


@router.post("/predict")
async def predict_prices(
    req: CropPredictRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    State-Level Crop Price Forecasting with Automatic Model Selection.
    Aggregates reporting mandis across the state using documented statistical methods,
    evaluates algorithms in parallel threads to maximize speed and responsiveness,
    and returns selected best model.
    """
    try:
        # Extract and aggregate state-level time series
        state_data = agmarknet_service.get_state_time_series(
            state=req.state,
            crop=req.crop,
            target_price=req.target_price,
        )

        target_series = state_data["series"]
        total_len = len(target_series)
        if total_len < 5:
            raise HTTPException(
                400,
                detail=f"Insufficient historical data ({total_len} daily observations) for {req.state} - {req.crop}."
            )

        # Chronological Train / Val / Test split aligned with forecast horizon
        val_len = min(req.horizon, 14)
        test_len = min(max(req.horizon, 14), 28)
        if total_len <= (val_len + test_len + 5):
            train_len = max(3, int(total_len * req.train_ratio))
            val_len = max(1, int(total_len * 0.15))
            test_len = max(1, total_len - train_len - val_len)
        else:
            train_len = total_len - val_len - test_len

        train_s = target_series.iloc[:train_len]
        val_s = target_series.iloc[train_len:train_len + val_len]
        test_s = target_series.iloc[train_len + val_len:]

        # Run model training asynchronously in thread pool so backend never freezes
        results = await asyncio.to_thread(
            _run_models_sync,
            train_s,
            val_s,
            test_s,
            req.horizon,
            req.models,
            req.state,
            req.crop,
        )

        # Automatic model selection: pick eligible model with lowest validation/test MAE
        completed = [
            r for r in results
            if r.get("status") == "COMPLETED" and r.get("metrics", {}).get("mae") is not None
        ]
        best_model = min(completed, key=lambda r: r["metrics"]["mae"])["model_name"] if completed else None

        # Price trajectory and trend
        current_price = state_data["latest_price"]
        best_r = next((r for r in results if r["model_name"] == best_model), None) if best_model else (completed[0] if completed else None)
        projected_price = None
        pct_change = None
        trend = "Stable"

        if best_r and best_r["future_predictions"]:
            projected_price = float(round(best_r["future_predictions"][-1]["value"], 2))
            if current_price and current_price > 0:
                pct_change = float(round(((projected_price - current_price) / current_price) * 100, 2))
                if pct_change >= 2.0:
                    trend = "Bullish (Rising)"
                elif pct_change <= -2.0:
                    trend = "Bearish (Falling)"
                else:
                    trend = "Stable"

        state_level_disclaimer = (
            f"State-level estimates for {req.state} are aggregated from reported APMC mandi observations "
            f"using robust statistical methods ({state_data['aggregation_method']}). "
            f"These estimates represent prevailing statewide commodity price levels and directional trends, "
            f"not guaranteed prices at individual local markets."
        )

        run_id = str(uuid.uuid4())
        comparison_table = [r["metrics"] for r in results]

        run_record = ForecastRun(
            id=run_id,
            dataset_id=agmarknet_service._metadata.get("filename", "agmarknet"),
            dataset_fingerprint=f"agmarknet-state-{req.state}-{req.crop}",
            target_column=req.target_price,
            date_column="Date",
            models_json=json.dumps(req.models),
            config_json=json.dumps(req.model_dump(), default=str),
            status="COMPLETED",
            progress=100,
            best_model=best_model,
            forecast_horizon=req.horizon,
            results_json=json.dumps({
                "run_id": run_id,
                "crop": req.crop,
                "state": req.state,
                "market": f"State-Level Aggregate ({state_data['mandis_count']} Mandis in {req.state})",
                "target_column": req.target_price,
                "target_label": state_data["target_label"],
                "aggregation_method": state_data["aggregation_method"],
                "reporting_mandis": state_data["reporting_mandis"],
                "mandis_count": state_data["mandis_count"],
                "state_level_disclaimer": state_level_disclaimer,
                "unit": "₹ / quintal",
                "current_price": current_price,
                "projected_price": projected_price,
                "pct_change": pct_change,
                "min_price": state_data.get("min_price"),
                "max_price": state_data.get("max_price"),
                "avg_price": state_data.get("avg_price"),
                "latest_obs_date": state_data.get("latest_obs_date"),
                "historical": state_data["historical"],
                "results": results,
                "comparison_table": comparison_table,
                "best_model": best_model,
            }, default=str),
            completed_at=datetime.now(timezone.utc),
        )
        db.add(run_record)
        await db.commit()

        return {
            "run_id": run_id,
            "crop": req.crop,
            "state": req.state,
            "market": f"State-Level Aggregate ({state_data['mandis_count']} Mandis in {req.state})",
            "target_column": req.target_price,
            "target_label": state_data["target_label"],
            "aggregation_method": state_data["aggregation_method"],
            "reporting_mandis": state_data["reporting_mandis"],
            "mandis_count": state_data["mandis_count"],
            "state_level_disclaimer": state_level_disclaimer,
            "unit": "₹ / quintal",
            "horizon": req.horizon,
            "current_price": current_price,
            "projected_price": projected_price,
            "pct_change": pct_change,
            "trend": trend,
            "min_price": state_data.get("min_price"),
            "max_price": state_data.get("max_price"),
            "avg_price": state_data.get("avg_price"),
            "latest_obs_date": state_data.get("latest_obs_date"),
            "historical": state_data["historical"],
            "results": results,
            "comparison_table": comparison_table,
            "best_model": best_model,
            "status": "COMPLETED",
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Prediction failed: {e}")
        raise HTTPException(500, detail=str(e))

