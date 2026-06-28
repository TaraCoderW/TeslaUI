"""
SmartVital Mock IoT Signal Server
===================================
Simulates all 5 sensors from the SmartVital synopsis:
  - MAX30102   → Heart Rate + SpO2
  - AD8232     → ECG signal (waveform points)
  - DHT22      → Body Temperature + Humidity
  - GSR Sensor → Skin Conductance (stress/sweat)
  - BP Module  → Systolic + Diastolic Blood Pressure

Run:  python mock_iot_server.py
WebSocket endpoint: ws://localhost:8765

Set IOT_MODE=mock in your FastAPI .env to use this instead of real hardware.
"""

import asyncio
import websockets
import json
import random
import math
import time
import os
import argparse

# ──────────────────────────────────────────────
# SCENARIO PROFILES
# Each profile simulates a different patient state
# ──────────────────────────────────────────────
SCENARIOS = {
    "normal": {
        "label": "Healthy Patient",
        "heart_rate": (65, 80),
        "spo2": (97.0, 99.5),
        "temperature": (36.3, 37.0),
        "humidity": (40, 60),
        "systolic_bp": (110, 120),
        "diastolic_bp": (70, 80),
        "gsr_conductance": (0.2, 0.5),   # µS — low stress
        "ecg_amplitude": 1.0,
        "ecg_noise": 0.05,
    },
    "cardiac_risk": {
        "label": "Cardiac Risk Patient",
        "heart_rate": (100, 145),
        "spo2": (88.0, 94.0),
        "temperature": (37.5, 38.5),
        "humidity": (50, 70),
        "systolic_bp": (155, 185),
        "diastolic_bp": (95, 115),
        "gsr_conductance": (1.2, 2.5),   # elevated stress
        "ecg_amplitude": 1.6,
        "ecg_noise": 0.20,
    },
    "diabetic": {
        "label": "Diabetic Risk Patient",
        "heart_rate": (75, 95),
        "spo2": (95.0, 98.0),
        "temperature": (36.8, 37.8),
        "humidity": (45, 65),
        "systolic_bp": (130, 150),
        "diastolic_bp": (85, 100),
        "gsr_conductance": (0.8, 1.8),   # moderate stress (insulin response)
        "ecg_amplitude": 1.1,
        "ecg_noise": 0.08,
    },
    "lung_risk": {
        "label": "Lung Risk Patient",
        "heart_rate": (85, 110),
        "spo2": (91.0, 95.5),            # low oxygen saturation
        "temperature": (37.2, 38.2),
        "humidity": (55, 75),
        "systolic_bp": (120, 145),
        "diastolic_bp": (78, 95),
        "gsr_conductance": (0.6, 1.4),
        "ecg_amplitude": 1.2,
        "ecg_noise": 0.12,
    },
}

# ──────────────────────────────────────────────
# ECG WAVEFORM GENERATOR
# Simulates a realistic PQRST waveform
# ──────────────────────────────────────────────
def generate_ecg_waveform(amplitude: float, noise: float, num_points: int = 50) -> list[float]:
    """
    Generates a simplified PQRST ECG waveform as a list of voltage values.
    amplitude: scales the peak height (higher = more pronounced)
    noise:     adds random noise (higher = noisier signal, e.g. arrhythmia)
    """
    waveform = []
    for i in range(num_points):
        t = i / num_points  # 0.0 → 1.0 over one heartbeat cycle

        # P wave (atrial depolarization) — small bump at ~0.1
        p = 0.15 * amplitude * math.exp(-((t - 0.1) ** 2) / 0.001)

        # Q wave (small dip before R) — tiny negative at ~0.22
        q = -0.05 * amplitude * math.exp(-((t - 0.22) ** 2) / 0.0003)

        # R wave (main spike) — tall positive at ~0.25
        r = 1.0 * amplitude * math.exp(-((t - 0.25) ** 2) / 0.0003)

        # S wave (dip after R) — negative at ~0.28
        s = -0.2 * amplitude * math.exp(-((t - 0.28) ** 2) / 0.0003)

        # T wave (ventricular repolarization) — medium bump at ~0.45
        t_wave = 0.3 * amplitude * math.exp(-((t - 0.45) ** 2) / 0.002)

        sample = p + q + r + s + t_wave + random.gauss(0, noise)
        waveform.append(round(sample, 4))

    return waveform


# ──────────────────────────────────────────────
# SENSOR DATA GENERATORS
# ──────────────────────────────────────────────
def generate_max30102(cfg: dict) -> dict:
    """MAX30102 — Heart Rate + SpO2"""
    return {
        "sensor": "MAX30102",
        "heart_rate_bpm": round(random.uniform(*cfg["heart_rate"]), 1),
        "spo2_percent": round(random.uniform(*cfg["spo2"]), 1),
    }

def generate_ad8232(cfg: dict) -> dict:
    """AD8232 — ECG waveform"""
    return {
        "sensor": "AD8232",
        "ecg_waveform": generate_ecg_waveform(cfg["ecg_amplitude"], cfg["ecg_noise"]),
        "lead_off": False,   # True = electrode detached (simulate occasionally)
    }

def generate_dht22(cfg: dict) -> dict:
    """DHT22 — Body Temperature + Humidity"""
    return {
        "sensor": "DHT22",
        "temperature_celsius": round(random.uniform(*cfg["temperature"]), 1),
        "humidity_percent": round(random.uniform(*cfg["humidity"]), 1),
    }

