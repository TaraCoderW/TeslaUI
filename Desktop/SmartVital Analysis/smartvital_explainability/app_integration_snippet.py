# ============================================================
# SmartVital — Explainability Integration Snippet
# Drop this into your existing app.py AFTER your prediction block
# ============================================================
#
# FOLDER STRUCTURE REQUIRED:
# smartvital/
# ├── app.py
# ├── models/
# │   ├── heart_model.pkl
# │   ├── stroke_model.pkl
# │   ├── diabetes_model.pkl
# │   └── lungcancer_model.pkl
# ├── explainability/
# │   ├── __init__.py          (empty file)
# │   ├── shap_explainer.py
# │   └── lime_explainer.py
# └── utils/
#     ├── __init__.py          (empty file)
#     └── feature_maps.py
#
# INSTALL DEPS FIRST:
#   pip install shap lime plotly
# ============================================================

import pickle
import pandas as pd
import streamlit as st

from explainability.shap_explainer import SmartVitalSHAP
from explainability.lime_explainer import SmartVitalLIME

# -----------------------------------------------------------
# 1. LOAD MODEL + TRAINING DATA (do this once, at the top of app.py)
# -----------------------------------------------------------

@st.cache_resource
def load_model(path: str):
    with open(path, "rb") as f:
        return pickle.load(f)

@st.cache_data
def load_training_data(path: str) -> pd.DataFrame:
    return pd.read_csv(path)


# Example — swap paths to match your file locations:
heart_model   = load_model("models/heart_model.pkl")
stroke_model  = load_model("models/stroke_model.pkl")
diabetes_model= load_model("models/diabetes_model.pkl")
lung_model    = load_model("models/lungcancer_model.pkl")

heart_data    = load_training_data("data/heart.csv")
stroke_data   = load_training_data("data/stroke.csv")
diabetes_data = load_training_data("data/diabetes.csv")
lung_data     = load_training_data("data/survey_lung_cancer.csv")


# -----------------------------------------------------------
# 2. AFTER YOUR PREDICTION BLOCK — paste this section
# -----------------------------------------------------------
# Assume you already have:
#   - `disease`      : str — "heart" | "stroke" | "lung" | "diabetes"
#   - `input_df`     : pd.DataFrame — single row, raw feature values matching training columns
#   - `model`        : loaded sklearn model
#   - `X_background` : training DataFrame
#   - `prediction`   : int (0 or 1)
#   - `proba`        : float (probability of positive class, e.g. 0.78)
# -----------------------------------------------------------

