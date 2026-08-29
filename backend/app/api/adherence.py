from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Reminder, Medicine
from app.services.adherence_calculator import compute_user_adherence_metrics

router = APIRouter()

@router.get("/adherence")
def get_adherence_summary(db: Session = Depends(get_db)):
    metrics = compute_user_adherence_metrics(db, user_id=1)
    return metrics["stats"]

@router.get("/adherence/history")
def get_adherence_history(limit: int = 50, db: Session = Depends(get_db)):
    reminders = db.query(Reminder).join(Medicine).filter(Reminder.user_id == 1).order_by(Reminder.scheduled_for.desc()).limit(limit).all()

    history = []
    for r in reminders:
        history.append({
            "id": r.id,
            "medicine_name": r.medicine.name if r.medicine else "Unknown",
            "dosage": r.medicine.dosage if r.medicine else "",
            "scheduled_for": r.scheduled_for.isoformat(),
            "status": r.status,
            "taken_at": r.taken_at.isoformat() if r.taken_at else None,
            "delay_minutes": r.delay_minutes or 0.0,
            "is_demo": r.is_demo or False
        })

    return {
        "total_records": len(history),
        "history": history
    }
