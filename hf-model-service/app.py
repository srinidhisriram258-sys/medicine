import os
import sys
import torch
import torch.nn as nn
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

app = FastAPI(
    title="AURA-MED Hugging Face PyTorch Inference Service",
    description="Microservice hosting PyTorch AdherenceRiskNet model for Hugging Face Spaces deployment",
    version="1.0.0"
)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "adherence_risk_model.pth")
SCALER_PATH = os.path.join(os.path.dirname(__file__), "models", "scaler.pkl")

class AdherenceRiskNet(nn.Module):
    def __init__(self, input_dim=16, num_classes=3):
        super(AdherenceRiskNet, self).__init__()
        self.network = nn.Sequential(
            nn.Linear(input_dim, 64),
            nn.ReLU(),
            nn.BatchNorm1d(64),
            nn.Dropout(0.25),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.BatchNorm1d(32),
            nn.Dropout(0.15),
            nn.Linear(32, num_classes)
        )

    def forward(self, x):
        return self.network(x)

# Global model state
model = None
scaler = None
model_loaded = False

@app.on_event("startup")
def load_model():
    global model, scaler, model_loaded
    try:
        if os.path.exists(MODEL_PATH):
            model = AdherenceRiskNet(input_dim=16, num_classes=3)
            model.load_state_dict(torch.load(MODEL_PATH, map_location=torch.device('cpu')))
            model.eval()
            model_loaded = True
            print("[HF SPACE] PyTorch AdherenceRiskNet model loaded successfully.")
        else:
            print(f"[HF SPACE WARNING] Model checkpoint not found at {MODEL_PATH}")
    except Exception as e:
        print(f"[HF SPACE ERROR] Failed to load model: {e}")

class FeaturesPayload(BaseModel):
    features: Dict[str, float]

@app.get("/health")
def health():
    return {
        "status": "online",
        "service": "AURA-MED Hugging Face PyTorch Inference",
        "model_loaded": model_loaded,
        "device": "cpu"
    }

@app.post("/predict")
def predict(payload: FeaturesPayload):
    if not model_loaded or model is None:
        return {
            "model_status": "not_ready",
            "message": "AI MODEL NOT READY — Model checkpoint not loaded on inference server",
            "risk_level": "UNKNOWN",
            "confidence": 0.0
        }

    try:
        # Extract 16 features in exact vector order
        f = payload.features
        vector = [
            f.get("total_scheduled_doses", 30.0),
            f.get("taken_doses", 25.0),
            f.get("missed_doses", 5.0),
            f.get("adherence_percentage", 83.33),
            f.get("average_response_delay_minutes", 12.5),
            f.get("recent_missed_dose_count", 1.0),
            f.get("seven_day_adherence", 85.0),
            f.get("thirty_day_adherence", 83.33),
            f.get("morning_adherence", 90.0),
            f.get("afternoon_adherence", 80.0),
            f.get("evening_adherence", 80.0),
            f.get("snooze_frequency", 2.0),
            f.get("consecutive_missed_doses", 0.0),
            f.get("recent_trend", 0.05),
            f.get("day_of_week_behavior", 0.85),
            f.get("time_of_day_behavior", 0.85)
        ]

        x_tensor = torch.tensor([vector], dtype=torch.float32)

        with torch.no_grad():
            logits = model(x_tensor)
            probs = torch.softmax(logits, dim=1).numpy()[0]

        classes = ["LOW", "MEDIUM", "HIGH"]
        pred_class_idx = int(np.argmax(probs))
        risk_level = classes[pred_class_idx]
        confidence = float(probs[pred_class_idx])

        return {
            "model_status": "loaded",
            "risk_level": risk_level,
            "confidence": confidence,
            "probabilities": {
                "LOW": float(probs[0]),
                "MEDIUM": float(probs[1]),
                "HIGH": float(probs[2])
            },
            "source": "Hugging Face Space PyTorch Inference"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
