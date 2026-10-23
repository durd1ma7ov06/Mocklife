#!/bin/bash
# ==============================================================================
# MockLife Platform - Automated Free SSL & Domain Setup Script
# Bepul rasmiy Let's Encrypt SSL (HTTPS) va Domen ulash skripti (ngroksiz)
# ==============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}===================================================================${NC}"
echo -e "${BLUE}   🔒 MOCKLIFE - BEPUL SSL (HTTPS) VA NGROKSIZ DOMEN SOZLASH       ${NC}"
echo -e "${BLUE}===================================================================${NC}"

if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}⚠️ Iltimos, ushbu skriptni sudo bilan ishga tushiring:${NC}"
  echo -e "   sudo bash deploy/aws/setup_ssl.sh [ixtiyoriy_domeningiz.uz]"
  exit 1
fi

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/../.." &> /dev/null && pwd )"
cd "$PROJECT_ROOT"

# 1. Domenni aniqlash
TARGET_DOMAIN="$1"
if [ -z "$TARGET_DOMAIN" ]; then
    echo -e "${YELLOW}Domen ko'rsatilmadi. AWS tashqi IP manzili aniqlanmoqda...${NC}"
    PUBLIC_IP=$(curl -s ifconfig.me || curl -s icanhazip.com || echo "77.113.199.137")
    TARGET_DOMAIN="${PUBLIC_IP//./-}.sslip.io"
    echo -e "${GREEN}✅ Bepul avtomatik sslip.io domeni tanlandi: $TARGET_DOMAIN${NC}"
else
    echo -e "${GREEN}✅ Siz kiritgan shaxsiy domen: $TARGET_DOMAIN${NC}"
fi

# 2. Kerakli jildlarni yaratish
echo -e "${YELLOW}📁 Certbot jildlari tayyorlanmoqda...${NC}"
mkdir -p "$SCRIPT_DIR/certbot/conf/live/mocklife"
mkdir -p "$SCRIPT_DIR/certbot/www"
mkdir -p "$SCRIPT_DIR/certbot/work"
mkdir -p "$SCRIPT_DIR/certbot/logs"

# 3. Bootstrap SSL: Nginx birinchi startda qulamasligi uchun vaqtinchalik self-signed sertifikat
if [ ! -f "$SCRIPT_DIR/certbot/conf/live/mocklife/fullchain.pem" ]; then
    echo -e "${YELLOW}🔑 Nginx yuklanishi uchun boshlang'ich xavfsizlik sertifikati yaratilmoqda...${NC}"
    openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
      -keyout "$SCRIPT_DIR/certbot/conf/live/mocklife/privkey.pem" \
      -out "$SCRIPT_DIR/certbot/conf/live/mocklife/fullchain.pem" \
      -subj "/CN=$TARGET_DOMAIN" > /dev/null 2>&1
fi

# 4. Nginx ni ishga tushirish (port 80 va 443)
echo -e "${YELLOW}🌐 Nginx xizmati ishga tushirilmoqda...${NC}"
docker compose -f "$SCRIPT_DIR/docker-compose.aws.yml" up -d nginx

# 5. Certbot dasturini tekshirish yoki o'rnatish
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}📦 Serverga Certbot o'rnatilmoqda...${NC}"
    apt-get update -y > /dev/null 2>&1
    apt-get install -y certbot > /dev/null 2>&1
fi

