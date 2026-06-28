import streamlit as st
import pandas as pd
import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from src.preprocessing.data_pipeline import StrokeDataPipeline
from src.ai_assistant.engine import HealthAssistantEngine
from components.explainability_ui import render_explainability
import joblib

st.set_page_config(page_title="Stroke Risk", page_icon="🧠", layout="wide")

st.title("🧠 Stroke Risk Prediction")
st.write("Enter your physiological parameters below to evaluate your cerebrovascular risk.")

@st.cache_resource
def load_resources():
    pipe = StrokeDataPipeline(dataset_path='datasets/stroke.csv', model_dir='models/stroke/')
    pipe.load_artifacts('stroke')
    model_path = 'models/stroke/stroke_best_ml_model.pkl'
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

with st.form("stroke_form"):
    col1, col2, col3 = st.columns(3)
    
    with col1:
        age = st.number_input("Age", min_value=1, max_value=120, value=65)
        gender = st.selectbox("Gender", ['Male', 'Female'])
        hypertension = st.selectbox("Hypertension", [0, 1])
        
    with col2:
        heart_disease = st.selectbox("Heart Disease", [0, 1])
        ever_married = st.selectbox("Ever Married", ['Yes', 'No'])
        work_type = st.selectbox("Work Type", ['Private', 'Self-employed', 'Govt_job', 'children', 'Never_worked'])
        
    with col3:
        residence_type = st.selectbox("Residence Type", ['Urban', 'Rural'])
        avg_glucose_level = st.number_input("Avg Glucose Level", min_value=50.0, max_value=300.0, value=100.0)
        bmi = st.number_input("BMI", min_value=10.0, max_value=80.0, value=25.0)
        smoking_status = st.selectbox("Smoking Status", ['formerly smoked', 'never smoked', 'smokes', 'Unknown'])
        
    submitted = st.form_submit_button("Analyze Risk", use_container_width=True)

if submitted:
    with st.spinner("Analyzing data..."):
        input_data = pd.DataFrame([{
            'gender': gender, 'age': age, 'hypertension': hypertension, 'heart_disease': heart_disease,
            'ever_married': ever_married, 'work_type': work_type, 'residence_type': residence_type,
            'avg_glucose_level': avg_glucose_level, 'bmi': bmi, 'smoking_status': smoking_status
        }])
        
        processed_data = pipe.process_data(input_data, training=False)
        prob = model.predict_proba(processed_data)[0][1]
        
        st.markdown("---")
        st.subheader("Risk Score")
        color = "green" if prob < 0.3 else "orange" if prob < 0.7 else "red"
        st.markdown(f"<div style='text-align: center; padding: 20px; border-radius: 10px; border: 2px solid {color};'><h1 style='color: {color}; margin: 0; font-size: 3rem;'>{prob:.1%}</h1></div>", unsafe_allow_html=True)
        st.info(engine.analyze_risk("Stroke", prob))
        st.success(engine.generate_preventive_actions("Stroke"))
        
        prediction = int(prob >= 0.5)
        render_explainability("stroke", model, X, processed_data, prediction, prob)
