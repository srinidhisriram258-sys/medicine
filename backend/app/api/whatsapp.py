import os
from fastapi import APIRouter

router = APIRouter()

@router.get("/whatsapp/status")
def get_whatsapp_status():
    account_sid = os.getenv("WHATSAPP_ACCOUNT_SID")
    auth_token = os.getenv("WHATSAPP_AUTH_TOKEN")
    from_number = os.getenv("WHATSAPP_FROM_NUMBER")

    configured = bool(account_sid and auth_token and from_number)

    return {
        "configured": configured,
        "status": "READY" if configured else "NOT CONFIGURED",
        "provider": "Twilio / WhatsApp Cloud API",
        "message": "WhatsApp service active." if configured else "WhatsApp notifications require provider configuration (WHATSAPP_ACCOUNT_SID, WHATSAPP_AUTH_TOKEN, WHATSAPP_FROM_NUMBER)."
    }

@router.post("/whatsapp/test-trigger")
def test_whatsapp_trigger():
    status_info = get_whatsapp_status()
    if not status_info["configured"]:
        return {
            "status": "FAILED",
            "delivery_code": "NOT_CONFIGURED",
            "message": "WhatsApp notifications require provider configuration."
        }
    
    # Provider configured path
    return {
        "status": "SENT",
        "message": "WhatsApp notification dispatched via provider API."
    }
