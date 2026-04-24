import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

import {
  listRouteRecords,
  normalizeDiscoveryPath
} from "../src/lib/content/discovery.js";
import { startBuiltPreviewServer } from "./lib/preview-server.mjs";

const siteRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const validationPort = Number(process.env.LINK_VALIDATION_PORT ?? "4331");
const routeRecords = listRouteRecords().filter((record) => record.pageId !== "not-found");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function unique(values) {
  return [...new Set(values)];
}

function getTagAttributes(html, tagName) {
  return [...html.matchAll(new RegExp(`<${tagName}\\b([^>]+)>`, "giu"))].map(
    (match) => match[1]
  );
}

function getAttributeValue(attributeBlob, attributeName) {
  const expression = new RegExp(`\\b${attributeName}=(?:"([^"]+)"|'([^']+)')`, "iu");
  const match = attributeBlob.match(expression);

  return match ? (match[1] ?? match[2] ?? null) : null;
}

function getMetaContentReferences(html) {
  return getTagAttributes(html, "meta")
    .filter((attributes) => {
      const property = getAttributeValue(attributes, "property");
      const name = getAttributeValue(attributes, "name");

      return ["og:image", "twitter:image"].includes(property ?? name ?? "");
    })
    .map((attributes) => getAttributeValue(attributes, "content"))
    .filter(Boolean);
}

function getIdSet(html) {
  return new Set(
    [...html.matchAll(/\bid=(?:"([^"]+)"|'([^']+)')/giu)].map(
      (match) => match[1] ?? match[2]
    )
  );
}

function parseSrcset(value) {
  return value
    .split(",")
    .map((entry) => entry.trim().split(/\s+/u)[0])
    .filter(Boolean);
}

function isSkippableReference(value) {
  return /^(?:mailto|tel|javascript):/iu.test(value);
}

function resolveInternalPath(value, origin) {
  if (!value || isSkippableReference(value)) {
    return null;
  }

  if (value.startsWith("#")) {
    return value;
  }

  const resolvedUrl = new URL(value, origin);

  if (resolvedUrl.origin !== origin) {
    return null;
  }

  return `${resolvedUrl.pathname}${resolvedUrl.search}${resolvedUrl.hash}`;
}

