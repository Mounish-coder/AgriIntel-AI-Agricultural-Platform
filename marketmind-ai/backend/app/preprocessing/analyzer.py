"""
Dataset analysis and preprocessing service.
Handles file loading, column detection, EDA, and preprocessing pipeline.
"""
import hashlib
import json
import re
from pathlib import Path
from typing import Any, Optional

import numpy as np
import pandas as pd

from app.schemas.schemas import (
    ColumnInfo,
    DatasetAnalysis,
    PreprocessingConfig,
)

# Patterns that suggest a date column
DATE_KEYWORDS = re.compile(
    r"date|time|day|month|year|period|week|dt|timestamp|fecha|datum",
    re.IGNORECASE,
)
# Patterns that suggest a price/target column
PRICE_KEYWORDS = re.compile(
    r"price|close|open|high|low|value|rate|cost|amount|revenue|sales|"
    r"return|yield|index|avg|average|mean|median|adj|adjusted",
    re.IGNORECASE,
)


def compute_fingerprint(path: Path) -> str:
    sha256 = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            sha256.update(chunk)
    return sha256.hexdigest()


def load_dataframe(path: Path) -> pd.DataFrame:
    suffix = path.suffix.lower()
    if suffix == ".csv":
        # Try common encodings
        for enc in ("utf-8", "latin-1", "cp1252"):
            try:
                return pd.read_csv(path, encoding=enc)
            except UnicodeDecodeError:
                continue
        raise ValueError("Could not decode CSV file with common encodings.")
    elif suffix in (".xlsx", ".xls"):
        return pd.read_excel(path)
    else:
        raise ValueError(f"Unsupported file type: {suffix}")


def _try_parse_date_series(series: pd.Series) -> Optional[pd.Series]:
    """Attempt to parse a series as datetime; return None on failure."""
    if pd.api.types.is_datetime64_any_dtype(series):
        return series
    if series.dtype == object:
        sample = series.dropna().head(20)
        if len(sample) == 0:
            return None
        try:
            sample_parsed = pd.to_datetime(sample, errors="coerce")
            if sample_parsed.isna().mean() > 0.3:
                return None
            parsed = pd.to_datetime(series, errors="coerce")
            if parsed.notna().mean() >= 0.8:
                return parsed
        except Exception:
            pass
    return None


def _infer_frequency(date_series: pd.Series) -> Optional[str]:
    """Infer the dominant frequency from a sorted date series."""
    try:
        clean = date_series.dropna().sort_values()
        if len(clean) < 3:
            return None
        diffs = clean.diff().dropna()
        median_diff = diffs.median()
        days = median_diff.days if hasattr(median_diff, "days") else float(median_diff) / 86400e9
        if days <= 1.5:
            return "D"
        elif days <= 8:
            return "W"
        elif days <= 35:
            return "M"
        elif days <= 100:
            return "Q"
        else:
            return "A"
    except Exception:
        return None


