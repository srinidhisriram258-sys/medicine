from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.adherence_calculator import compute_user_adherence_metrics
from ml.inference import check_model_availability, predict_adherence_risk, get_model_metrics

router = APIRouter()

@router.get("/ai/status")
def get_ai_status():
    """
    Returns AI Model system readiness and file paths.
    """
    return check_model_availability()

@router.get("/ai/metrics")
def get_ai_metrics():
    """
    Returns actual validation metrics produced during model training.
    """
    metrics = get_model_metrics()
    if not metrics:
        return {
            "status": "not_trained",
            "message": "Model has not been trained yet. Run 'python -m ml.train' to generate model and metrics report."
        }
    return {
        "status": "available",
        "metrics": metrics
    }

@router.post("/ai/predict")
def predict_risk(db: Session = Depends(get_db)):
    """
    Performs real PyTorch model inference using adherence feature vectors calculated from SQLite database.
    """
    metrics_data = compute_user_adherence_metrics(db, user_id=1)
    feature_dict = metrics_data["features"]
    records_count = metrics_data["based_on_records"]

    prediction = predict_adherence_risk(feature_dict, based_on_records=records_count)
    prediction["insights"] = metrics_data["insights"]
    prediction["calculated_stats"] = metrics_data["stats"]

    return prediction
