import { createReadStream, existsSync, statSync } from "node:fs";
import http from "node:http";
import { extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = fileURLToPath(new URL(".", import.meta.url));
const siteRoot = resolve(scriptDirectory, "..");
const repoRoot = resolve(siteRoot, "..");
const port = Number(process.env.PORT ?? "4173");
const host = process.env.HOST ?? "127.0.0.1";

const runtimeCandidates = [
  process.env.PLAYWRIGHT_SITE_ROOT
    ? resolve(siteRoot, process.env.PLAYWRIGHT_SITE_ROOT)
    : null,
  resolve(siteRoot, "dist"),
  resolve(repoRoot, "source", "blurpint")
].filter(Boolean);

const previewRoot = runtimeCandidates.find((candidate) => existsSync(candidate));

if (!previewRoot) {
  throw new Error(
    "No preview root found. Set PLAYWRIGHT_SITE_ROOT or provide site/dist or source/blurpint."
  );
}

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".xml", "application/xml; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".webp", "image/webp"],
  [".avif", "image/avif"],
  [".woff2", "font/woff2"],
  [".txt", "text/plain; charset=utf-8"],
  [".ics", "text/calendar; charset=utf-8"]
]);

function getCandidateFiles(pathname) {
  if (pathname === "/") {
    return ["/index.html"];
  }

  if (pathname.endsWith("/")) {
    return [`${pathname}index.html`];
  }

  return [pathname, `${pathname}.html`, `${pathname}/index.html`];
}

function resolveFile(pathname) {
  const decodedPath = decodeURIComponent(pathname);

  for (const candidate of getCandidateFiles(decodedPath)) {
    const filePath = resolve(previewRoot, `.${candidate}`);

    if (!filePath.startsWith(previewRoot)) {
      continue;
    }

    if (existsSync(filePath) && statSync(filePath).isFile()) {
      return filePath;
    }
  }

  return null;
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? host}`);
  const filePath = resolveFile(url.pathname);

  if (!filePath) {
    response.writeHead(404, {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store"
    });
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "Content-Type": mimeTypes.get(extname(filePath)) ?? "application/octet-stream",
    "Cache-Control": "no-store"
  });

  createReadStream(filePath).pipe(response);
});

server.listen(port, host, () => {
  console.log(`[playwright-preview] Serving ${previewRoot} at http://${host}:${port}`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
  });
}
