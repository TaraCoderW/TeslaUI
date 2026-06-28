# SmartVital: Unified IoT Integrated Multi-Disease Early Detection System

SmartVital is a production-ready, research-grade healthcare intelligence system designed to predict the risk of Heart Disease, Stroke, Diabetes, and Lung Cancer using Machine Learning and Deep Learning.

## Features
- **Multi-Disease Prediction**: Evaluates 4 major health conditions based on standard physiological inputs.
- **Explainable AI (XAI)**: Uses SHAP and LIME to explain *why* the model made a specific prediction.
- **AI Health Assistant**: A local inference engine that explains medical parameters, interprets risk levels, and suggests preventive actions.
- **IoT Simulator**: Simulates real-time sensor streams (Heart Rate, SpO2, Temperature, BP) for wearable integration.
- **Modern Dashboard**: Apple-level minimalistic UI built with Streamlit and glassmorphism CSS.
- **Research Analytics**: Compares baseline ML models (Logistic Regression) to Ensemble Methods (XGBoost, Random Forest) and Deep Learning architectures.

## Architecture
```
project_root/
├── datasets/            # Core datasets
├── models/              # Trained ML/DL models & scalers
├── src/
│   ├── preprocessing/   # Data cleaning & feature engineering
│   ├── training/        # ML and DL training scripts
│   ├── explainability/  # SHAP & LIME engines
│   ├── ai_assistant/    # Rule-based insights engine
│   └── utils/           # PDF Generation utilities
├── streamlit_app/       # Main dashboard and pages
└── iot/                 # Hardware simulation
```

## Setup & Installation

1. **Clone the repository**
2. **Create a virtual environment (Optional but recommended)**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```
4. **Train Models (Required)**
   Before running the app, you must train the models locally.
   ```bash
   python src/training/train_all.py
   ```
5. **Run the Dashboard**
   ```bash
   streamlit run streamlit_app/app.py
   ```

## Disclaimer
⚠️ **Educational Purpose Only. Not Medical Advice.** This system is designed as a research prototype and internship showcase. Always consult a healthcare professional for medical diagnosis and treatment.
