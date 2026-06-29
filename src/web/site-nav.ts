export type SiteTab = "daily" | "open-data";

export const DAILY_PROMPT_STATE_KEY = "dailyProtoSeeds";

export const siteNavStyles = `
  :root {
    --site-gutter: clamp(2rem, 6vw, 80px);
  }

  .site-nav-slot {
    flex: none;
  }

  .page-tabs {
    display: inline-flex;
    align-items: center;
    gap: 14px;
    margin: 0 0 32px;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.3;
  }

  .page-tab {
    color: var(--muted);
    text-decoration: none;
    transition: color 220ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .page-tab[aria-current="page"] {
    color: var(--ink);
    font-weight: 600;
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 4px;
    cursor: default;
  }

  .page-tab:not([aria-current="page"]):hover {
    color: var(--ink);
  }
`;

function renderTab(label: string, href: string, isActive: boolean, dailyPrompt = false): string {
  if (isActive) {
    return `<span class="page-tab" aria-current="page">${label}</span>`;
  }
  const dailyAttr = dailyPrompt ? ` data-daily-prompt-href` : "";
  return `<a class="page-tab" href="${href}"${dailyAttr}>${label}</a>`;
}

export function siteNavScript(): string {
  const key = DAILY_PROMPT_STATE_KEY;
  return `
(function () {
  const KEY = ${JSON.stringify(key)};

  function readState() {
    try {
      const raw = sessionStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function dailyHref() {
    const saved = readState();
    if (!saved || !saved.date) return "/";
    const params = new URLSearchParams();
    params.set("date", saved.date);
    if (saved.promptSeed != null) params.set("promptSeed", String(saved.promptSeed));
    if (saved.sourceSeed != null) params.set("sourceSeed", String(saved.sourceSeed));
    return "/?" + params.toString();
  }

  document.querySelectorAll("[data-daily-prompt-href]").forEach((el) => {
    el.setAttribute("href", dailyHref());
  });
})();`;
}

export function renderPageLinks(active: SiteTab): string {
  const daily = renderTab("Daily Prompt", "/", active === "daily", true);
  const index = renderTab("Open Data Index", "/open-data", active === "open-data");

  return `<nav class="page-tabs" aria-label="Site sections">${daily}${index}</nav>`;
}
