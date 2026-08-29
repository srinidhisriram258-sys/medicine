import os
import json
import base64
from py_vapid import Vapid
from cryptography.hazmat.primitives import serialization

VAPID_JSON_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "models", "vapid_keys.json"))
VAPID_PEM_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "models", "vapid_private.pem"))

def get_or_generate_vapid_keys():
    """
    Retrieves or generates valid cryptographic VAPID public/private key pairs for Web Push notifications.
    Public Key is serialized as an uncompressed P-256 EC point in URL-safe Base64 format.
    Saves private key to vapid_private.pem for pywebpush execution.
    Supports environment variable overrides: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_CLAIM_EMAIL.
    """
    env_pub = os.getenv("VAPID_PUBLIC_KEY")
    env_priv = os.getenv("VAPID_PRIVATE_KEY")
    env_sub = os.getenv("VAPID_CLAIM_EMAIL", "mailto:admin@mediadhere.ai")

    if env_pub and env_priv and os.path.exists(VAPID_PEM_FILE):
        return {
            "public_key": env_pub,
            "private_key_file": VAPID_PEM_FILE,
            "subscriber": env_sub
        }

    # Load from file if exists
    if os.path.exists(VAPID_JSON_FILE) and os.path.exists(VAPID_PEM_FILE):
        try:
            with open(VAPID_JSON_FILE, "r") as f:
                data = json.load(f)
                if data and "public_key" in data and len(data["public_key"]) > 50:
                    data["private_key_file"] = VAPID_PEM_FILE
                    return data
        except Exception:
            pass

    # Generate cryptographic VAPID keys
    vapid = Vapid()
    vapid.generate_keys()

    os.makedirs(os.path.dirname(VAPID_JSON_FILE), exist_ok=True)
    vapid.save_key(VAPID_PEM_FILE)

    # Extract raw uncompressed P-256 point bytes (65 bytes)
    raw_public_bytes = vapid.public_key.public_bytes(
        encoding=serialization.Encoding.X962,
        format=serialization.PublicFormat.UncompressedPoint
    )

    # Encode as URL-safe Base64 string without padding
    public_key_b64 = base64.urlsafe_b64encode(raw_public_bytes).decode('utf-8').rstrip('=')

    keys = {
        "public_key": public_key_b64,
        "private_key_file": VAPID_PEM_FILE,
        "subscriber": env_sub
    }

    try:
        with open(VAPID_JSON_FILE, "w") as f:
            json.dump(keys, f, indent=2)
        print(f"[VAPID] Generated new cryptographic VAPID Key Pair. Public Key length: {len(public_key_b64)}")
    except Exception as e:
        print(f"[VAPID ERROR] Failed to save keys file: {e}")

    return keys
