import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export interface SourceCombo {
  id: string;
  sourceIds: string[];
  reason: string;
  tags?: string[];
}

const catalogDir = join(dirname(fileURLToPath(import.meta.url)), "catalog");

export const sourceCombos: SourceCombo[] = JSON.parse(
  readFileSync(join(catalogDir, "bundles.json"), "utf8"),
);
