#!/bin/bash
set -e

# ==============================================================================
# Скрипт быстрого обновления «СантехПро» на сервере TimeWeb Cloud
# ==============================================================================

echo "========================================================"
echo "🚀 Начало обновления СантехПро на TimeWeb Cloud VPS..."
echo "========================================================"

# Определение рабочей папки проекта
APP_DIR=""
if [ -f "./package.json" ]; then
  APP_DIR="$(pwd)"
elif [ -d "/var/www/santehpro" ]; then
  APP_DIR="/var/www/santehpro"
elif [ -d "/root/santehpro" ]; then
  APP_DIR="/root/santehpro"
elif [ -d "/home/santehpro" ]; then
  APP_DIR="/home/santehpro"
else
  APP_DIR="$(pwd)"
fi

echo "📁 Рабочая директория: $APP_DIR"
cd "$APP_DIR"

# 1. Резервная копия базы данных и настроек
if [ -d ".data" ]; then
  BACKUP_TIME=$(date +%Y%m%d_%H%M%S)
  echo "💾 Создание резервной копии .data в backup_data_${BACKUP_TIME}.tar.gz..."
  tar -czf "backup_data_${BACKUP_TIME}.tar.gz" .data 2>/dev/null || true
fi

# 2. Скачивание актуального архива из AI Studio
ARCHIVE_URL="https://ais-pre-vbfbydsstiiuauzkz6m4cv-781140790971.europe-west2.run.app/santehpro-deploy.tar.gz"
echo "📥 Загрузка свежего билда с новыми функциями..."
curl -f -L -o santehpro-deploy.tar.gz "$ARCHIVE_URL"

# 3. Распаковка архива
echo "📦 Распаковка файлов проекта и собранного dist..."
tar -xzf santehpro-deploy.tar.gz

# 4. Проверка и установка зависимостей при необходимости
if [ -f "package.json" ]; then
  echo "🔧 Проверка зависимостей npm..."
  npm install --omit=dev --no-audit --no-fund 2>/dev/null || npm install --no-audit --no-fund 2>/dev/null || true
fi

# 5. Очистка временного архива
rm -f santehpro-deploy.tar.gz

# 6. Перезапуск Node.js процесса через PM2 или systemd
echo "🔄 Перезапуск приложения..."
if command -v pm2 &> /dev/null; then
  pm2 reload all || pm2 restart all || pm2 restart santehpro || pm2 start dist/server.cjs --name santehpro
  pm2 save
elif systemctl list-units --full -all | grep -Fq "santehpro.service"; then
  systemctl restart santehpro
else
  echo "⚠️ PM2 или systemd сервис не найден. Запустите: npm run start или node dist/server.cjs"
fi

# 7. Очистка кэша Nginx (если настроен)
if [ -d "/var/cache/nginx" ]; then
  rm -rf /var/cache/nginx/* 2>/dev/null || true
  systemctl reload nginx 2>/dev/null || true
fi

echo "========================================================"
echo "✅ ОБНОВЛЕНИЕ УСПЕШНО ЗАВЕРШЕНО!"
echo "🌐 Проверьте сайт: https://santehpro.info"
echo "📱 На телефоне обновите страницу (свайп вниз)"
echo "========================================================"
