import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { startBuiltPreviewServer } from "./lib/preview-server.mjs";

const siteRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const port = Number(process.env.PORT ?? process.env.PLAYWRIGHT_PORT ?? "4173");
const host = process.env.HOST ?? "127.0.0.1";

const server = await startBuiltPreviewServer({
  cwd: siteRoot,
  host,
  port
});

console.log(`[playwright-preview] Serving built output at ${server.baseUrl}`);

async function stopServer() {
  await server.stop();
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    stopServer()
      .catch((error) => {
        console.error(error);
        process.exitCode = 1;
      })
      .finally(() => process.exit());
  });
}

await new Promise(() => {});
