import { createHash, randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

import {
  buildEnquiryStatusHref,
  getAllowedOriginPaths,
  getEnquiryContextById,
  getFallbackOriginPath,
  getFormSurfaceById,
  getReasonById,
  getReasonOptionsForSurface
} from "../forms/enquiry-contract.js";
import {
  buildFormSubmittedEvent,
  recordServerAnalyticsEvent
} from "../analytics/server.js";
import { getEnquiryFeedbackMessage } from "../forms/enquiry-feedback.js";
import {
  getRenderedAtDate,
  normalizeSupportFormPayload,
  validateEnquirySubmission
} from "../state/support-form.js";
import { isTrustedSameOriginRequest } from "../security/request-guards.js";
import { resolveDeploymentChannel } from "../deployment/context.js";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 20;
const MIN_RENDERED_AGE_MS = 800;
const MAX_FUTURE_RENDER_OFFSET_MS = 5_000;

const rateLimitStore =
  globalThis.__encouragingYouRateLimitStore ??
  (globalThis.__encouragingYouRateLimitStore = new Map());

function createReferenceId(now) {
  const stamp = now.toISOString().slice(0, 10).replaceAll("-", "");
  const randomSuffix = randomBytes(3).toString("hex").toUpperCase();

  return `EY-${stamp}-${randomSuffix}`;
}

export function resolveEnquiryStorageDir(options = {}) {
  const channel = resolveDeploymentChannel(options);

  if (channel === "preview" || channel === "ci") {
    return resolve(tmpdir(), "encouragingyou", channel, "enquiries");
  }

  return (
    options.storageDir ??
    globalThis.process?.env?.ENQUIRY_STORAGE_DIR ??
    resolve(globalThis.process?.cwd?.() ?? ".", "var/enquiries")
  );
}

function hashValue(value) {
  return createHash("sha256").update(value).digest("hex");
}

function getRequesterAddress(headers) {
  const forwardedFor = headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "";
  }

  return headers.get("x-real-ip")?.trim() ?? "";
}

function getRequesterKey(headers) {
  const requesterAddress = getRequesterAddress(headers);

  if (requesterAddress) {
    return requesterAddress;
  }

  const fingerprint = [
    headers.get("user-agent") ?? "unknown-agent",
    headers.get("accept-language") ?? "unknown-language"
  ].join("|");

  return `fallback:${hashValue(fingerprint)}`;
}

