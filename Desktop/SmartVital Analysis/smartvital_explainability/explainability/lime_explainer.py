# explainability/lime_explainer.py
# SmartVital — LIME Explainability Module
# Stack: scikit-learn tree-based models (.pkl) + lime.lime_tabular
#
# Usage in app.py:
#   from explainability.lime_explainer import SmartVitalLIME
#   lime_module = SmartVitalLIME(disease="heart")
#   lime_module.render(model, X_background, input_df)   # renders directly into Streamlit

import numpy as np
import pandas as pd
import streamlit as st
from lime import lime_tabular
from typing import Literal

from utils.feature_maps import (
    HEART_FEATURES, STROKE_FEATURES, LUNG_FEATURES, DIABETES_FEATURES,
    HEART_CATEGORICAL, STROKE_CATEGORICAL, LUNG_CATEGORICAL, DIABETES_CATEGORICAL,
    HEART_TARGET, STROKE_TARGET, LUNG_TARGET, DIABETES_TARGET,
    STROKE_DROP, get_plain_label
)

# ---------------------------------------------------------------------------

DISEASE_CONFIG = {
    "heart": {
        "feature_map": HEART_FEATURES,
        "target": HEART_TARGET,
        "categorical": HEART_CATEGORICAL,
        "drop": [],
        "label": "Heart Disease",
        "class_names": ["No Disease", "Heart Disease"],
    },
    "stroke": {
        "feature_map": STROKE_FEATURES,
        "target": STROKE_TARGET,
        "categorical": STROKE_CATEGORICAL,
        "drop": STROKE_DROP,
        "label": "Stroke Risk",
        "class_names": ["No Stroke", "Stroke"],
    },
    "lung": {
        "feature_map": LUNG_FEATURES,
        "target": LUNG_TARGET,
        "categorical": LUNG_CATEGORICAL,
        "drop": [],
        "label": "Lung Cancer",
        "class_names": ["No Cancer", "Lung Cancer"],
    },
    "diabetes": {
        "feature_map": DIABETES_FEATURES,
        "target": DIABETES_TARGET,
        "categorical": DIABETES_CATEGORICAL,
        "drop": [],
        "label": "Diabetes",
        "class_names": ["No Diabetes", "Diabetes"],
    },
}


# ---------------------------------------------------------------------------

