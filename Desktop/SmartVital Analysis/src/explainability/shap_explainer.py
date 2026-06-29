import numpy as np
import pandas as pd
import shap
from typing import Literal

from src.utils.feature_maps import (
    HEART_FEATURES, STROKE_FEATURES, LUNG_FEATURES, DIABETES_FEATURES,
    HEART_CATEGORICAL, STROKE_CATEGORICAL, LUNG_CATEGORICAL, DIABETES_CATEGORICAL,
    HEART_TARGET, STROKE_TARGET, LUNG_TARGET, DIABETES_TARGET,
    STROKE_DROP, get_plain_label
)

DISEASE_CONFIG = {
    "heart": {
        "feature_map": HEART_FEATURES,
        "label": "Heart Disease",
    },
    "stroke": {
        "feature_map": STROKE_FEATURES,
        "label": "Stroke Risk",
    },
    "lung": {
        "feature_map": LUNG_FEATURES,
        "label": "Lung Cancer",
    },
    "diabetes": {
        "feature_map": DIABETES_FEATURES,
        "label": "Diabetes",
    },
}

class SmartVitalSHAP:
    """
    SHAP explainability wrapper for SmartVital tree-based sklearn models.
    Operates on preprocessed data directly.
    """
    def __init__(self, disease: Literal["heart", "stroke", "lung", "diabetes"]):
        if disease not in DISEASE_CONFIG:
            raise ValueError(f"disease must be one of {list(DISEASE_CONFIG.keys())}")
        self.disease = disease
        self.config = DISEASE_CONFIG[disease]
        self.feature_map = self.config["feature_map"]

    def _build_explainer(self, model, X_background: np.ndarray):
        """Build shap.TreeExplainer or fallback to KernelExplainer."""
        try:
            return shap.TreeExplainer(
                model,
                data=X_background,
                feature_perturbation="interventional",
            )
        except Exception:
            predict_fn = getattr(model, "predict_proba", model.predict)
            return shap.KernelExplainer(predict_fn, X_background)

    def get_shap_values(
        self,
        model,
        X_background: pd.DataFrame,
        input_processed: pd.DataFrame,
    ) -> tuple:
        """
        Parameters
        ----------
        model        : loaded sklearn model (.pkl)
        X_background : preprocessed training DataFrame (output of pipe.prepare_training_data)
        input_processed: preprocessed user input DataFrame (output of pipe.process_data)
        """
        X_bg = X_background.values
        X_in = input_processed.values
        feature_names = list(X_background.columns)

        if X_bg.shape[0] > 200:
            idx = np.random.choice(X_bg.shape[0], 200, replace=False)
            X_bg = X_bg[idx]

        explainer = self._build_explainer(model, X_bg)
        raw = explainer.shap_values(X_in)

        if isinstance(raw, list):
            shap_vals = raw[1][0]
        else:
            if len(raw.shape) == 3:
                # Shape: (samples, features, classes). We want class 1 for sample 0.
                shap_vals = raw[0, :, 1]
            else:
                # Shape: (samples, features). We want sample 0.
                shap_vals = raw[0]

        return shap_vals, feature_names, X_in[0]

    def get_top_features(
        self,
        shap_values: np.ndarray,
        feature_names: list,
        top_n: int = 5,
    ) -> list:
        """Returns list of dicts sorted by absolute SHAP value."""
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

    def generate_narrative(
        self,
        top_features: list,
        risk_level: str,
        prediction_proba: float,
    ) -> str:
        """Returns a plain-English markdown string summarising the prediction."""
        disease = self.config["label"]
        top1 = top_features[0] if len(top_features) > 0 else None
        top2 = top_features[1] if len(top_features) > 1 else None
        top3 = top_features[2] if len(top_features) > 2 else None

        intro = (
            f"Based on your responses, SmartVital estimates your **{disease}** risk as "
            f"**{risk_level}** (confidence: {prediction_proba:.0%}).\n"
        )

        factors = ""
        if top1:
            factors += (
                f"\n\nThe most significant factor driving this result is your **{top1['feature']}**, "
                f"which **{top1['direction']}**."
            )
        if top2:
            factors += (
                f" Additionally, your **{top2['feature']}** noticeably **{top2['direction']}** the score."
            )
        if top3:
            factors += (
                f" Another contributing factor is your **{top3['feature']}** (**{top3['direction']}**)."
            )

        advice_map = {
            "LOW": (
                "[Low Risk] Your current profile shows low risk markers. "
                "Maintaining a healthy lifestyle will help keep it that way."
            ),
            "MODERATE": (
                "[Moderate Risk] Some risk factors are present. Consider discussing these results "
                "with your doctor at your next visit."
            ),
            "HIGH": (
                "[High Risk] Several significant risk factors were detected. "
                "We strongly recommend consulting a healthcare professional soon."
            ),
        }
        advice = "\n\n" + advice_map.get(risk_level, "")

        return intro + factors + advice
