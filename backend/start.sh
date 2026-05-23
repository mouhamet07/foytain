#!/bin/sh
set -e

echo "[start] NODE_ENV=$NODE_ENV"
echo "[start] PORT=${PORT:-3001}"

# Validate DATABASE_URL is present before attempting migration
if [ -z "$DATABASE_URL" ]; then
  echo "[start] ERROR: DATABASE_URL is not set. Aborting."
  exit 1
fi

echo "[start] Running database migrations..."
node_modules/.bin/prisma migrate deploy
echo "[start] Migrations OK"

echo "[start] Launching application..."
exec node dist/main.js
