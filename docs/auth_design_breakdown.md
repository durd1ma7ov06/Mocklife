# Kirish va Ro'yxatdan O'tish (Auth) Ekranlari — Dizayn Tahlili

Ushbu hujjat `dizayn me/kirish royxatdan otish/` va `dizayn me/` papkalaridagi referens materiallar asosida **MockLife** platformasining kirish, ro'yxatdan o'tish, parolni tiklash va OTP tasdiqlash ekranlarining piksel darajasidagi texnik tahlilidir.

---

## 1. Referens Materiallar Tahlili

`dizayn me/kirish royxatdan otish/` papkasidagi 19 ta skrinshot va `dizayn me/Mock Test Landing.html` asosida:
- Referens GoPrep platformasining onboarding-quiz oqimidan olingan (savol kartalari, taraqqiyot ko'rsatkichi, email olish va narx sahifalari).
- Bosh sahifa (`dizayn me/Mock Test Landing.html`) premium qaymoqrang-qizil uslubda (`#fdf6e9` fon, `#ef3b2d` urg'u, `#10152b` to'q ko'k matn, `border-radius: 24px-28px`, `Unbounded` va `Nunito` shriftlari) shakllantirilgan.
- **Xulosa va qaror:** Kirish va Ro'yxatdan o'tish ekrani bosh sahifaning premium brend tili bilan 100% uyg'unlashishi, desktopda zamonaviy 2 ustunli karta (chap tomon: MockLife afzalliklari va ijtimoiy isbot, o'ng tomon: forma), mobilda esa to'liq moslashuvchan (bottom-sheet yoki qulay mobil karta) bo'lishi lozim.

---

## 2. Ekranlar va Ularning Tuzilishi

### Ekran 1: Kirish (Login)
- **Maqsad:** Mavjud foydalanuvchilarning telefon raqam yoki email orqali (parol yoki SMS OTP yordamida) tizimga kirishi.
- **Joylashuv:** 
  - Desktop (1440px): 2 ustunli modal/sahifa (umumiy kenglik 860px, balandlik avto, markazlashgan).
  - Planshet (768px): Markaziy karta (kenglik 520px).
  - Mobil (375px): To'liq kenglik (100% width, min-h-screen yoki bottom-sheet, p-4).
- **Elementlar ro'yxati:**
  1. **Yuqori brending:** MockLife logotipi (qizil va qora nuqtalar + "MockLife" logotipi).
  2. **Yopish tugmasi:** Dumaloq tugma (36x36px, `hover:bg-[#f3ead6]`, `X` ikonka).
  3. **Rejim almashtirgich (Tab/Toggle):** "Kirish" va "Ro'yxatdan o'tish" tablari (border-radius: 9999px, kulrang-och qaymoqrang fon, faol tab oq fon va soya).
  4. **Kirish usuli almashtirgich:** "SMS Kod (Tezkor)" yoki "Parol orqali" selektori.
  5. **Maydonlar:**
     - Telefon / Email kiritish maydoni (+998 prefiksi yoki to'liq kiritish).
     - Parol maydoni (agar parol usuli tanlansa, ko'zcha - show/hide ikonkasi bilan).
  6. **Havolalar:** "Parolni unutdingizmi?" (kichik matn, `#ef3b2d`, o'ngga surilgan).
  7. **Asosiy CTA tugmasi:** "KIRISH" yoki "SMS KOD OLISH" (to'liq kenglik, balandlik 52px, qizil, oq matn, o'ng strelka).
  8. **Ijtimoiy tarmoqlar ajratgichi:** "Yoki quyidagilar orqali" (chiziqlar o'rtasida matn).
  9. **Ijtimoiy kirish tugmalari:** Google va Telegram orqali bitta bosishda kirish tugmalari.
  10. **Xavfsizlik eslatmasi:** Qulf/qalqon ikonka + "Shaxsiy ma'lumotlar shifrlangan va himoyalangan".

---

### Ekran 2: Ro'yxatdan O'tish (Register)
- **Maqsad:** Yangi foydalanuvchining ism, telefon raqam va parol bilan ro'yxatdan o'tishi hamda boshlang'ich bonus/sinov testiga yo'naltirilishi.
- **Elementlar ro'yxati:**
  1. **Tab/Toggle:** Faol "Ro'yxatdan o'tish" holati.
  2. **Sarlavha:** "MockLife ga xush kelibsiz!" (`Unbounded`, 20px, bold).
  3. **Yordamchi matn:** "Bepul sinov testini yechish va natijangizni bilish uchun hisob oching".
  4. **Maydonlar:**
     - **Ism va familiya:** matn maydoni (User ikonka bilan).
     - **Telefon raqami:** telefon maydoni (Phone ikonka, `+998` prefiksi).
     - **Parol:** parol maydoni (Lock ikonka, ko'zcha bilan).
     - **Parol kuchi ko'rsatkichi:** 4 ta indikator chizig'i (zaif, o'rtacha, kuchli).
  5. **Foydalanish shartlari roziligi:** Checkbox + "Foydalanish shartlari va Maxfiylik siyosatiga roziman".
  6. **Asosiy CTA tugmasi:** "RO'YXATDAN O'TISH" (52px, qizil gradient, oq matn).
  7. **Ijtimoiy kirish:** Google / Telegram tezkor ro'yxatdan o'tish.

---

### Ekran 3: OTP Tasdiqlash (SMS Tasdiqlash)
- **Maqsad:** Telefon raqamiga yuborilgan 4 xonali SMS kodni kiritish.
- **Elementlar ro'yxati:**
  1. **Orqaga qaytish:** "← Raqamni o'zgartirish" havolasi.
  2. **Ikonka:** Dumaloq doira (56x56px, och qizil fon `#fde3dc`, xabar/telefon belgisi).
  3. **Sarlavha:** "Tasdiqlash kodi" (20px, Unbounded).
  4. **Yordamchi matn:** "+998 90 123 45 67 raqamiga 4 xonali SMS kod yuborildi".
  5. **OTP katakchalari:** 4 ta alohida kvadrat katakcha (har biri 54x60px, markazlashgan raqam, `font-bold text-2xl`, auto-tab, paste qo'llab-quvvatlash).
  6. **Taymer & Qayta yuborish:** "Kodni qayta yuborish (00:59)" → vaqt tugagach "Kodni qayta yuborish" havolasi.
  7. **Sinov kodi ko'rsatkichi (Demo banner):** "Demo kodi: 1234" (test rejimida qulay bo'lishi uchun).
  8. **Asosiy CTA:** "TASDIQLASH VA KIRISH".

---

### Ekran 4: Parolni Tiklash (Forgot Password)
- **Maqsad:** Parolini unutgan foydalanuvchining telefon/email orqali kod qabul qilib yangi parol o'rnatishi.
- **Qadamlar:**
  - 1-qadam: Telefon raqamini kiritish → Kod yuborish.
  - 2-qadam: 4 xonali OTP kodni kiritish.
  - 3-qadam: Yangi parol va parolni takrorlash → Saqlash va kirish.

---

## 3. O'lchamlar va Oraliqlar (Spacings & Radii)

| Parametr | Qiymat (px / rem) | Izoh |
|---|---|---|
| **Karta maksimal kengligi** | Desktop: 860px (2 ustunli) / 440px (1 ustunli) | Ekran markazida qulay o'qilishi uchun |
| **Karta ichki padding** | 32px (Desktop) / 20px (Mobil) | `p-6 sm:p-8` |
| **Border Radius (Karta)** | 28px (`rounded-[28px]`) | Bosh sahifa kartalari bilan bir xil |
| **Border Radius (Input)** | 9999px (`rounded-full`) yoki 16px (`rounded-2xl`) | Elegant tabletka ko'rinishi |
| **Border Radius (Tugmalar)** | 9999px (`rounded-full`) | `Hero` va `Pricing` tugmalari bilan mos |
| **Input balandligi** | 50px - 52px | Mobil teginish uchun optimal (min 48px) |
| **Tugma balandligi** | 52px | Asosiy harakat tugmasi |
| **Elementlar oralig'i (gap)** | 16px - 20px (`space-y-4` yoki `space-y-5`) | Balanslashgan ritm |
| **OTP katakcha o'lchami** | 52px kenglik x 60px balandlik | Har bir raqam uchun qulay joy |
| **Soya (Box Shadow)** | `0 20px 40px -15px rgba(16, 21, 43, 0.15)` | Chuqur va yengil premium soya |

---

## 4. Ranglar Palitrasi (Hex)

| Qo'llanilishi | Rang nomi | Hex kodi | Ishlatilishi |
|---|---|---|---|
| **Asosiy fon** | Cream Light | `#fdf6e9` | Modal orqa foni, taglik |
| **Karta foni** | Pure White | `#ffffff` | Asosiy forma kartasi |
| **Ikkinchi darajali fon** | Cream Muted | `#faf4e7` | Chap banner foni, input foni |
| **Bosh matn** | Navy Deep | `#10152b` | Sarlavhalar, asosiy matn |
| **Yordamchi matn** | Navy Muted | `#4a5068` | Tavsiflar, tushuntirishlar |
| **Platseholder / Chegara** | Sand / Warm Gray | `#eadfc9` | Input va kartalar chegarasi |
| **Yordamchi chegara** | Navy Light | `#7a7f95` | Neytral ikonkalar |
| **Asosiy urg'u (CTA)** | Coral Red | `#ef3b2d` | Tugmalar, faol tab, xato |
| **CTA Hover** | Coral Dark | `#d62f22` | Tugma bosilganda |
| **CTA Och fon** | Coral Pale | `#fde3dc` | Ikonkalar orqa foni, faol indikator |
| **Muvaffaqiyat (Success)** | Forest Emerald | `#12935a` | Xavfsizlik belgisi, validatsiya |
| **Xato holati** | Coral Alert | `#ef3b2d` | Xato xabarlari, noto'g'ri chegara |

---

## 5. Tipografiya Qoidalari

- **Sarlavhalar (H1, H2, H3):** `font-family: 'Unbounded', sans-serif`, `font-weight: 800` (Extrabold), `letter-spacing: -0.02em`.
- **Matn va Form elementlari:** `font-family: 'Nunito', sans-serif`, `font-weight: 600 - 700` (Bold).
- **Sarlavha o'lchami:** 22px - 26px (Desktop) / 18px - 20px (Mobil).
- **Yordamchi matn:** 13px - 14px (`text-xs` / `text-sm`).
- **Input label:** 12px (`text-xs`), `font-weight: 700`, uppercase yoki titlecase.
- **Input matni:** 15px, `font-weight: 600`, rang `#10152b`.
- **OTP raqamlari:** 24px (`text-2xl`), `font-family: 'Unbounded'`, `font-weight: 800`.
- **CTA tugma matni:** 14px, `font-weight: 800`, uppercase, `letter-spacing: 0.05em`.

---

## 6. Holatlar (States) va Validatsiya Xatti-harakati

1. **Bo'sh holat (Default):**
   - Chegara: `1px solid #eadfc9`
   - Fon: `#fdf6e9` ning 50% shaffofligi yoki `#ffffff`
   - Matn: placeholder `#7a7f95`

2. **Fokus holati (Focus):**
   - Chegara: `2px solid #ef3b2d`
   - Soya / Ring: `0 0 0 3px rgba(239, 59, 45, 0.12)`
   - O'zgarish silliqligi: `transition: all 0.2s ease`

3. **To'g'ri to'ldirilgan (Valid):**
   - Yashil tasdiqlash belgisi (Check) maydonning o'ng chetida chiqadi.
   - Chegara: `#12935a` (Emerald).

4. **Xato holati (Error):**
   - Chegara: `1.5px solid #ef3b2d`
   - Fon: `#fef2f2` (engil qizil)
   - Input ostida kichik qizil matn: aniq xato sababi (masalan: *"Telefon raqami to'liq kiritilishi kerak (+998 90 123 45 67)"* yoki *"Parol kamida 6 ta belgidan iborat bo'lsin"*).
   - Silkinish animatsiyasi (`shake` animation) noto'g'ri urinishda.

5. **Yuklanish holati (Loading):**
   - Tugma ichida matn o'rniga aylanuvchi spinner (`animate-spin`).
   - Tugma `disabled` holatga o'tadi va bosish bloklanadi (`opacity: 0.75`).

6. **Muvaffaqiyat (Success):**
   - Yashil xabar / toast chiqadi, avtomatik ravishda modal yopiladi va bosh sahifada foydalanuvchi tizimga kirgan holatga o'tadi.

---

## 7. Xulosa va Keyingi Qadamlar

Ushbu spetsifikatsiya asosida:
1. `AuthContext` — global autentifikatsiya holati, token saqlash, kirish/chiqish funksiyalari yaratiladi.
2. Modulli komponentlar (`AuthLayout`, `AuthCard`, `PhoneOrEmailInput`, `PasswordInput`, `OtpInput`, `SocialAuthButtons`, `AuthSubmitButton`) yaratiladi.
3. 3 ta til (UZ / RU / EN) `LanguageContext` ga to'liq qo'shiladi.
4. Backend API endpointlari (`/auth/register`, `/auth/login`, `/auth/phone`, `/auth/verify-otp`, `/auth/reset-password`) to'liq ulanadi.
5. Navbar bilan integratsiya: tizimga kirgan foydalanuvchining ismi, darajasi va chiqish tugmasi aks ettiriladi.

