import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { startBuiltPreviewServer } from "./lib/preview-server.mjs";

const execFileAsync = promisify(execFile);
const scriptDir = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(scriptDir, "..");
const validationPort = Number(process.env.ADMIN_SURFACE_VALIDATION_PORT ?? "4334");
const baseUrl = `http://127.0.0.1:${validationPort}`;

async function main() {
  const server = await startBuiltPreviewServer({
    cwd: siteRoot,
    port: validationPort,
    env: {
      DEPLOYMENT_SURFACE: "admin",
      ADMIN_PORTAL_ENABLED: "true",
      ADMIN_ENABLE_DEV_BOOTSTRAP: "true",
      ADMIN_ORIGIN_URL: baseUrl,
      ADMIN_STORAGE_DIR: "./output/admin-surface/admin",
      ANALYTICS_MODE: "off"
    }
  });

  try {
    const { stdout, stderr } = await execFileAsync(
      "node",
      [
        "./scripts/verify-deployment.mjs",
        "--base-url",
        server.baseUrl,
        "--channel",
        "local",
        "--surface",
        "admin",
        "--attempts",
        "1",
        "--waitMs",
        "100"
      ],
      {
        cwd: siteRoot,
        env: {
          ...process.env
        }
      }
    );

    assert.ok(
      stdout.includes("[deploy-verify]"),
      "Expected admin surface verification to report success."
    );

    if (stderr.trim()) {
      console.warn(stderr.trim());
    }

    console.log(`[admin-surface-validate] ${stdout.trim()}`);
  } finally {
    await server.stop();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
