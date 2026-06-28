from fastapi import APIRouter, Depends, HTTPException, status
from backend.app.auth.dependencies import get_current_user, require_role
from backend.app.database import clinical_notes_collection, medications_collection, doctor_profiles_collection, patient_profiles_collection
from backend.app.clinical.models import ClinicalNoteCreate, PrescriptionCreate, PrescriptionUpdateStatus
from bson import ObjectId
from datetime import datetime

router = APIRouter()

# --- Clinical Notes ---
@router.post("/notes", status_code=status.HTTP_201_CREATED)
async def create_note(
    note: ClinicalNoteCreate,
    current_user: dict = Depends(require_role(["doctor"]))
):
    doctor = await doctor_profiles_collection.find_one({"user_id": current_user["id"]})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    note_dict = note.model_dump()
    note_dict["doctor_id"] = str(doctor["_id"])
    note_dict["doctor_name"] = doctor.get("full_name")
    note_dict["created_at"] = datetime.utcnow()

    await clinical_notes_collection.insert_one(note_dict)
    return {"message": "Clinical note created successfully"}

@router.get("/notes")
async def get_notes(current_user: dict = Depends(get_current_user)):
    role = current_user.get("role")
    
    if role == "doctor":
        doctor = await doctor_profiles_collection.find_one({"user_id": current_user["id"]})
        if not doctor:
            return []
        cursor = clinical_notes_collection.find({"doctor_id": str(doctor["_id"])}).sort("created_at", -1)
    elif role == "patient":
        patient = await patient_profiles_collection.find_one({"user_id": current_user["id"]})
        if not patient:
            return []
        cursor = clinical_notes_collection.find({"patient_id": str(patient["_id"])}).sort("created_at", -1)
    else:
        return []

    notes = await cursor.to_list(length=100)
    for note in notes:
        note["_id"] = str(note["_id"])
        
    return notes

# --- Prescriptions (Medications) ---
@router.post("/prescriptions", status_code=status.HTTP_201_CREATED)
async def create_prescription(
    prescription: PrescriptionCreate,
    current_user: dict = Depends(require_role(["doctor"]))
):
    doctor = await doctor_profiles_collection.find_one({"user_id": current_user["id"]})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    pres_dict = prescription.model_dump()
    pres_dict["doctor_id"] = str(doctor["_id"])
    pres_dict["doctor_name"] = doctor.get("full_name")
    pres_dict["status"] = "Active"
    pres_dict["created_at"] = datetime.utcnow()

    await medications_collection.insert_one(pres_dict)
    return {"message": "Prescription created successfully"}

@router.get("/prescriptions")
async def get_prescriptions(current_user: dict = Depends(get_current_user)):
    role = current_user.get("role")
    
    if role == "doctor":
        doctor = await doctor_profiles_collection.find_one({"user_id": current_user["id"]})
        if not doctor:
            return []
        cursor = medications_collection.find({"doctor_id": str(doctor["_id"])}).sort("created_at", -1)
    elif role == "patient":
        patient = await patient_profiles_collection.find_one({"user_id": current_user["id"]})
        if not patient:
            return []
        cursor = medications_collection.find({"patient_id": str(patient["_id"])}).sort("created_at", -1)
    else:
        return []

    prescriptions = await cursor.to_list(length=100)
    for p in prescriptions:
        p["_id"] = str(p["_id"])
        
    return prescriptions

@router.patch("/prescriptions/{pres_id}/status")
async def update_prescription_status(
    pres_id: str,
    update: PrescriptionUpdateStatus,
    current_user: dict = Depends(require_role(["doctor"]))
):
    result = await medications_collection.update_one(
        {"_id": ObjectId(pres_id)},
        {"$set": {"status": update.status}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Prescription not found")
        
    return {"message": "Status updated"}
