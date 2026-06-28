import { getDataSourceById } from "./data/catalog.js";
import { fetchSourceData } from "./fetch-source.js";
import { generateDailyPrompt, parseGenerateOptions } from "./generate.js";
import { renderPromptPage, renderPromptPayload } from "./web/html.js";
import { renderPitbullSuperheroPage } from "./web/pitbull-superhero.js";

export async function handleRequest(
  req: import("node:http").IncomingMessage,
  res: import("node:http").ServerResponse,
): Promise<void> {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  const options = parseGenerateOptions(
    url.searchParams.get("date"),
    url.searchParams.get("promptSeed"),
    url.searchParams.get("sourceSeed"),
  );

  const dataMatch = url.pathname.match(/^\/api\/data\/([^/]+)$/);
  if (dataMatch) {
    const sourceId = decodeURIComponent(dataMatch[1]!);
    const source = getDataSourceById(sourceId);
    if (!source) {
      res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: `Unknown data source "${sourceId}".` }));
      return;
    }

    const payload = await fetchSourceData(source);
    res.writeHead(payload.ok ? 200 : 502, {
      "Content-Type": "application/json; charset=utf-8",
      "X-Source-Endpoint": payload.endpoint,
      "X-Source-Docs": payload.docsUrl,
      "Cache-Control": "public, max-age=300",
    });
    res.end(JSON.stringify(payload, null, 2));
    return;
  }

  if (url.pathname === "/api/today.json" || url.pathname === "/api/prompt.json") {
    const prompt = generateDailyPrompt(options);
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(renderPromptPayload(prompt), null, 2));
    return;
  }

  if (url.pathname === "/pitbull") {
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Pragma": "no-cache",
    });
    res.end(renderPitbullSuperheroPage());
    return;
  }

  if (url.pathname !== "/") {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  const prompt = generateDailyPrompt(options);
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(renderPromptPage(prompt));
}
