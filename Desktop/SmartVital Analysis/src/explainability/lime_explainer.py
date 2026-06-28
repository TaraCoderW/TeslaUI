import numpy as np
import pandas as pd
from lime import lime_tabular
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
        "class_names": ["No Disease", "Heart Disease"],
    },
    "stroke": {
        "feature_map": STROKE_FEATURES,
        "class_names": ["No Stroke", "Stroke"],
    },
    "lung": {
        "feature_map": LUNG_FEATURES,
        "class_names": ["No Cancer", "Lung Cancer"],
    },
    "diabetes": {
        "feature_map": DIABETES_FEATURES,
        "class_names": ["No Diabetes", "Diabetes"],
    },
}

class SmartVitalLIME:
    """
    LIME explainability wrapper for SmartVital models.
    """
    def __init__(self, disease: Literal["heart", "stroke", "lung", "diabetes"]):
        if disease not in DISEASE_CONFIG:
            raise ValueError(f"disease must be one of {list(DISEASE_CONFIG.keys())}")
        self.disease = disease
        self.config = DISEASE_CONFIG[disease]
        self.feature_map = self.config["feature_map"]

    def get_explanation(
        self,
        model,
        X_background_processed: pd.DataFrame,
        input_processed: pd.DataFrame,
        num_features: int = 5,
    ) -> list:
        """
        Parameters
        ----------
        model : loaded sklearn model
        X_background_processed : processed training dataframe
        input_processed : single-row processed user input DataFrame
        """
        feature_names = list(X_background_processed.columns)
        
        def custom_predict(X_array):
            # Model takes processed numpy array or dataframe and predicts
            return model.predict_proba(X_array)

        # Build explainer on processed background data
        explainer = lime_tabular.LimeTabularExplainer(
            training_data=X_background_processed.values,
            feature_names=feature_names,
            class_names=self.config["class_names"],
            mode="classification"
        )

        exp = explainer.explain_instance(
            data_row=input_processed.values[0],
            predict_fn=custom_predict,
            num_features=num_features
        )

        results = []
        for feature_expr, weight in exp.as_list():
            # Example expr: "Age <= 0.50"
            raw_feature = None
            for fn in feature_names:
                # If feature name is in the expression, map it
                if fn in feature_expr:
                    raw_feature = fn
                    break
            
            plain = get_plain_label(raw_feature, self.feature_map) if raw_feature else feature_expr
            
            # Replace raw name with plain name in the expression
            plain_expr = feature_expr.replace(raw_feature, plain) if raw_feature else feature_expr
            
            results.append({
                "condition": feature_expr,
                "plain_condition": plain_expr,
                "weight": float(weight),
                "direction": "risk factor" if weight > 0 else "protective factor",
                "abs_weight": abs(float(weight))
            })

        return results
