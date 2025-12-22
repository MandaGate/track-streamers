#!/bin/sh
set -e

echo "[entrypoint] Waiting for database and applying migrations..."
# DATABASE_URL must be set via environment (docker-compose)
# Use migrate deploy (idempotent) for production-like environments
npx prisma migrate deploy --schema=./prisma/schema.prisma

# Optionally generate client at runtime (usually already done at build)
# npx prisma generate --schema=./prisma/schema.prisma

echo "[entrypoint] Starting server..."
exec node server.js
