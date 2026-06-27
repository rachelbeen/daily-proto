#!/usr/bin/env bash
# Publish daily-proto to GitHub under the account you choose via `gh auth login`.
set -euo pipefail
cd "$(dirname "$0")/.."

if ! command -v gh >/dev/null 2>&1; then
  echo "Install GitHub CLI first: brew install gh"
  exit 1
fi

echo "=== Active GitHub account (used for repo create/push) ==="
gh auth status || true
echo ""
echo "Login: $(gh api user -q .login 2>/dev/null || echo 'not logged in')"
echo ""
read -r -p "Publish to this account? [y/N] " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
  echo "Run: gh auth switch   (or: gh auth login)"
  exit 1
fi

# Fix broken bare .git from earlier failed init
if [[ -d .git ]]; then
  if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    :
  else
    echo "Removing invalid .git (bare / incomplete)..."
    rm -rf .git
  fi
fi

if [[ ! -d .git ]]; then
  git init
  git branch -M main
fi

git add -A
if ! git diff --cached --quiet; then
  git commit -m "$(cat <<'EOF'
Initial commit: daily-proto prompt generator

Daily prototyping prompts with 200 challenges, 200 public API sources,
web UI, CLI, and optional Slack/Discord delivery.
EOF
)"
fi

REPO_NAME="${1:-daily-proto}"
LOGIN="$(gh api user -q .login)"
if gh repo view "${LOGIN}/${REPO_NAME}" >/dev/null 2>&1; then
  echo "Repo already exists: https://github.com/${LOGIN}/${REPO_NAME}"
  git remote add origin "git@github.com:${LOGIN}/${REPO_NAME}.git" 2>/dev/null || git remote set-url origin "git@github.com:${LOGIN}/${REPO_NAME}.git"
else
  gh repo create "$REPO_NAME" --public --source=. --remote=origin --push
  echo "Created: https://github.com/${LOGIN}/${REPO_NAME}"
  exit 0
fi

git push -u origin main
echo "Pushed: https://github.com/${LOGIN}/${REPO_NAME}"
