# explainability/shap_explainer.py
# SmartVital — SHAP Explainability Module
# Stack: scikit-learn tree-based models (.pkl) + shap.TreeExplainer + plotly
#
# Usage in app.py:
#   from explainability.shap_explainer import SmartVitalSHAP
#   shap_module = SmartVitalSHAP(disease="heart")
#   fig, top_features = shap_module.explain(model, X_background, input_df)
#   st.plotly_chart(fig, use_container_width=True)

import numpy as np
import pandas as pd
import shap
import plotly.graph_objects as go
import streamlit as st
from typing import Literal

from utils.feature_maps import (
    HEART_FEATURES, STROKE_FEATURES, LUNG_FEATURES, DIABETES_FEATURES,
    HEART_CATEGORICAL, STROKE_CATEGORICAL, LUNG_CATEGORICAL, DIABETES_CATEGORICAL,
    HEART_TARGET, STROKE_TARGET, LUNG_TARGET, DIABETES_TARGET,
    STROKE_DROP, get_plain_label
)

# ---------------------------------------------------------------------------
# Config per disease

DISEASE_CONFIG = {
    "heart": {
        "feature_map": HEART_FEATURES,
        "target": HEART_TARGET,
        "categorical": HEART_CATEGORICAL,
        "drop": [],
        "label": "Heart Disease",
    },
    "stroke": {
        "feature_map": STROKE_FEATURES,
        "target": STROKE_TARGET,
        "categorical": STROKE_CATEGORICAL,
        "drop": STROKE_DROP,
        "label": "Stroke Risk",
    },
    "lung": {
        "feature_map": LUNG_FEATURES,
        "target": LUNG_TARGET,
        "categorical": LUNG_CATEGORICAL,
        "drop": [],
        "label": "Lung Cancer",
    },
    "diabetes": {
        "feature_map": DIABETES_FEATURES,
        "target": DIABETES_TARGET,
        "categorical": DIABETES_CATEGORICAL,
        "drop": [],
        "label": "Diabetes",
    },
}


# ---------------------------------------------------------------------------

