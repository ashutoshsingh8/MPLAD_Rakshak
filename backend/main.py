"""
MPLAD Rakshak — FastAPI Application Entry Point
=================================================
Central API server that mounts all routers, handles startup/shutdown
lifecycle events (DB creation, data seeding, Qdrant health check),
and serves as the main entry point for the backend.
"""

import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import settings
from database import engine, Base, SessionLocal
from schemas import HealthResponse

# ── Configure Logging ────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("mplad_rakshak")


# ═══════════════════════════════════════════════════════════
# Application Lifespan
# ═══════════════════════════════════════════════════════════

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    logger.info("=" * 60)
    logger.info(f"🚀 Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info("=" * 60)

    # ── Create database tables ───────────────────────────
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables created/verified")
    except Exception as e:
        logger.error(f"❌ Database connection failed: {e}")
        logger.info("The app will start but DB operations will fail.")

    # ── Seed initial data ────────────────────────────────
    try:
        db = SessionLocal()
        from services.extractor import seed_initial_data
        summary = seed_initial_data(db)
        logger.info(f"✅ Data seeding complete: {summary}")
        db.close()
    except Exception as e:
        logger.warning(f"⚠️ Data seeding skipped: {e}")

    # ── Check Qdrant connectivity ────────────────────────
    try:
        from services.llm_api import check_rag_health
        rag_status = check_rag_health()
        logger.info(f"✅ RAG health: {rag_status}")
    except Exception as e:
        logger.warning(f"⚠️ Qdrant not available: {e}")

    # ── Attempt to ingest guidelines ─────────────────────
    guidelines_path = Path(settings.DATA_DIR) / "guidelines" / "mplads_guidelines_2023.pdf"
    if guidelines_path.exists():
        try:
            from services.llm_api import ingest_guidelines
            result = ingest_guidelines(guidelines_path)
            logger.info(f"✅ Guidelines ingestion: {result}")
        except Exception as e:
            logger.warning(f"⚠️ Guidelines ingestion skipped: {e}")
    else:
        logger.info(f"ℹ️ Guidelines PDF not found at {guidelines_path} — RAG will use mock responses")

    # ── Create upload directory ──────────────────────────
    Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)

    logger.info("=" * 60)
    logger.info(f"🟢 {settings.APP_NAME} is ready!")
    logger.info(f"   API docs: http://0.0.0.0:8000/docs")
    logger.info(f"   Gemini:   {'Configured ✅' if settings.GEMINI_API_KEY else 'Not configured ⚠️'}")
    logger.info("=" * 60)

    yield

    # Shutdown
    logger.info(f"🔴 Shutting down {settings.APP_NAME}")


# ═══════════════════════════════════════════════════════════
# FastAPI App
# ═══════════════════════════════════════════════════════════

app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "AI-powered monitoring and anomaly detection platform for the "
        "Member of Parliament Local Area Development Scheme (MPLADS). "
        "Built for Smart India Hackathon PS 26102."
    ),
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS Middleware ──────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://frontend:5173",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static Files (uploaded images) ───────────────────────
uploads_path = Path(settings.UPLOAD_DIR)
uploads_path.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_path)), name="uploads")

# ── Mount Routers ────────────────────────────────────────
from routers.auth import router as auth_router
from routers.projects import router as projects_router
from routers.audit import router as audit_router
from routers.reports import router as reports_router

app.include_router(auth_router)
app.include_router(projects_router)
app.include_router(audit_router)
app.include_router(reports_router)


# ═══════════════════════════════════════════════════════════
# Root & Health Endpoints
# ═══════════════════════════════════════════════════════════

@app.get("/", tags=["Root"])
def root():
    """Root endpoint — API information."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "description": "AI-powered MPLADS Monitoring & Fraud Detection Platform",
        "docs": "/docs",
        "health": "/api/v1/health",
    }


@app.get("/health", response_model=HealthResponse, tags=["Health"])
@app.get("/api/v1/health", response_model=HealthResponse, tags=["Health"])
def health_check():
    """Comprehensive health check for all system components."""
    db_status = "disconnected"
    qdrant_status = "disconnected"
    gemini_status = "not configured"

    # Check database
    try:
        db = SessionLocal()
        db.execute(db.bind.dialect.do_ping if hasattr(db.bind.dialect, 'do_ping') else "SELECT 1")
        db_status = "connected"
        db.close()
    except Exception:
        try:
            from sqlalchemy import text
            db = SessionLocal()
            db.execute(text("SELECT 1"))
            db_status = "connected"
            db.close()
        except Exception:
            db_status = "disconnected"

    # Check Qdrant
    try:
        from services.llm_api import check_rag_health
        rag = check_rag_health()
        qdrant_status = rag.get("qdrant", "unknown")
    except Exception:
        qdrant_status = "disconnected"

    # Check Gemini
    if settings.GEMINI_API_KEY:
        gemini_status = "configured"

    return HealthResponse(
        status="healthy" if db_status == "connected" else "degraded",
        version=settings.APP_VERSION,
        database=db_status,
        qdrant=qdrant_status,
        gemini=gemini_status,
    )


@app.get("/api/v1/data/refresh", tags=["Data"])
def refresh_data():
    """Trigger data extraction pipeline to refresh datasets."""
    from services.extractor import run_full_extraction
    result = run_full_extraction()
    return {"message": "Data refresh completed", "result": result}
