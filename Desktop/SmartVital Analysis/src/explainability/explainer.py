try:
    import shap
    import lime
    import lime.lime_tabular
    EXPLAINERS_AVAILABLE = True
except ImportError:
    EXPLAINERS_AVAILABLE = False
import numpy as np
import pandas as pd
import os
import joblib

class ModelExplainer:
    def __init__(self, model_path, train_data, feature_names, class_names=None):
        self.model = joblib.load(model_path)
        self.train_data = train_data
        self.feature_names = feature_names
        self.class_names = class_names if class_names else ['Low Risk', 'High Risk']
        
        if not EXPLAINERS_AVAILABLE:
            return

        # Initialize Explainer
        # TreeExplainer for Tree-based models (RF, XGBoost), otherwise KernelExplainer
        model_type = type(self.model).__name__
        if model_type in ['RandomForestClassifier', 'XGBClassifier', 'LGBMClassifier', 'CatBoostClassifier']:
            self.shap_explainer = shap.TreeExplainer(self.model)
        else:
            # We use an independent masker for KernelExplainer
            masker = shap.maskers.Independent(data=self.train_data)
            self.shap_explainer = shap.KernelExplainer(self.model.predict_proba, self.train_data[:100]) # Sample for speed
            
        # Initialize LIME Explainer
        self.lime_explainer = lime.lime_tabular.LimeTabularExplainer(
            training_data=np.array(self.train_data),
            feature_names=self.feature_names,
            class_names=self.class_names,
            mode='classification'
        )

    def get_shap_features(self, instance, plain_labels, top_n=5):
        if not EXPLAINERS_AVAILABLE:
            return []
            
        shap_values = self.shap_explainer.shap_values(instance)
        if isinstance(shap_values, list):
            shap_values = shap_values[1] # positive class
            
        values = shap_values[0] if len(shap_values.shape) > 1 else shap_values
        
        features = []
        for i, val in enumerate(values):
            raw_name = self.feature_names[i]
            features.append({
                "feature": plain_labels.get(raw_name, raw_name),
                "raw_feature": raw_name,
                "shap_value": float(val),
                "direction": "increases risk" if val > 0 else "decreases risk"
            })
            
        # Sort by absolute magnitude
        features.sort(key=lambda x: abs(x["shap_value"]), reverse=True)
        return features[:top_n]

    def get_lime_conditions(self, instance, plain_labels):
        if not EXPLAINERS_AVAILABLE:
            return []
            
        if isinstance(instance, pd.DataFrame):
            instance = instance.iloc[0].values
            
        exp = self.lime_explainer.explain_instance(
            data_row=instance, 
            predict_fn=self.model.predict_proba
        )
        
        lime_list = exp.as_list()
        
        conditions = []
        for raw_cond, weight in lime_list:
            # Simple humanizer
            cond = raw_cond.replace('>', ' is greater than ').replace('<', ' is less than ').replace('=', ' equals ')
            
            # Replace raw feature names with plain labels
            for raw_name, plain_name in plain_labels.items():
                if raw_name in cond:
                    cond = cond.replace(raw_name, plain_name)
                    break
                    
            conditions.append({
                "condition": f"Your {cond.strip()}",
                "weight": float(weight),
                "direction": "risk factor" if weight > 0 else "protective factor"
            })
            
        return conditions

    @staticmethod
    def generate_risk_narrative(top_shap_features, risk_level, disease_name, prediction_proba):
        if not top_shap_features:
            return "Explainability data unavailable."
            
        f1 = top_shap_features[0]
        narrative = f"Based on your responses, SmartVital estimates your {disease_name} risk as {risk_level} (confidence: {prediction_proba:.0%}).\n\n"
        narrative += f"The most significant factor in your result is your {f1['feature'].lower()}, which {f1['direction']} your risk. "
        
        if len(top_shap_features) > 1:
            f2 = top_shap_features[1]
            narrative += f"Your {f2['feature'].lower()} also {f2['direction'].replace('risk', 'the score')}."
            
        narrative += "\n\n"
        if risk_level == "LOW":
            narrative += "Your current profile shows low risk markers. Maintaining a healthy lifestyle will help keep it that way."
        elif risk_level == "MODERATE":
            narrative += "Some risk factors are present. Consider discussing these results with your doctor at your next visit."
        else:
            narrative += "Several significant risk factors were detected. We strongly recommend consulting a healthcare professional soon."
            
        return narrative

