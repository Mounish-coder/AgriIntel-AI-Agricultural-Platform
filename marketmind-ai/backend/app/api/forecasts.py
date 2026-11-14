"""Forecast training and results API endpoints."""
import json
import uuid
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import logger
from app.database.models import Dataset, ForecastRun
from app.database.session import get_db
from app.forecasting.registry import ALL_MODELS, check_model_availability
from app.schemas.schemas import (
    ForecastConfig,
    ForecastPoint,
    ForecastResultsResponse,
    ForecastRunResponse,
    ModelForecastResult,
    ModelMetrics,
)
from app.services.forecast_service import _run_models_sync

router = APIRouter(prefix="/api/forecasts", tags=["forecasts"])

# Thread pool for background model training
_executor = ThreadPoolExecutor(max_workers=2)


@router.post("/train", response_model=ForecastRunResponse, status_code=status.HTTP_202_ACCEPTED)
async def start_training(
    config: ForecastConfig,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Queue a new forecast training run."""
    dataset = await db.get(Dataset, config.dataset_id)
    if not dataset:
        raise HTTPException(404, "Dataset not found.")
    if not dataset.file_path or not Path(dataset.file_path).exists():
        raise HTTPException(400, "Dataset file missing. Re-upload.")

    # Validate model names
    unknown = [m for m in config.models if m not in ALL_MODELS]
    if unknown:
        raise HTTPException(400, f"Unknown models: {unknown}. Available: {ALL_MODELS}")

    run = ForecastRun(
        id=str(uuid.uuid4()),
        dataset_id=dataset.id,
        dataset_fingerprint=dataset.fingerprint,
        target_column=config.target_column,
        date_column=config.date_column,
        models_json=json.dumps(config.models),
        config_json=config.model_dump_json(),
        status="QUEUED",
        forecast_horizon=config.forecast_horizon,
    )
    db.add(run)
    await db.commit()
    await db.refresh(run)

    # Submit to thread pool (non-blocking)
    import asyncio
    loop = asyncio.get_event_loop()
    loop.run_in_executor(
        _executor,
        _run_models_sync,
        run.id,
        json.loads(run.config_json),
        dataset.file_path,
    )

    logger.info(f"Forecast run {run.id} queued for dataset {dataset.id}")
    return ForecastRunResponse.model_validate(run)


@router.get("/{run_id}/status", response_model=ForecastRunResponse)
async def get_run_status(run_id: str, db: AsyncSession = Depends(get_db)):
    run = await db.get(ForecastRun, run_id)
    if not run:
        raise HTTPException(404, "Forecast run not found.")
    # Refresh from DB to get latest progress
    await db.refresh(run)
    return ForecastRunResponse.model_validate(run)


@router.get("/{run_id}/results", response_model=ForecastResultsResponse)
async def get_run_results(run_id: str, db: AsyncSession = Depends(get_db)):
    run = await db.get(ForecastRun, run_id)
    if not run:
        raise HTTPException(404, "Forecast run not found.")
    if run.status not in ("COMPLETED",):
        raise HTTPException(400, f"Run is not completed yet. Status: {run.status}")
    if not run.results_json:
        raise HTTPException(500, "Results missing despite COMPLETED status.")

    payload = json.loads(run.results_json)

    # Build historical
    historical = [
        ForecastPoint(date=r["date"], value=r["value"], is_forecast=False)
        for r in payload.get("historical", [])
    ]

    # Build per-model results
    model_results = []
    comparison = []
    for r in payload.get("results", []):
        status_str = r.get("status", "FAILED")

        def _fp(rows, is_forecast):
            pts = []
            for row in rows:
                if isinstance(row, dict):
                    d = row.get("date")
                    v = row.get("value")
                    lo = row.get("lower")
                    hi = row.get("upper")
                elif len(row) >= 4:
                    d, v, lo, hi = row[0], row[1], row[2], row[3]
                else:
                    d, v, lo, hi = row[0], row[1], None, None
                pts.append(ForecastPoint(
                    date=str(d)[:10],
                    value=float(v) if v is not None else None,
                    lower=float(lo) if lo is not None else None,
                    upper=float(hi) if hi is not None else None,
                    is_forecast=is_forecast,
                ))
            return pts

        m_dict = r.get("metrics") if isinstance(r.get("metrics"), dict) else {}
        metrics = ModelMetrics(
            model_name=r["model_name"],
            status=m_dict.get("status", status_str),
            error=m_dict.get("error", r.get("error")),
            mae=m_dict.get("mae", r.get("test_mae")),
            rmse=m_dict.get("rmse", r.get("test_rmse")),
            mape=m_dict.get("mape", r.get("test_mape")),
            smape=m_dict.get("smape", r.get("test_smape")),
            wape=m_dict.get("wape", r.get("test_wape")),
            r2=m_dict.get("r2", r.get("test_r2")),
            train_duration_s=m_dict.get("train_duration_s", r.get("train_duration_s")),
            val_mae=m_dict.get("val_mae", r.get("val_mae")),
            val_rmse=m_dict.get("val_rmse", r.get("val_rmse")),
            test_mae=m_dict.get("test_mae", r.get("test_mae")),
            test_rmse=m_dict.get("test_rmse", r.get("test_rmse")),
        )
        comparison.append(metrics)

        model_results.append(ModelForecastResult(
            model_name=r["model_name"],
            metrics=metrics,
            test_predictions=_fp(r.get("test_predictions", []), False),
            future_predictions=_fp(r.get("future_predictions", []), True),
            feature_importance=r.get("feature_importance"),
        ))

    return ForecastResultsResponse(
        run_id=run_id,
        dataset_id=run.dataset_id,
        target_column=run.target_column,
        historical=historical,
        results=model_results,
        best_model=payload.get("best_model"),
        comparison_table=comparison,
        crop=payload.get("crop"),
        market=payload.get("market"),
        state=payload.get("state"),
        current_price=payload.get("current_price"),
        mean_price=payload.get("mean_price"),
        min_price=payload.get("min_price"),
        max_price=payload.get("max_price"),
        target_label=payload.get("target_label"),
        aggregation_method=payload.get("aggregation_method"),
        reporting_mandis=payload.get("reporting_mandis"),
        mandis_count=payload.get("mandis_count"),
        state_level_disclaimer=payload.get("state_level_disclaimer"),
        projected_price=payload.get("projected_price"),
        pct_change=payload.get("pct_change"),
        trend=payload.get("trend"),
        unit=payload.get("unit", "₹ / quintal"),
    )



@router.get("/{run_id}/comparison")
async def get_comparison(run_id: str, db: AsyncSession = Depends(get_db)):
    """Return a flat metrics comparison table."""
    run = await db.get(ForecastRun, run_id)
    if not run or not run.results_json:
        raise HTTPException(404, "Results not available.")
    payload = json.loads(run.results_json)
    rows = []
    for r in payload.get("results", []):
        rows.append({
            "model": r["model_name"],
            "status": r.get("status"),
            "mae": r.get("test_mae"),
            "rmse": r.get("test_rmse"),
            "mape": r.get("test_mape"),
            "smape": r.get("test_smape"),
            "wape": r.get("test_wape"),
            "r2": r.get("test_r2"),
            "val_mae": r.get("val_mae"),
            "train_s": r.get("train_duration_s"),
            "error": r.get("error"),
        })
    return {"run_id": run_id, "best_model": payload.get("best_model"), "models": rows}
