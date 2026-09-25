#!/bin/bash
# ==============================================================================
# IELTIX - Production Linux Server Deployment Script
# Supports: Ubuntu 20.04/22.04/24.04, Debian 11/12
# ==============================================================================

set -e

echo "================================================================="
echo "   🚀 IELTIX Platform - Production Server Deployment"
echo "================================================================="

# 1. Check Root Privileges
if [ "$EUID" -ne 0 ]; then
  echo "⚠️ Iltimos, ushbu skriptni root yoki sudo bilan ishga tushiring: sudo bash deploy.sh"
  exit 1
fi

# 2. Install Docker & Docker Compose if missing
if ! command -v docker &> /dev/null; then
    echo "[1/4] Docker o'rnatilmoqda..."
    apt-get update -y
    apt-get install -y ca-certificates curl gnupg lsb-release
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi

# 3. Pull latest Git updates if repository exists
if [ -d ".git" ]; then
    echo "[2/4] Eng so'nggi versiyalar yuklab olinmoqda (git pull)..."
    git pull origin main
fi

# 4. Navigate to IELTIX_platform
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR/IELTIX_platform"

# 5. Build and Launch Containers
echo "[3/4] Docker konteynerlari yig'ilmoqda va ishga tushirilmoqda..."
docker compose down || true
docker compose up -d --build

# 6. Verify Deployment Health
echo "[4/4] Server holati tekshirilmoqda..."
sleep 5

HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/health || true)

echo "================================================================="
if [ "$HEALTH_CHECK" == "200" ]; then
    echo "  ✅ IELTIX PLATFORMASI MUVAFFAQIYATLI ISHGA TUSHDI!"
    echo "  🌐 Veb-sayt: http://$(curl -s ifconfig.me || echo 'SERVER_IP')"
    echo "  🔌 API: http://$(curl -s ifconfig.me || echo 'SERVER_IP')/api"
    echo "  🗄️ Database: PostgreSQL 16 (ieltix_db) faol"
else
    echo "  ⚠️ Konteynerlar ishga tushdi, lekin healthcheck javob bermadi."
    echo "  Konteynerlar loglarini ko'rish uchun: docker compose logs -f"
fi
echo "================================================================="
