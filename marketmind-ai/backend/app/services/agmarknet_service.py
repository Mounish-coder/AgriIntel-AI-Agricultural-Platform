"""
AgriIntel AGMARKNET Data Service
Handles automatic loading, caching, filtering, and time-series extraction
from existing AGMARKNET agricultural market price datasets.

ROOT CAUSE FIX: Real AGMARKNET year files (2024.csv, 2025.csv, 2026.csv)
are now loaded and combined first. sample_agriintel_data.csv is NOT used
as a silent fallback — if no real data is found, an explicit error is raised.
"""
import os
from pathlib import Path
from typing import Optional, Any
import threading
import pandas as pd
import numpy as np

from app.core.logging import logger

# Directories to search for AGMARKNET CSV files
SEARCH_DIRS = [
    Path(r"c:\Users\Mounish\.gemini\antigravity\scratch\AgriIntel\data\uploads"),
    Path("./data/uploads"),
    Path("../data/uploads"),
    Path("../../data/uploads"),
    Path("data/uploads"),
]

# Cache filenames for high-performance instant loading
CACHE_PARQUET_FILE = "agmarknet_cache.parquet"
CACHE_META_FILE = "agmarknet_cache_meta.json"

# Real AGMARKNET year files — these take ABSOLUTE priority
REAL_AGMARKNET_FILES = ["2024.csv", "2025.csv", "2026.csv"]

# Sample/synthetic file — used ONLY if explicitly requested; never as silent fallback
SAMPLE_FILE = "sample_agriintel_data.csv"

# Columns to load from real AGMARKNET CSVs (skip Variety, Grade, Commodity_Code)
AGMARKNET_USECOLS = [
    "State", "District", "Market", "Commodity",
    "Arrival_Date", "Min_Price", "Max_Price", "Modal_Price"
]

# Memory-efficient dtypes for real AGMARKNET data
AGMARKNET_DTYPES = {
    "State": "category",
    "District": "category",
    "Market": "category",
    "Commodity": "category",
    "Min_Price": "float32",
    "Max_Price": "float32",
    "Modal_Price": "float32",
}


