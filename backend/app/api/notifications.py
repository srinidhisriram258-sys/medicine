from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List

from app.database import get_db
from app.models import PushSubscription, NotificationLog, Reminder
from app.schemas import PushSubscriptionSchema, TestNotificationRequest, NotificationLogResponse
from app.services.vapid_keys import get_or_generate_vapid_keys
from app.services.scheduler_service import send_web_push_notification, is_scheduler_running

router = APIRouter()

@router.get("/notifications/vapid-public-key")
def get_vapid_public_key():
    keys = get_or_generate_vapid_keys()
    return {
        "public_key": keys["public_key"],
        "subscriber": keys["subscriber"]
    }

@router.post("/notifications/subscribe")
def subscribe_push(sub_in: PushSubscriptionSchema, db: Session = Depends(get_db)):
    existing = db.query(PushSubscription).filter(PushSubscription.endpoint == sub_in.endpoint).first()
    if not existing:
        sub = PushSubscription(
            user_id=1,
            endpoint=sub_in.endpoint,
            p256dh=sub_in.keys.p256dh,
            auth=sub_in.keys.auth
        )
        db.add(sub)
        db.commit()

    return {"status": "subscribed", "message": "PWA Web Push Subscription registered successfully."}

@router.post("/notifications/test-trigger")
def trigger_test_notification(req: TestNotificationRequest, db: Session = Depends(get_db)):
    channel = req.channel or "Web Push"
    
    subs = db.query(PushSubscription).filter(PushSubscription.user_id == 1).all()
    
    if channel == "WhatsApp":
        return {
            "status": "NOT CONFIGURED",
            "channel": "WhatsApp",
            "message": "WhatsApp notifications require provider configuration (WHATSAPP_ACCOUNT_SID / WHATSAPP_AUTH_TOKEN)."
        }

    # Create dummy reminder object for test dispatch
    now = datetime.now()
    dummy_rem = Reminder(id=9999, user_id=1, scheduled_for=now, status="pending")
    status_str = send_web_push_notification(db, dummy_rem, med_name="TEST MEDICINE (Lisinopril)", dosage="10 mg", level="TEST")

    return {
        "status": status_str,
        "channel": channel,
        "subscriptions_count": len(subs),
        "message": f"Test notification triggered via {channel}. Status: {status_str}."
    }

@router.get("/notifications/diagnostics")
def get_notification_diagnostics(db: Session = Depends(get_db)):
    now = datetime.now()
    subs_count = db.query(PushSubscription).filter(PushSubscription.user_id == 1).count()
    pending_count = db.query(Reminder).filter(Reminder.user_id == 1, Reminder.status == "pending", Reminder.scheduled_for >= now - timedelta(minutes=30)).count()

    next_rem = db.query(Reminder).filter(Reminder.user_id == 1, Reminder.status == "pending", Reminder.scheduled_for >= now - timedelta(minutes=30)).order_by(Reminder.scheduled_for.asc()).first()
    last_log = db.query(NotificationLog).filter(NotificationLog.user_id == 1).order_by(NotificationLog.notification_time.desc()).first()

    return {
        "scheduler_running": is_scheduler_running(),
        "push_subscriptions_count": subs_count,
        "push_subscription_status": "ACTIVE" if subs_count > 0 else "MISSING",
        "pending_doses": pending_count,
        "next_reminder": next_rem.scheduled_for.isoformat() if next_rem else None,
        "last_notification": {
            "time": last_log.notification_time.isoformat() if last_log else None,
            "channel": last_log.channel if last_log else None,
            "status": last_log.status if last_log else None
        } if last_log else None
    }

@router.get("/notifications/logs", response_model=List[NotificationLogResponse])
def get_notification_logs(db: Session = Depends(get_db)):
    logs = db.query(NotificationLog).filter(NotificationLog.user_id == 1).order_by(NotificationLog.notification_time.desc()).limit(50).all()

    res = []
    for l in logs:
        res.append(NotificationLogResponse(
            id=l.id,
            medicine_name=l.medicine_name,
            dosage=l.dosage,
            scheduled_for=l.scheduled_for.isoformat(),
            notification_time=l.notification_time.isoformat(),
            channel=l.channel,
            status=l.status,
            action_taken=l.action_taken
        ))
    return res
