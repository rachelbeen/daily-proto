import type { OpenDataCatalog } from "../data/open-data-index.js";
import { renderPageLinks, siteNavScript, siteNavStyles } from "./site-nav.js";

const pageStyles = `
  :root {
    --mint: #c8f0dc;
    --mint-chip: #b3e4c8;
    --mint-chip-text: #065f46;
    --neon-yellow: #e6fa3d;
    --ink: #1a1a1a;
    --muted: #666666;
    --white: #ffffff;
    --line: rgba(0, 0, 0, 0.08);
    --line-strong: rgba(0, 0, 0, 0.12);
    --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
    --duration-fast: 220ms;
    --duration-med: 380ms;
  }

  * { box-sizing: border-box; }

  html { scroll-behavior: smooth; }

  body {
    margin: 0;
    min-height: 100vh;
    font-family: "Outfit", ui-sans-serif, system-ui, sans-serif;
    color: var(--ink);
    background: var(--white);
  }

  a { color: inherit; }

  .index-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .index-shell {
    margin: 0;
    padding-left: var(--site-gutter);
    padding-right: var(--site-gutter);
  }

  .index-mint-band {
    flex: 1;
    background: var(--mint);
  }

  .index-page-grid {
    display: grid;
    grid-template-columns: 200px minmax(0, 1fr);
    column-gap: clamp(28px, 4vw, 44px);
    row-gap: 0;
    align-items: start;
  }

  .index-span-all {
    grid-column: 1 / -1;
  }

  .index-hero {
    grid-column: 1 / -1;
    padding: var(--site-gutter) 0 clamp(1.75rem, 4vw, 40px);
  }

  .index-intro {
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  .index-hero h1 {
    margin: 0;
    font-size: clamp(2.25rem, 5vw, 64px);
    font-weight: 800;
    line-height: 1.08;
    letter-spacing: -0.04em;
    max-width: none;
  }

  .index-hero .lede {
    margin: 0;
    font-size: clamp(1.05rem, 2vw, 1.2rem);
    font-weight: 500;
    line-height: 1.55;
    color: var(--ink);
    max-width: 42ch;
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    padding-top: 4px;
  }

  .legend-item {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 8px 14px;
    border-radius: 100px;
    background: var(--white);
    color: var(--ink);
    border: 1.5px solid var(--line-strong);
  }

  .filters {
    grid-column: 1;
    position: sticky;
    top: 24px;
    align-self: start;
    padding-top: 36px;
    padding-bottom: 112px;
  }

  main {
    grid-column: 2;
    min-width: 0;
    padding-top: 36px;
    padding-bottom: 112px;
  }

  .filters-label {
    margin: 0 0 12px;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .chips {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .chip {
    width: 100%;
    cursor: pointer;
    border: 1.5px solid var(--line-strong);
    background: var(--white);
    color: var(--ink);
    border-radius: 100px;
    padding: 8px 14px;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition:
      background var(--duration-fast) var(--ease-out),
      color var(--duration-fast) var(--ease-out),
      border-color var(--duration-fast) var(--ease-out),
      transform var(--duration-fast) var(--ease-out);
    white-space: nowrap;
    font-family: inherit;
    justify-content: flex-start;
  }

  .chip:hover { border-color: var(--ink); }

  .chip .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex: none;
    border: 1px solid rgba(0, 0, 0, 0.08);
  }

  .chip[aria-pressed="true"] {
    background: var(--ink);
    color: var(--white);
    border-color: var(--ink);
  }

  .chip[aria-pressed="true"] .dot { border-color: transparent; }
  .chip[aria-pressed="true"] .ct { color: rgba(255, 255, 255, 0.65); }

  .chip .ct {
    font-size: 10px;
    font-weight: 800;
    color: var(--muted);
  }

  .section {
    margin-bottom: 36px;
    scroll-margin-top: 24px;
  }

  .section-head {
    display: flex;
    align-items: baseline;
    gap: 10px;
    margin: 0 0 14px;
    padding-bottom: 10px;
    border-bottom: 1.5px solid var(--line-strong);
  }

  .section-head .tab {
    width: 10px;
    height: 10px;
    border-radius: 3px;
    flex: none;
    align-self: center;
  }

  .section-head h2 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1.2;
  }

  .section-head .n {
    margin-left: auto;
    font-size: 11px;
    font-weight: 600;
    color: var(--muted);
  }

  .grid {
    display: grid;
    gap: 14px;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  }

  .card {
    background: var(--white);
    border: 1.5px solid var(--line-strong);
    border-left: 4px solid var(--cat, var(--ink));
    border-radius: 12px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 11px;
    text-decoration: none;
    color: inherit;
    transition:
      transform var(--duration-med) var(--ease-out),
      box-shadow var(--duration-med) var(--ease-out);
  }

  .card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px -12px rgba(26, 26, 26, 0.2);
  }

  .card:focus-visible {
    outline: 3px solid var(--neon-yellow);
    outline-offset: 2px;
  }

  .card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
  }

  .card h3 {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 800;
    line-height: 1.25;
    letter-spacing: -0.01em;
  }

  .arrow {
    flex: none;
    color: var(--muted);
    transition:
      transform var(--duration-fast) var(--ease-out),
      color var(--duration-fast) var(--ease-out);
    margin-top: 2px;
  }

  .card:hover .arrow {
    transform: translate(2px, -2px);
    color: var(--ink);
  }

  .card p {
    margin: 0;
    font-size: 14px;
    font-weight: 500;
    line-height: 1.45;
    color: var(--ink);
    flex: 1;
  }

  .endpoint {
    font-size: 11px;
    font-weight: 500;
    color: var(--muted);
    background: var(--white);
    border: 1.5px solid var(--line-strong);
    border-radius: 8px;
    padding: 6px 8px;
    word-break: break-all;
    line-height: 1.4;
  }

  .badges { display: flex; flex-wrap: wrap; gap: 8px; }

  .badge {
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 6px 10px;
    border-radius: 100px;
    border: 1.5px solid transparent;
  }

  .b-none { background: var(--white); color: var(--ink); border-color: var(--line-strong); }
  .b-key { background: var(--neon-yellow); color: var(--ink); border-color: var(--neon-yellow); }
  .b-oauth { background: var(--ink); color: var(--white); border-color: var(--ink); }

  footer {
    border-top: 1px solid var(--line);
    padding: 20px 0 32px;
    font-size: 12px;
    font-weight: 500;
    color: var(--muted);
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
  }

  @media (max-width: 768px) {
    .index-page-grid {
      grid-template-columns: 1fr;
    }

    .filters,
    main {
      grid-column: 1;
    }

    .filters {
      position: static;
      padding-top: 24px;
      padding-bottom: 0;
      margin-bottom: 36px;
    }

    main {
      padding-top: 0;
    }

    .chips {
      flex-direction: row;
      flex-wrap: wrap;
    }

    .chip {
      width: auto;
    }

    .grid { grid-template-columns: 1fr; }
  }

  @media (prefers-reduced-motion: reduce) {
    * { transition: none !important; scroll-behavior: auto; }
    .card:hover { transform: none; }
  }
`;

