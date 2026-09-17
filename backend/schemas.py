"""
MPLAD Rakshak — Pydantic Schemas
=================================
Request/Response schemas for all API endpoints.
Uses Pydantic v2 with model_config for ORM mode.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime, date
from enum import Enum


# ═══════════════════════════════════════════════════════════
# Enumerations (mirror SQLAlchemy enums for API layer)
# ═══════════════════════════════════════════════════════════

class UserRoleEnum(str, Enum):
    MINISTRY_ADMIN = "MINISTRY_ADMIN"
    DISTRICT_AUTHORITY = "DISTRICT_AUTHORITY"
    MP = "MP"
    CONTRACTOR = "CONTRACTOR"


class ProjectStatusEnum(str, Enum):
    RECOMMENDED = "RECOMMENDED"
    SANCTIONED = "SANCTIONED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    FLAGGED_REVIEW = "FLAGGED_REVIEW"


class AlertTypeEnum(str, Enum):
    RULE_VIOLATION = "RULE_VIOLATION"
    BUDGET_INFLATION = "BUDGET_INFLATION"
    DELAY_RISK = "DELAY_RISK"
    CARTELIZATION = "CARTELIZATION"
    DUPLICATE_ASSET = "DUPLICATE_ASSET"
    GEO_MISMATCH = "GEO_MISMATCH"
    PHOTO_TAMPERED = "PHOTO_TAMPERED"
    QUOTA_FAILURE = "QUOTA_FAILURE"


class AlertSeverityEnum(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class AlertStatusEnum(str, Enum):
    OPEN = "OPEN"
    INVESTIGATING = "INVESTIGATING"
    RESOLVED = "RESOLVED"


# ═══════════════════════════════════════════════════════════
# Auth Schemas
# ═══════════════════════════════════════════════════════════

class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: UserRoleEnum
    username: str
    full_name: str
    district: Optional[str] = None
    state: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    username: str
    full_name: str
    role: UserRoleEnum
    district: Optional[str] = None
    state: Optional[str] = None
    email: Optional[str] = None

    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════════════════════
# Project Schemas
# ═══════════════════════════════════════════════════════════

class ProjectCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=500)
    description: Optional[str] = None
    category: str
    district: str
    state: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    sanctioned_amount: Optional[float] = None
    is_sc_st_area: bool = False
    sc_st_category: str = "GENERAL"
    implementing_agency: Optional[str] = None


class ProjectResponse(BaseModel):
    id: int
    project_uid: str
    title: str
    description: Optional[str] = None
    category: str
    district: str
    state: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    recommended_by_mp_id: Optional[int] = None
    sanctioned_amount: Optional[float] = None
    revised_amount: Optional[float] = None
    expenditure_to_date: float = 0.0
    recommended_date: Optional[date] = None
    sanctioned_date: Optional[date] = None
    stipulated_completion_date: Optional[date] = None
    actual_completion_date: Optional[date] = None
    status: str
    is_sc_st_area: bool = False
    sc_st_category: str = "GENERAL"
    physical_progress_percent: float = 0.0
    implementing_agency: Optional[str] = None
    created_at: Optional[datetime] = None

    # Computed fields for frontend display
    sanction_days_remaining: Optional[int] = None
    is_sanction_overdue: bool = False
    cost_variance_percent: Optional[float] = None

    model_config = {"from_attributes": True}


class ProjectListResponse(BaseModel):
    projects: List[ProjectResponse]
    total: int
    page: int = 1
    page_size: int = 20


# ═══════════════════════════════════════════════════════════
# Anomaly / Audit Schemas
# ═══════════════════════════════════════════════════════════

class AnomalyAlertResponse(BaseModel):
    id: int
    project_id: Optional[int] = None
    alert_type: str
    severity: str
    title: str
    details: Optional[Any] = None
    explanation: Optional[str] = None
    matched_guideline_clause: Optional[str] = None
    confidence_score: Optional[float] = None
    status: str
    district: Optional[str] = None
    state: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class AnomalyActionRequest(BaseModel):
    new_status: AlertStatusEnum
    resolution_notes: Optional[str] = None


class AnomalyListResponse(BaseModel):
    alerts: List[AnomalyAlertResponse]
    total: int
    open_count: int = 0
    critical_count: int = 0


# ═══════════════════════════════════════════════════════════
# Photo / Image Verification Schemas
# ═══════════════════════════════════════════════════════════

class PhotoVerificationResponse(BaseModel):
    image_url: str
    exif_latitude: Optional[float] = None
    exif_longitude: Optional[float] = None
    exif_timestamp: Optional[str] = None
    exif_camera: Optional[str] = None
    exif_software: Optional[str] = None
    geo_distance_meters: Optional[float] = None
    is_metadata_tampered: bool = False
    tampering_reason: Optional[str] = None
    verdict: str = "PASS"


# ═══════════════════════════════════════════════════════════
# RAG / LLM Schemas
# ═══════════════════════════════════════════════════════════

class RAGQueryRequest(BaseModel):
    question: str = Field(..., min_length=5)


class RAGQueryResponse(BaseModel):
    answer: str
    source_chunks: List[str] = []
    confidence_score: Optional[float] = None


class ComplianceCheckResponse(BaseModel):
    compliant: bool
    violated_clauses: List[str] = []
    explanation: str = ""
    confidence_score: float = 0.0


class BOQAuditItem(BaseModel):
    item_name: str
    claimed_rate: float
    benchmark_rate: Optional[float] = None
    variance_percent: Optional[float] = None
    is_inflated: bool = False
    explanation: str = ""


class BOQAuditResponse(BaseModel):
    items: List[BOQAuditItem]
    total_claimed: float = 0.0
    total_benchmark: float = 0.0
    overall_variance_percent: float = 0.0
    flagged_count: int = 0


# ═══════════════════════════════════════════════════════════
# Reports / Dashboard Schemas
# ═══════════════════════════════════════════════════════════

class DashboardSummary(BaseModel):
    total_projects: int = 0
    total_sanctioned_amount: float = 0.0
    total_expenditure: float = 0.0
    utilization_percent: float = 0.0
    projects_by_status: dict = {}
    projects_by_category: dict = {}
    alerts_by_severity: dict = {}
    open_alerts_count: int = 0
    critical_alerts_count: int = 0
    avg_completion_days: Optional[float] = None
    sc_st_allocation_percent: float = 0.0
    states_summary: List[dict] = []


class HealthResponse(BaseModel):
    status: str = "healthy"
    version: str
    database: str = "connected"
    qdrant: str = "connected"
    gemini: str = "configured"
