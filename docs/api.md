# MockLife REST API Shartnomasi (API Contract)

Hujjat: Frontend va Backend o'rtasidagi to'liq REST API shartnomasi.
Baza URL: `http://localhost:5000/api` (Production: `https://api.mocklife.uz/api`)

---

## 1. Autentifikatsiya (SMS OTP & Telefon orqali)

### 1.1. SMS kod so'rash
- **Metod:** `POST`
- **URL:** `/auth/phone`
- **Tavsif:** Foydalanuvchi telefon raqamiga tasdiqlovchi SMS kod yuborish.
- **So'rov (JSON):**
```json
{
  "phone": "+998901234567"
}
```
- **Muvaffaqiyatli javob (200 OK):**
```json
{
  "success": true,
  "message": "Tasdiqlash kodi telefoningizga SMS orqali yuborildi",
  "phone": "+998901234567",
  "debugCode": "1234"
}
```
- **Xato javobi (400 Bad Request):**
```json
{
  "success": false,
  "error": "Telefon raqam noto'g'ri kiritildi"
}
```

---

### 1.2. SMS kodni tekshirish va Kirish
- **Metod:** `POST`
- **URL:** `/auth/verify-otp`
- **Tavsif:** 4 xonali SMS kodni tekshirib, sessiya tokeni va profil ma'lumotlarini qaytarish.
- **So'rov (JSON):**
```json
{
  "phone": "+998901234567",
  "code": "1234"
}
```
- **Muvaffaqiyatli javob (200 OK):**
```json
{
  "success": true,
  "message": "Tizimga muvaffaqiyatli kirildi",
  "token": "jwt-mocklife-1791884683179",
  "user": {
    "id": "usr-901234567",
    "phone": "+998901234567",
    "name": "Foydalanuvchi (4567)",
    "isSubscribed": true,
    "subscriptionExpiresAt": "2026-11-12T15:00:00.000Z",
    "plan": "MONTHLY_29000"
  }
}
```
- **Xato javobi (400 / 401 Unauthorized):**
```json
{
  "success": false,
  "error": "Tasdiqlash kodi noto'g'ri"
}
```

---

### 1.3. Foydalanuvchi profili
- **Metod:** `GET`
- **URL:** `/user/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Muvaffaqiyatli javob (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "usr-901234567",
    "name": "Foydalanuvchi",
    "phone": "+998901234567",
    "isSubscribed": true,
    "subscriptionExpiresAt": "2026-11-12T15:00:00.000Z",
    "stats": {
      "testsCompleted": 14,
      "overallBand": 7.0,
      "studyStreakDays": 5
    }
  }
}
```

---

## 2. Obuna (Oylik 29 000 so'm)

### 2.1. Obuna tarifi ma'lumoti
- **Metod:** `GET`
- **URL:** `/subscription/plan`
- **Muvaffaqiyatli javob (200 OK):**
```json
{
  "success": true,
  "data": {
    "price": 29000,
    "currency": "so'm",
    "period": "oy",
    "planId": "mocklife_english_monthly",
    "features": [
      "Barcha ingliz tili mock testlariga cheksiz kirish",
      "Haqiqiy imtihon vaqtiga moslashtirilgan taymer",
      "Har bir savol bo'yicha batafsil izoh va tahlil",
      "Xatolar ustida ishlash bo'limi",
      "Shaxsiy ballar va o'sish statistikasi",
      "Telefonda va kompyuterda qulay ishlash"
    ]
  }
}
```

---

### 2.2. Obuna buyurtmasi yaratish (Click, Payme, Uzum)
- **Metod:** `POST`
- **URL:** `/subscription/create`
- **So'rov (JSON):**
```json
{
  "phone": "+998901234567",
  "provider": "Click",
  "amount": 29000
}
```
- **Muvaffaqiyatli javob (200 OK):**
```json
{
  "success": true,
  "message": "Obuna buyurtmasi yaratildi",
  "data": {
    "orderId": "ME-1791884683179",
    "phone": "+998901234567",
    "amount": 29000,
    "provider": "Click",
    "paymentUrl": "https://mock-payment.click.uz/pay/ME-1791884683179",
    "status": "PENDING_PAYMENT"
  }
}
```

---

