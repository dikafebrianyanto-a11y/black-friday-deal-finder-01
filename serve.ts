// DealHawk local server: serves app/ at http://localhost:8080 so the site
// can be opened in a desktop browser and at a phone's size. Standard
// library only; it serves files and nothing else.
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(join(new URL(".", import.meta.url).pathname, "app"));
const PORT = Number(process.argv.find((arg) => arg.startsWith("--port="))?.split("=")[1] ?? 8080);

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

function safePath(urlPath: string): string | null {
  const cleaned = normalize(decodeURIComponent(urlPath.split("?")[0])).replace(/^(\.\.[/\\])+/, "");
  const full = join(ROOT, cleaned === "/" || cleaned === "" ? "index.html" : cleaned);
  return full === ROOT || full.startsWith(ROOT + sep) ? full : null;
}

const server = createServer((req, res) => {
  const path = safePath(req.url ?? "/");
  if (!path || !existsSync(path) || !statSync(path).isFile()) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("not found\n");
    return;
  }
  res.writeHead(200, { "content-type": TYPES[extname(path).toLowerCase()] ?? "application/octet-stream" });
  res.end(readFileSync(path));
});

server.listen(PORT, () => {
  console.log(`DealHawk serving app/ at http://localhost:${PORT}/`);
});