class SmartVitalLIME:
    """
    LIME explainability wrapper for SmartVital tree-based sklearn models.

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

    # ------------------------------------------------------------------
    # Internal: preprocess (mirrors shap_explainer preprocessing)

    def _preprocess(self, df: pd.DataFrame) -> tuple:
        """
        Returns (processed_df, feature_names, categorical_feature_indices)
        """
        df = df.copy()

        for col in self.config["drop"]:
            if col in df.columns:
                df.drop(columns=[col], inplace=True)

        target = self.config["target"]
        if target in df.columns:
            df.drop(columns=[target], inplace=True)

        if self.disease == "lung":
            if "LUNG_CANCER" in df.columns:
                df["LUNG_CANCER"] = df["LUNG_CANCER"].map({"YES": 1, "NO": 0})
            df.columns = df.columns.str.strip()

        # Identify categorical indices BEFORE encoding
        cat_cols_stripped = [c.strip() for c in self.config["categorical"]]
        all_cols = list(df.columns)
        categorical_idx = [
            i for i, c in enumerate(all_cols) if c in cat_cols_stripped
        ]

        for col in cat_cols_stripped:
            if col in df.columns:
                df[col] = df[col].astype("category").cat.codes

        df = df.fillna(df.median(numeric_only=True))

        return df, list(df.columns), categorical_idx

    # ------------------------------------------------------------------
    # Internal: build LIME explainer (cached per disease)

    @st.cache_resource(show_spinner=False)
    def _build_explainer(
        _self,
        _X_background: np.ndarray,
        _feature_names: list,
        _categorical_idx: list,
    ):
        explainer = lime_tabular.LimeTabularExplainer(
            training_data=_X_background,
            feature_names=_feature_names,
            class_names=_self.config["class_names"],
            categorical_features=_categorical_idx,
            mode="classification",
            discretize_continuous=True,
            random_state=42,
        )
        return explainer

    # ------------------------------------------------------------------
    # Internal: humanize LIME condition strings

    def _humanize_condition(self, condition: str, feature_names: list) -> str:
        """
        Converts raw LIME condition string to plain English.
        E.g. "Age > 55.00" → "Your Age is greater than 55"
             "Sex <= 0.50" → "Your Biological Sex is 0 or below"
        """
        result = condition

        # Replace raw feature names with plain labels (longest first to avoid partial matches)
        sorted_features = sorted(feature_names, key=len, reverse=True)
        for raw in sorted_features:
            plain = get_plain_label(raw, self.feature_map)
            result = result.replace(raw, plain)

        # Humanize operators
        replacements = [
            (" > ",  " is greater than "),
            (" >= ", " is at least "),
            (" < ",  " is less than "),
            (" <= ", " is at most "),
            (" = ",  " equals "),
        ]
        for old, new in replacements:
            result = result.replace(old, new)

        # Strip trailing decimals like .00
        import re
        result = re.sub(r'(\d+)\.0+\b', r'\1', result)

        # Prefix with "Your" if not already
        if not result.startswith("Your"):
            result = "Your " + result

        return result

    # ------------------------------------------------------------------
    # Public: get parsed explanation list

    def get_explanation(
        self,
        model,
        X_background: pd.DataFrame,
        input_df: pd.DataFrame,
        num_features: int = 6,
    ) -> list:
        """
        Returns list of dicts:
        {
            "condition"      : raw LIME condition string,
            "plain_condition": humanized plain English string,
            "weight"         : float,
            "direction"      : "risk factor" | "protective factor",
            "abs_weight"     : float,
        }
        Sorted by abs_weight descending.
        """
        X_bg_df, feature_names, cat_idx = self._preprocess(X_background)
        X_in_df, _, _ = self._preprocess(input_df)

        X_bg = X_bg_df.values
        X_in = X_in_df.values[0]

        # Subsample background for speed
        if X_bg.shape[0] > 300:
            idx = np.random.choice(X_bg.shape[0], 300, replace=False)
            X_bg = X_bg[idx]

        explainer = self._build_explainer(X_bg, feature_names, cat_idx)

        exp = explainer.explain_instance(
            data_row=X_in,
            predict_fn=model.predict_proba,
            num_features=num_features,
            labels=(1,),  # explain positive class (disease present)
        )

        raw_list = exp.as_list(label=1)

        results = []
        for condition, weight in raw_list:
            plain = self._humanize_condition(condition, feature_names)
            results.append({
                "condition": condition,
                "plain_condition": plain,
                "weight": float(weight),
                "direction": "risk factor" if weight > 0 else "protective factor",
                "abs_weight": abs(float(weight)),
            })

        results.sort(key=lambda x: x["abs_weight"], reverse=True)
        return results

    # ------------------------------------------------------------------
    # Public: render into Streamlit

    def render(
        self,
        model,
        X_background: pd.DataFrame,
        input_df: pd.DataFrame,
        num_features: int = 6,
    ):
        """
        Full render pipeline — call this directly in app.py.
        Renders a two-column risk factor / protective factor layout into Streamlit.
        """
        try:
            parsed = self.get_explanation(model, X_background, input_df, num_features)
        except Exception as e:
            st.warning(f"Decision reasoning unavailable for this prediction. ({e})")
            return

        risk_factors = [p for p in parsed if p["direction"] == "risk factor"]
        protective_factors = [p for p in parsed if p["direction"] == "protective factor"]

        st.markdown(
            f"#### Why SmartVital flagged these factors for {self.config['label']}",
            unsafe_allow_html=False,
        )

        col1, col2 = st.columns(2)

        with col1:
            st.markdown(
                "<p style='color:#EF4444; font-weight:600; font-size:15px;'>"
                "⚠️ Risk Factors</p>",
                unsafe_allow_html=True,
            )
            if not risk_factors:
                st.markdown(
                    "<p style='color:#9CA3AF; font-size:13px;'>No significant risk "
                    "factors detected.</p>",
                    unsafe_allow_html=True,
                )
            for item in risk_factors:
                weight_pct = min(int(item["abs_weight"] * 500), 100)
                st.markdown(
                    f"""
                    <div style="
                        background: rgba(239,68,68,0.08);
                        border: 1px solid rgba(239,68,68,0.25);
                        border-radius: 10px;
                        padding: 10px 14px;
                        margin-bottom: 8px;
                    ">
                        <p style="color:#F9FAFB; font-size:13px; margin:0 0 6px 0;">
                            {item['plain_condition']}
                        </p>
                        <div style="
                            background: rgba(255,255,255,0.1);
                            border-radius: 4px;
                            height: 4px;
                            width: 100%;
                        ">
                            <div style="
                                background: #EF4444;
                                border-radius: 4px;
                                height: 4px;
                                width: {weight_pct}%;
                            "></div>
                        </div>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )

        with col2:
            st.markdown(
                "<p style='color:#10B981; font-weight:600; font-size:15px;'>"
                "✅ Protective Factors</p>",
                unsafe_allow_html=True,
            )
            if not protective_factors:
                st.markdown(
                    "<p style='color:#9CA3AF; font-size:13px;'>No significant "
                    "protective factors detected.</p>",
                    unsafe_allow_html=True,
                )
            for item in protective_factors:
                weight_pct = min(int(item["abs_weight"] * 500), 100)
                st.markdown(
                    f"""
                    <div style="
                        background: rgba(16,185,129,0.08);
                        border: 1px solid rgba(16,185,129,0.25);
                        border-radius: 10px;
                        padding: 10px 14px;
                        margin-bottom: 8px;
                    ">
                        <p style="color:#F9FAFB; font-size:13px; margin:0 0 6px 0;">
                            {item['plain_condition']}
                        </p>
                        <div style="
                            background: rgba(255,255,255,0.1);
                            border-radius: 4px;
                            height: 4px;
                            width: 100%;
                        ">
                            <div style="
                                background: #10B981;
                                border-radius: 4px;
                                height: 4px;
                                width: {weight_pct}%;
                            "></div>
                        </div>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )

        st.caption(
            "Based on patterns in clinical training data. "
            "LIME explains this specific prediction by testing small variations of your inputs."
        )
