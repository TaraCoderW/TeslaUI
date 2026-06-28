import streamlit as st
import pandas as pd
import numpy as np
import os
import matplotlib.pyplot as plt
import seaborn as sns

st.set_page_config(page_title="Analytics & Research", page_icon="📊", layout="wide")

st.title("📊 Model Analytics & Research Dashboard")
st.write("Review the performance metrics, ROC curves, and training analysis of our prediction models.")

disease = st.selectbox("Select Disease Model", ["Heart Disease", "Stroke", "Diabetes", "Lung Cancer"])

# Map UI names to internal prefixes
prefix_map = {
    "Heart Disease": "heart",
    "Stroke": "stroke",
    "Diabetes": "diabetes",
    "Lung Cancer": "lung"
}
prefix = prefix_map[disease]

metrics_path = f"models/{prefix}/{prefix}_metrics.csv"
cm_path = f"models/{prefix}/{prefix}_cm.png"
dl_curves_path = f"models/{prefix}/{prefix}_dl_curves.png"

col1, col2 = st.columns(2)

with col1:
    st.subheader("Model Performance Comparison")
    if os.path.exists(metrics_path):
        df = pd.read_csv(metrics_path, index_col=0)
        st.dataframe(df.style.highlight_max(axis=0, color='lightgreen'))
        
        # Plot Bar chart
        fig, ax = plt.subplots(figsize=(8, 4))
        df[['Accuracy', 'F1']].plot(kind='bar', ax=ax)
        plt.title('Accuracy & F1 Score by Model')
        plt.ylabel('Score')
        plt.xticks(rotation=45)
        st.pyplot(fig)
    else:
        st.info("Metrics not found. Please train models first.")

with col2:
    st.subheader("Best Model Confusion Matrix")
    if os.path.exists(cm_path):
        st.image(cm_path, use_container_width=True)
    else:
        st.info("Confusion matrix not found.")

st.markdown("---")
st.subheader("Deep Learning Training History")

if os.path.exists(dl_curves_path):
    st.image(dl_curves_path, use_container_width=True)
else:
    st.info("Deep Learning training curves not found. (If TensorFlow is not installed, DL models are skipped).")

st.markdown("---")
st.markdown("""
### Research Notes
The progression from baseline Machine Learning (Logistic Regression) to ensemble methods (Random Forest, XGBoost) demonstrates significant performance gains. 
For production, the best performing ML ensemble model is selected automatically and passed to the Explainability engine (SHAP/LIME).
""")