function pruneRateLimitStore(now) {
  for (const [key, timestamps] of rateLimitStore.entries()) {
    const activeTimestamps = timestamps.filter(
      (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
    );

    if (activeTimestamps.length === 0) {
      rateLimitStore.delete(key);
      continue;
    }

    rateLimitStore.set(key, activeTimestamps);
  }
}

function recordAttempt(headers, surfaceId, now) {
  pruneRateLimitStore(now.getTime());

  const key = `${getRequesterKey(headers)}:${surfaceId}`;
  const attempts = rateLimitStore.get(key) ?? [];

  attempts.push(now.getTime());
  rateLimitStore.set(key, attempts);

  return attempts.length <= RATE_LIMIT_MAX_ATTEMPTS;
}

function isSubmissionTooFast(renderedAt, now) {
  if (!renderedAt) {
    return false;
  }

  const elapsed = now.getTime() - renderedAt.getTime();

  if (elapsed < -MAX_FUTURE_RENDER_OFFSET_MS) {
    return true;
  }

  return elapsed < MIN_RENDERED_AGE_MS;
}

function buildOriginPath(surface, payload) {
  if (
    surface &&
    payload.originPath &&
    getAllowedOriginPaths(surface.id).includes(payload.originPath)
  ) {
    return payload.originPath;
  }

  return getFallbackOriginPath(surface?.id ?? "support-general");
}

async function writeSubmissionRecord(record, storageDir) {
  await mkdir(storageDir, { recursive: true });

  const filePath = resolve(storageDir, `${record.referenceId}.json`);

  await writeFile(filePath, `${JSON.stringify(record, null, 2)}\n`, "utf8");
}

function buildErrorResult(surfaceId, originPath, formId, state, code, contextId) {
  return {
    ok: false,
    status: state === "rate-limited" ? 429 : state === "invalid" ? 400 : 403,
    state,
    code,
    tone: "error",
    message: getEnquiryFeedbackMessage(code, ""),
    redirectUrl: buildEnquiryStatusHref(originPath, {
      surfaceId,
      status: "error",
      code,
      contextId,
      formId
    })
  };
}

export function resetEnquiryRateLimitStore() {
  rateLimitStore.clear();
}

export async function processEnquirySubmission({
  requestUrl,
  headers,
  formData,
  now = new Date(),
  storageDir = resolveEnquiryStorageDir()
}) {
  const provisionalPayload = normalizeSupportFormPayload(formData);
  const surface = getFormSurfaceById(provisionalPayload.surfaceId);
  const originPath = buildOriginPath(surface, provisionalPayload);
  const reasonOptions = surface ? getReasonOptionsForSurface(surface.id) : [];
  const payload = normalizeSupportFormPayload(formData, reasonOptions, {
    originPath
  });
  const context = payload.contextId ? getEnquiryContextById(payload.contextId) : null;
  const validation = validateEnquirySubmission(payload, {
    allowedContextIds: context ? [context.id] : [],
    allowedOriginPaths: surface ? getAllowedOriginPaths(surface.id) : [],
    reasonOptions,
    surfaceId: surface?.id ?? ""
  });
  const fallbackSurfaceId = surface?.id ?? "support-general";

  if (!surface) {
    return buildErrorResult(
      fallbackSurfaceId,
      originPath,
      payload.formId,
      "spam-blocked",
      "invalid-surface",
      payload.contextId
    );
  }

  if (!isTrustedSameOriginRequest({ requestUrl, headers })) {
    return buildErrorResult(
      surface.id,
      originPath,
      payload.formId,
      "spam-blocked",
      "origin-blocked",
      payload.contextId
    );
  }

  if (payload.honeypot) {
    return buildErrorResult(
      surface.id,
      originPath,
      payload.formId,
      "spam-blocked",
      "honeypot-blocked",
      payload.contextId
    );
  }

  const renderedAt = getRenderedAtDate(payload.renderedAt);

  if (isSubmissionTooFast(renderedAt, now)) {
    return buildErrorResult(
      surface.id,
      originPath,
      payload.formId,
      "spam-blocked",
      "timing-blocked",
      payload.contextId
    );
  }

  if (!validation.isValid) {
    return {
      ...buildErrorResult(
        surface.id,
        originPath,
        payload.formId,
        validation.formError ? "spam-blocked" : "invalid",
        validation.code || "validation-error",
        payload.contextId
      ),
      fieldErrors: validation.fieldErrors
    };
  }

  if (!recordAttempt(headers, surface.id, now)) {
    return buildErrorResult(
      surface.id,
      originPath,
      payload.formId,
      "rate-limited",
      "rate-limited",
      payload.contextId
    );
  }

  const reason = getReasonById(payload.reason);
  const referenceId = createReferenceId(now);
  const requesterAddress = getRequesterAddress(headers);
  const record = {
    referenceId,
    receivedAt: now.toISOString(),
    surfaceId: surface.id,
    originPath,
    context: context
      ? {
          id: context.id,
          kind: context.kind,
          label: context.label,
          routePath: context.routePath
        }
      : null,
    reason: {
      id: reason?.id ?? payload.reason,
      label: reason?.label ?? payload.reasonLabel,
      routingKey: reason?.routingKey ?? "general-intake"
    },
    sender: {
      name: payload.name,
      email: payload.email,
      updatesOptIn: payload.updatesOptIn
    },
    message: payload.message,
    requestMeta: {
      ipHash: requesterAddress ? hashValue(requesterAddress) : null,
      userAgent: headers.get("user-agent") ?? null,
      origin: headers.get("origin") ?? null,
      referer: headers.get("referer") ?? null
    }
  };

  try {
    await writeSubmissionRecord(record, storageDir);
  } catch {
    return {
      ok: false,
      status: 503,
      state: "error",
      code: "storage-error",
      tone: "error",
      message: getEnquiryFeedbackMessage("storage-error", ""),
      redirectUrl: buildEnquiryStatusHref(originPath, {
        surfaceId: surface.id,
        status: "error",
        code: "storage-error",
        contextId: payload.contextId,
        formId: payload.formId
      })
    };
  }

  void recordServerAnalyticsEvent(
    buildFormSubmittedEvent({
      originPath,
      surfaceId: surface.id
    })
  );

  return {
    ok: true,
    status: 201,
    state: "success",
    code: "sent",
    tone: "success",
    referenceId,
    message: getEnquiryFeedbackMessage("sent", surface.successMessage, referenceId),
    redirectUrl: buildEnquiryStatusHref(originPath, {
      surfaceId: surface.id,
      status: "success",
      code: "sent",
      referenceId,
      contextId: payload.contextId,
      formId: payload.formId
    })
  };
}

export function wantsJsonResponse(request) {
  return (request.headers.get("accept") ?? "").includes("application/json");
}