def render_explainability(disease, model, X_background, input_df, prediction, proba):
    """
    Call this function right after st.metric / result card in your app.
    """

    # Determine risk level string
    if proba < 0.35:
        risk_level = "LOW"
        risk_color = "#10B981"
        risk_bg    = "rgba(16,185,129,0.08)"
        risk_border= "rgba(16,185,129,0.3)"
    elif proba < 0.65:
        risk_level = "MODERATE"
        risk_color = "#F59E0B"
        risk_bg    = "rgba(245,158,11,0.08)"
        risk_border= "rgba(245,158,11,0.3)"
    else:
        risk_level = "HIGH"
        risk_color = "#EF4444"
        risk_bg    = "rgba(239,68,68,0.08)"
        risk_border= "rgba(239,68,68,0.3)"

    st.markdown("---")
    st.subheader("🔍 Why this result? — Understanding your risk factors")

    # -----------------------------------------------------------
    # TAB 1: SHAP | TAB 2: LIME
    # -----------------------------------------------------------
    tab1, tab2 = st.tabs(["📊 Feature Impact (SHAP)", "🧠 Decision Reasoning (LIME)"])

    with tab1:
        try:
            shap_module = SmartVitalSHAP(disease=disease)
            fig, top_features = shap_module.explain(
                model=model,
                X_background=X_background,
                input_df=input_df,
                top_n=5,
            )
            st.plotly_chart(fig, use_container_width=True)

            st.info(
                "The chart above shows which factors pushed your risk score **up** (🔴 red) "
                "or **down** (🟢 green). Longer bars = stronger influence on this prediction."
            )

            # Plain language narrative
            narrative = shap_module.generate_narrative(top_features, risk_level, proba)
            st.markdown(
                f"""
                <div style="
                    background: {risk_bg};
                    border: 1px solid {risk_border};
                    border-radius: 12px;
                    padding: 16px 20px;
                    margin-top: 12px;
                ">
                    <p style="color:#F9FAFB; font-size:14px; line-height:1.7; margin:0;">
                        {narrative.replace(chr(10), '<br>')}
                    </p>
                </div>
                """,
                unsafe_allow_html=True,
            )

        except Exception as e:
            st.warning(f"Feature impact visualization unavailable for this prediction. ({e})")

    with tab2:
        try:
            lime_module = SmartVitalLIME(disease=disease)
            lime_module.render(
                model=model,
                X_background=X_background,
                input_df=input_df,
                num_features=6,
            )
            st.warning(
                "LIME explains this specific prediction by testing small variations of "
                "your inputs. It shows the local rules the model used for **your case** specifically."
            )
        except Exception as e:
            st.warning(f"Decision reasoning unavailable for this prediction. ({e})")

    # -----------------------------------------------------------
    # WHAT-IF SIMULATOR
    # -----------------------------------------------------------
    st.markdown("---")
    with st.expander("🔄 What-If Simulator — See how changes affect your risk score"):
        st.write("Adjust the factors below to see how your risk score changes in real time.")

        try:
            shap_module = SmartVitalSHAP(disease=disease)
            _, top_features = shap_module.explain(model, X_background, input_df, top_n=3)

            # Only simulate on top risk-increasing features
            risk_features = [f for f in top_features if f["direction"] == "increases risk"][:3]

            if not risk_features:
                st.info("No modifiable risk factors found for simulation.")
            else:
                shap_module_inner = SmartVitalSHAP(disease=disease)
                X_in_processed = shap_module_inner.preprocess(input_df)
                modified = X_in_processed.copy()

                cols = st.columns(len(risk_features))
                for i, feat in enumerate(risk_features):
                    raw = feat["raw_feature"]
                    if raw not in modified.columns:
                        continue
                    current_val = float(modified[raw].iloc[0])
                    with cols[i]:
                        new_val = st.slider(
                            label=feat["feature"],
                            min_value=float(modified[raw].min()) if False else current_val * 0.5,
                            max_value=current_val * 1.5,
                            value=current_val,
                            key=f"whatif_{disease}_{raw}",
                        )
                        modified[raw] = new_val

                try:
                    new_proba = float(model.predict_proba(modified.values)[0][1])
                    delta = new_proba - proba
                    st.metric(
                        label="Updated Risk Score",
                        value=f"{new_proba:.1%}",
                        delta=f"{delta:+.1%}",
                        delta_color="inverse",
                    )
                except Exception:
                    st.info("Could not compute updated risk score for these values.")

        except Exception as e:
            st.info(f"What-If Simulator unavailable. ({e})")

    # Bottom disclaimer
    st.caption(
        "⚕️ SmartVital predictions are based on statistical models trained on clinical datasets. "
        "They do not constitute medical advice. Consult a qualified healthcare professional for diagnosis."
    )


# -----------------------------------------------------------
# 3. EXAMPLE CALL — replace with your actual variables
# -----------------------------------------------------------

# Minimal working example for Heart Disease:
#
# input_df = pd.DataFrame([{
#     "Age": 54, "Sex": "M", "ChestPainType": "ATA",
#     "RestingBP": 150, "Cholesterol": 195, "FastingBS": 0,
#     "RestingECG": "Normal", "MaxHR": 122, "ExerciseAngina": "N",
#     "Oldpeak": 0.0, "ST_Slope": "Up", "HeartDisease": 0   # target col ok, gets dropped
# }])
#
# proba = float(heart_model.predict_proba(
#     SmartVitalSHAP("heart").preprocess(input_df).values
# )[0][1])
# prediction = int(proba >= 0.5)
#
# render_explainability(
#     disease="heart",
#     model=heart_model,
#     X_background=heart_data,
#     input_df=input_df,
#     prediction=prediction,
#     proba=proba,
# )
