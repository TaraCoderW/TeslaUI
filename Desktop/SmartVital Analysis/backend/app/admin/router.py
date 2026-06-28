from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any

from backend.app.auth.dependencies import get_current_user
from backend.app.database import (
    users_collection, patient_profiles_collection, doctor_profiles_collection, 
    devices_collection, audit_logs_collection, predictions_collection, permissions_collection
)
import os
import psutil
import time
from datetime import datetime

router = APIRouter()

def require_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized. Admin access required.")
    return current_user

@router.get("/stats")
async def get_admin_stats(current_user: dict = Depends(require_admin)):
    # 1. Total registered users
    total_users = await users_collection.count_documents({})
    
    # 2. Count by role
    pipeline = [
        {"$group": {"_id": "$role", "count": {"$sum": 1}}}
    ]
    role_counts_cursor = users_collection.aggregate(pipeline)
    role_counts_raw = await role_counts_cursor.to_list(length=None)
    
    role_counts = {
        "patient": 0,
        "doctor": 0,
        "researcher": 0,
        "admin": 0
    }
    for item in role_counts_raw:
        role = item.get("_id")
        if role in role_counts:
            role_counts[role] = item.get("count", 0)

    # 3. Active devices (mocking slightly if collection empty)
    total_devices = await devices_collection.count_documents({})
    
    # 4. Total health records / profiles
    total_patient_profiles = await patient_profiles_collection.count_documents({})
    
    return {
        "total_users": total_users,
        "roles": role_counts,
        "total_devices": total_devices,
        "total_patient_profiles": total_patient_profiles,
        "system_health": "Healthy",
        "api_latency": "24ms" # mocked for dashboard UI
    }

@router.get("/users")
async def get_all_users(current_user: dict = Depends(require_admin)):
    cursor = users_collection.find({}, {"password": 0}) # Exclude password
    users = await cursor.to_list(length=1000)
    
    formatted_users = []
    for u in users:
        formatted_users.append({
            "id": str(u.get("_id")),
            "email": u.get("email"),
            "role": u.get("role"),
            "full_name": u.get("full_name", "-"),
            "is_verified": u.get("is_verified", False),
            "created_at": u.get("created_at")
        })
    return formatted_users

@router.get("/users/doctors")
async def get_doctors(current_user: dict = Depends(require_admin)):
    cursor = users_collection.find({"role": "doctor"}, {"password": 0})
    doctors = await cursor.to_list(length=1000)
    
    results = []
    for d in doctors:
        profile = await doctor_profiles_collection.find_one({"user_id": str(d.get("_id"))}) or {}
        results.append({
            "id": str(d.get("_id")),
            "email": d.get("email"),
            "full_name": d.get("full_name", "-"),
            "specialization": profile.get("specialization", "Unspecified"),
            "license_number": profile.get("license_number", "-"),
            "is_verified": d.get("is_verified", False),
            "created_at": d.get("created_at")
        })
    return results

@router.get("/users/patients")
async def get_patients(current_user: dict = Depends(require_admin)):
    cursor = users_collection.find({"role": "patient"}, {"password": 0})
    patients = await cursor.to_list(length=1000)
    
    results = []
    for p in patients:
        profile = await patient_profiles_collection.find_one({"user_id": str(p.get("_id"))}) or {}
        results.append({
            "id": str(p.get("_id")),
            "email": p.get("email"),
            "full_name": p.get("full_name", "-"),
            "age": profile.get("age", "-"),
            "gender": profile.get("gender", "-"),
            "blood_type": profile.get("blood_type", "-"),
            "created_at": p.get("created_at")
        })
    return results

@router.get("/users/researchers")
async def get_researchers(current_user: dict = Depends(require_admin)):
    cursor = users_collection.find({"role": "researcher"}, {"password": 0})
    researchers = await cursor.to_list(length=1000)
    results = []
    for r in researchers:
        results.append({
            "id": str(r.get("_id")),
            "email": r.get("email"),
            "full_name": r.get("full_name", "-"),
            "institution": r.get("institution", "Unspecified"),
            "created_at": r.get("created_at")
        })
    return results

