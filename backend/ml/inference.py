import os
import json
import torch
import numpy as np
from typing import Dict, Any, Tuple

from ml.model import AdherenceRiskNet
from ml.preprocessing import load_scaler, extract_features_from_dict, SCALER_PATH
from ml.dataset import FEATURE_NAMES

MODEL_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models", "adherence_risk_model.pth"))
METRICS_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models", "metrics.json"))

RISK_LABELS = {
    0: "LOW",
    1: "MEDIUM",
    2: "HIGH"
}

def check_model_availability() -> Dict[str, Any]:
    """
    Checks whether PyTorch, model checkpoint, and scaler files exist.
    """
    pytorch_installed = True
    checkpoint_exists = os.path.exists(MODEL_PATH)
    scaler_exists = os.path.exists(SCALER_PATH)
    metrics_exists = os.path.exists(METRICS_PATH)

    ready = pytorch_installed and checkpoint_exists and scaler_exists

    return {
        "status": "ready" if ready else "not_ready",
        "pytorch_installed": pytorch_installed,
        "checkpoint_loaded": checkpoint_exists,
        "scaler_loaded": scaler_exists,
        "metrics_loaded": metrics_exists,
        "inference_ready": ready,
        "checkpoint_path": MODEL_PATH if checkpoint_exists else "NOT FOUND",
        "scaler_path": SCALER_PATH if scaler_exists else "NOT FOUND",
        "training_command": "python -m ml.train"
    }

def get_model_metrics() -> Dict[str, Any]:
    """
    Retrieves real metrics saved during training. Returns None if not trained yet.
    """
    if not os.path.exists(METRICS_PATH):
        return None
    try:
        with open(METRICS_PATH, "r") as f:
            return json.load(f)
    except Exception:
        return None

def predict_adherence_risk(feature_dict: Dict[str, Any], based_on_records: int = 0) -> Dict[str, Any]:
    """
    Runs actual PyTorch inference using saved model weights.
    Returns real prediction or model_status='not_ready' if missing.
    """
    avail = check_model_availability()
    if not avail["inference_ready"]:
        return {
            "model_status": "not_ready",
            "risk_level": "UNKNOWN",
            "confidence": 0.0,
            "probabilities": {"LOW": 0.0, "MEDIUM": 0.0, "HIGH": 0.0},
            "based_on_records": based_on_records,
            "message": "Adherence AI model is not currently loaded."
        }

    try:
        # Load scaler
        scaler = load_scaler(SCALER_PATH)

        # Extract features & scale
        raw_vec = extract_features_from_dict(feature_dict)
        scaled_vec = scaler.transform(raw_vec)
        tensor_vec = torch.tensor(scaled_vec, dtype=torch.float32)

        # Load PyTorch model
        model = AdherenceRiskNet(input_dim=len(FEATURE_NAMES), num_classes=3)
        model.load_state_dict(torch.load(MODEL_PATH, map_location=torch.device('cpu')))
        model.eval()

        # Run Softmax inference
        probabilities = model.predict_proba(tensor_vec).numpy()[0]
        predicted_class_idx = int(np.argmax(probabilities))
        risk_level = RISK_LABELS.get(predicted_class_idx, "UNKNOWN")
        confidence = float(probabilities[predicted_class_idx])

        prob_dict = {
            "LOW": float(probabilities[0]),
            "MEDIUM": float(probabilities[1]),
            "HIGH": float(probabilities[2])
        }

        return {
            "model_status": "loaded",
            "risk_level": risk_level,
            "confidence": round(confidence, 4),
            "probabilities": prob_dict,
            "based_on_records": based_on_records,
            "feature_summary": {k: float(feature_dict.get(k, 0.0)) for k in FEATURE_NAMES}
        }
    except Exception as e:
        return {
            "model_status": "error",
            "error": str(e),
            "risk_level": "UNKNOWN",
            "confidence": 0.0,
            "based_on_records": based_on_records,
            "message": f"Inference failed: {str(e)}"
        }
