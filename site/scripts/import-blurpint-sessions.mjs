import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";

const repoRoot = path.resolve(import.meta.dirname, "../..");
const sourceJsPath = path.join(repoRoot, "source/blurpint/assets/js/site.js");
const outputDir = path.join(repoRoot, "site/src/data/generated");
const outputPath = path.join(outputDir, "imported-blurpint-sessions.json");
const mediaIdByLegacyImagePath = new Map([
  ["/images/career-support-960.webp", "programme-career-support"],
  ["/images/community-friendship-960.webp", "programme-community-friendship"]
]);

function extractSessionsObject(scriptSource) {
  const match = scriptSource.match(/const sessions = (\{[\s\S]*?\n\});/);

  if (!match) {
    throw new Error(
      "Could not find the sessions object in source/blurpint/assets/js/site.js"
    );
  }

  return vm.runInNewContext(`(${match[1]})`, {});
}

function parseIcs(icsSource) {
  const data = {};

  for (const rawLine of icsSource.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || !line.includes(":")) {
      continue;
    }

    const [key, value] = line.split(/:(.+)/, 2);
    data[key] = value;
  }

  return {
    uid: data.UID ?? null,
    timezone: data["X-WR-TIMEZONE"] ?? null,
    startsAt: data["DTSTART;TZID=Europe/London"] ?? null,
    endsAt: data["DTEND;TZID=Europe/London"] ?? null,
    recurrenceRule: data.RRULE ?? null,
    location: data.LOCATION ?? null,
    summary: data.SUMMARY ?? null
  };
}

function toTimeLabel(compact) {
  if (!compact || compact.length < 13) {
    return null;
  }

  return `${compact.slice(9, 11)}:${compact.slice(11, 13)}`;
}

function toLocalDate(compact) {
  if (!compact || compact.length < 8) {
    return null;
  }

  return `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}`;
}

function parseRecurrenceRule(rule) {
  if (!rule) {
    return {};
  }

  return Object.fromEntries(rule.split(";").map((item) => item.split("=", 2)));
}

function durationMinutes(startLabel, endLabel) {
  if (!startLabel || !endLabel) {
    return null;
  }

  const [startHour, startMinute] = startLabel.split(":").map(Number);
  const [endHour, endMinute] = endLabel.split(":").map(Number);

  return endHour * 60 + endMinute - (startHour * 60 + startMinute);
}

function normalizeSession(key, sourceSession) {
  const calendarPath = path.join(
    repoRoot,
    "source/blurpint",
    sourceSession.calendar.replace(/^\//, "")
  );
  const icsData = parseIcs(readFileSync(calendarPath, "utf8"));
  const recurrence = parseRecurrenceRule(icsData.recurrenceRule);
  const startTime =
    toTimeLabel(icsData.startsAt) ??
    `${String(sourceSession.startHour).padStart(2, "0")}:${String(sourceSession.startMinute).padStart(2, "0")}`;
  const endTime = toTimeLabel(icsData.endsAt);
  const anchorDate = toLocalDate(icsData.startsAt);

  return {
    id: key,
    title: sourceSession.title,
    shortTitle: sourceSession.shortTitle,
    route: sourceSession.slug,
    publicCalendarPath: sourceSession.calendar,
    description: sourceSession.description,
    legacyImage: sourceSession.image,
    imageMediaId:
      mediaIdByLegacyImagePath.get(new URL(sourceSession.image).pathname) ?? null,
    schedule: {
      type: "weekly-recurring",
      label: `Every ${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][sourceSession.dayIndex]}`,
      byDay: recurrence.BYDAY?.split(",").filter(Boolean) ?? [],
      intervalWeeks: Number(recurrence.INTERVAL ?? 1),
      startLocalDate: anchorDate,
      startTime,
      endTime,
      durationMinutes:
        durationMinutes(startTime, endTime) ?? sourceSession.durationMinutes,
      timezone: icsData.timezone
    },
    location: icsData.location,
    uid: icsData.uid,
    summaryFromCalendar: icsData.summary
  };
}

const sourceScript = readFileSync(sourceJsPath, "utf8");
const sourceSessions = extractSessionsObject(sourceScript);
const normalized = Object.fromEntries(
  Object.entries(sourceSessions).map(([key, value]) => [
    key,
    normalizeSession(key, value)
  ])
);

mkdirSync(outputDir, { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(normalized, null, 2)}\n`);
console.log(`Wrote ${outputPath}`);
