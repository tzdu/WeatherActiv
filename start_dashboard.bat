@echo off
echo ========================================
echo    Starting Weather Dashboard
echo ========================================
echo.

REM Change to the Next.js directory
cd /d "%~dp0nextjsweather"

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

REM Start the development server
echo Starting development server...
echo.
echo Dashboard will be available at: http://localhost:3000
echo Press Ctrl+C to stop the server
echo.
npm run dev
