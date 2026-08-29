# AURA-MED — Intelligent Medicine Reminder & Adherence System

> **Hackathon Solution**  
> *Problem Statement: Develop a reminder system that helps patients taking multiple medicines follow their scheduled dosage times.*

**AURA-MED** is a complete, production-ready cyber-medical application that monitors patient medication adherence, provides server-side Web Push reminders, predicts behavioral risk using PyTorch deep learning, extracts prescription data with Smart Vision OCR, and safeguards patient data with a Medication Vault.

---

## ⚡ Key Features

- 💊 **Prescription & Dosage Management**: Register prescribed medicines with exact dosage instructions. Includes explicit healthcare provider disclaimer.
- 🔔 **Server-Side APScheduler & Web Push Engine**: Timezone-aware (`Asia/Kolkata`) 15-second background checking, 3-stage escalation (Primary $\rightarrow$ 10m Escalation $\rightarrow$ 20m Final $\rightarrow$ 30m Auto-Missed Expiration), OS-level Web Push notifications with native action buttons (`✓ TAKEN`, `⏱ SNOOZE (15m)`, `✕ MISSED`).
- 📷 **Smart Prescription OCR**: Upload prescription or pill bottle images to extract medicine name, dosage, and frequency using Deep Learning Vision OCR.
- 🧠 **PyTorch AdherenceRiskNet Model**: 3-class classifier (Low, Medium, High Risk) trained on 1,800 structured samples over 16 behavioral features, achieving 99.72% validation accuracy.
- 🔒 **Patient Medication Vault**: PIN-authenticated access protecting full prescription details, doctor notes, and caregiver oversight.
- 📊 **Adherence Analytics**: Interactive Recharts for 7-day rate, 30-day rate, time of day, weekday vs weekend, response delay, and snooze frequency.
- 🩺 **3D Medical Visualizer**: Three.js 3D rotating Stethoscope and Pill Bottle visualizer with WebGL performance optimization and CSS fallbacks.

---

## 🏗 System Architecture

```
                          +-----------------------------------+
                          |     AURA-MED PWA FRONTEND         |
                          |   (React + Vite + Tailwind + PWA) |
                          +-----------------+-----------------+
                                            |
                                  REST API / Web Push
                                            v
                          +-----------------+-----------------+
                          |      FASTAPI BACKEND SERVER       |
                          | (APScheduler + Web Push Engine)   |
                          +--------+----------------+---------+
                                   |                |
         +-------------------------+                +-------------------------+
         |                                                                    |
         v                                                                    v
+-------------------------------+                                  +--------------------------+
|  SQLite / PostgreSQL DB       |                                  | PyTorch & OCR AI Engine  |
|  - medicines, schedules       |                                  | - AdherenceRiskNet (.pth) |
|  - dose_events, subscriptions |                                  | - Vision OCR Service     |
+-------------------------------+                                  | - HF Model Service Space |
                                                                   +--------------------------+
```

---

## 🚀 Quick Start Instructions

### 1. Backend Setup (FastAPI & PyTorch Engine)
```bash
cd backend
python -m venv venv
# Activate virtual environment:
# Windows: venv\Scripts\activate | Linux/macOS: source venv/bin/activate

pip install -r requirements.txt

# Run reproducible PyTorch training pipeline:
python -m ml.train

# Start FastAPI Backend API Server (Port 8001):
python -c "import sys; sys.path.insert(0, '.'); import uvicorn; uvicorn.run('app.main:app', host='127.0.0.1', port=8001)"
```

### 2. Frontend Setup (React + Vite PWA)
```bash
cd frontend
npm install

# Start Vite Development Server (Port 5173):
npx vite --host 127.0.0.1 --port 5173

# Build Production Distribution:
npx vite build
```

---

## 🌐 Public Deployment Guide

### A. Hugging Face Spaces Deployment (PyTorch Model Service)
1. Create a new Space on [Hugging Face](https://huggingface.co/new-space) using **Docker** SDK.
2. Upload contents of `hf-model-service/` (`app.py`, `Dockerfile`, `requirements.txt`, `models/adherence_risk_model.pth`).
3. Set environment variable `HUGGINGFACE_MODEL_URL` in backend `.env`.

### B. Render / Railway Deployment (FastAPI Backend)
1. Deploy `backend/` using `backend/Dockerfile` or Python environment (`uvicorn app.main:app --host 0.0.0.0 --port $PORT`).
2. Add environment variables from `.env.example` (`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `DATABASE_URL`).

### C. Vercel / Netlify Deployment (React Frontend)
1. Deploy `frontend/` to Vercel.
2. Add environment variable:
   `VITE_API_BASE_URL=https://your-backend-api.onrender.com`

---

## 🧪 Testing & Verification

Run the automated backend test suite:
```bash
cd backend
python -c "import sys; sys.path.insert(0, '.'); from tests.test_hackathon_upgrades import test_health_check, test_vault_pin_verification, test_vapid_key_endpoint, test_test_notification_trigger, test_whatsapp_status, test_ai_risk_prediction; test_health_check(); test_vault_pin_verification(); test_vapid_key_endpoint(); test_test_notification_trigger(); test_whatsapp_status(); test_ai_risk_prediction(); print('ALL AURA-MED BACKEND TESTS PASSED!')"
```

---

## ⚠️ Medical Safety Disclaimer

*AURA-MED is a medication reminder and adherence monitoring tool. It does not diagnose medical conditions, recommend treatment, or change prescription dosages. Medication schedules and dosages must follow direct instructions from a qualified healthcare professional.*
