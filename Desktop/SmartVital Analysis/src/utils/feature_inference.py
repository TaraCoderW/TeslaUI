"""
feature_inference.py
--------------------
Maps questionnaire answers (submitted by the frontend QuestionnaireWizard)
directly to the feature dictionaries expected by each disease pipeline.

Heart model expects columns (with spaces, as in heart_new.csv):
  'Age', 'Heart Rate', 'Diabetes', 'Family History', 'Smoking',
  'Alcohol Consumption', 'Exercise Hours Per Week', 'Diet'

Stroke model expects columns:
  'gender', 'age', 'hypertension', 'heart_disease', 'ever_married',
  'work_type', 'Residence_type', 'avg_glucose_level', 'bmi', 'smoking_status'

Diabetes model expects columns:
  'Pregnancies', 'Glucose', 'BloodPressure', 'SkinThickness', 'Insulin',
  'BMI', 'DiabetesPedigreeFunction', 'Age'

Lung model expects columns (with spaces as in CSV after strip):
  'GENDER', 'AGE', 'SMOKING', 'YELLOW_FINGERS', 'ANXIETY', 'PEER_PRESSURE',
  'CHRONIC DISEASE', 'FATIGUE', 'ALLERGY', 'WHEEZING', 'ALCOHOL CONSUMING',
  'COUGHING', 'SHORTNESS OF BREATH', 'SWALLOWING DIFFICULTY', 'CHEST PAIN'
"""

from typing import Dict, Any


def compute_confidence_score(answers: Dict) -> float:
    tier = answers.get('tier_reached', 1)
    tier_base = {1: 0.45, 2: 0.70, 3: 0.92}
    return tier_base.get(tier, 0.60)


def compute_lifestyle_modifier(answers: Dict) -> float:
    """Small additive modifier based on lifestyle signals."""
    modifier = 0.0
    # These keys come from the questionnaire IDs
    smoking = answers.get('Smoking', answers.get('SMOKING', 0))
    if smoking in (1, 2, 'Yes', 'yes', 'current', 'past'):
        modifier += 0.03
    return modifier


# ---------------------------------------------------------------------------
# HEART
# ---------------------------------------------------------------------------
def infer_heart_features(answers: Dict[str, Any]) -> Dict[str, Any]:
    """
    Frontend sends:
      Age (int), Heart_Rate (int), Diabetes (0/1), Family_History (0/1),
      Smoking (0/1), Alcohol_Consumption (float), Exercise_Hours_Per_Week (float),
      Diet ('Healthy'|'Average'|'Unhealthy')
    Pipeline expects column names WITH SPACES.
    """
    return {
        'features': {
            'Age': float(answers.get('Age', 50)),
            'Heart Rate': float(answers.get('Heart_Rate', 72)),
            'Diabetes': int(answers.get('Diabetes', 0)),
            'Family History': int(answers.get('Family_History', 0)),
            'Smoking': int(answers.get('Smoking', 0)),
            'Alcohol Consumption': float(answers.get('Alcohol_Consumption', 0)),
            'Exercise Hours Per Week': float(answers.get('Exercise_Hours_Per_Week', 2)),
            'Diet': str(answers.get('Diet', 'Average')).capitalize(),
        },
        'lifestyle_risk_modifier': compute_lifestyle_modifier(answers),
        'tier': answers.get('tier_reached', 2),
        'confidence': compute_confidence_score(answers)
    }


# ---------------------------------------------------------------------------
# STROKE
# ---------------------------------------------------------------------------
def infer_stroke_features(answers: Dict[str, Any]) -> Dict[str, Any]:
    """
    Frontend sends:
      age (int), gender ('Male'|'Female'), hypertension (0/1),
      heart_disease (0/1), ever_married ('Yes'|'No'),
      work_type (str), Residence_type ('Urban'|'Rural'),
      avg_glucose_level (float), bmi (float),
      smoking_status ('never smoked'|'formerly smoked'|'smokes'|'Unknown')
    Pipeline expects exactly these column names (lowercase + Residence_type).
    """
    return {
        'features': {
            'gender': str(answers.get('gender', 'Female')).capitalize(),
            'age': float(answers.get('age', 50)),
            'hypertension': int(answers.get('hypertension', 0)),
            'heart_disease': int(answers.get('heart_disease', 0)),
            'ever_married': str(answers.get('ever_married', 'No')).capitalize(),
            'work_type': str(answers.get('work_type', 'Private')),
            'Residence_type': str(answers.get('Residence_type', 'Urban')),
            'avg_glucose_level': float(answers.get('avg_glucose_level', 100)),
            'bmi': float(answers.get('bmi', 25)),
            'smoking_status': str(answers.get('smoking_status', 'never smoked')),
        },
        'lifestyle_risk_modifier': compute_lifestyle_modifier(answers),
        'tier': answers.get('tier_reached', 2),
        'confidence': compute_confidence_score(answers)
    }


