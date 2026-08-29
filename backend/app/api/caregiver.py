from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Medicine, Reminder
from app.services.adherence_calculator import compute_user_adherence_metrics
from ml.inference import predict_adherence_risk

router = APIRouter()

@router.get("/caregiver/overview")
def get_caregiver_overview(db: Session = Depends(get_db)):
    # Fetch default patient
    patient = db.query(User).filter(User.id == 1).first()
    if not patient:
        patient_name = "John Doe"
        patient_email = "patient@mediadhere.ai"
        patient_id = 1
    else:
        patient_name = patient.name
        patient_email = patient.email
        patient_id = patient.id

    metrics = compute_user_adherence_metrics(db, user_id=patient_id)
    feature_dict = metrics["features"]
    stats = metrics["stats"]

    # Run AI inference for patient
    ai_result = predict_adherence_risk(feature_dict, based_on_records=metrics["based_on_records"])

    # Recent history for caregiver view
    recent_rems = db.query(Reminder).join(Medicine).filter(Reminder.user_id == patient_id).order_by(Reminder.scheduled_for.desc()).limit(10).all()

    history = []
    for r in recent_rems:
        history.append({
            "id": r.id,
            "medicine_name": r.medicine.name if r.medicine else "Medication",
            "scheduled_for": r.scheduled_for.isoformat(),
            "status": r.status,
            "taken_at": r.taken_at.isoformat() if r.taken_at else None
        })

    med_count = db.query(Medicine).filter(Medicine.user_id == patient_id).count()

    return {
        "patient": {
            "id": patient_id,
            "name": patient_name,
            "email": patient_email,
            "total_medicines": med_count
        },
        "adherence": {
            "today_adherence": stats["today_adherence"],
            "weekly_adherence": stats["weekly_adherence"],
            "monthly_adherence": stats["monthly_adherence"],
            "missed_today": stats["total_missed"],
            "pending_today": stats["total_pending"],
            "consecutive_missed": stats["consecutive_missed"]
        },
        "ai_risk": {
            "status": ai_result.get("model_status", "not_ready"),
            "risk_level": ai_result.get("risk_level", "UNKNOWN"),
            "confidence": ai_result.get("confidence", 0.0),
            "message": ai_result.get("message", None)
        },
        "insights": metrics["insights"],
        "recent_history": history
    }
