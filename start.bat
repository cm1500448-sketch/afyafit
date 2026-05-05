@echo off
echo Starting AFYAFIT Application...
echo.

echo [1/2] Starting Backend Server...
start "AFYAFIT Backend" cmd /k "cd backend && node server.js"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend Server...
start "AFYAFIT Frontend" cmd /k "npm run dev"

echo.
echo ✅ Both servers are starting!
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit this window (servers will keep running)...
pause >nul
