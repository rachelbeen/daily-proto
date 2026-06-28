const DOG_IMAGE =
  "https://images.dog.ceo/breeds/pitbull/pitbull_dog.jpg";

const pageStyles = `
  :root {
    --ochre: #d99347;
    --ochre-dark: #c47f35;
    --ink: #111111;
    --white: #ffffff;
    --muted: rgba(17, 17, 17, 0.55);
    --hero-red: #c1121f;
    --line: rgba(17, 17, 17, 0.12);
  }

  * { box-sizing: border-box; }

  body {
    margin: 0;
    min-height: 100vh;
    background: var(--ochre);
    color: var(--ink);
    font-family: "Outfit", ui-sans-serif, system-ui, sans-serif;
  }

  .page {
    min-height: 100vh;
    padding: clamp(2rem, 6vw, 80px);
    display: flex;
    flex-direction: column;
    gap: clamp(2.5rem, 5vw, 64px);
  }

  .top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  .notch {
    width: 72px;
    height: 22px;
    background: var(--ink);
    border-radius: 0 0 14px 14px;
    flex-shrink: 0;
  }

  .status-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: var(--ink);
    color: var(--white);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    border-radius: 100px;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #2ecc71;
    box-shadow: 0 0 8px #2ecc71;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.45; }
  }

  .hero-header {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .name-block {
    display: flex;
    flex-direction: column;
    line-height: 0.9;
    letter-spacing: -0.04em;
  }

  .name-line {
    margin: 0;
    font-size: clamp(4rem, 14vw, 7.5rem);
    font-weight: 800;
  }

  .name-line--dark { color: var(--ink); }
  .name-line--light { color: var(--white); }

  .subtitle-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px 20px;
  }

  .subtitle {
    margin: 0;
    font-size: clamp(0.875rem, 2vw, 1.125rem);
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .badge {
    display: inline-block;
    padding: 6px 14px;
    background: var(--ink);
    color: var(--white);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .content {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: clamp(2rem, 5vw, 64px);
    align-items: start;
  }

  .editorial {
    display: flex;
    flex-direction: column;
    gap: 36px;
  }

  .description {
    margin: 0;
    font-size: clamp(1rem, 2vw, 1.125rem);
    line-height: 1.65;
    font-weight: 500;
    max-width: 52ch;
    color: var(--ink);
  }

  .section-label {
    margin: 0 0 16px;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--ink);
  }

  .powers {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .power-row {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .power-icon {
    width: 36px;
    height: 36px;
    border: 2px solid var(--ink);
    background: rgba(255, 255, 255, 0.25);
    display: grid;
    place-items: center;
    flex-shrink: 0;
    font-size: 16px;
  }

  .power-label {
    margin: 0;
    font-size: 13px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .visual-column {
    display: flex;
    flex-direction: column;
    gap: 36px;
  }

  .gallery {
    position: relative;
    width: 100%;
    min-height: 420px;
    display: grid;
    place-items: center;
    background: rgba(255, 255, 255, 0.12);
    border: 2px solid rgba(17, 17, 17, 0.08);
    padding: 48px 24px;
  }

  .photo-stack {
    position: relative;
    width: min(280px, 70%);
    height: 340px;
  }

  .photo-back {
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 4px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }

  .photo-back--left {
    transform: rotate(-7deg) translateX(-22px) scale(0.95);
    z-index: 0;
  }

  .photo-back--right {
    transform: rotate(6deg) translateX(22px) scale(0.95);
    z-index: 1;
  }

  .photo-main {
    position: absolute;
    inset: 0;
    z-index: 2;
    border-radius: 4px;
    overflow: hidden;
    background: #f5f5f5;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
  }

  .photo-main img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
    display: block;
  }

  .cape {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 220px;
    height: 110px;
    background: linear-gradient(180deg, var(--hero-red) 0%, #780000 100%);
    clip-path: polygon(50% 0%, 100% 18%, 86% 100%, 50% 84%, 14% 100%, 0% 18%);
    z-index: 3;
    pointer-events: none;
    animation: cape-flow 4s ease-in-out infinite;
  }

  @keyframes cape-flow {
    0%, 100% { transform: translateX(-50%) scaleX(1); }
    50% { transform: translateX(-50%) scaleX(1.05); }
  }

  .emblem {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 52px;
    height: 52px;
    border: 2px solid var(--ink);
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.9);
    display: grid;
    place-items: center;
    font-size: 22px;
    font-weight: 800;
    z-index: 4;
  }

  .nav-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 44px;
    height: 44px;
    border: none;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(4px);
    color: var(--ink);
    font-size: 22px;
    font-weight: 800;
    cursor: pointer;
    z-index: 5;
    display: grid;
    place-items: center;
    padding: 0;
    transition: background 150ms ease;
  }

  .nav-btn:hover { background: rgba(255, 255, 255, 0.65); }
  .nav-btn--prev { left: 16px; }
  .nav-btn--next { right: 16px; }

  .specs {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .spec-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 16px;
    padding: 16px 0;
    border-bottom: 1px solid var(--line);
  }

  .spec-row:first-child { border-top: 1px solid var(--line); }

  .spec-label {
    font-size: 14px;
    font-weight: 800;
    color: var(--ink);
    flex-shrink: 0;
  }

  .spec-value {
    font-size: 14px;
    font-weight: 800;
    color: var(--white);
    text-align: right;
  }

  .spec-value--hero { color: var(--ink); background: var(--white); padding: 2px 8px; }

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    padding-top: 8px;
    border-top: 1px solid var(--line);
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--muted);
  }

  .footer a {
    color: var(--ink);
    text-decoration: none;
  }

  .footer a:hover { text-decoration: underline; }

  @media (max-width: 900px) {
    .content {
      grid-template-columns: 1fr;
    }

    .gallery {
      min-height: 380px;
    }
  }
`;

