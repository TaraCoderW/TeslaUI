from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from datetime import datetime
from bson import ObjectId
from pydantic import BaseModel

from backend.app.auth.models import UserCreate, UserResponse, OTPVerify, LoginRequest, GoogleLoginRequest
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from backend.app.auth.service import (
    get_password_hash, verify_password, create_access_token, 
    create_refresh_token, generate_and_store_otp, verify_otp, verify_captcha
)
from backend.app.auth.dependencies import get_current_user
from backend.app.database import users_collection, refresh_tokens_collection
from backend.app.config import settings
from backend.app.limiter import limiter

router = APIRouter()

@router.post("/signup", status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def signup(request: Request, user: UserCreate):
    # Verify CAPTCHA
    is_human = await verify_captcha(user.captchaToken)
    if not is_human:
        raise HTTPException(status_code=400, detail="CAPTCHA verification failed")

    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    user_dict = user.model_dump()
    user_dict["password_hash"] = get_password_hash(user_dict.pop("password"))
    user_dict.update({
        "is_verified": False,
        "is_onboarded": False,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "last_login": None,
        "theme_preference": "system"
    })
    
    result = await users_collection.insert_one(user_dict)
    
    # Generate and send OTP (logging to console for now)
    await generate_and_store_otp(user.email)
    
    return {"message": "User created successfully. OTP sent to email."}

@router.post("/verify-otp")
@limiter.limit("5/minute")
async def verify_otp_endpoint(request: Request, data: OTPVerify):
    is_valid = await verify_otp(data.email, data.otp)
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        
    await users_collection.update_one(
        {"email": data.email},
        {"$set": {"is_verified": True}}
    )
    
    return {"message": "OTP verified successfully. You can now login."}

@router.post("/login")
@limiter.limit("5/minute")
async def login(request: Request, response: Response, credentials: LoginRequest):
    # Verify CAPTCHA
    is_human = await verify_captcha(credentials.captchaToken)
    if not is_human:
        raise HTTPException(status_code=400, detail="CAPTCHA verification failed")
    user = await users_collection.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    if user.get("is_active", True) is False:
        raise HTTPException(status_code=403, detail="Account is deactivated")
        
    if not user["is_verified"]:
        # Resend OTP if not verified
        await generate_and_store_otp(credentials.email)
        raise HTTPException(status_code=403, detail="Account not verified. A new OTP has been sent.")
        
    # Generate tokens
    access_token = create_access_token(data={"sub": str(user["_id"])})
    refresh_token = create_refresh_token(data={"sub": str(user["_id"])})
    
    # Store refresh token in DB
    await refresh_tokens_collection.update_one(
        {"user_id": str(user["_id"])},
        {"$set": {"token": refresh_token, "expires_at": datetime.utcnow()}},
        upsert=True
    )
    
    # Set httpOnly cookie for refresh token
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        samesite="none",
        secure=True
    )
    
    # Update last login
    await users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_login": datetime.utcnow()}}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "email": user["email"],
            "role": user["role"],
            "full_name": user.get("full_name"),
            "is_onboarded": user.get("is_onboarded", False)
        }
    }

import asyncio

