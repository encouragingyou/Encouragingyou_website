import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildCmsMigrationDiffReport,
  buildCmsPublishedCollections,
  buildCmsSchemaCatalog,
  buildCmsSeedDocuments,
  CMS_ARTIFACT_VERSION
} from "../src/lib/cms/content-model.js";

const siteRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const generatedDir = resolve(siteRoot, "src/data/generated");

async function writeJson(filename, value) {
  const absolutePath = resolve(generatedDir, filename);

  await mkdir(dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");

  return absolutePath;
}

const schemaCatalog = buildCmsSchemaCatalog();
const seedDocuments = buildCmsSeedDocuments();
const writeModelSeed = {
  version: CMS_ARTIFACT_VERSION,
  generatedAt: "2026-04-24T00:00:00.000Z",
  documentCount: seedDocuments.length,
  documents: seedDocuments
};
const publicReadModel = buildCmsPublishedCollections(seedDocuments);
const migrationDiffReport = buildCmsMigrationDiffReport(publicReadModel);

const schemaPath = await writeJson("cms-schema-catalog.json", schemaCatalog);
const seedPath = await writeJson("cms-write-model-seed.json", writeModelSeed);
const readModelPath = await writeJson("cms-public-read-model.json", publicReadModel);
const diffPath = await writeJson("cms-migration-diff-report.json", migrationDiffReport);

console.log(
  `[cms-generate] wrote schema catalog, write-model seed, public read model, and diff report to ${generatedDir}`
);
console.log(`[cms-generate] schema ${schemaPath}`);
console.log(`[cms-generate] seed ${seedPath}`);
console.log(`[cms-generate] read-model ${readModelPath}`);
console.log(`[cms-generate] diff ${diffPath}`);
