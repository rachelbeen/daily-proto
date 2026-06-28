#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "Stopping old servers on ports 3000, 3001, 3456..."
for port in 3000 3001 3456; do
  lsof -ti ":$port" 2>/dev/null | xargs kill -9 2>/dev/null || true
done

echo "Building..."
npm run build

echo "Starting server on http://localhost:3000/pitbull"
exec npm run serve
