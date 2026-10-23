# IELTIX — Senior AI Exam Preparation Platform (IELTS & Milliy BBM)

IELTIX — Sun'iy intellekt asosida ishlovchi ilg'or IELTS imtihonlariga tayyorgarlik platformasi, Telegram boti va jonli ovozli suhbat tizimi.

---

## 📁 Repository Tarkibi

- **`apps/telegram_bot/`**: Yangi Telegram bot (aiogram 3):
  - Ikki tilli onboarding (O'zbek / Ingliz).
  - Shaxsiy maqsad (Target Band) belgilash.
  - Reading, Writing va Speaking mashqlari.
  - Telegram Stars orqali xavfsiz VIP obunasi (250 Stars).
  - Live AI Call boshlash tugmasi.
- **`apps/live_call/`**: Live Speaking Mini App:
  - Real-time IELTS Examiner simulyatori (Part 1, 2, 3).
  - Ovoz orqali savol-javob, shovqin filtrlash, nutqni avtomatik to'xtatish (Barge-in).
  - STT / TTS va yozma fallback rejimi.
  - Fluency, Lexical, Grammar va Pronunciation bo'yicha to'liq hisobot.
- **`apps/core_api/`**: FastAPI Core API & Voice Gateway (Port 8000).
- **`packages/`**: Domain modellari, scoring mantiqi, PostgreSQL/SQLite omborlari, i18n va ovoz adapterlari.
- **`IELTIX_platform/`**: To'liq Full-Stack web platforma:
  - **`frontend/`**: React + TypeScript + Vite + Tailwind CSS (Full-length Reading, Listening, Writing split-screen imtihon simulyatorlari).
  - **`backend/`**: Node.js + Express REST API.
- **`IELTIX/`**: Original UI/UX dizayn andozalari.

---

## 🚀 Ishga Tushirish

### 1. Telegram Bot va Live Call (Tavsiya etiladi)

Muhit sozlamalari:
```bash
cp .env.bot.example .env.bot
```

**FastAPI Core & Live Call Mini App (Port 8000):**
```bash
uvicorn apps.core_api.main:app --host 0.0.0.0 --port 8000 --reload
```
- API Health: `http://localhost:8000/health`
- Live Call: `http://localhost:8000/live-call/index.html`

**Telegram Bot:**
```bash
python -m apps.telegram_bot.main
```

**Docker Compose (PostgreSQL + Redis + Core API + Bot):**
```bash
docker compose -f docker-compose.bot.yml up -d --build
```

Batafsil ma'lumot uchun: [`docs/bot-operations.md`](file:///c:/Users/Windows_11/Desktop/IELTIX-main/docs/bot-operations.md)

---

### 2. Mavjud Web Platformani Ishga Tushirish

**Frontend (Port 5173):**
```bash
cd IELTIX_platform/frontend
npm run dev
```

---

## 🧪 Avtomatlashtirilgan Testlar

```bash
pytest -q
```
Barcha 37+ birlik, API va bot integratsiya testlari tarmoqsiz (offline) rejimda muvaffaqiyatli ishlaydi.