#!/bin/sh
set -e

echo "🚀 Starting MetaMCP development services..."

# Wait for Postgres
if command -v pg_isready >/dev/null 2>&1; then
    until pg_isready -h "${POSTGRES_HOST:-postgres}" -p "${POSTGRES_PORT:-5432}" -U "${POSTGRES_USER:-metamcp_user}" >/dev/null 2>&1; do
        sleep 1
    done
fi

# Cleanup on exit
trap "kill 0" EXIT

echo "📦 Installing dependencies..."
pnpm install

echo "🏗️ Building workspace packages..."
pnpm build

echo "🔍 Verifying build outputs:"
ls -l packages/zod-types/dist/index.d.ts || echo "❌ zod-types types missing"
ls -l packages/trpc/dist/index.js || echo "❌ trpc build failed"

# Run migrations
echo "🛠 Migrating database..."
(cd apps/backend && pnpm exec drizzle-kit migrate)

# Start dev
echo "🚀 Starting dev servers..."
pnpm dev
