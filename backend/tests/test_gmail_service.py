from app.config import Settings
from app.services.gmail_service import GmailService


def _settings(**overrides):
    values = {
        "mongodb_uri": "mongodb://127.0.0.1:27017",
        "google_client_id": "client-id",
        "google_client_secret": "client-secret",
        "google_refresh_token": "refresh-token",
        "r2_access_key_id": "x",
        "r2_secret_access_key": "x",
        "r2_bucket_name": "bucket",
        "r2_endpoint": "https://example.r2.cloudflarestorage.com",
        "backend_jwt_secret": "test-secret-test-secret-test-secret-32",
    }
    values.update(overrides)
    return Settings(**values)


def test_gmail_credentials_do_not_force_scopes_by_default():
    creds = GmailService(_settings())._creds()

    assert creds.scopes is None


def test_gmail_credentials_use_configured_scopes_when_explicit():
    creds = GmailService(
        _settings(google_oauth_scopes="https://www.googleapis.com/auth/gmail.modify")
    )._creds()

    assert creds.scopes == ["https://www.googleapis.com/auth/gmail.modify"]
