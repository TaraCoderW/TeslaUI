import streamlit as st
import pandas as pd
import numpy as np
import os
import sys

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from src.preprocessing.data_pipeline import HeartDataPipeline
from src.ai_assistant.engine import HealthAssistantEngine
from components.explainability_ui import render_explainability
import joblib

st.set_page_config(page_title="Heart Disease Risk", page_icon="❤️", layout="wide")

st.title("❤️ Heart Disease Risk Prediction")
st.write("Enter your physiological parameters below to evaluate your cardiovascular risk.")

# Load pipeline and models
@st.cache_resource
def load_resources():
    pipe = HeartDataPipeline(dataset_path='datasets/heart.csv', model_dir='models/heart/')
    pipe.load_artifacts('heart')
    # Use best ML model
    model_path = 'models/heart/heart_best_ml_model.pkl'
    if not os.path.exists(model_path):
        return None, None, None
        
    model = joblib.load(model_path)
    
    X, _ = pipe.prepare_training_data()
    engine = HealthAssistantEngine()
    
    return pipe, model, X, engine

pipe, model, X, engine = load_resources()

if not pipe:
    st.error("Models not found. Please run the training pipeline first.")
    st.stop()

# Interactive Form
with st.form("heart_form"):
    col1, col2, col3 = st.columns(3)
    
    with col1:
        age = st.number_input("Age", min_value=1, max_value=120, value=50)
        sex = st.selectbox("Sex", ['M', 'F'])
        chest_pain = st.selectbox("Chest Pain Type", ['ATA', 'NAP', 'ASY', 'TA'])
        resting_bp = st.number_input("Resting BP", min_value=50, max_value=250, value=120)
        
    with col2:
        cholesterol = st.number_input("Cholesterol", min_value=0, max_value=600, value=200)
        fasting_bs = st.selectbox("Fasting Blood Sugar > 120 mg/dl", [0, 1])
        resting_ecg = st.selectbox("Resting ECG", ['Normal', 'ST', 'LVH'])
        max_hr = st.number_input("Max Heart Rate", min_value=50, max_value=220, value=150)
        
    with col3:
        exercise_angina = st.selectbox("Exercise Induced Angina", ['N', 'Y'])
        oldpeak = st.number_input("Oldpeak (ST Depression)", min_value=-5.0, max_value=10.0, value=0.0, step=0.1)
        st_slope = st.selectbox("ST Slope", ['Up', 'Flat', 'Down'])
        
    submitted = st.form_submit_button("Analyze Risk", use_container_width=True)

if submitted:
    with st.spinner("Analyzing physiological data..."):
        # Prepare input df
        input_data = pd.DataFrame([{
            'Age': age, 'Sex': sex, 'ChestPainType': chest_pain, 'RestingBP': resting_bp,
            'Cholesterol': cholesterol, 'FastingBS': fasting_bs, 'RestingECG': resting_ecg,
            'MaxHR': max_hr, 'ExerciseAngina': exercise_angina, 'Oldpeak': oldpeak, 'ST_Slope': st_slope
        }])
        
        # Preprocess
        processed_data = pipe.process_data(input_data, training=False)
        
        # Predict
        prob = model.predict_proba(processed_data)[0][1]
        
        # Display Results
        st.markdown("---")
        
        st.subheader("Risk Score")
        
        # Risk visualization
        if prob < 0.3:
            color = "green"
        elif prob < 0.7:
            color = "orange"
        else:
            color = "red"
            
        st.markdown(f"""
        <div style='text-align: center; padding: 20px; border-radius: 10px; border: 2px solid {color};'>
            <h1 style='color: {color}; margin: 0; font-size: 3rem;'>{prob:.1%}</h1>
        </div>
        """, unsafe_allow_html=True)
        
        st.markdown("### AI Insight")
        insight = engine.analyze_risk("Heart Disease", prob)
        st.info(insight)
        
        st.markdown("### Recommendations")
        st.success(engine.generate_preventive_actions("Heart Disease"))
        
        prediction = int(prob >= 0.5)
        render_explainability("heart", model, X, processed_data, prediction, prob)
