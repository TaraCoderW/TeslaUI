import sys
import os

sys.path.append(os.getcwd())
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def mock_get_current_user():
    return {"id": "123", "role": "patient", "full_name": "Test User"}

from backend.app.auth.dependencies import get_current_user
app.dependency_overrides[get_current_user] = mock_get_current_user

# Disable DB insertion for test by mocking get_db
def mock_get_db():
    class MockSession:
        def add(self, *args, **kwargs): pass
        def commit(self): pass
        def query(self, *args, **kwargs): 
            class MockQuery:
                def filter(self, *args, **kwargs): return self
                def order_by(self, *args, **kwargs): return self
                def first(self, *args, **kwargs): return None
            return MockQuery()
    yield MockSession()

from src.api.database import get_db
app.dependency_overrides[get_db] = mock_get_db

# We also need to mock predictions_collection insertion, but we can't easily do async patch without pytest-asyncio. 
# We'll just run the script with asyncio
import asyncio
from unittest.mock import AsyncMock
from backend.app.database import predictions_collection

async def run_tests():
    predictions_collection.insert_one = AsyncMock(return_value=None)
    
    print("Testing Heart Endpoint...")
    res = client.post("/predict/heart", json={
        "Age": 55,
        "Heart Rate": 72,
        "Diabetes": 0,
        "Family History": 0,
        "Smoking": 0,
        "Alcohol Consumption": 2,
        "Exercise Hours Per Week": 3.5,
        "Diet": "Healthy"
    })
    print(res.status_code, res.json())
    
    print("Testing Diabetes Endpoint...")
    res = client.post("/predict/diabetes", json={
        "Pregnancies": 1,
        "Glucose": 90,
        "BloodPressure": 80,
        "SkinThickness": 20,
        "Insulin": 80,
        "BMI": 25,
        "DiabetesPedigreeFunction": 0.5,
        "Age": 45
    })
    print(res.status_code, res.json())

    print("Testing Stroke Endpoint...")
    res = client.post("/predict/stroke", json={
        "gender": "Male",
        "age": 45,
        "hypertension": 0,
        "heart_disease": 0,
        "ever_married": "Yes",
        "work_type": "Private",
        "Residence_type": "Urban",
        "avg_glucose_level": 100,
        "bmi": 25,
        "smoking_status": "never smoked"
    })
    print(res.status_code, res.json())

    print("Testing Lung Endpoint...")
    res = client.post("/predict/lung", json={
        "GENDER": "M",
        "AGE": 45,
        "SMOKING": 1,
        "YELLOW_FINGERS": 1,
        "ANXIETY": 1,
        "PEER_PRESSURE": 1,
        "CHRONIC_DISEASE": 1,
        "FATIGUE": 1,
        "ALLERGY": 1,
        "WHEEZING": 1,
        "ALCOHOL_CONSUMING": 1,
        "COUGHING": 1,
        "SHORTNESS_OF_BREATH": 1,
        "SWALLOWING_DIFFICULTY": 1,
        "CHEST_PAIN": 1
    })
    print(res.status_code, res.json())

asyncio.run(run_tests())
