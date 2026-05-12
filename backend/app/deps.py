"""FastAPI dependencies."""

from typing import Annotated

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.models.user import UserDoc
from app.security import decode_backend_token

security = HTTPBearer(auto_error=False)


async def get_db(request: Request):
    return request.app.state.db


async def get_gmail(request: Request):
    return request.app.state.gmail


async def get_r2(request: Request):
    return request.app.state.r2


async def get_token_payload(
    creds: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
) -> dict:
    if not creds or creds.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="missing_bearer_token")
    try:
        return decode_backend_token(creds.credentials)
    except ValueError:
        raise HTTPException(status_code=401, detail="invalid_token")


async def get_current_user(
    request: Request,
    payload: Annotated[dict, Depends(get_token_payload)],
) -> UserDoc:
    db = request.app.state.db
    sub = payload.get("sub")
    if not sub:
        raise HTTPException(status_code=401, detail="invalid_subject")
    try:
        oid = ObjectId(sub)
    except InvalidId:
        raise HTTPException(status_code=401, detail="invalid_subject")

    doc = await db.users.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=401, detail="user_not_found")

    token_role = payload.get("role")
    db_role = doc.get("role")
    if token_role and db_role and token_role != db_role:
        raise HTTPException(status_code=401, detail="role_mismatch")

    return UserDoc.model_validate(
        {
            "_id": str(doc["_id"]),
            "name": doc.get("name", ""),
            "role": doc["role"],
            "email": doc.get("email", ""),
        }
    )


def require_admin(user: Annotated[UserDoc, Depends(get_current_user)]) -> UserDoc:
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="admin_only")
    return user


def case_access_filter(user: UserDoc) -> dict | None:
    """Mongo filter fragment for case visibility; None means no extra filter (admin)."""
    if user.role == "admin":
        return None
    return {"assigned_to": user.id}
