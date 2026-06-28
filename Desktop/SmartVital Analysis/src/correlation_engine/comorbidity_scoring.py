import json
import os
from typing import Dict

class ComorbidityScorer:
    def __init__(self):
        current_dir = os.path.dirname(os.path.abspath(__file__))
        with open(os.path.join(current_dir, 'disease_relationships.json'), 'r') as f:
            self.relationships = json.load(f)

    def calculate_score(self, risks: Dict[str, float]) -> float:
        """
        Calculate a unified 0-100 Comorbidity Score.
        Formula considers individual probabilities and cross-disease influences.
        """
        base_score = sum(risks.values()) / len(risks) if risks else 0
        
        interaction_penalty = 0.0
        disease_names = list(risks.keys())
        
        for i in range(len(disease_names)):
            for j in range(i + 1, len(disease_names)):
                d1 = disease_names[i]
                d2 = disease_names[j]
                
                # If both risks are somewhat elevated, apply the interaction penalty
                if risks[d1] > 0.3 and risks[d2] > 0.3:
                    influence = self.relationships.get(d1, {}).get(d2, 0.0)
                    interaction_penalty += (risks[d1] * risks[d2] * influence)
                    
        final_score = (base_score + interaction_penalty) * 100
        return min(max(final_score, 0), 100)
