"""
MPLAD Rakshak — Database Setup
===============================
SQLAlchemy engine, session factory, and base class for all models.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from config import settings


# ── Engine ───────────────────────────────────────────────
connect_args = {}
clean_mysql_url = settings.MYSQL_URL

# Strip ssl_mode parameter if present to prevent PyMySQL keyword error
for param in ["?ssl_mode=REQUIRED", "&ssl_mode=REQUIRED", "?ssl-mode=REQUIRED", "&ssl-mode=REQUIRED", "?ssl_mode=required", "&ssl_mode=required"]:
    clean_mysql_url = clean_mysql_url.replace(param, "")

# Automatically enable secure SSL context when connecting to Aiven or cloud MySQL
if "aivencloud.com" in settings.MYSQL_URL or "ssl" in settings.MYSQL_URL.lower():
    import ssl
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    connect_args["ssl"] = ctx

engine = create_engine(
    clean_mysql_url,
    connect_args=connect_args,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    echo=settings.DEBUG,
)

# ── Session Factory ──────────────────────────────────────
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# ── Declarative Base ─────────────────────────────────────
class Base(DeclarativeBase):
    pass


# ── Dependency ───────────────────────────────────────────
def get_db():
    """FastAPI dependency that yields a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
