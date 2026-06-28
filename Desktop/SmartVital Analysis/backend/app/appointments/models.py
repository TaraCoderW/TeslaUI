from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class AppointmentCreate(BaseModel):
    doctor_id: str
    date: str  # Format: YYYY-MM-DD
    time: str  # Format: HH:MM AM/PM
    type: str  # e.g., 'Teleconsult', 'In-Person'
    purpose: str
    patient_id: Optional[str] = None

class AppointmentUpdateStatus(BaseModel):
    status: str  # e.g., 'Upcoming', 'Completed', 'Cancelled'
