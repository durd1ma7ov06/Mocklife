# MockLife — AWS Serverga Deploy Qilish Bo'yicha To'liq Qo'llanma (PostgreSQL + Docker + Nginx)

Ushbu qo'llanma **MockLife** platformasini Amazon Web Services (AWS) bulutli serverlariga xavfsiz, barqaror va yuqori unumdorlik bilan joylashtirish (deploy) uchun bosqichma-bosqich yo'riqnomadir.

---

## 1. Arxitektura Tuzilishi (AWS Production Architecture)

```
                            [ Foydalanuvchilar (Veb / Mobil) ]
                                            │
                                            ▼ (HTTPS / 443)
                         [ AWS Route 53 / Domen Provayderi ]
                                            │
                                            ▼
                    ┌───────────────────────────────────────────────┐
                    │               AWS EC2 Instansiyasi            │
                    │                                               │
                    │   ┌────────────────────────────────────────┐  │
                    │   │        Nginx Reverse Proxy & SSL       │  │
                    │   └───────────────────┬────────────────────┘  │
                    │                       │                       │
                    │       ┌───────────────┴───────────────┐       │
                    │       ▼                               ▼       │
                    │  [ Frontend SPA ]             [ Backend API ] │
                    │  (Port 80/Container)          (Port 5000)     │
                    └───────────────────────────────────────┬───────┘
                                                            │
                                                            ▼ (Port 5432 / SSL)
                                            ┌───────────────────────────────┐
                                            │      AWS RDS PostgreSQL       │
                                            │  (mocklife_db - Multi-AZ /    │
                                            │   Avtomatik zaxira nusxalar)  │
                                            └───────────────────────────────┘
```

---

## 2. 1-Qadam: AWS RDS PostgreSQL Bazani Yaratish

1. **AWS Management Console** ga kiring va **Amazon RDS** xizmatini oching.
2. **"Create database"** tugmasini bosing:
   - **Database creation method:** *Standard create*
   - **Engine type:** *PostgreSQL*
   - **Engine Version:** *PostgreSQL 16.x* (eng barqaror versiya)
   - **Templates:** *Free tier* (boshlanishiga) yoki *Production*
   - **DB instance identifier:** `mocklife-postgres`
   - **Master username:** `postgres` (yoki `mocklife_admin`)
   - **Master password:** Kuchli parol kiriting (masalan: `MockLife2026SecurePass!`)
3. **Connectivity (Ulanish):**
   - **Virtual Private Cloud (VPC):** Default VPC
   - **Public access:** Agar EC2 bilan bir xil VPC da bo'lsa **No** (tavsiya etiladi), yoki tashqaridan to'g'ridan-to'g'ri ulanish uchun **Yes**.
   - **VPC security group:** Yangi yarating yoki mavjudini tanlang. **Inbound rules** qismida **Port 5432** ochilganligiga ishonch hosil qiling.
4. **Additional configuration:**
   - **Initial database name:** `mocklife_db`
   - **Backup retention period:** 7 kun (avtomatik har kuni zaxiralanadi)
5. **Create database** tugmasini bosing. 5-10 daqiqadan so'ng sizga **Endpoint** beriladi (masalan: `mocklife-postgres.c123456789.us-east-1.rds.amazonaws.com`).

---

## 3. 2-Qadam: AWS EC2 Serverini Tayyorlash

1. **EC2 Instance yaratish:**
   - **OS:** Ubuntu Server 24.04 LTS yoki 22.04 LTS (64-bit x86)
   - **Instance type:** `t3.medium` (2 vCPU, 4GB RAM) yoki `t3.small`
   - **Storage:** 30 GB - 50 GB gp3 SSD
   - **Security Group (Xavfsizlik qoidalari):**
     - SSH (Port 22) — Faqat sizning IP manzilingiz
     - HTTP (Port 80) — 0.0.0.0/0 (Hamma uchun)
     - HTTPS (Port 443) — 0.0.0.0/0 (Hamma uchun)

2. **EC2 Serverga SSH orqali ulanish:**
   ```bash
   ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
   ```

3. **Docker va Docker Compose o'rnatish:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo apt install -y docker.io docker-compose git curl ufw

   # Docker huquqlarini joriy foydalanuvchiga berish:
   sudo usermod -aG docker $USER
   newgrp docker
   ```

---

## 4. 3-Qadam: Loyihani Serverga Ko'chirish va Sozlash

1. **Repozitoriyani yuklab oling:**
   ```bash
   git clone https://github.com/ittifoqurdu/Ieltix.git mocklife
   cd mocklife
   ```

2. **Backend `.env` faylini to'ldirish:**
   ```bash
   nano IELTIX_platform/backend/.env
   ```
   Quyidagi ma'lumotlarni kiriting:
   ```env
   PORT=5000
   NODE_ENV=production
   CORS_ORIGIN=https://mocklife.uz,http://YOUR_EC2_IP
   JWT_SECRET=super_kuchli_maxfiy_jwt_kalit_2026_aws
   ADMIN_BOT_SECRET=mocklife_telegram_admin_bot_secret_998

   # AWS RDS PostgreSQL ulanish manzili:
   DATABASE_URL=postgresql://postgres:MockLife2026SecurePass!@mocklife-postgres.c123456789.us-east-1.rds.amazonaws.com:5432/mocklife_db
   DB_SSL=true
   ```

3. **Docker Compose orqali tizimni bir bosishda ishga tushirish:**
   ```bash
   docker-compose up -d --build
   ```

4. **Konteynerlar holatini tekshirish:**
   ```bash
   docker-compose ps
   docker-compose logs -f backend
   ```
   Logda quyidagilar ko'rinadi:
   ```
   🚀 MockLife Backend running at http://localhost:5000
   🔄 Checking PostgreSQL database connection...
   ✅ PostgreSQL connected successfully (AWS / RDS / Local Pool ready)!
   ✅ PostgreSQL schema and indexes verified / migrated successfully.
   ```

---

## 5. 4-Qadam: SSL Sertifikat (HTTPS) va Domen Ulash

1. **Domen DNS sozlamasi:**
   Domen boshqaruv panelingizda (Route 53, Cloudflare yoki boshqa):
   - `A` yozuvini EC2 serveringizning **Public IP** siga yo'naltiring (masalan: `mocklife.uz` -> `13.51.x.x`).

2. **Certbot (Let's Encrypt) orqali bepul SSL olish:**
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d mocklife.uz -d www.mocklife.uz
   ```

---

## 6. Foydali Buyruqlar (Cheat Sheet)

* **Serverni to'xtatish:** `docker-compose down`
* **Qayta ishga tushirish:** `docker-compose restart`
* **Kodni yangilash (Git pull dan keyin):**
  ```bash
  git pull origin main
  docker-compose up -d --build
  ```
* **PostgreSQL bazasini qo'lda zaxiralash (Dump):**
  ```bash
  pg_dump -h mocklife-postgres.c123456789.us-east-1.rds.amazonaws.com -U postgres -d mocklife_db -F c -b -v -f mocklife_backup_$(date +%F).dump
  ```
