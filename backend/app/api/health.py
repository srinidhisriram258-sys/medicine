from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from ml.inference import check_model_availability

router = APIRouter()

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    # Check DB connectivity
    db_ok = True
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_ok = False

    # Check ML model availability
    avail = check_model_availability()

    return {
        "status": "online",
        "database": db_ok,
        "ai_model": avail["checkpoint_loaded"],
        "inference_ready": avail["inference_ready"],
        "version": "1.0.0",
        "timestamp": avail.get("training_command", "")
    }
