import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  buildFormSubmittedEvent,
  buildPageViewEvent,
  buildCalendarDownloadEvent
} from "../src/lib/analytics/server.js";
import {
  readAnalyticsSummary,
  recordAnalyticsEvent
} from "../src/lib/analytics/store.js";

test("analytics store writes aggregate counters instead of raw free-text payloads", async () => {
  const storageDir = await mkdtemp(join(tmpdir(), "encouragingyou-analytics-"));

  try {
    const pageView = buildPageViewEvent({
      pathname: "/sessions/cv-support/",
      requestUrl: "https://example.test/sessions/cv-support/",
      headers: new Headers({
        referer: "https://example.test/sessions/",
        host: "example.test"
      })
    });

    const calendarDownload = buildCalendarDownloadEvent({
      pathname: "/calendar/cv-support.ics",
      requestUrl: "https://example.test/calendar/cv-support.ics",
      headers: new Headers({
        referer: "https://example.test/sessions/cv-support/",
        host: "example.test"
      })
    });

    await recordAnalyticsEvent(
      {
        eventName: pageView.eventName,
        ...pageView.dimensions
      },
      {
        now: new Date("2026-04-24T09:00:00.000Z"),
        storageDir
      }
    );
    await recordAnalyticsEvent(
      {
        eventName: calendarDownload.eventName,
        ...calendarDownload.dimensions
      },
      {
        now: new Date("2026-04-24T09:01:00.000Z"),
        storageDir
      }
    );

    const summary = await readAnalyticsSummary("2026-04-24", { storageDir });

    assert.equal(summary.totals.eventCount, 2);
    assert.equal(summary.events.length, 2);
    assert.ok(
      summary.events.every((entry) => !("message" in entry.dimensions)),
      "Analytics summaries should never persist free-text fields."
    );
  } finally {
    await rm(storageDir, { recursive: true, force: true });
  }
});

test("form submitted analytics skip safeguarding routes but include ordinary support flows", () => {
  assert.equal(
    buildFormSubmittedEvent({
      originPath: "/safeguarding/child/",
      surfaceId: "safeguarding-concern"
    }),
    null
  );

  const event = buildFormSubmittedEvent({
    originPath: "/contact/",
    surfaceId: "support-general"
  });

  assert.deepEqual(event, {
    eventName: "form_submitted",
    dimensions: {
      pageId: "contact",
      routeFamily: "contact",
      surfaceId: "support-general"
    }
  });
});
