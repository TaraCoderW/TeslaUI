from pydantic import BaseModel
from typing import List, Optional

class DoctorProfileCreate(BaseModel):
    full_name: str
    specialization: str
    license_number: str
    years_of_experience: int
    phone: str
    clinic_name: str
    clinic_address: str
    consultation_fee: float
    education: str
    languages_spoken: List[str]
    available_days: List[str]
    shift_start: str
    shift_end: str
    bio: Optional[str] = None
    profile_photo: Optional[str] = None

class DoctorProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    specialization: Optional[str] = None
    license_number: Optional[str] = None
    years_of_experience: Optional[int] = None
    phone: Optional[str] = None
    clinic_name: Optional[str] = None
    clinic_address: Optional[str] = None
    consultation_fee: Optional[float] = None
    education: Optional[str] = None
    languages_spoken: Optional[List[str]] = None
    available_days: Optional[List[str]] = None
    shift_start: Optional[str] = None
    shift_end: Optional[str] = None
    bio: Optional[str] = None
    profile_photo: Optional[str] = None
