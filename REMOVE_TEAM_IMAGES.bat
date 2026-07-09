@echo off
echo ========================================
echo   CLEANING UP TEAM IMAGE REFERENCES
echo ========================================
echo.

echo [1/4] Stopping frontend server...
taskkill /F /FI "WINDOWTITLE eq Ratan Jewellers Frontend*" >nul 2>&1
echo Frontend stopped.
echo.

echo [2/4] Deleting Next.js build cache...
cd /d "%~dp0frontend"
if exist .next (
    rmdir /s /q .next
    echo .next folder deleted ✓
) else (
    echo .next folder not found (already clean)
)
echo.

echo [3/4] Deleting node_modules/.cache...
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
    echo node_modules\.cache deleted ✓
) else (
    echo node_modules\.cache not found
)
echo.

echo [4/4] Cleaning up...
echo Done!
echo.

echo ========================================
echo   CLEANUP COMPLETE!
echo ========================================
echo.
echo Next steps:
echo 1. Restart frontend: npm run dev
echo 2. Hard refresh browser: Ctrl + Shift + R
echo 3. Team images won't be requested anymore!
echo.
pause
