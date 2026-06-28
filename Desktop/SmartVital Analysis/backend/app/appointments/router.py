from fastapi import APIRouter, Depends, HTTPException, status
from backend.app.auth.dependencies import get_current_user, require_role
from backend.app.database import appointments_collection, patient_profiles_collection, doctor_profiles_collection
from backend.app.appointments.models import AppointmentCreate, AppointmentUpdateStatus
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.post("/book", status_code=status.HTTP_201_CREATED)
async def book_appointment(
    appt: AppointmentCreate,
    current_user: dict = Depends(require_role(["patient", "doctor"]))
):
    role = current_user.get("role")
    
    if role == "doctor":
        if not appt.patient_id:
            raise HTTPException(status_code=400, detail="patient_id is required when a doctor books an appointment")
        patient = await patient_profiles_collection.find_one({"_id": ObjectId(appt.patient_id)}) if len(appt.patient_id) == 24 else await patient_profiles_collection.find_one({"user_id": appt.patient_id})
        if not patient:
            patient = {"_id": appt.patient_id, "full_name": "Unknown Patient"}
    else:
        patient = await patient_profiles_collection.find_one({"user_id": current_user["id"]})
        if not patient:
            patient = {"_id": current_user["id"], "full_name": current_user.get("full_name", "Unknown Patient")}

    doctor = await doctor_profiles_collection.find_one({"user_id": appt.doctor_id})
    if not doctor and len(appt.doctor_id) == 24:
        doctor = await doctor_profiles_collection.find_one({"_id": ObjectId(appt.doctor_id)})

    appt_dict = appt.model_dump()
    appt_dict["patient_id"] = str(patient.get("_id"))
    appt_dict["patient_name"] = patient.get("full_name", current_user.get("full_name"))
    appt_dict["doctor_name"] = doctor.get("full_name", "Unknown Doctor") if doctor else "Unknown Doctor"
    appt_dict["status"] = "Upcoming"
    appt_dict["created_at"] = datetime.utcnow()

    await appointments_collection.insert_one(appt_dict)
    return {"message": "Appointment booked successfully"}

@router.get("/my-appointments")
async def get_my_appointments(current_user: dict = Depends(get_current_user)):
    role = current_user.get("role")
    
    if role == "patient":
        profile = await patient_profiles_collection.find_one({"user_id": current_user["id"]})
        if not profile:
            return []
        cursor = appointments_collection.find({"patient_id": str(profile["_id"])})
    elif role == "doctor":
        profile = await doctor_profiles_collection.find_one({"user_id": current_user["id"]})
        if not profile:
            return []
        cursor = appointments_collection.find({"doctor_id": str(profile["_id"])})
    else:
        return []

    appointments = await cursor.to_list(length=100)
    for appt in appointments:
        appt["_id"] = str(appt["_id"])
        
    return appointments

@router.patch("/{appt_id}/status")
async def update_status(
    appt_id: str,
    update: AppointmentUpdateStatus,
    current_user: dict = Depends(require_role(["doctor", "patient"]))
):
    result = await appointments_collection.update_one(
        {"_id": ObjectId(appt_id)},
        {"$set": {"status": update.status}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    return {"message": "Status updated"}
