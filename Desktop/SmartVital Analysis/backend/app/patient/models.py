from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date

class EmergencyContact(BaseModel):
    name: str
    phone: str
    relation: str

class FamilyHistory(BaseModel):
    heart_disease: str = "no"
    stroke: str = "no"
    diabetes: str = "no"
    cancer: str = "no"
    kidney_disease: str = "no"

class Vitals(BaseModel):
    heart_rate: Optional[float] = None
    blood_pressure_sys: Optional[float] = None
    blood_pressure_dia: Optional[float] = None
    spo2: Optional[float] = None
    respiratory_rate: Optional[float] = None
    body_temperature: Optional[float] = None
    blood_sugar: Optional[float] = None

class Insurance(BaseModel):
    provider: Optional[str] = None
    policy_number: Optional[str] = None
    coverage_type: Optional[str] = None

class PatientProfileCreate(BaseModel):
    full_name: str
    date_of_birth: date
    age: int
    gender: str = Field(..., pattern="^(Male|Female|Other)$")
    blood_group: str
    phone: str
    address: str
    emergency_contact: EmergencyContact
    
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    bmi: float
    allergies: List[str] = []
    current_medications: List[str] = []
    past_surgeries: List[str] = []
    chronic_diseases: List[str] = []
    
    smoking_status: str = Field(..., pattern="^(never|former|current)$")
    alcohol_consumption: str
    exercise_frequency: str
    sleep_hours: float
    stress_level: int = Field(..., ge=1, le=10)
    diet_type: str
    
    family_history: FamilyHistory
    vitals: Optional[Vitals] = None
    insurance: Optional[Insurance] = None
    profile_photo: Optional[str] = None

class PatientProfileUpdate(BaseModel):
    phone: Optional[str] = None
    address: Optional[str] = None
    weight_kg: Optional[float] = None
    bmi: Optional[float] = None
    allergies: Optional[List[str]] = None
    current_medications: Optional[List[str]] = None
    smoking_status: Optional[str] = None
    exercise_frequency: Optional[str] = None
    sleep_hours: Optional[float] = None
    stress_level: Optional[int] = None
    vitals: Optional[Vitals] = None
    profile_photo: Optional[str] = None

class MedicationCreate(BaseModel):
    name: str
    dosage: str
    frequency: str
    time_of_day: List[str] = []
    prescribed_by: Optional[str] = None
    start_date: str
    end_date: Optional[str] = None
    notes: Optional[str] = None
    is_active: bool = True

class MedicationUpdate(BaseModel):
    name: Optional[str] = None
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    time_of_day: Optional[List[str]] = None
    prescribed_by: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None
