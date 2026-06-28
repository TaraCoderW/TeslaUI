import streamlit as st
import pandas as pd
import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from src.preprocessing.data_pipeline import LungCancerDataPipeline
from src.ai_assistant.engine import HealthAssistantEngine
from components.explainability_ui import render_explainability
import joblib

st.set_page_config(page_title="Lung Cancer Risk", page_icon="🫁", layout="wide")

st.title("🫁 Lung Cancer Risk Prediction")
st.write("Enter your physiological parameters below to evaluate your risk.")

@st.cache_resource
def load_resources():
    pipe = LungCancerDataPipeline(dataset_path='datasets/survey lung cancer.csv', model_dir='models/lung/')
    pipe.load_artifacts('lung')
    model_path = 'models/lung/lung_best_ml_model.pkl'
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

with st.form("lung_form"):
    col1, col2, col3 = st.columns(3)
    
    with col1:
        gender = st.selectbox("Gender", ['M', 'F'])
        age = st.number_input("Age", min_value=1, max_value=120, value=65)
        smoking = st.selectbox("Smoking", [1, 2], help="1=No, 2=Yes")
        yellow_fingers = st.selectbox("Yellow Fingers", [1, 2])
        anxiety = st.selectbox("Anxiety", [1, 2])
        
    with col2:
        peer_pressure = st.selectbox("Peer Pressure", [1, 2])
        chronic_disease = st.selectbox("Chronic Disease", [1, 2])
        fatigue = st.selectbox("Fatigue", [1, 2])
        allergy = st.selectbox("Allergy", [1, 2])
        wheezing = st.selectbox("Wheezing", [1, 2])
        
    with col3:
        alcohol = st.selectbox("Alcohol Consuming", [1, 2])
        coughing = st.selectbox("Coughing", [1, 2])
        shortness = st.selectbox("Shortness of Breath", [1, 2])
        swallowing = st.selectbox("Swallowing Difficulty", [1, 2])
        chest_pain = st.selectbox("Chest Pain", [1, 2])
        
    submitted = st.form_submit_button("Analyze Risk", use_container_width=True)

if submitted:
    with st.spinner("Analyzing data..."):
        input_data = pd.DataFrame([{
            'GENDER': gender, 'AGE': age, 'SMOKING': smoking, 'YELLOW_FINGERS': yellow_fingers,
            'ANXIETY': anxiety, 'PEER_PRESSURE': peer_pressure, 'CHRONIC DISEASE': chronic_disease,
            'FATIGUE ': fatigue, 'ALLERGY ': allergy, 'WHEEZING': wheezing,
            'ALCOHOL CONSUMING': alcohol, 'COUGHING': coughing, 'SHORTNESS OF BREATH': shortness,
            'SWALLOWING DIFFICULTY': swallowing, 'CHEST PAIN': chest_pain
        }])
        
        processed_data = pipe.process_data(input_data, training=False)
        prob = model.predict_proba(processed_data)[0][1]
        
        st.markdown("---")
        st.subheader("Risk Score")
        color = "green" if prob < 0.3 else "orange" if prob < 0.7 else "red"
        st.markdown(f"<div style='text-align: center; padding: 20px; border-radius: 10px; border: 2px solid {color};'><h1 style='color: {color}; margin: 0; font-size: 3rem;'>{prob:.1%}</h1></div>", unsafe_allow_html=True)
        st.info(engine.analyze_risk("Lung Cancer", prob))
        st.success(engine.generate_preventive_actions("Lung Cancer"))
        
        prediction = int(prob >= 0.5)
        render_explainability("lung", model, X, processed_data, prediction, prob)
