export type SiteTab = "daily" | "open-data";

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

function renderTab(label: string, href: string, isActive: boolean): string {
  if (isActive) {
    return `<span class="page-tab" aria-current="page">${label}</span>`;
  }
  return `<a class="page-tab" href="${href}">${label}</a>`;
}

export function renderPageLinks(active: SiteTab): string {
  const daily = renderTab("Daily Prompt", "/", active === "daily");
  const index = renderTab("Open Data Index", "/open-data", active === "open-data");

  return `<nav class="page-tabs" aria-label="Site sections">${daily}${index}</nav>`;
}
