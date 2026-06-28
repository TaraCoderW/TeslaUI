from fastapi import APIRouter, Depends, HTTPException, status
from backend.app.auth.dependencies import get_current_user, require_role
from backend.app.database import patient_profiles_collection, users_collection
from backend.app.patient.models import PatientProfileCreate, PatientProfileUpdate
from bson import ObjectId

router = APIRouter()

@router.post("/profile", status_code=status.HTTP_201_CREATED)
async def create_profile(
    profile: PatientProfileCreate,
    current_user: dict = Depends(require_role(["patient"]))
):
    existing_profile = await patient_profiles_collection.find_one({"user_id": current_user["id"]})
    if existing_profile:
        raise HTTPException(status_code=400, detail="Profile already exists")
        
    profile_dict = profile.model_dump()
    # Convert date to string for MongoDB serialization
    profile_dict["date_of_birth"] = profile_dict["date_of_birth"].isoformat()
    profile_dict["user_id"] = current_user["id"]
    
    await patient_profiles_collection.insert_one(profile_dict)
    
    # Mark user as onboarded
    await users_collection.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$set": {"is_onboarded": True, "full_name": profile.full_name}}
    )
    
    return {"message": "Patient profile created successfully"}

@router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    # If it's a patient, get their own profile.
    if current_user["role"] == "patient":
        profile = await patient_profiles_collection.find_one({"user_id": current_user["id"]})
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        profile["_id"] = str(profile["_id"])
        return profile
    else:
        raise HTTPException(status_code=403, detail="Not authorized to access patient profiles without patient ID")

