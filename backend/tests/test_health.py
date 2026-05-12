from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.routers.health import router


def test_health_ok():
    app = FastAPI()
    app.include_router(router)
    client = TestClient(app)
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"ok": True}
