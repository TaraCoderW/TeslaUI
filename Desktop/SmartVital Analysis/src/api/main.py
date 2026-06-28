from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from src.api.routers import predictions, iot, ai_assistant

app = FastAPI(title="SmartVital API", description="Backend for SmartVital React Frontend")

# CORS setup for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create assets directory if it doesn't exist
os.makedirs("assets", exist_ok=True)

# Mount static files for serving SHAP/LIME charts
app.mount("/assets", StaticFiles(directory="assets"), name="assets")

# Include Routers
app.include_router(predictions.router, prefix="/predict", tags=["predictions"])
app.include_router(iot.router, prefix="/api/iot", tags=["iot"])
app.include_router(ai_assistant.router, prefix="/api/ai", tags=["ai"])

@app.get("/")
def read_root():
    return {"message": "SmartVital API is running"}
