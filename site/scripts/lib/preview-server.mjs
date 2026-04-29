import { spawn } from "node:child_process";
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { once } from "node:events";
import { extname, resolve, sep } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

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
    response.setHeader(
      "content-type",
      MIME_TYPES.get(extname(candidate).toLowerCase()) ?? "application/octet-stream"
    );

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
