const WEEKDAY_CODE_BY_INDEX = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
const WEEKDAY_INDEX_BY_CODE = Object.fromEntries(
  WEEKDAY_CODE_BY_INDEX.map((code, index) => [code, index])
);
const WEEKDAY_NAME_BY_CODE = {
  SU: "Sunday",
  MO: "Monday",
  TU: "Tuesday",
  WE: "Wednesday",
  TH: "Thursday",
  FR: "Friday",
  SA: "Saturday"
};

const formatterCache = new Map();

function getFormatter(locale, options) {
  const cacheKey = `${locale}:${JSON.stringify(options)}`;

  if (!formatterCache.has(cacheKey)) {
    formatterCache.set(cacheKey, new Intl.DateTimeFormat(locale, options));
  }

  return formatterCache.get(cacheKey);
}

export function getTimeZoneDateParts(date, timeZone) {
  const formatter = getFormatter("en-GB", {
    timeZone,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  });
  const parts = formatter.formatToParts(date);
  const values = Object.fromEntries(
    parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value])
  );

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
    weekdayIndex: WEEKDAY_INDEX_BY_CODE[values.weekday.toUpperCase().slice(0, 2)]
  };
}

export function parseTimeValue(value) {
  const [hour, minute] = value.split(":").map(Number);

  return { hour, minute };
}

export function parseCalendarDate(value) {
  const [year, month, day] = value.split("-").map(Number);

  return { year, month, day };
}

function compareCalendarDateParts(left, right) {
  return (
    Date.UTC(left.year, left.month - 1, left.day) -
    Date.UTC(right.year, right.month - 1, right.day)
  );
}

function diffCalendarDays(left, right) {
  return Math.round(
    (Date.UTC(right.year, right.month - 1, right.day) -
      Date.UTC(left.year, left.month - 1, left.day)) /
      86400000
  );
}

function addDaysToCalendarDate(parts, days) {
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  date.setUTCDate(date.getUTCDate() + days);

  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate()
  };
}

function getCalendarDateInTimeZone(date, timeZone) {
  const parts = getTimeZoneDateParts(date, timeZone);

  return {
    year: parts.year,
    month: parts.month,
    day: parts.day
  };
}

function getWeekdayCodeForCalendarDate(parts) {
  return WEEKDAY_CODE_BY_INDEX[
    new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay()
  ];
}

function toUtcComparable(parts) {
  return Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second ?? 0
  );
}

function zonedDateTimeToUtc(parts, timeZone) {
  let guess = new Date(
    Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second ?? 0
    )
  );

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const actual = getTimeZoneDateParts(guess, timeZone);
    const difference = toUtcComparable(parts) - toUtcComparable(actual);

    if (difference === 0) {
      return guess;
    }

    guess = new Date(guess.getTime() + difference);
  }

  return guess;
}

function parseRecurrenceRule(rule) {
  if (!rule) {
    return {};
  }

  return Object.fromEntries(rule.split(";").map((item) => item.split("=", 2)));
}

function getScheduleStatus(schedule) {
  return (
    schedule.status ?? {
      state: "active",
      note: null,
      resumeDate: null,
      seasonStartDate: null,
      seasonEndDate: null
    }
  );
}

function normalizeWeeklySchedule(schedule) {
  const recurrence = parseRecurrenceRule(schedule.recurrenceRule);
  const byDay =
    schedule.byDay ??
    recurrence.BYDAY?.split(",").filter(Boolean) ??
    (typeof schedule.weekdayIndex === "number"
      ? [WEEKDAY_CODE_BY_INDEX[schedule.weekdayIndex]]
      : []);
  const intervalWeeks = schedule.intervalWeeks ?? Number(recurrence.INTERVAL ?? 1);
  const label =
    schedule.label ??
    (schedule.weekday
      ? `Every ${schedule.weekday}`
      : byDay.length === 1
        ? `Every ${WEEKDAY_NAME_BY_CODE[byDay[0]]}`
        : "Recurring weekly");

  return {
    type: schedule.type,
    label,
    byDay,
    intervalWeeks,
    startLocalDate: schedule.startLocalDate ?? null,
    startTime: schedule.startTime,
    durationMinutes: schedule.durationMinutes,
    timezone: schedule.timezone,
    status: getScheduleStatus(schedule)
  };
}

