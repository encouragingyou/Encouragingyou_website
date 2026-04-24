import { gzipSync } from "node:zlib";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, extname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { once } from "node:events";
import { setTimeout as delay } from "node:timers/promises";
import { spawn } from "node:child_process";

import {
  cachePolicy,
  performanceBudgetVersion,
  performanceSentinelRoutes,
  resolveHtmlCacheControl,
  resolvePerformanceTier,
  sharedPerformanceBudgets
} from "../src/lib/performance/policies.js";

const siteRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const clientRoot = resolve(siteRoot, "dist/client");
const astroAssetRoot = resolve(clientRoot, "_astro");
const reportPath = resolve(siteRoot, "src/data/generated/performance-budget-report.json");
const performancePort = Number(process.env.PERFORMANCE_PORT ?? "4329");
const performanceBaseUrl = `http://127.0.0.1:${performancePort}`;

async function walkFiles(rootDirectory) {
  const entries = await readdir(rootDirectory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = resolve(rootDirectory, entry.name);

      if (entry.isDirectory()) {
        return walkFiles(entryPath);
      }

      return entryPath;
    })
  );

  return files.flat();
}

function resolveClientAssetPath(publicPath) {
  const normalizedPath = publicPath.split(/[?#]/u)[0];

  if (!normalizedPath.startsWith("/")) {
    return null;
  }

  return resolve(clientRoot, normalizedPath.replace(/^\//u, ""));
}

async function readAssetSize(publicPath) {
  const assetPath = resolveClientAssetPath(publicPath);

  if (!assetPath) {
    return null;
  }

  try {
    const metadata = await stat(assetPath);

    return metadata.size;
  } catch {
    return null;
  }
}

function getImageTagAttributes(html) {
  return [...html.matchAll(/<img\b([^>]+)>/giu)].map((match) => match[1]);
}

function getTagAttributes(html, tagName) {
  return [...html.matchAll(new RegExp(`<${tagName}\\b([^>]+)>`, "giu"))].map(
    (match) => match[1]
  );
}

function getAttributeValue(attributeBlob, attributeName) {
  const expression = new RegExp(`${attributeName}="([^"]+)"`, "iu");
  const match = attributeBlob.match(expression);

  return match ? match[1] : null;
}

async function createAssetSizeReport(filePath) {
  const bytes = await readFile(filePath);

  return {
    file: `/${relative(clientRoot, filePath).replace(/\\/gu, "/")}`,
    rawBytes: bytes.byteLength,
    gzipBytes: gzipSync(bytes).byteLength
  };
}

const cssFiles = (await walkFiles(astroAssetRoot)).filter(
  (filePath) => extname(filePath) === ".css"
);
const jsFiles = (await walkFiles(astroAssetRoot)).filter(
  (filePath) => extname(filePath) === ".js"
);
const astroGeneratedMedia = (await walkFiles(astroAssetRoot)).filter((filePath) =>
  [".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif", ".svg"].includes(extname(filePath))
);

const sharedCssAssets = await Promise.all(cssFiles.map(createAssetSizeReport));
const sharedJsAssets = await Promise.all(jsFiles.map(createAssetSizeReport));

const routeReports = [];
const failures = [];

async function waitForServerReady(serverProcess) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (serverProcess.exitCode !== null) {
      throw new Error(
        `Performance server exited early with code ${serverProcess.exitCode}.`
      );
    }

    try {
      const response = await fetch(performanceBaseUrl);

      if (response.ok) {
        return;
      }
    } catch {
      // Server not ready yet.
    }

    await delay(200);
  }

  throw new Error("Timed out waiting for the performance validation server.");
}

const serverProcess = spawn("node", ["./dist/server/entry.mjs"], {
  cwd: siteRoot,
  env: {
    ...process.env,
    HOST: "127.0.0.1",
    PORT: String(performancePort)
  },
  stdio: ["ignore", "pipe", "pipe"]
});

const serverLogs = [];

serverProcess.stdout.on("data", (chunk) => {
  serverLogs.push(chunk.toString());
});

serverProcess.stderr.on("data", (chunk) => {
  serverLogs.push(chunk.toString());
});

try {
  await waitForServerReady(serverProcess);

  for (const route of performanceSentinelRoutes) {
    const tier = resolvePerformanceTier(route);
    const response = await fetch(new URL(route, performanceBaseUrl));

    if (!response.ok) {
      failures.push(`${route}: request returned ${response.status}.`);
      continue;
    }

    const html = await response.text();
    const htmlBytes = Buffer.byteLength(html);
    const linkAttributes = getTagAttributes(html, "link");
    const scriptAttributes = getTagAttributes(html, "script");
    const stylesheetHrefs = [
      ...new Set(
        linkAttributes
          .filter((attributes) => getAttributeValue(attributes, "rel") === "stylesheet")
          .map((attributes) => getAttributeValue(attributes, "href"))
          .filter(Boolean)
      )
    ];
    const moduleScriptSrcs = [
      ...new Set(
        scriptAttributes
          .filter((attributes) => getAttributeValue(attributes, "type") === "module")
          .map((attributes) => getAttributeValue(attributes, "src"))
          .filter(Boolean)
      )
    ];
    const fontPreloads = [
      ...new Set(
        linkAttributes
          .filter(
            (attributes) =>
              getAttributeValue(attributes, "rel") === "preload" &&
              getAttributeValue(attributes, "as") === "font"
          )
          .map((attributes) => getAttributeValue(attributes, "href"))
          .filter(Boolean)
      )
    ];
    const imageAttributes = getImageTagAttributes(html);
    const eagerImages = imageAttributes
      .filter((attributes) => {
        const loading = getAttributeValue(attributes, "loading");
        const fetchpriority = getAttributeValue(attributes, "fetchpriority");

        return loading === "eager" || fetchpriority === "high";
      })
      .map((attributes) => getAttributeValue(attributes, "src"))
      .filter(Boolean);

    const stylesheetBytes = (
      await Promise.all(stylesheetHrefs.map((href) => readAssetSize(href)))
    )
      .filter((size) => typeof size === "number")
      .reduce((total, size) => total + size, 0);
    const moduleScriptBytes = (
      await Promise.all(moduleScriptSrcs.map((src) => readAssetSize(src)))
    )
      .filter((size) => typeof size === "number")
      .reduce((total, size) => total + size, 0);
    const eagerImageBytes = (
      await Promise.all(eagerImages.map((src) => readAssetSize(src)))
    )
      .filter((size) => typeof size === "number")
      .reduce((total, size) => total + size, 0);

    const violations = [];

    if (htmlBytes > tier.htmlBytesMax) {
      violations.push(
        `HTML bytes ${htmlBytes} exceeded ${tier.htmlBytesMax} for ${tier.id}.`
      );
    }

    if (stylesheetHrefs.length > sharedPerformanceBudgets.stylesheetsPerPageMax) {
      violations.push(
        `Stylesheet count ${stylesheetHrefs.length} exceeded ${sharedPerformanceBudgets.stylesheetsPerPageMax}.`
      );
    }

    if (moduleScriptSrcs.length > sharedPerformanceBudgets.moduleScriptsPerPageMax) {
      violations.push(
        `Module script count ${moduleScriptSrcs.length} exceeded ${sharedPerformanceBudgets.moduleScriptsPerPageMax}.`
      );
    }

    if (fontPreloads.length > sharedPerformanceBudgets.fontPreloadsPerPageMax) {
      violations.push(
        `Font preload count ${fontPreloads.length} exceeded ${sharedPerformanceBudgets.fontPreloadsPerPageMax}.`
      );
    }

    if (stylesheetBytes > sharedPerformanceBudgets.clientCssBytesMax) {
      violations.push(
        `Stylesheet bytes ${stylesheetBytes} exceeded ${sharedPerformanceBudgets.clientCssBytesMax}.`
      );
    }

    if (moduleScriptBytes > sharedPerformanceBudgets.clientScriptBytesMax) {
      violations.push(
        `Module script bytes ${moduleScriptBytes} exceeded ${sharedPerformanceBudgets.clientScriptBytesMax}.`
      );
    }

    if (eagerImages.length > tier.eagerImageCountMax) {
      violations.push(
        `Eager image count ${eagerImages.length} exceeded ${tier.eagerImageCountMax} for ${tier.id}.`
      );
    }

    const expectedCacheControl = resolveHtmlCacheControl(route);
    const responseCacheControl = response.headers.get("cache-control");

    if (responseCacheControl !== expectedCacheControl) {
      violations.push(
        `Cache-Control "${responseCacheControl}" did not match "${expectedCacheControl}".`
      );
    }

    routeReports.push({
      route,
      tier: tier.id,
      htmlBytes,
      stylesheetBytes,
      moduleScriptBytes,
      fontPreloadCount: fontPreloads.length,
      eagerImageCount: eagerImages.length,
      eagerImageBytes,
      stylesheets: stylesheetHrefs,
      moduleScripts: moduleScriptSrcs,
      eagerImages,
      cacheControl: responseCacheControl,
      pass: violations.length === 0,
      violations
    });

    if (violations.length > 0) {
      failures.push(...violations.map((violation) => `${route}: ${violation}`));
    }
  }
} finally {
  serverProcess.kill("SIGTERM");
  await once(serverProcess, "exit").catch(() => undefined);
}

const legacyPayloadFailures = [];

for (const legacyPath of ["/assets/css/styles.css", "/assets/js/site.js"]) {
  const assetPath = resolveClientAssetPath(legacyPath);

  try {
    await stat(assetPath);
    legacyPayloadFailures.push(
      `Unexpected legacy payload still shipped at ${legacyPath}.`
    );
  } catch {
    // No-op.
  }
}

if (astroGeneratedMedia.length > sharedPerformanceBudgets.astroGeneratedMediaCountMax) {
  legacyPayloadFailures.push(
    `Generated ${astroGeneratedMedia.length} Astro media assets under /_astro, exceeding the zero-duplication budget.`
  );
}

failures.push(...legacyPayloadFailures);

const report = {
  version: performanceBudgetVersion,
  generatedAt: new Date().toISOString(),
  sharedAssets: {
    css: sharedCssAssets,
    js: sharedJsAssets,
    astroGeneratedMediaCount: astroGeneratedMedia.length,
    astroGeneratedMedia: astroGeneratedMedia.map(
      (filePath) => `/${relative(clientRoot, filePath).replace(/\\/gu, "/")}`
    )
  },
  sentinels: performanceSentinelRoutes.map(
    (route) =>
      routeReports.find((entry) => entry.route === route) ?? { route, missing: true }
  ),
  cachePolicy,
  serverLogs,
  routes: routeReports
};

await mkdir(dirname(reportPath), { recursive: true });
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);

if (failures.length > 0) {
  console.error("[perf-validate] Performance budget violations:");

  for (const failure of failures) {
    console.error(`- ${failure}`);
  }

  process.exit(1);
}

console.log(
  `[perf-validate] ${routeReports.length} routes checked; shared CSS ${sharedCssAssets.reduce(
    (total, asset) => total + asset.rawBytes,
    0
  )} bytes; shared JS ${sharedJsAssets.reduce((total, asset) => total + asset.rawBytes, 0)} bytes.`
);
console.log(`[perf-validate] wrote ${reportPath}`);
