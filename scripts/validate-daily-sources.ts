#!/usr/bin/env tsx
/**
 * Verify every no-auth Open Data Index API is in the daily source pool.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadOpenDataCatalog } from "../src/data/open-data-index.js";
import { mergeOpenDataSources, validateNoAuthIndexCoverage } from "../src/data/open-data-sources.js";
import type { DataSource } from "../src/types.js";

const catalogDir = join(dirname(fileURLToPath(import.meta.url)), "../src/data/catalog");
const baseSources = JSON.parse(readFileSync(join(catalogDir, "sources.json"), "utf8")) as DataSource[];
const index = loadOpenDataCatalog();
const merged = mergeOpenDataSources(baseSources);
const missing = validateNoAuthIndexCoverage(baseSources);

const noneInIndex = index.sources.filter((s) => s.auth === "none").length;
const added = merged.length - baseSources.length;

console.log(`Base catalog: ${baseSources.length} sources`);
console.log(`Open index (no key): ${noneInIndex} sources`);
console.log(`Daily pool after merge: ${merged.length} (+${added} from index)`);

if (missing.length > 0) {
  console.error("\nMissing no-auth index APIs from daily pool:");
  for (const id of missing) console.error(`  - ${id}`);
  process.exit(1);
}

console.log("\nAll no-auth index APIs are available in daily data.");
