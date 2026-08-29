from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from app.database import get_db
from app.models import Reminder, Medicine, PushSubscription
from app.schemas import ReminderResponse
from app.services.scheduler_service import send_web_push_notification

router = APIRouter()

@router.get("/reminders", response_model=List[ReminderResponse])
def get_reminders(filter_status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Reminder).join(Medicine).filter(Reminder.user_id == 1)
    if filter_status:
        query = query.filter(Reminder.status == filter_status.lower())

    reminders = query.order_by(Reminder.scheduled_for.asc()).all()

    result = []
    for r in reminders:
        result.append(ReminderResponse(
            id=r.id,
            medicine_id=r.medicine_id,
            medicine_name=r.medicine.name if r.medicine else "Unknown",
            dosage=r.medicine.dosage if r.medicine else "",
            scheduled_for=r.scheduled_for.isoformat(),
            status=r.status,
            escalation_level=r.escalation_level or 0,
            taken_at=r.taken_at.isoformat() if r.taken_at else None,
            snoozed_at=r.snoozed_at.isoformat() if r.snoozed_at else None,
            delay_minutes=r.delay_minutes or 0.0,
            is_demo=r.is_demo or False
        ))
    return result

@router.post("/reminders/test")
def trigger_reminder_test_endpoint(db: Session = Depends(get_db)):
    """
    Development-only endpoint: Triggers an actual Web Push notification to currently registered browser subscription.
    """
    now = datetime.now()
    subs = db.query(PushSubscription).filter(PushSubscription.user_id == 1).all()
    dummy_rem = Reminder(id=8888, user_id=1, scheduled_for=now, status="pending")

    status_str = send_web_push_notification(db, dummy_rem, med_name="Lisinopril", dosage="10 mg", level="TEST")

    return {
        "status": status_str,
        "subscriptions_found": len(subs),
        "timestamp": now.isoformat(),
        "message": f"Test reminder Web Push triggered via pywebpush. Status: {status_str}."
    }

@router.post("/reminders/{id}/taken", response_model=ReminderResponse)
def mark_reminder_taken(id: int, db: Session = Depends(get_db)):
    rem = db.query(Reminder).filter(Reminder.id == id).first()
    if not rem:
        raise HTTPException(status_code=404, detail="Reminder not found")

    now = datetime.now()
    rem.status = "taken"
    rem.taken_at = now
    
    if rem.scheduled_for:
        delay = (now - rem.scheduled_for).total_seconds() / 60.0
        rem.delay_minutes = max(0.0, delay)

    db.commit()
    db.refresh(rem)

    return ReminderResponse(
        id=rem.id,
        medicine_id=rem.medicine_id,
        medicine_name=rem.medicine.name if rem.medicine else "Unknown",
        dosage=rem.medicine.dosage if rem.medicine else "",
        scheduled_for=rem.scheduled_for.isoformat(),
        status=rem.status,
        escalation_level=rem.escalation_level or 0,
        taken_at=rem.taken_at.isoformat() if rem.taken_at else None,
        snoozed_at=rem.snoozed_at.isoformat() if rem.snoozed_at else None,
        delay_minutes=rem.delay_minutes or 0.0,
        is_demo=rem.is_demo or False
    )

@router.post("/reminders/{id}/missed", response_model=ReminderResponse)
def mark_reminder_missed(id: int, db: Session = Depends(get_db)):
    rem = db.query(Reminder).filter(Reminder.id == id).first()
    if not rem:
        raise HTTPException(status_code=404, detail="Reminder not found")

    rem.status = "missed"
    rem.delay_minutes = 0.0
    db.commit()
    db.refresh(rem)

    return ReminderResponse(
        id=rem.id,
        medicine_id=rem.medicine_id,
        medicine_name=rem.medicine.name if rem.medicine else "Unknown",
        dosage=rem.medicine.dosage if rem.medicine else "",
        scheduled_for=rem.scheduled_for.isoformat(),
        status=rem.status,
        escalation_level=rem.escalation_level or 0,
        taken_at=None,
        snoozed_at=None,
        delay_minutes=0.0,
        is_demo=rem.is_demo or False
    )

@router.post("/reminders/{id}/snooze", response_model=ReminderResponse)
def snooze_reminder(id: int, minutes: int = 15, db: Session = Depends(get_db)):
    rem = db.query(Reminder).filter(Reminder.id == id).first()
    if not rem:
        raise HTTPException(status_code=404, detail="Reminder not found")

    now = datetime.now()
    rem.status = "snoozed"
    rem.snoozed_at = now
    rem.scheduled_for = now + timedelta(minutes=minutes)
    rem.escalation_level = 0

    db.commit()
    db.refresh(rem)

    return ReminderResponse(
        id=rem.id,
        medicine_id=rem.medicine_id,
        medicine_name=rem.medicine.name if rem.medicine else "Unknown",
        dosage=rem.medicine.dosage if rem.medicine else "",
        scheduled_for=rem.scheduled_for.isoformat(),
        status=rem.status,
        escalation_level=0,
        taken_at=None,
        snoozed_at=rem.snoozed_at.isoformat(),
        delay_minutes=rem.delay_minutes or 0.0,
        is_demo=rem.is_demo or False
    )
