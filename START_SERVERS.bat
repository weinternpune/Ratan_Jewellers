@echo off
echo ========================================
echo   RATAN JEWELLERS - Starting Servers
echo ========================================
echo.

REM Check if MongoDB is running
echo [1/4] Checking MongoDB...
sc query MongoDB | find "RUNNING" >nul
if %errorlevel% neq 0 (
    echo MongoDB is not running. Starting MongoDB...
    net start MongoDB
    if %errorlevel% neq 0 (
        echo ERROR: Failed to start MongoDB. Please start it manually.
        echo Run: net start MongoDB
        pause
        exit /b 1
    )
) else (
    echo MongoDB is already running ✓
)
echo.

REM Start Backend Server in new window
echo [2/4] Starting Backend Server...
start "Ratan Jewellers Backend" cmd /k "cd /d %~dp0backend && echo Starting Backend on http://localhost:5000 && npm run dev"
echo Backend server starting in new window...
timeout /t 3 >nul
echo.

REM Start Frontend Server in new window  
echo [3/4] Starting Frontend Server...
start "Ratan Jewellers Frontend" cmd /k "cd /d %~dp0frontend && echo Starting Frontend on http://localhost:3000 && npm run dev"
echo Frontend server starting in new window...
echo.

REM Wait for servers to start
echo [4/4] Waiting for servers to initialize...
timeout /t 5 >nul
echo.

echo ========================================
echo   ✓ Both servers are starting!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Two new terminal windows have opened:
echo 1. Backend Server (port 5000)
echo 2. Frontend Server (port 3000)
echo.
echo Keep both terminals running!
echo Close this window.
echo.
pause
