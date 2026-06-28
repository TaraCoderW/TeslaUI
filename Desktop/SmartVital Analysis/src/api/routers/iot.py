from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
import asyncio
import json

from src.iot.device_manager import iot_manager

router = APIRouter()

class ConnectRequest(BaseModel):
    port_id: str

@router.get("/scan")
async def scan_ports():
    return {"ports": iot_manager.scan_ports()}

@router.post("/connect")
async def connect_device(req: ConnectRequest):
    result = iot_manager.connect(req.port_id)
    if result["status"] == "success":
        iot_manager.start_stream()
    return result

@router.post("/disconnect")
async def disconnect_device():
    iot_manager.disconnect()
    return {"status": "success"}

@router.get("/mode/{disease}")
async def get_mode(disease: str):
    return iot_manager.get_mode_info(disease)

@router.websocket("/stream")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    # Give manager reference to this event loop
    loop = asyncio.get_running_loop()
    iot_manager.set_loop(loop)
    
    try:
        while True:
            # Wait for data event from the serial reader thread
            await iot_manager.on_data_event.wait()
            iot_manager.on_data_event.clear()
            
            payload = {
                "type": "live_data",
                "state": iot_manager.live_state,
                "needs_shap_recalc": iot_manager.should_recalc_shap()
            }
            
            # Send latest state to client
            await websocket.send_json(payload)
            
    except WebSocketDisconnect:
        print("IoT Stream WebSocket disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
