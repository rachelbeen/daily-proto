#!/usr/bin/env node
/**
 * Restore primary categories for hybrid APIs and list them in multiple sections.
 * Run: node scripts/patch-open-data-hybrids.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const apisPath = join(dirname(fileURLToPath(import.meta.url)), "..", "src/data/open-data-index/apis.json");

/** primary category + every section the card should appear in */
const HYBRIDS = {
  "the-met-collection": ["art", "education"],
  "art-institute-of-chicago": ["art", "education"],
  "smithsonian-open-access": ["art", "education"],
  europeana: ["art", "education"],
  "wikimedia-commons": ["art", "education"],
  "nasa-image-video-library": ["science", "education"],
  "iss-now-open-notify": ["science", "education"],
  "launch-library-2": ["science", "education"],
  "nasa-eonet": ["science", "education"],
  "exoplanet-archive": ["science", "education"],
  "open-meteo": ["science", "education"],
  inaturalist: ["nature", "education"],
  gbif: ["nature", "education"],
  pubchem: ["health", "education"],
  "open-states": ["civic", "education"],
  "open-food-facts": ["food", "education"],
};

const catalog = JSON.parse(readFileSync(apisPath, "utf8"));
const categoryByKey = Object.fromEntries(catalog.categories.map((c) => [c.key, c]));

function applyPrimary(source, primaryKey) {
  const cat = categoryByKey[primaryKey];
  if (!cat) return;
  source.category = cat.key;
  source.categoryLabel = cat.label;
  source.color = cat.color;
}

for (const source of catalog.sources) {
  const hybrid = HYBRIDS[source.id];
  if (!hybrid) continue;
  source.categories = hybrid;
  applyPrimary(source, hybrid[0]);
}

const counts = {};
for (const source of catalog.sources) {
  const keys = source.categories?.length ? source.categories : [source.category];
  for (const key of keys) {
    counts[key] = (counts[key] ?? 0) + 1;
  }
}

catalog.categories = catalog.categories.map((cat) => ({
  ...cat,
  count: counts[cat.key] ?? 0,
}));

catalog.generated = new Date().toISOString().slice(0, 10);

writeFileSync(apisPath, `${JSON.stringify(catalog, null, 2)}\n`);

console.log("Hybrid categories applied:");
for (const [id, cats] of Object.entries(HYBRIDS)) {
  console.log(`  ${id} → ${cats.join(" + ")}`);
}
