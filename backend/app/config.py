"""Application settings from environment."""

from functools import lru_cache

from pydantic import ValidationInfo, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    mongodb_uri: str
    mongodb_db_name: str = "mailcases"

    google_client_id: str
    google_client_secret: str
    google_refresh_token: str
    google_sync_user: str = "me"
    google_oauth_scopes: str | None = None

    r2_access_key_id: str
    r2_secret_access_key: str
    r2_bucket_name: str
    r2_endpoint: str
    r2_public_url: str | None = None

    backend_jwt_secret: str
    cors_origins: str = "http://localhost:3000"
    sync_interval_seconds: int = 45

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def google_oauth_scope_list(self) -> list[str] | None:
        if not self.google_oauth_scopes:
            return None
        scopes = [
            scope.strip()
            for chunk in self.google_oauth_scopes.split(",")
            for scope in chunk.split()
            if scope.strip()
        ]
        return scopes or None

    @field_validator("*", mode="before")
    @classmethod
    def normalize_env_assignment_value(cls, value, info: ValidationInfo):
        if value is None:
            return value
        text = str(value).strip().strip('"').strip("'")
        env_name = info.field_name.upper()
        if text.startswith(f"{env_name}="):
            text = text.split("=", 1)[1].strip().strip('"').strip("'")
        return text or None


@lru_cache
def get_settings() -> Settings:
    return Settings()
