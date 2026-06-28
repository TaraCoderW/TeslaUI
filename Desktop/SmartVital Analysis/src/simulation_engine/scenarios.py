from typing import Dict, Any

class ScenarioApplier:
    """Applies hypothetical lifestyle changes to a baseline health profile."""
    
    @staticmethod
    def apply(scenario_id: str, profile: Dict[str, Any]) -> Dict[str, Any]:
        sim = profile.copy()
        
        if scenario_id == "quit_smoking":
            if "smoking_status" in sim:
                sim["smoking_status"] = "never smoked"
            if "SMOKING" in sim:
                sim["SMOKING"] = 1 # 1 = No, 2 = Yes in Lung dataset
                
        elif scenario_id == "lose_5kg":
            if "BMI" in sim and sim["BMI"] > 18:
                sim["BMI"] -= 1.8 # Approx 5kg reduction for avg height
            if "bmi" in sim and sim["bmi"] > 18:
                sim["bmi"] -= 1.8
                
        elif scenario_id == "lose_10kg":
            if "BMI" in sim and sim["BMI"] > 18:
                sim["BMI"] -= 3.6
            if "bmi" in sim and sim["bmi"] > 18:
                sim["bmi"] -= 3.6
                
        elif scenario_id == "healthy_bmi":
            if "BMI" in sim:
                sim["BMI"] = 24.0
            if "bmi" in sim:
                sim["bmi"] = 24.0

        elif scenario_id == "normalize_bp":
            if "RestingBP" in sim:
                sim["RestingBP"] = 120.0
            if "hypertension" in sim:
                sim["hypertension"] = 0
                
        elif scenario_id == "improve_bp_10":
            if "RestingBP" in sim:
                sim["RestingBP"] = max(110.0, sim["RestingBP"] * 0.9)
                
        elif scenario_id == "improve_glucose":
            if "FastingBS" in sim:
                sim["FastingBS"] = 0
            if "avg_glucose_level" in sim:
                sim["avg_glucose_level"] = 90.0

        elif scenario_id == "lower_cholesterol":
            if "Cholesterol" in sim:
                sim["Cholesterol"] = min(sim["Cholesterol"], 180.0)
                
        elif scenario_id == "active_lifestyle":
            if "ExerciseAngina" in sim:
                sim["ExerciseAngina"] = "N" # Usually correlated with fitness
            if "work_type" in sim:
                sim["work_type"] = "Private" # Proxy for non-sedentary in stroke dataset? Just an example
                
        elif scenario_id == "reduce_alcohol":
            if "ALCOHOL CONSUMING" in sim:
                sim["ALCOHOL CONSUMING"] = 1 # 1 = No

        elif scenario_id == "improve_sleep":
            pass # No direct feature in current models, but acts as a placebo/baseline modifier in real systems

        elif scenario_id == "reduce_stress":
            if "PEER_PRESSURE" in sim:
                sim["PEER_PRESSURE"] = 1

        return sim
