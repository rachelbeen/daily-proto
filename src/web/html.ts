import type { DailyPrompt, DataSource } from "../types.js";
import { renderPageLinks, siteNavScript, siteNavStyles, DAILY_PROMPT_STATE_KEY } from "./site-nav.js";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatSourceDetail(source: DataSource): string {
  const description = source.description.trim();
  const summary = source.dataSummary.trim();

  if (!summary) return description;

  const normalizedSummary = summary.replace(/^[^.—]+ — /, "").trim();
  if (!normalizedSummary || description.includes(normalizedSummary)) {
    return description;
  }

  const summaryLead = normalizedSummary.split(".")[0]?.trim() ?? "";
  if (summaryLead && description.includes(summaryLead)) {
    const remainder = normalizedSummary.slice(summaryLead.length).replace(/^\.\s*/, "");
    return remainder ? `${description} ${remainder}` : description;
  }

  if (normalizedSummary.includes(description)) return normalizedSummary;

  return `${description} ${normalizedSummary}`;
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
            Use the data
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
      --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
      --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
      --duration-fast: 200ms;
      --duration-med: 380ms;
      --duration-slow: 520ms;
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
      flex: 2 1 0;
      min-width: 0;
      background: var(--mint);
      padding: var(--site-gutter);
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      gap: 0;
    }

    .headline-block {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
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
      padding: 10px 20px;
      border-radius: 100px;
      line-height: 1.25;
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
      transition:
        opacity var(--duration-fast) var(--ease-out),
        transform var(--duration-fast) var(--ease-out),
        box-shadow var(--duration-fast) var(--ease-out),
        filter var(--duration-fast) var(--ease-out);
    }

    .mint-chip:hover {
      opacity: 1;
      transform: translateY(-1px);
      box-shadow: 0 6px 16px -10px rgba(6, 95, 70, 0.55);
    }

    .mint-chip:active {
      transform: translateY(0) scale(0.98);
      transition-duration: 120ms;
    }

    .mint-chip.is-busy {
      opacity: 0.65;
      pointer-events: none;
    }

    .headline-swap,
    .source-swap {
      transition: opacity var(--duration-slow) var(--ease-out);
    }

    .headline-swap.is-faded,
    .source-swap.is-faded {
      opacity: 0;
    }

    h1 {
      margin: 0;
      font-size: clamp(2.25rem, 5vw, 72px);
      font-weight: 800;
      line-height: 1.1;
      letter-spacing: -1.44px;
      word-break: break-word;
    }

    .source-panel {
      flex: 1 0 0;
      min-width: 0;
      background: var(--white);
      padding: 56px 40px;
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
      flex-direction: row;
      flex-wrap: wrap;
      gap: 10px;
      width: 100%;
    }

    .cta {
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 1 1 0;
      min-width: 0;
      padding: 11px 18px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 800;
      line-height: 1.3;
      text-decoration: none;
      transition:
        opacity var(--duration-fast) var(--ease-out),
        transform var(--duration-fast) var(--ease-out),
        box-shadow var(--duration-fast) var(--ease-out),
        border-color var(--duration-fast) var(--ease-out);
      white-space: nowrap;
    }

    .cta:hover {
      opacity: 1;
      transform: translateY(-1px);
      box-shadow: 0 8px 20px -12px rgba(26, 26, 26, 0.35);
    }

    .cta:active {
      transform: translateY(0) scale(0.99);
      transition-duration: 120ms;
    }

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
        padding: var(--site-gutter);
        overflow: visible;
      }

      h1 {
        letter-spacing: -0.04em;
      }

      .headline-block {
        max-width: none;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .headline-swap,
      .source-swap,
      .mint-chip,
      .cta {
        transition: none !important;
      }

      .headline-swap.is-faded,
      .source-swap.is-faded {
        opacity: 1;
      }
    }`;

function clientScript(prompt: DailyPrompt): string {
  return `
    const state = {
      date: ${JSON.stringify(prompt.date)},
      promptSeed: ${prompt.promptSeed},
      sourceSeed: ${prompt.sourceSeed},
      sourceIds: ${JSON.stringify(prompt.dataSources.map((source) => source.id))},
    };

    const STATE_KEY = ${JSON.stringify(DAILY_PROMPT_STATE_KEY)};

    (function restoreDailyState() {
      let saved;
      try {
        const raw = sessionStorage.getItem(STATE_KEY);
        saved = raw ? JSON.parse(raw) : null;
      } catch {
        return;
      }
      if (!saved || !saved.date) return;

      const url = new URL(location.href);
      const urlMatches =
        url.searchParams.get("date") === saved.date &&
        url.searchParams.get("promptSeed") === String(saved.promptSeed) &&
        url.searchParams.get("sourceSeed") === String(saved.sourceSeed);
      if (urlMatches) return;

      const embeddedMatches =
        state.date === saved.date &&
        state.promptSeed === saved.promptSeed &&
        state.sourceSeed === saved.sourceSeed;
      if (embeddedMatches) return;

      url.searchParams.set("date", saved.date);
      url.searchParams.set("promptSeed", String(saved.promptSeed));
      url.searchParams.set("sourceSeed", String(saved.sourceSeed));
      location.replace(url.pathname + "?" + url.searchParams.toString());
    })();

    function randomSeed() {
      return Math.floor(Math.random() * 2 ** 32);
    }

    function updateUrl() {
      const params = new URLSearchParams();
      params.set("date", state.date);
      params.set("promptSeed", String(state.promptSeed));
      params.set("sourceSeed", String(state.sourceSeed));
      history.replaceState(null, "", "?" + params.toString());
      sessionStorage.setItem(
        STATE_KEY,
        JSON.stringify({
          date: state.date,
          promptSeed: state.promptSeed,
          sourceSeed: state.sourceSeed,
        }),
      );
    }

    function wait(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    function prefersReducedMotion() {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    function waitForTransition(el) {
      return new Promise((resolve) => {
        const done = () => {
          el.removeEventListener("transitionend", onEnd);
          clearTimeout(fallback);
          resolve();
        };
        const onEnd = (event) => {
          if (event.target === el && event.propertyName === "opacity") done();
        };
        const fallback = setTimeout(done, 700);
        el.addEventListener("transitionend", onEnd);
      });
    }

    async function refreshWithAnimation(button, target, apply, bumpSeed, excludeCurrentSources = false) {
      if (button.disabled) return;
      button.disabled = true;
      button.classList.add("is-busy");

      try {
        bumpSeed();
        const dataPromise = fetchPrompt(excludeCurrentSources);

        if (prefersReducedMotion()) {
          apply(await dataPromise);
          return;
        }

        const height = target.offsetHeight;
        if (height > 0) target.style.minHeight = height + "px";
        target.classList.add("is-faded");
        const [, data] = await Promise.all([waitForTransition(target), dataPromise]);
        apply(data);
        const newHeight = target.scrollHeight;
        if (newHeight > 0) target.style.minHeight = Math.max(height, newHeight) + "px";
        await wait(16);
        target.classList.remove("is-faded");
        await waitForTransition(target);
        target.style.minHeight = "";
      } finally {
        button.disabled = false;
        button.classList.remove("is-busy");
      }
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
      state.sourceIds = data.dataSources.map((source) => source.id);
      updateUrl();
    }

    async function fetchPrompt(excludeCurrentSources = false) {
      const params = new URLSearchParams({
        date: state.date,
        promptSeed: String(state.promptSeed),
        sourceSeed: String(state.sourceSeed),
      });
      if (excludeCurrentSources) {
        state.sourceIds.forEach((id) => params.append("exclude", id));
      }
      const response = await fetch("/api/prompt.json?" + params.toString());
      if (!response.ok) throw new Error("Failed to refresh");
      return response.json();
    }

    document.getElementById("refresh-prompt").addEventListener("click", () => {
      refreshWithAnimation(
        document.getElementById("refresh-prompt"),
        document.getElementById("headline-swap"),
        applyPromptOnly,
        () => { state.promptSeed = randomSeed(); },
      );
    });

    document.getElementById("refresh-sources").addEventListener("click", () => {
      refreshWithAnimation(
        document.getElementById("refresh-sources"),
        document.getElementById("source-content"),
        applySourcesOnly,
        () => { state.sourceSeed = randomSeed(); },
        true,
      );
    });

    updateUrl();
  `;
}

export function renderPromptPage(prompt: DailyPrompt): string {
  const headline = renderHeadline(prompt);
  const sourceLabel = renderSourceLabel(prompt);
  const panelMode = prompt.dataSources.length === 1 ? "single" : "multi";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Daily Proto Inspo</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;800&display=swap" rel="stylesheet" />
  <style>${siteNavStyles}${pageStyles}</style>
</head>
<body>
  <div class="shell">
    <section class="prompt-panel" aria-labelledby="prompt-heading">
      <div class="site-nav-slot">
        ${renderPageLinks("daily")}
      </div>
      <div class="headline-block">
        <div class="chip-row" aria-label="Prompt metadata">
          <span class="neon-chip">Today's Prompt</span>
          <button type="button" class="mint-chip" id="refresh-prompt">Refresh prompt</button>
        </div>
        <div class="headline-swap" id="headline-swap">
          <h1 id="prompt-heading">${escapeHtml(headline)}</h1>
        </div>
      </div>
    </section>

    <aside class="source-panel source-panel--${panelMode}" id="source-panel" aria-labelledby="source-heading">
      <div class="data-source-block" id="data-source-block">
        <div class="chip-row source-chip-row">
          <span class="neon-chip source-label" id="source-heading">${escapeHtml(sourceLabel)}</span>
          <button type="button" class="mint-chip" id="refresh-sources">Refresh data</button>
        </div>
        <div class="source-swap" id="source-content">
          ${renderSourceContent(prompt)}
        </div>
      </div>
    </aside>
  </div>
  <script>${siteNavScript()}</script>
  <script>${clientScript(prompt)}</script>
</body>
</html>`;
}
