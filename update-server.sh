#!/bin/bash
# ==============================================================
# SantehPro - Чистый и легкий скрипт обновления для TimeWeb
# Не дублирует файлы, не создает вложенных папок, удаляет мусор
# ==============================================================

set -e

# 1. Определение рабочей папки приложения
APP_DIR=""
for dir in "/var/www/santehpro" "$HOME/santehpro" "/root/santehpro" "$(pwd)"; do
  if [ -f "$dir/package.json" ]; then
    APP_DIR="$dir"
    break
  fi
done

if [ -z "$APP_DIR" ]; then
  echo " Ошибка: папка с проектом СантехПро не найдена."
  exit 1
fi

cd "$APP_DIR"
echo " Рабочая папка: $APP_DIR"

# 2. Удаление временных тяжелых архивов и логов (чтобы не забивать диск TimeWeb)
rm -f *.tar.gz *.zip public/*.tar.gz dist/*.tar.gz npm-debug.log* yarn-error.log* 2>/dev/null || true

# 3. Генерация официальных 2D иконок приложения
if [ -f "scripts/generate-png-icons.mjs" ]; then
  echo " Генерация иконок приложения..."
  node scripts/generate-png-icons.mjs
fi

# 4. Чистая сборка проекта
echo " Сборка проекта (npm run build)..."
npm run build

# 5. Очистка старых логов PM2, чтобы не забивать память сервера
pm2 flush 2>/dev/null || true

# 6. Бесшовный перезапуск существующего процесса (без создания дублей процессов)
echo " Перезапуск службы СантехПро..."
if command -v pm2 >/dev/null 2>&1; then
  pm2 reload santehpro 2>/dev/null || pm2 restart santehpro 2>/dev/null || pm2 restart all
elif command -v systemctl >/dev/null 2>&1; then
  systemctl restart santehpro 2>/dev/null || true
fi

echo "=========================================================="
echo " СантехПро успешно обновлен! Сервер работает чисто и легко."
echo "=========================================================="
