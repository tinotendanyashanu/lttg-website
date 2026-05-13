from app.config import Settings
from app.services.r2_service import R2Service


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
