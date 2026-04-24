import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const homeRoutePath = new URL("../src/pages/index.astro", import.meta.url);

test("homepage route renders from the canonical section runtime instead of compatibility fields", async () => {
  const source = await readFile(homeRoutePath, "utf8");

  assert.match(source, /home\.sections\.map/u);
  assert.match(source, /structuredData=\{home\.structuredData\}/u);
  assert.match(source, /data-home-section=\{section\.id\}/u);
  assert.doesNotMatch(source, /home\.quickActions/u);
  assert.doesNotMatch(source, /home\.sessionsStrip/u);
  assert.doesNotMatch(source, /home\.programmesSection/u);
  assert.doesNotMatch(source, /home\.supportSection/u);
});
