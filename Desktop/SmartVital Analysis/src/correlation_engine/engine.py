import json
from typing import Dict, Any, List
from .comorbidity_scoring import ComorbidityScorer
from .correlation_analyzer import CorrelationAnalyzer
from .recommendation_engine import RecommendationEngine

class ComorbidityEngine:
    def __init__(self):
        self.scorer = ComorbidityScorer()
        self.analyzer = CorrelationAnalyzer()
        self.recommender = RecommendationEngine()

    def generate_comorbidity_report(self, latest_assessments: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Takes the latest DB assessments and generates the full Comorbidity Report payload for the frontend.
        """
        # 1. Parse inputs
        risks = {}
        all_inputs = {}
        for a in latest_assessments:
            risks[a['disease']] = a['risk_score']
            
            # Extract real inputs from the DB assessment
            raw = a.get('raw_inputs')
            if raw:
                try:
                    inputs_dict = json.loads(raw)
                    for k, v in inputs_dict.items():
                        all_inputs[k] = v
                except json.JSONDecodeError:
                    pass

        # 2. Scoring & Analysis
        score = self.scorer.calculate_score(risks)
        shared_factors = self.analyzer.detect_shared_factors(all_inputs, risks)
        insight_text = self.analyzer.generate_insight(risks, shared_factors)
        recommendations = self.recommender.generate_recommendations(risks, shared_factors)

        # 3. Generate Visual Data for Plotly/Recharts
        
        # Heatmap Matrix
        diseases = ["Heart Disease", "Stroke", "Diabetes", "Lung Cancer"]
        heatmap_z = []
        for d1 in diseases:
            row = []
            for d2 in diseases:
                if d1 == d2:
                    row.append(1.0)
                else:
                    inf = self.scorer.relationships.get(d1, {}).get(d2, 0.0)
                    row.append(inf)
            heatmap_z.append(row)

        # Network Graph Edges
        edges = []
        for d1, targets in self.scorer.relationships.items():
            for d2, weight in targets.items():
                if weight > 0:
                    edges.append({"source": d1, "target": d2, "weight": weight})

        # Sankey Flow (Example static mapping based on shared factors)
        sankey_nodes = []
        sankey_links = []
        node_idx = 0
        node_map = {}
        
        for sf in shared_factors:
            node_map[sf] = node_idx
            sankey_nodes.append({"name": sf.title()})
            node_idx += 1
            
        for d in diseases:
            node_map[d] = node_idx
            sankey_nodes.append({"name": d})
            node_idx += 1

        for sf in shared_factors:
            for d, r in risks.items():
                if r > 0.4:
                    # Simple heuristic link
                    sankey_links.append({
                        "source": node_map[sf],
                        "target": node_map[d],
                        "value": r * 10
                    })

        return {
            "score": score,
            "insight": insight_text,
            "shared_factors": shared_factors,
            "recommendations": recommendations,
            "visuals": {
                "heatmap": {
                    "x": diseases,
                    "y": diseases,
                    "z": heatmap_z
                },
                "network": {
                    "nodes": [{"id": d, "risk": risks.get(d, 0)} for d in diseases],
                    "edges": edges
                },
                "sankey": {
                    "nodes": sankey_nodes,
                    "links": sankey_links
                }
            }
        }
