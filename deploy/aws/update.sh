#!/bin/bash
# ==============================================================================
# IELTIX Platform - Fast Update Script (AWS)
# ==============================================================================

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/../.." &> /dev/null && pwd )"
cd "$PROJECT_ROOT"

echo "🔄 Eng so'nggi yangilanishlar yuklanmoqda (git pull)..."
git pull origin main || true

echo "🚀 Konteynerlar yangilanmoqda va qayta yig'ilmoqda..."
docker compose -f "$SCRIPT_DIR/docker-compose.aws.yml" up -d --build

echo "✅ IELTIX muvaffaqiyatli yangilandi!"
docker compose -f "$SCRIPT_DIR/docker-compose.aws.yml" ps
