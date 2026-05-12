"""Pytest env defaults for optional full-app imports."""

import os

os.environ.setdefault("DISABLE_BACKGROUND_SYNC", "1")
os.environ.setdefault("MONGODB_URI", "mongodb://127.0.0.1:27017")
os.environ.setdefault("MONGODB_DB_NAME", "mailcases_test")
os.environ.setdefault("GOOGLE_CLIENT_ID", "x")
os.environ.setdefault("GOOGLE_CLIENT_SECRET", "x")
os.environ.setdefault("GOOGLE_REFRESH_TOKEN", "x")
os.environ.setdefault("R2_ACCESS_KEY", "x")
os.environ.setdefault("R2_SECRET_KEY", "x")
os.environ.setdefault("R2_BUCKET_NAME", "b")
os.environ.setdefault("R2_ENDPOINT", "https://example.r2.cloudflarestorage.com")
os.environ.setdefault("BACKEND_JWT_SECRET", "test-secret-test-secret-test-secret-32")


def pytest_configure():
    from app.config import get_settings

    get_settings.cache_clear()
