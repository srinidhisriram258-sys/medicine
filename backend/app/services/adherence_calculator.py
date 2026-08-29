from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Dict, Any, List
from app.models import Reminder, Medicine, AdherenceRecord

def compute_user_adherence_metrics(db: Session, user_id: int = 1) -> Dict[str, Any]:
    """
    Retrieves database records for user and computes real adherence statistics and feature vectors.
    """
    now = datetime.utcnow()
    seven_days_ago = now - timedelta(days=7)
    thirty_days_ago = now - timedelta(days=30)

    # Fetch all reminders for this user
    all_reminders = db.query(Reminder).filter(Reminder.user_id == user_id).all()
    
    total_reminders = len(all_reminders)
    if total_reminders == 0:
        # Default empty profile
        return {
            "features": {
                "doses_scheduled": 0.0,
                "doses_taken": 0.0,
                "doses_missed": 0.0,
                "adherence_pct": 100.0,
                "consecutive_missed_doses": 0.0,
                "avg_delay_minutes": 0.0,
                "morning_adherence_rate": 1.0,
                "afternoon_adherence_rate": 1.0,
                "evening_adherence_rate": 1.0,
                "weekday_adherence_rate": 1.0,
                "weekend_adherence_rate": 1.0,
                "recent_7d_adherence": 100.0,
                "recent_30d_adherence": 100.0,
                "num_reminders": 0.0,
                "avg_response_time_min": 0.0,
                "medicine_frequency": 1.0
            },
            "stats": {
                "today_adherence": 100.0,
                "weekly_adherence": 100.0,
                "monthly_adherence": 100.0,
                "total_scheduled": 0,
                "total_taken": 0,
                "total_missed": 0,
                "total_pending": 0,
                "consecutive_missed": 0,
                "avg_delay_minutes": 0.0
            },
            "insights": ["No medication reminders recorded yet."],
            "based_on_records": 0
        }

    taken_reminders = [r for r in all_reminders if r.status == "taken"]
    missed_reminders = [r for r in all_reminders if r.status == "missed"]
    pending_reminders = [r for r in all_reminders if r.status == "pending"]

    doses_scheduled = float(len(all_reminders))
    doses_taken = float(len(taken_reminders))
    doses_missed = float(len(missed_reminders))
    adherence_pct = round((doses_taken / (doses_scheduled - len(pending_reminders))) * 100.0, 1) if (doses_scheduled - len(pending_reminders)) > 0 else 100.0

    # Calculate consecutive missed doses from recent timeline
    sorted_reminders = sorted(all_reminders, key=lambda r: r.scheduled_for, reverse=True)
    consecutive_missed = 0
    for r in sorted_reminders:
        if r.status == "missed":
            consecutive_missed += 1
        elif r.status == "taken":
            break

    # Response delays
    delays = [r.delay_minutes for r in taken_reminders if r.delay_minutes is not None]
    avg_delay = float(sum(delays) / len(delays)) if delays else 0.0

    # Time of day breakdowns
    morning_sched, morning_taken = 0, 0
    afternoon_sched, afternoon_taken = 0, 0
    evening_sched, evening_taken = 0, 0

    weekday_sched, weekday_taken = 0, 0
    weekend_sched, weekend_taken = 0, 0

    r7_sched, r7_taken = 0, 0
    r30_sched, r30_taken = 0, 0

    for r in all_reminders:
        hour = r.scheduled_for.hour
        is_taken = (r.status == "taken")
        is_finished = (r.status in ["taken", "missed"])

        if is_finished:
            # Time of day
            if 6 <= hour < 12:
                morning_sched += 1
                if is_taken: morning_taken += 1
            elif 12 <= hour < 18:
                afternoon_sched += 1
                if is_taken: afternoon_taken += 1
            else:
                evening_sched += 1
                if is_taken: evening_taken += 1

            # Day of week
            if r.scheduled_for.weekday() < 5:
                weekday_sched += 1
                if is_taken: weekday_taken += 1
            else:
                weekend_sched += 1
                if is_taken: weekend_taken += 1

            # Recency
            if r.scheduled_for >= seven_days_ago:
                r7_sched += 1
                if is_taken: r7_taken += 1
            if r.scheduled_for >= thirty_days_ago:
                r30_sched += 1
                if is_taken: r30_taken += 1

    morning_rate = float(morning_taken / morning_sched) if morning_sched > 0 else 1.0
    afternoon_rate = float(afternoon_taken / afternoon_sched) if afternoon_sched > 0 else 1.0
    evening_rate = float(evening_taken / evening_sched) if evening_sched > 0 else 1.0

    weekday_rate = float(weekday_taken / weekday_sched) if weekday_sched > 0 else 1.0
    weekend_rate = float(weekend_taken / weekend_sched) if weekend_sched > 0 else 1.0

    r7_pct = float(r7_taken / r7_sched * 100.0) if r7_sched > 0 else adherence_pct
    r30_pct = float(r30_taken / r30_sched * 100.0) if r30_sched > 0 else adherence_pct

    # Average medicine frequency
    user_meds = db.query(Medicine).filter(Medicine.user_id == user_id).all()
    med_freq = float(len(user_meds)) if user_meds else 1.0

    feature_dict = {
        "doses_scheduled": doses_scheduled,
        "doses_taken": doses_taken,
        "doses_missed": doses_missed,
        "adherence_pct": float(adherence_pct),
        "consecutive_missed_doses": float(consecutive_missed),
        "avg_delay_minutes": float(avg_delay),
        "morning_adherence_rate": float(morning_rate),
        "afternoon_adherence_rate": float(afternoon_rate),
        "evening_adherence_rate": float(evening_rate),
        "weekday_adherence_rate": float(weekday_rate),
        "weekend_adherence_rate": float(weekend_rate),
        "recent_7d_adherence": float(r7_pct),
        "recent_30d_adherence": float(r30_pct),
        "num_reminders": float(total_reminders),
        "avg_response_time_min": float(avg_delay),
        "medicine_frequency": float(med_freq)
    }

    # Generate explainable insights strictly from data calculations
    insights = []
    if r7_pct < r30_pct:
        insights.append(f"Recent adherence ({r7_pct:.1f}%) has decreased compared to your 30-day average ({r30_pct:.1f}%).")
    elif r7_pct > r30_pct:
        insights.append(f"Great improvement! Recent 7-day adherence ({r7_pct:.1f}%) is higher than your 30-day baseline.")

    lowest_tod = min([("morning", morning_rate), ("afternoon", afternoon_rate), ("evening", evening_rate)], key=lambda x: x[1])
    if lowest_tod[1] < 0.8:
        insights.append(f"Most missed or delayed doses occurred during the {lowest_tod[0]} schedule ({lowest_tod[1]*100:.0f}% adherence rate).")

    if weekday_rate > weekend_rate + 0.1:
        insights.append(f"Adherence is noticeably higher on weekdays ({weekday_rate*100:.0f}%) than on weekends ({weekend_rate*100:.0f}%).")
    elif weekend_rate > weekday_rate + 0.1:
        insights.append(f"Adherence is higher on weekends ({weekend_rate*100:.0f}%) than on weekdays ({weekday_rate*100:.0f}%).")

    if consecutive_missed >= 2:
        insights.append(f"Attention: {consecutive_missed} consecutive missed doses recorded recently.")

    if avg_delay > 30:
        insights.append(f"Average response delay is {avg_delay:.0f} minutes after scheduled notification time.")

    if not insights:
        insights.append("Your medication adherence history shows consistent routine across scheduled times.")

    stats = {
        "today_adherence": round(r7_pct, 1),
        "weekly_adherence": round(r7_pct, 1),
        "monthly_adherence": round(r30_pct, 1),
        "total_scheduled": int(doses_scheduled),
        "total_taken": int(doses_taken),
        "total_missed": int(doses_missed),
        "total_pending": len(pending_reminders),
        "consecutive_missed": consecutive_missed,
        "avg_delay_minutes": round(avg_delay, 1)
    }

    return {
        "features": feature_dict,
        "stats": stats,
        "insights": insights,
        "based_on_records": total_reminders
    }
