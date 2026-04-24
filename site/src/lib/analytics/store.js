import { tmpdir } from "node:os";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { ANALYTICS_STORAGE_VERSION, sanitizeAnalyticsEvent } from "./contract.js";
import { resolveDeploymentChannel } from "../deployment/context.js";

let analyticsWriteQueue =
  globalThis.__encouragingYouAnalyticsWriteQueue ?? Promise.resolve();

globalThis.__encouragingYouAnalyticsWriteQueue = analyticsWriteQueue;

export function resolveAnalyticsStorageDir(options = {}) {
  const channel = resolveDeploymentChannel(options);

  if (channel === "preview" || channel === "ci") {
    return resolve(tmpdir(), "encouragingyou", channel, "analytics");
  }

  return (
    options.storageDir ??
    globalThis.process?.env?.ANALYTICS_STORAGE_DIR ??
    resolve(globalThis.process?.cwd?.() ?? ".", "var/analytics")
  );
}

function getDateKey(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

function getDailySummaryPath(storageDir, dateKey) {
  return resolve(storageDir, `${dateKey}.json`);
}

function buildCounterId(eventName, dimensions) {
  return JSON.stringify({
    eventName,
    ...Object.fromEntries(
      Object.entries(dimensions).sort(([left], [right]) => left.localeCompare(right))
    )
  });
}

function createEmptySummary(dateKey) {
  return {
    version: ANALYTICS_STORAGE_VERSION,
    date: dateKey,
    totals: {
      eventCount: 0
    },
    events: []
  };
}

async function readExistingSummary(filePath, dateKey) {
  try {
    const source = await readFile(filePath, "utf8");
    const parsed = JSON.parse(source);

    return {
      ...createEmptySummary(dateKey),
      ...parsed,
      totals: {
        ...createEmptySummary(dateKey).totals,
        ...(parsed?.totals ?? {})
      },
      events: Array.isArray(parsed?.events) ? parsed.events : []
    };
  } catch (error) {
    if (error?.code === "ENOENT") {
      return createEmptySummary(dateKey);
    }

    throw error;
  }
}

async function persistSummary(storageDir, dateKey, summary) {
  await mkdir(storageDir, { recursive: true });

  const filePath = getDailySummaryPath(storageDir, dateKey);
  const tempPath = `${filePath}.${globalThis.process?.pid ?? "proc"}.${Date.now()}.tmp`;

  await writeFile(tempPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  await rename(tempPath, filePath);
}

function enqueueWrite(task) {
  const nextTask = analyticsWriteQueue.then(task, task);

  analyticsWriteQueue = nextTask.catch(() => {});
  globalThis.__encouragingYouAnalyticsWriteQueue = nextTask.catch(() => {});

  return nextTask;
}

export async function recordAnalyticsEvent(
  input,
  { now = new Date(), storageDir = resolveAnalyticsStorageDir() } = {}
) {
  const event = sanitizeAnalyticsEvent(input);

  if (!event) {
    return false;
  }

  return enqueueWrite(async () => {
    const dateKey = getDateKey(now);
    const filePath = getDailySummaryPath(storageDir, dateKey);
    const summary = await readExistingSummary(filePath, dateKey);
    const counterId = buildCounterId(event.eventName, event.dimensions);
    const existing = summary.events.find((entry) => entry.id === counterId);

    summary.totals.eventCount += 1;
    summary.lastUpdatedAt = now.toISOString();

    if (existing) {
      existing.count += 1;
    } else {
      summary.events.push({
        id: counterId,
        eventName: event.eventName,
        dimensions: event.dimensions,
        count: 1
      });
      summary.events.sort((left, right) => left.id.localeCompare(right.id));
    }

    await persistSummary(storageDir, dateKey, summary);

    return true;
  });
}

export async function safeRecordAnalyticsEvent(input, options) {
  try {
    return await recordAnalyticsEvent(input, options);
  } catch {
    return false;
  }
}

export async function readAnalyticsSummary(
  dateKey = getDateKey(),
  { storageDir = resolveAnalyticsStorageDir() } = {}
) {
  const filePath = getDailySummaryPath(storageDir, dateKey);

  return readExistingSummary(filePath, dateKey);
}
