import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

import sharp from "sharp";

import mediaLibrary from "../src/content/mediaLibrary/default.json" with { type: "json" };
import notices from "../src/content/notices/default.json" with { type: "json" };

const siteRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const repoRoot = resolve(siteRoot, "..");
const publicRoot = resolve(siteRoot, "public");

const noticeIds = new Set(notices.notices.map((notice) => notice.id));
const noticeIndex = new Map(notices.notices.map((notice) => [notice.id, notice]));
const mediaIds = new Set();
const restrictedAiRouteFamilies = [
  "gallery",
  "testimonials",
  "team",
  "impact-proof",
  "event-recap-evidence",
  "safeguarding"
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertNear(actual, expected, message) {
  if (expected === null) {
    return;
  }

  if (Math.abs(actual - expected) > 2) {
    throw new Error(`${message}. Expected ${expected}, received ${actual}.`);
  }
}

async function assertFileExists(filePath, label) {
  try {
    await access(filePath);
  } catch {
    throw new Error(`${label} does not exist: ${filePath}`);
  }
}

for (const asset of mediaLibrary.assets) {
  assert(!mediaIds.has(asset.id), `Duplicate media id: ${asset.id}`);
  mediaIds.add(asset.id);

  assert(
    asset.decorative ? asset.alt === "" : asset.alt.trim().length > 0,
    `Alt text strategy mismatch for ${asset.id}`
  );
  assert(
    asset.decorative === (asset.altStrategy === "decorative"),
    `Decorative flag does not match alt strategy for ${asset.id}`
  );

  if (asset.requiresDisclosure) {
    assert(
      asset.aiGenerated,
      `Disclosure-required asset must be AI-generated: ${asset.id}`
    );
    assert(
      asset.noticeId && noticeIds.has(asset.noticeId),
      `Unknown notice id for ${asset.id}`
    );
    assert(
      asset.disclosure.mode === "contextual",
      `Disclosure-required asset must use contextual disclosure rules: ${asset.id}`
    );
    assert(
      asset.disclosure.prominentContexts.length > 0,
      `Disclosure-required asset must define prominent disclosure contexts: ${asset.id}`
    );

    const notice = noticeIndex.get(asset.noticeId);

    assert(
      Boolean(
        notice?.variants?.prominent &&
        notice?.variants?.compact &&
        notice?.variants?.sitewide
      ),
      `Disclosure notice must define prominent, compact, and sitewide variants: ${asset.id}`
    );
  } else {
    assert(
      asset.disclosure.mode === "none",
      `Non-disclosed asset must declare disclosure mode 'none': ${asset.id}`
    );
    assert(
      asset.noticeId === null,
      `Non-disclosed asset must not set a notice id: ${asset.id}`
    );
  }

  if (asset.kind === "illustration") {
    assert(
      asset.sourceType !== "ai-generated-icon",
      `Illustration source type cannot be an icon for ${asset.id}`
    );

    if (asset.sourceType.startsWith("ai-generated")) {
      assert(
        asset.evidenceUse === "illustrative-only",
        `AI illustration cannot be treated as evidence-bearing media: ${asset.id}`
      );
      assert(
        asset.trustImpact !== "evidence-bearing",
        `AI illustration must not be classified as evidence-bearing: ${asset.id}`
      );
      assert(
        asset.participantRepresentation === "synthetic-people" ||
          asset.participantRepresentation === "synthetic-symbolic",
        `AI illustration must declare synthetic representation: ${asset.id}`
      );

      for (const routeFamily of restrictedAiRouteFamilies) {
        assert(
          asset.restrictedRouteFamilies.includes(routeFamily),
          `AI illustration is missing restricted route family '${routeFamily}': ${asset.id}`
        );
      }
    }

    assert(
      asset.replacementSourceType !== "vector-icon",
      `Illustration replacement source cannot be a vector icon: ${asset.id}`
    );
  }

  if (asset.kind === "icon") {
    assert(
      asset.sourceType === "ai-generated-icon",
      `Icon must declare ai-generated-icon source type: ${asset.id}`
    );
    assert(
      asset.evidenceUse === "wayfinding-only",
      `Icon must stay in wayfinding-only evidence mode: ${asset.id}`
    );
    assert(
      asset.replacementSourceType === "vector-icon",
      `Icon replacement source must be vector-icon: ${asset.id}`
    );
    assert(
      asset.disclosure.mode === "none",
      `Icon assets must not render visible disclosure notes: ${asset.id}`
    );
    assert(
      asset.restrictedRouteFamilies.length === 0,
      `Icon assets should not carry route-family restrictions: ${asset.id}`
    );
  }

  if (asset.consentStatus === "approved-time-limited") {
    assert(
      Boolean(asset.reviewExpiry),
      `Time-limited approved media must define reviewExpiry: ${asset.id}`
    );
  }

  if (asset.consentStatus === "not-applicable-synthetic") {
    assert(
      asset.reviewExpiry === null,
      `Synthetic media should not define reviewExpiry: ${asset.id}`
    );
  }

  if (asset.kind === "illustration") {
    assert(
      Array.isArray(asset.astroDelivery.responsiveWidths) &&
        asset.astroDelivery.responsiveWidths.length > 0,
      `Illustration must define responsive Astro widths: ${asset.id}`
    );
    assert(
      asset.astroDelivery.defaultWidth !== null,
      `Illustration must define a default Astro width: ${asset.id}`
    );
  }

  if (asset.kind === "icon") {
    assert(
      asset.astroDelivery.fixedWidth !== null && asset.astroDelivery.fixedHeight !== null,
      `Icon must define fixed Astro dimensions: ${asset.id}`
    );
    assert(
      asset.astroDelivery.responsiveWidths === null,
      `Icon must not define responsive widths: ${asset.id}`
    );
  }

  const sourcePath = resolve(repoRoot, asset.canonicalSourcePath);
  const masterPath = resolve(siteRoot, asset.masterAssetPath);

  await assertFileExists(sourcePath, `Canonical source for ${asset.id}`);
  await assertFileExists(masterPath, `Local master copy for ${asset.id}`);

  const sourceMetadata = await sharp(sourcePath).metadata();

  assert(
    sourceMetadata.width === asset.masterDimensions.width &&
      sourceMetadata.height === asset.masterDimensions.height,
    `Manifest dimensions do not match source file for ${asset.id}`
  );

  for (const render of asset.compatibilityRenders) {
    const renderPath = resolve(publicRoot, render.publicPath.replace(/^\//u, ""));

    await assertFileExists(renderPath, `Compatibility render for ${asset.id}`);

    if (render.format === "svg") {
      continue;
    }

    const renderMetadata = await sharp(renderPath).metadata();

    assertNear(
      renderMetadata.width ?? 0,
      render.width,
      `Render width mismatch for ${asset.id} at ${render.publicPath}`
    );
    assertNear(
      renderMetadata.height ?? 0,
      render.height,
      `Render height mismatch for ${asset.id} at ${render.publicPath}`
    );
  }
}

const directPathTargets = [
  resolve(siteRoot, "src/components"),
  resolve(siteRoot, "src/layouts"),
  resolve(siteRoot, "src/lib"),
  resolve(siteRoot, "src/pages")
];

const bridgeManifestSource = await readFile(
  resolve(siteRoot, "src/lib/legacy/bridge-manifest.js"),
  "utf8"
);

assert(
  !bridgeManifestSource.includes('publicPath: "/icons/"') &&
    !bridgeManifestSource.includes('publicPath: "/images/"'),
  "Legacy bridge manifest still treats /icons or /images as copied prototype directories."
);

for (const target of directPathTargets) {
  let stdout;
  try {
    stdout = execFileSync(
      "rg",
      ["-n", "/(images|icons)/", target, "-g", "!**/catalog.ts"],
      {
        cwd: repoRoot,
        encoding: "utf8"
      }
    );
  } catch (error) {
    if (error?.status === 1) {
      stdout = "";
    } else {
      throw error;
    }
  }

  assert(
    stdout.trim().length === 0,
    `Direct /images or /icons references remain inside the production app:\n${stdout}`
  );
}

console.log(`[media-validate] validated ${mediaLibrary.assets.length} assets`);
