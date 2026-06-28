import streamlit as st
import pandas as pd
import numpy as np
import time
import altair as alt

st.set_page_config(page_title="IoT Monitor", page_icon="⌚", layout="wide")

st.title("⌚ IoT Hardware Integration (Simulator)")
st.write("Real-time physiological sensor monitoring. This module connects to external hardware (MAX30102, AD8232, DHT11) via serial port. When hardware is disconnected, it runs in simulation mode.")

st.info("Hardware Status: **Disconnected**. Running in Simulation Mode.")

# Placeholders for metrics
col1, col2, col3, col4 = st.columns(4)
hr_placeholder = col1.empty()
spo2_placeholder = col2.empty()
temp_placeholder = col3.empty()
bp_placeholder = col4.empty()

st.markdown("---")
st.subheader("Live Sensor Streams")
chart_placeholder = st.empty()

# Simulation toggle
if st.button("Start Live Simulation"):
    # Initialize dataframe
    data = pd.DataFrame(columns=['Time', 'HeartRate', 'SpO2'])
    
    start_time = time.time()
    
    for i in range(50): # Run for 50 iterations to demonstrate
        current_time = pd.Timestamp.now().strftime('%H:%M:%S')
        
        # Simulate realistic values
        hr = int(np.random.normal(75, 5))
        spo2 = int(np.random.normal(98, 1))
        if spo2 > 100: spo2 = 100
        temp = round(np.random.normal(98.6, 0.2), 1)
        sys_bp = int(np.random.normal(120, 4))
        dia_bp = int(np.random.normal(80, 3))
        
        # Update metrics
        hr_placeholder.metric("Heart Rate (bpm)", hr, delta=hr-75, delta_color="inverse")
        spo2_placeholder.metric("SpO2 (%)", spo2, delta=spo2-98)
        temp_placeholder.metric("Body Temp (°F)", temp, delta=round(temp-98.6, 1))
        bp_placeholder.metric("Blood Pressure", f"{sys_bp}/{dia_bp}", delta=sys_bp-120, delta_color="inverse")
        
        # Update chart
        new_row = pd.DataFrame({'Time': [current_time], 'HeartRate': [hr], 'SpO2': [spo2]})
        data = pd.concat([data, new_row], ignore_index=True)
        
        # Keep last 20 points
        if len(data) > 20:
            data = data.tail(20)
            
        # Plot with Altair
        base = alt.Chart(data).encode(x='Time')
        line_hr = base.mark_line(color='red').encode(y=alt.Y('HeartRate', scale=alt.Scale(domain=[50, 100])))
        line_spo2 = base.mark_line(color='blue').encode(y=alt.Y('SpO2', scale=alt.Scale(domain=[90, 100])))
        
        chart = alt.layer(line_hr, line_spo2).resolve_scale(y='independent').properties(height=300)
        chart_placeholder.altair_chart(chart, use_container_width=True)
        
        time.sleep(1.0)
        
    st.success("Simulation Complete.")
