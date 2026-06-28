from typing import Dict, List, Any
from .simulator import Simulator

class ImpactAnalyzer:
    def __init__(self):
        self.simulator = Simulator()
        
    def calculate_impact(self, baseline: Dict[str, Any], base_risks: Dict[str, float], active_scenarios: List[str]) -> Dict[str, Any]:
        """
        Calculates impact of selected scenarios and also ranks single-intervention impacts.
        """
        # Run combined simulation
        sim_risks = self.simulator.run_simulation(baseline, active_scenarios)
        
        # Calculate deltas
        deltas = {}
        total_base = 0
        total_sim = 0
        for d in base_risks.keys():
            b = base_risks[d]
            s = sim_risks.get(d, b)
            deltas[d] = s - b
            total_base += b
            total_sim += s
            
        # Calculate Improvement Potential Score (0-100)
        # Based on how much risk can be eliminated if ALL available positive scenarios are applied
        all_scenarios = ["quit_smoking", "lose_10kg", "normalize_bp", "improve_glucose", "lower_cholesterol", "reduce_alcohol"]
        optimal_risks = self.simulator.run_simulation(baseline, all_scenarios)
        total_optimal = sum(optimal_risks.values())
        
        max_possible_reduction = total_base - total_optimal
        current_reduction = total_base - total_sim
        
        if max_possible_reduction > 0:
            potential_score = (current_reduction / max_possible_reduction) * 100
        else:
            potential_score = 0
            
        # Impact Ranking Engine (test each scenario individually)
        ranking = []
        for sc in all_scenarios:
            res = self.simulator.run_simulation(baseline, [sc])
            reduction = total_base - sum(res.values())
            if reduction > 0.01:
                ranking.append({"scenario": sc, "reduction": reduction})
                
        ranking.sort(key=lambda x: x["reduction"], reverse=True)
        
        return {
            "baseline_risks": base_risks,
            "simulated_risks": sim_risks,
            "deltas": deltas,
            "improvement_score": min(max(potential_score, 0), 100),
            "impact_ranking": ranking[:3] # Top 3
        }
