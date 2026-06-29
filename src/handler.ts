import { getDataSourceById } from "./data/catalog.js";
import { loadOpenDataCatalog } from "./data/open-data-index.js";
import { fetchSourceData } from "./fetch-source.js";
import { generateDailyPrompt, parseGenerateOptions } from "./generate.js";
import { renderPromptPage, renderPromptPayload } from "./web/html.js";
import { renderOpenDataIndexPage } from "./web/open-data-index.js";
import { renderPitbullSuperheroPage } from "./web/pitbull-superhero.js";

export async function handleRequest(
  req: import("node:http").IncomingMessage,
  res: import("node:http").ServerResponse,
): Promise<void> {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  const excludeSourceIds = url.searchParams.getAll("exclude");
  const options = parseGenerateOptions(
    url.searchParams.get("date"),
    url.searchParams.get("promptSeed"),
    url.searchParams.get("sourceSeed"),
    excludeSourceIds.length > 0 ? excludeSourceIds : undefined,
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

  if (url.pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ ok: true, routes: ["/", "/open-data", "/api/prompt.json"] }));
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

  if (url.pathname === "/open-data" || url.pathname === "/open-data/") {
    const catalog = loadOpenDataCatalog();
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
    });
    res.end(renderOpenDataIndexPage(catalog));
    return;
  }

  if (url.pathname !== "/") {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  const prompt = generateDailyPrompt(options);
  res.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store, no-cache, must-revalidate",
    Pragma: "no-cache",
  });
  res.end(renderPromptPage(prompt));
}
