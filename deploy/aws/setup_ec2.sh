#!/bin/bash
# ==============================================================================
# MockLife Platform - AWS EC2 / Lightsail Automated Setup & Deployment Script
# Supported OS: Ubuntu 22.04 LTS, Ubuntu 24.04 LTS, Debian 12
# ==============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}===================================================================${NC}"
echo -e "${BLUE}   🚀 MOCKLIFE PLATFORM - AWS EC2 / LIGHTSAIL SETUP & DEPLOYMENT   ${NC}"
echo -e "${BLUE}===================================================================${NC}"

# 1. Root check
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}⚠️ Iltimos, skriptni root yoki sudo bilan ishga tushiring: sudo bash setup_ec2.sh${NC}"
  exit 1
fi

# 2. Update System Packages
echo -e "${YELLOW}[1/6] Tizim yangilanmoqda (apt update)...${NC}"
apt-get update -y
apt-get install -y ca-certificates curl gnupg lsb-release ufw git htop ffmpeg
apt-get clean
rm -rf /var/lib/apt/lists/*

# 3. Install Docker & Docker Compose if missing
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}[2/6] Docker va Docker Compose o'rnatilmoqda...${NC}"
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    apt-get clean
    rm -rf /var/lib/apt/lists/*
    systemctl enable docker
    systemctl start docker
    echo -e "${GREEN}✅ Docker muvaffaqiyatli o'rnatildi.${NC}"
else
    echo -e "${GREEN}✅ Docker allaqachon mavjud.${NC}"
fi

# 4. Configure Firewall (UFW)
echo -e "${YELLOW}[3/6] UFW xavfsizlik devori sozlanmoqda (Port 22, 80, 443)...${NC}"
ufw allow 22/tcp || true
ufw allow 80/tcp || true
ufw allow 443/tcp || true
echo "y" | ufw enable || true
echo -e "${GREEN}✅ Portlar 22, 80, 443 ochiq va himoyalangan.${NC}"

# 5. Locate project directory and check environment
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/../.." &> /dev/null && pwd )"
cd "$PROJECT_ROOT"

echo -e "${YELLOW}[4/6] Loyiha katalogi tekshirilmoqda: $PROJECT_ROOT${NC}"

if [ ! -f ".env.bot" ]; then
    if [ -f ".env.bot.example" ]; then
        echo -e "${YELLOW}ℹ️ .env.bot topilmadi. .env.bot.example dan nusxalanmoqda...${NC}"
        cp .env.bot.example .env.bot
        echo -e "${YELLOW}⚠️ Iltimos, .env.bot faylidagi BOT_TOKEN, GROQ_API_KEY va boshqa kalitlarni to'ldiring!${NC}"
    fi
fi

# 6. Build and launch all containers sequentially to optimize disk usage
echo -e "${YELLOW}[5/6] Docker keshini tozalash va konteynerlarni ketma-ket yig'ish (Disk tejash)...${NC}"
docker builder prune -f || true
docker compose -f "$SCRIPT_DIR/docker-compose.aws.yml" down || true

echo -e "${BLUE}-> Tashqi bazaviy imijlar yuklanmoqda (postgres, redis, nginx)...${NC}"
docker compose -f "$SCRIPT_DIR/docker-compose.aws.yml" pull postgres redis nginx

echo -e "${BLUE}-> Frontend yig'ilmoqda...${NC}"
docker compose -f "$SCRIPT_DIR/docker-compose.aws.yml" build frontend
docker builder prune -f || true

echo -e "${BLUE}-> Backend yig'ilmoqda...${NC}"
docker compose -f "$SCRIPT_DIR/docker-compose.aws.yml" build backend
docker builder prune -f || true

echo -e "${BLUE}-> Core-API yig'ilmoqda...${NC}"
docker compose -f "$SCRIPT_DIR/docker-compose.aws.yml" build core-api

echo -e "${BLUE}-> Telegram Bot yig'ilmoqda...${NC}"
docker compose -f "$SCRIPT_DIR/docker-compose.aws.yml" build bot

echo -e "${GREEN}-> Barcha konteynerlar ishga tushirilmoqda...${NC}"
docker compose -f "$SCRIPT_DIR/docker-compose.aws.yml" up -d

# 7. Verification and status
echo -e "${YELLOW}[6/6] Server holati tekshirilmoqda...${NC}"
sleep 7

PUBLIC_IP=$(curl -s ifconfig.me || curl -s icanhazip.com || echo "SERVER_IP")

echo -e "${BLUE}===================================================================${NC}"
echo -e "${GREEN}   🎉 MOCKLIFE PLATFORMASI AWS SERVERIDA ISHGA TUSHDI!             ${NC}"
echo -e "${BLUE}===================================================================${NC}"
echo -e "  🌐 Web Platforma:       ${GREEN}http://$PUBLIC_IP${NC}"
echo -e "  🔌 FastAPI Swagger:     ${GREEN}http://$PUBLIC_IP/docs${NC}"
echo -e "  🤖 Telegram Bot:        ${GREEN}Faol (Polling rejimida ishlamoqda)${NC}"
echo -e "  🗣 Ovozli Aloqa (TTS):  ${GREEN}uz-UZ-MadinaNeural + British Examiner faol${NC}"
echo -e "  🗄️ PostgreSQL Database: ${GREEN}Docker tarmog'ida xavfsiz holatda${NC}"
echo -e "${BLUE}-------------------------------------------------------------------${NC}"
echo -e "  📋 Konteynerlar holati:"
docker compose -f "$SCRIPT_DIR/docker-compose.aws.yml" ps
echo -e "${BLUE}-------------------------------------------------------------------${NC}"
echo -e "  💡 Bot loglarini kuzatish:  docker compose -f deploy/aws/docker-compose.aws.yml logs -f bot"
echo -e "  💡 API loglarini kuzatish:  docker compose -f deploy/aws/docker-compose.aws.yml logs -f core-api"
echo -e "${BLUE}===================================================================${NC}"
