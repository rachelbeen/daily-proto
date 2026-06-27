import type { DataSource } from "./types.js";

const USER_AGENT = "daily-proto/1.0 (+https://github.com/daily-proto)";

export interface FetchedSourceData {
  ok: boolean;
  status: number;
  sourceId: string;
  sourceName: string;
  endpoint: string;
  docsUrl: string;
  auth: DataSource["auth"];
  contentType: string | null;
  body: unknown;
  error?: string;
}

export async function fetchSourceData(source: DataSource): Promise<FetchedSourceData> {
  const base = {
    sourceId: source.id,
    sourceName: source.name,
    endpoint: source.exampleEndpoint,
    docsUrl: source.docsUrl,
    auth: source.auth,
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    const response = await fetch(source.exampleEndpoint, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json, text/plain, */*",
      },
    });

    clearTimeout(timeout);

    const contentType = response.headers.get("content-type");
    const text = await response.text();

    let body: unknown = text;
    if (contentType?.includes("json") || text.trim().startsWith("{") || text.trim().startsWith("[")) {
      try {
        body = JSON.parse(text);
      } catch {
        body = text;
      }
    }

    if (!response.ok) {
      return {
        ...base,
        ok: false,
        status: response.status,
        contentType,
        body,
        error:
          source.auth === "free-key"
            ? "This API returned an error. You may need your own free API key — see API docs."
            : `Upstream API returned HTTP ${response.status}.`,
      };
    }

    return {
      ...base,
      ok: true,
      status: response.status,
      contentType,
      body,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed";
    return {
      ...base,
      ok: false,
      status: 502,
      contentType: null,
      body: null,
      error:
        source.auth === "free-key"
          ? `${message}. This source usually needs a free API key — check API docs.`
          : message,
    };
  }
}
