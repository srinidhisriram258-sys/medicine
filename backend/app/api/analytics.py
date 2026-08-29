from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database import get_db
from app.models import Reminder, Medicine
from app.services.adherence_calculator import compute_user_adherence_metrics

router = APIRouter()

@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db)):
    metrics = compute_user_adherence_metrics(db, user_id=1)
    all_reminders = db.query(Reminder).join(Medicine).filter(Reminder.user_id == 1).all()

    now = datetime.now()

    # 1. 7-Day Trend
    seven_days = [(now.date() - timedelta(days=i)) for i in range(6, -1, -1)]
    trend_7d = []
    for d in seven_days:
        day_str = d.strftime("%b %d")
        d_rems = [r for r in all_reminders if r.scheduled_for.date() == d]
        scheduled = len(d_rems)
        taken = len([r for r in d_rems if r.status == "taken"])
        missed = len([r for r in d_rems if r.status == "missed"])
        pct = round((taken / scheduled * 100.0), 1) if scheduled > 0 else 100.0
        trend_7d.append({
            "date": day_str,
            "adherence": pct,
            "taken": taken,
            "missed": missed,
            "scheduled": scheduled
        })

    # 2. 30-Day Aggregated Trend (Weekly 4 bins)
    thirty_days_trend = []
    for week_idx in range(4, 0, -1):
        w_start = now - timedelta(days=week_idx * 7)
        w_end = now - timedelta(days=(week_idx - 1) * 7)
        w_rems = [r for r in all_reminders if w_start <= r.scheduled_for < w_end]
        sched = len(w_rems)
        tkn = len([r for r in w_rems if r.status == "taken"])
        pct = round((tkn / sched * 100.0), 1) if sched > 0 else 100.0
        thirty_days_trend.append({
            "period": f"Week {5 - week_idx}",
            "adherence": pct,
            "taken": tkn,
            "scheduled": sched
        })

    # 3. Medicine-Wise Breakdown
    medicines = db.query(Medicine).filter(Medicine.user_id == 1).all()
    med_breakdown = []
    for m in medicines:
        m_rems = [r for r in all_reminders if r.medicine_id == m.id]
        sched = len(m_rems)
        taken = len([r for r in m_rems if r.status == "taken"])
        missed = len([r for r in m_rems if r.status == "missed"])
        pct = round((taken / sched * 100.0), 1) if sched > 0 else 100.0
        med_breakdown.append({
            "name": m.name,
            "dosage": m.dosage,
            "adherence": pct,
            "taken": taken,
            "missed": missed,
            "total": sched
        })

    # 4. Time-of-day Breakdown
    tod_rems = {"Morning (6-12)": [], "Afternoon (12-18)": [], "Evening (18-24)": []}
    for r in all_reminders:
        h = r.scheduled_for.hour
        if 6 <= h < 12:
            tod_rems["Morning (6-12)"].append(r)
        elif 12 <= h < 18:
            tod_rems["Afternoon (12-18)"].append(r)
        else:
            tod_rems["Evening (18-24)"].append(r)

    tod_breakdown = []
    for tod_label, r_list in tod_rems.items():
        sched = len(r_list)
        taken = len([r for r in r_list if r.status == "taken"])
        pct = round((taken / sched * 100.0), 1) if sched > 0 else 100.0
        tod_breakdown.append({
            "time_slot": tod_label,
            "adherence": pct,
            "taken": taken,
            "total": sched
        })

    # 5. Weekly Day-of-Week Trend
    days_map = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    dow_stats = {d: {"taken": 0, "missed": 0, "total": 0} for d in days_map}
    for r in all_reminders:
        d_name = days_map[r.scheduled_for.weekday()]
        dow_stats[d_name]["total"] += 1
        if r.status == "taken":
            dow_stats[d_name]["taken"] += 1
        elif r.status == "missed":
            dow_stats[d_name]["missed"] += 1

    dow_breakdown = []
    for d_name in days_map:
        st = dow_stats[d_name]
        pct = round((st["taken"] / st["total"] * 100.0), 1) if st["total"] > 0 else 100.0
        dow_breakdown.append({
            "day": d_name,
            "adherence": pct,
            "taken": st["taken"],
            "missed": st["missed"]
        })

    # 6. Overall Taken vs Missed
    tot_taken = sum(m["taken"] for m in trend_7d)
    tot_missed = sum(m["missed"] for m in trend_7d)

    return {
        "trend_7d": trend_7d,
        "trend_30d": thirty_days_trend,
        "medicine_breakdown": med_breakdown,
        "time_of_day_breakdown": tod_breakdown,
        "day_of_week_breakdown": dow_breakdown,
        "overall": {
            "taken": tot_taken,
            "missed": tot_missed,
            "rate": metrics["stats"]["weekly_adherence"]
        }
    }
