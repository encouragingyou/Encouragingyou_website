import assert from "node:assert/strict";
import { execFile as execFileCallback } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFile = promisify(execFileCallback);
const scriptDir = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(scriptDir, "..");

const allowedVulnerabilityPackages = new Set([
  "@astrojs/check",
  "@astrojs/language-server",
  "@astrojs/node",
  "@astrojs/vercel",
  "astro",
  "volar-service-yaml",
  "yaml",
  "yaml-language-server"
]);

const allowedAdvisoryUrls = new Set([
  "https://github.com/advisories/GHSA-3rmj-9m5h-8fpv",
  "https://github.com/advisories/GHSA-mr6q-rp88-fx84",
  "https://github.com/advisories/GHSA-c57f-mm3j-27q9",
  "https://github.com/advisories/GHSA-j687-52p2-xcff",
  "https://github.com/advisories/GHSA-48c2-rrv3-qjmp"
]);

function collectAdvisoryUrls(auditReport) {
  const urls = new Set();

  for (const vulnerability of Object.values(auditReport.vulnerabilities ?? {})) {
    for (const via of vulnerability.via ?? []) {
      if (typeof via === "object" && via.url) {
        urls.add(via.url);
      }
    }
  }

  return urls;
}

function collectDependencySources(packageJson) {
  const sources = [];
  const dependencyBlocks = ["dependencies", "devDependencies", "optionalDependencies"];

  for (const blockName of dependencyBlocks) {
    for (const [name, spec] of Object.entries(packageJson[blockName] ?? {})) {
      if (/^(file:|git\+|github:|https?:|workspace:)/u.test(spec)) {
        sources.push(`${name}@${spec}`);
      }
    }
  }

  return sources;
}

async function readAuditReport() {
  try {
    const { stdout } = await execFile("npm", ["audit", "--json"], {
      cwd: siteRoot,
      maxBuffer: 10 * 1024 * 1024
    });

    return JSON.parse(stdout);
  } catch (error) {
    const stdout = error.stdout?.toString?.() ?? "";

    if (stdout) {
      return JSON.parse(stdout);
    }

    throw error;
  }
}

const [packageJson, auditReport] = await Promise.all([
  readFile(resolve(siteRoot, "package.json"), "utf8").then((source) =>
    JSON.parse(source)
  ),
  readAuditReport()
]);

assert.ok(
  packageJson.packageManager?.startsWith("npm@"),
  "packageManager must stay pinned to npm for deterministic installs."
);
assert.ok(packageJson.engines?.node, "Node engine pin is required.");
assert.ok(packageJson.engines?.npm, "npm engine pin is required.");

const unsupportedDependencySources = collectDependencySources(packageJson);

assert.deepEqual(
  unsupportedDependencySources,
  [],
  "Only registry-backed dependencies are allowed in the public-site toolchain."
);

const vulnerabilityNames = Object.keys(auditReport.vulnerabilities ?? {});
const unexpectedPackages = vulnerabilityNames.filter(
  (name) => !allowedVulnerabilityPackages.has(name)
);

assert.deepEqual(
  unexpectedPackages,
  [],
  `Unexpected vulnerable packages found: ${unexpectedPackages.join(", ")}`
);

const advisoryUrls = collectAdvisoryUrls(auditReport);
const unexpectedAdvisories = [...advisoryUrls].filter(
  (url) => !allowedAdvisoryUrls.has(url)
);

assert.deepEqual(
  unexpectedAdvisories,
  [],
  `Unexpected advisory URLs found: ${unexpectedAdvisories.join(", ")}`
);

assert.equal(
  auditReport.metadata?.vulnerabilities?.high ?? 0,
  0,
  "High-severity advisories must not remain in the dependency graph."
);
assert.equal(
  auditReport.metadata?.vulnerabilities?.critical ?? 0,
  0,
  "Critical-severity advisories must not remain in the dependency graph."
);

console.log(
  `[audit-policy] ${vulnerabilityNames.length} known moderate findings remain. All map to the documented Astro 5, Vercel adapter, and checker upgrade holdovers, and no unexpected dependency sources were found.`
);
