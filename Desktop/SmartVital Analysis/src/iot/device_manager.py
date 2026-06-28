import asyncio
import threading
import json
import serial
import time
import socket

# Map IoT sensors to Clinical Features
SENSOR_TO_FEATURE_MAP = {
    "Heart Disease": {
        "MAX30102": ["MaxHR"],
        "AD8232": ["RestingECG", "Oldpeak", "ST_Slope"],
        "BP_SENSOR": ["RestingBP"]
    },
    # Stroke, Diabetes, Lung Cancer maps can go here...
}

ALWAYS_MANUAL_FEATURES = {
    "Heart Disease": ["Age", "Sex", "Cholesterol", "FastingBS"],
    "Stroke": ["gender", "age", "ever_married", "work_type", "residence_type", "smoking_status"],
    "Diabetes": ["Pregnancies", "Age", "DiabetesPedigreeFunction"],
    "Lung Cancer": ["GENDER", "AGE", "ANXIETY", "PEER_PRESSURE", "ALLERGY", "SWALLOWING_DIFFICULTY"]
}

class IoTDeviceManager:
    def __init__(self):
        self.connection = None
        self.connected_port = None
        self.active_sensors = []
        self.live_state = {}
        self.is_streaming = False
        self._read_thread = None
        self._loop = None
        self.on_data_event = None
        
        # Debouncing SHAP
        self.last_shap_recalc_time = 0
        self.last_shap_state = {}
        
    def set_loop(self, loop):
        self._loop = loop
        self.on_data_event = asyncio.Event()

    def scan_ports(self):
        ports = []
        try:
            import serial.tools.list_ports
            for port in serial.tools.list_ports.comports():
                ports.append({"id": port.device, "name": port.description, "type": "serial"})
        except Exception:
            pass
            
        # Add mock TCP port for testing
        ports.append({"id": "tcp://127.0.0.1:8888", "name": "Mock IoT Device (TCP)", "type": "tcp"})
        return ports

    def connect(self, port_id):
        if self.connection:
            self.disconnect()
            
        try:
            if port_id.startswith("tcp://"):
                # Mock TCP connection
                host, port_str = port_id.replace("tcp://", "").split(":")
                s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                s.settimeout(2.0)
                s.connect((host, int(port_str)))
                self.connection = s
                # Handshake
                s.sendall(b"SMARTVITAL_IDENTIFY\n")
                resp = s.recv(1024).decode('utf-8')
            else:
                # Real serial
                ser = serial.Serial(port_id, 9600, timeout=2.0)
                self.connection = ser
                time.sleep(2) # Wait for arduino reset
                ser.write(b"SMARTVITAL_IDENTIFY\n")
                resp = ser.readline().decode('utf-8')
                
            if "DEVICE:" in resp:
                sensors_str = resp.strip().split("DEVICE:")[1]
                self.active_sensors = sensors_str.split(",") if sensors_str else []
            else:
                self.active_sensors = []
                
            self.connected_port = port_id
            return {"status": "success", "sensors": self.active_sensors}
        except Exception as e:
            self.connection = None
            return {"status": "error", "message": str(e)}

    def start_stream(self):
        if not self.connection:
            return False
            
        self.is_streaming = True
        try:
            if isinstance(self.connection, socket.socket):
                self.connection.sendall(b"SMARTVITAL_STREAM_START\n")
            else:
                self.connection.write(b"SMARTVITAL_STREAM_START\n")
        except Exception:
            pass
            
        self._read_thread = threading.Thread(target=self._read_loop, daemon=True)
        self._read_thread.start()
        return True

    def stop_stream(self):
        self.is_streaming = False
        if self.connection:
            try:
                if isinstance(self.connection, socket.socket):
                    self.connection.sendall(b"SMARTVITAL_STREAM_STOP\n")
                else:
                    self.connection.write(b"SMARTVITAL_STREAM_STOP\n")
            except Exception:
                pass

    def disconnect(self):
        self.stop_stream()
        if self.connection:
            try:
                self.connection.close()
            except Exception:
                pass
        self.connection = None
        self.connected_port = None
        self.active_sensors = []

    def _read_loop(self):
        while self.is_streaming and self.connection:
            try:
                line = ""
                if isinstance(self.connection, socket.socket):
                    self.connection.settimeout(1.0)
                    try:
                        # Simple readline for socket
                        buffer = b""
                        while True:
                            char = self.connection.recv(1)
                            if not char or char == b'\n':
                                break
                            buffer += char
                        line = buffer.decode('utf-8')
                    except socket.timeout:
                        continue
                else:
                    line = self.connection.readline().decode('utf-8')

                if line.strip() and line.startswith("{"):
                    data = json.loads(line)
                    self._process_reading(data)
            except Exception as e:
                print(f"IoT Read Error: {e}")
                time.sleep(1)

    def _process_reading(self, data):
        device = data.get("device")
        # Map sensor values to clinical features
        if device == "MAX30102":
            self.live_state["MaxHR"] = data.get("hr", self.live_state.get("MaxHR"))
            self.live_state["SpO2"] = data.get("spo2", self.live_state.get("SpO2"))
        elif device == "AD8232":
            # Just store raw ECG for now
            self.live_state["RestingECG_Raw"] = data.get("ecg_raw", self.live_state.get("RestingECG_Raw"))
            self.live_state["RestingECG"] = "Normal" # Simplification for mock
            self.live_state["Oldpeak"] = 0.0
            self.live_state["ST_Slope"] = "Flat"
        elif device == "BP_SENSOR":
            self.live_state["RestingBP"] = data.get("systolic", self.live_state.get("RestingBP"))
            self.live_state["DiastolicBP"] = data.get("diastolic", self.live_state.get("DiastolicBP"))

        # Trigger websocket update safely
        if self._loop and self.on_data_event:
            self._loop.call_soon_threadsafe(self.on_data_event.set)
            
    def get_mode_info(self, disease):
        if not self.connection:
            return {"mode": "questioning"}
            
        req_sensors = list(SENSOR_TO_FEATURE_MAP.get(disease, {}).keys())
        connected = [s for s in req_sensors if s in self.active_sensors]
        missing = [s for s in req_sensors if s not in self.active_sensors]
        
        mode = "full_realtime" if not missing else "partial_realtime" if connected else "questioning"
        
        # Get features mapped
        auto_feats = []
        for s in connected:
            auto_feats.extend(SENSOR_TO_FEATURE_MAP[disease][s])
            
        manual_feats = ALWAYS_MANUAL_FEATURES.get(disease, [])
        for s in missing:
            manual_feats.extend(SENSOR_TO_FEATURE_MAP[disease][s])
            
        return {
            "mode": mode,
            "connected_devices": connected,
            "missing_sensors": missing,
            "auto_features": auto_feats,
            "manual_features": manual_feats
        }

    def should_recalc_shap(self):
        """Debouncing SHAP: Only return True if significant clinical shift or time passed."""
        now = time.time()
        if now - self.last_shap_recalc_time > 10.0: # Max recalculate every 10s if changed
            # Check for meaningful changes
            changed = False
            for k, v in self.live_state.items():
                if k not in self.last_shap_state:
                    changed = True
                    break
                # e.g., BP crossed a 5-point threshold
                if isinstance(v, (int, float)) and abs(v - self.last_shap_state[k]) > 5.0:
                    changed = True
                    break
            if changed:
                self.last_shap_state = self.live_state.copy()
                self.last_shap_recalc_time = now
                return True
        return False

# Global instance
iot_manager = IoTDeviceManager()
