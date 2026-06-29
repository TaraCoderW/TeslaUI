import json
import os
from typing import Dict, Any

# Load cohort medians
COHORT_MEDIANS = {}
try:
    with open('data/cohort_medians.json', 'r') as f:
        COHORT_MEDIANS = json.load(f)
except FileNotFoundError:
    print("Warning: data/cohort_medians.json not found. Run compute_cohort_medians.py first.")

def get_age_group(age: int) -> str:
    if age < 40: return 'under_40'
    elif age < 55: return '40_55'
    elif age < 70: return '55_70'
    return 'over_70'

def compute_confidence_score(answers: Dict) -> float:
    """Returns 0.0-1.0 confidence based on how much data is known vs inferred."""
    tier = answers.get('tier_reached', 1)
    tier_base = {1: 0.45, 2: 0.70, 3: 0.92}
    dont_know_count = sum(1 for v in answers.values() if v == 'dont_know' or v == 'not_sure')
    penalty = dont_know_count * 0.03
    return max(0.30, tier_base.get(tier, 0.60) - penalty)

def compute_lifestyle_modifier(answers: Dict) -> float:
    """Additive probability modifier based on lifestyle answers."""
    modifier = 0.0
    if answers.get('smoker') == 'current': modifier += 0.05
    elif answers.get('smoker') == 'past': modifier += 0.02
    
    if answers.get('exercise') == 'never': modifier += 0.03
    elif answers.get('exercise') == 'daily': modifier -= 0.04
    
    if answers.get('alcohol') == 'frequently': modifier += 0.02
    
    if answers.get('family_history') == 'yes': modifier += 0.05
    if answers.get('prior_heart_attack') == 'yes': modifier += 0.08
    return modifier

def infer_thalach(age: int, sob_freq: str) -> float:
    """Infer max heart rate based on age and shortness of breath."""
    age_predicted_max = 220 - age
    if sob_freq == 'never': return age_predicted_max * 0.90
    elif sob_freq == 'sometimes': return age_predicted_max * 0.78
    elif sob_freq == 'often': return age_predicted_max * 0.65
    return age_predicted_max * 0.55

def infer_heart_features(answers: Dict[str, Any]) -> Dict[str, Any]:
    """Maps questionnaire answers to the NEW Heart dataset schema."""
    age = answers.get('age', 50)
    
    # Heart Rate
    thalach = infer_thalach(age, answers.get('shortness_of_breath', 'never'))
    
    # Diabetes
    diabetes = 1 if answers.get('diabetes') == 'yes' else 0
    
    # Family History
    family_history = 1 if answers.get('family_history') == 'yes' else 0
    
    # Smoking
    smoker_ans = answers.get('smoker', 'never')
    smoking = 1 if smoker_ans in ('current', 'past') else 0
    
    # Alcohol Consumption
    alcohol = answers.get('alcohol', 'never')
    if alcohol == 'frequently': alc_score = 15.0
    elif alcohol == 'occasionally': alc_score = 5.0
    else: alc_score = 0.0
    
    # Exercise
    exercise = answers.get('exercise', 'rarely')
    if exercise == 'daily': ex_hours = 7.0
    elif exercise == 'weekly': ex_hours = 3.0
    elif exercise == 'rarely': ex_hours = 1.0
    else: ex_hours = 0.0
    
    # Diet
    diet = answers.get('diet', 'Average').capitalize()
    
    return {
        'features': {
            'Age': age,
            'Heart_Rate': thalach,
            'Diabetes': diabetes,
            'Family_History': family_history,
            'Smoking': smoking,
            'Alcohol_Consumption': alc_score,
            'Exercise_Hours_Per_Week': ex_hours,
            'Diet': diet
        },
        'lifestyle_risk_modifier': compute_lifestyle_modifier(answers),
        'tier': answers.get('tier_reached', 2),
        'confidence': compute_confidence_score(answers)
    }