function specRow(label: string, value: string, hero = false): string {
  const valueClass = hero ? "spec-value spec-value--hero" : "spec-value";
  return `
    <div class="spec-row">
      <span class="spec-label">${label}</span>
      <span class="${valueClass}">${value}</span>
    </div>`;
}

function powerRow(icon: string, label: string): string {
  return `
    <div class="power-row">
      <div class="power-icon" aria-hidden="true">${icon}</div>
      <p class="power-label">${label}</p>
    </div>`;
}

export function renderPitbullSuperheroPage(): string {
  const specs = [
    specRow("Codename", "Captain PB-01", true),
    specRow("Weight", "30.2 KG"),
    specRow("Height", "51.5 CM"),
    specRow("Bite Force", "235.4 PSI"),
    specRow("Temperament", "Loyal / Tenacious"),
    specRow("Colorway", "Brindle / White"),
    specRow("Revision", "2026.01"),
    specRow("Serial", "PB01-0042-REV-B"),
  ].join("");

  const powers = [
    powerRow("⚡", "Sonic Bark — 235 PSI output"),
    powerRow("🛡", "Unbreakable Loyalty Shield"),
    powerRow("♥", "Maximum Affection Beam"),
  ].join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Captain PB-01 — Superhero Unit</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;800&display=swap" rel="stylesheet" />
  <style>${pageStyles}</style>
</head>
<body>
  <main class="page">
    <div class="top-bar">
      <div class="notch" aria-hidden="true"></div>
      <div class="status-pill">
        <span class="status-dot" aria-hidden="true"></span>
        Hero status: Online · Sector Brindle / White
      </div>
    </div>

    <header class="hero-header">
      <div class="name-block">
        <h1 class="name-line name-line--dark">Captain</h1>
        <p class="name-line name-line--light">PB-01</p>
      </div>
      <div class="subtitle-row">
        <p class="subtitle">Pitbull · Superhero Unit</p>
        <span class="badge">Active Duty</span>
        <span class="subtitle">Model PB-01 · Tactical Companion</span>
      </div>
    </header>

    <div class="content">
      <section class="editorial" aria-labelledby="about-heading">
        <p class="description" id="about-heading">
          The PB-01 is a high-density guardian module engineered for maximum loyalty output
          with zero fear latency. Deployed across urban and suburban sectors, this unit
          combines brindle armor plating with a weather-resistant exterior and an
          integrated hero-class cape subsystem. Built for defense, optimized for belly rubs.
        </p>

        <div>
          <p class="section-label">Superpowers</p>
          <div class="powers">${powers}</div>
        </div>
      </section>

      <section class="visual-column" aria-label="Hero dossier">
        <div class="gallery">
          <button class="nav-btn nav-btn--prev" type="button" aria-label="Previous photo">‹</button>

          <div class="photo-stack">
            <div class="photo-back photo-back--left" aria-hidden="true"></div>
            <div class="photo-back photo-back--right" aria-hidden="true"></div>
            <div class="photo-main">
              <div class="emblem" aria-hidden="true">P</div>
              <img
                src="${DOG_IMAGE}"
                alt="Captain PB-01, pitbull superhero unit"
                width="280"
                height="340"
              />
              <div class="cape" aria-hidden="true"></div>
            </div>
          </div>

          <button class="nav-btn nav-btn--next" type="button" aria-label="Next photo">›</button>
        </div>

        <div>
          <p class="section-label">Specifications</p>
          <div class="specs">${specs}</div>
        </div>
      </section>
    </div>

    <footer class="footer">
      <span>Data: Dog API</span>
      <span>
        <a href="https://dog.ceo/dog-api/" target="_blank" rel="noopener noreferrer">API docs</a>
        ·
        <a href="/api/data/dog-api" target="_blank" rel="noopener noreferrer">Live payload</a>
      </span>
    </footer>
  </main>
</body>
</html>`;
}