# 6. Let's Encrypt rasmiy bepul SSL sertifikatini olish (HTTP-01 ACME challenge)
echo -e "${YELLOW}🔐 Let's Encrypt rasmiy bepul SSL sertifikati olinmoqda ($TARGET_DOMAIN)...${NC}"
certbot certonly --webroot \
  -w "$SCRIPT_DIR/certbot/www" \
  --config-dir "$SCRIPT_DIR/certbot/conf" \
  --work-dir "$SCRIPT_DIR/certbot/work" \
  --logs-dir "$SCRIPT_DIR/certbot/logs" \
  -d "$TARGET_DOMAIN" \
  --agree-tos \
  --register-unsafely-without-email \
  --non-interactive \
  --force-renewal || {
    echo -e "${YELLOW}Admin email bilan qayta urinilmoqda...${NC}"
    certbot certonly --webroot \
      -w "$SCRIPT_DIR/certbot/www" \
      --config-dir "$SCRIPT_DIR/certbot/conf" \
      --work-dir "$SCRIPT_DIR/certbot/work" \
      --logs-dir "$SCRIPT_DIR/certbot/logs" \
      -d "$TARGET_DOMAIN" \
      --agree-tos \
      -m "admin@mocklife.uz" \
      --non-interactive \
      --force-renewal
}

# 7. Sertifikatlarni Nginx o'qiydigan mocklife profiliga nusxalash
if [ -d "$SCRIPT_DIR/certbot/conf/live/$TARGET_DOMAIN" ]; then
    echo -e "${GREEN}✅ Rasmiy SSL sertifikati olindi va faollashtirilmoqda...${NC}"
    cp -f "$SCRIPT_DIR/certbot/conf/live/$TARGET_DOMAIN/fullchain.pem" "$SCRIPT_DIR/certbot/conf/live/mocklife/fullchain.pem"
    cp -f "$SCRIPT_DIR/certbot/conf/live/$TARGET_DOMAIN/privkey.pem" "$SCRIPT_DIR/certbot/conf/live/mocklife/privkey.pem"
else
    echo -e "${RED}⚠️ Sertifikat fayllari topilmadi. Avvalgi xavfsizlik fayllari bilan davom etilmoqda.${NC}"
fi

# 8. Nginx ni qayta yuklash
echo -e "${YELLOW}🔄 Nginx yangi SSL sertifikati bilan yangilanmoqda...${NC}"
docker compose -f "$SCRIPT_DIR/docker-compose.aws.yml" exec nginx nginx -s reload || true

# 9. .env.bot konfiguratsiyasini doimiy HTTPS manzil bilan yangilash (ngrok o'rniga)
echo -e "${YELLOW}⚙️ .env.bot konfiguratsiyasi yangilanmoqda...${NC}"
if [ -f ".env.bot" ]; then
    sed -i "s|^WEB_APP_URL=.*|WEB_APP_URL=https://$TARGET_DOMAIN|g" .env.bot
    sed -i "s|^PUBLIC_BASE_URL=.*|PUBLIC_BASE_URL=https://$TARGET_DOMAIN|g" .env.bot
    echo -e "${GREEN}✅ .env.bot faylida WEB_APP_URL=https://$TARGET_DOMAIN ga o'rnatildi.${NC}"
fi

# 10. Bot va Core-API ni yangi manzil bilan qayta yuklash
echo -e "${YELLOW}🤖 Bot va API konteynerlari qayta yuklanmoqda...${NC}"
docker compose -f "$SCRIPT_DIR/docker-compose.aws.yml" up -d bot core-api

echo -e "${BLUE}===================================================================${NC}"
echo -e "${GREEN}   🎉 MOCKLIFE TELEGRAM MINI APP NGROKSIZ MUVOFAQIYATLI SOZLANDI! ${NC}"
echo -e "${BLUE}===================================================================${NC}"
echo -e "  🌐 Rasmiy HTTPS Manzil:   ${GREEN}https://$TARGET_DOMAIN${NC}"
echo -e "  📱 Telegram Mini App:     ${GREEN}Telefon va kompyuterda doimiy ishlaydi (ngroksiz)${NC}"
echo -e "  🔒 SSL Sertifikati:       ${GREEN}Let's Encrypt (100% bepul va rasmiy)${NC}"
echo -e "  🔌 API Swagger:           ${GREEN}https://$TARGET_DOMAIN/docs${NC}"
echo -e "${BLUE}===================================================================${NC}"
