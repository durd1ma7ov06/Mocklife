#!/bin/bash
# ==============================================================================
# MockLife Platform - Safe Fast Update Script (AWS)
# ==============================================================================

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/../.." &> /dev/null && pwd )"
cd "$PROJECT_ROOT"

echo "🔄 Eng so'nggi yangilanishlar yuklanmoqda (git pull)..."
git pull origin main || true

echo "🧹 Disk xotirasi tozalanmoqda..."
docker builder prune -a -f > /dev/null 2>&1 || true

# Agar foydalanuvchi --build yoki -b argumentini bersa, konteynerlarni ketma-ket yig'adi
if [ "$1" == "--build" ] || [ "$1" == "-b" ]; then
    echo "🏗 Frontend ketma-ket qayta yig'ilmoqda..."
    docker compose -f "$SCRIPT_DIR/docker-compose.aws.yml" build frontend
    docker builder prune -a -f > /dev/null 2>&1 || true

    echo "🏗 Backend ketma-ket qayta yig'ilmoqda..."
    docker compose -f "$SCRIPT_DIR/docker-compose.aws.yml" build backend
    docker builder prune -a -f > /dev/null 2>&1 || true
fi

echo "🚀 Konteynerlar yangilanmoqda..."
docker compose -f "$SCRIPT_DIR/docker-compose.aws.yml" up -d

echo "🔄 Bot va Core-API yangi kod bilan qayta ishga tushirilmoqda..."
docker compose -f "$SCRIPT_DIR/docker-compose.aws.yml" restart bot core-api

echo "✅ MockLife muvaffaqiyatli yangilandi!"
docker compose -f "$SCRIPT_DIR/docker-compose.aws.yml" ps
