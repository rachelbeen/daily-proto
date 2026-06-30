import type { DataSource } from "./types.js";

const HOST_KEY_ENV: Record<string, string> = {
  "api.nasa.gov": "NASA_API_KEY",
};

/** Replace placeholder API keys with values from the environment before fetching. */
export function resolveSourceEndpoint(source: DataSource): string {
  let endpoint = source.exampleEndpoint;

  try {
    const host = new URL(endpoint).hostname;
    const envName = HOST_KEY_ENV[host];
    if (!envName) return endpoint;

    const apiKey = process.env[envName]?.trim();
    if (!apiKey) return endpoint;

    const url = new URL(endpoint);
    if (url.searchParams.has("api_key")) {
      url.searchParams.set("api_key", apiKey);
      return url.toString();
    }
    if (url.searchParams.has("API_KEY")) {
      url.searchParams.set("API_KEY", apiKey);
      return url.toString();
    }
    url.searchParams.set("api_key", apiKey);
    return url.toString();
  } catch {
    return endpoint.replace(/api_key=DEMO_KEY/gi, `api_key=${encodeURIComponent(process.env.NASA_API_KEY ?? "")}`);
  }
}
