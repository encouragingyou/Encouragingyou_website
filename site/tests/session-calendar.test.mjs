import test from "node:test";
import assert from "node:assert/strict";

import { buildSessionCalendarDocument } from "../src/lib/domain/session-calendar.js";

const calendarSession = {
  title: "CV Support Session",
  shortTitle: "CV support",
  route: "/sessions/cv-support/",
  eventDescription: "Practical CV help in Rochdale.",
  schedule: {
    type: "weekly-recurring",
    label: "Every Saturday",
    byDay: ["SA"],
    intervalWeeks: 1,
    startLocalDate: "2026-04-25",
    startTime: "16:45",
    durationMinutes: 120,
    timezone: "Europe/London",
    status: {
      state: "active",
      note: null,
      resumeDate: null,
      seasonStartDate: null,
      seasonEndDate: null
    }
  },
  calendar: {
    publicPath: "/calendar/cv-support.ics",
    uid: "encouragingyou-cv-support@encouragingyou.co.uk",
    status: "available"
  },
  location: {
    locality: "Rochdale",
    venueName: null,
    venueAddress: null,
    disclosurePolicy: "shared-on-enquiry"
  }
};

test("calendar generation derives ICS content from the canonical session model", () => {
  const document = buildSessionCalendarDocument(calendarSession, {
    generatedAt: new Date("2026-04-22T12:00:00.000Z"),
    productId: "-//EncouragingYou//Sessions//EN",
    siteUrl: "https://www.encouragingyou.co.uk"
  });

  assert(document, "Expected an ICS document to be generated");
  assert.match(document, /BEGIN:VCALENDAR/u);
  assert.match(document, /PRODID:-\/\/EncouragingYou\/\/Sessions\/\/EN/u);
  assert.match(document, /UID:encouragingyou-cv-support@encouragingyou\.co\.uk/u);
  assert.match(document, /DTSTART;TZID=Europe\/London:20260425T164500/u);
  assert.match(document, /DTEND;TZID=Europe\/London:20260425T184500/u);
  assert.match(document, /RRULE:FREQ=WEEKLY;BYDAY=SA/u);
  assert.match(document, /SUMMARY:CV Support Session/u);
  assert.match(document, /LOCATION:Rochdale/u);
  assert.match(
    document,
    /URL:https:\/\/www\.encouragingyou\.co\.uk\/sessions\/cv-support\//u
  );
});

test("calendar generation is skipped when the public calendar feed is disabled", () => {
  const disabledSession = {
    ...calendarSession,
    calendar: {
      ...calendarSession.calendar,
      status: "disabled"
    }
  };

  assert.equal(buildSessionCalendarDocument(disabledSession), null);
});