@router.post("/google")
@limiter.limit("5/minute")
async def google_login(request: Request, response: Response, credentials: GoogleLoginRequest):
    try:
        # Verify the ID token with Google using a separate thread to prevent event loop blocking on Render
        def _verify():
            return id_token.verify_oauth2_token(
                credentials.credential, 
                google_requests.Request(), 
                settings.GOOGLE_CLIENT_ID
            )
            
        loop = asyncio.get_event_loop()
        idinfo = await loop.run_in_executor(None, _verify)
        
        email = idinfo['email']
        name = idinfo.get('name')
    except ValueError as e:
        print(f"Google token validation failed (ValueError): {e}")
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(e)}")
    except Exception as e:
        print(f"Google token validation failed (Exception): {e}")
        raise HTTPException(status_code=500, detail=f"Google Auth Error: {str(e)}")

    # Check if user exists
    user = await users_collection.find_one({"email": email})
    
    if not user:
        # Create new user
        user_dict = {
            "email": email,
            "password_hash": "", # No password for google accounts
            "role": credentials.role,
            "full_name": name,
            "phone": None,
            "is_verified": True,
            "is_onboarded": False,
            "created_at": datetime.utcnow(),
            "last_login": datetime.utcnow(),
            "theme_preference": "system",
            "auth_provider": "google"
        }
        result = await users_collection.insert_one(user_dict)
        user = await users_collection.find_one({"_id": result.inserted_id})
    else:
        # Update last login
        await users_collection.update_one(
            {"_id": user["_id"]},
            {"$set": {"last_login": datetime.utcnow()}}
        )

    # Generate tokens
    access_token = create_access_token(data={"sub": str(user["_id"])})
    refresh_token = create_refresh_token(data={"sub": str(user["_id"])})
    
    # Store refresh token in DB
    await refresh_tokens_collection.update_one(
        {"user_id": str(user["_id"])},
        {"$set": {"token": refresh_token, "expires_at": datetime.utcnow()}},
        upsert=True
    )
    
    # Set httpOnly cookie for refresh token
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        samesite="none",
        secure=True
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "email": user["email"],
            "role": user["role"],
            "full_name": user.get("full_name"),
            "is_onboarded": user.get("is_onboarded", False)
        }
    }

@router.post("/refresh")
async def refresh_token(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="Refresh token missing")
        
    try:
        from jose import jwt
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id = payload.get("sub")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
        
    # Check if token matches DB
    stored_token = await refresh_tokens_collection.find_one({"user_id": user_id})
    if not stored_token or stored_token["token"] != token:
        raise HTTPException(status_code=401, detail="Refresh token revoked or invalid")
        
    # Generate new access token
    new_access_token = create_access_token(data={"sub": user_id})
    return {"access_token": new_access_token, "token_type": "bearer"}

@router.post("/logout")
async def logout(response: Response, current_user: dict = Depends(get_current_user)):
    # Remove from DB
    await refresh_tokens_collection.delete_one({"user_id": current_user["id"]})
    # Clear cookie
    response.delete_cookie(
        "refresh_token",
        samesite="none",
        secure=True
    )
    return {"message": "Logged out successfully"}

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

@router.post("/change-password")
async def change_password(request: ChangePasswordRequest, current_user: dict = Depends(get_current_user)):
    user = await users_collection.find_one({"_id": ObjectId(current_user["id"])})
    if not user or not verify_password(request.current_password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    hashed_password = get_password_hash(request.new_password)
    await users_collection.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$set": {"password_hash": hashed_password}}
    )
    return {"message": "Password updated successfully"}

@router.post("/deactivate")
async def deactivate_account(response: Response, current_user: dict = Depends(get_current_user)):
    await users_collection.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$set": {"is_active": False}}
    )
    # Clear session exactly like logout
    await refresh_tokens_collection.delete_one({"user_id": current_user["id"]})
    response.delete_cookie(
        "refresh_token",
        samesite="none",
        secure=True
    )
    return {"message": "Account deactivated successfully"}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(**current_user)

class ForgotPasswordRequest(BaseModel):
    email: str
    captchaToken: str = None

@router.post("/forgot-password")
@limiter.limit("3/minute")
async def forgot_password(request: Request, data: ForgotPasswordRequest):
    # Verify CAPTCHA
    is_human = await verify_captcha(data.captchaToken)
    if not is_human:
        raise HTTPException(status_code=400, detail="CAPTCHA verification failed")

    user = await users_collection.find_one({"email": data.email})
    if not user:
        # Prevent email enumeration by returning a generic success message
        return {"message": "If that email is registered, a reset OTP has been sent."}
    
    await generate_and_store_otp(data.email)
    return {"message": "If that email is registered, a reset OTP has been sent."}

class ResetPasswordRequest(BaseModel):
    email: str
    otp: str
    new_password: str

@router.post("/reset-password")
@limiter.limit("3/minute")
async def reset_password(request: Request, data: ResetPasswordRequest):
    is_valid = await verify_otp(data.email, data.otp)
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        
    hashed_password = get_password_hash(data.new_password)
    
    await users_collection.update_one(
        {"email": data.email},
        {"$set": {"password_hash": hashed_password}}
    )
    
    return {"message": "Password reset successfully. You can now login."}
