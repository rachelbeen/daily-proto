#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo ""
echo "=============================================="
echo "  Daily Proto — starting web server"
echo "=============================================="
echo ""

for port in 3000 3001 3456 4000; do
  lsof -ti ":$port" 2>/dev/null | xargs kill -9 2>/dev/null || true
done

echo "Building (first time may take ~20 seconds)..."
npm run build

echo ""
echo "  Daily Prompt:    http://127.0.0.1:3000/"
echo "  Open Data Index: http://127.0.0.1:3000/open-data"
echo ""
echo "  >>> Keep this Terminal window OPEN while you browse <<<"
echo "  >>> Closing it stops the site <<<"
echo ""

if command -v open >/dev/null 2>&1; then
  open "http://127.0.0.1:3000/"
fi

exec npm start
