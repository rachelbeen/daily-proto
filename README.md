# daily-proto

Daily prototyping prompts powered by **public APIs and real data sources** — built to nudge your team into shipping small, data-backed experiments.

Everyone gets the **same prompt on the same day** (deterministic by date). Remix freely.

## Quick start

```bash
cd ~/Projects/daily-proto
npm install
npm run today
npm run serve   # open http://localhost:3000
```

The web page shows today's prompt in big type with links to the **API docs** and a **Try the data** button that opens the starter endpoint.

## Commands

| Command | What it does |
|---------|----------------|
| `npm run today` | Print today's prompt (markdown) |
| `npm run generate` | Same as `today` |
| `npm run dev -- preview --days 7` | Preview the next week |
| `npm run dev -- generate --date 2026-06-22` | Prompt for a specific date |
| `npm run dev -- generate --json` | Machine-readable output |
| `npm run post` | Post to configured Slack/Discord webhooks |

## Slack & Discord setup

1. Copy `.env.example` to `.env`
2. Add your webhook URL(s):
   - **Slack:** [Incoming Webhooks](https://api.slack.com/messaging/webhooks) → create app → add webhook to a channel
   - **Discord:** Server Settings → Integrations → Webhooks → New Webhook

```bash
cp .env.example .env
# edit .env, then:
npm run post
```

Post to one channel only:

```bash
npm run dev -- post --slack
npm run dev -- post --discord
```

## Automated daily delivery (GitHub Actions)

The included workflow (`.github/workflows/daily.yml`) posts on **weekdays at 14:00 UTC**.

Add these repository secrets:

- `SLACK_WEBHOOK_URL`
- `DISCORD_WEBHOOK_URL` (optional)

You can also trigger it manually from the Actions tab.

## What's in a prompt?

Each daily prompt combines:

1. **Data source** — a curated public API (weather, art, transit, health, biodiversity, …)
2. **Challenge** — a concrete prototyping brief ("build a dashboard", "sketch an alert", …)
3. **Constraint** — a creative limit (2-hour timebox, mobile-first, no backend, …)
4. **Twist** — a small extra that pushes polish or clarity
5. **Starter endpoint** — a working URL to fetch real data immediately

## Catalog size

| Pool | Count |
|------|-------|
| Prompts | **200** |
| Data sources | **200** |
| Paired combos | **50** |

Regenerate the catalog after editing seed data:

```bash
npm run seed
npm run build
```

Seed files live in `scripts/extra-apis.mjs` (APIs) and `scripts/seed-catalog.mjs` (generator). Output is written to `src/data/catalog/*.json`.

## Adding to the catalog

**Prompts** — edit archetypes in `scripts/seed-catalog.mjs`, then `npm run seed`.

**Data sources** — add rows to `scripts/extra-apis.mjs` in the format:
`[name, category, docsUrl, auth, exampleEndpoint, ...tags]`

**Combos** — edit curated pairs in `scripts/seed-catalog.mjs`, or let the generator pair sources by shared tags.

**Constraints & twists** — still in `src/data/templates.ts`.

## How the daily seed works

Prompts are derived from a hash of `YYYY-MM-DD`. Same date → same API + challenge + constraint + twist, everywhere.

Override for testing:

```bash
PROMPT_DATE=2026-01-15 npm run today
```

## Host on GitHub

```bash
cd ~/Projects/daily-proto
git init
git add .
git commit -m "Initial commit: daily-proto prompt generator"
gh repo create daily-proto --public --source=. --push
```

Or create a repo on GitHub manually, then:

```bash
git remote add origin git@github.com:YOUR_USER/daily-proto.git
git branch -M main
git push -u origin main
```

## Deploy the web app

Works on any Node host (Railway, Render, Fly.io, a VPS, etc.):

| Setting | Value |
|---------|--------|
| Build | `npm install && npm run build` |
| Start | `npm start` |
| Port | Uses `PORT` env var (default `3000`) |

Optional: add `SLACK_WEBHOOK_URL` and `DISCORD_WEBHOOK_URL` as secrets for the GitHub Action in `.github/workflows/daily.yml`.

## License

MIT — use it, fork it, remix it for your team.
