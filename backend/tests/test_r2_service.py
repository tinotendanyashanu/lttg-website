import pytest
from botocore.exceptions import ClientError

from app.config import Settings
from app.services.r2_service import R2Service, StorageUploadError


def test_r2_service_uses_normalized_endpoint(monkeypatch):
    captured = {}

    def fake_boto_client(*args, **kwargs):
        captured["args"] = args
        captured["kwargs"] = kwargs
        return object()

    monkeypatch.setattr("app.services.r2_service.boto3.client", fake_boto_client)
    settings = Settings(
        mongodb_uri="mongodb://127.0.0.1:27017",
        google_client_id="x",
        google_client_secret="x",
        google_refresh_token="x",
        r2_access_key_id="access-key",
        r2_secret_access_key="secret-key",
        r2_bucket_name="bucket",
        r2_endpoint="R2_ENDPOINT=https://b480dd4bac00bb357ecb22b79c16f7b0.r2.cloudflarestorage.com",
        backend_jwt_secret="test-secret-test-secret-test-secret-32",
    )

    R2Service(settings)

    assert captured["args"] == ("s3",)
    assert (
        captured["kwargs"]["endpoint_url"]
        == "https://b480dd4bac00bb357ecb22b79c16f7b0.r2.cloudflarestorage.com"
    )


@pytest.mark.asyncio
async def test_upload_attachment_wraps_r2_authorization_errors(monkeypatch):
    class FakeClient:
        def put_object(self, **_kwargs):
            raise ClientError(
                {"Error": {"Code": "Unauthorized", "Message": "Unauthorized"}},
                "PutObject",
            )

    monkeypatch.setattr(
        "app.services.r2_service.boto3.client",
        lambda *_args, **_kwargs: FakeClient(),
    )
    settings = Settings(
        mongodb_uri="mongodb://127.0.0.1:27017",
        google_client_id="x",
        google_client_secret="x",
        google_refresh_token="x",
        r2_access_key_id="access-key",
        r2_secret_access_key="secret-key",
        r2_bucket_name="bucket",
        r2_endpoint="https://example.r2.cloudflarestorage.com",
        backend_jwt_secret="test-secret-test-secret-test-secret-32",
    )

    service = R2Service(settings)

    with pytest.raises(StorageUploadError, match="Unauthorized"):
        await service.upload_attachment("CASE-0001", "file.txt", b"data", "text/plain")
