from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from app.database import get_db
from app.models import Medicine, Schedule, Reminder, User
from app.schemas import MedicineCreate, MedicineResponse

router = APIRouter()

def get_or_create_default_user(db: Session) -> User:
    user = db.query(User).filter(User.id == 1).first()
    if not user:
        user = User(id=1, name="John Doe", email="patient@mediadhere.ai", role="patient")
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

@router.get("/medicines", response_model=List[MedicineResponse])
def get_medicines(db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    return db.query(Medicine).filter(Medicine.user_id == user.id).all()

@router.post("/medicines", response_model=MedicineResponse, status_code=status.HTTP_201_CREATED)
def create_medicine(med_in: MedicineCreate, db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)

    med = Medicine(
        user_id=user.id,
        name=med_in.name,
        dosage=med_in.dosage,
        frequency=med_in.frequency,
        start_date=med_in.start_date,
        end_date=med_in.end_date,
        notes=med_in.notes
    )
    db.add(med)
    db.commit()
    db.refresh(med)

    # Save schedule times
    for stime in med_in.scheduled_times:
        sched = Schedule(medicine_id=med.id, time_of_day=stime, days_of_week="ALL")
        db.add(sched)
    
    # Generate reminders for the upcoming 7 days
    today = datetime.now().date()
    for day_offset in range(7):
        target_date = today + timedelta(days=day_offset)
        for stime in med_in.scheduled_times:
            try:
                hh, mm = map(int, stime.split(":"))
                sched_dt = datetime(target_date.year, target_date.month, target_date.day, hh, mm)
                status_str = "pending"
                if sched_dt < datetime.now():
                    status_str = "pending"
                
                rem = Reminder(
                    medicine_id=med.id,
                    user_id=user.id,
                    scheduled_for=sched_dt,
                    status=status_str,
                    is_demo=False
                )
                db.add(rem)
            except Exception:
                pass

    db.commit()
    db.refresh(med)
    return med

@router.put("/medicines/{id}", response_model=MedicineResponse)
def update_medicine(id: int, med_in: MedicineCreate, db: Session = Depends(get_db)):
    med = db.query(Medicine).filter(Medicine.id == id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medicine not found")

    med.name = med_in.name
    med.dosage = med_in.dosage
    med.frequency = med_in.frequency
    med.start_date = med_in.start_date
    med.end_date = med_in.end_date
    med.notes = med_in.notes

    # Update schedules
    db.query(Schedule).filter(Schedule.medicine_id == id).delete()
    for stime in med_in.scheduled_times:
        db.add(Schedule(medicine_id=id, time_of_day=stime))

    db.commit()
    db.refresh(med)
    return med

@router.delete("/medicines/{id}")
def delete_medicine(id: int, db: Session = Depends(get_db)):
    med = db.query(Medicine).filter(Medicine.id == id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medicine not found")

    db.delete(med)
    db.commit()
    return {"message": "Medicine deleted successfully", "id": id}
