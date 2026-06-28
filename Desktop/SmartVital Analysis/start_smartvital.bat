@echo off
echo ===================================================
echo Starting SmartVital Platform...
echo ===================================================

echo [1/2] Starting FastAPI Backend...
start "SmartVital Backend" cmd /c "python -m uvicorn backend.app.main:app --reload"

echo [2/2] Starting React Frontend...
cd frontend
start "SmartVital Frontend" cmd /c "npm run dev"
cd ..

echo ===================================================
echo SmartVital is now booting up!
echo Frontend will be available at: http://localhost:5173
echo Backend API is running at: http://127.0.0.1:8000
echo ===================================================
pause
