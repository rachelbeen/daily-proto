#!/usr/bin/env bash
# Run once from the project root to initialize git and push to GitHub.
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ ! -d .git ]]; then
  git init
  git branch -M main
fi

git add -A
git status

if ! git diff --cached --quiet; then
  git commit -m "Initial commit: daily-proto prompt generator

Daily prototyping prompts with 200 challenges, 200 public API sources,
web UI, CLI, and optional Slack/Discord delivery."
fi

echo ""
echo "Done. Push to GitHub:"
echo "  gh repo create daily-proto --public --source=. --push"
echo "  # or: git remote add origin git@github.com:YOU/daily-proto.git && git push -u origin main"
