from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    role = Column(String, default="patient")  # patient, caregiver, admin
    password_hash = Column(String, nullable=True)
    vault_pin = Column(String, default="1234") # Default 4-digit vault PIN
    timezone = Column(String, default="Asia/Kolkata")
    created_at = Column(DateTime, default=datetime.utcnow)

    medicines = relationship("Medicine", back_populates="user", cascade="all, delete-orphan")
    reminders = relationship("Reminder", back_populates="user", cascade="all, delete-orphan")
    push_subscriptions = relationship("PushSubscription", back_populates="user", cascade="all, delete-orphan")


class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    dosage = Column(String, nullable=False)       # e.g., "10mg", "1 tablet"
    frequency = Column(String, nullable=False)    # e.g., "Once daily", "Twice daily"
    start_date = Column(String, nullable=False)   # YYYY-MM-DD
    end_date = Column(String, nullable=True)     # YYYY-MM-DD or empty
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="medicines")
    schedules = relationship("Schedule", back_populates="medicine", cascade="all, delete-orphan")
    reminders = relationship("Reminder", back_populates="medicine", cascade="all, delete-orphan")


class Schedule(Base):
    __tablename__ = "schedules"

    id = Column(Integer, primary_key=True, index=True)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=False)
    time_of_day = Column(String, nullable=False)  # HH:MM format (24-hr)
    days_of_week = Column(String, default="ALL")  # "ALL", "MON,WED,FRI", etc.

    medicine = relationship("Medicine", back_populates="schedules")


class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(Integer, primary_key=True, index=True)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    scheduled_for = Column(DateTime, nullable=False)  # Exact datetime
    status = Column(String, default="pending")        # pending, taken, missed, snoozed
    taken_at = Column(DateTime, nullable=True)
    snoozed_at = Column(DateTime, nullable=True)
    escalation_level = Column(Integer, default=0)    # 0=Primary, 1=10m Escalation, 2=20m Final
    delay_minutes = Column(Float, default=0.0)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    medicine = relationship("Medicine", back_populates="reminders")
    user = relationship("User", back_populates="reminders")


class AdherenceRecord(Base):
    __tablename__ = "adherence_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=True)
    date = Column(String, nullable=False)  # YYYY-MM-DD
    scheduled_count = Column(Integer, default=0)
    taken_count = Column(Integer, default=0)
    missed_count = Column(Integer, default=0)
    adherence_rate = Column(Float, default=100.0)
    is_demo = Column(Boolean, default=False)


class Caregiver(Base):
    __tablename__ = "caregivers"

    id = Column(Integer, primary_key=True, index=True)
    caregiver_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    patient_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    access_level = Column(String, default="full")  # full, view_only
    created_at = Column(DateTime, default=datetime.utcnow)


class PushSubscription(Base):
    __tablename__ = "push_subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    endpoint = Column(Text, nullable=False, unique=True)
    p256dh = Column(Text, nullable=False)
    auth = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="push_subscriptions")


class NotificationLog(Base):
    __tablename__ = "notification_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    medicine_name = Column(String, nullable=False)
    dosage = Column(String, nullable=False)
    scheduled_for = Column(DateTime, nullable=False)
    notification_time = Column(DateTime, default=datetime.utcnow)
    channel = Column(String, default="Web Push")  # Web Push, Browser, WhatsApp
    status = Column(String, default="SENT")        # SENT, DELIVERED, FAILED, NOT CONFIGURED
    acknowledged_at = Column(DateTime, nullable=True)
    action_taken = Column(String, nullable=True)   # TAKEN, SNOOZE, MISSED
