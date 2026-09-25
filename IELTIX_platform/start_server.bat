@echo off
title IELTIX - Senior AI Exam Preparation Platform
color 0A
cls

echo ===============================================================================
echo                IELTIX - SENIOR AI EXAM PLATFORM (IELTS & MILLIY BBM)
echo ===============================================================================
echo.
echo [1/4] Node.js muhiti tekshirilmoqda...
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [XATO] Kompyuteringizda Node.js topilmadi! Iltimos, https://nodejs.org saytidan o'rnating.
    pause
    exit /b
)
echo [OK] Node.js muvaffaqiyatli topildi:
node -v

echo.
echo [2/4] Backend server tekshirilmoqda va ishga tushirilmoqda (Port: 5000)...
cd /d "%~dp0backend"
if not exist "node_modules" (
    echo [KUTING] Backend kutubxonalari o'rnatilmoqda (npm install)...
    call npm install
)
start "IELTIX - Backend API Server (Port 5000)" cmd /k "npm run dev"

echo.
echo [3/4] Frontend ilovasi tekshirilmoqda va ishga tushirilmoqda (Port: 5173)...
cd /d "%~dp0frontend"
if not exist "node_modules" (
    echo [KUTING] Frontend kutubxonalari o'rnatilmoqda (npm install)...
    call npm install
)
start "IELTIX - Frontend Client (Port 5173)" cmd /k "npm run dev"

echo.
echo [4/4] Brauzerda platforma ochilmoqda (http://localhost:5173)...
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo ===============================================================================
echo    Barcha serverlar faol holatda ishga tushirildi!
echo    - Frontend: http://localhost:5173
echo    - Backend API: http://localhost:5000/api
echo    - Admin Studio: http://localhost:5173 (Admin Studio bo'limi)
echo ===============================================================================
echo.
echo Dasturni to'xtatish uchun ochilgan CMD oynalarini yopishingiz mumkin.
echo.
pause
