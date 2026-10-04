@echo off
echo ===================================================
echo     Stopping Adhii Jarvis Services
echo ===================================================

echo Terminating running services on ports 8000 and 5173...

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do (
    if not "%%a"=="0" taskkill /F /PID %%a 2>nul
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do (
    if not "%%a"=="0" taskkill /F /PID %%a 2>nul
)

taskkill /F /FI "WINDOWTITLE eq Adhii Jarvis*" /T 2>nul

echo All Adhii Jarvis background servers stopped.
timeout /t 2 >nul
