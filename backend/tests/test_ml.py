import sys
import os
import torch
import numpy as np
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ml.dataset import generate_synthetic_adherence_data, FEATURE_NAMES
from ml.model import AdherenceRiskNet
from ml.metrics import compute_model_metrics
from ml.inference import predict_adherence_risk, check_model_availability

def test_synthetic_dataset_generator():
    df = generate_synthetic_adherence_data(num_samples=100)
    assert len(df) == 100
    assert "risk_class" in df.columns
    for fname in FEATURE_NAMES:
        assert fname in df.columns

def test_adherence_risk_net_forward():
    model = AdherenceRiskNet(input_dim=16, num_classes=3)
    dummy_input = torch.randn(4, 16)
    logits = model(dummy_input)
    assert logits.shape == (4, 3)

    probs = model.predict_proba(dummy_input)
    assert probs.shape == (4, 3)
    # Check probabilities sum to ~1.0
    sum_probs = torch.sum(probs, dim=1)
    for s in sum_probs:
        assert abs(s.item() - 1.0) < 1e-4

def test_metrics_evaluator():
    y_true = np.array([0, 1, 2, 0, 1, 2])
    y_pred = np.array([0, 1, 2, 0, 2, 1])
    metrics = compute_model_metrics(y_true, y_pred)
    assert "accuracy" in metrics
    assert "precision" in metrics
    assert "f1_score" in metrics
    assert len(metrics["confusion_matrix"]) == 3

def test_missing_model_behavior():
    # Test fallback response when model isn't trained yet
    avail = check_model_availability()
    assert "status" in avail
    assert "training_command" in avail
