from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
import pandas as pd
import os
import json
import joblib

from src.preprocessing.data_pipeline import HeartDataPipeline, StrokeDataPipeline, DiabetesDataPipeline, LungCancerDataPipeline
from src.ai_assistant.engine import HealthAssistantEngine
from src.explainability.shap_explainer import SmartVitalSHAP
from src.explainability.lime_explainer import SmartVitalLIME
    
from src.explainability.feature_maps import HEART_FEATURES, STROKE_FEATURES, DIABETES_FEATURES, LUNG_FEATURES
from src.api.database import get_db, HealthAssessment
from src.correlation_engine.engine import ComorbidityEngine
from backend.app.auth.dependencies import get_current_user
from backend.app.database import predictions_collection
import datetime
from src.utils.feature_inference import infer_heart_features, infer_stroke_features, infer_diabetes_features, infer_lung_features

router = APIRouter()
engine = HealthAssistantEngine()
comorbidity_engine = ComorbidityEngine()

def get_explainer(pipeline_class, dataset_path, model_dir, prefix, model_path):
    if not os.path.exists(model_path):
        return None, None, None, None
    pipe = pipeline_class(dataset_path=dataset_path, model_dir=model_dir)
    pipe.load_artifacts(prefix)
    model = joblib.load(model_path)
    
    # We need both raw and processed for explainability
    raw_df = pd.read_csv(dataset_path)
    X_processed, _ = pipe.prepare_training_data()
    
    return pipe, model, X_processed, raw_df


# Request schemas
class HeartRequest(BaseModel):
    Age: int
    Heart_Rate: float
    Diabetes: int
    Family_History: int
    Smoking: int
    Alcohol_Consumption: float
    Exercise_Hours_Per_Week: float
    Diet: str

class StrokeRequest(BaseModel):
    gender: str
    age: int
    hypertension: int
    heart_disease: int
    ever_married: str
    work_type: str
    Residence_type: str
    avg_glucose_level: float
    bmi: float
    smoking_status: str

class DiabetesRequest(BaseModel):
    Pregnancies: int
    Glucose: float
    BloodPressure: float
    SkinThickness: float
    Insulin: float
    BMI: float
    DiabetesPedigreeFunction: float
    Age: int

class LungCancerRequest(BaseModel):
    GENDER: str
    AGE: int
    SMOKING: int
    YELLOW_FINGERS: int
    ANXIETY: int
    PEER_PRESSURE: int
    CHRONIC_DISEASE: int
    FATIGUE: int
    ALLERGY: int
    WHEEZING: int
    ALCOHOL_CONSUMING: int
    COUGHING: int
    SHORTNESS_OF_BREATH: int
    SWALLOWING_DIFFICULTY: int
    CHEST_PAIN: int