/** Neon/pastel spectrum anchored on acid yellow + mint green. */
const CATEGORY_ACCENTS = [
  "#e6fa3d", // acid yellow
  "#d8ffa8", // chartreuse pastel
  "#b3e4c8", // mint chip
  "#a8f5c8", // seafoam
  "#9ef0e0", // aqua pastel
  "#a8f0f8", // cyan pastel
  "#b8e8ff", // sky pastel
  "#c4d8ff", // periwinkle
  "#d4c8ff", // lavender
  "#e4b8ff", // violet pastel
  "#f0b8ff", // orchid
  "#ffb8f0", // pink pastel
  "#ffc8e0", // rose
  "#ffc8c8", // coral blush
  "#ffd4b8", // peach
  "#ffe4a8", // apricot
  "#fff0a8", // butter
  "#c8f0dc", // soft mint
  "#7ee8b0", // neon green
];

function clientScript(catalog: OpenDataCatalog): string {
  return `
const CATALOG = ${JSON.stringify(catalog)};
const ABADGE = {none:["No key","b-none"], key:["Free key","b-key"], oauth:["OAuth","b-oauth"]};
const ACCENTS = ${JSON.stringify(CATEGORY_ACCENTS)};
const catalog = document.getElementById('catalog');
const chipsEl = document.getElementById('chips');

const counts = {};
CATALOG.sources.forEach(d => counts[d.category] = (counts[d.category] || 0) + 1);

function accentColor(key) {
  const i = CATALOG.categories.findIndex(c => c.key === key);
  return ACCENTS[(i < 0 ? 0 : i) % ACCENTS.length];
}

let active = "all";

const allChip = chip("all", "All", CATALOG.sources.length, null);
chipsEl.appendChild(allChip);
CATALOG.categories.forEach((v) => {
  if (counts[v.key]) chipsEl.appendChild(chip(v.key, v.label, counts[v.key], accentColor(v.key)));
});

function chip(key, label, ct, color) {
  const b = document.createElement('button');
  b.className = 'chip';
  b.setAttribute('aria-pressed', key === 'all');
  b.innerHTML = (color ? '<span class="dot" style="background:' + color + '"></span>' : '') +
    '<span>' + label + '</span><span class="ct">' + ct + '</span>';
  b.onclick = () => {
    active = key;
    [...chipsEl.children].forEach(c => c.setAttribute('aria-pressed', 'false'));
    b.setAttribute('aria-pressed', 'true');
    render();
    if (key !== 'all') {
      const s = document.getElementById('sec-' + key);
      if (s) s.scrollIntoView({ block: 'start' });
    }
  };
  return b;
}

CATALOG.categories.forEach((v) => {
  if (!counts[v.key]) return;
  const accent = accentColor(v.key);
  const sec = document.createElement('section');
  sec.className = 'section';
  sec.id = 'sec-' + v.key;
  sec.dataset.cat = v.key;
  sec.innerHTML = '<div class="section-head"><span class="tab" style="background:' + accent + '"></span>' +
    '<h2>' + v.label + '</h2><span class="n">' + counts[v.key] + ' sources</span></div>' +
    '<div class="grid"></div>';
  const grid = sec.querySelector('.grid');
  CATALOG.sources.filter(d => d.category === v.key).forEach(d => grid.appendChild(card(d, accent)));
  catalog.appendChild(sec);
});

function card(d, color) {
  const a = document.createElement('a');
  a.className = 'card';
  a.href = d.docs;
  a.target = '_blank';
  a.rel = 'noopener';
  a.style.setProperty('--cat', color);
  const [albl, acls] = ABADGE[d.auth];
  a.innerHTML =
    '<div class="card-top">' +
      '<h3>' + d.name + '</h3>' +
      '<svg class="arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M7 17 17 7M9 7h8v8"/></svg>' +
    '</div>' +
    '<p>' + d.description + '</p>' +
    '<div class="endpoint">' + d.endpoint + '</div>' +
    '<div class="badges"><span class="badge ' + acls + '">' + albl + '</span></div>';
  return a;
}

function render() {
  document.querySelectorAll('.section').forEach(sec => {
    const show = active === 'all' || sec.dataset.cat === active;
    sec.style.display = show ? '' : 'none';
  });
}

render();
`;
}

