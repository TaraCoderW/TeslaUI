from typing import Dict, List, Any
from .scenarios import ScenarioApplier
from src.preprocessing.data_pipeline import HeartDataPipeline, StrokeDataPipeline, DiabetesDataPipeline, LungCancerDataPipeline
import joblib
import pandas as pd

class Simulator:
    def __init__(self):
        # Load models
        self.models = {
            "Heart Disease": ("models/heart/heart_best_ml_model.pkl", HeartDataPipeline),
            "Stroke": ("models/stroke/stroke_best_ml_model.pkl", StrokeDataPipeline),
            "Diabetes": ("models/diabetes/diabetes_best_ml_model.pkl", DiabetesDataPipeline),
            "Lung Cancer": ("models/lung/lung_best_ml_model.pkl", LungCancerDataPipeline)
        }
        self.loaded_models = {}
        for d, (path, pipe_class) in self.models.items():
            try:
                self.loaded_models[d] = (joblib.load(path), pipe_class)
            except:
                self.loaded_models[d] = None

    def run_simulation(self, baseline: Dict[str, Any], scenarios: List[str]) -> Dict[str, float]:
        """Applies scenarios and runs inference, returning the new risks."""
        sim_profile = baseline.copy()
        
        for scenario in scenarios:
            sim_profile = ScenarioApplier.apply(scenario, sim_profile)
            
        new_risks = {}
        for d, tup in self.loaded_models.items():
            if not tup:
                continue
            model, pipe_class = tup
            
            # Reconstruct the specific request payload for the pipeline
            try:
                df = pd.DataFrame([sim_profile])
                pipe = pipe_class()
                pipe.fit(df) # Need fit_transform for preprocessing
                X = pipe.transform(df)
                
                prob = model.predict_proba(X)[0][1]
                new_risks[d] = float(prob)
            except Exception as e:
                # If fields are missing for a specific model, skip or default
                pass
                
        return new_risks
