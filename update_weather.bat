@echo off
echo ========================================
echo    Weather Data Update Script
echo ========================================
echo.

REM Change to the script directory
cd /d "%~dp0"

REM Run the Python script to update weather data
echo Running weather data update...
python update_weather_data.py deploy

echo.
echo ========================================
echo    Update Complete!
echo ========================================
echo.
echo Your dashboard should now show the latest weather data.
echo You can start the Next.js server with: cd nextjsweather && npm run dev
echo.
pause
