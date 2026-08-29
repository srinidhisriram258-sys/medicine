import sys
import os
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "database" in data
    assert "ai_model" in data

def test_create_and_get_medicine():
    payload = {
        "name": "Test Med",
        "dosage": "50mg",
        "frequency": "Once daily",
        "scheduled_times": ["09:00"],
        "start_date": "2026-08-24",
        "notes": "Test notes"
    }
    res = client.post("/api/medicines", json=payload)
    assert res.status_code == 201
    med_data = res.json()
    assert med_data["name"] == "Test Med"
    assert med_data["dosage"] == "50mg"

    # Get medicines list
    res_list = client.get("/api/medicines")
    assert res_list.status_code == 200
    assert len(res_list.json()) >= 1

def test_reminders_and_status_toggle():
    res = client.get("/api/reminders")
    assert res.status_code == 200
    reminders = res.json()
    if len(reminders) > 0:
        target_id = reminders[0]["id"]
        
        # Mark Taken
        res_taken = client.post(f"/api/reminders/{target_id}/taken")
        assert res_taken.status_code == 200
        assert res_taken.json()["status"] == "taken"

        # Mark Missed
        res_missed = client.post(f"/api/reminders/{target_id}/missed")
        assert res_missed.status_code == 200
        assert res_missed.json()["status"] == "missed"

def test_adherence_and_analytics():
    res_adh = client.get("/api/adherence")
    assert res_adh.status_code == 200
    assert "today_adherence" in res_adh.json()

    res_ana = client.get("/api/analytics")
    assert res_ana.status_code == 200
    assert "trend_7d" in res_ana.json()
    assert "medicine_breakdown" in res_ana.json()

def test_ai_status_endpoint():
    res = client.get("/api/ai/status")
    assert res.status_code == 200
    assert "pytorch_installed" in res.json()
