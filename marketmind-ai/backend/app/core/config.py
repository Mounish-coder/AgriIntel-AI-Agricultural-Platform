from pydantic_settings import BaseSettings
from pathlib import Path
import os


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./marketmind.db"
    UPLOAD_DIR: str = "./data/uploads"
    REPORTS_DIR: str = "./reports"
    MAX_UPLOAD_SIZE_MB: int = 50
    CORS_ORIGINS: str = (
        "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,"
        "http://127.0.0.1:3000,http://localhost:5174,http://127.0.0.1:5174,"
        "http://localhost:4173,http://127.0.0.1:4173"
    )
    LOG_LEVEL: str = "INFO"
    ENVIRONMENT: str = "development"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    @property
    def max_upload_bytes(self) -> int:
        return self.MAX_UPLOAD_SIZE_MB * 1024 * 1024

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()

# Ensure directories exist
Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
Path(settings.REPORTS_DIR).mkdir(parents=True, exist_ok=True)