export function renderOpenDataIndexPage(catalog: OpenDataCatalog): string {
  const { sources, categories } = catalog.counts;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Open Data Index — Daily Proto</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;800&display=swap" rel="stylesheet" />
  <style>${siteNavStyles}${pageStyles}</style>
</head>
<body>
  <div class="index-page">
    <div class="index-mint-band">
      <div class="index-shell index-page-grid">
        <div class="index-hero">
          ${renderPageLinks("open-data")}
          <div class="index-intro">
            <h1>The Open Data Index</h1>
            <p class="lede">Rich, real, public APIs you can pull from. Built for prototypes, demos, and hackathons.</p>
            <div class="legend">
              <span class="legend-item"><span class="badge b-none" style="padding:4px 10px;font-size:9px;">No key</span> Open, just GET</span>
              <span class="legend-item"><span class="badge b-key" style="padding:4px 10px;font-size:9px;">Free key</span> Quick signup</span>
              <span class="legend-item"><span class="badge b-oauth" style="padding:4px 10px;font-size:9px;">OAuth</span> Auth flow</span>
            </div>
          </div>
        </div>

        <aside class="filters" aria-label="Filter by category">
          <p class="filters-label">Categories</p>
          <div class="chips" id="chips"></div>
        </aside>

        <main id="catalog"></main>
      </div>
    </div>

    <footer class="index-shell">
      <span>${sources}+ open data sources · ${categories} categories</span>
    </footer>
  </div>

  <script>${siteNavScript()}</script>
  <script>${clientScript(catalog)}</script>
</body>
</html>`;
}
