import { sourceCombos } from "./data/bundles.js";
import { challenges, dataSources, getDataSourceById } from "./data/catalog.js";
import { constraints, twists } from "./data/templates.js";
import type { ChallengeTemplate, DailyPrompt, DataSource, GenerateOptions } from "./types.js";

function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pick<T>(items: T[], seed: number, salt: string): T {
  if (items.length === 0) {
    throw new Error(`Cannot pick from empty list (${salt})`);
  }
  const index = hashString(`${seed}:${salt}`) % items.length;
  return items[index]!;
}

function tagOverlap(source: DataSource, tags: string[]): number {
  return source.tags.filter((tag) => tags.includes(tag)).length;
}

function sourcesForChallenge(challenge: ChallengeTemplate): DataSource[] {
  const ranked = dataSources
    .map((source) => ({ source, score: tagOverlap(source, challenge.tags) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  if (ranked.length === 0) {
    return dataSources;
  }

  const topScore = ranked[0]!.score;
  return ranked.filter((entry) => entry.score === topScore).map((entry) => entry.source);
}

function combosForChallenge(challenge: ChallengeTemplate) {
  const tagged = sourceCombos.filter((combo) => {
    const comboTags = combo.tags ?? [];
    if (comboTags.some((tag) => challenge.tags.includes(tag))) {
      return true;
    }

    return combo.sourceIds.some((id) => {
      const source = getDataSourceById(id);
      return source !== undefined && tagOverlap(source, challenge.tags) > 0;
    });
  });

  return tagged.length > 0 ? tagged : sourceCombos;
}

function resolveAlignedSources(
  challenge: ChallengeTemplate,
  sourceSeed: number,
): Pick<DailyPrompt, "dataSources" | "comboNote"> {
  const useCombo = hashString(`${sourceSeed}:multi`) % 2 === 0;
  const eligibleCombos = combosForChallenge(challenge);

  if (useCombo && eligibleCombos.length > 0) {
    const combo = pick(eligibleCombos, sourceSeed, "combo");
    const sources = combo.sourceIds
      .map((id) => getDataSourceById(id))
      .filter((source): source is DataSource => source !== undefined);

    if (sources.length >= 2) {
      return { dataSources: sources, comboNote: combo.reason };
    }
  }

  const pool = sourcesForChallenge(challenge);
  return { dataSources: [pick(pool, sourceSeed, "source")] };
}

export function resolveDate(input?: string): string {
  if (input) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) {
      throw new Error(`Invalid date "${input}". Use YYYY-MM-DD.`);
    }
    return input;
  }
  return new Date().toISOString().slice(0, 10);
}

function parseSeed(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`Invalid seed "${value}".`);
  }
  return Math.floor(parsed);
}

export function parseGenerateOptions(
  dateParam?: string | null,
  promptSeedParam?: string | null,
  sourceSeedParam?: string | null,
): GenerateOptions {
  return {
    date: dateParam ?? undefined,
    promptSeed: parseSeed(promptSeedParam ?? null),
    sourceSeed: parseSeed(sourceSeedParam ?? null),
  };
}

export function generateDailyPrompt(options?: string | GenerateOptions): DailyPrompt {
  const opts: GenerateOptions =
    typeof options === "string" ? { date: options } : (options ?? {});

  const date = resolveDate(opts.date ?? process.env.PROMPT_DATE);
  const promptSeed = opts.promptSeed ?? hashString(`${date}:prompt`);
  const challenge = pick(challenges, promptSeed, "challenge");
  const sourceSeed = opts.sourceSeed ?? hashString(`${date}:sources:${challenge.id}`);

  const { dataSources: sources, comboNote } = resolveAlignedSources(challenge, sourceSeed);

  return {
    date,
    seed: promptSeed,
    promptSeed,
    sourceSeed,
    dataSources: sources,
    comboNote,
    challenge,
    constraint: pick(constraints, promptSeed, "constraint"),
    twist: pick(twists, promptSeed, "twist"),
  };
}

export function listUpcoming(count: number, startDate?: string): DailyPrompt[] {
  const start = resolveDate(startDate ?? process.env.PROMPT_DATE);
  const base = new Date(`${start}T12:00:00Z`);
  const prompts: DailyPrompt[] = [];

  for (let i = 0; i < count; i++) {
    const day = new Date(base);
    day.setUTCDate(base.getUTCDate() + i);
    const date = day.toISOString().slice(0, 10);
    prompts.push(generateDailyPrompt({ date }));
  }

  return prompts;
}

export function randomSeed(): number {
  return Math.floor(Math.random() * 2 ** 32);
}

export function getCatalogCounts() {
  return {
    prompts: challenges.length,
    sources: dataSources.length,
    combos: sourceCombos.length,
  };
}