export function getEndTimeValue(startTime, durationMinutes) {
  const { hour, minute } = parseTimeValue(startTime);
  const endMinutes = hour * 60 + minute + durationMinutes;
  const normalizedMinutes = ((endMinutes % 1440) + 1440) % 1440;

  return `${String(Math.floor(normalizedMinutes / 60)).padStart(2, "0")}:${String(
    normalizedMinutes % 60
  ).padStart(2, "0")}`;
}

export function formatTimeLabel(value) {
  const { hour, minute } = parseTimeValue(value);
  const suffix = hour >= 12 ? "PM" : "AM";
  const normalizedHour = hour % 12 || 12;

  return `${normalizedHour}:${String(minute).padStart(2, "0")} ${suffix}`;
}

export function formatTimeRangeLabel(startTime, endTime) {
  return `${formatTimeLabel(startTime)} to ${formatTimeLabel(endTime)}`;
}

export function formatTimeRangeFromDuration(startTime, durationMinutes) {
  return formatTimeRangeLabel(startTime, getEndTimeValue(startTime, durationMinutes));
}

export function buildWeeklyRecurrenceRule(scheduleInput) {
  const schedule = normalizeWeeklySchedule(scheduleInput);
  const parts = ["FREQ=WEEKLY"];

  if (schedule.intervalWeeks > 1) {
    parts.push(`INTERVAL=${schedule.intervalWeeks}`);
  }

  parts.push(`BYDAY=${schedule.byDay.join(",")}`);

  return parts.join(";");
}

export function getFirstWeeklyOccurrence(session) {
  const schedule = normalizeWeeklySchedule(session.schedule);

  if (!schedule.startLocalDate) {
    return null;
  }

  const startDate = parseCalendarDate(schedule.startLocalDate);
  const { hour, minute } = parseTimeValue(schedule.startTime);
  const start = zonedDateTimeToUtc(
    { ...startDate, hour, minute, second: 0 },
    schedule.timezone
  );

  return {
    start,
    end: new Date(start.getTime() + schedule.durationMinutes * 60 * 1000)
  };
}

function isScheduledDate(schedule, date) {
  const anchorDate = parseCalendarDate(schedule.startLocalDate);
  if (!schedule.byDay.includes(getWeekdayCodeForCalendarDate(date))) {
    return false;
  }

  const weekOffset = Math.floor(diffCalendarDays(anchorDate, date) / 7);

  return (
    ((weekOffset % schedule.intervalWeeks) + schedule.intervalWeeks) %
      schedule.intervalWeeks ===
    0
  );
}

export function getNextWeeklyOccurrence(session, now = new Date()) {
  const schedule = normalizeWeeklySchedule(session.schedule);

  if (!schedule.startLocalDate) {
    const nowInTimeZone = getTimeZoneDateParts(now, schedule.timezone);
    const currentDate = {
      year: nowInTimeZone.year,
      month: nowInTimeZone.month,
      day: nowInTimeZone.day
    };

    for (let offset = 0; offset < 400; offset += 1) {
      const candidateDate = addDaysToCalendarDate(currentDate, offset);

      if (!schedule.byDay.includes(getWeekdayCodeForCalendarDate(candidateDate))) {
        continue;
      }

      const { hour, minute } = parseTimeValue(schedule.startTime);
      const start = zonedDateTimeToUtc(
        { ...candidateDate, hour, minute, second: 0 },
        schedule.timezone
      );

      if (start <= now) {
        continue;
      }

      return {
        start,
        end: new Date(start.getTime() + schedule.durationMinutes * 60 * 1000)
      };
    }

    return null;
  }

  const searchStartDate = getCalendarDateInTimeZone(now, schedule.timezone);

  for (let offset = 0; offset < 400; offset += 1) {
    const candidateDate = addDaysToCalendarDate(searchStartDate, offset);

    if (!isScheduledDate(schedule, candidateDate)) {
      continue;
    }

    const { hour, minute } = parseTimeValue(schedule.startTime);
    const start = zonedDateTimeToUtc(
      { ...candidateDate, hour, minute, second: 0 },
      schedule.timezone
    );

    if (start <= now) {
      continue;
    }

    return {
      start,
      end: new Date(start.getTime() + schedule.durationMinutes * 60 * 1000)
    };
  }

  return null;
}

