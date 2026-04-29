import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PLAYWRIGHT_PORT ?? "4173");
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${port}`;
const deploymentSurface =
  process.env.PLAYWRIGHT_DEPLOYMENT_SURFACE ?? process.env.DEPLOYMENT_SURFACE ?? "shared";
const previewEnvEntries = {
  ENQUIRY_STORAGE_DIR: "./output/playwright/enquiries",
  ANALYTICS_STORAGE_DIR: "./output/playwright/analytics",
  ANALYTICS_MODE: deploymentSurface === "admin" ? "off" : "statistical",
  DEPLOYMENT_SURFACE: deploymentSurface,
  ADMIN_PORTAL_ENABLED: deploymentSurface === "public" ? "false" : "true"
};

if (deploymentSurface !== "public") {
  previewEnvEntries.ADMIN_STORAGE_DIR = "./output/playwright/admin";
  previewEnvEntries.ADMIN_ENABLE_DEV_BOOTSTRAP = "true";
  previewEnvEntries.ADMIN_ORIGIN_URL = baseURL;
}

const previewEnv = Object.entries(previewEnvEntries)
  .map(([key, value]) => `${key}=${value}`)
  .join(" ");
const previewServerCommand = `${previewEnv} HOST=127.0.0.1 PORT=${port} node ./scripts/serve-built-preview.mjs`;
const previewCommand =
  process.env.PLAYWRIGHT_SKIP_BUILD === "1"
    ? previewServerCommand
    : `npm run build --workspaces=false && ${previewServerCommand}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,
  expect: {
    timeout: 5_000
  },
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "./output/playwright/report" }]
  ],
  outputDir: "./output/playwright/artifacts",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 10_000,
    navigationTimeout: 15_000
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"]
      }
    }
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: previewCommand,
        port,
        reuseExistingServer: process.env.PLAYWRIGHT_REUSE_EXISTING_SERVER === "1",
        timeout: 120_000
      }
});
