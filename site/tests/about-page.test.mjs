import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import routePages from "../src/content/routePages/default.json" with { type: "json" };

const aboutRoutePath = new URL("../src/pages/about/index.astro", import.meta.url);
const aboutPage = routePages.pages.find((page) => page.pageId === "about");

test("about page content defines the ordered story, values, and proof-boundary contract", () => {
  assert.ok(aboutPage, "Expected About page content to exist.");
  assert.deepEqual(
    aboutPage.storySections.map((section) => section.id),
    ["origin", "leadership", "approach", "wider-community"]
  );
  assert.equal(
    aboutPage.intro.title,
    "A youth-led organisation rooted in real community experience."
  );
  assert.equal(aboutPage.valuesSection.items.length, 5);
  assert.equal(aboutPage.audienceSection.items.length, 3);
  assert.match(
    aboutPage.proofBoundary.withheldUntilVerified.join(" "),
    /Impact statistics, public praise quotes, or outcome claims/u
  );
});

test("about route renders the structured narrative system instead of the old summary panels", async () => {
  const source = await readFile(aboutRoutePath, "utf8");

  assert.match(source, /structuredData=\{model\.structuredData\}/u);
  assert.match(source, /<NarrativeSection/u);
  assert.match(source, /<ValuesList/u);
  assert.match(source, /model\.proofBoundary/u);
  assert.doesNotMatch(source, /model\.principles/u);
  assert.doesNotMatch(source, /model\.stats/u);
});