@router.get("/devices")
async def get_devices(current_user: dict = Depends(require_admin)):
    cursor = devices_collection.find()
    devices = await cursor.to_list(length=1000)
    results = []
    for d in devices:
        results.append({
            "id": str(d.get("_id")),
            "patient_id": d.get("patient_id"),
            "device_type": d.get("device_type", "Unknown"),
            "status": d.get("status", "Offline"),
            "battery": d.get("battery", 0),
            "last_sync": d.get("last_sync", "-")
        })
    return results

@router.get("/system/health")
async def get_system_health(current_user: dict = Depends(require_admin)):
    cpu_usage = psutil.cpu_percent(interval=0.5)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    
    return {
        "cpu_usage": cpu_usage,
        "memory_total_gb": round(memory.total / (1024**3), 2),
        "memory_used_gb": round(memory.used / (1024**3), 2),
        "memory_percent": memory.percent,
        "disk_total_gb": round(disk.total / (1024**3), 2),
        "disk_used_gb": round(disk.used / (1024**3), 2),
        "disk_percent": disk.percent,
        "process_uptime_seconds": time.time() - psutil.Process(os.getpid()).create_time()
    }

@router.get("/system/logs")
async def get_audit_logs(current_user: dict = Depends(require_admin)):
    cursor = audit_logs_collection.find().sort("timestamp", -1).limit(100)
    logs = await cursor.to_list(length=100)
    results = []
    for log in logs:
        results.append({
            "id": str(log.get("_id")),
            "action": log.get("action", "Unknown"),
            "user_email": log.get("user_email", "System"),
            "ip_address": log.get("ip_address", "-"),
            "timestamp": log.get("timestamp")
        })
    return results

@router.get("/security/permissions")
async def get_permissions(current_user: dict = Depends(require_admin)):
    # Returns the static RBAC matrix for the platform
    return {
        "patient": ["read_own_records", "write_own_records", "read_own_predictions"],
        "doctor": ["read_assigned_patients", "write_clinical_notes", "read_predictions"],
        "researcher": ["read_anonymized_data", "read_population_trends"],
        "admin": ["read_all", "write_all", "manage_users"]
    }

@router.get("/analytics/platform")
async def get_platform_analytics(current_user: dict = Depends(require_admin)):
    # Growth over time by truncating created_at to YYYY-MM
    pipeline = [
        {
            "$project": {
                "month_year": {"$substr": ["$created_at", 0, 7]}
            }
        },
        {
            "$group": {
                "_id": "$month_year",
                "new_users": {"$sum": 1}
            }
        },
        {"$sort": {"_id": 1}}
    ]
    cursor = users_collection.aggregate(pipeline)
    growth_data = await cursor.to_list(length=None)
    
    formatted = [{"date": item["_id"] if item["_id"] else "Unknown", "new_users": item["new_users"]} for item in growth_data]
    return formatted

@router.get("/analytics/models")
async def get_model_performance(current_user: dict = Depends(require_admin)):
    pipeline = [
        {
            "$group": {
                "_id": "$model_type",
                "total_predictions": {"$sum": 1},
                "avg_confidence": {"$avg": "$confidence"}
            }
        }
    ]
    cursor = predictions_collection.aggregate(pipeline)
    model_data = await cursor.to_list(length=None)
    
    formatted = []
    for m in model_data:
        formatted.append({
            "model_type": m["_id"] or "Unknown",
            "total_predictions": m["total_predictions"],
            "avg_confidence": round(m["avg_confidence"] * 100, 2) if m["avg_confidence"] else 0
        })
    return formatted

@router.get("/analytics/population")
async def get_population_insights(current_user: dict = Depends(require_admin)):
    pipeline = [
        {
            "$group": {
                "_id": None,
                "avg_age": {"$avg": "$age"},
                "avg_bmi": {"$avg": "$bmi"}
            }
        }
    ]
    cursor = patient_profiles_collection.aggregate(pipeline)
    results = await cursor.to_list(length=1)
    
    avg_age = 0
    avg_bmi = 0
    if results:
        avg_age = round(results[0].get("avg_age", 0) or 0, 1)
        avg_bmi = round(results[0].get("avg_bmi", 0) or 0, 1)
        
    return {
        "avg_age": avg_age,
        "avg_bmi": avg_bmi
    }
