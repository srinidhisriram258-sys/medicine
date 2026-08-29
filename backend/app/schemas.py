from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class ScheduleSchema(BaseModel):
    time_of_day: str
    days_of_week: Optional[str] = "ALL"

    class Config:
        from_attributes = True

class MedicineCreate(BaseModel):
    name: str = Field(..., example="Lisinopril")
    dosage: str = Field(..., example="10 mg")
    frequency: str = Field(..., example="Once daily")
    scheduled_times: List[str] = Field(..., example=["08:00"])
    start_date: str = Field(..., example="2026-08-24")
    end_date: Optional[str] = None
    notes: Optional[str] = None

class MedicineResponse(BaseModel):
    id: int
    user_id: int
    name: str
    dosage: str
    frequency: str
    start_date: str
    end_date: Optional[str]
    notes: Optional[str]
    schedules: List[ScheduleSchema] = []
    created_at: datetime

    class Config:
        from_attributes = True

class ReminderResponse(BaseModel):
    id: int
    medicine_id: int
    medicine_name: str
    dosage: str
    scheduled_for: str
    status: str
    escalation_level: int = 0
    taken_at: Optional[str] = None
    snoozed_at: Optional[str] = None
    delay_minutes: float = 0.0
    is_demo: bool = False

    class Config:
        from_attributes = True

class AdherenceStats(BaseModel):
    today_adherence: float
    weekly_adherence: float
    monthly_adherence: float
    total_scheduled: int
    total_taken: int
    total_missed: int
    total_pending: int
    consecutive_missed: int
    avg_delay_minutes: float

class AIPredictResponse(BaseModel):
    model_status: str
    risk_level: str
    confidence: float
    probabilities: Dict[str, float]
    based_on_records: int
    message: Optional[str] = None
    feature_summary: Optional[Dict[str, float]] = None

class CaregiverPatientOverview(BaseModel):
    patient_id: int
    patient_name: str
    patient_email: str
    today_adherence: float
    weekly_adherence: float
    total_medicines: int
    missed_today: int
    pending_today: int
    ai_risk_level: str
    ai_confidence: float
    recent_history: List[Dict[str, Any]]

# Vault Auth Schemas
class VaultPinRequest(BaseModel):
    pin: str = Field(..., example="1234")

class VaultPinResponse(BaseModel):
    unlocked: bool
    token: str
    message: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    vault_pin: Optional[str] = "1234"
    timezone: Optional[str] = "Asia/Kolkata"

class LoginRequest(BaseModel):
    email: str
    password: str

# Web Push & Notification Schemas
class PushKeysSchema(BaseModel):
    p256dh: str
    auth: str

class PushSubscriptionSchema(BaseModel):
    endpoint: str
    keys: PushKeysSchema

class TestNotificationRequest(BaseModel):
    channel: Optional[str] = "Web Push"  # Web Push, Browser, WhatsApp

class NotificationLogResponse(BaseModel):
    id: int
    medicine_name: str
    dosage: str
    scheduled_for: str
    notification_time: str
    channel: str
    status: str
    action_taken: Optional[str] = None

class TimezoneUpdateRequest(BaseModel):
    timezone: str = Field(..., example="Asia/Kolkata")
