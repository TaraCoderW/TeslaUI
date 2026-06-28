from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
import asyncio
import json
import os
import random
import time
from pydantic import BaseModel

import websockets

router = APIRouter()

# Global state for dynamic toggling
class IoTState:
    mode: str = os.getenv("IOT_MODE", "mock")
    scenario: str = os.getenv("SCENARIO", "normal")
    interval: float = float(os.getenv("INTERVAL", "2.0"))

iot_state = IoTState()

MOCK_SERVER_URL  = os.getenv("MOCK_WS_URL", "ws://localhost:8765")
HARDWARE_WS_URL  = os.getenv("HARDWARE_WS_URL", "ws://192.168.1.100/ws")

SCENARIOS = {
    "normal":       {"heart_rate": (65, 80),   "spo2": (97.0, 99.5), "temperature": (36.3, 37.0), "systolic_bp": (110, 120), "diastolic_bp": (70, 80),   "gsr": (0.2, 0.5)},
    "cardiac_risk": {"heart_rate": (100, 145), "spo2": (88.0, 94.0), "temperature": (37.5, 38.5), "systolic_bp": (155, 185), "diastolic_bp": (95, 115),  "gsr": (1.2, 2.5)},
    "diabetic":     {"heart_rate": (75, 95),   "spo2": (95.0, 98.0), "temperature": (36.8, 37.8), "systolic_bp": (130, 150), "diastolic_bp": (85, 100),  "gsr": (0.8, 1.8)},
    "lung_risk":    {"heart_rate": (85, 110),  "spo2": (91.0, 95.5), "temperature": (37.2, 38.2), "systolic_bp": (120, 145), "diastolic_bp": (78, 95),   "gsr": (0.6, 1.4)},
}

def inline_mock_payload() -> dict:
    cfg = SCENARIOS.get(iot_state.scenario, SCENARIOS["normal"])
    systolic  = round(random.uniform(*cfg["systolic_bp"]))
    diastolic = round(random.uniform(*cfg["diastolic_bp"]))
    gsr       = round(random.uniform(*cfg["gsr"]), 3)
    return {
        "meta": {"scenario": iot_state.scenario, "timestamp": round(time.time(), 3), "mode": "INLINE_MOCK"},
        "sensors": {
            "MAX30102":  {"heart_rate_bpm": round(random.uniform(*cfg["heart_rate"]), 1), "spo2_percent": round(random.uniform(*cfg["spo2"]), 1)},
            "DHT22":     {"temperature_celsius": round(random.uniform(*cfg["temperature"]), 1)},
            "BP_MODULE": {"systolic_mmhg": systolic, "diastolic_mmhg": diastolic},
            "GSR":       {"conductance_uS": gsr, "stress_level": "Low" if gsr < 0.6 else "Moderate" if gsr < 1.2 else "High"},
        }
    }

@router.websocket("/ws/vitals")
async def vitals_endpoint(client_ws: WebSocket):
    await client_ws.accept()
    print(f"[SmartVital] Frontend connected — IOT_MODE={iot_state.mode}, scenario={iot_state.scenario}")

    if iot_state.mode == "mock":
        await _stream_from_mock_server(client_ws)
    elif iot_state.mode == "real":
        await _stream_from_hardware(client_ws)
    else:
        await client_ws.send_json({"error": f"Unknown IOT_MODE: {iot_state.mode}"})

async def _stream_from_mock_server(client_ws: WebSocket):
    try:
        async with websockets.connect(MOCK_SERVER_URL) as mock_ws:
            await mock_ws.send(json.dumps({"scenario": iot_state.scenario, "interval": iot_state.interval}))
            async for message in mock_ws:
                data = json.loads(message)
                # Override mode meta if we want it to say simulation
                if "meta" in data:
                    data["meta"]["mode"] = "SIMULATION"
                await client_ws.send_json(data)
    except (websockets.exceptions.ConnectionClosed, OSError):
        print("[SmartVital] Mock server unreachable — using inline fallback")
        await _inline_mock_stream(client_ws)
    except WebSocketDisconnect:
        print("[SmartVital] Frontend disconnected")

async def _inline_mock_stream(client_ws: WebSocket):
    try:
        while True:
            payload = inline_mock_payload()
            payload["meta"]["mode"] = "SIMULATION"
            await client_ws.send_json(payload)
            await asyncio.sleep(iot_state.interval)
    except WebSocketDisconnect:
        print("[SmartVital] Frontend disconnected (inline mock)")

async def _stream_from_hardware(client_ws: WebSocket):
    try:
        # Fallback to inline mock if hardware ws connection fails
        try:
            async with websockets.connect(HARDWARE_WS_URL, open_timeout=2) as hw_ws:
                async for message in hw_ws:
                    data = json.loads(message)
                    if "meta" in data:
                        data["meta"]["mode"] = "REAL_HARDWARE"
                    await client_ws.send_json(data)
        except Exception:
            print(f"[SmartVital] Real hardware not found at {HARDWARE_WS_URL}, waiting...")
            # If real hardware is not found, we don't stream mock data, we just wait.
            while True:
                await client_ws.send_json({"error": "Hardware disconnected. Waiting for connection..."})
                await asyncio.sleep(5)
    except WebSocketDisconnect:
        print("[SmartVital] Frontend disconnected (hardware mode)")

class ModeRequest(BaseModel):
    mode: str
    scenario: str = "normal"

@router.post("/mode")
async def set_mode(req: ModeRequest):
    if req.mode not in ["mock", "real"]:
        return {"error": "Invalid mode"}
    
    iot_state.mode = req.mode
    iot_state.scenario = req.scenario
    return {"status": "success", "mode": iot_state.mode, "scenario": iot_state.scenario}

@router.get("/status")
def iot_status():
    return {
        "iot_mode": iot_state.mode,
        "scenario": iot_state.scenario,
        "interval_seconds": iot_state.interval,
        "mock_server_url": MOCK_SERVER_URL,
        "hardware_url": HARDWARE_WS_URL
    }
