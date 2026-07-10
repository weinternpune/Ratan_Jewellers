@echo off
echo ========================================
echo  Ratan Jewellers - Complete Startup
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo [1/5] Checking Node.js version...
node --version
echo.

REM Check if MongoDB is running
echo [2/5] Checking MongoDB connection...
echo Make sure MongoDB is running on localhost:27017
echo.

REM Backend setup
echo [3/5] Starting Backend Server...
cd backend
if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
)

echo Starting backend on port 5000...
start "Ratan Jewellers Backend" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul
cd ..
echo.

REM Frontend setup
echo [4/5] Starting Frontend Server...
cd frontend

REM Check for .env.local, create if not exists
if not exist ".env.local" (
    echo Creating .env.local with default configuration...
    echo NEXT_PUBLIC_API_URL=http://localhost:5000/api > .env.local
    echo Created .env.local
) else (
    echo .env.local already exists
)

if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)

echo Starting frontend on port 3000...
start "Ratan Jewellers Frontend" cmd /k "npm run dev"
cd ..
echo.

echo [5/5] Startup Complete!
echo.
echo ========================================
echo  Both servers are starting...
echo ========================================
echo.
echo Backend:  http://localhost:5000/health
echo Frontend: http://localhost:3000
echo Admin:    http://localhost:3000/admin/dashboard
echo.
echo Press Ctrl+C in each terminal to stop servers
echo ========================================
pause
