import os
import sys
from datetime import datetime, timedelta
import random

# Ensure root backend dir in path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.database import SessionLocal, Base, engine
from app.models import User, Medicine, Schedule, Reminder, AdherenceRecord

def seed_demo_data():
    print("=" * 60)
    print("MEDIADHERE AI - DEMO DATA SEEDER")
    print("=" * 60)

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Clear previous DEMO DATA
        print("[1/4] Clearing existing DEMO DATA records...")
        db.query(Reminder).filter(Reminder.is_demo == True).delete()
        db.query(AdherenceRecord).filter(AdherenceRecord.is_demo == True).delete()
        db.commit()

        # Ensure default patient user exists
        user = db.query(User).filter(User.id == 1).first()
        if not user:
            user = User(id=1, name="John Doe (Demo)", email="patient@mediadhere.ai", role="patient")
            db.add(user)
            db.commit()
            db.refresh(user)

        # Ensure demo medicines exist
        print("[2/4] Registering sample prescribed medicines...")
        med_specs = [
            {"name": "Lisinopril", "dosage": "10 mg", "frequency": "Once daily", "times": ["08:00"], "notes": "Take in morning with water for blood pressure"},
            {"name": "Metformin", "dosage": "500 mg", "frequency": "Twice daily", "times": ["08:00", "20:00"], "notes": "Take with meals for blood sugar control"},
            {"name": "Atorvastatin", "dosage": "20 mg", "frequency": "Once daily at bedtime", "times": ["21:00"], "notes": "Take at night for cholesterol"}
        ]

        medicines = []
        for spec in med_specs:
            med = db.query(Medicine).filter(Medicine.user_id == user.id, Medicine.name == spec["name"]).first()
            if not med:
                med = Medicine(
                    user_id=user.id,
                    name=spec["name"],
                    dosage=spec["dosage"],
                    frequency=spec["frequency"],
                    start_date=(datetime.now() - timedelta(days=60)).strftime("%Y-%m-%d"),
                    notes=spec["notes"]
                )
                db.add(med)
                db.commit()
                db.refresh(med)

                for t in spec["times"]:
                    db.add(Schedule(medicine_id=med.id, time_of_day=t, days_of_week="ALL"))
                db.commit()
            medicines.append((med, spec["times"]))

        # Seed 45 days of realistic historical adherence reminders
        print("[3/4] Generating 45 days of structured adherence history (DEMO DATA)...")
        now = datetime.now()
        reminders_created = 0

        random.seed(42)  # Reproducible seed pattern

        for day_offset in range(45, -1, -1):
            target_date = (now - timedelta(days=day_offset)).date()

            for med, times in medicines:
                for t in times:
                    hh, mm = map(int, t.split(":"))
                    sched_dt = datetime(target_date.year, target_date.month, target_date.day, hh, mm)

                    # Simulate realistic adherence behavior: 78% taken on time, 12% late, 10% missed
                    if sched_dt > now:
                        status = "pending"
                        taken_at = None
                        delay_min = 0.0
                    else:
                        rand_val = random.random()
                        if rand_val < 0.75:
                            status = "taken"
                            delay_min = float(random.randint(1, 15))
                            taken_at = sched_dt + timedelta(minutes=delay_min)
                        elif rand_val < 0.87:
                            status = "taken"
                            delay_min = float(random.randint(25, 90))
                            taken_at = sched_dt + timedelta(minutes=delay_min)
                        else:
                            status = "missed"
                            taken_at = None
                            delay_min = 0.0

                    rem = Reminder(
                        medicine_id=med.id,
                        user_id=user.id,
                        scheduled_for=sched_dt,
                        status=status,
                        taken_at=taken_at,
                        delay_minutes=delay_min,
                        is_demo=True
                    )
                    db.add(rem)
                    reminders_created += 1

        db.commit()
        print(f"[4/4] Successfully seeded {reminders_created} DEMO DATA reminders.")
        print("=" * 60)
        print("SEEDING COMPLETED SUCCESSFULLY!")
        print("=" * 60)

    except Exception as e:
        db.rollback()
        print(f"Error seeding demo data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_demo_data()