export function getTimeZoneOffsetMinutes(date, timeZone) {
  const zonedParts = getTimeZoneDateParts(date, timeZone);

  return Math.round((toUtcComparable(zonedParts) - date.getTime()) / 60000);
}

export function formatIsoOffsetForTimeZone(date, timeZone) {
  const parts = getTimeZoneDateParts(date, timeZone);
  const offsetMinutes = getTimeZoneOffsetMinutes(date, timeZone);
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const offsetHours = String(Math.floor(Math.abs(offsetMinutes) / 60)).padStart(2, "0");
  const offsetRemainder = String(Math.abs(offsetMinutes) % 60).padStart(2, "0");

  return [
    parts.year,
    "-",
    String(parts.month).padStart(2, "0"),
    "-",
    String(parts.day).padStart(2, "0"),
    "T",
    String(parts.hour).padStart(2, "0"),
    ":",
    String(parts.minute).padStart(2, "0"),
    ":",
    String(parts.second).padStart(2, "0"),
    sign,
    offsetHours,
    ":",
    offsetRemainder
  ].join("");
}

function formatCalendarDateLabel(dateValue, timeZone, locale = "en-GB") {
  const formatter = getFormatter(locale, {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long"
  });

  return formatter.format(dateValue);
}

function formatShortCalendarDateLabel(dateValue, timeZone, locale = "en-GB") {
  const formatter = getFormatter(locale, {
    timeZone,
    day: "numeric",
    month: "short"
  });

  return formatter.format(dateValue);
}

function formatCalendarDateTimeLabel(dateValue, timeZone, locale = "en-GB") {
  const formatter = getFormatter(locale, {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit"
  });

  return formatter.format(dateValue);
}

function formatHumanScheduleMessage(status, schedule, now, locale) {
  const timeZone = schedule.timezone;

  if (status.state === "paused") {
    if (status.note) {
      return status.note;
    }

    if (status.resumeDate) {
      const resumeAt = zonedDateTimeToUtc(
        { ...parseCalendarDate(status.resumeDate), hour: 9, minute: 0, second: 0 },
        timeZone
      );

      return `Sessions are paused and due to return ${formatCalendarDateLabel(resumeAt, timeZone, locale)}.`;
    }

    return "Session dates are temporarily paused.";
  }

  if (status.state === "cancelled") {
    return status.note ?? "Session dates are currently cancelled.";
  }

  if (status.state === "contact-only") {
    return status.note ?? "Ask the team for the next available date.";
  }

  if (status.state === "seasonal") {
    const today = getCalendarDateInTimeZone(now, timeZone);
    const seasonStart = status.seasonStartDate
      ? parseCalendarDate(status.seasonStartDate)
      : null;
    const seasonEnd = status.seasonEndDate
      ? parseCalendarDate(status.seasonEndDate)
      : null;

    if (seasonStart && compareCalendarDateParts(today, seasonStart) < 0) {
      const seasonStartsAt = zonedDateTimeToUtc(
        { ...seasonStart, hour: 9, minute: 0, second: 0 },
        timeZone
      );

      return (
        status.note ??
        `This session returns ${formatCalendarDateLabel(seasonStartsAt, timeZone, locale)}.`
      );
    }

    if (seasonEnd && compareCalendarDateParts(today, seasonEnd) > 0) {
      return status.note ?? "The current session season has finished.";
    }
  }

  return null;
}

function isSeasonActive(status, now, timeZone) {
  if (status.state !== "seasonal") {
    return true;
  }

  const today = getCalendarDateInTimeZone(now, timeZone);
  const seasonStart = status.seasonStartDate
    ? parseCalendarDate(status.seasonStartDate)
    : null;
  const seasonEnd = status.seasonEndDate ? parseCalendarDate(status.seasonEndDate) : null;

  if (seasonStart && compareCalendarDateParts(today, seasonStart) < 0) {
    return false;
  }

  if (seasonEnd && compareCalendarDateParts(today, seasonEnd) > 0) {
    return false;
  }

  return true;
}

