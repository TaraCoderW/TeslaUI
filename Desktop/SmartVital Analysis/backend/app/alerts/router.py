from fastapi import APIRouter, Depends, HTTPException, status
from backend.app.auth.dependencies import get_current_user, require_role
from backend.app.database import db, doctor_profiles_collection, patient_profiles_collection
from bson import ObjectId
from datetime import datetime
from pydantic import BaseModel

router = APIRouter()
alerts_collection = db["alerts"]

class AlertCreate(BaseModel):
    patient_id: str
    patient_name: str
    type: str
    message: str
    severity: str  # e.g., 'Critical', 'Warning', 'Info'

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_alert(alert: AlertCreate):
    # This might typically be called internally by the IoT microservice, but we'll expose it
    alert_dict = alert.model_dump()
    
    # Resolve the patient's assigned doctor to route the alert
    patient = await patient_profiles_collection.find_one({"_id": ObjectId(alert.patient_id)})
    if patient and patient.get("assigned_doctor_id"):
        alert_dict["doctor_id"] = patient["assigned_doctor_id"]
        
    alert_dict["created_at"] = datetime.utcnow()
    alert_dict["is_read"] = False

    await alerts_collection.insert_one(alert_dict)
    return {"message": "Alert created successfully"}

@router.get("/")
async def get_alerts(current_user: dict = Depends(get_current_user)):
    role = current_user.get("role")
    
    if role == "doctor":
        doctor = await doctor_profiles_collection.find_one({"user_id": current_user["id"]})
        if not doctor:
            return []
        cursor = alerts_collection.find({"doctor_id": str(doctor["_id"])}).sort("created_at", -1)
    elif role == "patient":
        patient = await patient_profiles_collection.find_one({"user_id": current_user["id"]})
        if not patient:
            return []
        cursor = alerts_collection.find({"patient_id": str(patient["_id"])}).sort("created_at", -1)
    else:
        return []

    alerts = await cursor.to_list(length=100)
    for a in alerts:
        a["_id"] = str(a["_id"])
        
    return alerts

@router.patch("/{alert_id}/read")
async def mark_read(
    alert_id: str,
    current_user: dict = Depends(get_current_user)
):
    result = await alerts_collection.update_one(
        {"_id": ObjectId(alert_id)},
        {"$set": {"is_read": True}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")
        
    return {"message": "Alert marked as read"}
