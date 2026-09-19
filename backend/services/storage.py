"""
MPLAD Rakshak — Supabase Cloud Storage Service
===============================================
Uploads site inspection photos to Supabase Cloud Storage.
Falls back to local file storage if Supabase is unavailable.
"""

import logging
from pathlib import Path
from typing import Optional
import requests
from config import settings

logger = logging.getLogger(__name__)


def upload_photo_to_supabase(local_file_path: Path, remote_filename: str) -> Optional[str]:
    """
    Upload an inspection photo to the Supabase Storage bucket.

    Args:
        local_file_path: Path to local image file on disk.
        remote_filename: Target path inside the bucket (e.g. '1/photo_uid.jpg').

    Returns:
        Public CDN URL string if successful, else None.
    """
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        logger.info("Supabase storage credentials not configured; using local storage.")
        return None

    try:
        bucket = settings.SUPABASE_BUCKET or "inspection-photos"
        base_url = settings.SUPABASE_URL.rstrip("/")
        upload_url = f"{base_url}/storage/v1/object/{bucket}/{remote_filename}"

        # Determine content type based on extension
        ext = local_file_path.suffix.lower()
        content_type = "image/png" if ext == ".png" else "image/jpeg"

        headers = {
            "apikey": settings.SUPABASE_KEY,
            "Authorization": f"Bearer {settings.SUPABASE_KEY}",
            "Content-Type": content_type,
            "x-upsert": "true",
        }

        with open(local_file_path, "rb") as f:
            resp = requests.post(upload_url, headers=headers, data=f, timeout=15)

        if resp.status_code in (200, 201):
            public_url = f"{base_url}/storage/v1/object/public/{bucket}/{remote_filename}"
            logger.info(f"✅ Photo uploaded to Supabase Storage: {public_url}")
            return public_url
        else:
            logger.warning(f"Supabase upload returned status {resp.status_code}: {resp.text}")
            return None
    except Exception as e:
        logger.error(f"Failed to upload photo to Supabase: {e}")
        return None
