import {
  buildWeeklyRecurrenceRule,
  getFirstWeeklyOccurrence,
  getTimeZoneDateParts
} from "./session-schedule.js";

function escapeIcsText(value) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("\r\n", "\\n")
    .replaceAll("\n", "\\n")
    .replaceAll(",", "\\,")
    .replaceAll(";", "\\;");
}

function formatUtcTimestampForIcs(date) {
  return (
    `${date.getUTCFullYear()}` +
    `${String(date.getUTCMonth() + 1).padStart(2, "0")}` +
    `${String(date.getUTCDate()).padStart(2, "0")}T` +
    `${String(date.getUTCHours()).padStart(2, "0")}` +
    `${String(date.getUTCMinutes()).padStart(2, "0")}` +
    `${String(date.getUTCSeconds()).padStart(2, "0")}Z`
  );
}

function formatLocalTimestampForIcs(date, timeZone) {
  const parts = getTimeZoneDateParts(date, timeZone);

  return (
    `${parts.year}` +
    `${String(parts.month).padStart(2, "0")}` +
    `${String(parts.day).padStart(2, "0")}T` +
    `${String(parts.hour).padStart(2, "0")}` +
    `${String(parts.minute).padStart(2, "0")}` +
    `${String(parts.second).padStart(2, "0")}`
  );
}

function buildSeasonUntilRuleFragment(session) {
  const status = session.schedule.status ?? null;

  if (status?.state !== "seasonal" || !status.seasonEndDate) {
    return "";
  }

  const occurrence = getFirstWeeklyOccurrence({
    ...session,
    schedule: {
      ...session.schedule,
      startLocalDate: status.seasonEndDate
    }
  });

  if (!occurrence) {
    return "";
  }

  return `;UNTIL=${formatUtcTimestampForIcs(occurrence.start)}`;
}

export function buildSessionCalendarDocument(
  session,
  options = {
    generatedAt: new Date(),
    productId: "-//EncouragingYou//Sessions//EN",
    siteUrl: ""
  }
) {
  const scheduleStatus = session.schedule.status?.state ?? "active";

  if (
    session.calendar.status !== "available" ||
    ["paused", "cancelled", "contact-only"].includes(scheduleStatus)
  ) {
    return null;
  }

  const firstOccurrence = getFirstWeeklyOccurrence(session);

  if (!firstOccurrence) {
    return null;
  }

  const siteUrl = options.siteUrl ? options.siteUrl.replace(/\/$/u, "") : "";
  const recurrenceRule = `${buildWeeklyRecurrenceRule(session.schedule)}${buildSeasonUntilRuleFragment(
    session
  )}`;
  const locationName = session.location.venueName ?? session.location.locality;
  const urlLine = siteUrl ? `URL:${escapeIcsText(`${siteUrl}${session.route}`)}` : null;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:${options.productId}`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcsText(session.title)}`,
    `X-WR-TIMEZONE:${session.schedule.timezone}`,
    "BEGIN:VEVENT",
    `UID:${session.calendar.uid}`,
    `DTSTAMP:${formatUtcTimestampForIcs(options.generatedAt)}`,
    `DTSTART;TZID=${session.schedule.timezone}:${formatLocalTimestampForIcs(firstOccurrence.start, session.schedule.timezone)}`,
    `DTEND;TZID=${session.schedule.timezone}:${formatLocalTimestampForIcs(firstOccurrence.end, session.schedule.timezone)}`,
    `RRULE:${recurrenceRule}`,
    `SUMMARY:${escapeIcsText(session.title)}`,
    `DESCRIPTION:${escapeIcsText(session.eventDescription)}`,
    `LOCATION:${escapeIcsText(locationName)}`,
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    urlLine,
    "END:VEVENT",
    "END:VCALENDAR",
    ""
  ]
    .filter(Boolean)
    .join("\r\n");
}
