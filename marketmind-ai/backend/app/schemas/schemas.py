from pydantic import BaseModel, Field
from typing import Any, Optional
from datetime import datetime


# ── Dataset Schemas ──────────────────────────────────────────────────────────

class ColumnInfo(BaseModel):
    name: str
    dtype: str
    non_null_count: int
    null_count: int
    null_pct: float
    unique_count: int
    sample_values: list[Any]
    is_numeric: bool
    is_datetime: bool
    is_candidate_date: bool
    is_candidate_target: bool


class DatasetAnalysis(BaseModel):
    row_count: int
    column_count: int
    columns: list[ColumnInfo]
    detected_date_column: Optional[str]
    detected_target_column: Optional[str]
    detected_frequency: Optional[str]
    date_range: Optional[dict[str, str]]
    missing_dates: int
    duplicate_timestamps: int
    is_sorted: bool
    descriptive_stats: dict[str, Any]
    preview_rows: list[dict[str, Any]]
    fingerprint: str
    warnings: list[str]
    is_agricultural: bool = False
    crop_column: Optional[str] = None
    market_column: Optional[str] = None
    state_column: Optional[str] = None
    available_crops: list[str] = Field(default_factory=list)
    available_markets: list[str] = Field(default_factory=list)
    available_states: list[str] = Field(default_factory=list)


class DatasetResponse(BaseModel):
    id: str
    filename: str
    original_filename: str
    file_size: int
    row_count: int
    column_count: int
    columns: list[str]
    date_column: Optional[str]
    target_column: Optional[str]
    frequency: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DatasetConfigUpdate(BaseModel):
    date_column: str
    target_column: str
    frequency: Optional[str] = None
    feature_columns: list[str] = Field(default_factory=list)


class PreprocessingConfig(BaseModel):
    handle_missing: str = "forward_fill"  # forward_fill | backward_fill | interpolate | drop | mean
    remove_duplicates: bool = True
    sort_by_date: bool = True
    handle_outliers: str = "none"  # none | clip | remove
    outlier_method: str = "iqr"  # iqr | zscore
    outlier_threshold: float = 3.0
    resample_frequency: Optional[str] = None  # D | W | M | Q
    resample_agg: str = "mean"  # mean | last | sum
    log_transform: bool = False


# ── Forecast Schemas ─────────────────────────────────────────────────────────

class ForecastConfig(BaseModel):
    dataset_id: str
    date_column: str
    target_column: str
    feature_columns: list[str] = Field(default_factory=list)
    forecast_horizon: int = Field(30, ge=1, le=365)
    frequency: str = "D"
    train_ratio: float = Field(0.7, ge=0.3, le=0.9)
    val_ratio: float = Field(0.15, ge=0.05, le=0.4)
    models: list[str] = Field(default_factory=lambda: ["naive", "arima", "prophet"])
    confidence_level: float = Field(0.95, ge=0.5, le=0.99)
    preprocessing: PreprocessingConfig = Field(default_factory=PreprocessingConfig)
    # Model-specific overrides
    arima_max_p: int = 5
    arima_max_q: int = 5
    arima_max_d: int = 2
    seasonal_period: Optional[int] = None
    # Agricultural filters
    crop: Optional[str] = None
    market: Optional[str] = None
    state: Optional[str] = None


class AgriOptionsResponse(BaseModel):
    is_agricultural: bool
    crop_column: Optional[str] = None
    market_column: Optional[str] = None
    state_column: Optional[str] = None
    crops: list[str] = Field(default_factory=list)
    markets: list[str] = Field(default_factory=list)
    states: list[str] = Field(default_factory=list)
    selected_crop_stats: Optional[dict[str, Any]] = None


class ModelMetrics(BaseModel):
    model_name: str
    mae: Optional[float] = None
    rmse: Optional[float] = None
    mape: Optional[float] = None
    smape: Optional[float] = None
    wape: Optional[float] = None
    r2: Optional[float] = None
    train_duration_s: Optional[float] = None
    val_mae: Optional[float] = None
    val_rmse: Optional[float] = None
    test_mae: Optional[float] = None
    test_rmse: Optional[float] = None
    status: str = "PENDING"  # PENDING | RUNNING | COMPLETED | FAILED | UNAVAILABLE
    error: Optional[str] = None


class ForecastPoint(BaseModel):
    date: str
    value: Optional[float]
    lower: Optional[float] = None
    upper: Optional[float] = None
    is_forecast: bool = False


class ModelForecastResult(BaseModel):
    model_name: str
    metrics: ModelMetrics
    test_predictions: list[ForecastPoint]
    future_predictions: list[ForecastPoint]
    feature_importance: Optional[dict[str, float]] = None
    diagnostics: Optional[dict[str, Any]] = None


class ForecastRunResponse(BaseModel):
    id: str
    dataset_id: str
    target_column: str
    date_column: str
    status: str
    progress: int
    current_model: Optional[str]
    error_message: Optional[str]
    best_model: Optional[str]
    forecast_horizon: int
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime]

    model_config = {"from_attributes": True}


class ForecastResultsResponse(BaseModel):
    run_id: str
    dataset_id: str
    target_column: str
    historical: list[ForecastPoint]
    results: list[ModelForecastResult]
    best_model: Optional[str]
    comparison_table: list[ModelMetrics]
    crop: Optional[str] = None
    market: Optional[str] = None
    state: Optional[str] = None
    current_price: Optional[float] = None
    mean_price: Optional[float] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    target_label: Optional[str] = None
    aggregation_method: Optional[str] = None
    reporting_mandis: Optional[list[str]] = None
    mandis_count: Optional[int] = None
    state_level_disclaimer: Optional[str] = None
    projected_price: Optional[float] = None
    pct_change: Optional[float] = None
    trend: Optional[str] = None
    unit: Optional[str] = "₹ / quintal"



# ── Error Schema ─────────────────────────────────────────────────────────────

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    code: Optional[str] = None
