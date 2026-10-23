# 🚀 IELTIX Platformasini AWS (EC2 / Lightsail) Serveriga Mukammal O'rnatish Qo'llanmasi

Ushbu qo'llanma **IELTIX** ekotizimini (Telegram Bot, FastAPI Core API, React/Vite Web Platforma, PostgreSQL 16, Redis 7, Nginx va Mukammal O'zbek/Ingliz Neyron Ovozli AI) AWS serveriga noldan professional darajada o'rnatish bo'yicha to'liq bosqichma-bosqich ko'rsatmadir.

---

## 📑 Mundarija
1. [Tavsiya etiladigan AWS Server parametrlari](#1-tavsiya-etiladigan-aws-server-parametrlari)
2. [1-Qadam: AWS EC2 instansiyasini yaratish](#2-1-qadam-aws-ec2-instansiyasini-yaratish)
3. [2-Qadam: Xavfsizlik guruhlari (Security Groups / Portlar)](#3-2-qadam-xavfsizlik-guruhlari-security-groups--portlar)
4. [3-Qadam: Serverga SSH orqali ulanish](#4-3-qadam-serverga-ssh-orqali-ulanish)
5. [4-Qadam: Birgina buyruq bilan avtomatik o'rnatish](#5-4-qadam-birgina-buyruq-bilan-avtomatik-ornatish)
6. [5-Qadam: Muhit o'zgaruvchilari (.env.bot)](#6-5-qadam-muhit-ozgaruvchilari-envbot)
7. [6-Qadam: Domen va Bepul SSL (HTTPS) ulash](#7-6-qadam-domen-va-bepul-ssl-https-ulash)
8. [7-Qadam: Bot va Tizim monitoringi (Loglar)](#8-7-qadam-bot-va-tizim-monitoringi-loglar)
9. [8-Qadam: Yangilanishlarni kiritish (Update)](#9-8-qadam-yangilanishlarni-kiritish-update)

---

## 1. Tavsiya etiladigan AWS Server parametrlari

IELTIX AI platformasi ovozli signallarni (Groq Whisper) tahlil qilish, neyron nutq (Edge-TTS) yaratish va Web platformani yuqori tezlikda uzatish uchun quyidagi resurslarni talab qiladi:

* **Variant A (Eng tavsiya etiladigani — AWS EC2):**
  * **Instance type:** `t3.small` (2 vCPU, 2 GB RAM) yoki `t3.medium` (2 vCPU, 4 GB RAM)
  * **OS:** `Ubuntu 22.04 LTS` yoki `Ubuntu 24.04 LTS` (64-bit x86)
  * **Storage (EBS):** 20 GB — 30 GB gp3 SSD
* **Variant B (Iqtisodiy va oson — AWS Lightsail):**
  * 2 GB RAM, 2 vCPUs, 60 GB SSD ($10/oylik reja)

---

## 2. 1-Qadam: AWS EC2 instansiyasini yaratish

1. **AWS Console** ga kiring: [https://console.aws.amazon.com/ec2](https://console.aws.amazon.com/ec2).
2. O'zingizga yaqin regionni tanlang (masalan, `eu-central-1` Frankfurt yoki `ap-south-1` Mumbay).
3. **Launch Instance** tugmasini bosing:
   * **Name:** `IELTIX-Production-Server`
   * **AMI (OS):** `Ubuntu Server 22.04 LTS (HVM), SSD Volume Type`
   * **Instance Type:** `t3.small` (yoki `t3.medium`)
   * **Key pair (login):** Yangi `.pem` kalit yarating va kompyuteringizga yuklab oling (masalan, `ieltix-key.pem`).

---

## 3. 2-Qadam: Xavfsizlik guruhlari (Security Groups / Portlar)

**Network Settings** bo'limida quyidagi kirish (Inbound Rules) portlarini oching:

| Type | Port Range | Source | Izoh |
| :--- | :--- | :--- | :--- |
| **SSH** | `22` | My IP yoki `0.0.0.0/0` | Serverga terminaldan kirish |
| **HTTP** | `80` | `0.0.0.0/0` | Web platforma va Certbot SSL uchun |
| **HTTPS** | `443` | `0.0.0.0/0` | Xavfsiz shifrlangan SSL ulanish |

> 📌 **Muhim:** PostgreSQL (`5432`) va Redis (`6379`) tashqi internet uchun **ochilmaydi**! Ular Docker ichki tarmog'ida xavfsiz ishlaydi.

---

## 4. 3-Qadam: Serverga SSH orqali ulanish

Kompyuteringizdagi terminal (PowerShell, Bash yoki Git Bash) orqali:

```bash
# Kalitga to'g'ri huquq berish (Linux/Mac da)
chmod 400 ieltix-key.pem

# Serverga ulanish (SERVER_IP o'rniga o'zingizning Elastic IP yoki Public IP ni yozing)
ssh -i "ieltix-key.pem" ubuntu@<SERVER_IP>
```

---

## 5. 4-Qadam: Birgina buyruq bilan avtomatik o'rnatish

Serverga ulangach, loyihani yuklab oling va tayyor avtomatik o'rnatish skriptini ishga tushiring:

```bash
# 1. Loyihani GitHub dan yuklab olish
git clone https://github.com/ittifoqurdu/Ieltix.git /home/ubuntu/Ieltix
cd /home/ubuntu/Ieltix

# 2. Avtomatlashtirilgan AWS skriptini ishga tushirish
sudo bash deploy/aws/setup_ec2.sh
```

**Ushbu skript avtomatik tarzda:**
1. Ubuntu tizim paketlarini yangilaydi.
2. Docker CE va Docker Compose ni o'rnatadi.
3. Ovozli fayllarni qayta ishlash uchun `ffmpeg` drayverlarini sozlaydi.
4. Xavfsizlik devori (UFW: 22, 80, 443) ni yoqadi.
5. Barcha konteynerlarni (PostgreSQL 16, Redis 7, FastAPI Core API, Telegram Bot, Web Platforma, Nginx) yig'ib ishga tushiradi!

---

## 6. 5-Qadam: Muhit o'zgaruvchilari (.env.bot)

Serverdagi loyiha papkasida `.env.bot` faylini tahrirlang:

```bash
nano .env.bot
```

Fayl ichidagi kalitlarni to'liq tekshiring:
```env
SERVICE_NAME=ieltix-core
APP_ENV=production

# Telegram Bot Tokeningiz (@BotFather bergan token)
BOT_TOKEN=8484839595:AAxxxxxxxxx
BOT_USERNAME=MockLife_bot

# Bosh Admin Telegram ID
ADMIN_TELEGRAM_IDS=6956456422

# AI Kalitlar (Groq & Gemini)
GROQ_API_KEY=gsk_your_groq_api_key_here
GEMINI_API_KEY=AIzaSy...

# Ovozli Sintez (Mukammal O'zbek va Britaniya Examiner)
TTS_VOICE_UZ=uz-UZ-MadinaNeural
TTS_VOICE_EN=en-GB-RyanNeural

# Tariflar
TELEGRAM_STARS_PRICE=249
TELEGRAM_STARS_WEEKLY_PRICE=49
SUBSCRIPTION_UZS_PRICE=59000

# Server Manzillari
PUBLIC_BASE_URL=http://<SERVER_IP>
WEB_APP_URL=http://<SERVER_IP>
```

O'zgarishlarni saqlash uchun: `Ctrl + O`, `Enter` va chiqish uchun `Ctrl + X`.

Konteynerlarni yangi kalitlar bilan qayta ishga tushirish:
```bash
sudo bash deploy/aws/update.sh
```

---

## 7. 6-Qadam: Domen va Bepul SSL (HTTPS) ulash

Telegram Web App va xavfsiz to'lovlar uchun domen va SSL (HTTPS) talab etiladi.

1. Domeningiz (masalan `ieltix.uz` yoki `mocklife.uz`) DNS sozlamalariga kiring va **A Record** qo'shing:
   * **Host:** `@` yoki `app`
   * **Points to (Value):** Serveringizning AWS Public IP manzili
2. Serverda Certbot orqali bepul Let's Encrypt SSL sertifikatini oling:

```bash
# Certbot o'rnatish
sudo apt-get install -y certbot

# Sertifikat olish (o'z domeningizni yozing)
sudo certbot certonly --webroot -w /home/ubuntu/Ieltix/deploy/aws/certbot/www -d app.ieltix.uz
```

---

## 8. 7-Qadam: Bot va Tizim monitoringi (Loglar)

Har qanday vaqtda konteynerlar qanday ishlayotganini jonli kuzatishingiz mumkin:

* **Barcha konteynerlar holati:**
  ```bash
  docker compose -f deploy/aws/docker-compose.aws.yml ps
  ```

* **Telegram Bot loglarini jonli kuzatish:**
  ```bash
  docker compose -f deploy/aws/docker-compose.aws.yml logs -f bot
  ```

* **FastAPI Core API loglarini kuzatish:**
  ```bash
  docker compose -f deploy/aws/docker-compose.aws.yml logs -f core-api
  ```

* **Ma'lumotlar bazasi (PostgreSQL) loglari:**
  ```bash
  docker compose -f deploy/aws/docker-compose.aws.yml logs -f postgres
  ```

* **Serverni to'xtatish yoki qayta ishga tushirish:**
  ```bash
  # To'xtatish
  docker compose -f deploy/aws/docker-compose.aws.yml down

  # Qayta yoqish
  docker compose -f deploy/aws/docker-compose.aws.yml up -d
  ```

---

## 9. 8-Qadam: Yangilanishlarni kiritish (Update)

Kelgusida kodga yangi o'zgarishlar kiritilganda serverni bir soniyada yangilash uchun:

```bash
cd /home/ubuntu/Ieltix
sudo bash deploy/aws/update.sh
```

Bu buyruq avtomatik tarzda eng so'nggi kodni tortadi, qayta kompilyatsiya qiladi va ma'lumotlar bazasini saqlagan holda tizimni yangilaydi!

---

## 🌟 Tizimning Muhim Xususiyatlari

1. **Bilingual Ovozli Texnologiya:**
   * Foydalanuvchiga maslahat va tahlil sof o'zbek tilida `uz-UZ-MadinaNeural` tomonidan taqdim etiladi.
   * IELTS savollari esa haqiqiy Britaniya imtihonchisi talaffuzi bilan `en-GB-RyanNeural` orqali yangraydi.
2. **Multi-Key Failover:**
   * Bir nechta Groq va Gemini kalitlari navbat bilan ishlaydi; bitta kalit tugasa yoki cheklansa, tizim avtomatik keyingisiga o'tadi.
3. **AWS Crash-Proof (Qulashdan himoyalangan):**
   * Barcha konteynerlarda `restart: always` yoqilgan. Server o'chib yonsa ham, barcha xizmatlar avtomatik ishga tushadi.
