from typing import Dict, List, Any

class CorrelationAnalyzer:
    def __init__(self):
        pass

    def detect_shared_factors(self, inputs: Dict[str, Any], risks: Dict[str, float]) -> List[str]:
        """
        Identify shared risk factors based on aggregated inputs across all models.
        """
        shared = []
        
        # Check Blood Pressure
        if inputs.get('RestingBP', 0) > 130 or inputs.get('BloodPressure', 0) > 130 or inputs.get('hypertension') == 1:
            shared.append('hypertension')
            
        # Check Glucose
        if inputs.get('FastingBS') == 1 or inputs.get('Glucose', 0) > 125 or inputs.get('avg_glucose_level', 0) > 125:
            shared.append('elevated glucose')
            
        # Check BMI
        if inputs.get('BMI', 0) > 25 or inputs.get('bmi', 0) > 25:
            shared.append('elevated BMI')
            
        # Check Age
        age = inputs.get('Age') or inputs.get('age') or inputs.get('AGE', 0)
        if age and age > 55:
            shared.append('advanced age')
            
        # Check Smoking
        smoking = inputs.get('smoking_status') in ['smokes', 'formerly smoked'] or inputs.get('SMOKING') == 2
        if smoking:
            shared.append('smoking history')
            
        return shared

    def generate_insight(self, risks: Dict[str, float], shared_factors: List[str]) -> str:
        """
        Generate dynamic, human-readable explanations.
        """
        elevated = [d for d, r in risks.items() if r > 0.4]
        high = [d for d, r in risks.items() if r > 0.7]
        
        if not elevated:
            return "No significant cross-disease risks detected based on your current profile."
            
        insight = ""
        if len(high) >= 2:
            insight += f"Your risk for {', '.join(high)} is critical. "
        elif len(elevated) >= 2:
            insight += f"We detected elevated risk for {', '.join(elevated)}. "
            
        if shared_factors and len(elevated) >= 2:
            factors_str = ', '.join(shared_factors)
            insight += f"These risks are simultaneously driven by shared factors including {factors_str}. "
            
            if 'elevated glucose' in shared_factors and 'Heart Disease' in elevated:
                insight += "Elevated glucose levels are increasing cardiovascular stress, which contributes to a higher heart disease risk. "
                
            if 'hypertension' in shared_factors and 'Stroke' in elevated:
                insight += "High blood pressure is significantly raising the probability of stroke-related complications. "
                
            if 'smoking history' in shared_factors and 'Lung Cancer' in elevated:
                insight += "Smoking history is contributing to both lung vulnerability and cardiovascular strain. "
        
        insight += "Educational insight only. Not medical advice."
        return insight
