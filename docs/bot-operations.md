# IELTIX Telegram Bot & Live Voice Examiner — Operations Guide

Bu qo'llanma IELTIX Telegram boti, FastAPI Core API, Live Call Mini App va ovozli AI examinerini ishga tushirish, sozlash va boshqarish bo'yicha to'liq yo'riqnomadir.

---

## 1. Arxitektura / Architecture

```text
[Telegram Foydalanuvchi]
         │
         ├──► [Telegram Bot (aiogram 3)]
         │         │
         │         ├── Onboarding (uz/en) & Shaxsiy maqsad (Target Band)
         │         ├── Reading / Writing / Speaking mashqlari
         │         ├── Telegram Stars VIP obunasi (250 Stars)
         │         └── Live Call Mini App ochish (15 daqiqalik xavfsiz token)
         │
         ├──► [Live Call Mini App (Web Audio + VAD + Interruption)]
         │         │
         │         └──► [FastAPI Voice Gateway (Port 8000)]
         │                   │
         │                   ├── STT: Groq Whisper (yoki lokal offline fallback)
         │                   ├── AI Examiner: IELTS Part 1, 2, 3 mantiqi
         │                   ├── TTS: Edge-TTS (uzbek/english)
         │                   └── SQLite / PostgreSQL (Attempts, Transcripts, Reports)
```

---

## 2. BotFather Sozlash / Telegram Bot Setup

1. **Bot yaratish:**
   - [@BotFather](https://t.me/BotFather) ga kiring.
   - `/newbot` buyrug'ini bering, nom va username bering (masalan: `ieltix_ielts_bot`).
   - Berilgan `BOT_TOKEN` ni nusxalab oling.

2. **Mini App tugmasini sozlash (Ixtiyoriy lekin tavsiya etiladi):**
   - BotFather'da `/setmenubutton` ni tanlang.
   - Botingizni tanlang.
   - Web App URL manzilini kiriting: `https://your-domain.com/live-call/index.html`
   - Tugma nomini kiriting: `🎙️ Live Call`

3. **Telegram Stars to'lovini yoqish:**
   - BotFather'da `/mybots` -> Botingizni tanlang -> **Bot Settings** -> **Payments**.
   - Telegram Stars (XTR) to'lovini faollashtiring. Stars to'lovida tashqi to'lov provayderi kaliti kerak emas, barchasi Telegram orqali avtomatik ishlaydi.

---

## 3. Muhit o'zgaruvchilari (.env.bot)

`.env.bot.example` faylidan `.env.bot` nusxasini yarating:

```bash
cp .env.bot.example .env.bot
```

Asosiy parametrlar:

| Parametr | Standart qiymat | Tavsif |
|---|---|---|
| `BOT_TOKEN` | - | Telegram BotFather bergan bot tokeni |
| `BOT_USERNAME` | `ieltix_bot` | Bot username'i |
| `PUBLIC_BASE_URL` | `http://localhost:8000` | Core API va Mini App public URL domeni |
| `DATABASE_URL` | `sqlite+aiosqlite:///./ieltix_bot.db` | PostgreSQL yoki SQLite ulanish havolasi |
| `CALL_TOKEN_SECRET` | 32+ belgili tasodifiy satr | Live Call xavfsiz token imzosi |
| `TELEGRAM_STARS_PRICE` | `250` | VIP obuna uchun Stars narxi |
| `VOICE_PROVIDER` | `local` | `local` (offline) yoki `groq` (online Whisper) |
| `GROQ_API_KEY` | - | Ovozni transkripsiya qilish uchun bepul Groq kaliti |
| `TTS_VOICE_UZ` | `uz-UZ-MadinaNeural` | O'zbek tili uchun ovoz modeli |
| `TTS_VOICE_EN` | `en-US-GuyNeural` | Ingliz tili uchun ovoz modeli |

---

## 4. Mahalliy Ishga Tushirish (Development Mode)

Tashqi pullik servislar yoki hatto internet ulanishisiz ham to'liq offline ishlash imkoniyati mavjud.

### A) Core API va Live Call Mini App:
```powershell
uvicorn apps.core_api.main:app --host 0.0.0.0 --port 8000 --reload
```
Brauzerda tekshirish:
- Salomatlik holati: `http://localhost:8000/health`
- Mini App interfeysi: `http://localhost:8000/live-call/index.html`

### B) Telegram Botni ishga tushirish:
```powershell
python -m apps.telegram_bot.main
```

---

## 5. Docker Compose orqali Ishga Tushirish (Production Mode)

PostgreSQL, Redis, Core API va Telegram Bot bir buyruq bilan konteynerda ko'tariladi:

```bash
docker compose -f docker-compose.bot.yml up -d --build
```

Konteynerlar holatini tekshirish:
```bash
docker compose -f docker-compose.bot.yml ps
docker compose -f docker-compose.bot.yml logs -f
```

---

## 6. Avtomatlashtirilgan Testlar

Barcha domen, bot va ovozli interfeys testlarini ishga tushirish:

```powershell
py -3.14 -m pytest -q
```

Hozirgi holatda barcha 37+ testlar 100% yashil o'tadi.