function hasFileExtension(pathname) {
  const barePath = pathname.split(/[?#]/u)[0] ?? pathname;

  return /\.[a-z0-9]+$/iu.test(barePath);
}

function buildDocumentPath(pathname) {
  const barePath = pathname.split(/[?#]/u)[0] ?? pathname;

  return normalizeDiscoveryPath(barePath);
}

function buildRequestPath(pathname) {
  return pathname.split("#")[0] ?? pathname;
}

function extractInternalReferences(html, origin) {
  const hrefReferences = [
    ...getTagAttributes(html, "a").map((attributes) => ({
      source: "a[href]",
      value: getAttributeValue(attributes, "href")
    })),
    ...getTagAttributes(html, "link").map((attributes) => ({
      source: "link[href]",
      value: getAttributeValue(attributes, "href")
    }))
  ];
  const srcReferences = [
    ...getTagAttributes(html, "img").map((attributes) => ({
      source: "img[src]",
      value: getAttributeValue(attributes, "src")
    })),
    ...getTagAttributes(html, "script").map((attributes) => ({
      source: "script[src]",
      value: getAttributeValue(attributes, "src")
    })),
    ...getTagAttributes(html, "source").map((attributes) => ({
      source: "source[src]",
      value: getAttributeValue(attributes, "src")
    }))
  ];
  const srcsetReferences = [
    ...getTagAttributes(html, "img").flatMap((attributes) =>
      parseSrcset(getAttributeValue(attributes, "srcset") ?? "").map((value) => ({
        source: "img[srcset]",
        value
      }))
    ),
    ...getTagAttributes(html, "source").flatMap((attributes) =>
      parseSrcset(getAttributeValue(attributes, "srcset") ?? "").map((value) => ({
        source: "source[srcset]",
        value
      }))
    )
  ];
  const metaReferences = getMetaContentReferences(html).map((value) => ({
    source: "meta[content]",
    value
  }));

  return [...hrefReferences, ...srcReferences, ...srcsetReferences, ...metaReferences]
    .map((reference) => {
      const internalPath = resolveInternalPath(reference.value, origin);

      if (!internalPath) {
        return null;
      }

      if (internalPath.startsWith("#")) {
        return {
          kind: "anchor",
          source: reference.source,
          hash: internalPath.slice(1)
        };
      }

      const [withoutHash, hash = ""] = internalPath.split("#");
      const requestPath = buildRequestPath(withoutHash);

      if (hasFileExtension(requestPath)) {
        return {
          kind: "asset",
          source: reference.source,
          requestPath
        };
      }

      return {
        kind: "route",
        source: reference.source,
        requestPath,
        documentPath: buildDocumentPath(requestPath),
        hash
      };
    })
    .filter(Boolean);
}

async function main() {
  const preview = await startBuiltPreviewServer({
    cwd: siteRoot,
    port: validationPort
  });
  const failures = new Set();
  const documentCache = new Map();
  const assetCache = new Map();
  const queuedRoutes = new Set();
  let referenceCount = 0;

  async function loadDocument(documentPath) {
    if (documentCache.has(documentPath)) {
      return documentCache.get(documentPath);
    }

    const response = await fetch(new URL(documentPath, preview.baseUrl));
    const contentType = response.headers.get("content-type") ?? "";
    const html = contentType.includes("text/html") ? await response.text() : "";
    const document = {
      documentPath,
      status: response.status,
      ids: getIdSet(html),
      references: extractInternalReferences(html, preview.baseUrl)
    };

    documentCache.set(documentPath, document);

    return document;
  }

  async function validateAsset(requestPath) {
    if (assetCache.has(requestPath)) {
      return assetCache.get(requestPath);
    }

    const response = await fetch(new URL(requestPath, preview.baseUrl));
    const status = response.status;

    assetCache.set(requestPath, status);

    return status;
  }

  try {
    const routeQueue = unique(
      routeRecords.map((record) => normalizeDiscoveryPath(record.route))
    );

    for (const route of routeQueue) {
      queuedRoutes.add(route);
      const document = await loadDocument(route);

      if (document.status >= 400) {
        failures.add(`Canonical route ${route} returned ${document.status}.`);
      }
    }

    while (routeQueue.length > 0) {
      const currentPath = routeQueue.shift();
      const document = documentCache.get(currentPath);

      if (!document) {
        continue;
      }

      for (const reference of document.references) {
        referenceCount += 1;

        if (reference.kind === "anchor") {
          if (!document.ids.has(reference.hash)) {
            failures.add(
              `${currentPath}: ${reference.source} points to missing anchor "#${reference.hash}".`
            );
          }

          continue;
        }

        if (reference.kind === "asset") {
          const status = await validateAsset(reference.requestPath);

          if (status >= 400) {
            failures.add(
              `${currentPath}: ${reference.source} points to missing asset ${reference.requestPath} (${status}).`
            );
          }

          continue;
        }

        const targetDocument = await loadDocument(reference.documentPath);

        if (targetDocument.status >= 400) {
          failures.add(
            `${currentPath}: ${reference.source} points to route ${reference.requestPath} (${targetDocument.status}).`
          );
          continue;
        }

        if (reference.hash && !targetDocument.ids.has(reference.hash)) {
          failures.add(
            `${currentPath}: ${reference.source} points to missing anchor "#${reference.hash}" on ${reference.requestPath}.`
          );
        }

        if (!queuedRoutes.has(reference.documentPath)) {
          queuedRoutes.add(reference.documentPath);
          routeQueue.push(reference.documentPath);
        }
      }
    }
  } finally {
    await preview.stop();
  }

  assert(
    failures.size === 0,
    `First-party link validation failed:\n${[...failures].sort().join("\n")}`
  );

  console.log(
    `[links-validate] validated ${documentCache.size} documents, ${assetCache.size} assets, and ${referenceCount} first-party references`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
