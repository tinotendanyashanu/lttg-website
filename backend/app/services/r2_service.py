"""Cloudflare R2 uploads via S3-compatible API (boto3 in thread pool)."""

import asyncio
import re
import uuid
from datetime import datetime
from typing import TypedDict

import boto3
from botocore.exceptions import BotoCoreError, ClientError
from botocore.client import BaseClient

from app.config import Settings


def _safe_filename(name: str) -> str:
    base = re.sub(r"[^a-zA-Z0-9._-]+", "_", name)[:200]
    return base or "file"


class UploadResult(TypedDict):
    url: str
    key: str
    size: int


class StorageUploadError(RuntimeError):
    """Raised when the configured object storage rejects an upload."""


class R2Service:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._client: BaseClient = boto3.client(
            "s3",
            endpoint_url=settings.r2_endpoint,
            aws_access_key_id=settings.r2_access_key_id,
            aws_secret_access_key=settings.r2_secret_access_key,
            region_name="auto",
        )

    def _put_object_sync(self, key: str, body: bytes, content_type: str) -> None:
        try:
            self._client.put_object(
                Bucket=self._settings.r2_bucket_name,
                Key=key,
                Body=body,
                ContentType=content_type or "application/octet-stream",
            )
        except ClientError as exc:
            code = exc.response.get("Error", {}).get("Code", "unknown")
            raise StorageUploadError(f"r2_put_object_failed:{code}") from exc
        except BotoCoreError as exc:
            raise StorageUploadError("r2_put_object_failed") from exc

    def _presign_sync(self, key: str, expires: int) -> str:
        return self._client.generate_presigned_url(
            "get_object",
            Params={"Bucket": self._settings.r2_bucket_name, "Key": key},
            ExpiresIn=expires,
        )

    async def upload_attachment(
        self,
        case_id: str,
        filename: str,
        content_bytes: bytes,
        content_type: str,
    ) -> UploadResult:
        now = datetime.utcnow()
        key = f"cases/{case_id}/{now:%Y}/{now:%m}/{uuid.uuid4().hex}-{_safe_filename(filename)}"
        await asyncio.to_thread(self._put_object_sync, key, content_bytes, content_type)
        public = self._settings.r2_public_url
        if public:
            base = public.rstrip("/")
            url = f"{base}/{key}"
        else:
            url = await asyncio.to_thread(self._presign_sync, key, 604800)
        return {"url": url, "key": key, "size": len(content_bytes)}

    async def generate_presigned_get(self, key: str, expires: int = 604800) -> str:
        return await asyncio.to_thread(self._presign_sync, key, expires)
