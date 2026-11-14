"""History and health check endpoints."""
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.database.models import ForecastRun
from app.database.session import get_db
from app.schemas.schemas import ForecastRunResponse

router = APIRouter(tags=["system"])


@router.get("/api/health")
async def health():
    return {"status": "ok", "service": "MarketMind AI"}


@router.get("/api/history")
async def get_history(limit: int = 50, db: AsyncSession = Depends(get_db)):
    """Return recent forecast runs for the audit log."""
    result = await db.execute(
        select(ForecastRun).order_by(desc(ForecastRun.created_at)).limit(limit)
    )
    runs = result.scalars().all()
    return [ForecastRunResponse.model_validate(r) for r in runs]
