import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const homeRoutePath = new URL("../src/pages/index.astro", import.meta.url);

test("homepage route renders a compact route hub instead of the old long-scroll section stack", async () => {
  const source = await readFile(homeRoutePath, "utf8");
  const renderedHomeSectionMarkers = source.match(/data-home-section=/gu) ?? [];

  assert.match(source, /structuredData=\{home\.structuredData\}/u);
  assert.match(source, /data-home-section="route-hub"/u);
  assert.match(source, /data-home-section="home-reassurance"/u);
  assert.equal(renderedHomeSectionMarkers.length, 2);
  assert.doesNotMatch(source, /home\.sections\.map/u);
  assert.doesNotMatch(source, /data-home-section="quick-actions"/u);
  assert.doesNotMatch(source, /data-home-section="trust-strip"/u);
  assert.doesNotMatch(source, /data-home-section="live-sessions"/u);
  assert.doesNotMatch(source, /data-home-section="programme-teasers"/u);
  assert.doesNotMatch(source, /data-home-section="about-teaser"/u);
  assert.doesNotMatch(source, /data-home-section="community-support"/u);
  assert.doesNotMatch(source, /data-home-section="updates-surface"/u);
  assert.doesNotMatch(source, /data-home-section="involvement-cta"/u);
  assert.doesNotMatch(source, /data-home-section="faq-cluster"/u);
  assert.doesNotMatch(source, /data-home-section="contact-panel"/u);
  assert.doesNotMatch(source, /HomeContactPanel/u);
  assert.doesNotMatch(source, /HomeUpdatesSurface/u);
  assert.doesNotMatch(source, /FaqGroup/u);
  assert.doesNotMatch(source, /home\.quickActions/u);
  assert.doesNotMatch(source, /home\.sessionsStrip/u);
  assert.doesNotMatch(source, /home\.programmesSection/u);
  assert.doesNotMatch(source, /home\.supportSection/u);
});

test("homepage route hub only points at checked internal route targets", async () => {
  const source = await readFile(homeRoutePath, "utf8");

  for (const href of [
    "/sessions/",
    "/programmes/career-support-cv-help/",
    "/sessions/youth-club/",
    "/programmes/",
    "/about/",
    "/get-involved/",
    "/contact/",
    "/safeguarding/"
  ]) {
    assert.match(source, new RegExp(`href: "${href}"`, "u"));
  }
});

test("homepage route hub copy is action-led and outcome-specific", async () => {
  const source = await readFile(homeRoutePath, "utf8");

  for (const title of [
    "Join a session",
    "Get CV help",
    "Visit youth club",
    "Ask a question"
  ]) {
    assert.match(source, new RegExp(`title: "${title}"`, "u"));
  }

  assert.match(
    source,
    /We help young people speak up, make friends, and feel more confident in real-life situations\./u
  );
  assert.match(
    source,
    /Get real help writing your CV, applying for jobs, and preparing for interviews\./u
  );
  assert.match(source, /low-pressure friendship/u);
  assert.match(source, /feel comfortable returning to/u);
  assert.match(source, /confidence, life skills, motivation/u);
  assert.doesNotMatch(source, /\b\d+\s*(?:-|to)\s*\d+\b/u);
});