@router.patch("/profile")
async def update_profile(
    updates: PatientProfileUpdate,
    current_user: dict = Depends(require_role(["patient"]))
):
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    if not update_data:
        return {"message": "No fields to update"}
        
    result = await patient_profiles_collection.update_one(
        {"user_id": current_user["id"]},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    return {"message": "Profile updated successfully"}

# --- Doctor Assignment Routes ---
from backend.app.database import doctor_profiles_collection
from pydantic import BaseModel

class AssignDoctorRequest(BaseModel):
    doctor_id: str

@router.post("/assign-doctor")
async def assign_doctor(
    request: AssignDoctorRequest,
    current_user: dict = Depends(require_role(["patient"]))
):
    # Verify doctor exists
    doctor = await doctor_profiles_collection.find_one({"_id": ObjectId(request.doctor_id)})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
        
    # Update patient profile
    result = await patient_profiles_collection.update_one(
        {"user_id": current_user["id"]},
        {"$set": {"assigned_doctor_id": request.doctor_id}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Patient profile not found. Please complete onboarding first.")
        
    return {"message": "Doctor assigned successfully"}

@router.get("/my-doctor")
async def get_my_doctor(current_user: dict = Depends(require_role(["patient"]))):
    patient_profile = await patient_profiles_collection.find_one({"user_id": current_user["id"]})
    if not patient_profile or "assigned_doctor_id" not in patient_profile:
        raise HTTPException(status_code=404, detail="No doctor assigned")
        
    doctor = await doctor_profiles_collection.find_one({"_id": ObjectId(patient_profile["assigned_doctor_id"])})
    if not doctor:
        raise HTTPException(status_code=404, detail="Assigned doctor not found in database")
        
    doctor["_id"] = str(doctor["_id"])
    return doctor

# --- Medications Routes ---
from backend.app.database import medications_collection
from backend.app.patient.models import MedicationCreate, MedicationUpdate
import datetime

@router.post("/medications", status_code=status.HTTP_201_CREATED)
async def add_medication(
    medication: MedicationCreate,
    current_user: dict = Depends(require_role(["patient"]))
):
    med_dict = medication.model_dump()
    med_dict["user_id"] = current_user["id"]
    med_dict["created_at"] = datetime.datetime.utcnow()
    
    result = await medications_collection.insert_one(med_dict)
    return {"id": str(result.inserted_id), "message": "Medication added successfully"}

@router.get("/medications")
async def get_medications(current_user: dict = Depends(require_role(["patient", "doctor"]))):
    # Note: If doctor, we might want to pass patient_id in query params. 
    # For now, this returns current_user's medications.
    cursor = medications_collection.find({"user_id": current_user["id"]}).sort("created_at", -1)
    meds = await cursor.to_list(length=100)
    for m in meds:
        m["_id"] = str(m["_id"])
    return meds

@router.patch("/medications/{med_id}")
async def update_medication(
    med_id: str,
    updates: MedicationUpdate,
    current_user: dict = Depends(require_role(["patient"]))
):
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    if not update_data:
        return {"message": "No fields to update"}
        
    result = await medications_collection.update_one(
        {"_id": ObjectId(med_id), "user_id": current_user["id"]},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Medication not found")
        
    return {"message": "Medication updated successfully"}

@router.delete("/medications/{med_id}")
async def delete_medication(
    med_id: str,
    current_user: dict = Depends(require_role(["patient"]))
):
    result = await medications_collection.delete_one(
        {"_id": ObjectId(med_id), "user_id": current_user["id"]}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Medication not found")
    return {"message": "Medication deleted"}

# --- Lab Results Routes ---
from backend.app.database import lab_results_collection
from pydantic import BaseModel
from typing import Optional

class LabResultCreate(BaseModel):
    test_name: str
    date: str
    result_value: str
    unit: str
    reference_range: str
    is_abnormal: bool = False
    notes: Optional[str] = None
    file_url: Optional[str] = None

@router.post("/labs", status_code=status.HTTP_201_CREATED)
async def add_lab_result(
    lab: LabResultCreate,
    current_user: dict = Depends(require_role(["patient"]))
):
    lab_dict = lab.model_dump()
    lab_dict["user_id"] = current_user["id"]
    lab_dict["created_at"] = datetime.datetime.utcnow()
    
    result = await lab_results_collection.insert_one(lab_dict)
    return {"id": str(result.inserted_id), "message": "Lab result added successfully"}

@router.get("/labs")
async def get_lab_results(current_user: dict = Depends(require_role(["patient", "doctor"]))):
    cursor = lab_results_collection.find({"user_id": current_user["id"]}).sort("date", -1)
    labs = await cursor.to_list(length=100)
    for l in labs:
        l["_id"] = str(l["_id"])
    return labs

@router.delete("/labs/{lab_id}")
async def delete_lab_result(
    lab_id: str,
    current_user: dict = Depends(require_role(["patient"]))
):
    result = await lab_results_collection.delete_one(
        {"_id": ObjectId(lab_id), "user_id": current_user["id"]}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lab result not found")
    return {"message": "Lab result deleted"}

# --- Symptom Routes ---
from backend.app.database import symptoms_collection
from typing import List

class SymptomLogCreate(BaseModel):
    symptoms: List[str]
    severity: int
    duration_days: int
    notes: Optional[str] = None

@router.post("/symptoms", status_code=status.HTTP_201_CREATED)
async def log_symptom(
    log: SymptomLogCreate,
    current_user: dict = Depends(require_role(["patient"]))
):
    log_dict = log.model_dump()
    log_dict["user_id"] = current_user["id"]
    log_dict["created_at"] = datetime.datetime.utcnow()
    
    # Very basic mockup for mapping symptoms to risk areas for MVP
    # Ideally, this calls an AI or a rules engine.
    risk_areas = []
    symptoms_lower = [s.lower() for s in log.symptoms]
    if any(s in ['chest pain', 'palpitations', 'shortness of breath'] for s in symptoms_lower):
        risk_areas.append('Cardiovascular')
    if any(s in ['cough', 'wheezing', 'shortness of breath'] for s in symptoms_lower):
        risk_areas.append('Respiratory')
    if any(s in ['polyuria', 'polydipsia', 'fatigue'] for s in symptoms_lower):
        risk_areas.append('Endocrine (Diabetes)')
        
    log_dict["inferred_risk_areas"] = risk_areas
    
    result = await symptoms_collection.insert_one(log_dict)
    return {
        "id": str(result.inserted_id), 
        "message": "Symptoms logged", 
        "inferred_risk_areas": risk_areas
    }

@router.get("/symptoms")
async def get_symptom_logs(current_user: dict = Depends(require_role(["patient", "doctor"]))):
    cursor = symptoms_collection.find({"user_id": current_user["id"]}).sort("created_at", -1)
    logs = await cursor.to_list(length=100)
    for l in logs:
        l["_id"] = str(l["_id"])
    return logs

# --- Risk Forecasting Route ---
from backend.app.database import predictions_collection

@router.get("/forecast")
async def get_risk_forecast(model: str = "heart", current_user: dict = Depends(require_role(["patient", "doctor"]))):
    # Fetch last 10 predictions for the specific model
    cursor = predictions_collection.find({"user_id": current_user["id"], "model": model}).sort("created_at", 1)
    preds = await cursor.to_list(length=10)
    
    # If not enough data, return empty lists instead of mock data
    if len(preds) < 2:
        return {
            "model": model,
            "historical": [],
            "forecast": [],
            "slope": 0,
            "trend": "stable"
        }
    else:
        # Use real data
        historical = [{"day": i, "risk": p["probability"]} for i, p in enumerate(preds)]

    # Linear Regression using pure python (no numpy)
    n = len(historical)
    sum_x = sum(d["day"] for d in historical)
    sum_y = sum(d["risk"] for d in historical)
    sum_xy = sum(d["day"] * d["risk"] for d in historical)
    sum_xx = sum(d["day"] ** 2 for d in historical)
    
    denominator = (n * sum_xx - sum_x ** 2)
    if denominator == 0:
        slope = 0
    else:
        slope = (n * sum_xy - sum_x * sum_y) / denominator
        
    intercept = (sum_y - slope * sum_x) / n
    
    # Generate 30, 60, 90 days forecast
    current_day = historical[-1]["day"] if historical else 0
    forecast = []
    for future_days in [30, 60, 90]:
        target_day = current_day + future_days
        proj_risk = slope * target_day + intercept
        forecast.append({
            "days_out": future_days,
            "projected_risk": min(max(proj_risk, 0), 1) # clamp between 0 and 1
        })

    return {
        "model": model,
        "historical": historical,
        "forecast": forecast,
        "slope": slope,
        "trend": "increasing" if slope > 0.001 else "decreasing" if slope < -0.001 else "stable"
    }

# --- Vitals History Route ---
from backend.app.database import health_records_collection, devices_collection

@router.get("/vitals/history")
async def get_vitals_history(current_user: dict = Depends(require_role(["patient", "doctor"]))):
    # Retrieve past health records to extract vitals
    cursor = health_records_collection.find({"user_id": current_user["id"]}).sort("date", 1)
    records = await cursor.to_list(length=100)
    
    # Extract vitals from real records
    vitals_history = []
    if records:
        for r in records:
            if "vitals" in r:
                vitals = r["vitals"]
                vitals["date"] = r["date"]
                # Basic anomaly check
                is_anomaly = False
                if vitals.get("heart_rate") and (vitals["heart_rate"] > 100 or vitals["heart_rate"] < 50):
                    is_anomaly = True
                if vitals.get("blood_pressure_sys") and vitals["blood_pressure_sys"] > 140:
                    is_anomaly = True
                vitals["is_anomaly"] = is_anomaly
                vitals_history.append(vitals)
        return vitals_history

    # If no records exist, return empty array
    return []

# --- Devices Routes ---
class DeviceSetup(BaseModel):
    name: str
    type: str
    status: str
    last_sync: str

@router.get("/devices")
async def get_patient_devices(current_user: dict = Depends(require_role(["patient"]))):
    devices = await devices_collection.find({"user_id": current_user["id"]}).to_list(length=20)
    return [
        {
            "id": str(d["_id"]),
            "name": d["name"],
            "type": d["type"],
            "status": d["status"],
            "last_sync": d["last_sync"]
        }
        for d in devices
    ]

@router.post("/devices")
async def add_patient_device(device: DeviceSetup, current_user: dict = Depends(require_role(["patient"]))):
    new_device = {
        "user_id": current_user["id"],
        "name": device.name,
        "type": device.type,
        "status": device.status,
        "last_sync": device.last_sync
    }
    result = await devices_collection.insert_one(new_device)
    new_device["id"] = str(result.inserted_id)
    return new_device

# --- Appointments Routes ---
from backend.app.database import appointments_collection

class AppointmentCreate(BaseModel):
    doctor_id: str
    doctor_name: str
    date: str  # Format: YYYY-MM-DD
    time: str  # Format: HH:MM
    reason: str
    type: str  # e.g. "Teleconsult", "In-Person"

@router.post("/appointments", status_code=status.HTTP_201_CREATED)
async def book_appointment(appt: AppointmentCreate, current_user: dict = Depends(require_role(["patient"]))):
    appt_dict = appt.model_dump()
    appt_dict["patient_id"] = current_user["id"]
    appt_dict["patient_name"] = current_user["full_name"]
    appt_dict["status"] = "scheduled" # scheduled, completed, cancelled
    appt_dict["created_at"] = datetime.datetime.utcnow()
    
    result = await appointments_collection.insert_one(appt_dict)
    return {"id": str(result.inserted_id), "message": "Appointment booked successfully"}

@router.get("/appointments")
async def get_appointments(current_user: dict = Depends(require_role(["patient"]))):
    cursor = appointments_collection.find({"patient_id": current_user["id"]}).sort("date", 1)
    appts = await cursor.to_list(length=100)
    for a in appts:
        a["_id"] = str(a["_id"])
    return appts

@router.delete("/appointments/{appt_id}")
async def cancel_appointment(appt_id: str, current_user: dict = Depends(require_role(["patient"]))):
    from bson import ObjectId
    result = await appointments_collection.update_one(
        {"_id": ObjectId(appt_id), "patient_id": current_user["id"]},
        {"$set": {"status": "cancelled"}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"message": "Appointment cancelled"}

# --- Timeline Route ---
@router.get("/timeline")
async def get_timeline(current_user: dict = Depends(get_current_user)):
    # Fetch from predictions
    preds_cursor = predictions_collection.find({"user_id": current_user["id"]}).sort("created_at", -1)
    preds = await preds_cursor.to_list(length=100)
    
    events = []
    for p in preds:
        model_name = p.get('model', 'Unknown').title()
        if model_name == "Heart":
            model_name = "Cardiovascular"
        
        events.append({
            "id": str(p["_id"]),
            "date": p["created_at"].strftime("%b %d, %Y, %I:%M %p"),
            "type": "prediction",
            "title": f"{model_name} Risk Assessment",
            "description": f"Ran a {p.get('model', '')} disease prediction model based on updated metrics.",
            "risk_level": p.get("risk_level", "low").lower(),
            "probability": round(p.get("probability", 0) * 100, 1)
        })
        
    return events
