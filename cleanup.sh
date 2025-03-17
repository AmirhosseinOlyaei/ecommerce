#!/bin/bash
# cleanup.sh - Script to clean up build artifacts and reinstall dependencies

echo "🧹 Starting cleanup process..."

echo "📦 Removing dependencies..."
rm -rf node_modules
rm -f pnpm-lock.yaml

echo "🏗️  Removing build artifacts..."
rm -rf .next
rm -f tsconfig.tsbuildinfo
rm -rf .vercel

echo "🗑️  Cleaning caches..."
pnpm store prune
find . -name '.DS_Store' -delete
rm -rf .vscode/.cache 2>/dev/null

echo "✅ Cleanup completed!"

echo "📥 Reinstalling dependencies..."
pnpm install

echo "🚀 All done! Your project is fresh and clean." 