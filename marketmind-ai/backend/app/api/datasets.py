import json
import shutil
import uuid
from pathlib import Path
from typing import Optional
import pandas as pd

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.core.config import settings
from app.core.logging import logger
from app.database.models import Dataset
from app.database.session import get_db
from app.preprocessing.analyzer import (
    analyse_dataframe,
    compute_fingerprint,
    load_dataframe,
    preprocess_dataframe,
)
from app.schemas.schemas import (
    DatasetAnalysis,
    DatasetConfigUpdate,
    DatasetResponse,
    PreprocessingConfig,
    AgriOptionsResponse,
)

router = APIRouter(prefix="/api/datasets", tags=["datasets"])

ALLOWED_EXTENSIONS = {".csv", ".xlsx", ".xls"}


async def sync_existing_files(db: AsyncSession) -> list[Dataset]:
    """Scan upload directory and register any CSV files not yet tracked in the database."""
    search_dirs = [
        Path(settings.UPLOAD_DIR),
        Path("data/uploads"),
        Path("../data/uploads"),
        Path("../../data/uploads"),
        Path(r"c:\Users\Mounish\.gemini\antigravity\scratch\AgriIntel\data\uploads"),
    ]
    seen_files = set()
    registered = []

    for sdir in search_dirs:
        if not sdir.exists():
            continue
        for file_path in sdir.glob("*.csv"):
            if file_path.name in seen_files:
                continue
            seen_files.add(file_path.name)

            # Check if dataset already in DB
            stmt = select(Dataset).where(
                (Dataset.original_filename == file_path.name) | (Dataset.filename == file_path.name)
            )
            res = await db.execute(stmt)
            existing = res.scalars().first()
            if existing:
                continue

            try:
                # Ensure copy is in UPLOAD_DIR
                target_dest = Path(settings.UPLOAD_DIR) / file_path.name
                if not target_dest.exists() and file_path != target_dest:
                    shutil.copy2(file_path, target_dest)

                use_path = target_dest if target_dest.exists() else file_path
                file_size = use_path.stat().st_size
                # If larger than 20MB, read first 25,000 rows for initial schema analysis
                if file_size > 20 * 1024 * 1024:
                    df = pd.read_csv(use_path, nrows=25000)
                else:
                    df = load_dataframe(use_path)

                fingerprint = compute_fingerprint(use_path) if file_size < 10 * 1024 * 1024 else f"fast-{file_path.name}-{file_size}"
                analysis = analyse_dataframe(df, fingerprint)

                dataset_id = str(uuid.uuid4())
                dataset = Dataset(
                    id=dataset_id,
                    filename=file_path.name,
                    original_filename=file_path.name,
                    file_path=str(use_path.resolve()),
                    file_size=file_size,
                    fingerprint=fingerprint,
                    row_count=len(df),
                    column_count=len(df.columns),
                    columns_json=json.dumps(df.columns.tolist()),
                    date_column=analysis.detected_date_column,
                    target_column=analysis.detected_target_column,
                    frequency=analysis.detected_frequency or "D",
                    status="ANALYSED",
                    analysis_json=analysis.model_dump_json(),
                )
                db.add(dataset)
                registered.append(dataset)
                logger.info(f"Auto-registered existing dataset: {file_path.name} ({len(df)} rows)")
            except Exception as e:
                logger.warning(f"Could not auto-register {file_path.name}: {e}")

    if registered:
        await db.commit()
    return registered


@router.get("", response_model=list[DatasetResponse])
async def list_datasets(db: AsyncSession = Depends(get_db)):
    """List all available datasets in the system, automatically discovering existing data files."""
    await sync_existing_files(db)
    stmt = select(Dataset).order_by(desc(Dataset.created_at))
    res = await db.execute(stmt)
    return [DatasetResponse.model_validate(d) for d in res.scalars().all()]



