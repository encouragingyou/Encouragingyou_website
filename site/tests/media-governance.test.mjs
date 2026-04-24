import test from "node:test";
import assert from "node:assert/strict";

import mediaLibrary from "../src/content/mediaLibrary/default.json" with { type: "json" };
import notices from "../src/content/notices/default.json" with { type: "json" };

const restrictedProofFamilies = [
  "gallery",
  "testimonials",
  "team",
  "impact-proof",
  "event-recap-evidence",
  "safeguarding"
];

const noticeIndex = new Map(notices.notices.map((notice) => [notice.id, notice]));

function buildDisclosure(asset, context) {
  if (!asset?.requiresDisclosure || !asset.noticeId || asset.disclosure.mode === "none") {
    return null;
  }

  const notice = noticeIndex.get(asset.noticeId);

  if (!notice) {
    return null;
  }

  const variant = asset.disclosure.compactContexts.includes(context)
    ? "compact"
    : asset.disclosure.prominentContexts.includes(context)
      ? "prominent"
      : asset.disclosure.defaultVariant;

  return {
    variant,
    text:
      variant === "compact"
        ? (notice.variants?.compact ?? notice.text)
        : (notice.variants?.prominent ?? notice.text)
  };
}

test("AI illustration notices expose prominent, compact, and sitewide variants", () => {
  const heroDisclosure = buildDisclosure(
    mediaLibrary.assets.find((asset) => asset.id === "hero-home"),
    "hero"
  );
  const cardDisclosure = buildDisclosure(
    mediaLibrary.assets.find((asset) => asset.id === "programme-community-friendship"),
    "card"
  );
  const sitewideDisclosure =
    noticeIndex.get("ai-illustration")?.variants?.sitewide ?? null;

  assert.equal(heroDisclosure?.text, "Launch illustration, not participant photography.");
  assert.equal(heroDisclosure?.variant, "prominent");
  assert.equal(cardDisclosure?.text, "Launch illustration, not participant photography.");
  assert.equal(cardDisclosure?.variant, "compact");
  assert.equal(
    sitewideDisclosure,
    "Illustrations on this launch site are AI-generated unless stated otherwise."
  );
});

test("launch illustrations stay illustrative-only and blocked from proof-bearing route families", () => {
  const illustrations = mediaLibrary.assets.filter(
    (asset) => asset.kind === "illustration"
  );

  assert.equal(illustrations.length, 7);

  for (const asset of illustrations) {
    assert.equal(asset.sourceType, "ai-generated-people-illustration");
    assert.equal(asset.evidenceUse, "illustrative-only");
    assert.notEqual(asset.trustImpact, "evidence-bearing");
    assert.equal(asset.consentStatus, "not-applicable-synthetic");
    assert.equal(asset.reviewExpiry, null);
    assert.equal(asset.disclosure.mode, "contextual");

    for (const family of restrictedProofFamilies) {
      assert.ok(
        asset.restrictedRouteFamilies.includes(family),
        `${asset.id} should restrict ${family}`
      );
    }
  }
});

test("launch icons stay wayfinding-only and do not render visible disclosure notes", () => {
  const icons = mediaLibrary.assets.filter((asset) => asset.kind === "icon");

  assert.equal(icons.length, 8);

  for (const asset of icons) {
    assert.equal(asset.sourceType, "ai-generated-icon");
    assert.equal(asset.evidenceUse, "wayfinding-only");
    assert.equal(asset.disclosure.mode, "none");
    assert.equal(asset.noticeId, null);
    assert.equal(asset.replacementSourceType, "vector-icon");
  }
});
