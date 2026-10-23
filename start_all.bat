@echo off
title IELTIX - All Services Launcher (Web + Bot + API)
color 0B
cls

echo ===============================================================================
echo        IELTIX - ALL SERVICES LAUNCHER (WEB PLATFORM + TELEGRAM BOT + API)
echo ===============================================================================
echo.

set ROOT_DIR=%~dp0

echo [1/5] Muhitlar tekshirilmoqda...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [OGOHLANTIRISH] Node.js topilmadi. Web platforma ishga tushmasligi mumkin.
)

if not exist "%ROOT_DIR%.venv\Scripts\python.exe" (
    echo [OGOHLANTIRISH] Python virtual muhiti (.venv) topilmadi.
)

echo.
echo [2/5] Web Backend API ishga tushirilmoqda (Port 5000)...
cd /d "%ROOT_DIR%IELTIX_platform\backend"
start "IELTIX [1/4] - Web Backend (Port 5000)" cmd /k "npm run dev"

echo.
echo [3/5] Web Frontend ishga tushirilmoqda (Port 5173)...
cd /d "%ROOT_DIR%IELTIX_platform\frontend"
start "IELTIX [2/4] - Web Frontend (Port 5173)" cmd /k "npm run dev"

echo.
echo [4/5] FastAPI Core API & Live Call ishga tushirilmoqda (Port 8000)...
cd /d "%ROOT_DIR%"
start "IELTIX [3/4] - FastAPI Core & Live Call (Port 8000)" cmd /k "%ROOT_DIR%.venv\Scripts\python.exe -m uvicorn apps.core_api.main:app --host 0.0.0.0 --port 8000 --reload"

echo.
echo [5/5] Telegram Bot ishga tushirilmoqda (@MockLife_bot)...
start "IELTIX [4/4] - Telegram Bot" cmd /k "%ROOT_DIR%.venv\Scripts\python.exe -m apps.telegram_bot.main"

echo.
echo ===============================================================================
echo   BARCHA TIZIMLAR MUVAFFAQIYATLI ISHGA TUSHIRILDI!
echo.
echo   1. Web Frontend:        http://localhost:5173
echo   2. Web Backend API:     http://localhost:5000/api
echo   3. FastAPI Core API:    http://localhost:8000
echo   4. Live Call Mini App:  http://localhost:8000/live-call/index.html
echo   5. Telegram Bot:        @MockLife_bot (Polling faol)
echo ===============================================================================
echo.
timeout /t 3 /nobreak >nul
start http://localhost:5173
echo Brauzerda frontend ochildi (http://localhost:5173).
echo Serverlarni to'xtatish uchun har bir ochilgan oynani yopishingiz kifoya.
pause