def analyse_dataframe(df: pd.DataFrame, fingerprint: str) -> DatasetAnalysis:
    warnings: list[str] = []
    columns: list[ColumnInfo] = []

    detected_date_col: Optional[str] = None
    detected_target_col: Optional[str] = None
    date_series_parsed: Optional[pd.Series] = None

    # ── Per-column analysis ──────────────────────────────────────────────────
    for col in df.columns:
        series = df[col]
        is_numeric = pd.api.types.is_numeric_dtype(series)
        is_datetime = pd.api.types.is_datetime64_any_dtype(series)
        null_count = int(series.isna().sum())
        non_null = len(series) - null_count

        parsed_dates = _try_parse_date_series(series)
        is_candidate_date = (parsed_dates is not None) or bool(DATE_KEYWORDS.search(col))
        is_candidate_target = is_numeric and not is_candidate_date and bool(PRICE_KEYWORDS.search(col))

        sample = series.dropna().head(5).tolist()
        sample = [str(v) if not isinstance(v, (int, float, bool)) else v for v in sample]

        columns.append(
            ColumnInfo(
                name=col,
                dtype=str(series.dtype),
                non_null_count=non_null,
                null_count=null_count,
                null_pct=round(null_count / len(series) * 100, 2) if len(series) > 0 else 0.0,
                unique_count=int(series.nunique()),
                sample_values=sample,
                is_numeric=is_numeric,
                is_datetime=is_datetime,
                is_candidate_date=is_candidate_date,
                is_candidate_target=is_candidate_target,
            )
        )

        # Auto-detect date column (first strong candidate)
        if detected_date_col is None and is_candidate_date and parsed_dates is not None:
            detected_date_col = col
            date_series_parsed = parsed_dates

        # Auto-detect target column (first strong numeric candidate)
        if detected_target_col is None and is_candidate_target:
            detected_target_col = col

    # ── Date-quality checks ──────────────────────────────────────────────────
    missing_dates = 0
    duplicate_timestamps = 0
    is_sorted = True
    date_range: Optional[dict] = None
    detected_frequency: Optional[str] = None

    if date_series_parsed is not None:
        clean_dates = date_series_parsed.dropna().sort_values()
        date_range = {
            "start": str(clean_dates.iloc[0].date()),
            "end": str(clean_dates.iloc[-1].date()),
        }
        detected_frequency = _infer_frequency(clean_dates)
        duplicate_timestamps = int(date_series_parsed.duplicated().sum())
        if duplicate_timestamps > 0:
            warnings.append(f"{duplicate_timestamps} duplicate timestamps found.")

        # Check sort order
        is_sorted = bool(date_series_parsed.dropna().is_monotonic_increasing)
        if not is_sorted:
            warnings.append("Dataset is not sorted chronologically.")

        # Estimate missing dates
        if detected_frequency == "D" and len(clean_dates) >= 2:
            expected = pd.date_range(clean_dates.iloc[0], clean_dates.iloc[-1], freq="D")
            missing_dates = max(0, len(expected) - len(clean_dates))
            if missing_dates > 0:
                warnings.append(f"~{missing_dates} missing calendar dates detected.")
    else:
        warnings.append("No date column could be automatically detected. Please select it manually.")

    if detected_target_col is None:
        warnings.append("No price/target column could be automatically detected. Please select it manually.")

    # ── Descriptive stats for numeric columns ─────────────────────────────────
    numeric_df = df.select_dtypes(include="number")
    desc: dict[str, Any] = {}
    if not numeric_df.empty:
        stats = numeric_df.describe().to_dict()
        for col_name, col_stats in stats.items():
            desc[col_name] = {k: (round(v, 4) if isinstance(v, float) else v) for k, v in col_stats.items()}

    # ── Agricultural detection ────────────────────────────────────────────────
    crop_col: Optional[str] = None
    market_col: Optional[str] = None
    state_col: Optional[str] = None

    for col in df.columns:
        clower = col.strip().lower()
        if clower in ("crop", "commodity", "crop_name", "commodity_name", "produce", "item"):
            crop_col = col
        elif clower in ("market", "mandi", "apmc", "center", "centre", "district", "market_name"):
            market_col = col
        elif clower in ("state", "province", "region"):
            state_col = col

    available_crops = []
    if crop_col and crop_col in df.columns:
        available_crops = sorted([str(x) for x in df[crop_col].dropna().unique().tolist() if str(x).strip() and str(x).lower() != "nan"])

    available_markets = []
    if market_col and market_col in df.columns:
        available_markets = sorted([str(x) for x in df[market_col].dropna().unique().tolist() if str(x).strip() and str(x).lower() != "nan"])

    available_states = []
    if state_col and state_col in df.columns:
        available_states = sorted([str(x) for x in df[state_col].dropna().unique().tolist() if str(x).strip() and str(x).lower() != "nan"])

    is_agricultural = bool(crop_col or (market_col and ("price" in " ".join(df.columns).lower())))

    # Priority for agricultural modal price
    for p_cand in ("Modal_Price", "modal_price", "Modal Price", "Price", "price", "Min_Price", "Max_Price"):
        if p_cand in df.columns:
            detected_target_col = p_cand
            break

    # Priority for agricultural date
    for d_cand in ("Arrival_Date", "arrival_date", "Date", "date"):
        if d_cand in df.columns:
            detected_date_col = d_cand
            break

    # ── Preview ──────────────────────────────────────────────────────────────
    preview = df.head(10).where(pd.notna(df), None).to_dict(orient="records")

    return DatasetAnalysis(
        row_count=len(df),
        column_count=len(df.columns),
        columns=columns,
        detected_date_column=detected_date_col,
        detected_target_column=detected_target_col,
        detected_frequency=detected_frequency,
        date_range=date_range,
        missing_dates=missing_dates,
        duplicate_timestamps=duplicate_timestamps,
        is_sorted=is_sorted,
        descriptive_stats=desc,
        preview_rows=preview,
        fingerprint=fingerprint,
        warnings=warnings,
        is_agricultural=is_agricultural,
        crop_column=crop_col,
        market_column=market_col,
        state_column=state_col,
        available_crops=available_crops,
        available_markets=available_markets,
        available_states=available_states,
    )


