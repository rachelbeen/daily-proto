import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { OpenDataSource } from "./open-data-index.js";
import { loadOpenDataCatalog } from "./open-data-index.js";
import type { ApiAuth, DataSource } from "../types.js";

const dataDir = join(dirname(fileURLToPath(import.meta.url)));
const exampleEndpoints = JSON.parse(
  readFileSync(join(dataDir, "open-data-endpoints.json"), "utf8"),
) as Record<string, string>;

const CATEGORY_TAGS: Record<string, string[]> = {
  art: ["culture", "education", "gallery", "search"],
  science: ["science", "charts", "time-series"],
  civic: ["civic", "education", "search", "geo"],
  news: ["news", "media", "time-series"],
  maps: ["maps", "geo"],
  nature: ["nature", "science", "maps"],
  health: ["health", "alerts"],
  finance: ["finance", "charts", "comparison"],
  books: ["books", "education", "search"],
  food: ["food", "fun"],
  music: ["music", "media"],
  sports: ["sports", "ranking", "comparison"],
  dev: ["dev", "search"],
  games: ["games", "fun", "collections"],
};

const TAG_HINTS: Record<string, string[]> = {
  museum: ["culture", "gallery"],
  geo: ["geo", "maps"],
  transit: ["transit", "real-time", "geo"],
  weather: ["time-series", "alerts", "real-time"],
  game: ["fun", "games"],
  quiz: ["fun", "games"],
};

const AUTH_MAP: Record<OpenDataSource["auth"], ApiAuth> = {
  none: "none",
  key: "free-key",
  oauth: "free-key",
};

/** IDs in the daily catalog that are the same API under a different slug. */
const CATALOG_ALIASES: Record<string, string> = {
  "pok-api": "pokeapi",
  "iss-now-open-notify": "iss-location",
  "the-met-collection": "met-museum",
  "art-institute-of-chicago": "art-institute",
  "open-states": "open-civic-data",
  "open-brewery-db": "open-brewery",
  "hacker-news": "hn-firebase",
};

function uniqueTags(tags: string[]): string[] {
  return [...new Set(tags)];
}

function normalizeEndpoint(source: OpenDataSource): string {
  const override = exampleEndpoints[source.id];
  if (override) return override;

  const endpoint = source.endpoint.trim();
  if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
    return endpoint;
  }

  const url = `https://${endpoint.replace(/^\/+/, "")}`;
  if (url.includes("?")) return url;
  if (url.endsWith(".json") || url.includes("/resource/")) {
    return `${url}${url.includes("?") ? "" : "?$limit=10"}`;
  }
  return url;
}

function baseUrlFrom(endpoint: string): string {
  try {
    const { protocol, host } = new URL(endpoint);
    return `${protocol}//${host}`;
  } catch {
    return endpoint;
  }
}

function docsUrl(source: OpenDataSource): string {
  const docs = source.docs.trim();
  if (docs.startsWith("http://") || docs.startsWith("https://")) {
    return docs;
  }
  return `https://${docs.replace(/^\/+/, "")}`;
}

function tagsForSource(source: OpenDataSource): string[] {
  const fromCategory = CATEGORY_TAGS[source.category] ?? ["search"];
  const fromApiTags = source.tags.flatMap((tag) => TAG_HINTS[tag] ?? []);
  return uniqueTags([...fromCategory, ...fromApiTags]);
}

function sampleFieldsFor(source: OpenDataSource): string[] {
  if (source.tags.length > 0) {
    return source.tags.slice(0, 4);
  }
  return ["id", "name", "description", "type"];
}

function dataSummaryFor(source: OpenDataSource): string {
  const lead = source.description.split(/[.—]/)[0]?.trim() ?? source.name;
  return `${lead}. Live records from the API.`;
}

export function openDataSourceToDataSource(source: OpenDataSource): DataSource {
  const exampleEndpoint = normalizeEndpoint(source);

  return {
    id: source.id,
    name: source.name,
    category: source.categoryLabel,
    description: source.description,
    dataSummary: dataSummaryFor(source),
    baseUrl: baseUrlFrom(exampleEndpoint),
    docsUrl: docsUrl(source),
    auth: AUTH_MAP[source.auth],
    exampleEndpoint,
    sampleFields: sampleFieldsFor(source),
    tags: tagsForSource(source),
  };
}

export function loadOpenDataIndexSources(): DataSource[] {
  return loadOpenDataCatalog().sources.map(openDataSourceToDataSource);
}

export function mergeOpenDataSources(baseSources: DataSource[]): DataSource[] {
  const baseIds = new Set(baseSources.map((source) => source.id));
  const merged = [...baseSources];

  for (const source of loadOpenDataIndexSources()) {
    if (baseIds.has(source.id)) continue;
    if (CATALOG_ALIASES[source.id] && baseIds.has(CATALOG_ALIASES[source.id]!)) {
      continue;
    }
    merged.push(source);
    baseIds.add(source.id);
  }

  return merged;
}
