#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "Stopping old servers on ports 3000, 3001, 3456, 4000..."
for port in 3000 3001 3456 4000; do
  lsof -ti ":$port" 2>/dev/null | xargs kill -9 2>/dev/null || true
done

echo "Building..."
npm run build

echo "Starting server on http://127.0.0.1:3000"
echo "Open Data Index → http://127.0.0.1:3000/open-data"
exec npm run serve