def preprocess_dataframe(
    df: pd.DataFrame,
    date_column: str,
    target_column: str,
    config: PreprocessingConfig,
    feature_columns: Optional[list[str]] = None,
    crop: Optional[str] = None,
    market: Optional[str] = None,
    state: Optional[str] = None,
    crop_column: Optional[str] = None,
    market_column: Optional[str] = None,
    state_column: Optional[str] = None,
) -> pd.DataFrame:
    """
    Apply preprocessing pipeline. Never modifies the original df in place.
    Returns a clean copy suitable for modelling.
    """
    df = df.copy()

    # Find agricultural columns if not provided
    if not crop_column:
        for c in df.columns:
            if c.strip().lower() in ("crop", "commodity", "crop_name", "commodity_name", "item", "produce"):
                crop_column = c
                break
    if not market_column:
        for c in df.columns:
            if c.strip().lower() in ("market", "mandi", "apmc", "district", "center", "centre"):
                market_column = c
                break
    if not state_column:
        for c in df.columns:
            if c.strip().lower() in ("state", "province", "region"):
                state_column = c
                break

    # Apply agricultural filters
    if crop and crop_column and crop_column in df.columns:
        df = df[df[crop_column].astype(str).str.strip().str.lower() == str(crop).strip().lower()]

    if market and market not in ("All", "All Markets", "") and market_column and market_column in df.columns:
        df = df[df[market_column].astype(str).str.strip().str.lower() == str(market).strip().lower()]

    if state and state not in ("All", "All States", "") and state_column and state_column in df.columns:
        df = df[df[state_column].astype(str).str.strip().str.lower() == str(state).strip().lower()]

    # Parse date column
    df[date_column] = pd.to_datetime(df[date_column], infer_datetime_format=True, errors="coerce")
    invalid_dates = df[date_column].isna().sum()
    if invalid_dates > 0:
        df = df.dropna(subset=[date_column])

    # Convert target to numeric
    df[target_column] = pd.to_numeric(df[target_column], errors="coerce")
    df = df.dropna(subset=[target_column])

    # If multiple entries exist per date, aggregate them by mean
    feat_cols = [c for c in (feature_columns or []) if c in df.columns and pd.api.types.is_numeric_dtype(df[c])]
    agg_dict = {target_column: "mean"}
    for f in feat_cols:
        agg_dict[f] = "mean"

    # Group by date to produce clean 1-row-per-timestamp time-series
    if df[date_column].duplicated().any():
        df = df.groupby(date_column).agg(agg_dict).reset_index()

    # Sort
    if config.sort_by_date:
        df = df.sort_values(date_column).reset_index(drop=True)

    # Remove duplicates (keep last observation per timestamp)
    if config.remove_duplicates:
        df = df.drop_duplicates(subset=[date_column], keep="last")

    df = df.set_index(date_column)

    # Select relevant columns
    keep_cols = [target_column] + feat_cols
    df = df[keep_cols]

    # Handle missing values
    method = config.handle_missing
    if method == "forward_fill":
        df = df.ffill()
    elif method == "backward_fill":
        df = df.bfill()
    elif method == "interpolate":
        df = df.interpolate(method="time")
    elif method == "mean":
        df = df.fillna(df.mean(numeric_only=True))
    elif method == "drop":
        df = df.dropna(subset=[target_column])

    # Resample
    if config.resample_frequency:
        agg_fn = config.resample_agg if config.resample_agg in ("sum", "mean", "last") else "mean"
        df = df.resample(config.resample_frequency).agg(agg_fn)
        df = df.dropna(subset=[target_column])

    # Outlier handling
    if config.handle_outliers != "none":
        col = df[target_column]
        if config.outlier_method == "iqr":
            q1, q3 = col.quantile(0.25), col.quantile(0.75)
            iqr = q3 - q1
            lower = q1 - config.outlier_threshold * iqr
            upper = q3 + config.outlier_threshold * iqr
        else:  # zscore
            mean, std = col.mean(), col.std()
            lower = mean - config.outlier_threshold * std
            upper = mean + config.outlier_threshold * std

        if config.handle_outliers == "clip":
            df[target_column] = col.clip(lower, upper)
        elif config.handle_outliers == "remove":
            df = df[(col >= lower) & (col <= upper)]

    # Log transform
    if config.log_transform:
        if (df[target_column] <= 0).any():
            df[target_column] = np.log1p(df[target_column].clip(lower=0))
        else:
            df[target_column] = np.log(df[target_column])

    return df