def infer_stroke_features(answers: Dict[str, Any]) -> Dict[str, Any]:
    """Maps questionnaire answers to the NEW Stroke dataset schema."""
    age = answers.get('age', 50)
    sex = answers.get('sex', 'Female').capitalize()
    
    hypertension = 1 if answers.get('bp_known') == 'yes_high' else 0
    heart_disease = 1 if answers.get('prior_heart_attack') == 'yes' else 0
    ever_married = 'Yes' if answers.get('married') == 'yes' else 'No'
    
    work_type = answers.get('work_type', 'Private')
    residence = answers.get('residence', 'Urban')
    
    smoker = answers.get('smoker', 'never')
    if smoker == 'current': smoking_status = 'smokes'
    elif smoker == 'past': smoking_status = 'formerly smoked'
    else: smoking_status = 'never smoked'
    
    bmi_str = answers.get('bmi', 'normal')
    bmi_map = {'underweight': 18.0, 'normal': 22.0, 'overweight': 27.5, 'obese': 32.0}
    bmi = bmi_map.get(bmi_str, 28.0)
    
    # Blood Glucose proxy
    glucose = 105.0
    if answers.get('glucose_known') == 'yes_high': glucose = 180.0
    
    return {
        'features': {
            'gender': sex,
            'age': age,
            'hypertension': hypertension,
            'heart_disease': heart_disease,
            'ever_married': ever_married,
            'work_type': work_type,
            'Residence_type': residence,
            'avg_glucose_level': glucose,
            'bmi': bmi,
            'smoking_status': smoking_status
        },
        'lifestyle_risk_modifier': compute_lifestyle_modifier(answers),
        'tier': answers.get('tier_reached', 2),
        'confidence': compute_confidence_score(answers)
    }

def infer_diabetes_features(answers: Dict[str, Any]) -> Dict[str, Any]:
    """Maps questionnaire answers to the NEW Diabetes dataset schema."""
    age = answers.get('age', 50)
    
    # Pregnancies (infer from age and sex)
    sex = answers.get('sex', 'Female')
    pregnancies = 0
    if sex.lower() in ('female', 'f') and age > 25:
        pregnancies = 2  # Average assumption
        
    glucose_known = answers.get('glucose_known')
    if glucose_known == 'yes_high': glucose = 180.0
    elif glucose_known == 'no': glucose = 95.0
    else: glucose = 120.0
        
    bp = 80.0
    if answers.get('bp_known') == 'yes_high': bp = 140.0
    
    skin_thickness = 20.0
    insulin = 79.0
    
    bmi_str = answers.get('bmi', 'normal')
    bmi_map = {'underweight': 18.0, 'normal': 22.0, 'overweight': 27.5, 'obese': 32.0}
    bmi = bmi_map.get(bmi_str, 27.0)
    
    dpf = 0.471
    if answers.get('family_history') == 'yes': dpf = 0.8
    
    return {
        'features': {
            'Pregnancies': pregnancies,
            'Glucose': glucose,
            'BloodPressure': bp,
            'SkinThickness': skin_thickness,
            'Insulin': insulin,
            'BMI': bmi,
            'DiabetesPedigreeFunction': dpf,
            'Age': age
        },
        'lifestyle_risk_modifier': compute_lifestyle_modifier(answers),
        'tier': answers.get('tier_reached', 2),
        'confidence': compute_confidence_score(answers)
    }

def infer_lung_features(answers: Dict[str, Any]) -> Dict[str, Any]:
    """Maps questionnaire answers to Lung Cancer dataset features."""
    age = answers.get('age', 50)
    sex = 'M' if answers.get('sex', 'M').lower() in ['m', 'male'] else 'F'
    
    def to_binary(ans):
        return 1 if ans == 'yes' else 0
        
    smoking = 1 if answers.get('smoker') in ('current', 'past') else 0
    yellow_fingers = to_binary(answers.get('yellow_fingers'))
    anxiety = to_binary(answers.get('anxiety'))
    peer_pressure = to_binary(answers.get('peer_pressure'))
    chronic_disease = to_binary(answers.get('chronic_disease'))
    fatigue = to_binary(answers.get('fatigue'))
    allergy = to_binary(answers.get('allergy'))
    wheezing = to_binary(answers.get('wheezing'))
    alcohol = to_binary(answers.get('alcohol'))
    coughing = to_binary(answers.get('coughing'))
    shortness_breath = to_binary(answers.get('shortness_of_breath'))
    swallowing_diff = to_binary(answers.get('swallowing_difficulty'))
    chest_pain = to_binary(answers.get('chest_pain'))
    
    return {
        'features': {
            'GENDER': sex,
            'AGE': age,
            'SMOKING': smoking,
            'YELLOW_FINGERS': yellow_fingers,
            'ANXIETY': anxiety,
            'PEER_PRESSURE': peer_pressure,
            'CHRONIC_DISEASE': chronic_disease,
            'FATIGUE': fatigue,
            'ALLERGY': allergy,
            'WHEEZING': wheezing,
            'ALCOHOL_CONSUMING': alcohol,
            'COUGHING': coughing,
            'SHORTNESS_OF_BREATH': shortness_breath,
            'SWALLOWING_DIFFICULTY': swallowing_diff,
            'CHEST_PAIN': chest_pain
        },
        'lifestyle_risk_modifier': compute_lifestyle_modifier(answers),
        'tier': answers.get('tier_reached', 2),
        'confidence': compute_confidence_score(answers)
    }
