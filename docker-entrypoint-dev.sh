#!/bin/sh

set -e

echo "🚀 Starting MetaMCP development services..."
echo "📁 Working directory: $(pwd)"
echo "🔍 Node version: $(node --version)"
echo "📦 pnpm version: $(pnpm --version)"

# Wait for Postgres if compose didn't already gate startup
if command -v pg_isready >/dev/null 2>&1; then
    echo "⏳ Checking PostgreSQL readiness..."
    until pg_isready -h "${POSTGRES_HOST:-postgres}" -p "${POSTGRES_PORT:-5432}" -U "${POSTGRES_USER:-metamcp_user}" >/dev/null 2>&1; do
        echo "🔁 PostgreSQL not ready yet, retrying in 2s..."
        sleep 2
    done
    echo "✅ PostgreSQL is ready"
else
    echo "ℹ️ pg_isready not found; relying on docker-compose healthcheck"
fi

# Function to cleanup on exit
cleanup_on_exit() {
    echo "🛑 SHUTDOWN: Received shutdown signal, cleaning up..."
    
    # Kill the pnpm dev process
    if [ -n "$PNPM_PID" ]; then
        kill -TERM "$PNPM_PID" 2>/dev/null || true
    fi
    
    # Kill any other background processes
    jobs -p | xargs -r kill 2>/dev/null || true
    
    echo "🛑 SHUTDOWN: Development services stopped"
    exit 0
}

# Setup cleanup trap
trap cleanup_on_exit TERM INT EXIT

echo "🔧 Setting up development environment..."

# Ensure dependencies are up to date
echo "📦 Checking dependencies..."
pnpm install

echo "🏗️ Building workspace packages..."
pnpm build

echo "🔍 Verifying zod-types build output:"\nls -R packages/zod-types/dist

# Run database migrations for development
echo "🛠 Running database migrations (dev)..."
(
    set -e
    cd apps/backend
    if pnpm exec drizzle-kit migrate; then
        echo "✅ Migrations applied successfully"
    else
        echo "❌ Migration failed"
        exit 1
    fi
)

# Start development servers
echo "🚀 Starting pnpm dev..."
pnpm dev &
PNPM_PID=$!

wait "$PNPM_PID" || true
