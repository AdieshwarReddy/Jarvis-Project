@echo off
echo ===================================================
echo     Launching Adhii Jarvis — Personal AI Workspace
echo                  Think. Speak. Act.
echo ===================================================
echo.

cd /d "%~dp0"

echo [1/3] Starting Python FastAPI Backend on port 8000...
start "Adhii Jarvis Backend" cmd /k "cd backend && .\venv\Scripts\activate && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo [2/3] Starting React Vite Frontend on port 5173...
start "Adhii Jarvis Frontend" cmd /k "cd frontend && npm run dev -- --host 0.0.0.0 --port 5173"

echo [3/3] Waiting for servers to initialize...
timeout /t 4 >nul
start http://127.0.0.1:5173

echo.
echo Adhii Jarvis is online!
echo Frontend: http://127.0.0.1:5173
echo Backend:  http://127.0.0.1:8000/docs
echo.
echo (Keep the terminal windows open, or run stop_jarvis.bat to stop)
echo ===================================================
