# 🦊 IELTIX — Senior AI Exam Preparation Platform (IELTS & Milliy BBM)

Senior darajadagi to'liq Full-Stack web platforma. Google Stitch'da tayyorlangan barcha dizaynlar, ranglar palitrasi (*Obsidian Flux* dark va *EduTest AI* light), *Plus Jakarta Sans/Inter* tipografiyasi va Foxy maskoti asosida ishlab chiqilgan.

---

## 🚀 Ishga tushirish (Quick Start)

Loyiha papkasi: `IELTIX_platform/`

### 1. Backend Serverni ishga tushirish (Port 5000)
```powershell
cd IELTIX_platform\backend
npm run dev
```
*Backend API:* `http://localhost:5000`

### 2. Frontend Ilovani ishga tushirish (Port 5173)
```powershell
cd IELTIX_platform\frontend
npm run dev
```
*Frontend UI:* `http://localhost:5173`

---

## 🛠️ Arxitektura va Imkoniyatlar

### 💻 Frontend (`React 19 + TypeScript + Vite + Tailwind CSS`)
- **Dizayn va Ranglar**: Stitch'dagi barcha CSS tokenlar (`--surface`, `--primary`, `--secondary`, Foxy Orange `#FF7A00`) bilan Dark va Light mode to'liq ishlaydi.
- **Global Switcher**: 🌐 International (IELTS/CEFR) ↔ 🇺🇿 Local (Milliy BBM).
- **9 ta To'liq Modul**:
  1. `Dashboard & Hub`: IELTIX flagmani, 3D Foxy tezkor start, 4 ta ko'nikma bo'yicha band statistikasi.
  2. `3D Talking Foxy Speaking Arena`: Web Speech API orqali jonli mikrofon, audio to'lqinlar, Foxy'ning TTS ovozi va IELTS rubrikasi.
  3. `Reading Practice Lab & Vocab Vault`: Split-screen o'qish matni, matndan so'zni belgilab darhol ma'nosini ko'rish va shaxsiy lug'atga saqlash.
  4. `Writing Skills Lab`: Split-screen, rasmiy taymer, mavzular katalogi, model javoblar va AI ball berish.
  5. `Listening Module`: IELTS standartidagi audio pleyer, Section 1-4 savollari.
  6. `Score Report & QR Certificate`: IELTIX TRF sertifikati, QR kod, umumiy va alohida bandlar, chop etish (PDF/Print).
  7. `Pricing & VIP Checkout`: UZS paketlari (Free, Pro 99k UZS, Lifetime 249k UZS), Click / Payme / Telegram simulyatsiyasi.
  8. `Onboarding & Level Test`: Foxy bilan 3 bosqichli tanishuv va darajani aniqlash.
  9. `System Check`: Mikrofon, audio va ekran tekshiruvi.

### ⚙️ Backend (`Node.js + Express + TypeScript`)
- `GET /api/user/profile`: Profil, UZS balansi, faol rejim va statistika.
- `POST /api/user/balance/topup`: Balans to'ldirish (+25,000 UZS).
- `POST /api/speaking/evaluate`: Nutqni tahlil qilib Fluency, Lexical, Grammar, Pronunciation ballarini chiqarish.
- `POST /api/writing/evaluate`: Inshoni tahlil qilib Task Achievement, Coherence, Lexical, Grammar bo'yicha baholash.
- `GET /api/reading/test` & `POST /api/reading/submit`: IELTS testi va avtomatik tekshirish.
- `GET /api/vocab` & `POST /api/vocab/save`: Smart Vocab Vault lug'ati.
- `GET /api/reports/:id`: Rasmiy tasdiqlangan sertifikat ma'lumotlari.
