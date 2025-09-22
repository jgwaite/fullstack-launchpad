from fastapi.testclient import TestClient

from app.main import app


def test_healthz_ok():
    client = TestClient(app)
    r = client.get("/api/healthz")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}