def generate_gsr(cfg: dict) -> dict:
    """GSR Sensor — Skin conductance (stress indicator)"""
    raw_adc = int(random.uniform(200, 900))  # simulated 10-bit ADC reading
    conductance = round(random.uniform(*cfg["gsr_conductance"]), 3)
    stress_level = (
        "Low" if conductance < 0.6
        else "Moderate" if conductance < 1.2
        else "High"
    )
    return {
        "sensor": "GSR",
        "raw_adc": raw_adc,
        "conductance_uS": conductance,
        "stress_level": stress_level,
    }

def generate_bp_module(cfg: dict) -> dict:
    """Blood Pressure Module — Systolic + Diastolic"""
    systolic = round(random.uniform(*cfg["systolic_bp"]))
    diastolic = round(random.uniform(*cfg["diastolic_bp"]))
    pulse_pressure = systolic - diastolic
    category = (
        "Normal" if systolic < 120 and diastolic < 80
        else "Elevated" if systolic < 130
        else "Stage 1 Hypertension" if systolic < 140
        else "Stage 2 Hypertension"
    )
    return {
        "sensor": "BP_MODULE",
        "systolic_mmhg": systolic,
        "diastolic_mmhg": diastolic,
        "pulse_pressure_mmhg": pulse_pressure,
        "bp_category": category,
    }


# ──────────────────────────────────────────────
# FULL PAYLOAD ASSEMBLER
# ──────────────────────────────────────────────
def build_payload(scenario: str) -> dict:
    cfg = SCENARIOS[scenario]
    return {
        "meta": {
            "scenario": scenario,
            "scenario_label": cfg["label"],
            "timestamp": round(time.time(), 3),
            "device_id": "SMARTVITAL_MOCK_ESP32",
            "mode": "MOCK",
        },
        "sensors": {
            "MAX30102": generate_max30102(cfg),
            "AD8232":   generate_ad8232(cfg),
            "DHT22":    generate_dht22(cfg),
            "GSR":      generate_gsr(cfg),
            "BP_MODULE":generate_bp_module(cfg),
        }
    }


# ──────────────────────────────────────────────
# WEBSOCKET HANDLER
# ──────────────────────────────────────────────
active_connections = set()

async def handler(websocket):
    active_connections.add(websocket)
    client = websocket.remote_address
    print(f"\n✅ Client connected: {client}")
    print(f"   Active connections: {len(active_connections)}")

    # Read initial config message from client (optional)
    scenario = os.getenv("SCENARIO", "normal")
    interval = float(os.getenv("INTERVAL", "2.0"))

    try:
        # Non-blocking: check if client sent a config on connect
        try:
            raw = await asyncio.wait_for(websocket.recv(), timeout=1.0)
            config = json.loads(raw)
            scenario = config.get("scenario", scenario)
            interval = float(config.get("interval", interval))
            print(f"   Client requested scenario='{scenario}', interval={interval}s")
        except (asyncio.TimeoutError, json.JSONDecodeError):
            pass  # no config sent — use defaults

        if scenario not in SCENARIOS:
            await websocket.send(json.dumps({
                "error": f"Unknown scenario '{scenario}'. Valid: {list(SCENARIOS.keys())}"
            }))
            return

        print(f"   Streaming scenario: '{scenario}' every {interval}s\n")

        while True:
            payload = build_payload(scenario)
            await websocket.send(json.dumps(payload))

            # Console summary
            s = payload["sensors"]
            print(
                f"[{time.strftime('%H:%M:%S')}] "
                f"HR={s['MAX30102']['heart_rate_bpm']} bpm | "
                f"SpO2={s['MAX30102']['spo2_percent']}% | "
                f"Temp={s['DHT22']['temperature_celsius']}°C | "
                f"BP={s['BP_MODULE']['systolic_mmhg']}/{s['BP_MODULE']['diastolic_mmhg']} | "
                f"GSR={s['GSR']['stress_level']}"
            )

            await asyncio.sleep(interval)

    except websockets.exceptions.ConnectionClosed:
        print(f"🔌 Client disconnected: {client}")
    finally:
        active_connections.discard(websocket)


# ──────────────────────────────────────────────
# ENTRY POINT
# ──────────────────────────────────────────────
async def main(host: str, port: int):
    print("=" * 55)
    print("  SmartVital Mock IoT Signal Server")
    print("=" * 55)
    print(f"  WebSocket : ws://{host}:{port}")
    print(f"  Scenarios : {', '.join(SCENARIOS.keys())}")
    print(f"  Default   : {os.getenv('SCENARIO', 'normal')}")
    print(f"  Interval  : {os.getenv('INTERVAL', '2.0')}s per reading")
    print("=" * 55)
    print("  Connect your FastAPI or React frontend to this server.")
    print("  Set IOT_MODE=mock in your .env to route traffic here.")
    print("=" * 55)

    async with websockets.serve(handler, host, port):
        await asyncio.Future()  # run forever


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="SmartVital Mock IoT Server")
    parser.add_argument("--host", default="localhost", help="Host (default: localhost)")
    parser.add_argument("--port", type=int, default=8765, help="Port (default: 8765)")
    args = parser.parse_args()

    asyncio.run(main(args.host, args.port))
