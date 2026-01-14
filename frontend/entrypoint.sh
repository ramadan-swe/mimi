#!/bin/sh
set -e

echo "📦 Checking npm dependencies..."

# Always run npm install to ensure dependencies are up to date
# This is fast when nothing has changed due to npm's caching
npm install

echo "✅ Dependencies ready"

# Execute the main command
exec "$@"
