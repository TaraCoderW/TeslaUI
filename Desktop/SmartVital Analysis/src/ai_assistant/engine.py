class HealthAssistantEngine:
    def __init__(self):
        self.disclaimer = "\n\n[Warning] **Educational Purpose Only. Not Medical Advice.** Please consult a healthcare professional for diagnosis."

    def analyze_risk(self, disease_name, probability, top_features=None):
        response = f"### AI Health Assistant Analysis: {disease_name}\n"
        
        # Risk categorization
        if probability < 0.3:
            risk_level = "Low"
            response += f"Based on the model, your risk level is **{risk_level}** ({probability:.1%}).\n"
            response += "This suggests that your current metrics are generally within a safe range, but maintaining a healthy lifestyle is always recommended."
        elif probability < 0.7:
            risk_level = "Moderate"
            response += f"Based on the model, your risk level is **{risk_level}** ({probability:.1%}).\n"
            response += "There are some elevated risk factors. It is advisable to review your lifestyle habits and perhaps schedule a routine checkup."
        else:
            risk_level = "High"
            response += f"Based on the model, your risk level is **{risk_level}** ({probability:.1%}).\n"
            response += "The model has identified significant risk factors. **We strongly recommend consulting a healthcare provider** for a professional evaluation."
            
        if top_features:
            response += "\n\n**Key Contributing Factors:**\n"
            for feature, importance in top_features[:3]:
                impact = "increased" if importance > 0 else "decreased"
                response += f"- **{feature}**: This parameter significantly {impact} your risk score.\n"
                
        response += self.disclaimer
        return response

    def explain_parameter(self, parameter_name):
        explanations = {
            "Cholesterol": "Cholesterol is a waxy substance found in your blood. High levels can build up in blood vessels, increasing the risk of heart disease.",
            "RestingBP": "Resting Blood Pressure measures the force of blood against your artery walls. High BP (hypertension) strains the heart.",
            "BMI": "Body Mass Index (BMI) is a measure of body fat based on height and weight. High BMI is linked to cardiovascular diseases and diabetes.",
            "Glucose": "Blood glucose is your main source of energy. Persistently high levels indicate diabetes or prediabetes.",
            "Smoking_Severity": "Smoking damages blood vessels, reduces oxygen in the blood, and is a major cause of lung cancer and heart disease.",
        }
        
        # Return explanation or generic fallback
        exp = explanations.get(parameter_name, f"**{parameter_name}** is an important medical parameter used in this assessment.")
        return exp + self.disclaimer
        
    def generate_preventive_actions(self, disease_name):
        actions = {
            "Heart Disease": [
                "Maintain a balanced diet low in sodium and saturated fats.",
                "Engage in at least 150 minutes of moderate aerobic exercise weekly.",
                "Manage stress through meditation or relaxation techniques."
            ],
            "Diabetes": [
                "Monitor carbohydrate intake and avoid sugary drinks.",
                "Maintain a healthy weight.",
                "Include more fiber-rich foods in your diet."
            ],
            "Stroke": [
                "Control blood pressure and cholesterol levels.",
                "Quit smoking and limit alcohol consumption.",
                "Stay physically active."
            ],
            "Lung Cancer": [
                "Avoid smoking and secondhand smoke.",
                "Test your home for radon.",
                "Avoid carcinogens at work."
            ]
        }
        
        recs = actions.get(disease_name, ["Maintain a healthy lifestyle.", "Consult with your doctor regularly."])
        
        response = f"### Preventive Actions for {disease_name}\n"
        for rec in recs:
            response += f"- {rec}\n"
            
        response += self.disclaimer
        return response