@router.post("/upload", response_model=DatasetResponse, status_code=status.HTTP_201_CREATED)
async def upload_dataset(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """Upload a CSV or Excel dataset file."""
    suffix = Path(file.filename).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"Unsupported file type '{suffix}'. Allowed: {ALLOWED_EXTENSIONS}")

    # Stream to temp location first, then validate size
    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)
    tmp_id = str(uuid.uuid4())
    tmp_path = upload_dir / f"{tmp_id}{suffix}"

    try:
        total = 0
        with open(tmp_path, "wb") as f:
            while chunk := await file.read(65536):
                total += len(chunk)
                if total > settings.max_upload_bytes:
                    tmp_path.unlink(missing_ok=True)
                    raise HTTPException(413, f"File exceeds {settings.MAX_UPLOAD_SIZE_MB} MB limit.")
                f.write(chunk)

        fingerprint = compute_fingerprint(tmp_path)
        df = load_dataframe(tmp_path)

        dataset = Dataset(
            id=tmp_id,
            filename=f"{tmp_id}{suffix}",
            original_filename=file.filename,
            file_path=str(tmp_path),
            file_size=total,
            fingerprint=fingerprint,
            row_count=len(df),
            column_count=len(df.columns),
            columns_json=json.dumps(df.columns.tolist()),
            status="UPLOADED",
        )
        db.add(dataset)
        await db.commit()
        await db.refresh(dataset)
        logger.info(f"Dataset uploaded: {dataset.id} ({file.filename}, {len(df)} rows)")
        return DatasetResponse.model_validate(dataset)

    except HTTPException:
        raise
    except Exception as exc:
        tmp_path.unlink(missing_ok=True)
        logger.exception(f"Upload failed: {exc}")
        raise HTTPException(500, f"Upload failed: {exc}")


@router.get("/{dataset_id}", response_model=DatasetResponse)
async def get_dataset(dataset_id: str, db: AsyncSession = Depends(get_db)):
    dataset = await db.get(Dataset, dataset_id)
    if not dataset:
        raise HTTPException(404, "Dataset not found.")
    return DatasetResponse.model_validate(dataset)


@router.get("/{dataset_id}/analysis", response_model=DatasetAnalysis)
async def analyse_dataset(dataset_id: str, db: AsyncSession = Depends(get_db)):
    """Run full EDA on the uploaded dataset."""
    dataset = await db.get(Dataset, dataset_id)
    if not dataset:
        raise HTTPException(404, "Dataset not found.")

    if dataset.analysis_json:
        return DatasetAnalysis(**json.loads(dataset.analysis_json))

    try:
        df = load_dataframe(Path(dataset.file_path))
        analysis = analyse_dataframe(df, dataset.fingerprint)
        dataset.analysis_json = analysis.model_dump_json()
        dataset.status = "ANALYSED"
        if analysis.detected_date_column:
            dataset.date_column = analysis.detected_date_column
        if analysis.detected_target_column:
            dataset.target_column = analysis.detected_target_column
        if analysis.detected_frequency:
            dataset.frequency = analysis.detected_frequency
        await db.commit()
        return analysis
    except Exception as exc:
        logger.exception(f"Analysis failed for {dataset_id}: {exc}")
        raise HTTPException(500, f"Analysis failed: {exc}")


@router.get("/{dataset_id}/preview")
async def preview_dataset(dataset_id: str, rows: int = 20, db: AsyncSession = Depends(get_db)):
    dataset = await db.get(Dataset, dataset_id)
    if not dataset:
        raise HTTPException(404, "Dataset not found.")
    df = load_dataframe(Path(dataset.file_path))
    preview = df.head(rows).where(df.notna(), None).to_dict(orient="records")
    return {"columns": df.columns.tolist(), "rows": preview, "total_rows": len(df)}


