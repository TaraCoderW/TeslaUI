"""
SmartVital IoT Bridge for FastAPI
====================================
Drop this into your FastAPI app.
Controls whether data comes from the mock server or real ESP32/RPi hardware.

Usage in .env:
    IOT_MODE=mock        ← uses mock_iot_server.py
    IOT_MODE=real        ← expects real hardware on HARDWARE_WS_URL

Your React frontend always hits: ws://localhost:8000/ws/vitals
It never needs to know whether it's real or mock.
"""

import asyncio
import json
import os
import random
import math
import time

import websockets
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="SmartVital IoT Bridge")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Config ────────────────────────────────────
IOT_MODE         = os.getenv("IOT_MODE", "mock")          # "mock" | "real"
MOCK_SERVER_URL  = os.getenv("MOCK_WS_URL", "ws://localhost:8765")
HARDWARE_WS_URL  = os.getenv("HARDWARE_WS_URL", "ws://192.168.1.100/ws")  # your ESP32 IP
SCENARIO         = os.getenv("SCENARIO", "normal")        # normal | cardiac_risk | diabetic | lung_risk
INTERVAL         = float(os.getenv("INTERVAL", "2.0"))


# ── Inline mock (fallback if mock server isn't running) ──────────────────────
SCENARIOS = {
    "normal":       {"heart_rate": (65, 80),   "spo2": (97.0, 99.5), "temperature": (36.3, 37.0), "systolic_bp": (110, 120), "diastolic_bp": (70, 80),   "gsr": (0.2, 0.5)},
    "cardiac_risk": {"heart_rate": (100, 145), "spo2": (88.0, 94.0), "temperature": (37.5, 38.5), "systolic_bp": (155, 185), "diastolic_bp": (95, 115),  "gsr": (1.2, 2.5)},
    "diabetic":     {"heart_rate": (75, 95),   "spo2": (95.0, 98.0), "temperature": (36.8, 37.8), "systolic_bp": (130, 150), "diastolic_bp": (85, 100),  "gsr": (0.8, 1.8)},
    "lung_risk":    {"heart_rate": (85, 110),  "spo2": (91.0, 95.5), "temperature": (37.2, 38.2), "systolic_bp": (120, 145), "diastolic_bp": (78, 95),   "gsr": (0.6, 1.4)},
}

def inline_mock_payload() -> dict:
    cfg = SCENARIOS.get(SCENARIO, SCENARIOS["normal"])
    systolic  = round(random.uniform(*cfg["systolic_bp"]))
    diastolic = round(random.uniform(*cfg["diastolic_bp"]))
    gsr       = round(random.uniform(*cfg["gsr"]), 3)
    return {
        "meta": {"scenario": SCENARIO, "timestamp": round(time.time(), 3), "mode": "INLINE_MOCK"},
        "sensors": {
            "MAX30102":  {"heart_rate_bpm": round(random.uniform(*cfg["heart_rate"]), 1), "spo2_percent": round(random.uniform(*cfg["spo2"]), 1)},
            "DHT22":     {"temperature_celsius": round(random.uniform(*cfg["temperature"]), 1)},
            "BP_MODULE": {"systolic_mmhg": systolic, "diastolic_mmhg": diastolic},
            "GSR":       {"conductance_uS": gsr, "stress_level": "Low" if gsr < 0.6 else "Moderate" if gsr < 1.2 else "High"},
        }
    }


# ── WebSocket endpoint (called by React frontend) ────────────────────────────
@app.websocket("/ws/vitals")
async def vitals_endpoint(client_ws: WebSocket):
    await client_ws.accept()
    print(f"[SmartVital] Frontend connected — IOT_MODE={IOT_MODE}, scenario={SCENARIO}")

    if IOT_MODE == "mock":
        await _stream_from_mock_server(client_ws)
    elif IOT_MODE == "real":
        await _stream_from_hardware(client_ws)
    else:
        await client_ws.send_json({"error": f"Unknown IOT_MODE: {IOT_MODE}"})


async def _stream_from_mock_server(client_ws: WebSocket):
    """Proxies data from the standalone mock server → frontend."""
    try:
        async with websockets.connect(MOCK_SERVER_URL) as mock_ws:
            # Send scenario config to mock server
            await mock_ws.send(json.dumps({"scenario": SCENARIO, "interval": INTERVAL}))
            async for message in mock_ws:
                data = json.loads(message)
                await client_ws.send_json(data)
    except (websockets.exceptions.ConnectionClosed, OSError):
        # Mock server not running — fall back to inline generator
        print("[SmartVital] Mock server unreachable — using inline fallback")
        await _inline_mock_stream(client_ws)
    except WebSocketDisconnect:
        print("[SmartVital] Frontend disconnected")


async def _inline_mock_stream(client_ws: WebSocket):
    """Generates mock data directly inside FastAPI (no external server needed)."""
    try:
        while True:
            payload = inline_mock_payload()
            await client_ws.send_json(payload)
            await asyncio.sleep(INTERVAL)
    except WebSocketDisconnect:
        print("[SmartVital] Frontend disconnected (inline mock)")


async def _stream_from_hardware(client_ws: WebSocket):
    """Proxies live data from real ESP32/RPi → frontend."""
    try:
        async with websockets.connect(HARDWARE_WS_URL) as hw_ws:
            async for message in hw_ws:
                data = json.loads(message)
                await client_ws.send_json(data)
    except (websockets.exceptions.ConnectionClosed, OSError) as e:
        print(f"[SmartVital] Hardware WS error: {e} — falling back to inline mock")
        await _inline_mock_stream(client_ws)
    except WebSocketDisconnect:
        print("[SmartVital] Frontend disconnected (hardware mode)")


# ── Status endpoint ───────────────────────────
@app.get("/iot/status")
def iot_status():
    return {
        "iot_mode": IOT_MODE,
        "scenario": SCENARIO,
        "interval_seconds": INTERVAL,
        "mock_server_url": MOCK_SERVER_URL if IOT_MODE == "mock" else None,
        "hardware_url": HARDWARE_WS_URL if IOT_MODE == "real" else None,
    }
