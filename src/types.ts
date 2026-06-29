export type ApiAuth = "none" | "optional" | "free-key";

export interface DataSource {
  id: string;
  name: string;
  category: string;
  description: string;
  dataSummary: string;
  baseUrl: string;
  docsUrl: string;
  auth: ApiAuth;
  exampleEndpoint: string;
  sampleFields: string[];
  tags: string[];
}

export interface ChallengeTemplate {
  id: string;
  prompt: string;
  tags: string[];
}

export interface Constraint {
  id: string;
  text: string;
}

export interface DailyPrompt {
  date: string;
  seed: number;
  promptSeed: number;
  sourceSeed: number;
  dataSources: DataSource[];
  comboNote?: string;
  challenge: ChallengeTemplate;
  constraint: Constraint;
  twist: string;
}

export interface GenerateOptions {
  date?: string;
  promptSeed?: number;
  sourceSeed?: number;
  excludeSourceIds?: string[];
}
