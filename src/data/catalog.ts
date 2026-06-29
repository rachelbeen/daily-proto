import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { ChallengeTemplate, DataSource } from "../types.js";
import { mergeOpenDataSources } from "./open-data-sources.js";

const catalogDir = join(dirname(fileURLToPath(import.meta.url)), "catalog");

function loadJson<T>(fileName: string): T {
  return JSON.parse(readFileSync(join(catalogDir, fileName), "utf8")) as T;
}

export const challenges: ChallengeTemplate[] = loadJson("prompts.json");
const baseDataSources: DataSource[] = loadJson("sources.json");
export const dataSources: DataSource[] = mergeOpenDataSources(baseDataSources);

export function getDataSourceById(id: string): DataSource | undefined {
  return dataSources.find((source) => source.id === id);
}

export const catalogStats = {
  prompts: challenges.length,
  sources: dataSources.length,
  openDataIndexSources: dataSources.length - baseDataSources.length,
};