@router.post("/heart")
async def predict_heart(request: HeartRequest, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    pipe, model, X_bg, raw_df = get_explainer(HeartDataPipeline, 'datasets/heart_new.csv', 'models/heart/', 'heart', 'models/heart/heart_new_model.pkl')
    if not model:
        raise HTTPException(status_code=500, detail="Model not trained.")
        
    data_dict = request.model_dump()
    mapped_data = {
        'Age': data_dict['Age'],
        'Heart Rate': data_dict['Heart_Rate'],
        'Diabetes': data_dict['Diabetes'],
        'Family History': data_dict['Family_History'],
        'Smoking': data_dict['Smoking'],
        'Alcohol Consumption': data_dict['Alcohol_Consumption'],
        'Exercise Hours Per Week': data_dict['Exercise_Hours_Per_Week'],
        'Diet': data_dict['Diet']
    }
    input_data = pd.DataFrame([mapped_data])
    processed_data = pipe.process_data(input_data, training=False)
    
    # Try predicting - models might have different formats
    try:
        prob = float(model.predict_proba(processed_data)[0][1])
    except Exception:
        preds = model.predict(processed_data)
        prob = float(preds[0]) if len(preds.shape) == 1 else float(preds[0][1])
    
    shap_module = SmartVitalSHAP(disease="heart")
    lime_module = SmartVitalLIME(disease="heart")
    
    shap_vals, feat_names, _ = shap_module.get_shap_values(model, X_bg, processed_data)
    shap_data = shap_module.get_top_features(shap_vals, feat_names, 5)
    
    lime_data = lime_module.get_explanation(model, X_bg, processed_data, num_features=6)
    
    risk_level = "HIGH" if prob > 0.6 else "MODERATE" if prob > 0.3 else "LOW"
    narrative = shap_module.generate_narrative(shap_data, risk_level, prob)
        
    insight_text = engine.analyze_risk("Heart Disease", prob)
    
    # Save to timeline (SQLite fallback for ComorbidityEngine)
    assessment = HealthAssessment(
        disease="Heart Disease",
        risk_score=float(prob),
        insight=insight_text,
        raw_inputs=json.dumps(request.model_dump())
    )
    db.add(assessment)
    db.commit()
    
    # Save to MongoDB for Timeline and Forecasting
    await predictions_collection.insert_one({
        "user_id": current_user["id"],
        "model": "heart",
        "probability": float(prob),
        "risk_level": risk_level,
        "inputs": request.model_dump(),
        "created_at": datetime.datetime.utcnow()
    })
    
    return {
        "disease": "Heart Disease",
        "risk_score": float(prob),
        "risk_level": risk_level,
        "insight": insight_text,
        "preventive_actions": engine.generate_preventive_actions("Heart Disease"),
        "shap_data": shap_data,
        "lime_data": lime_data,
        "narrative": narrative
    }

@router.post("/stroke")
async def predict_stroke(request: StrokeRequest, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    pipe, model, X_bg, raw_df = get_explainer(StrokeDataPipeline, 'datasets/stroke_new.csv', 'models/stroke/', 'stroke', 'models/stroke/stroke_new_model.pkl')
    if not model:
        raise HTTPException(status_code=500, detail="Model not trained.")
        
    input_data = pd.DataFrame([request.model_dump()])
    processed_data = pipe.process_data(input_data, training=False)
    
    try:
        prob = float(model.predict_proba(processed_data)[0][1])
    except Exception:
        preds = model.predict(processed_data)
        prob = float(preds[0]) if len(preds.shape) == 1 else float(preds[0][1])
    
    shap_module = SmartVitalSHAP(disease="stroke")
    lime_module = SmartVitalLIME(disease="stroke")
    shap_vals, feat_names, _ = shap_module.get_shap_values(model, X_bg, processed_data)
    shap_data = shap_module.get_top_features(shap_vals, feat_names, 5)
    lime_data = lime_module.get_explanation(model, X_bg, processed_data, num_features=6)
    risk_level = "HIGH" if prob > 0.6 else "MODERATE" if prob > 0.3 else "LOW"
    narrative = shap_module.generate_narrative(shap_data, risk_level, prob)
        
    insight_text = engine.analyze_risk("Stroke", prob)

    # Save to timeline (SQLite fallback)
    assessment = HealthAssessment(
        disease="Stroke",
        risk_score=float(prob),
        insight=insight_text,
        raw_inputs=json.dumps(request.model_dump())
    )
    db.add(assessment)
    db.commit()

    # Save to MongoDB
    await predictions_collection.insert_one({
        "user_id": current_user["id"],
        "model": "stroke",
        "probability": float(prob),
        "risk_level": risk_level,
        "inputs": request.model_dump(),
        "created_at": datetime.datetime.utcnow()
    })

    return {
        "disease": "Stroke",
        "risk_score": float(prob),
        "risk_level": risk_level,
        "insight": insight_text,
        "preventive_actions": engine.generate_preventive_actions("Stroke"),
        "shap_data": shap_data,
        "lime_data": lime_data,
        "narrative": narrative
    }

@router.post("/diabetes")
async def predict_diabetes(request: DiabetesRequest, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    pipe, model, X_bg, raw_df = get_explainer(DiabetesDataPipeline, 'datasets/diabetes_new.csv', 'models/diabetes/', 'diabetes', 'models/diabetes/diabetes_new_model.pkl')
    if not model:
        raise HTTPException(status_code=500, detail="Model not trained.")
        
    input_data = pd.DataFrame([request.model_dump()])
    processed_data = pipe.process_data(input_data, training=False)
    
    try:
        prob = float(model.predict_proba(processed_data)[0][1])
    except Exception:
        preds = model.predict(processed_data)
        prob = float(preds[0]) if len(preds.shape) == 1 else float(preds[0][1])
    
    shap_module = SmartVitalSHAP(disease="diabetes")
    lime_module = SmartVitalLIME(disease="diabetes")
    shap_vals, feat_names, _ = shap_module.get_shap_values(model, X_bg, processed_data)
    shap_data = shap_module.get_top_features(shap_vals, feat_names, 5)
    lime_data = lime_module.get_explanation(model, X_bg, processed_data, num_features=6)
    risk_level = "HIGH" if prob > 0.6 else "MODERATE" if prob > 0.3 else "LOW"
    narrative = shap_module.generate_narrative(shap_data, risk_level, prob)
        
    insight_text = engine.analyze_risk("Diabetes", prob)

    # Save to timeline (SQLite fallback)
    assessment = HealthAssessment(
        disease="Diabetes",
        risk_score=float(prob),
        insight=insight_text,
        raw_inputs=json.dumps(request.model_dump())
    )
    db.add(assessment)
    db.commit()

    # Save to MongoDB
    await predictions_collection.insert_one({
        "user_id": current_user["id"],
        "model": "diabetes",
        "probability": float(prob),
        "risk_level": risk_level,
        "inputs": request.model_dump(),
        "created_at": datetime.datetime.utcnow()
    })

    return {
        "disease": "Diabetes",
        "risk_score": float(prob),
        "risk_level": risk_level,
        "insight": insight_text,
        "preventive_actions": engine.generate_preventive_actions("Diabetes"),
        "shap_data": shap_data,
        "lime_data": lime_data,
        "narrative": narrative
    }

@router.post("/lung")
async def predict_lung(request: LungCancerRequest, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    pipe, model, X_bg, raw_df = get_explainer(LungCancerDataPipeline, 'datasets/lung_cancer_new.csv', 'models/lung/', 'lung', 'models/lung/lung_cancer_new_model.pkl')
    if not model:
        raise HTTPException(status_code=500, detail="Model not trained.")
        
    data_dict = request.model_dump()
    # Fix names for pipeline
    mapped_data = {
        'GENDER': data_dict['GENDER'], 'AGE': data_dict['AGE'], 'SMOKING': data_dict['SMOKING'], 
        'YELLOW_FINGERS': data_dict['YELLOW_FINGERS'], 'ANXIETY': data_dict['ANXIETY'], 
        'PEER_PRESSURE': data_dict['PEER_PRESSURE'], 'CHRONIC DISEASE': data_dict['CHRONIC_DISEASE'],
        'FATIGUE': data_dict['FATIGUE'], 'ALLERGY': data_dict['ALLERGY'], 'WHEEZING': data_dict['WHEEZING'],
        'ALCOHOL CONSUMING': data_dict['ALCOHOL_CONSUMING'], 'COUGHING': data_dict['COUGHING'], 
        'SHORTNESS OF BREATH': data_dict['SHORTNESS_OF_BREATH'], 'SWALLOWING DIFFICULTY': data_dict['SWALLOWING_DIFFICULTY'], 
        'CHEST PAIN': data_dict['CHEST_PAIN']
    }
    input_data = pd.DataFrame([mapped_data])
    processed_data = pipe.process_data(input_data, training=False)
    
    try:
        prob = float(model.predict_proba(processed_data)[0][1])
    except Exception:
        preds = model.predict(processed_data)
        prob = float(preds[0]) if len(preds.shape) == 1 else float(preds[0][1])
    
    shap_module = SmartVitalSHAP(disease="lung")
    lime_module = SmartVitalLIME(disease="lung")
    shap_vals, feat_names, _ = shap_module.get_shap_values(model, X_bg, processed_data)
    shap_data = shap_module.get_top_features(shap_vals, feat_names, 5)
    lime_data = lime_module.get_explanation(model, X_bg, processed_data, num_features=6)
    risk_level = "HIGH" if prob > 0.6 else "MODERATE" if prob > 0.3 else "LOW"
    narrative = shap_module.generate_narrative(shap_data, risk_level, prob)
        
    insight_text = engine.analyze_risk("Lung Cancer", prob)

    # Save to timeline (SQLite fallback)
    assessment = HealthAssessment(
        disease="Lung Cancer",
        risk_score=float(prob),
        insight=insight_text,
        raw_inputs=json.dumps(request.model_dump())
    )
    db.add(assessment)
    db.commit()

    # Save to MongoDB
    await predictions_collection.insert_one({
        "user_id": current_user["id"],
        "model": "lung",
        "probability": float(prob),
        "risk_level": risk_level,
        "inputs": request.model_dump(),
        "created_at": datetime.datetime.utcnow()
    })

    return {
        "disease": "Lung Cancer",
        "risk_score": float(prob),
        "risk_level": risk_level,
        "insight": insight_text,
        "preventive_actions": engine.generate_preventive_actions("Lung Cancer"),
        "shap_data": shap_data,
        "lime_data": lime_data,
        "narrative": narrative
    }

@router.get("/timeline")
async def get_timeline(db: Session = Depends(get_db)):
    # Fetch all assessments ordered by time descending
    assessments = db.query(HealthAssessment).order_by(HealthAssessment.timestamp.desc()).all()
    return [
        {
            "id": a.id,
            "disease": a.disease,
            "risk_score": a.risk_score,
            "insight": a.insight,
            "timestamp": a.timestamp.isoformat()
        }
        for a in assessments
    ]

@router.get("/comorbidity")
async def get_comorbidity(db: Session = Depends(get_db)):
    # Get the latest assessment for each disease
    diseases = ["Heart Disease", "Stroke", "Diabetes", "Lung Cancer"]
    latest_assessments = []
    
    for d in diseases:
        a = db.query(HealthAssessment).filter(HealthAssessment.disease == d).order_by(HealthAssessment.timestamp.desc()).first()
        if a:
            latest_assessments.append({
                "disease": a.disease,
                "risk_score": a.risk_score,
                "insight": a.insight,
                "raw_inputs": a.raw_inputs
            })
            
    # Generate comorbidity report
    report = comorbidity_engine.generate_comorbidity_report(latest_assessments)
    return report

class ComorbidityAnalyzeRequest(BaseModel):
    conditions: list[str]
    patient_id: str = None

@router.post("/comorbidity/analyze")
async def analyze_comorbidity_manual(request: ComorbidityAnalyzeRequest):
    selected = request.conditions
    base_risk = len(selected) * 0.15
    multiplier = 1.4 if len(selected) > 1 else 1.0
    final_risk = min(base_risk * multiplier, 0.95)
    
    effects = []
    if len(selected) > 1:
        effects.append(f"The combination of {', '.join(selected)} creates a synergistic risk effect, amplifying cardiovascular strain.")
    else:
        effects.append(f"Isolated {selected[0]} detected. Standard monitoring recommended.")
        
    return {
        "conditions_analyzed": selected,
        "compounded_risk_score": final_risk,
        "risk_level": "High" if final_risk > 0.6 else "Medium" if final_risk > 0.3 else "Low",
        "synergistic_effects": effects,
        "recommendations": [
            "Immediate lifestyle intervention required." if final_risk > 0.6 else "Maintain healthy lifestyle.",
            "Schedule bi-weekly monitoring." if len(selected) > 1 else "Annual checkup recommended.",
            "Consult specialist for medication adjustment." if "diabetes" in selected or "hypertension" in selected else "Continue current care plan."
        ]
    }

from src.simulation_engine.impact_analyzer import ImpactAnalyzer
from src.simulation_engine.narrative_generator import NarrativeGenerator

impact_analyzer = ImpactAnalyzer()

@router.get("/simulation/baseline")
async def get_simulation_baseline(db: Session = Depends(get_db)):
    diseases = ["Heart Disease", "Stroke", "Diabetes", "Lung Cancer"]
    baseline_inputs = {}
    base_risks = {}
    
    for d in diseases:
        a = db.query(HealthAssessment).filter(HealthAssessment.disease == d).order_by(HealthAssessment.timestamp.desc()).first()
        if a and a.raw_inputs:
            inputs = json.loads(a.raw_inputs)
            baseline_inputs.update(inputs)
            base_risks[d] = a.risk_score
            
    if not baseline_inputs:
        raise HTTPException(status_code=404, detail="No baseline data found. Please complete the assessments first.")
        
    return {
        "baseline_inputs": baseline_inputs,
        "base_risks": base_risks
    }

@router.get("/explainability/shap/{model_type}")
async def get_shap_explanation(model_type: str, patient_id: str = None, db: Session = Depends(get_db)):
    mapping = {
        'heart': "Heart Disease",
        'stroke': "Stroke",
        'diabetes': "Diabetes",
        'lung': "Lung Cancer"
    }
    disease_name = mapping.get(model_type)
    if not disease_name:
        raise HTTPException(status_code=400, detail="Invalid model type")

    assessment = db.query(HealthAssessment).filter(HealthAssessment.disease == disease_name).order_by(HealthAssessment.timestamp.desc()).first()
    API_BASE = "http://localhost:8000"
    
    top_features = [
        { "name": 'Age', "impact": 0.35, "value": '62 yrs' },
        { "name": 'Resting BP', "impact": 0.22, "value": '145 mmHg' },
        { "name": 'Max Heart Rate', "impact": -0.15, "value": '112 bpm' }
    ]
    
    if assessment and assessment.raw_inputs:
        raw = json.loads(assessment.raw_inputs)
        feats = []
        if 'Age' in raw or 'age' in raw:
            val = raw.get('Age') or raw.get('age')
            feats.append({"name": "Age", "impact": round(val / 100 * 0.5, 2), "value": f"{val} yrs"})
        if 'RestingBP' in raw:
            val = raw.get('RestingBP')
            feats.append({"name": "Resting BP", "impact": round((val - 120) / 100, 2), "value": f"{val} mmHg"})
        if 'bmi' in raw:
            val = raw.get('bmi')
            feats.append({"name": "BMI", "impact": round((val - 25) / 50, 2), "value": str(val)})
        if len(feats) > 0:
            top_features = feats

    return {
        "model": model_type,
        "summary_plot": f"{API_BASE}/assets/shap_summary.png",
        "force_plot": f"{API_BASE}/assets/shap_force.png",
        "top_features": top_features
    }

class SimulationRequest(BaseModel):
    scenarios: list[str]

@router.post("/simulation/run")
async def run_simulation(request: SimulationRequest, db: Session = Depends(get_db)):
    # Fetch baseline
    baseline = await get_simulation_baseline(db)
    base_inputs = baseline["baseline_inputs"]
    base_risks = baseline["base_risks"]
    
    impact = impact_analyzer.calculate_impact(base_inputs, base_risks, request.scenarios)
    narrative = NarrativeGenerator.generate(impact, request.scenarios)
    
    return {
        "impact": impact,
        "narrative": narrative
    }




class QuestionnaireSubmission(BaseModel):
    disease: str
    answers: dict
    tier_reached: int

@router.post("/predict/questionnaire")
async def predict_from_questionnaire(submission: QuestionnaireSubmission, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    disease = submission.disease
    answers = submission.answers
    answers['tier_reached'] = submission.tier_reached
    
    inference_map = {
        'heart': infer_heart_features,
        'diabetes': infer_diabetes_features,
        'stroke': infer_stroke_features,
        'lung': infer_lung_features
    }
    
    if disease not in inference_map:
        raise HTTPException(status_code=400, detail="Unknown disease type")
        
    inferred = inference_map[disease](answers)
    features_dict = inferred['features']
    lifestyle_modifier = inferred['lifestyle_risk_modifier']
    
    pipeline_map = {
        'heart': (HeartDataPipeline, 'datasets/heart_new.csv', 'models/heart/', 'heart', 'models/heart/heart_new_model.pkl'),
        'diabetes': (DiabetesDataPipeline, 'datasets/diabetes_new.csv', 'models/diabetes/', 'diabetes', 'models/diabetes/diabetes_new_model.pkl'),
        'stroke': (StrokeDataPipeline, 'datasets/stroke_new.csv', 'models/stroke/', 'stroke', 'models/stroke/stroke_new_model.pkl'),
        'lung': (LungCancerDataPipeline, 'datasets/lung_cancer_new.csv', 'models/lung/', 'lung', 'models/lung/lung_cancer_new_model.pkl')
    }
    
    pipe_cls, data_path, mod_dir, prefix, mod_path = pipeline_map[disease]
    pipe, model, _, _ = get_explainer(pipe_cls, data_path, mod_dir, prefix, mod_path)
    
    if not model:
        raise HTTPException(status_code=500, detail="Model not trained.")
        
    input_data = pd.DataFrame([features_dict])
    processed_data = pipe.process_data(input_data, training=False)
    
    # We use model.predict_proba or model.predict fallback which is handled in our LIME/SHAP wrappers or we do it here.
    if hasattr(model, 'predict_proba'):
        base_prob = float(model.predict_proba(processed_data)[0][1])
    else:
        # Fallback if model doesn't support predict_proba (e.g. some SVC)
        base_prob = float(model.predict(processed_data)[0])
        
    prob = min(0.99, max(0.01, base_prob + lifestyle_modifier))
    
    # Generate SHAP and LIME explanations
    shap_module = SmartVitalSHAP(disease=disease)
    lime_module = SmartVitalLIME(disease=disease)
    
    # We need X_bg (background dataset). It's available via pipe.process_data(pipe.load_data())
    try:
        raw_bg = pipe.load_data()
        X_bg = pipe.process_data(raw_bg, training=False)
        shap_vals, feat_names, _ = shap_module.get_shap_values(model, X_bg, processed_data)
        shap_data = shap_module.get_top_features(shap_vals, feat_names, 5)
        lime_data = lime_module.get_explanation(model, X_bg, processed_data, num_features=6)
    except Exception as e:
        print(f"Explainability Error: {e}")
        shap_data = []
        lime_data = []
        
    risk_level = "HIGH" if prob > 0.6 else "MODERATE" if prob > 0.3 else "LOW"
    narrative = shap_module.generate_narrative(shap_data, risk_level, prob)
    
    disease_display = disease.replace('_', ' ').title()
    if disease == 'heart': disease_display = 'Heart Disease'
    elif disease == 'lung': disease_display = 'Lung Cancer'
        
    insight_text = engine.analyze_risk(disease_display, prob)

    # Save to timeline
    assessment = HealthAssessment(
        disease=disease_display,
        risk_score=float(prob),
        insight=insight_text,
        raw_inputs=json.dumps(answers)
    )
    db.add(assessment)
    db.commit()

    # Save to MongoDB
    await predictions_collection.insert_one({
        "user_id": current_user["id"],
        "model": disease,
        "probability": float(prob),
        "risk_level": risk_level,
        "inputs": answers,
        "created_at": datetime.datetime.utcnow()
    })

    return {
        "disease": disease_display,
        "risk_score": float(prob),
        "risk_level": risk_level,
        "insight": insight_text,
        "preventive_actions": engine.generate_preventive_actions(disease_display),
        "shap_data": shap_data,
        "lime_data": lime_data,
        "narrative": narrative
    }
