from pydantic import BaseModel
from typing import Optional

class ClinicalNoteCreate(BaseModel):
    patient_id: str
    patient_name: str
    condition: str
    content: str

class PrescriptionCreate(BaseModel):
    patient_id: str
    patient_name: str
    medication: str
    dosage: str
    frequency: str
    duration: str
    refills: int

class PrescriptionUpdateStatus(BaseModel):
    status: str
