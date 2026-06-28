import streamlit as st
import pandas as pd
import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from src.preprocessing.data_pipeline import DiabetesDataPipeline
from src.ai_assistant.engine import HealthAssistantEngine
from components.explainability_ui import render_explainability
import joblib

st.set_page_config(page_title="Diabetes Risk", page_icon="🩸", layout="wide")

st.title("🩸 Diabetes Risk Prediction")
st.write("Enter your physiological parameters below to evaluate your risk for Diabetes.")

@st.cache_resource
def load_resources():
    pipe = DiabetesDataPipeline(dataset_path='datasets/diabetes.csv', model_dir='models/diabetes/')
    pipe.load_artifacts('diabetes')
    model_path = 'models/diabetes/diabetes_best_ml_model.pkl'
    if not os.path.exists(model_path):
        return None, None, None
        
    model = joblib.load(model_path)
    X, _ = pipe.prepare_training_data()
    engine = HealthAssistantEngine()
    
    return pipe, model, X, engine

pipe, model, X, engine = load_resources()

if not pipe:
    st.error("Models not found.")
    st.stop()

with st.form("diabetes_form"):
    col1, col2, col3 = st.columns(3)
    
    with col1:
        pregnancies = st.number_input("Pregnancies", min_value=0, max_value=20, value=0)
        glucose = st.number_input("Glucose", min_value=0, max_value=300, value=100)
        blood_pressure = st.number_input("Blood Pressure", min_value=0, max_value=200, value=70)
        
    with col2:
        skin_thickness = st.number_input("Skin Thickness", min_value=0, max_value=100, value=20)
        insulin = st.number_input("Insulin", min_value=0, max_value=900, value=79)
        bmi = st.number_input("BMI", min_value=0.0, max_value=80.0, value=25.0)
        
    with col3:
        dpf = st.number_input("Diabetes Pedigree Function", min_value=0.0, max_value=3.0, value=0.5, step=0.01)
        age = st.number_input("Age", min_value=1, max_value=120, value=35)
        
    submitted = st.form_submit_button("Analyze Risk", use_container_width=True)

if submitted:
    with st.spinner("Analyzing data..."):
        input_data = pd.DataFrame([{
            'Pregnancies': pregnancies, 'Glucose': glucose, 'BloodPressure': blood_pressure,
            'SkinThickness': skin_thickness, 'Insulin': insulin, 'BMI': bmi,
            'DiabetesPedigreeFunction': dpf, 'Age': age
        }])
        
        processed_data = pipe.process_data(input_data, training=False)
        prob = model.predict_proba(processed_data)[0][1]
        
        st.markdown("---")
        st.subheader("Risk Score")
        color = "green" if prob < 0.3 else "orange" if prob < 0.7 else "red"
        st.markdown(f"<div style='text-align: center; padding: 20px; border-radius: 10px; border: 2px solid {color};'><h1 style='color: {color}; margin: 0; font-size: 3rem;'>{prob:.1%}</h1></div>", unsafe_allow_html=True)
        st.info(engine.analyze_risk("Diabetes", prob))
        st.success(engine.generate_preventive_actions("Diabetes"))
        
        prediction = int(prob >= 0.5)
        render_explainability("diabetes", model, X, processed_data, prediction, prob)
