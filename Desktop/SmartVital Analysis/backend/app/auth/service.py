from datetime import datetime, timedelta
from jose import jwt, JWTError
import bcrypt
import pyotp
from backend.app.config import settings
from backend.app.database import otp_sessions_collection

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

import urllib.request
import json
import asyncio
from backend.app.config import settings

def send_otp_via_brevo(to_email: str, otp: str):
    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "accept": "application/json",
        "api-key": settings.BREVO_API_KEY,
        "content-type": "application/json"
    }
    
    payload = {
        "sender": {"name": "SmartVital Platform", "email": "rahulagarwal40046@gmail.com"},
        "to": [{"email": to_email}],
        "subject": "Your SmartVital Verification Code",
        "htmlContent": f"<html><body><div style='font-family: sans-serif; padding: 20px;'><h2>Welcome to SmartVital!</h2><p>Your account verification code is:</p><div style='background: #f4f4f5; padding: 15px; border-radius: 8px; font-size: 28px; font-weight: bold; letter-spacing: 4px; display: inline-block; margin: 10px 0;'>{otp}</div><p>This code will expire in 10 minutes. If you did not request this, please ignore this email.</p></div></body></html>"
    }
    
    req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers, method='POST')
    try:
        with urllib.request.urlopen(req) as response:
            print(f"OTP sent successfully to {to_email}. Status: {response.status}")
    except Exception as e:
        print(f"Brevo API Exception: {e}")

async def generate_and_store_otp(email: str) -> str:
    totp = pyotp.TOTP(pyotp.random_base32())
    otp = totp.now()
    
    await otp_sessions_collection.update_one(
        {"email": email},
        {"$set": {"otp": otp, "created_at": datetime.utcnow()}},
        upsert=True
    )
    
    # Send this via Brevo in a separate thread so it doesn't block
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, send_otp_via_brevo, email, otp)
        
    return otp

async def verify_otp(email: str, provided_otp: str) -> bool:
    session = await otp_sessions_collection.find_one({"email": email})
    if session and session["otp"] == provided_otp:
        # Delete session after successful verification
        await otp_sessions_collection.delete_one({"email": email})
        return True
    return False

import requests
import asyncio

async def verify_captcha(token: str) -> bool:
    if not token:
        return False
        
    secret = settings.RECAPTCHA_SECRET_KEY
    if not secret:
        # If no secret is configured, assume success for dev, but in prod should fail.
        # Since this is a production environment request, we should enforce it.
        return False
        
    def _verify():
        try:
            response = requests.post(
                "https://www.google.com/recaptcha/api/siteverify",
                data={
                    "secret": secret,
                    "response": token
                },
                timeout=10
            )
            return response.json().get("success", False)
        except Exception as e:
            print(f"CAPTCHA verification failed: {e}")
            return False

    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _verify)
