@echo off
echo Starting FHHL Energy Monitor...
start "FHHL Backend"  cmd /k "cd backend && python main.py"
timeout /t 2 /nobreak >nul
start "FHHL Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 3 /nobreak >nul
start http://localhost:5173
