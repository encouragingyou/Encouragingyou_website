import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { resolveDeploymentContext } from "../src/lib/deployment/context.js";

const execFileAsync = promisify(execFile);
const siteRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const distRoot = resolve(siteRoot, "dist");
const releasesRoot = resolve(siteRoot, "output/releases");
const defaultCreatedAt = new Date().toISOString();
const deployment = resolveDeploymentContext({
  deploymentChannel: process.env.DEPLOYMENT_CHANNEL ?? "production",
  deploymentSurface: process.env.DEPLOYMENT_SURFACE
});
const releaseCreatedAt = deployment.releaseCreatedAt ?? defaultCreatedAt;
const stagingRoot = resolve(
  releasesRoot,
  `${deployment.surface}-${deployment.releaseId}`
);
const archivePath = resolve(
  releasesRoot,
  `encouragingyou-site-${deployment.surface}-${deployment.releaseId}.tgz`
);

async function assertDistExists() {
  const distStats = await stat(distRoot).catch(() => null);

  if (!distStats?.isDirectory()) {
    throw new Error("Release packaging requires an existing ./dist build artifact.");
  }
}

async function listFiles(root, current = root) {
  const entries = await readdir(current, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = resolve(current, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listFiles(root, absolutePath)));
      continue;
    }

    if (entry.isFile()) {
      files.push({
        absolutePath,
        relativePath: relative(root, absolutePath)
      });
    }
  }

  return files.sort((left, right) => left.relativePath.localeCompare(right.relativePath));
}

async function hashFile(filePath) {
  const source = await readFile(filePath);

  return createHash("sha256").update(source).digest("hex");
}

await assertDistExists();
await mkdir(releasesRoot, { recursive: true });
await rm(stagingRoot, { recursive: true, force: true });
await cp(distRoot, resolve(stagingRoot, "dist"), { recursive: true });

const stagedDistRoot = resolve(stagingRoot, "dist");
const distFiles = await listFiles(stagedDistRoot);
const checksums = await Promise.all(
  distFiles.map(async (file) => ({
    path: file.relativePath,
    sha256: await hashFile(file.absolutePath),
    sizeBytes: (await stat(file.absolutePath)).size
  }))
);
const manifest = {
  releaseId: deployment.releaseId,
  releaseSha: deployment.releaseSha,
  channel: deployment.channel,
  surface: deployment.surface,
  publicSiteUrl: deployment.publicSiteUrl,
  adminSiteUrl: deployment.adminSiteUrl,
  surfaceOriginUrl: deployment.surfaceOriginUrl,
  createdAt: releaseCreatedAt,
  artifact: {
    archiveFile: relative(siteRoot, archivePath),
    root: relative(siteRoot, stagedDistRoot)
  },
  checksums
};
const manifestPath = resolve(stagingRoot, "release-manifest.json");
const checksumsPath = resolve(stagingRoot, "release-checksums.txt");

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
await writeFile(
  checksumsPath,
  `${checksums.map((entry) => `${entry.sha256}  ${entry.path}`).join("\n")}\n`,
  "utf8"
);

await execFileAsync("tar", ["-czf", archivePath, "-C", stagingRoot, "."]);

console.log(
  `[release-package] wrote ${archivePath} for ${deployment.surface} with ${checksums.length} files and ${manifestPath}`
);
