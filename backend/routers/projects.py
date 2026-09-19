"""
MPLAD Rakshak — Projects Router
=================================
CRUD operations for MPLADS projects, proposal submission,
photo upload with EXIF verification, and compliance checking.
"""

import os
import uuid
import shutil
import logging
from pathlib import Path
from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session

from config import settings
from database import get_db
from models import (
    Project, SiteInspectionPhoto, AnomalyAlert,
    ProjectStatus, ProjectCategory, SCSTCategory,
    AlertType, AlertSeverity,
)
from schemas import (
    ProjectCreate, ProjectResponse, ProjectListResponse,
    PhotoVerificationResponse, ComplianceCheckResponse,
    RAGQueryRequest, RAGQueryResponse,
    BOQAuditResponse,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/projects", tags=["Projects"])


# ═══════════════════════════════════════════════════════════
# Helpers
# ═══════════════════════════════════════════════════════════

def _enrich_project_response(project: Project) -> dict:
    """Add computed fields to project response."""
    data = {c.name: getattr(project, c.name) for c in project.__table__.columns}

    # Enum values
    if project.category:
        data["category"] = project.category.value
    if project.status:
        data["status"] = project.status.value
    if project.sc_st_category:
        data["sc_st_category"] = project.sc_st_category.value

    # Sanction countdown
    if project.recommended_date and not project.sanctioned_date:
        days_since = (date.today() - project.recommended_date).days
        data["sanction_days_remaining"] = max(0, settings.SANCTION_DEADLINE_DAYS - days_since)
        data["is_sanction_overdue"] = days_since > settings.SANCTION_DEADLINE_DAYS
    elif project.recommended_date and project.sanctioned_date:
        days_to_sanction = (project.sanctioned_date - project.recommended_date).days
        data["sanction_days_remaining"] = 0
        data["is_sanction_overdue"] = days_to_sanction > settings.SANCTION_DEADLINE_DAYS

    # Cost variance
    if project.sanctioned_amount and project.revised_amount:
        variance = ((project.revised_amount - project.sanctioned_amount) / project.sanctioned_amount) * 100
        data["cost_variance_percent"] = round(variance, 2)

    return data


# ═══════════════════════════════════════════════════════════
# Endpoints
# ═══════════════════════════════════════════════════════════

@router.get("", response_model=ProjectListResponse)
def list_projects(
    status: str = None,
    district: str = None,
    state: str = None,
    category: str = None,
    is_sc_st: bool = None,
    risk_level: str = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """
    List projects with filtering by status, district, state, category, and risk level.
    Supports pagination.
    """
    query = db.query(Project)

    if status:
        try:
            query = query.filter(Project.status == ProjectStatus[status])
        except KeyError:
            pass

    if district:
        query = query.filter(Project.district.ilike(f"%{district}%"))

    if state:
        query = query.filter(Project.state.ilike(f"%{state}%"))

    if category:
        try:
            query = query.filter(Project.category == ProjectCategory[category])
        except KeyError:
            pass

    if is_sc_st is not None:
        query = query.filter(Project.is_sc_st_area == is_sc_st)

    total = query.count()
    projects = query.offset((page - 1) * page_size).limit(page_size).all()

    enriched = [_enrich_project_response(p) for p in projects]

    return ProjectListResponse(
        projects=enriched,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: int, db: Session = Depends(get_db)):
    """Get a single project by ID."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return _enrich_project_response(project)


@router.post("/submit", response_model=ProjectResponse, status_code=201)
def submit_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db),
):
    """
    Submit a new project proposal.
    Auto-generates a project UID and triggers compliance validation pipeline.
    """
    # Generate unique project ID
    uid = f"MPLAD-{date.today().year}-{project_data.state[:2].upper()}-{uuid.uuid4().hex[:6].upper()}"

    project = Project(
        project_uid=uid,
        title=project_data.title,
        description=project_data.description,
        category=ProjectCategory[project_data.category],
        district=project_data.district,
        state=project_data.state,
        latitude=project_data.latitude,
        longitude=project_data.longitude,
        sanctioned_amount=project_data.sanctioned_amount,
        is_sc_st_area=project_data.is_sc_st_area,
        sc_st_category=SCSTCategory[project_data.sc_st_category],
        implementing_agency=project_data.implementing_agency,
        recommended_date=date.today(),
        status=ProjectStatus.RECOMMENDED,
        stipulated_completion_date=date.today() + timedelta(days=365),
    )

    db.add(project)
    db.commit()
    db.refresh(project)

    # Run compliance check asynchronously in background (for prototype, inline)
    try:
        from services.llm_api import check_guideline_compliance
        proposal_text = f"Title: {project.title}\nDescription: {project.description or ''}\nCategory: {project_data.category}\nAmount: ₹{project_data.sanctioned_amount or 'TBD'}"
        compliance = check_guideline_compliance(proposal_text)

        if not compliance.get("compliant", True):
            # Create anomaly alert for non-compliance
            alert = AnomalyAlert(
                project_id=project.id,
                alert_type=AlertType.RULE_VIOLATION,
                severity=AlertSeverity.HIGH,
                title=f"Compliance Issue: {project.project_uid}",
                details=compliance,
                explanation=compliance.get("explanation", ""),
                matched_guideline_clause=", ".join(compliance.get("violated_clauses", [])),
                confidence_score=compliance.get("confidence_score"),
                district=project.district,
                state=project.state,
            )
            db.add(alert)
            project.status = ProjectStatus.FLAGGED_REVIEW
            db.commit()
    except Exception as e:
        logger.warning(f"Compliance check skipped: {e}")

    return _enrich_project_response(project)


@router.post("/{project_id}/upload-photo", response_model=PhotoVerificationResponse)
async def upload_project_photo(
    project_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Upload a site inspection photo for a project.
    Extracts EXIF data, verifies GPS proximity, and checks for tampering.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image (JPEG/PNG)")

    # Save uploaded file
    upload_dir = Path(settings.UPLOAD_DIR) / str(project_id)
    upload_dir.mkdir(parents=True, exist_ok=True)

    file_ext = Path(file.filename).suffix if file.filename else ".jpg"
    saved_filename = f"{uuid.uuid4().hex}{file_ext}"
    saved_path = upload_dir / saved_filename

    with open(saved_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Run verification pipeline
    from services.image_verifier import verify_site_photo, extract_exif, check_tampering_markers

    if project.latitude and project.longitude:
        result = verify_site_photo(saved_path, project.latitude, project.longitude)
    else:
        exif = extract_exif(saved_path)
        tamper = check_tampering_markers(exif)
        result = {
            "verdict": "PASS" if not tamper["is_tampered"] else "FAIL",
            "exif_metadata": exif,
            "geo_verification": {"verified": None, "reason": "No project coordinates available"},
            "tampering_analysis": tamper,
        }

    # Save to database
    exif_meta = result.get("exif_metadata", {})
    geo_verify = result.get("geo_verification", {})
    tamper_check = result.get("tampering_analysis", {})

    # Upload to Supabase Cloud Storage (with fallback to local storage)
    from services.storage import upload_photo_to_supabase
    remote_path = f"{project_id}/{saved_filename}"
    supabase_public_url = upload_photo_to_supabase(saved_path, remote_path)
    final_image_url = supabase_public_url if supabase_public_url else f"/uploads/{project_id}/{saved_filename}"

    photo = SiteInspectionPhoto(
        project_id=project_id,
        image_url=final_image_url,
        original_filename=file.filename,
        exif_latitude=exif_meta.get("latitude"),
        exif_longitude=exif_meta.get("longitude"),
        exif_timestamp=None,  # Would parse from string
        exif_camera_make=exif_meta.get("camera_make") if isinstance(exif_meta.get("camera_make"), str) else None,
        exif_camera_model=exif_meta.get("camera_model") if isinstance(exif_meta.get("camera_model"), str) else None,
        exif_software=exif_meta.get("software"),
        geo_distance_meters=geo_verify.get("distance_meters"),
        is_metadata_tampered=tamper_check.get("is_tampered", False),
        tampering_reason="; ".join(tamper_check.get("issues", [])) if tamper_check.get("issues") else None,
    )
    db.add(photo)

    # Create alert if tampering or geo mismatch detected
    if result["verdict"] == "FAIL":
        alert_type = AlertType.PHOTO_TAMPERED if tamper_check.get("is_tampered") else AlertType.GEO_MISMATCH
        alert = AnomalyAlert(
            project_id=project_id,
            alert_type=alert_type,
            severity=AlertSeverity.HIGH,
            title=f"Photo Verification Failed: {project.project_uid}",
            details=result,
            explanation=f"Photo verification failed. {geo_verify.get('reason', '')} {'; '.join(tamper_check.get('issues', []))}",
            district=project.district,
            state=project.state,
        )
        db.add(alert)

    db.commit()

    return PhotoVerificationResponse(
        image_url=photo.image_url,
        exif_latitude=photo.exif_latitude,
        exif_longitude=photo.exif_longitude,
        exif_timestamp=exif_meta.get("timestamp"),
        exif_camera=f"{exif_meta.get('camera_make', '')} {exif_meta.get('camera_model', '')}".strip() or None,
        exif_software=photo.exif_software,
        geo_distance_meters=photo.geo_distance_meters,
        is_metadata_tampered=photo.is_metadata_tampered,
        tampering_reason=photo.tampering_reason,
        verdict=result["verdict"],
    )


@router.post("/compliance-check", response_model=ComplianceCheckResponse)
def check_compliance(
    request: RAGQueryRequest,
    db: Session = Depends(get_db),
):
    """Check a proposal description against MPLADS guidelines."""
    from services.llm_api import check_guideline_compliance
    result = check_guideline_compliance(request.question)
    return ComplianceCheckResponse(**result)


@router.post("/query-guidelines", response_model=RAGQueryResponse)
def query_guidelines(
    request: RAGQueryRequest,
    db: Session = Depends(get_db),
):
    """Query the MPLADS guidelines using natural language."""
    from services.llm_api import query_guidelines as _query
    result = _query(request.question)
    return RAGQueryResponse(**result)
