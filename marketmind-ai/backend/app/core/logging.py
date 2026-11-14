import logging
import sys
from app.core.config import settings


def setup_logging() -> None:
    level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
    fmt = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
    
    # Use utf-8 encoding for stdout handler to prevent Windows cp1252 charmap errors
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass

    handler = logging.StreamHandler(sys.stdout)
    logging.basicConfig(
        level=level,
        format=fmt,
        handlers=[handler],
    )
    # Suppress noisy libraries
    logging.getLogger("prophet").setLevel(logging.WARNING)
    logging.getLogger("cmdstanpy").setLevel(logging.WARNING)
    logging.getLogger("numexpr").setLevel(logging.WARNING)



logger = logging.getLogger("marketmind")
