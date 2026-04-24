import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

import discovery from "../src/content/discovery/default.json" with { type: "json" };

const siteRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const publicRoot = resolve(siteRoot, "public");
const generatedDataRoot = resolve(siteRoot, "src/data/generated");
const outputDirectory = resolve(
  publicRoot,
  discovery.socialPreview.outputDirectory.replace(/^\//u, "")
);
const manifestPath = resolve(generatedDataRoot, "social-preview-manifest.json");

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function wrapText(value, maxChars, maxLines) {
  const words = value.split(/\s+/u);
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;

    if (candidate.length <= maxChars) {
      currentLine = candidate;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      lines.push(word);
      currentLine = "";
    }

    if (lines.length === maxLines) {
      break;
    }
  }

  if (lines.length < maxLines && currentLine) {
    lines.push(currentLine);
  }

  return lines.slice(0, maxLines).map((line, index, array) => {
    if (index !== array.length - 1) {
      return line;
    }

    return line.length > maxChars ? `${line.slice(0, maxChars - 1).trimEnd()}…` : line;
  });
}

function buildTextGroup(lines, x, y, fontSize, lineHeight, weight, fill, family) {
  return lines
    .map(
      (line, index) => `
      <text
        x="${x}"
        y="${y + index * lineHeight}"
        fill="${fill}"
        font-family="${family}"
        font-size="${fontSize}"
        font-weight="${weight}"
      >${escapeXml(line)}</text>`
    )
    .join("");
}

function buildPreviewSvg(family) {
  const { width, height } = discovery.socialPreview.canvas;
  const headlineLines = wrapText(family.headline, 28, 3);
  const supportingLines = wrapText(family.supportingText, 46, 3);
  const brand = discovery.socialPreview.brand;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(family.headline)}">
      <defs>
        <linearGradient id="bg-gradient-${family.id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#002635" />
          <stop offset="100%" stop-color="#0f4b5f" />
        </linearGradient>
        <linearGradient id="accent-gradient-${family.id}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${family.accentStart}" />
          <stop offset="100%" stop-color="${family.accentEnd}" />
        </linearGradient>
        <radialGradient id="mist-gradient-${family.id}" cx="82%" cy="14%" r="72%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.78)" />
          <stop offset="100%" stop-color="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>

      <rect width="${width}" height="${height}" fill="url(#bg-gradient-${family.id})" />
      <rect x="0" y="0" width="${width}" height="${height}" fill="url(#mist-gradient-${family.id})" opacity="0.38" />
      <circle cx="${width - 160}" cy="110" r="180" fill="url(#accent-gradient-${family.id})" opacity="0.24" />
      <circle cx="${width - 60}" cy="${height - 120}" r="240" fill="#f5f3ef" opacity="0.08" />
      <path d="M0 ${height - 120} C 200 ${height - 200}, 420 ${height - 20}, 640 ${height - 110} S 980 ${height - 210}, ${width} ${height - 140} L ${width} ${height} L 0 ${height} Z" fill="url(#accent-gradient-${family.id})" opacity="0.22" />

      <rect x="68" y="58" width="228" height="48" rx="24" fill="#fffdf8" opacity="0.92" />
      <text x="92" y="90" fill="#002635" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700">${escapeXml(family.eyebrow)}</text>

      <text x="72" y="156" fill="#f8e8d0" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700" letter-spacing="2.5">${escapeXml(brand.siteName.toUpperCase())}</text>
      ${buildTextGroup(headlineLines, 72, 248, 72, 86, 700, "#fffdf8", "Georgia, 'Times New Roman', serif")}
      ${buildTextGroup(supportingLines, 72, 454, 32, 42, 500, "#f5f3ef", "Arial, Helvetica, sans-serif")}

      <rect x="72" y="${height - 108}" width="392" height="54" rx="27" fill="#002635" opacity="0.34" />
      <text x="96" y="${height - 72}" fill="#fffdf8" font-family="Arial, Helvetica, sans-serif" font-size="23" font-weight="600">${escapeXml(brand.strapline)}</text>

      <text x="${width - 352}" y="${height - 70}" fill="#f8e8d0" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="600">${escapeXml(brand.launchTruthNote)}</text>
    </svg>
  `;
}

await mkdir(outputDirectory, { recursive: true });
await mkdir(generatedDataRoot, { recursive: true });

const manifest = {
  outputDirectory: discovery.socialPreview.outputDirectory,
  canvas: discovery.socialPreview.canvas,
  assets: []
};

for (const family of discovery.socialPreview.families) {
  const filename = `${family.id}.png`;
  const publicPath = `${discovery.socialPreview.outputDirectory}/${filename}`;
  const outputPath = resolve(outputDirectory, filename);
  const svg = buildPreviewSvg(family);

  await sharp(Buffer.from(svg)).png().toFile(outputPath);

  manifest.assets.push({
    id: family.id,
    routeFamilies: family.routeFamilies,
    publicPath,
    width: discovery.socialPreview.canvas.width,
    height: discovery.socialPreview.canvas.height,
    alt: `Social preview graphic for ${family.eyebrow.toLowerCase()} with EncouragingYou branding.`
  });

  console.log(`[social-preview] wrote ${outputPath}`);
}

await writeFile(`${manifestPath}`, JSON.stringify(manifest, null, 2));

console.log(
  `[social-preview] generated ${manifest.assets.length} preview assets and ${manifestPath}`
);
