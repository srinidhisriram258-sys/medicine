import sys
import os
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app

client = TestClient(app)

def test_health_check():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "online"
    assert data["database"] is True

def test_vault_pin_verification():
    # Correct PIN
    res = client.post("/api/auth/verify-vault-pin", json={"pin": "1234"})
    assert res.status_code == 200
    assert res.json()["unlocked"] is True

    # Invalid PIN
    res_bad = client.post("/api/auth/verify-vault-pin", json={"pin": "9999"})
    assert res_bad.status_code == 401

def test_vapid_key_endpoint():
    res = client.get("/api/notifications/vapid-public-key")
    assert res.status_code == 200
    assert "public_key" in res.json()

def test_test_notification_trigger():
    res = client.post("/api/notifications/test-trigger", json={"channel": "Web Push"})
    assert res.status_code == 200
    assert "status" in res.json()

def test_whatsapp_status():
    res = client.get("/api/whatsapp/status")
    assert res.status_code == 200
    assert "message" in res.json()

def test_ai_risk_prediction():
    res = client.post("/api/ai/predict")
    assert res.status_code == 200
    data = res.json()
    assert data["model_status"] == "loaded"
    assert data["risk_level"] in ["LOW", "MEDIUM", "HIGH"]
    assert "probabilities" in data
