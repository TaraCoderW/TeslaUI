from typing import Dict, List

class RecommendationEngine:
    def __init__(self):
        pass

    def generate_recommendations(self, risks: Dict[str, float], shared_factors: List[str]) -> List[str]:
        recommendations = []
        
        if 'elevated glucose' in shared_factors:
            recommendations.append("Blood glucose management: Consult a physician about A1C monitoring and dietary adjustments.")
            
        if 'elevated BMI' in shared_factors:
            recommendations.append("Weight management: Aim for a balanced caloric intake and consistent physical activity.")
            
        if 'hypertension' in shared_factors:
            recommendations.append("Blood pressure monitoring: Reduce sodium intake and monitor BP regularly.")
            
        if 'smoking history' in shared_factors:
            recommendations.append("Smoking cessation: Seek support programs to reduce or eliminate tobacco use.")
            
        if not recommendations:
            if any(r > 0.4 for r in risks.values()):
                recommendations.append("General wellness: Maintain a balanced lifestyle and schedule regular checkups.")
            else:
                recommendations.append("Keep up the good work maintaining your healthy lifestyle markers!")
                
        return recommendations
