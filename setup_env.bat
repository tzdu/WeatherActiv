@echo off
echo Setting up environment file for Next.js app...
echo.

REM Copy the template to .env.local
copy "nextjsweather\env.local.template" "nextjsweather\.env.local"

echo.
echo Environment file created at: nextjsweather\.env.local
echo.
echo IMPORTANT: You need to update the following values:
echo 1. NEXT_PUBLIC_SUPABASE_ANON_KEY - Get from Supabase Settings ^> API
echo 2. NEXT_PUBLIC_HERE_API_KEY - Get from HERE Developer Portal (optional)
echo.
echo After updating the file, restart your Next.js development server.
echo.
pause
