import streamlit as st

st.set_page_config(
    page_title="SmartVital | Unified Healthcare AI",
    page_icon="🧬",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for Apple-level minimalism and glassmorphism
st.markdown("""
<style>
    /* Global Font and Colors */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
    
    html, body, [class*="css"]  {
        font-family: 'Inter', sans-serif;
    }
    
    /* Main Background */
    .stApp {
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }
    
    /* Dark mode adjustments (Streamlit handles some, but we force glassmorphism) */
    @media (prefers-color-scheme: dark) {
        .stApp {
            background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
        }
    }

    /* Glassmorphism Cards */
    .glass-card {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border-radius: 15px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        padding: 2rem;
        margin-bottom: 2rem;
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
        color: inherit;
    }
    
    h1, h2, h3 {
        font-weight: 700;
        letter-spacing: -0.5px;
    }
    
    .hero-title {
        font-size: 3.5rem;
        background: -webkit-linear-gradient(45deg, #2196F3, #4CAF50);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0;
    }
    
    .hero-subtitle {
        font-size: 1.5rem;
        opacity: 0.8;
        font-weight: 300;
        margin-top: 0;
    }
</style>
""", unsafe_allow_html=True)

st.markdown('<h1 class="hero-title">SmartVital</h1>', unsafe_allow_html=True)
st.markdown('<p class="hero-subtitle">Unified IoT Integrated Multi-Disease Early Detection System</p>', unsafe_allow_html=True)

st.write("---")

col1, col2 = st.columns(2)

with col1:
    st.markdown("""
    <div class="glass-card">
        <h3>🧬 Our Mission</h3>
        <p>SmartVital bridges the gap between everyday physiological monitoring and advanced clinical predictions. By leveraging state-of-the-art Deep Learning, Explainable AI, and IoT sensors, we empower individuals with early detection of critical conditions.</p>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown("""
    <div class="glass-card">
        <h3>🤖 Explainable AI</h3>
        <p>Our models don't just give you a score. Using <b>SHAP</b> and <b>LIME</b>, SmartVital explains exactly <i>why</i> a specific risk level was predicted, highlighting the key contributing factors in your health profile.</p>
    </div>
    """, unsafe_allow_html=True)

with col2:
    st.markdown("""
    <div class="glass-card">
        <h3>🔬 Supported Models</h3>
        <ul>
            <li>❤️ <b>Heart Disease:</b> Predict cardiovascular risk</li>
            <li>🧠 <b>Stroke:</b> Analyze cerebrovascular event likelihood</li>
            <li>🩸 <b>Diabetes:</b> Early warning for metabolic syndrome</li>
            <li>🫁 <b>Lung Cancer:</b> Identify pulmonary risks early</li>
        </ul>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("""
    <div class="glass-card">
        <h3>⌚ IoT Integration</h3>
        <p>Connect your wearables or simulate a real-time hardware stream. SmartVital ingests live <b>SpO2, Heart Rate, and Blood Pressure</b> data directly into the prediction engine.</p>
    </div>
    """, unsafe_allow_html=True)

st.info("👈 **Select a disease module from the sidebar to begin.**")

st.markdown("""
<div style="text-align: center; margin-top: 50px; opacity: 0.5;">
    <p>SmartVital Internship Research Project &copy; 2026</p>
    <p><i>Educational Purpose Only. Not Medical Advice.</i></p>
</div>
""", unsafe_allow_html=True)
