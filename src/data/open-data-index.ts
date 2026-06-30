import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dataDir = join(dirname(fileURLToPath(import.meta.url)), "open-data-index");

export type OpenDataAuth = "none" | "key" | "oauth";

export interface OpenDataCategory {
  key: string;
  label: string;
  color: string;
  count: number;
}

export interface OpenDataSource {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  color: string;
  /** When set, the card appears in every listed category section. */
  categories?: string[];
  auth: OpenDataAuth;
  description: string;
  endpoint: string;
  docs: string;
  tags: string[];
}

export interface OpenDataCatalog {
  name: string;
  description: string;
  generated: string;
  counts: { sources: number; categories: number };
  authLegend: Record<OpenDataAuth, string>;
  categories: OpenDataCategory[];
  sources: OpenDataSource[];
}

export function loadOpenDataCatalog(): OpenDataCatalog {
  return JSON.parse(readFileSync(join(dataDir, "apis.json"), "utf8")) as OpenDataCatalog;
}