# ---------------------------------------------------------------------------
# DIABETES
# ---------------------------------------------------------------------------
def infer_diabetes_features(answers: Dict[str, Any]) -> Dict[str, Any]:
    """
    Frontend sends:
      Age (int), BMI (float), Pregnancies (int), Glucose (float),
      BloodPressure (float), SkinThickness (float), Insulin (float),
      DiabetesPedigreeFunction (float)
    Pipeline expects exactly these column names.
    """
    return {
        'features': {
            'Pregnancies': int(answers.get('Pregnancies', 0)),
            'Glucose': float(answers.get('Glucose', 100)),
            'BloodPressure': float(answers.get('BloodPressure', 80)),
            'SkinThickness': float(answers.get('SkinThickness', 20)),
            'Insulin': float(answers.get('Insulin', 80)),
            'BMI': float(answers.get('BMI', 25)),
            'DiabetesPedigreeFunction': float(answers.get('DiabetesPedigreeFunction', 0.5)),
            'Age': int(answers.get('Age', 45)),
        },
        'lifestyle_risk_modifier': compute_lifestyle_modifier(answers),
        'tier': answers.get('tier_reached', 2),
        'confidence': compute_confidence_score(answers)
    }


# ---------------------------------------------------------------------------
# LUNG CANCER
# ---------------------------------------------------------------------------
def infer_lung_features(answers: Dict[str, Any]) -> Dict[str, Any]:
    """
    Frontend sends (values 1=No, 2=Yes for binary fields):
      AGE (int), GENDER ('M'|'F'), SMOKING (1/2), ALCOHOL_CONSUMING (1/2),
      YELLOW_FINGERS (1/2), ANXIETY (1/2), PEER_PRESSURE (1/2),
      CHRONIC_DISEASE (1/2), FATIGUE (1/2), ALLERGY (1/2),
      WHEEZING (1/2), COUGHING (1/2), SHORTNESS_OF_BREATH (1/2),
      SWALLOWING_DIFFICULTY (1/2), CHEST_PAIN (1/2)

    Pipeline CSV columns have SPACES (e.g. 'CHRONIC DISEASE', 'FATIGUE ').
    After strip() in pipeline they become 'CHRONIC DISEASE', 'FATIGUE'.
    We map underscore → space here.
    """
    def qs(key, default=1):
        return int(answers.get(key, default))

    return {
        'features': {
            'GENDER': str(answers.get('GENDER', 'M')),
            'AGE': int(answers.get('AGE', 50)),
            'SMOKING': qs('SMOKING'),
            'YELLOW_FINGERS': qs('YELLOW_FINGERS'),
            'ANXIETY': qs('ANXIETY'),
            'PEER_PRESSURE': qs('PEER_PRESSURE'),
            'CHRONIC DISEASE': qs('CHRONIC_DISEASE'),
            'FATIGUE': qs('FATIGUE'),
            'ALLERGY': qs('ALLERGY'),
            'WHEEZING': qs('WHEEZING'),
            'ALCOHOL CONSUMING': qs('ALCOHOL_CONSUMING'),
            'COUGHING': qs('COUGHING'),
            'SHORTNESS OF BREATH': qs('SHORTNESS_OF_BREATH'),
            'SWALLOWING DIFFICULTY': qs('SWALLOWING_DIFFICULTY'),
            'CHEST PAIN': qs('CHEST_PAIN'),
        },
        'lifestyle_risk_modifier': compute_lifestyle_modifier(answers),
        'tier': answers.get('tier_reached', 2),
        'confidence': compute_confidence_score(answers)
    }
