from fastapi import APIRouter, Depends, HTTPException, status
from backend.app.auth.dependencies import get_current_user, require_role
from backend.app.database import doctor_profiles_collection, users_collection, patient_profiles_collection
from backend.app.doctor.models import DoctorProfileCreate, DoctorProfileUpdate
from bson import ObjectId

router = APIRouter()

@router.post("/profile", status_code=status.HTTP_201_CREATED)
async def create_profile(
    profile: DoctorProfileCreate,
    current_user: dict = Depends(require_role(["doctor"]))
):
    existing_profile = await doctor_profiles_collection.find_one({"user_id": current_user["id"]})
    if existing_profile:
        raise HTTPException(status_code=400, detail="Profile already exists")
        
    profile_dict = profile.model_dump()
    profile_dict["user_id"] = current_user["id"]
    
    await doctor_profiles_collection.insert_one(profile_dict)
    
    # Mark user as onboarded
    await users_collection.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$set": {"is_onboarded": True, "full_name": profile.full_name}}
    )
    
    return {"message": "Doctor profile created successfully"}

@router.get("/profile")
async def get_profile(current_user: dict = Depends(require_role(["doctor"]))):
    profile = await doctor_profiles_collection.find_one({"user_id": current_user["id"]})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    profile["_id"] = str(profile["_id"])
    return profile

@router.patch("/profile")
async def update_profile(
    updates: DoctorProfileUpdate,
    current_user: dict = Depends(require_role(["doctor"]))
):
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    if not update_data:
        return {"message": "No fields to update"}
        
    result = await doctor_profiles_collection.update_one(
        {"user_id": current_user["id"]},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    return {"message": "Profile updated successfully"}

@router.get("/list")
async def list_doctors(current_user: dict = Depends(get_current_user)):
    """Retrieve a list of all doctor profiles for patients to select from"""
    cursor = doctor_profiles_collection.find({})
    doctors = await cursor.to_list(length=100)
    
    for doc in doctors:
        doc["_id"] = str(doc["_id"])
        
    return doctors

@router.get("/my-patients")
async def get_my_patients(current_user: dict = Depends(require_role(["doctor"]))):
    """Retrieve all patients assigned to the logged-in doctor"""
    # 1. Find the doctor's _id using their user_id
    doctor = await doctor_profiles_collection.find_one({"user_id": current_user["id"]})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
        
    doctor_id_str = str(doctor["_id"])
    
    # 2. Find all patients where assigned_doctor_id == doctor_id_str
    cursor = patient_profiles_collection.find({"assigned_doctor_id": doctor_id_str})
    patients = await cursor.to_list(length=100)
    
    # Sanitize object IDs
    for patient in patients:
        patient["_id"] = str(patient["_id"])
        
    return patients

from pydantic import BaseModel

class AddPatientRequest(BaseModel):
    patient_id: str

@router.post("/add-patient")
async def add_patient(
    request: AddPatientRequest,
    current_user: dict = Depends(require_role(["doctor"]))
):
    """Assign a patient to the logged-in doctor"""
    doctor = await doctor_profiles_collection.find_one({"user_id": current_user["id"]})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
        
    doctor_id_str = str(doctor["_id"])
    
    # Check if patient exists by user_id first, then fallback to profile _id
    patient = await patient_profiles_collection.find_one({"user_id": request.patient_id})
    if not patient:
        try:
            obj_id = ObjectId(request.patient_id)
            patient = await patient_profiles_collection.find_one({"_id": obj_id})
        except:
            pass

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found. Ensure they have completed their profile.")
        
    # Update patient's assigned_doctor_id
    await patient_profiles_collection.update_one(
        {"_id": patient["_id"]},
        {"$set": {"assigned_doctor_id": doctor_id_str}}
    )
    
    return {"message": "Patient added to your roster successfully"}