class AgmarknetDataService:
    def __init__(self):
        self._lock = threading.Lock()
        self._df: Optional[pd.DataFrame] = None
        self._active_files: list[str] = []
        self._metadata: dict[str, Any] = {}
        self._column_mapping: dict[str, str] = {}
        self._load_error: Optional[str] = None

    @staticmethod
    def _match_category(series: pd.Series, target: Optional[str]) -> Optional[Any]:
        """Fast case-insensitive category/value matcher without stringifying entire column."""
        if not target or str(target).strip() in ("All", "All States", "All Crops", ""):
            return None
        target_lower = str(target).strip().lower()
        if hasattr(series, "cat") and hasattr(series.cat, "categories"):
            for cat in series.cat.categories:
                if str(cat).strip().lower() == target_lower:
                    return cat
        else:
            for val in series.dropna().unique():
                if str(val).strip().lower() == target_lower:
                    return val
        return None

    # ── File Discovery ────────────────────────────────────────────────────────

    def _find_files_in_dirs(self, names: list[str]) -> list[Path]:
        """Return resolved paths for files matching `names`, found in SEARCH_DIRS."""
        found: list[Path] = []
        seen: set[str] = set()
        for d in SEARCH_DIRS:
            if not d.exists():
                continue
            for name in names:
                p = d / name
                if p.exists() and name not in seen:
                    seen.add(name)
                    found.append(p.resolve())
        return found

    def _find_all_csvs(self) -> list[Path]:
        """Return all CSV files found in SEARCH_DIRS (for status listing)."""
        found: list[Path] = []
        seen: set[str] = set()
        for d in SEARCH_DIRS:
            if not d.exists():
                continue
            for f in sorted(d.glob("*.csv")):
                if f.name not in seen:
                    seen.add(f.name)
                    found.append(f.resolve())
        return found

    # ── CSV Loading ───────────────────────────────────────────────────────────

    def _load_real_agmarknet_csv(self, path: Path) -> pd.DataFrame:
        """Load a real AGMARKNET year CSV (2024/2025/2026) with memory-efficient dtypes."""
        # Determine which usecols are actually present in this file
        header = pd.read_csv(path, nrows=0, encoding="utf-8").columns.tolist()
        available_cols = [c for c in AGMARKNET_USECOLS if c in header]
        dtypes = {k: v for k, v in AGMARKNET_DTYPES.items() if k in available_cols}

        logger.info(f"Loading {path.name} ({path.stat().st_size / 1e6:.1f} MB, cols: {available_cols})...")
        try:
            df = pd.read_csv(
                path,
                usecols=available_cols,
                dtype=dtypes,
                encoding="utf-8",
                low_memory=False,
            )
        except UnicodeDecodeError:
            df = pd.read_csv(
                path,
                usecols=available_cols,
                dtype=dtypes,
                encoding="latin-1",
                low_memory=False,
            )

        # Parse Arrival_Date
        if "Arrival_Date" in df.columns:
            df["_parsed_date"] = pd.to_datetime(df["Arrival_Date"], errors="coerce")
            df = df.dropna(subset=["_parsed_date"])

        logger.info(f"  → {len(df):,} records loaded from {path.name}")
        return df

    def _build_column_mapping_real(self, df: pd.DataFrame) -> dict[str, str]:
        """Build column mapping for real AGMARKNET format."""
        return {
            "crop": "Commodity",
            "state": "State",
            "district": "District",
            "market": "Market",
            "date": "Arrival_Date",
            "modal_price": "Modal_Price",
            "min_price": "Min_Price",
            "max_price": "Max_Price",
        }

    def _load_generic_csv(self, path: Path) -> tuple[pd.DataFrame, dict[str, str]]:
        """Load any CSV with automatic column detection (generic / sample format)."""
        try:
            df = pd.read_csv(path, encoding="utf-8", low_memory=False)
        except UnicodeDecodeError:
            df = pd.read_csv(path, encoding="latin-1", low_memory=False)

        col_map: dict[str, str] = {}
        for col in df.columns:
            cl = col.strip().lower()
            if cl in ("crop", "commodity", "crop_name", "commodity_name", "item"):
                col_map["crop"] = col
            elif cl in ("state", "province"):
                col_map["state"] = col
            elif cl in ("district", "district_name", "dist"):
                col_map["district"] = col
            elif cl in ("market", "mandi", "apmc", "center", "centre", "market_name"):
                col_map["market"] = col
            elif cl in ("date", "arrival_date", "dt", "timestamp"):
                col_map["date"] = col
            elif cl in ("modal_price", "modal price", "modalprice"):
                col_map["modal_price"] = col
            elif cl in ("min_price", "min price", "minprice"):
                col_map["min_price"] = col
            elif cl in ("max_price", "max price", "maxprice"):
                col_map["max_price"] = col

        if "date" not in col_map:
            for col in df.columns:
                if "date" in col.lower():
                    col_map["date"] = col
                    break
        if "modal_price" not in col_map:
            for col in df.columns:
                if "modal" in col.lower() or "price" in col.lower():
                    col_map["modal_price"] = col
                    break

        date_col = col_map.get("date")
        if date_col and date_col in df.columns:
            df["_parsed_date"] = pd.to_datetime(df[date_col], errors="coerce")
            df = df.dropna(subset=["_parsed_date"])
        else:
            raise ValueError(f"No valid date column detected in {path.name}.")

        return df, col_map

    # ── Main Load Entry Point ─────────────────────────────────────────────────

    def load_dataset(self, specific_path: Optional[str] = None) -> pd.DataFrame:
        with self._lock:
            if self._df is not None and not specific_path:
                return self._df

            # ── 1. If a specific path was requested, load it directly ────────
            if specific_path:
                p = Path(specific_path)
                if not p.exists():
                    raise FileNotFoundError(f"Specified dataset path not found: {specific_path}")
                df, col_map = self._load_generic_csv(p)
                self._finalize(df, col_map, [str(p.resolve())], p.name)
                return self._df

            # ── 2. Check for high-performance precomputed Parquet cache ─────
            cache_paths = self._find_files_in_dirs([CACHE_PARQUET_FILE])
            real_csv_paths = self._find_files_in_dirs(REAL_AGMARKNET_FILES)

            cache_valid = False
            chosen_cache: Optional[Path] = None
            if cache_paths:
                chosen_cache = cache_paths[0]
                cache_mtime = chosen_cache.stat().st_mtime
                # Check if any source CSV is newer than the cache
                csvs_newer = any(p.stat().st_mtime > cache_mtime for p in real_csv_paths)
                if not csvs_newer and chosen_cache.stat().st_size > 1000:
                    cache_valid = True

            if cache_valid and chosen_cache:
                logger.info(f"Loading AGMARKNET dataset from high-performance cache: {chosen_cache.name}...")
                try:
                    df = pd.read_parquet(chosen_cache, engine="pyarrow")
                    for col in ["State", "District", "Market", "Commodity"]:
                        if col in df.columns and not isinstance(df[col].dtype, pd.CategoricalDtype):
                            df[col] = df[col].astype("category")

                    col_map = self._build_column_mapping_real(df)
                    if "_date_str" not in df.columns and "_parsed_date" in df.columns:
                        df["_date_str"] = df["_parsed_date"].dt.strftime("%Y-%m-%d")

                    meta_paths = self._find_files_in_dirs([CACHE_META_FILE])
                    if meta_paths:
                        import json
                        with open(meta_paths[0], "r", encoding="utf-8") as f:
                            self._metadata = json.load(f)
                        self._df = df
                        self._active_files = [str(p) for p in real_csv_paths] or [str(chosen_cache)]
                        self._column_mapping = col_map
                        self._load_error = None
                        logger.info(
                            f"AGMARKNET dataset ready from cache: {self._metadata.get('filename')} | "
                            f"{len(df):,} records | {self._metadata.get('states_count')} states | "
                            f"{self._metadata.get('crops_count')} crops"
                        )
                        return self._df
                    else:
                        self._finalize(df, col_map, [str(p) for p in real_csv_paths] or [str(chosen_cache)], chosen_cache.name)
                        return self._df
                except Exception as e:
                    logger.warning(f"Could not load parquet cache ({e}); falling back to CSV parsing...")

            # ── 3. Look for real AGMARKNET year files ────────────────────────
            real_paths = real_csv_paths

            if real_paths:
                logger.info(f"Found {len(real_paths)} real AGMARKNET file(s): {[p.name for p in real_paths]}")
                frames: list[pd.DataFrame] = []
                loaded_names: list[str] = []
                for path in sorted(real_paths, key=lambda p: p.name):
                    try:
                        df_part = self._load_real_agmarknet_csv(path)
                        frames.append(df_part)
                        loaded_names.append(path.name)
                    except Exception as e:
                        logger.warning(f"Could not load {path.name}: {e}")

                if frames:
                    combined = pd.concat(frames, ignore_index=True)
                    # Drop duplicate rows (same state/commodity/date/market)
                    combined = combined.drop_duplicates()
                    for col in ["State", "District", "Market", "Commodity"]:
                        if col in combined.columns and not isinstance(combined[col].dtype, pd.CategoricalDtype):
                            combined[col] = combined[col].astype("category")

                    logger.info(f"Combined {len(frames)} file(s) → {len(combined):,} total records")

                    col_map = self._build_column_mapping_real(combined)
                    combined["_date_str"] = combined["_parsed_date"].dt.strftime("%Y-%m-%d")
                    self._finalize(combined, col_map, [str(p) for p in real_paths], "+".join(loaded_names))

                    # Persist cache for subsequent instant boots
                    try:
                        cache_save_path = real_paths[0].parent / CACHE_PARQUET_FILE
                        meta_save_path = real_paths[0].parent / CACHE_META_FILE
                        combined.to_parquet(cache_save_path, engine="pyarrow", index=False)
                        import json
                        with open(meta_save_path, "w", encoding="utf-8") as mf:
                            json.dump(self._metadata, mf, indent=2)
                        logger.info(f"Persisted high-performance cache to {cache_save_path.name}")
                    except Exception as ce:
                        logger.warning(f"Could not persist cache: {ce}")

                    return self._df

            # ── 4. No real AGMARKNET data found — raise explicit error ────────
            searched = [str(d.resolve()) for d in SEARCH_DIRS if d.exists()]
            all_csvs = [p.name for p in self._find_all_csvs()]
            err_msg = (
                f"No real AGMARKNET dataset found. "
                f"Expected files: {REAL_AGMARKNET_FILES}. "
                f"Searched: {searched}. "
                f"Available CSVs: {all_csvs}. "
                f"Place your AGMARKNET CSV files (2024.csv, 2025.csv, 2026.csv) in the data/uploads folder."
            )
            self._load_error = err_msg
            logger.error(err_msg)
            raise FileNotFoundError(err_msg)

    def _finalize(
        self,
        df: pd.DataFrame,
        col_map: dict[str, str],
        file_paths: list[str],
        display_name: str,
    ) -> None:
        """Compute metadata and store the loaded DataFrame."""
        if "_date_str" not in df.columns:
            df["_date_str"] = df["_parsed_date"].dt.strftime("%Y-%m-%d")

        crop_col = col_map.get("crop")
        state_col = col_map.get("state")
        district_col = col_map.get("district")
        market_col = col_map.get("market")

        def unique_sorted(series) -> list[str]:
            if series is None:
                return []
            vals = series.dropna().unique().tolist()
            return sorted([str(v).strip() for v in vals if str(v).strip() and str(v).lower() != "nan"])

        crops = unique_sorted(df[crop_col] if crop_col and crop_col in df.columns else None)
        states = unique_sorted(df[state_col] if state_col and state_col in df.columns else None)
        districts = unique_sorted(df[district_col] if district_col and district_col in df.columns else None)
        markets = unique_sorted(df[market_col] if market_col and market_col in df.columns else None)

        min_date = df["_date_str"].min()
        max_date = df["_date_str"].max()

        # Total file size
        total_size = sum(Path(fp).stat().st_size for fp in file_paths if Path(fp).exists())

        self._df = df
        self._active_files = file_paths
        self._column_mapping = col_map
        self._load_error = None
        self._metadata = {
            "filename": display_name,
            "file_path": file_paths[0] if len(file_paths) == 1 else f"[{len(file_paths)} files combined]",
            "file_size": total_size,
            "source_files": [Path(fp).name for fp in file_paths],
            "total_records": len(df),
            "date_range": {"start": min_date, "end": max_date},
            "column_mapping": col_map,
            "columns": [c for c in df.columns if not c.startswith("_")],
            "crops_count": len(crops),
            "states_count": len(states),
            "districts_count": len(districts),
            "markets_count": len(markets),
            "has_district": bool(district_col and district_col in df.columns),
            "available_crops": crops,
            "available_states": states,
            "available_districts": districts,
            "available_markets": markets,
        }
        logger.info(
            f"AGMARKNET dataset ready: {display_name} | "
            f"{len(df):,} records | {len(states)} states | {len(crops)} crops | "
            f"{min_date} → {max_date}"
        )

    # ── Status ────────────────────────────────────────────────────────────────

    def get_status(self) -> dict[str, Any]:
        try:
            if self._df is None:
                self.load_dataset()
            return {
                "status": "ready",
                "is_loaded": True,
                "metadata": self._metadata,
                "available_files": [p.name for p in self._find_all_csvs()],
                "searched_directories": [str(d.resolve()) for d in SEARCH_DIRS if d.exists()],
            }
        except Exception as e:
            return {
                "status": "error",
                "is_loaded": False,
                "error": str(e),
                "searched_directories": [str(d.resolve()) for d in SEARCH_DIRS],
                "available_files": [p.name for p in self._find_all_csvs()],
            }

    # ── Filters ───────────────────────────────────────────────────────────────

    def get_filters(
        self,
        crop: Optional[str] = None,
        state: Optional[str] = None,
        district: Optional[str] = None,
    ) -> dict[str, Any]:
        df = self.load_dataset()
        cmap = self._column_mapping
        crop_col = cmap.get("crop")
        state_col = cmap.get("state")
        modal_col = cmap.get("modal_price", "Modal_Price")
        min_col = cmap.get("min_price", "Min_Price")
        max_col = cmap.get("max_price", "Max_Price")
        market_col = cmap.get("market")

        all_states = self._metadata.get("available_states", [])
        all_crops = self._metadata.get("available_crops", [])

        selected_state = state if (state and state not in ("All", "All States", "")) else (all_states[0] if all_states else None)
        selected_crop = crop if (crop and crop not in ("All", "All Crops", "")) else (all_crops[0] if all_crops else None)

        # Fast filter by state using category matching
        state_filtered = df
        if selected_state and state_col and state_col in state_filtered.columns:
            matched_state = self._match_category(state_filtered[state_col], selected_state)
            if matched_state is not None:
                state_filtered = state_filtered[state_filtered[state_col] == matched_state]
            else:
                state_filtered = state_filtered.iloc[0:0]

        # Crops available for selected state
        crops_for_state = (
            sorted([
                str(x).strip() for x in state_filtered[crop_col].dropna().unique().tolist()
                if str(x).strip() and str(x).lower() != "nan"
            ])
            if crop_col and crop_col in state_filtered.columns else all_crops
        )

        # Fast filter by crop using category mapping
        both_filtered = state_filtered
        if selected_crop and crop_col and crop_col in both_filtered.columns:
            matched_crop = self._match_category(both_filtered[crop_col], selected_crop)
            if matched_crop is not None:
                both_filtered = both_filtered[both_filtered[crop_col] == matched_crop]
            else:
                both_filtered = both_filtered.iloc[0:0]

        mandis_in_state = (
            sorted([str(x) for x in both_filtered[market_col].dropna().unique().tolist() if str(x).strip() and str(x).lower() != "nan"])
            if market_col and market_col in both_filtered.columns else []
        )

        # States available for selected crop
        crop_filtered = df
        if selected_crop and crop_col and crop_col in crop_filtered.columns:
            matched_crop_for_st = self._match_category(crop_filtered[crop_col], selected_crop)
            if matched_crop_for_st is not None:
                crop_filtered = crop_filtered[crop_filtered[crop_col] == matched_crop_for_st]
            else:
                crop_filtered = crop_filtered.iloc[0:0]
        states_for_crop = (
            sorted([str(x) for x in crop_filtered[state_col].dropna().unique().tolist() if str(x).strip() and str(x).lower() != "nan"])
            if state_col and state_col in crop_filtered.columns else all_states
        )

        # Price stats
        m_s = pd.to_numeric(both_filtered[modal_col], errors="coerce").dropna() if modal_col in both_filtered.columns else pd.Series(dtype=float)
        min_s = pd.to_numeric(both_filtered[min_col], errors="coerce").dropna() if min_col in both_filtered.columns else m_s
        max_s = pd.to_numeric(both_filtered[max_col], errors="coerce").dropna() if max_col in both_filtered.columns else m_s

        # Latest price = median of the most recent date's observations
        latest_price = None
        latest_obs_date = None
        if not both_filtered.empty and "_parsed_date" in both_filtered.columns:
            latest_date = both_filtered["_parsed_date"].max()
            latest_rows = both_filtered[both_filtered["_parsed_date"] == latest_date]
            if modal_col in latest_rows.columns:
                vals = pd.to_numeric(latest_rows[modal_col], errors="coerce").dropna()
                if not vals.empty:
                    latest_price = float(round(vals.median(), 2))
                    latest_obs_date = latest_date.strftime("%Y-%m-%d")

        avg_modal = float(round(m_s.median(), 2)) if not m_s.empty else None
        lowest_observed = float(round(min_s.min(), 2)) if not min_s.empty else None
        highest_observed = float(round(max_s.max(), 2)) if not max_s.empty else None

        date_start = both_filtered["_date_str"].min() if not both_filtered.empty else None
        date_end = both_filtered["_date_str"].max() if not both_filtered.empty else None

        return {
            "selected_state": selected_state,
            "selected_crop": selected_crop,
            "all_states": all_states,
            "all_crops": all_crops,
            "available_states": states_for_crop or all_states,
            "available_crops": crops_for_state or all_crops,
            "reporting_mandis": mandis_in_state,
            "mandis_count": len(mandis_in_state),
            "total_matching_records": len(both_filtered),
            "date_range": {"start": date_start, "end": date_end},
            "price_stats": {
                "latest_modal_price": latest_price,
                "latest_obs_date": latest_obs_date,
                "median_modal_price": avg_modal,
                "min_price": lowest_observed,
                "max_price": highest_observed,
                "unit": "₹ / quintal",
            },
            "aggregation_notes": (
                f"Aggregated across {len(mandis_in_state)} reporting mandis in {selected_state} "
                f"using date-wise robust median statistics."
            ),
        }

    # ── State Time-Series ─────────────────────────────────────────────────────

    def get_state_time_series(
        self,
        state: str,
        crop: str,
        target_price: str = "Modal_Price",
    ) -> dict[str, Any]:
        """
        Aggregate historical AGMARKNET observations to a single state-level daily series.

        Method:
        - Filters by State and Crop (case-insensitive).
        - Aggregates multiple mandi records per date:
            Modal_Price → median  (robust state price anchor)
            Min_Price   → min     (state floor price)
            Max_Price   → max     (state peak price)
        - Builds a continuous daily DatetimeIndex (forward-filled for trading gaps)
          so ARIMA/SARIMA/Prophet receive a regular, evenly-spaced series.
        """
        df = self.load_dataset()
        cmap = self._column_mapping
        crop_col = cmap.get("crop")
        state_col = cmap.get("state")
        modal_col = cmap.get("modal_price", "Modal_Price")
        min_col = cmap.get("min_price", "Min_Price")
        max_col = cmap.get("max_price", "Max_Price")
        market_col = cmap.get("market")

        if not crop_col or crop_col not in df.columns:
            raise ValueError("Crop column not found in dataset.")
        matched_state = self._match_category(df[state_col], state)
        matched_crop = self._match_category(df[crop_col], crop)
        if matched_state is None or matched_crop is None:
            raise ValueError(
                f"No records found in AGMARKNET dataset for State='{state}' and Crop='{crop}'. "
                f"Please select a different combination."
            )

        subset = df[
            (df[state_col] == matched_state) &
            (df[crop_col] == matched_crop)
        ].copy()

        reporting_mandis = (
            sorted([str(x) for x in subset[market_col].dropna().unique().tolist() if str(x).strip()])
            if market_col and market_col in subset.columns else []
        )
        raw_count = len(subset)

        target_lower = target_price.lower()
        if "min" in target_lower:
            actual_col = min_col if min_col in subset.columns else modal_col
            agg_func = "min"
            target_label = "State Minimum Floor Price"
            method_desc = f"Daily Minimum floor price across {len(reporting_mandis)} mandis in {state}."
        elif "max" in target_lower:
            actual_col = max_col if max_col in subset.columns else modal_col
            agg_func = "max"
            target_label = "State Maximum Peak Price"
            method_desc = f"Daily Maximum peak price across {len(reporting_mandis)} mandis in {state}."
        else:
            actual_col = modal_col if modal_col in subset.columns else df.select_dtypes(include="number").columns[0]
            agg_func = "median"
            target_label = "State Median Modal Price"
            method_desc = f"Daily Median of mandi modal prices across {len(reporting_mandis)} mandis in {state}."

        subset[actual_col] = pd.to_numeric(subset[actual_col], errors="coerce")
        subset = subset.dropna(subset=[actual_col, "_parsed_date"])

        if subset.empty:
            raise ValueError(f"No valid price records for {state} - {crop} after cleaning.")

        daily_agg = subset.groupby("_parsed_date")[actual_col].agg(agg_func).sort_index()

        if len(daily_agg) < 5:
            raise ValueError(
                f"Insufficient historical data ({len(daily_agg)} daily points) for {state} - {crop}. "
                f"Need at least 5 observations to forecast."
            )

        # Continuous daily series over the actual observation range
        # Do not extend past the last observation with artificial forward-fill,
        # which creates a flat constant tail that distorts model training and causes constant forecasts.
        start_date = daily_agg.index.min()
        end_date = daily_agg.index.max()
        full_idx = pd.date_range(start=start_date, end=end_date, freq="D")
        continuous_series = daily_agg.reindex(full_idx).ffill().bfill()
        continuous_series.name = actual_col

        historical_list = [
            {"date": d.strftime("%Y-%m-%d"), "value": float(round(v, 2))}
            for d, v in continuous_series.items()
        ]

        # Latest price = median of most recent date's actual observations
        latest_date_actual = subset["_parsed_date"].max()
        latest_vals = pd.to_numeric(
            subset[subset["_parsed_date"] == latest_date_actual][actual_col], errors="coerce"
        ).dropna()
        latest_price = float(round(latest_vals.median(), 2)) if not latest_vals.empty else float(round(continuous_series.iloc[-1], 2))
        latest_obs_date = latest_date_actual.strftime("%Y-%m-%d")

        return {
            "state": state,
            "crop": crop,
            "target_price": target_price,
            "target_label": target_label,
            "aggregation_method": method_desc,
            "reporting_mandis": reporting_mandis,
            "mandis_count": len(reporting_mandis),
            "raw_observations_count": raw_count,
            "daily_points_count": len(continuous_series),
            "date_range": {
                "start": continuous_series.index.min().strftime("%Y-%m-%d"),
                "end": continuous_series.index.max().strftime("%Y-%m-%d"),
            },
            "latest_price": latest_price,
            "latest_obs_date": latest_obs_date,
            "min_price": float(round(continuous_series.min(), 2)),
            "max_price": float(round(continuous_series.max(), 2)),
            "avg_price": float(round(continuous_series.mean(), 2)),
            "unit": "₹ / quintal",
            "series": continuous_series,
            "historical": historical_list,
        }

    def get_time_series(
        self,
        crop: str,
        state: Optional[str] = None,
        district: Optional[str] = None,
        market: Optional[str] = None,
        target_price: str = "Modal_Price",
    ) -> pd.DataFrame:
        """Backward-compatible wrapper returning a DataFrame with date and price columns."""
        if state and state not in ("All", "All States", ""):
            data = self.get_state_time_series(state=state, crop=crop, target_price=target_price)
        else:
            all_states = self._metadata.get("available_states", [])
            st = all_states[0] if all_states else None
            if not st:
                raise ValueError("No states available in dataset.")
            data = self.get_state_time_series(state=st, crop=crop, target_price=target_price)

        s = data["series"]
        res = pd.DataFrame({"date": [d.strftime("%Y-%m-%d") for d in s.index], "price": s.values})
        res["date_dt"] = s.index
        return res


# Singleton
agmarknet_service = AgmarknetDataService()