### 2.3. To'lovni tasdiqlash (Simulyatsiya / Webhook)
- **Metod:** `POST`
- **URL:** `/subscription/confirm`
- **So'rov (JSON):**
```json
{
  "orderId": "ME-1791884683179"
}
```
- **Muvaffaqiyatli javob (200 OK):**
```json
{
  "success": true,
  "message": "Obuna muvaffaqiyatli faollashtirildi (30 kun)",
  "data": {
    "isSubscribed": true,
    "subscriptionExpiresAt": "2026-11-12T15:00:00.000Z"
  }
}
```

---

## 3. Mock Testlar va Test Sessiyalari

### 3.1. Testlar ro'yxatini olish
- **Metod:** `GET`
- **URL:** `/mock-tests`
- **Muvaffaqiyatli javob (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "title": "English Mock #1 — Full Test",
      "section": "Full Mock",
      "questionsCount": 40,
      "durationMinutes": 60,
      "level": "B2-C1",
      "isTrialAvailable": true,
      "completedPercent": 78
    },
    {
      "id": "2",
      "title": "English Reading Diagnostic",
      "section": "Reading",
      "questionsCount": 30,
      "durationMinutes": 45,
      "level": "B1-B2",
      "isTrialAvailable": true,
      "completedPercent": 100
    }
  ]
}
```

---

### 3.2. Test sessiyasini boshlash
- **Metod:** `POST`
- **URL:** `/tests/:id/start`
- **Tavsif:** Testni boshlash. Savollarning to'g'ri javoblari va izohlari bu bosqichda qaytarilmaydi! Agar foydalanuvchida obuna bo'lmasa, faqat `isTrial: true` bo'lgan tanishuv savollari ochiq.
- **So'rov (JSON):**
```json
{
  "userId": "usr-901234567",
  "isTrial": false
}
```
- **Muvaffaqiyatli javob (200 OK):**
```json
{
  "success": true,
  "data": {
    "sessionId": "sess-179188490011",
    "testId": "1",
    "title": "IELTS Academic Reading: Urban Biodiversity",
    "passageText": "As metropolitan areas worldwide expand...",
    "durationMinutes": 60,
    "startTime": "2026-10-13T14:30:00.000Z",
    "expiresAt": "2026-10-13T15:30:00.000Z",
    "isTrial": false,
    "questions": [
      {
        "id": 1,
        "type": "TRUE_FALSE_NOT_GIVEN",
        "prompt": "Wildlife adaptation occurs at a slower pace in urban centers...",
        "options": ["TRUE", "FALSE", "NOT GIVEN"]
      }
    ]
  }
}
```
- **Obuna yo'qligi xatosi (403 Forbidden):**
```json
{
  "success": false,
  "error": "Obuna talab qilinadi. Ushbu test to'liq rejimda ishlash uchun 29 000 so'm/oy obunasi talab qilinadi.",
  "code": "SUBSCRIPTION_REQUIRED",
  "trialAvailable": true
}
```

---

### 3.3. Test javobini avto-saqlash
- **Metod:** `POST`
- **URL:** `/tests/:id/save-answer`
- **So'rov (JSON):**
```json
{
  "sessionId": "sess-179188490011",
  "questionId": 1,
  "selectedAnswer": "FALSE"
}
```
- **Muvaffaqiyatli javob (200 OK):**
```json
{
  "success": true,
  "saved": true,
  "sessionId": "sess-179188490011",
  "questionId": 1
}
```

---

### 3.4. Testni tugatish va Natija hisoblash
- **Metod:** `POST`
- **URL:** `/tests/:id/finish`
- **Tavsif:** Testni yakunlash. To'g'ri javoblar, qoidalar bo'yicha batafsil izohlar va ballar aynan shu bosqichda beriladi.
- **So'rov (JSON):**
```json
{
  "sessionId": "sess-179188490011",
  "userAnswers": {
    "1": "FALSE",
    "2": "TRUE",
    "3": "To avoid the acoustic interference created by heavy morning traffic"
  }
}
```
- **Muvaffaqiyatli javob (200 OK):**
```json
{
  "success": true,
  "data": {
    "sessionId": "sess-179188490011",
    "totalQuestions": 4,
    "correctCount": 3,
    "percentage": 75,
    "estimatedBand": 7.5,
    "timeSpentMinutes": 18,
    "submittedAt": "2026-10-13T14:48:00.000Z",
    "details": [
      {
        "id": 1,
        "userAnswer": "FALSE",
        "correctAnswer": "FALSE",
        "isCorrect": true,
        "explanation": "Matnda shahar markazlari evolyutsiyani tezlashtirishi ta'kidlangan."
      }
    ]
  }
}
```

---

## 4. Statistika va Foydalanuvchi Progressi

### 4.1. Platforma umumiy statistikasi
- **Metod:** `GET`
- **URL:** `/stats`
- **Muvaffaqiyatli javob (200 OK):**
```json
{
  "success": true,
  "data": {
    "testsCompleted": "[N]+",
    "activeStudents": "[N]+",
    "availability": "24/7",
    "monthlyPrice": "29 000 UZS"
  }
}
```

---

### 4.2. Foydalanuvchi haftalik progressi
- **Metod:** `GET`
- **URL:** `/user/progress`
- **Muvaffaqiyatli javob (200 OK):**
```json
{
  "success": true,
  "data": {
    "weeklyStreak": ["D", "S", "CH", "P", "J"],
    "activeDaysCount": 5,
    "totalDaysInWeek": 7,
    "completedTestsCount": 14,
    "averageBand": 7.0
  }
}
```

---

## 5. Sharhlar va FAQ

### 5.1. Sharhlar
- **Metod:** `GET`
- **URL:** `/reviews`
- **Muvaffaqiyatli javob (200 OK):**
```json
{
  "success": true,
  "data": {
    "averageRating": 4.8,
    "totalCount": "[00 000]",
    "reviews": [
      {
        "id": "1",
        "author": "[Ism]",
        "city": "[Shahar]",
        "rating": 5,
        "scoreText": "BALL [0.0]",
        "text": "[PLACEHOLDER: O'quvchining sinov testlari va natijalari haqidagi haqiqiy sharhi]",
        "date": "[PLACEHOLDER]"
      }
    ]
  }
}
```

---

### 5.2. FAQ (Ko'p so'raladigan savollar)
- **Metod:** `GET`
- **URL:** `/faq?lang=uz|ru|en`
- **Muvaffaqiyatli javob (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "faq-1",
      "question": "Platformada qaysi fanlardan testlar mavjud?",
      "answer": "Platformamiz faqat ingliz tili fani bo'yicha ixtisoslashgan."
    }
  ]
}
```

