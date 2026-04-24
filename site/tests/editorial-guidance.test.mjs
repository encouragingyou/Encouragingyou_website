import test from "node:test";
import assert from "node:assert/strict";

import {
  buildPlaceholderStatus,
  getSessionStatusMicrocopy,
  getSupportFormMicrocopy
} from "../src/lib/content/editorial-guidance.ts";

test("buildPlaceholderStatus returns the trust-critical outline policy", () => {
  const status = buildPlaceholderStatus({
    contentStatus: "outline-only",
    trustCritical: true
  });

  assert.ok(status);
  assert.equal(status.title, "Current page status");
  assert.ok(
    status.publishNow.includes("The public route, navigation link, and contact path.")
  );
  assert.ok(
    status.hidden.includes(
      "Any claim that depends on an unconfirmed policy, processor, venue detail, or named person."
    )
  );
});

test("shared microcopy patterns stay available for forms and session notices", () => {
  const supportForm = getSupportFormMicrocopy();
  const sessionStatus = getSessionStatusMicrocopy();

  assert.equal(supportForm.privacyNoticeTitle, "Privacy reminder");
  assert.match(supportForm.messageHelper, /reply clearly/i);
  assert.match(supportForm.noscriptNote, /page will reload with a confirmation message/u);
  assert.equal(sessionStatus.scheduleUpdateTitle, "Schedule update");
  assert.equal(sessionStatus.calendarUnavailableTitle, "Calendar download unavailable");
});
