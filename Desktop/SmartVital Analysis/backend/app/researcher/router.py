from fastapi import APIRouter, Depends, HTTPException
import hashlib
from typing import List, Dict, Any

from backend.app.auth.dependencies import get_current_user
from backend.app.database import patient_profiles_collection, predictions_collection

router = APIRouter()

def require_researcher(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") not in ["researcher", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized. Researcher access required.")
    return current_user

@router.get("/stats")
async def get_researcher_stats(current_user: dict = Depends(require_researcher)):
    total_patients = await patient_profiles_collection.count_documents({})
    
    # Calculate some basic aggregations
    pipeline = [
        {"$group": {
            "_id": None,
            "avg_bmi": {"$avg": "$bmi"},
            "avg_age": {"$avg": "$age"}
        }}
    ]
    cursor = patient_profiles_collection.aggregate(pipeline)
    agg_results = await cursor.to_list(length=1)
    
    avg_bmi = 0
    avg_age = 0
    if agg_results:
        avg_bmi = round(agg_results[0].get("avg_bmi", 0) or 0, 1)
        avg_age = round(agg_results[0].get("avg_age", 0) or 0, 1)

    # Count high-risk patients (mock logic: anyone with a chronic disease)
    high_risk_patients = await patient_profiles_collection.count_documents({
        "chronic_diseases": {"$not": {"$size": 0}, "$exists": True}
    })

    return {
        "total_patients": total_patients,
        "active_cohorts": 8, # Mocked value for now
        "avg_bmi": avg_bmi,
        "avg_age": avg_age,
        "high_risk_patients": high_risk_patients,
        "model_accuracy": 94.2 # Placeholder until we have ML tracking
    }

@router.get("/dataset")
async def get_anonymized_dataset(current_user: dict = Depends(require_researcher)):
    # Fetch profiles, but strip out PII (name, phone, address, emergency contact)
    cursor = patient_profiles_collection.find({})
    profiles = await cursor.to_list(length=1000) # Limit to 1000 for performance
    
    anonymized_data = []
    for p in profiles:
        # Create a hash of the user ID to serve as a consistent but anonymous ID
        patient_hash = hashlib.sha256(str(p.get("user_id", "")).encode()).hexdigest()[:6]
        
        vitals = p.get("vitals", {}) or {}
        bp_sys = vitals.get("blood_pressure_sys", "-")
        bp_dia = vitals.get("blood_pressure_dia", "-")
        bp = f"{bp_sys}/{bp_dia}" if bp_sys != "-" and bp_dia != "-" else "-"
        
        glucose = vitals.get("blood_sugar", "-")
        
        # Determine "Primary Target" for the dataset table from chronic diseases
        diseases = p.get("chronic_diseases", [])
        target = "None"
        if "Heart Disease" in diseases:
            target = "Heart"
        elif "Diabetes" in diseases:
            target = "Diabetes"
        elif "Hypertension" in diseases:
            target = "Hypertension"
        elif len(diseases) > 0:
            target = diseases[0]

        anonymized_data.append({
            "id": patient_hash,
            "age": p.get("age", "-"),
            "gender": "M" if p.get("gender") == "Male" else "F" if p.get("gender") == "Female" else "O",
            "bmi": p.get("bmi", "-"),
            "bp": bp,
            "glucose": glucose,
            "target": target
        })
        
    return anonymized_data

@router.get("/correlations")
async def get_disease_correlations(current_user: dict = Depends(require_researcher)):
    # Very simplified mock-like logic using real data co-occurrence
    # Real Pearson correlation requires full arrays. Here we just count co-occurrences of chronic diseases.
    pipeline = [
        {"$project": {"chronic_diseases": 1}},
        {"$unwind": "$chronic_diseases"}
    ]
    cursor = patient_profiles_collection.aggregate(pipeline)
    disease_list = await cursor.to_list(length=None)
    
    # Actually, to find pairs, it's easier to fetch all profiles and count
    cursor = patient_profiles_collection.find({}, {"chronic_diseases": 1})
    profiles = await cursor.to_list(length=None)
    
    pairs = {}
    for p in profiles:
        diseases = p.get("chronic_diseases", [])
        for i in range(len(diseases)):
            for j in range(i + 1, len(diseases)):
                d1, d2 = diseases[i], diseases[j]
                if d1 > d2:
                    d1, d2 = d2, d1
                pair = f"{d1} & {d2}"
                pairs[pair] = pairs.get(pair, 0) + 1
                
    # Format into the expected structure for the frontend
    # Since real DB might have very few overlapping diseases right now, 
    # we'll mix in the real counts with some simulated positive/negative correlations 
    # so the chart doesn't look completely empty on a fresh database.
    
    total_profiles = await patient_profiles_collection.count_documents({})
    
    results = []
    for pair, count in pairs.items():
        # Fake a correlation value based on co-occurrence frequency
        corr = min(0.99, (count / (total_profiles or 1)) * 5) 
        if corr > 0:
            results.append({"pair": pair, "correlation": round(corr, 2)})
            
    # Add defaults if DB is empty to ensure UI renders
    if len(results) < 3:
        results.extend([
            { "pair": 'Stress & Hypertension (Simulated)', "correlation": 0.62 },
            { "pair": 'Physical Activity & Heart Risk (Simulated)', "correlation": -0.65 },
            { "pair": 'High HDL & Stroke Risk (Simulated)', "correlation": -0.45 },
        ])
        
    return sorted(results, key=lambda x: x["correlation"], reverse=True)[:10]
