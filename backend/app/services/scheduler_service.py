import os
import json
import logging
from datetime import datetime, timedelta
from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session
from pywebpush import webpush, WebPushException

from app.database import SessionLocal
from app.models import Reminder, Medicine, User, PushSubscription, NotificationLog
from app.services.vapid_keys import get_or_generate_vapid_keys

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("scheduler")

scheduler = None

def get_current_local_time() -> datetime:
    """
    Returns current local time consistent with Asia/Kolkata timezone.
    """
    return datetime.now()

def process_due_reminders():
    """
    Server-side background worker job executing every 15 seconds.
    Monitors database for due reminders, sends Web Push notifications, handles escalation, and marks missed doses.
    """
    db: Session = SessionLocal()
    try:
        now = get_current_local_time()

        # 1. Primary Due Reminders: scheduled_for <= now and escalation_level == 0 and status == "pending"
        due_reminders = db.query(Reminder).filter(
            Reminder.status == "pending",
            Reminder.scheduled_for <= now,
            Reminder.escalation_level == 0
        ).all()

        for rem in due_reminders:
            med_name = rem.medicine.name if rem.medicine else "Medication"
            dosage = rem.medicine.dosage if rem.medicine else "Prescribed dose"
            logger.info(f"[REMINDER ENGINE] Dose #{rem.id} ({med_name}) due at {rem.scheduled_for}")
            
            # Send Web Push Notification
            status_str = send_web_push_notification(db, rem, med_name, dosage, level="PRIMARY")
            rem.escalation_level = 1
            db.commit()

        # 2. Escalation Check: 10 minutes past scheduled time (Level 1 -> 2)
        ten_min_ago = now - timedelta(minutes=10)
        escalate_reminders = db.query(Reminder).filter(
            Reminder.status == "pending",
            Reminder.scheduled_for <= ten_min_ago,
            Reminder.escalation_level == 1
        ).all()

        for rem in escalate_reminders:
            med_name = rem.medicine.name if rem.medicine else "Medication"
            dosage = rem.medicine.dosage if rem.medicine else "Prescribed dose"
            logger.info(f"[REMINDER ENGINE] Dose #{rem.id} ({med_name}) escalation 10m triggered")

            send_web_push_notification(db, rem, med_name, dosage, level="ESCALATION (10m)")
            rem.escalation_level = 2
            db.commit()

        # 3. Grace Period Expiration Check: 30 minutes past scheduled time without action -> MISSED
        thirty_min_ago = now - timedelta(minutes=30)
        expired_reminders = db.query(Reminder).filter(
            Reminder.status == "pending",
            Reminder.scheduled_for <= thirty_min_ago
        ).all()

        for rem in expired_reminders:
            logger.info(f"[REMINDER ENGINE] Dose #{rem.id} grace period expired (30m+). Transitioning status to MISSED.")
            rem.status = "missed"
            rem.delay_minutes = 0.0
            
            db.add(NotificationLog(
                user_id=rem.user_id,
                medicine_name=rem.medicine.name if rem.medicine else "Medication",
                dosage=rem.medicine.dosage if rem.medicine else "",
                scheduled_for=rem.scheduled_for,
                channel="Scheduler Auto-Missed",
                status="EXPIRED_MISSED",
                action_taken="MISSED"
            ))
            db.commit()

    except Exception as e:
        logger.error(f"[REMINDER ENGINE ERROR] {e}")
    finally:
        db.close()

def send_web_push_notification(db: Session, rem: Reminder, med_name: str, dosage: str, level: str = "PRIMARY") -> str:
    """
    Sends Web Push HTTP notification payload via pywebpush to all subscriptions for user.
    """
    subs = db.query(PushSubscription).filter(PushSubscription.user_id == rem.user_id).all()
    logger.info(f"[WEB PUSH] Subscriptions found for user {rem.user_id}: {len(subs)}")

    vapid_keys = get_or_generate_vapid_keys()

    payload = {
        "title": "MEDIADHERE AI — MEDICATION REMINDER",
        "body": f"Time to take your scheduled {med_name} ({dosage}).",
        "reminder_id": rem.id,
        "medicine_name": med_name,
        "dosage": dosage,
        "level": level,
        "timestamp": rem.scheduled_for.isoformat()
    }

    delivery_status = "SENT"
    if not subs:
        delivery_status = "NO_SUBSCRIPTION"
        logger.warning(f"[WEB PUSH] No active push subscriptions registered for user {rem.user_id}.")

    for sub in subs:
        try:
            webpush(
                subscription_info={
                    "endpoint": sub.endpoint,
                    "keys": {
                        "p256dh": sub.p256dh,
                        "auth": sub.auth
                    }
                },
                data=json.dumps(payload),
                vapid_private_key=vapid_keys["private_key_file"],
                vapid_claims={"sub": vapid_keys["subscriber"]}
            )
            delivery_status = "DELIVERED"
            logger.info(f"[WEB PUSH] Notification sent successfully to endpoint {sub.endpoint[:30]}...")
        except WebPushException as ex:
            delivery_status = "FAILED"
            logger.error(f"[WEB PUSH ERROR] Push delivery failed for endpoint: {ex}")
            if ex.response and ex.response.status_code in [404, 410]:
                logger.info(f"[WEB PUSH] Removing expired subscription {sub.id}")
                db.delete(sub)
                db.commit()
        except Exception as ex:
            delivery_status = "FAILED"
            logger.error(f"[WEB PUSH ERROR] General push failure: {ex}")

    log_entry = NotificationLog(
        user_id=rem.user_id,
        medicine_name=med_name,
        dosage=dosage,
        scheduled_for=rem.scheduled_for,
        channel=f"Web Push PWA ({level})",
        status=delivery_status
    )
    db.add(log_entry)
    db.commit()

    return delivery_status

def is_scheduler_running() -> bool:
    global scheduler
    return bool(scheduler and scheduler.running)

def start_reminder_scheduler():
    global scheduler
    if scheduler is None or not scheduler.running:
        scheduler = BackgroundScheduler()
        scheduler.add_job(process_due_reminders, 'interval', seconds=15, id='mediadhere_reminder_job', replace_existing=True)
        scheduler.start()
        print("[REMINDER ENGINE] Scheduler started successfully.")

def shutdown_reminder_scheduler():
    global scheduler
    if scheduler and scheduler.running:
        scheduler.shutdown()
        print("[REMINDER ENGINE] Scheduler stopped.")
