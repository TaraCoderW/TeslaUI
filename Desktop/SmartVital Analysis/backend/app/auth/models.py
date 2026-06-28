from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    role: str = Field(..., pattern="^(patient|doctor|admin|researcher)$")
    full_name: Optional[str] = None
    phone: Optional[str] = None
    captchaToken: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    role: str
    is_verified: bool
    is_onboarded: bool
    created_at: datetime
    full_name: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class OTPVerify(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    captchaToken: Optional[str] = None

class GoogleLoginRequest(BaseModel):
    credential: str
    role: Optional[str] = "patient"
