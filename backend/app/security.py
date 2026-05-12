"""JWT verification (HS256, shared secret with Next.js)."""

from jose import JWTError, jwt

from app.config import get_settings


def decode_backend_token(token: str) -> dict:
    settings = get_settings()
    try:
        return jwt.decode(
            token,
            settings.backend_jwt_secret,
            algorithms=["HS256"],
            options={"require_exp": True, "require_sub": True},
        )
    except JWTError as e:
        raise ValueError("invalid_token") from e
