import type { DailyPrompt, DataSource } from "../types.js";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatDisplayDate(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00Z`);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatSourceDetail(source: DataSource): string {
  return source.description;
}

function sourceDataPath(source: DataSource): string {
  return `/api/data/${encodeURIComponent(source.id)}`;
}

function renderSourceCard(source: DataSource): string {
  const dataPath = sourceDataPath(source);

  return `
      <article class="source-card">
        <h2 class="source-title">${escapeHtml(source.name)} · ${escapeHtml(source.category)}</h2>
        <p class="source-desc">${escapeHtml(formatSourceDetail(source))}</p>
        <div class="cta-row">
          <a class="cta cta-primary" href="${escapeHtml(dataPath)}" target="_blank" rel="noopener noreferrer">
            Use the data -&gt;
          </a>
          <a class="cta cta-secondary" href="${escapeHtml(source.docsUrl)}" target="_blank" rel="noopener noreferrer">
            API docs
          </a>
        </div>
      </article>`;
}

export function renderHeadline(prompt: DailyPrompt): string {
  return prompt.challenge.prompt;
}

export function renderSourceLabel(prompt: DailyPrompt): string {
  return prompt.dataSources.length > 1 ? "Today's data sources" : "Today's data source";
}

export function renderSourceContent(prompt: DailyPrompt): string {
  const sourceCards = prompt.dataSources.map(renderSourceCard).join("");
  return `<div class="source-cards">${sourceCards}</div>`;
}

export function renderPromptPayload(prompt: DailyPrompt) {
  const panelMode = prompt.dataSources.length === 1 ? "single" : "multi";

  return {
    ...prompt,
    displayDate: formatDisplayDate(prompt.date),
    headline: renderHeadline(prompt),
    sourceLabel: renderSourceLabel(prompt),
    panelMode,
    html: {
      headline: escapeHtml(renderHeadline(prompt)),
      sourceContent: renderSourceContent(prompt),
    },
  };
}

const pageStyles = `
    :root {
      --mint: #c8f0dc;
      --mint-chip: #b3e4c8;
      --mint-chip-text: #065f46;
      --neon-yellow: #e6fa3d;
      --ink: #1a1a1a;
      --muted: #666666;
      --white: #ffffff;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      min-height: 100vh;
      font-family: "Outfit", ui-sans-serif, system-ui, sans-serif;
      color: var(--ink);
      background: var(--white);
    }

    .shell {
      display: flex;
      height: 100vh;
      min-height: 100vh;
      overflow: hidden;
    }

    .prompt-panel {
      flex: 968 1 1;
      min-width: 0;
      background: var(--mint);
      padding: 80px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 40px;
    }

    .headline-block {
      display: flex;
      flex-direction: column;
      gap: 40px;
      max-width: 782px;
    }

    .chip-row {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
    }

    .neon-chip,
    .mint-chip {
      display: inline-block;
      width: fit-content;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      padding: 8px 16px;
      border-radius: 100px;
      line-height: 1.2;
    }

    .neon-chip {
      background: var(--neon-yellow);
      color: var(--ink);
    }

    .mint-chip {
      background: var(--mint-chip);
      color: var(--mint-chip-text);
      border: none;
      cursor: pointer;
      font-family: inherit;
      transition: opacity 120ms ease;
    }

    .mint-chip:hover { opacity: 0.85; }

    h1 {
      margin: 0;
      font-size: clamp(2.25rem, 5vw, 72px);
      font-weight: 800;
      line-height: 1.1;
      letter-spacing: -1.44px;
      word-break: break-word;
    }

    .source-panel {
      flex: 472 0 0;
      width: 32.8%;
      background: var(--white);
      padding: 80px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-height: 0;
      overflow: hidden;
    }

    .source-panel--single .data-source-block {
      justify-content: center;
    }

    .data-source-block {
      display: flex;
      flex-direction: column;
      gap: 28px;
      width: 100%;
    }

    .source-chip-row {
      margin-bottom: 0;
    }

    .source-cards {
      display: flex;
      flex-direction: column;
      gap: 0;
      width: 100%;
    }

    .source-panel--multi .source-cards {
      gap: 24px;
    }

    .source-label {
      margin: 0;
    }

    .source-card {
      display: flex;
      flex-direction: column;
      gap: 18px;
      padding-bottom: 24px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    }

    .source-panel--multi .source-card {
      padding-bottom: 0;
      border-bottom: none;
    }

    .source-panel--multi .source-card + .source-card {
      padding-top: 24px;
      border-top: 1.5px solid rgba(0, 0, 0, 0.12);
    }

    .source-card:last-child {
      padding-bottom: 0;
      border-bottom: none;
    }

    .source-title {
      margin: 0;
      font-size: 30px;
      font-weight: 800;
      line-height: 1.25;
      color: #000000;
    }

    .source-desc {
      margin: 0;
      font-size: 19px;
      font-weight: 500;
      line-height: 1.55;
      color: var(--ink);
    }

    .cta-row {
      display: flex;
      flex-direction: column;
      gap: 10px;
      width: 100%;
    }

    .cta {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      padding: 12px 18px;
      border-radius: 14px;
      font-size: 14px;
      font-weight: 800;
      line-height: 1.45;
      text-decoration: none;
      transition: opacity 120ms ease;
      white-space: nowrap;
    }

    .cta:hover { opacity: 0.88; }

    .cta-primary {
      background: var(--ink);
      color: var(--white);
    }

    .cta-secondary {
      background: var(--white);
      color: var(--ink);
      border: 1.5px solid var(--ink);
    }

    @media (max-width: 960px) {
      .shell {
        flex-direction: column;
        height: auto;
        min-height: 100vh;
        overflow: auto;
      }

      .prompt-panel,
      .source-panel {
        flex: none;
        width: auto;
        padding: clamp(2rem, 6vw, 80px);
        overflow: visible;
      }

      h1 {
        letter-spacing: -0.04em;
      }

      .headline-block {
        max-width: none;
      }
    }`;

function clientScript(prompt: DailyPrompt): string {
  return `
    const state = {
      date: ${JSON.stringify(prompt.date)},
      promptSeed: ${prompt.promptSeed},
      sourceSeed: ${prompt.sourceSeed},
    };

    function randomSeed() {
      return Math.floor(Math.random() * 2 ** 32);
    }

    function updateUrl() {
      const params = new URLSearchParams();
      params.set("date", state.date);
      params.set("promptSeed", String(state.promptSeed));
      params.set("sourceSeed", String(state.sourceSeed));
      history.replaceState(null, "", "?" + params.toString());
    }

    function applyPromptOnly(data) {
      document.getElementById("prompt-heading").textContent = data.headline;
      state.promptSeed = data.promptSeed;
      updateUrl();
    }

    function applySourcesOnly(data) {
      const panel = document.getElementById("source-panel");
      panel.className = "source-panel source-panel--" + data.panelMode;
      document.getElementById("source-heading").textContent = data.sourceLabel;
      document.getElementById("source-content").innerHTML = data.html.sourceContent;
      state.sourceSeed = data.sourceSeed;
      updateUrl();
    }

    async function fetchPrompt() {
      const params = new URLSearchParams({
        date: state.date,
        promptSeed: String(state.promptSeed),
        sourceSeed: String(state.sourceSeed),
      });
      const response = await fetch("/api/prompt.json?" + params.toString());
      if (!response.ok) throw new Error("Failed to refresh");
      return response.json();
    }

    document.getElementById("refresh-prompt").addEventListener("click", async () => {
      state.promptSeed = randomSeed();
      const data = await fetchPrompt();
      applyPromptOnly(data);
    });

    document.getElementById("refresh-sources").addEventListener("click", async () => {
      state.sourceSeed = randomSeed();
      const data = await fetchPrompt();
      applySourcesOnly(data);
    });

    updateUrl();
  `;
}

export function renderPromptPage(prompt: DailyPrompt): string {
  const displayDate = formatDisplayDate(prompt.date);
  const headline = renderHeadline(prompt);
  const sourceLabel = renderSourceLabel(prompt);
  const panelMode = prompt.dataSources.length === 1 ? "single" : "multi";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Daily Proto Inspo — ${escapeHtml(displayDate)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;800&display=swap" rel="stylesheet" />
  <style>${pageStyles}</style>
</head>
<body>
  <div class="shell">
    <section class="prompt-panel" aria-labelledby="prompt-heading">
      <div class="headline-block">
        <div class="chip-row" aria-label="Prompt metadata">
          <span class="neon-chip">Today's Prompt</span>
          <button type="button" class="mint-chip" id="refresh-prompt">Refresh prompt</button>
        </div>
        <h1 id="prompt-heading">${escapeHtml(headline)}</h1>
      </div>
    </section>

    <aside class="source-panel source-panel--${panelMode}" id="source-panel" aria-labelledby="source-heading">
      <div class="data-source-block" id="data-source-block">
        <div class="chip-row source-chip-row">
          <span class="neon-chip source-label" id="source-heading">${escapeHtml(sourceLabel)}</span>
          <button type="button" class="mint-chip" id="refresh-sources">Refresh data</button>
        </div>
        <div id="source-content">
          ${renderSourceContent(prompt)}
        </div>
      </div>
    </aside>
  </div>
  <script>${clientScript(prompt)}</script>
</body>
</html>`;
}
