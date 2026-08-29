from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.api import health, medicines, reminders, adherence, analytics, ai, caregiver, auth, notifications, whatsapp, ocr
from app.services.scheduler_service import start_reminder_scheduler, shutdown_reminder_scheduler

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AURA-MED Backend API",
    description="Intelligent Medicine Reminder & Adherence System Backend",
    version="1.0.0"
)

# Startup & Shutdown Events
@app.on_event("startup")
def on_startup():
    start_reminder_scheduler()

@app.on_event("shutdown")
def on_shutdown():
    shutdown_reminder_scheduler()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(auth.router, prefix="/api", tags=["Vault Auth"])
app.include_router(notifications.router, prefix="/api", tags=["Notifications"])
app.include_router(whatsapp.router, prefix="/api", tags=["WhatsApp"])
app.include_router(medicines.router, prefix="/api", tags=["Medicines"])
app.include_router(reminders.router, prefix="/api", tags=["Reminders"])
app.include_router(adherence.router, prefix="/api", tags=["Adherence"])
app.include_router(analytics.router, prefix="/api", tags=["Analytics"])
app.include_router(ai.router, prefix="/api", tags=["AI Adherence Engine"])
app.include_router(ocr.router, prefix="/api", tags=["Smart Prescription OCR"])
app.include_router(caregiver.router, prefix="/api", tags=["Caregiver"])

@app.get("/")
def root():
    return {
        "name": "AURA-MED System",
        "status": "online",
        "docs": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8001, reload=True)