class SmartVitalSHAP:
    """
    SHAP explainability wrapper for SmartVital tree-based sklearn models.

    Parameters
    ----------
    disease : str
        One of: "heart", "stroke", "lung", "diabetes"
    """

    def __init__(self, disease: Literal["heart", "stroke", "lung", "diabetes"]):
        if disease not in DISEASE_CONFIG:
            raise ValueError(f"disease must be one of {list(DISEASE_CONFIG.keys())}")
        self.disease = disease
        self.config = DISEASE_CONFIG[disease]
        self.feature_map = self.config["feature_map"]
        self._explainer = None

    # ------------------------------------------------------------------
    # Internal: build or return cached TreeExplainer

    @st.cache_resource(show_spinner=False)
    def _build_explainer(_self, _model, _X_background: np.ndarray):
        """
        Build shap.TreeExplainer.
        _X_background: numpy array of background training samples (100-300 rows recommended).
        Prefixed with _ so Streamlit cache ignores the unhashable args.
        """
        explainer = shap.TreeExplainer(
            _model,
            data=_X_background,
            feature_perturbation="interventional",
        )
        return explainer

    # ------------------------------------------------------------------
    # Public: preprocess DataFrame (encode categoricals consistently)

    def preprocess(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Encode categorical columns using pandas get_dummies or label encoding.
        Call this on BOTH background data and user input before passing to explainer.
        Returns encoded DataFrame.
        """
        df = df.copy()

        # Drop irrelevant columns
        for col in self.config["drop"]:
            if col in df.columns:
                df.drop(columns=[col], inplace=True)

        # Drop target if present
        target = self.config["target"]
        if target in df.columns:
            df.drop(columns=[target], inplace=True)

        # Handle lung cancer label encoding
        if self.disease == "lung":
            if "LUNG_CANCER" in df.columns:
                df["LUNG_CANCER"] = df["LUNG_CANCER"].map({"YES": 1, "NO": 0})
            # Strip whitespace from column names (FATIGUE , ALLERGY )
            df.columns = df.columns.str.strip()

        # Label encode categoricals (simple ordinal — matches sklearn pipelines)
        for col in self.config["categorical"]:
            col_stripped = col.strip()
            if col_stripped in df.columns:
                df[col_stripped] = df[col_stripped].astype("category").cat.codes

        # Fill any NaN (stroke BMI has nulls)
        df = df.fillna(df.median(numeric_only=True))

        return df

    # ------------------------------------------------------------------
    # Public: get SHAP values for a single user input row

    def get_shap_values(
        self,
        model,
        X_background: pd.DataFrame,
        input_df: pd.DataFrame,
    ) -> tuple:
        """
        Parameters
        ----------
        model        : loaded sklearn model (.pkl)
        X_background : raw training DataFrame (will be preprocessed internally)
        input_df     : single-row raw input DataFrame matching training columns

        Returns
        -------
        shap_values  : np.ndarray, shape (n_features,) for the positive class
        feature_names: list of raw feature names after preprocessing
        input_processed: preprocessed input as np.ndarray
        """
        X_bg = self.preprocess(X_background).values
        X_in = self.preprocess(input_df).values

        feature_names = list(self.preprocess(X_background).columns)

        # Use a subsample of background (max 200 rows for speed)
        if X_bg.shape[0] > 200:
            idx = np.random.choice(X_bg.shape[0], 200, replace=False)
            X_bg = X_bg[idx]

        explainer = self._build_explainer(model, X_bg)
        raw = explainer.shap_values(X_in)

        # Handle multi-output (binary classifiers often return list of 2 arrays)
        if isinstance(raw, list):
            shap_vals = raw[1][0]  # positive class, first (only) row
        else:
            shap_vals = raw[0]  # single output, first row

        return shap_vals, feature_names, X_in[0]

    # ------------------------------------------------------------------
    # Public: extract top N features

    def get_top_features(
        self,
        shap_values: np.ndarray,
        feature_names: list,
        top_n: int = 5,
    ) -> list:
        """
        Returns list of dicts sorted by absolute SHAP value (descending).

        Each dict:
        {
            "feature"    : plain language label,
            "raw_feature": column name,
            "shap_value" : float,
            "direction"  : "increases risk" | "decreases risk",
            "magnitude"  : "high" | "medium" | "low",
        }
        """
        abs_vals = np.abs(shap_values)
        top_idx = np.argsort(abs_vals)[::-1][:top_n]

        max_abs = abs_vals.max() if abs_vals.max() > 0 else 1.0
        results = []

        for i in top_idx:
            sv = float(shap_values[i])
            raw = feature_names[i]
            plain = get_plain_label(raw, self.feature_map)
            norm = abs(sv) / max_abs

            if norm >= 0.6:
                magnitude = "high"
            elif norm >= 0.3:
                magnitude = "medium"
            else:
                magnitude = "low"

            results.append({
                "feature": plain,
                "raw_feature": raw,
                "shap_value": sv,
                "direction": "increases risk" if sv > 0 else "decreases risk",
                "magnitude": magnitude,
            })

        return results

    # ------------------------------------------------------------------
    # Public: render plotly bar chart

    def render_chart(self, top_features: list) -> go.Figure:
        """
        Horizontal bar chart — red for risk-increasing, green for risk-decreasing.
        Returns plotly Figure (use st.plotly_chart to display).
        """
        labels = [f["feature"] for f in top_features]
        values = [f["shap_value"] for f in top_features]
        colors = ["#EF4444" if v > 0 else "#10B981" for v in values]

        fig = go.Figure(go.Bar(
            x=values,
            y=labels,
            orientation="h",
            marker=dict(color=colors, line=dict(width=0)),
            text=[f"{v:+.3f}" for v in values],
            textposition="outside",
            textfont=dict(color="#F9FAFB", size=12),
        ))

        fig.update_layout(
            title=dict(
                text=f"What's Driving Your {self.config['label']} Risk Score",
                font=dict(color="#F9FAFB", size=16, family="Inter"),
            ),
            xaxis=dict(
                title="Impact on Risk Score (SHAP Value)",
                titlefont=dict(color="#9CA3AF"),
                tickfont=dict(color="#9CA3AF"),
                gridcolor="rgba(255,255,255,0.08)",
                zerolinecolor="rgba(255,255,255,0.2)",
            ),
            yaxis=dict(
                tickfont=dict(color="#F9FAFB", size=13),
                gridcolor="rgba(0,0,0,0)",
            ),
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(13,17,23,0.6)",
            font=dict(family="Inter, sans-serif"),
            margin=dict(l=20, r=60, t=60, b=40),
            height=320,
        )

        # Add vertical zero line annotation
        fig.add_vline(x=0, line_width=1, line_color="rgba(255,255,255,0.3)")

        return fig

    # ------------------------------------------------------------------
    # Public: generate plain-language narrative

    def generate_narrative(
        self,
        top_features: list,
        risk_level: str,
        prediction_proba: float,
    ) -> str:
        """
        Returns a plain-English markdown string summarising the prediction.
        risk_level: "LOW" | "MODERATE" | "HIGH"
        """
        disease = self.config["label"]
        top1 = top_features[0] if len(top_features) > 0 else None
        top2 = top_features[1] if len(top_features) > 1 else None

        intro = (
            f"Based on your responses, SmartVital estimates your **{disease}** risk as "
            f"**{risk_level}** (confidence: {prediction_proba:.0%})."
        )

        factors = ""
        if top1:
            factors += (
                f"\n\nThe most significant factor in your result is your **{top1['feature']}**, "
                f"which **{top1['direction']}**."
            )
        if top2:
            factors += (
                f" Your **{top2['feature']}** also **{top2['direction']}** the score."
            )

        advice_map = {
            "LOW": (
                "✅ Your current profile shows low risk markers. "
                "Maintaining a healthy lifestyle will help keep it that way."
            ),
            "MODERATE": (
                "⚠️ Some risk factors are present. Consider discussing these results "
                "with your doctor at your next visit."
            ),
            "HIGH": (
                "🚨 Several significant risk factors were detected. "
                "We strongly recommend consulting a healthcare professional soon."
            ),
        }
        advice = "\n\n" + advice_map.get(risk_level, "")

        return intro + factors + advice

    # ------------------------------------------------------------------
    # Public: full explain pipeline (convenience method)

    def explain(
        self,
        model,
        X_background: pd.DataFrame,
        input_df: pd.DataFrame,
        top_n: int = 5,
    ) -> tuple:
        """
        One-call pipeline: raw data in → (plotly fig, top_features list, narrative str) out.

        Parameters
        ----------
        model        : loaded sklearn model
        X_background : training DataFrame
        input_df     : single-row user input DataFrame
        top_n        : number of top features to show

        Returns
        -------
        fig          : plotly Figure
        top_features : list of dicts
        """
        shap_vals, feat_names, _ = self.get_shap_values(model, X_background, input_df)
        top_features = self.get_top_features(shap_vals, feat_names, top_n)
        fig = self.render_chart(top_features)
        return fig, top_features
