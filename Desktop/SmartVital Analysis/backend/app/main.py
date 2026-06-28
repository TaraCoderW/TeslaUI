from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
import os

from backend.app.config import settings
from backend.app.database import init_db
from backend.app.auth.router import router as auth_router
from backend.app.patient.router import router as patient_router
from backend.app.doctor.router import router as doctor_router
from backend.app.appointments.router import router as appointments_router
from backend.app.clinical.router import router as clinical_router
from backend.app.alerts.router import router as alerts_router
from backend.app.messages.router import router as messages_router
from backend.app.researcher.router import router as researcher_router
from backend.app.admin.router import router as admin_router
from backend.app.auth.dependencies import get_current_user

# Existing ML/IoT routers
from src.api.routers import predictions, iot, iot_bridge, ai_assistant
from backend.app.limiter import limiter

app = FastAPI(title="SmartVital API", description="Backend for SmartVital React Frontend")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# CORS setup for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "https://smartvital.health", "https://smartvital-frontend.onrender.com", "https://smartvital.vercel.app"],
    allow_origin_regex="https://.*", 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await init_db()
    # Create assets directory if it doesn't exist for SHAP charts
    os.makedirs("assets", exist_ok=True)

# Mount static files for serving SHAP/LIME charts
app.mount("/assets", StaticFiles(directory="assets"), name="assets")

# Include New Routers
app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(patient_router, prefix="/patient", tags=["patient"])
app.include_router(doctor_router, prefix="/doctor", tags=["doctor"])
app.include_router(appointments_router, prefix="/appointments", tags=["appointments"])
app.include_router(clinical_router, prefix="/clinical", tags=["clinical"])
app.include_router(alerts_router, prefix="/alerts", tags=["alerts"])
app.include_router(messages_router, prefix="/messages", tags=["messages"])
app.include_router(researcher_router, prefix="/researcher", tags=["researcher"])
app.include_router(admin_router, prefix="/admin", tags=["admin"])

# Include Existing Routers (with Auth Dependency added)
app.include_router(
    predictions.router, 
    prefix="/predict", 
    tags=["predictions"],
    dependencies=[Depends(get_current_user)]
)

app.include_router(
    iot_bridge.router, 
    prefix="/api/iot", 
    tags=["iot"]
)

app.include_router(
    ai_assistant.router, 
    prefix="/api/ai", 
    tags=["ai"]
)

@app.get("/")
def read_root(request: Request):
    return {"message": "SmartVital API is running"}
