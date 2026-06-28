import streamlit as st
import pandas as pd
from explainability.shap_explainer import SmartVitalSHAP
from explainability.lime_explainer import SmartVitalLIME

def render_explainability(disease, model, X_background, input_processed, prediction, proba):
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
            shap_vals, feature_names, X_in_single = shap_module.get_shap_values(model, X_background, input_processed)
            top_features = shap_module.get_top_features(shap_vals, feature_names, top_n=5)
            
            import plotly.graph_objects as go
            features_plot = [f['feature'] for f in top_features][::-1]
            shap_vals_plot = [f['shap_value'] for f in top_features][::-1]
            colors = ['#EF4444' if v > 0 else '#10B981' for v in shap_vals_plot]
            
            fig = go.Figure(go.Bar(
                x=shap_vals_plot,
                y=features_plot,
                orientation='h',
                marker_color=colors
            ))
            fig.update_layout(title="SHAP Feature Impact", xaxis_title="Impact on Risk Score", margin=dict(l=0, r=0, t=30, b=0), height=300)
            
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
            explanation = lime_module.get_explanation(
                model=model,
                X_background_processed=X_background,
                input_processed=input_processed,
                num_features=6,
            )
            for exp in explanation:
                icon = "🔴" if exp['direction'] == "risk factor" else "🟢"
                st.write(f"{icon} **{exp['plain_condition']}** (Weight: {exp['weight']:.4f})")
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
            shap_vals, feature_names, _ = shap_module.get_shap_values(model, X_background, input_processed)
            top_features = shap_module.get_top_features(shap_vals, feature_names, top_n=3)

            # Only simulate on top risk-increasing features
            risk_features = [f for f in top_features if f["direction"] == "increases risk"][:3]

            if not risk_features:
                st.info("No modifiable risk factors found for simulation.")
            else:
                modified = input_processed.copy()

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
