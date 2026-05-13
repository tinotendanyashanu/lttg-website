from app.config import Settings


def _settings(**overrides):
    values = {
        "mongodb_uri": "mongodb://127.0.0.1:27017",
        "google_client_id": "x",
        "google_client_secret": "x",
        "google_refresh_token": "x",
        "r2_access_key_id": "x",
        "r2_secret_access_key": "x",
        "r2_bucket_name": "bucket",
        "r2_endpoint": "https://example.r2.cloudflarestorage.com",
        "backend_jwt_secret": "test-secret-test-secret-test-secret-32",
    }
    values.update(overrides)
    return Settings(**values)


def test_r2_endpoint_accepts_plain_url():
    settings = _settings(r2_endpoint="https://example.r2.cloudflarestorage.com")

    assert settings.r2_endpoint == "https://example.r2.cloudflarestorage.com"


def test_r2_endpoint_strips_accidentally_pasted_env_assignment():
    settings = _settings(
        r2_endpoint="R2_ENDPOINT=https://b480dd4bac00bb357ecb22b79c16f7b0.r2.cloudflarestorage.com"
    )

    assert settings.r2_endpoint == "https://b480dd4bac00bb357ecb22b79c16f7b0.r2.cloudflarestorage.com"


def test_google_refresh_token_strips_accidentally_pasted_env_assignment():
    settings = _settings(google_refresh_token="GOOGLE_REFRESH_TOKEN=1//refresh-token")

    assert settings.google_refresh_token == "1//refresh-token"


def test_google_oauth_scopes_are_optional_by_default():
    settings = _settings()

    assert settings.google_oauth_scope_list is None


def test_google_oauth_scopes_parse_commas_and_spaces():
    settings = _settings(
        google_oauth_scopes=(
            "https://www.googleapis.com/auth/gmail.modify, "
            "https://www.googleapis.com/auth/gmail.send"
        )
    )

    assert settings.google_oauth_scope_list == [
        "https://www.googleapis.com/auth/gmail.modify",
        "https://www.googleapis.com/auth/gmail.send",
    ]


def test_r2_public_url_strips_accidentally_pasted_env_assignment():
    settings = _settings(r2_public_url="R2_PUBLIC_URL='https://cdn.example.com/files'")

    assert settings.r2_public_url == "https://cdn.example.com/files"