@router.put("/{dataset_id}/config", response_model=DatasetResponse)
async def update_dataset_config(
    dataset_id: str,
    config: DatasetConfigUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Manually set the date and target columns."""
    dataset = await db.get(Dataset, dataset_id)
    if not dataset:
        raise HTTPException(404, "Dataset not found.")
    cols = dataset.columns
    if config.date_column not in cols:
        raise HTTPException(400, f"Column '{config.date_column}' not found in dataset.")
    if config.target_column not in cols:
        raise HTTPException(400, f"Column '{config.target_column}' not found in dataset.")
    dataset.date_column = config.date_column
    dataset.target_column = config.target_column
    if config.frequency:
        dataset.frequency = config.frequency
    await db.commit()
    await db.refresh(dataset)
    return DatasetResponse.model_validate(dataset)


@router.post("/{dataset_id}/preprocess")
async def preprocess_dataset(
    dataset_id: str,
    config: PreprocessingConfig,
    db: AsyncSession = Depends(get_db),
):
    """Preview preprocessed dataset (does NOT modify the stored file)."""
    dataset = await db.get(Dataset, dataset_id)
    if not dataset:
        raise HTTPException(404, "Dataset not found.")
    if not dataset.date_column or not dataset.target_column:
        raise HTTPException(400, "Set date_column and target_column before preprocessing.")
    df = load_dataframe(Path(dataset.file_path))
    clean_df = preprocess_dataframe(df, dataset.date_column, dataset.target_column, config)
    return {
        "original_rows": len(df),
        "preprocessed_rows": len(clean_df),
        "dropped_rows": len(df) - len(clean_df),
        "preview": clean_df.reset_index().head(20).where(clean_df.reset_index().notna(), None).to_dict(orient="records"),
    }


@router.get("/{dataset_id}/agri-options", response_model=AgriOptionsResponse)
async def get_agri_options(
    dataset_id: str,
    crop: Optional[str] = Query(None, description="Optional crop name to filter available markets"),
    db: AsyncSession = Depends(get_db),
):
    """Return available crops, markets, states, and specific statistics for agricultural datasets."""
    dataset = await db.get(Dataset, dataset_id)
    if not dataset:
        raise HTTPException(404, "Dataset not found.")

    analysis = None
    if dataset.analysis_json:
        try:
            analysis = DatasetAnalysis(**json.loads(dataset.analysis_json))
        except Exception:
            pass

    file_path = Path(dataset.file_path)
    if not file_path.exists():
        raise HTTPException(404, "Dataset file missing on disk.")

    df = load_dataframe(file_path)

    crop_col = analysis.crop_column if analysis else None
    market_col = analysis.market_column if analysis else None
    state_col = analysis.state_column if analysis else None

    # Fallbacks if not detected in analysis
    if not crop_col:
        for c in df.columns:
            if c.strip().lower() in ("crop", "commodity", "crop_name", "commodity_name", "produce", "item"):
                crop_col = c
                break
    if not market_col:
        for c in df.columns:
            if c.strip().lower() in ("market", "mandi", "apmc", "district", "center", "centre"):
                market_col = c
                break
    if not state_col:
        for c in df.columns:
            if c.strip().lower() in ("state", "province", "region"):
                state_col = c
                break

    is_agri = bool(crop_col or (market_col and ("price" in " ".join(df.columns).lower())))
    crops = sorted([str(x) for x in df[crop_col].dropna().unique().tolist() if str(x).strip() and str(x).lower() != "nan"]) if crop_col and crop_col in df.columns else []
    states = sorted([str(x) for x in df[state_col].dropna().unique().tolist() if str(x).strip() and str(x).lower() != "nan"]) if state_col and state_col in df.columns else []

    # Filter markets by selected crop if provided
    if crop and crop_col and crop_col in df.columns:
        crop_df = df[df[crop_col].astype(str).str.strip().str.lower() == str(crop).strip().lower()]
        markets = sorted([str(x) for x in crop_df[market_col].dropna().unique().tolist() if str(x).strip() and str(x).lower() != "nan"]) if market_col and market_col in crop_df.columns else []

        target_col = dataset.target_column or "Modal_Price"
        target_s = pd.to_numeric(crop_df[target_col], errors="coerce").dropna() if target_col in crop_df.columns else pd.Series(dtype=float)
        date_col = dataset.date_column or "Date"
        date_s = pd.to_datetime(crop_df[date_col], errors="coerce").dropna() if date_col in crop_df.columns else pd.Series(dtype="datetime64[ns]")

        selected_crop_stats = {
            "crop": crop,
            "total_records": len(crop_df),
            "markets_count": len(markets),
            "min_price": float(target_s.min()) if not target_s.empty else None,
            "max_price": float(target_s.max()) if not target_s.empty else None,
            "mean_price": float(round(target_s.mean(), 2)) if not target_s.empty else None,
            "latest_price": float(target_s.iloc[-1]) if not target_s.empty else None,
            "start_date": str(date_s.min().date()) if not date_s.empty else None,
            "end_date": str(date_s.max().date()) if not date_s.empty else None,
        }
    else:
        markets = sorted([str(x) for x in df[market_col].dropna().unique().tolist() if str(x).strip() and str(x).lower() != "nan"]) if market_col and market_col in df.columns else []
        selected_crop_stats = None

    return AgriOptionsResponse(
        is_agricultural=is_agri,
        crop_column=crop_col,
        market_column=market_col,
        state_column=state_col,
        crops=crops,
        markets=markets,
        states=states,
        selected_crop_stats=selected_crop_stats,
    )

