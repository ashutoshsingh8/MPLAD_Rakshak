"""
MPLAD Rakshak — Centralized Configuration
==========================================
Uses Pydantic BaseSettings to load all environment variables
with sensible defaults for local development.
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables or .env file."""

    # ── Application ──────────────────────────────────────
    APP_NAME: str = "MPLAD Rakshak"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # ── Google Gemini AI ─────────────────────────────────
    GEMINI_API_KEY: Optional[str] = None

    # ── MySQL Database ───────────────────────────────────
    MYSQL_URL: str = "mysql+pymysql://user:password@mysql:3306/mplad_rakshak"

    # ── Qdrant Vector Database ───────────────────────────
    QDRANT_URL: Optional[str] = None
    QDRANT_API_KEY: Optional[str] = None
    QDRANT_HOST: str = "qdrant"
    QDRANT_PORT: int = 6333
    QDRANT_COLLECTION_NAME: str = "mplads_guidelines"

    # ── File Paths ───────────────────────────────────────
    DATA_DIR: str = "./data"
    UPLOAD_DIR: str = "./uploads"

    # ── JWT Authentication ───────────────────────────────
    JWT_SECRET_KEY: str = "mplad-rakshak-super-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 480

    # ── data.gov.in API ──────────────────────────────────
    DATA_GOV_IN_API_KEY: Optional[str] = None

    # ── Supabase Cloud Storage ───────────────────────────
    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None
    SUPABASE_BUCKET: str = "inspection-photos"

    # ── MPLADS Constants ─────────────────────────────────
    ANNUAL_ENTITLEMENT_PER_MP: float = 5_00_00_000  # ₹5 Crore
    MAX_OUTSIDE_CONSTITUENCY_SPEND: float = 50_00_000  # ₹50 Lakh
    SANCTION_DEADLINE_DAYS: int = 45
    COMPLETION_LIMIT_YEARS: int = 1
    SC_QUOTA_PERCENT: float = 15.0
    ST_QUOTA_PERCENT: float = 7.5
    COST_INFLATION_THRESHOLD_PERCENT: float = 15.0
    CARTELIZATION_THRESHOLD_PERCENT: float = 30.0
    DUPLICATE_RADIUS_METERS: float = 50.0
    GEO_PROXIMITY_THRESHOLD_METERS: float = 100.0

    # ── External URLs ────────────────────────────────────
    MPLADS_GUIDELINES_PDF_URL: str = (
        "https://www.mplads.gov.in/MPLADS/UploadedFiles/"
        "MPLADSGuidelines2023_English_.pdf"
    )
    CKAN_API_BASE_URL: str = "https://data.gov.in/api/3/action"
    ESAKSHI_PORTAL_URL: str = "https://mplads.mospi.gov.in"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
        "extra": "ignore",
    }


# Singleton instance
settings = Settings()
