import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildRobotsTxt,
  buildSitemapXml,
  listSitemapRouteRecords
} from "../src/lib/content/discovery.js";

const siteRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const publicRoot = resolve(siteRoot, "public");

await mkdir(publicRoot, { recursive: true });

const robotsPath = resolve(publicRoot, "robots.txt");
const sitemapPath = resolve(publicRoot, "sitemap.xml");
const sitemapRoutes = listSitemapRouteRecords();

await writeFile(robotsPath, buildRobotsTxt());
await writeFile(sitemapPath, buildSitemapXml(sitemapRoutes));

console.log(
  `[discovery] wrote ${robotsPath} and ${sitemapPath} for ${sitemapRoutes.length} canonical routes`
);
