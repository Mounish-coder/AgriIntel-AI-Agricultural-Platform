// TypeScript types mirroring backend Pydantic schemas

export interface ColumnInfo {
  name: string;
  dtype: string;
  non_null_count: number;
  null_count: number;
  null_pct: number;
  unique_count: number;
  sample_values: unknown[];
  is_numeric: boolean;
  is_datetime: boolean;
  is_candidate_date: boolean;
  is_candidate_target: boolean;
}

export interface DatasetAnalysis {
  row_count: number;
  column_count: number;
  columns: ColumnInfo[];
  detected_date_column: string | null;
  detected_target_column: string | null;
  detected_frequency: string | null;
  date_range: { start: string; end: string } | null;
  missing_dates: number;
  duplicate_timestamps: number;
  is_sorted: boolean;
  descriptive_stats: Record<string, Record<string, number>>;
  preview_rows: Record<string, unknown>[];
  fingerprint: string;
  warnings: string[];
}

export interface DatasetResponse {
  id: string;
  filename: string;
  original_filename: string;
  file_size: number;
  row_count: number;
  column_count: number;
  columns: string[];
  date_column: string | null;
  target_column: string | null;
  frequency: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface PreprocessingConfig {
  handle_missing: "forward_fill" | "backward_fill" | "interpolate" | "drop" | "mean";
  remove_duplicates: boolean;
  sort_by_date: boolean;
  handle_outliers: "none" | "clip" | "remove";
  outlier_method: "iqr" | "zscore";
  outlier_threshold: number;
  resample_frequency: string | null;
  resample_agg: "mean" | "last" | "sum";
  log_transform: boolean;
}

export interface ForecastConfig {
  dataset_id: string;
  date_column: string;
  target_column: string;
  feature_columns: string[];
  forecast_horizon: number;
  frequency: string;
  train_ratio: number;
  val_ratio: number;
  models: string[];
  confidence_level: number;
  preprocessing: PreprocessingConfig;
  arima_max_p: number;
  arima_max_q: number;
  arima_max_d: number;
  seasonal_period: number | null;
  crop?: string | null;
  market?: string | null;
  state?: string | null;
}

export interface ModelMetrics {
  model_name: string;
  mae: number | null;
  rmse: number | null;
  mape: number | null;
  smape: number | null;
  wape: number | null;
  r2: number | null;
  train_duration_s: number | null;
  val_mae: number | null;
  val_rmse: number | null;
  test_mae: number | null;
  test_rmse: number | null;
  status: string;
  error: string | null;
}

export interface ForecastPoint {
  date: string;
  value: number | null;
  lower: number | null;
  upper: number | null;
  is_forecast: boolean;
}

export interface ModelForecastResult {
  model_name: string;
  metrics: ModelMetrics;
  test_predictions: ForecastPoint[];
  future_predictions: ForecastPoint[];
  feature_importance: Record<string, number> | null;
  diagnostics: Record<string, unknown> | null;
}

export interface ForecastRunResponse {
  id: string;
  dataset_id: string;
  dataset_fingerprint?: string;
  target_column: string;
  date_column: string;
  status: "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";
  progress: number;
  current_model: string | null;
  error_message: string | null;
  best_model: string | null;
  forecast_horizon: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface ForecastResultsResponse {
  run_id: string;
  dataset_id: string;
  target_column: string;
  historical: ForecastPoint[];
  results: ModelForecastResult[];
  best_model: string | null;
  comparison_table: ModelMetrics[];
  crop?: string | null;
  market?: string | null;
  state?: string | null;
  current_price?: number | null;
  mean_price?: number | null;
  min_price?: number | null;
  max_price?: number | null;
  target_label?: string | null;
  aggregation_method?: string | null;
  reporting_mandis?: string[] | null;
  mandis_count?: number | null;
  state_level_disclaimer?: string | null;
  projected_price?: number | null;
  pct_change?: number | null;
  trend?: string | null;
  unit?: string | null;
}

export interface AgriOptions {
  is_agricultural: boolean;
  crop_column: string | null;
  market_column: string | null;
  state_column: string | null;
  crops: string[];
  markets: string[];
  states: string[];
  selected_crop_stats: {
    crop: string;
    total_records: number;
    markets_count: number;
    min_price: number | null;
    max_price: number | null;
    mean_price: number | null;
    latest_price: number | null;
    start_date: string | null;
    end_date: string | null;
  } | null;
}
export interface AgmarknetStatus {
  status: "ready" | "error";
  is_loaded: boolean;
  error?: string;
  searched_directories?: string[];
  metadata?: {
    filename: string;
    file_path: string;
    file_size: number;
    total_records: number;
    date_range: { start: string; end: string } | null;
    column_mapping: Record<string, string>;
    crops_count: number;
    states_count: number;
    districts_count: number;
    markets_count: number;
    has_district: boolean;
    source_files?: string[];
    available_crops: string[];
    available_states: string[];
    available_districts: string[];
    available_markets: string[];
  };
  available_files?: string[];
}

export interface AgmarknetFilters {
  selected_state: string;
  selected_crop: string;
  all_states: string[];
  all_crops: string[];
  available_states: string[];
  available_crops: string[];
  reporting_mandis: string[];
  mandis_count: number;
  total_matching_records: number;
  date_range: { start: string | null; end: string | null };
  price_stats: {
    latest_modal_price: number | null;
    median_modal_price: number | null;
    min_price: number | null;
    max_price: number | null;
    unit: string;
  };
  aggregation_notes?: string;
}

export interface AgmarknetCropStat {
  crop: string;
  records: number;
  min_price: number | null;
  max_price: number | null;
  mean_price: number | null;
}

export interface AgmarknetStateStat {
  state: string;
  records: number;
  crops_count: number;
  avg_price: number | null;
}

export interface AgmarknetAnalysis {
  metadata: {
    filename: string;
    file_path: string;
    file_size: number;
    total_records: number;
    date_range: { start: string; end: string } | null;
    column_mapping: Record<string, string>;
    crops_count: number;
    states_count: number;
    source_files?: string[];
    available_crops: string[];
    available_states: string[];
  };
  crop_distribution: AgmarknetCropStat[];
  state_distribution: AgmarknetStateStat[];
  descriptive_stats: Record<string, Record<string, number>>;
  preview_rows: Record<string, unknown>[];
  display_columns: string[];
}

export interface CropPredictPayload {
  state: string;
  crop: string;
  target_price?: string;
  horizon?: number;
  models?: string[];
  train_ratio?: number;
}

