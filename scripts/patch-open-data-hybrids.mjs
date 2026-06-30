#!/usr/bin/env node
/**
 * Keep domain APIs in their home category (art, science, nature, etc.).
 * Only explicit hybrids appear in multiple sections.
 * Run: node scripts/patch-open-data-hybrids.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const apisPath = join(dirname(fileURLToPath(import.meta.url)), "..", "src/data/open-data-index/apis.json");

/** APIs that belong in one section only — restored from Education overlap. */
const SINGLE_CATEGORY = {
  "the-met-collection": "art",
  "art-institute-of-chicago": "art",
  "smithsonian-open-access": "art",
  europeana: "art",
  "wikimedia-commons": "art",
  "nasa-image-video-library": "science",
  "iss-now-open-notify": "science",
  "launch-library-2": "science",
  "nasa-eonet": "science",
  "exoplanet-archive": "science",
  "open-notify-people": "science",
  "open-meteo": "science",
  inaturalist: "nature",
  gbif: "nature",
  pubchem: "health",
  "open-states": "civic",
  "open-food-facts": "food",
};

/** Optional cross-listing — empty unless we add true dual-purpose APIs later. */
const HYBRIDS = {};

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
  const single = SINGLE_CATEGORY[source.id];
  if (single) {
    delete source.categories;
    applyPrimary(source, single);
    continue;
  }

  const hybrid = HYBRIDS[source.id];
  if (hybrid) {
    source.categories = hybrid;
    applyPrimary(source, hybrid[0]);
    continue;
  }

  if (source.categories) {
    delete source.categories;
  }
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

console.log(`Restored ${Object.keys(SINGLE_CATEGORY).length} APIs to a single home category.`);
console.log(`Education count: ${counts.education ?? 0}`);