---

## 6. Telegram Bot Admin Endpointlari (Web admin paneli yo'q)
Barcha so'rovlar maxsus sarlavha bilan himoyalanadi: `x-telegram-bot-secret: <ADMIN_BOT_SECRET>`

### 6.1. Bot statistikasi
- **Metod:** `GET`
- **URL:** `/admin/bot/stats`
- **Headers:** `x-telegram-bot-secret: mocklife_telegram_admin_bot_secret_998`
- **Muvaffaqiyatli javob (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalCandidates": 142,
    "activeSubscribers": 98,
    "totalTestsTaken": 640,
    "revenueTotalUZS": 2842000
  }
}
```

### 6.2. Foydalanuvchiga qo'lda obuna berish (Grant Subscription)
- **Metod:** `POST`
- **URL:** `/admin/bot/subscription/grant`
- **Headers:** `x-telegram-bot-secret: mocklife_telegram_admin_bot_secret_998`
- **So'rov (JSON):**
```json
{
  "phone": "+998901234567",
  "days": 30
}
```
- **Muvaffaqiyatli javob (200 OK):**
```json
{
  "success": true,
  "message": "+998901234567 raqamli foydalanuvchiga 30 kunlik obuna muvaffaqiyatli berildi",
  "expiresAt": "2026-11-12T15:00:00.000Z"
}
```

### 6.3. Yangi test yuklash
- **Metod:** `POST`
- **URL:** `/admin/bot/tests/upload`
- **Headers:** `x-telegram-bot-secret: mocklife_telegram_admin_bot_secret_998`
- **So'rov (JSON):**
```json
{
  "section": "Reading",
  "title": "IELTS Academic Reading Test #5",
  "questionsCount": 40,
  "durationMinutes": 60,
  "level": "B2-C1"
}
```
- **Muvaffaqiyatli javob (200 OK):**
```json
{
  "success": true,
  "message": "Yangi test bazaga muvaffaqiyatli qo'shildi",
  "testId": "test-179188550"
}
```

