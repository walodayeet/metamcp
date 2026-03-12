#!/bin/sh
set -e

echo "🚀 Starting MetaMCP development services..."

# Function to cleanup on exit
cleanup() {
    echo "🛑 SHUTDOWN: Cleaning up..."
    kill 0
}
trap cleanup TERM INT EXIT

echo "📦 Installing dependencies..."
pnpm install

echo "🏗️ Building workspace packages..."
pnpm build

echo "🛠 Running migrations..."
(cd apps/backend && pnpm exec drizzle-kit migrate)

echo "🚀 Starting pnpm dev..."
pnpm dev
