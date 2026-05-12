"""Application settings from environment."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    mongodb_uri: str
    mongodb_db_name: str = "mailcases"

    google_client_id: str
    google_client_secret: str
    google_refresh_token: str
    google_sync_user: str = "me"

    r2_access_key: str
    r2_secret_key: str
    r2_bucket_name: str
    r2_endpoint: str
    r2_public_url: str | None = None

    backend_jwt_secret: str
    cors_origins: str = "http://localhost:3000"
    sync_interval_seconds: int = 45

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
