"""
MarketMind AI — FastAPI application entry point.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging import setup_logging, logger
from app.database.session import init_db, AsyncSessionLocal
from app.api import datasets, forecasts, system, agmarknet, advisory
from app.services.agmarknet_service import agmarknet_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    await init_db()
    try:
        agmarknet_service.load_dataset()
    except Exception as e:
        logger.warning(f"AGMARKNET dataset startup check: {e}")
    try:
        async with AsyncSessionLocal() as session:
            await datasets.sync_existing_files(session)
    except Exception as e:
        logger.warning(f"Startup dataset sync: {e}")
    logger.info("AgriIntel / MarketMind AI started [OK]")
    yield
    logger.info("AgriIntel / MarketMind AI shutting down.")


app = FastAPI(
    title="AgriIntel",
    description="Intelligent Agricultural Market Price Prediction API",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list + [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(agmarknet.router)
app.include_router(advisory.router)
app.include_router(datasets.router)
app.include_router(forecasts.router)
app.include_router(system.router)


@app.get("/")
async def root():
    return {"message": "MarketMind AI API", "docs": "/docs"}
