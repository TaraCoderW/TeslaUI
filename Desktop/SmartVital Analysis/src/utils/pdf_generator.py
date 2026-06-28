from fpdf import FPDF
import datetime
import os

class HealthReportPDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 15)
        self.cell(80)
        self.cell(30, 10, 'SmartVital Health Report', 0, 0, 'C')
        self.ln(20)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}/{{nb}} - Educational Purpose Only. Not Medical Advice.', 0, 0, 'C')

def generate_pdf_report(patient_data, disease, risk_score, insight, recommendations, save_path):
    pdf = HealthReportPDF()
    pdf.alias_nb_pages()
    pdf.add_page()
    
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(0, 10, f'Date: {datetime.date.today().strftime("%Y-%m-%d")}', 0, 1)
    pdf.cell(0, 10, f'Analysis: {disease} Risk Assessment', 0, 1)
    
    pdf.ln(5)
    pdf.set_font('Arial', 'B', 14)
    pdf.cell(0, 10, 'Patient Parameters', 0, 1)
    pdf.set_font('Arial', '', 12)
    
    for key, value in patient_data.items():
        pdf.cell(0, 8, f'{key}: {value}', 0, 1)
        
    pdf.ln(5)
    pdf.set_font('Arial', 'B', 14)
    pdf.cell(0, 10, f'Risk Score: {risk_score:.1%}', 0, 1)
    
    pdf.ln(5)
    pdf.set_font('Arial', 'B', 14)
    pdf.cell(0, 10, 'AI Insight', 0, 1)
    pdf.set_font('Arial', '', 12)
    pdf.multi_cell(0, 8, insight.replace('**', '').replace('###', ''))
    
    pdf.ln(5)
    pdf.set_font('Arial', 'B', 14)
    pdf.cell(0, 10, 'Recommendations', 0, 1)
    pdf.set_font('Arial', '', 12)
    pdf.multi_cell(0, 8, recommendations.replace('**', '').replace('###', '').replace('-', '*'))
    
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    pdf.output(save_path)
    return save_path
