import { spawn } from "node:child_process";
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { once } from "node:events";
import { extname, resolve, sep } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

import {
  getDeploymentHeaders,
  resolveDeploymentContext
} from "../../src/lib/deployment/context.js";
import { resolveHtmlCacheControl } from "../../src/lib/performance/policies.js";
import { getSecurityHeaders } from "../../src/lib/security/policy.js";

function formatLogs(logs) {
  return logs.join("").trim();
}

const MIME_TYPES = new Map([
  [".avif", "image/avif"],
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ics", "text/calendar; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"],
  [".woff2", "font/woff2"],
  [".xml", "application/xml; charset=utf-8"],
  [".txt", "text/plain; charset=utf-8"]
]);

function getStaticCandidates(staticRoot, pathname) {
  const decodedPathname = decodeURIComponent(pathname);
  const routePath = decodedPathname.endsWith("/")
    ? `${decodedPathname}index.html`
    : decodedPathname;
  const candidates = [resolve(staticRoot, `.${routePath}`)];

  if (!decodedPathname.endsWith("/")) {
    candidates.push(resolve(staticRoot, `.${decodedPathname}/index.html`));
  }

  return candidates.filter(
    (candidate) => candidate === staticRoot || candidate.startsWith(`${staticRoot}${sep}`)
  );
}

function toFetchHeaders(requestHeaders) {
  const headers = new Headers();

  for (const [key, value] of Object.entries(requestHeaders)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(key, item);
      }
    } else if (value) {
      headers.set(key, value);
    }
  }

  return headers;
}

function applyStaticPreviewHeaders({ request, response, contentType, html, pathname }) {
  const requestUrl = new URL(
    request.url ?? "/",
    `http://${request.headers.host ?? "127.0.0.1"}`
  );
  const requestHeaders = toFetchHeaders(request.headers);
  const deployment = resolveDeploymentContext();

  for (const [headerName, headerValue] of Object.entries(
    getSecurityHeaders({
      contentType,
      html,
      requestUrl: requestUrl.toString(),
      headers: requestHeaders,
      isDevRuntime: false
    })
  )) {
    response.setHeader(headerName, headerValue);
  }

  for (const [headerName, headerValue] of Object.entries(
    getDeploymentHeaders(deployment)
  )) {
    response.setHeader(headerName, headerValue);
  }

  if (contentType.includes("text/html")) {
    response.setHeader("Cache-Control", resolveHtmlCacheControl(pathname));

    if (!deployment.searchIndexingAllowed) {
      response.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
    }
  }
}

function tryServeStatic({ request, response, staticRoot }) {
  const url = new URL(request.url ?? "/", "http://127.0.0.1");

  for (const candidate of getStaticCandidates(staticRoot, url.pathname)) {
    if (!existsSync(candidate)) {
      continue;
    }

    const stats = statSync(candidate);
    if (!stats.isFile()) {
      continue;
    }

    response.statusCode = 200;
    const contentType =
      MIME_TYPES.get(extname(candidate).toLowerCase()) ?? "application/octet-stream";

    response.setHeader("content-type", contentType);

    if (contentType.includes("text/html")) {
      const html = readFileSync(candidate, "utf8");

      applyStaticPreviewHeaders({
        request,
        response,
        contentType,
        html,
        pathname: url.pathname
      });

      if (request.method === "HEAD") {
        response.end();
        return true;
      }

      response.end(html);
      return true;
    }

    if (request.method === "HEAD") {
      response.end();
      return true;
    }

    createReadStream(candidate).pipe(response);
    return true;
  }

  return false;
}

async function startVercelPreviewServer({ cwd, port, host, env }) {
  const entryPath = resolve(cwd, ".vercel/output/_functions/entry.mjs");
  const staticRoot = resolve(cwd, ".vercel/output/static");
  const baseUrl = `http://${host}:${port}`;
  const logs = [];
  const previousEnv = {};
  const envOverrides = {
    ...env,
    HOST: host,
    PORT: String(port)
  };

  for (const [key, value] of Object.entries(envOverrides)) {
    previousEnv[key] = process.env[key];
    process.env[key] = value;
  }

  const { default: handler } = await import(`${entryPath}?t=${Date.now()}`);
  const server = createServer((request, response) => {
    if (tryServeStatic({ request, response, staticRoot })) {
      return;
    }

    handler(request, response).catch((error) => {
      logs.push(`${error.stack ?? error.message}\n`);
      if (!response.headersSent) {
        response.statusCode = 500;
      }
      response.end("Internal Server Error");
    });
  });

  await new Promise((resolveListen, rejectListen) => {
    server.once("error", rejectListen);
    server.listen(port, host, () => {
      server.off("error", rejectListen);
      resolveListen();
    });
  });

  return {
    baseUrl,
    logs,
    serverProcess: server,
    async stop() {
      await new Promise((resolveClose) => {
        server.close(() => resolveClose());
      });

      for (const [key, value] of Object.entries(previousEnv)) {
        if (value === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = value;
        }
      }
    }
  };
}

export async function startBuiltPreviewServer({
  cwd,
  port,
  host = "127.0.0.1",
  env = {}
}) {
  if (
    !existsSync(resolve(cwd, "dist/server/entry.mjs")) &&
    existsSync(resolve(cwd, ".vercel/output/_functions/entry.mjs"))
  ) {
    return startVercelPreviewServer({ cwd, port, host, env });
  }

  const baseUrl = `http://${host}:${port}`;
  const logs = [];
  const serverProcess = spawn("node", ["./dist/server/entry.mjs"], {
    cwd,
    env: {
      ...process.env,
      ...env,
      HOST: host,
      PORT: String(port)
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  serverProcess.stdout.on("data", (chunk) => {
    logs.push(chunk.toString());
  });

  serverProcess.stderr.on("data", (chunk) => {
    logs.push(chunk.toString());
  });

  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (serverProcess.exitCode !== null) {
      throw new Error(
        `Preview server exited early with code ${serverProcess.exitCode}.\n${formatLogs(logs)}`
      );
    }

    try {
      const response = await fetch(baseUrl);

      if (response.ok) {
        return {
          baseUrl,
          logs,
          serverProcess,
          async stop() {
            if (serverProcess.exitCode !== null) {
              return;
            }

            serverProcess.kill("SIGTERM");
            for (let attempt = 0; attempt < 20; attempt += 1) {
              if (serverProcess.exitCode !== null) {
                return;
              }

              await delay(100);
            }

            if (serverProcess.exitCode === null) {
              serverProcess.kill("SIGKILL");
              await once(serverProcess, "exit");
            }
          }
        };
      }
    } catch {
      // Server not ready yet.
    }

    await delay(200);
  }

  serverProcess.kill("SIGTERM");
  throw new Error(`Timed out waiting for the preview server.\n${formatLogs(logs)}`);
}
