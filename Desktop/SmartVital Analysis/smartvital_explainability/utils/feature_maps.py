# utils/feature_maps.py
# SmartVital — Plain language feature label maps for all 4 disease models
# Keys = exact column names from training CSVs
# Values = plain English labels shown in UI

HEART_FEATURES = {
    "Age": "Your Age",
    "Sex": "Biological Sex",
    "ChestPainType": "Type of Chest Pain",
    "RestingBP": "Resting Blood Pressure",
    "Cholesterol": "Cholesterol Level",
    "FastingBS": "Fasting Blood Sugar > 120",
    "RestingECG": "Resting ECG Result",
    "MaxHR": "Max Heart Rate Achieved",
    "ExerciseAngina": "Chest Pain During Exercise",
    "Oldpeak": "ST Depression (ECG)",
    "ST_Slope": "ST Segment Slope",
}

HEART_TARGET = "HeartDisease"

HEART_CATEGORICAL = ["Sex", "ChestPainType", "RestingECG", "ExerciseAngina", "ST_Slope"]

# -----------------------------------------------------------------------------

STROKE_FEATURES = {
    "gender": "Gender",
    "age": "Your Age",
    "hypertension": "High Blood Pressure History",
    "heart_disease": "Heart Disease History",
    "ever_married": "Marital Status",
    "work_type": "Type of Work",
    "residence_type": "Residence Type",
    "avg_glucose_level": "Average Blood Glucose Level",
    "bmi": "Body Mass Index (BMI)",
    "smoking_status": "Smoking History",
}

STROKE_TARGET = "stroke"
STROKE_DROP = ["id"]  # drop before training/explaining

STROKE_CATEGORICAL = [
    "gender", "ever_married", "work_type", "residence_type", "smoking_status"
]

# -----------------------------------------------------------------------------

LUNG_FEATURES = {
    "GENDER": "Gender",
    "AGE": "Your Age",
    "SMOKING": "Smoking",
    "YELLOW_FINGERS": "Yellow Fingers or Nails",
    "ANXIETY": "Anxiety",
    "PEER_PRESSURE": "Peer Pressure to Smoke",
    "CHRONIC DISEASE": "Chronic Disease History",
    "FATIGUE ": "Unusual Fatigue",
    "ALLERGY ": "Known Allergies",
    "WHEEZING": "Wheezing When Breathing",
    "ALCOHOL CONSUMING": "Alcohol Consumption",
    "COUGHING": "Persistent Cough",
    "SHORTNESS OF BREATH": "Shortness of Breath",
    "SWALLOWING DIFFICULTY": "Difficulty Swallowing",
    "CHEST PAIN": "Chest Pain",
}

LUNG_TARGET = "LUNG_CANCER"  # values: YES / NO -> encode to 1/0

LUNG_CATEGORICAL = ["GENDER"]

# -----------------------------------------------------------------------------

DIABETES_FEATURES = {
    "Pregnancies": "Number of Pregnancies",
    "Glucose": "Blood Glucose Level",
    "BloodPressure": "Blood Pressure",
    "SkinThickness": "Skin Fold Thickness",
    "Insulin": "Insulin Level",
    "BMI": "Body Mass Index (BMI)",
    "DiabetesPedigreeFunction": "Family Diabetes History Score",
    "Age": "Your Age",
}

DIABETES_TARGET = "Outcome"

DIABETES_CATEGORICAL = []  # all continuous


# -----------------------------------------------------------------------------
# Helper: get plain label for a raw feature name (falls back to raw name)

def get_plain_label(feature_name: str, feature_map: dict) -> str:
    return feature_map.get(feature_name, feature_name.replace("_", " ").title())
