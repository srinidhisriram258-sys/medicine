import os
import joblib
import numpy as np
from sklearn.preprocessing import StandardScaler
from typing import List, Dict, Any, Tuple
from ml.dataset import FEATURE_NAMES

SCALER_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "scaler.pkl")

def get_default_scaler_path() -> str:
    return os.path.abspath(SCALER_PATH)

def train_and_save_scaler(X_train: np.ndarray, save_path: str = None) -> StandardScaler:
    if save_path is None:
        save_path = get_default_scaler_path()
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    scaler = StandardScaler()
    scaler.fit(X_train)
    joblib.dump(scaler, save_path)
    return scaler

def load_scaler(scaler_path: str = None) -> StandardScaler:
    if scaler_path is None:
        scaler_path = get_default_scaler_path()
    if not os.path.exists(scaler_path):
        raise FileNotFoundError(f"Scaler file not found at {scaler_path}")
    return joblib.load(scaler_path)

def extract_features_from_dict(feature_dict: Dict[str, Any]) -> np.ndarray:
    """
    Extracts ordered 16-feature vector from a dictionary of raw metrics.
    """
    vector = []
    for fname in FEATURE_NAMES:
        val = feature_dict.get(fname, 0.0)
        vector.append(float(val))
    return np.array(vector, dtype=np.float32).reshape(1, -1)
