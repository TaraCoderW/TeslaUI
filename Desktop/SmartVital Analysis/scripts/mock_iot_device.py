import socket
import json
import time
import threading
import random
import sys

# Simulation configuration
HOST = '127.0.0.1'
PORT = 8888
SENSORS = ["MAX30102", "AD8232", "BP_SENSOR"]

print(f"Starting Mock SmartVital IoT Device on {HOST}:{PORT}...")
print("This simulates an ESP32 sending physiological data.")
print("Interactive Controls:")
print("  [n] - Normal fluctuation")
print("  [a] - Anomaly mode (spike HR/BP)")
print("  [d] - Dropout mode (disconnect MAX30102)")
print("  [q] - Quit")

mode = "normal"
active_sensors = SENSORS.copy()

def console_loop():
    global mode, active_sensors
    while True:
        cmd = sys.stdin.readline().strip().lower()
        if cmd == 'n':
            mode = "normal"
            active_sensors = SENSORS.copy()
            print("Mode: NORMAL FLUCTUATION")
        elif cmd == 'a':
            mode = "anomaly"
            print("Mode: ANOMALY (Spiking Heart Rate and BP!)")
        elif cmd == 'd':
            if "MAX30102" in active_sensors:
                active_sensors.remove("MAX30102")
                print("Mode: DROPOUT (MAX30102 disconnected)")
        elif cmd == 'q':
            print("Exiting...")
            sys.exit(0)

threading.Thread(target=console_loop, daemon=True).start()

# Base baseline values
baseline = {
    "hr": 75,
    "spo2": 98,
    "ecg_raw": 512,
    "systolic": 120,
    "diastolic": 80
}

def get_fluctuated_value(base, noise_range, is_anomaly=False, anomaly_multiplier=1.0):
    val = base + random.uniform(-noise_range, noise_range)
    if is_anomaly:
        val *= anomaly_multiplier
    return val

def generate_sensor_data():
    ts = int(time.time())
    data = []
    
    is_anomaly = (mode == "anomaly")
    
    if "MAX30102" in active_sensors:
        hr = int(get_fluctuated_value(baseline["hr"], 3, is_anomaly, 1.6)) # 75 -> ~120 in anomaly
        spo2 = int(get_fluctuated_value(baseline["spo2"], 1, is_anomaly, 0.95))
        data.append({"device": "MAX30102", "hr": hr, "spo2": spo2, "ts": ts})
        
    if "AD8232" in active_sensors:
        ecg = int(get_fluctuated_value(baseline["ecg_raw"], 50))
        data.append({"device": "AD8232", "ecg_raw": ecg, "ts": ts})
        
    if "BP_SENSOR" in active_sensors:
        sys_bp = int(get_fluctuated_value(baseline["systolic"], 5, is_anomaly, 1.4)) # 120 -> 168
        dia_bp = int(get_fluctuated_value(baseline["diastolic"], 3, is_anomaly, 1.3)) # 80 -> 104
        data.append({"device": "BP_SENSOR", "systolic": sys_bp, "diastolic": dia_bp, "ts": ts})
        
    return data

def handle_client(conn, addr):
    print(f"Connected by {addr}")
    streaming = False
    try:
        while True:
            # Check if there is data to read
            conn.settimeout(0.5)
            try:
                data = conn.recv(1024).decode('utf-8')
                if data:
                    print(f"Received: {data.strip()}")
                    if "SMARTVITAL_IDENTIFY" in data:
                        resp = f"DEVICE:{','.join(active_sensors)}\n"
                        conn.sendall(resp.encode('utf-8'))
                    elif "SMARTVITAL_STREAM_START" in data:
                        streaming = True
                    elif "SMARTVITAL_STREAM_STOP" in data:
                        streaming = False
                        conn.sendall(b"OK\n")
            except socket.timeout:
                pass
            
            if streaming:
                sensor_readings = generate_sensor_data()
                for reading in sensor_readings:
                    payload = json.dumps(reading) + "\n"
                    conn.sendall(payload.encode('utf-8'))
                time.sleep(2.0)
    except Exception as e:
        print(f"Client disconnected: {e}")
    finally:
        conn.close()

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    # Allow address reuse
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    s.bind((HOST, PORT))
    s.listen()
    print("Waiting for connection...")
    while True:
        conn, addr = s.accept()
        threading.Thread(target=handle_client, args=(conn, addr), daemon=True).start()
