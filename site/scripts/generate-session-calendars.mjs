import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import cvSupport from "../src/content/sessions/cv-support.json" with { type: "json" };
import youthClub from "../src/content/sessions/youth-club.json" with { type: "json" };
import { resolvePublicSiteUrl } from "../src/lib/deployment/context.js";
import { buildSessionCalendarDocument } from "../src/lib/domain/session-calendar.js";

const siteRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const publicRoot = resolve(siteRoot, "public");
const calendarRoot = resolve(publicRoot, "calendar");
const reportPath = resolve(
  siteRoot,
  "src/data/generated/session-calendar-build-report.json"
);
const sessions = [cvSupport, youthClub];
const generatedAt = new Date();
const report = {
  generatedAt: generatedAt.toISOString(),
  siteUrl: resolvePublicSiteUrl(),
  calendars: []
};

await rm(calendarRoot, { recursive: true, force: true });
await mkdir(calendarRoot, { recursive: true });

for (const session of sessions) {
  const document = buildSessionCalendarDocument(session, {
    generatedAt,
    productId: "-//EncouragingYou//Sessions//EN",
    siteUrl: resolvePublicSiteUrl()
  });

  if (!document) {
    report.calendars.push({
      slug: session.slug,
      publicPath: session.calendar.publicPath,
      generated: false,
      reason: "calendar-disabled-or-unscheduled"
    });
    continue;
  }

  const outputPath = resolve(publicRoot, session.calendar.publicPath.replace(/^\//u, ""));

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, document, "utf8");
  report.calendars.push({
    slug: session.slug,
    publicPath: session.calendar.publicPath,
    generated: true,
    uid: session.calendar.uid
  });
  console.log(`[calendar-generate] ${session.slug} -> ${outputPath}`);
}

await mkdir(dirname(reportPath), { recursive: true });
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
