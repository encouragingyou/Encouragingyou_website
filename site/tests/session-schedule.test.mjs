import test from "node:test";
import assert from "node:assert/strict";

import {
  buildSessionEventSchema,
  buildWeeklyRecurrenceRule,
  formatIsoOffsetForTimeZone,
  formatNextOccurrenceLabel,
  formatTimeRangeFromDuration,
  getNextWeeklyOccurrence,
  getSessionTemporalState
} from "../src/lib/domain/session-schedule.js";

const activeSaturdaySession = {
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

test("getNextWeeklyOccurrence keeps weekly sessions in the session timezone across spring DST", () => {
  const now = new Date("2026-03-29T12:00:00.000Z");
  const occurrence = getNextWeeklyOccurrence(activeSaturdaySession, now);

  assert(occurrence, "Expected a next occurrence to be available");
  assert.equal(occurrence.start.toISOString(), "2026-04-04T15:45:00.000Z");
  assert.equal(occurrence.end.toISOString(), "2026-04-04T17:45:00.000Z");
});

test("getNextWeeklyOccurrence keeps local Saturday timings stable after autumn DST fallback", () => {
  const now = new Date("2026-10-26T09:00:00.000Z");
  const occurrence = getNextWeeklyOccurrence(activeSaturdaySession, now);

  assert(occurrence, "Expected a next occurrence to be available");
  assert.equal(occurrence.start.toISOString(), "2026-10-31T16:45:00.000Z");
  assert.equal(
    formatIsoOffsetForTimeZone(occurrence.start, "Europe/London"),
    "2026-10-31T16:45:00+00:00"
  );
});

test("temporal state exposes next labels and calendar availability for active sessions", () => {
  const now = new Date("2026-03-29T12:00:00.000Z");
  const temporal = getSessionTemporalState(activeSaturdaySession, now);

  assert.equal(temporal.state, "scheduled");
  assert.equal(temporal.recurrenceLabel, "Every Saturday");
  assert.equal(temporal.timeRangeLabel, "4:45 PM to 6:45 PM");
  assert.equal(temporal.nextDateLabel, "Saturday 4 April");
  assert.equal(temporal.nextLabel, "Next up: Saturday 4 April");
  assert.equal(temporal.calendar.state, "available");
  assert.equal(temporal.calendar.href, "/calendar/cv-support.ics");
});

test("paused schedules stop next-occurrence output and surface an honest status message", () => {
  const pausedSession = {
    ...activeSaturdaySession,
    schedule: {
      ...activeSaturdaySession.schedule,
      status: {
        state: "paused",
        note: null,
        resumeDate: "2026-05-16",
        seasonStartDate: null,
        seasonEndDate: null
      }
    }
  };
  const temporal = getSessionTemporalState(
    pausedSession,
    new Date("2026-04-23T12:00:00.000Z")
  );

  assert.equal(temporal.state, "paused");
  assert.equal(temporal.nextOccurrence, null);
  assert.equal(temporal.nextLabel, null);
  assert.equal(temporal.statusLabel, "Temporarily paused");
  assert.match(temporal.statusMessage ?? "", /return/i);
  assert.equal(temporal.calendar.state, "unavailable");
});

test("formatting and structured data derive from the same canonical schedule inputs", () => {
  const now = new Date("2026-03-29T12:00:00.000Z");
  const occurrence = getNextWeeklyOccurrence(activeSaturdaySession, now);
  const schema = buildSessionEventSchema(
    activeSaturdaySession,
    {
      siteUrl: "https://www.encouragingyou.co.uk",
      organizationName: "EncouragingYou CIC",
      imageUrl: "https://www.encouragingyou.co.uk/images/cv-support.webp"
    },
    now
  );

  assert(occurrence, "Expected a next occurrence to be available");
  assert(schema, "Expected structured data to be generated");
  assert.equal(
    buildWeeklyRecurrenceRule(activeSaturdaySession.schedule),
    "FREQ=WEEKLY;BYDAY=SA"
  );
  assert.equal(formatTimeRangeFromDuration("16:45", 120), "4:45 PM to 6:45 PM");
  assert.equal(formatNextOccurrenceLabel(activeSaturdaySession, now), "Saturday 4 April");
  assert.equal(
    formatIsoOffsetForTimeZone(occurrence.start, "Europe/London"),
    "2026-04-04T16:45:00+01:00"
  );
  assert.equal(schema.startDate, "2026-04-04T16:45:00+01:00");
  assert.equal(schema.eventSchedule.repeatFrequency, "P1W");
  assert.deepEqual(schema.eventSchedule.byDay, ["https://schema.org/Saturday"]);
});

test("structured data is omitted when the session is not currently schedulable", () => {
  const contactOnlySession = {
    ...activeSaturdaySession,
    schedule: {
      ...activeSaturdaySession.schedule,
      status: {
        state: "contact-only",
        note: "Ask the team before sharing dates publicly.",
        resumeDate: null,
        seasonStartDate: null,
        seasonEndDate: null
      }
    },
    calendar: {
      ...activeSaturdaySession.calendar,
      status: "disabled"
    }
  };

  assert.equal(
    buildSessionEventSchema(contactOnlySession, {
      siteUrl: "https://www.encouragingyou.co.uk",
      organizationName: "EncouragingYou CIC",
      imageUrl: "https://www.encouragingyou.co.uk/images/cv-support.webp"
    }),
    null
  );
});