export function getSessionTemporalState(session, now = new Date(), locale = "en-GB") {
  const schedule = normalizeWeeklySchedule(session.schedule);
  const status = schedule.status;
  const timeRangeLabel = formatTimeRangeFromDuration(
    schedule.startTime,
    schedule.durationMinutes
  );
  const calendarAvailable =
    session.calendar?.status === "available" &&
    !["paused", "cancelled", "contact-only"].includes(status.state);
  const commonState = {
    recurrenceLabel: schedule.label,
    timeRangeLabel,
    nextOccurrence: null,
    nextDateLabel: null,
    nextShortLabel: null,
    nextDateTimeLabel: null,
    nextLabel: null,
    statusLabel: null,
    statusMessage: null,
    calendar: {
      state: calendarAvailable ? "available" : "unavailable",
      href: calendarAvailable ? session.calendar.publicPath : null
    }
  };

  if (["paused", "cancelled", "contact-only"].includes(status.state)) {
    return {
      ...commonState,
      state: status.state,
      statusLabel:
        status.state === "contact-only"
          ? "Contact for dates"
          : status.state === "cancelled"
            ? "Currently cancelled"
            : "Temporarily paused",
      statusMessage: formatHumanScheduleMessage(status, schedule, now, locale)
    };
  }

  if (status.state === "seasonal" && !isSeasonActive(status, now, schedule.timezone)) {
    return {
      ...commonState,
      state: "seasonal-break",
      statusLabel: "Seasonal schedule",
      statusMessage: formatHumanScheduleMessage(status, schedule, now, locale)
    };
  }

  const nextOccurrence = getNextWeeklyOccurrence(session, now);

  if (!nextOccurrence) {
    return {
      ...commonState,
      state: "dates-unavailable",
      statusLabel: "Dates unavailable",
      statusMessage: "The next session date is not available right now."
    };
  }

  const nextDateLabel = formatCalendarDateLabel(
    nextOccurrence.start,
    schedule.timezone,
    locale
  );

  return {
    ...commonState,
    state: "scheduled",
    nextOccurrence,
    nextDateLabel,
    nextShortLabel: formatShortCalendarDateLabel(
      nextOccurrence.start,
      schedule.timezone,
      locale
    ),
    nextDateTimeLabel: formatCalendarDateTimeLabel(
      nextOccurrence.start,
      schedule.timezone,
      locale
    ),
    nextLabel: `Next up: ${nextDateLabel}`
  };
}

export function formatNextOccurrenceLabel(session, now = new Date(), locale = "en-GB") {
  return getSessionTemporalState(session, now, locale).nextDateLabel;
}

export function buildSessionEventSchema(session, options, now = new Date()) {
  const schedule = normalizeWeeklySchedule(session.schedule);
  const temporal = getSessionTemporalState(session, now);

  if (temporal.state !== "scheduled" || !temporal.nextOccurrence) {
    return null;
  }

  const locationName =
    session.location.disclosurePolicy === "public-address" && session.location.venueName
      ? session.location.venueName
      : session.location.locality;
  const siteUrl = options.siteUrl.replace(/\/$/u, "");
  const locationAddress = {
    "@type": "PostalAddress",
    addressLocality: session.location.locality,
    addressCountry: "GB"
  };

  if (
    session.location.disclosurePolicy === "public-address" &&
    session.location.venueAddress
  ) {
    locationAddress.streetAddress = session.location.venueAddress;
  }

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: session.title,
    description: session.eventDescription,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    startDate: formatIsoOffsetForTimeZone(
      temporal.nextOccurrence.start,
      schedule.timezone
    ),
    endDate: formatIsoOffsetForTimeZone(temporal.nextOccurrence.end, schedule.timezone),
    eventSchedule: {
      "@type": "Schedule",
      repeatFrequency: `P${schedule.intervalWeeks}W`,
      byDay: schedule.byDay.map(
        (code) => `https://schema.org/${WEEKDAY_NAME_BY_CODE[code]}`
      ),
      startDate: schedule.startLocalDate ?? undefined,
      startTime: schedule.startTime,
      endTime: getEndTimeValue(schedule.startTime, schedule.durationMinutes),
      scheduleTimezone: schedule.timezone
    },
    image: [options.imageUrl],
    url: `${siteUrl}${session.route}`,
    location: {
      "@type": "Place",
      name: locationName,
      address: locationAddress
    },
    organizer: {
      "@type": "Organization",
      name: options.organizationName,
      url: siteUrl
    }
  };
}
