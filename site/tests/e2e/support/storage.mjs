import { readdir, readFile } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";

const enquiryOutputDir = new URL(
  "../../../output/playwright/enquiries/",
  import.meta.url
);
const analyticsOutputDir = new URL(
  "../../../output/playwright/analytics/",
  import.meta.url
);

async function readJsonEntries(directory) {
  const files = await readdir(directory).catch(() => []);
  const records = [];

  for (const fileName of files.filter((entry) => entry.endsWith(".json"))) {
    const source = await readFile(new URL(fileName, directory), "utf8");

    records.push({
      fileName,
      value: JSON.parse(source)
    });
  }

  return records;
}

export async function listEnquiryRecords() {
  const entries = await readJsonEntries(enquiryOutputDir);

  return entries.map((entry) => ({
    ...entry.value,
    __fileName: entry.fileName
  }));
}

export async function waitForEnquiryRecord(
  matcher,
  { intervalMs = 150, timeoutMs = 5_000 } = {}
) {
  const deadline = Date.now() + timeoutMs;
  let inspectedCount = 0;

  while (Date.now() <= deadline) {
    const records = await listEnquiryRecords();
    inspectedCount = records.length;
    const match = records.find(matcher);

    if (match) {
      return match;
    }

    await delay(intervalMs);
  }

  throw new Error(
    `Timed out waiting for a matching enquiry record after scanning ${inspectedCount} records.`
  );
}

export async function readMatchingAnalyticsCount(matcher) {
  const entries = await readJsonEntries(analyticsOutputDir);

  return entries.reduce((total, entry) => {
    const summaryEvents = Array.isArray(entry.value?.events) ? entry.value.events : [];

    return (
      total +
      summaryEvents
        .filter((record) => matcher(record))
        .reduce((count, record) => count + record.count, 0)
    );
  }, 0);
}
