const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;
const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 120;
const MESSAGE_MIN_LENGTH = 16;
const MESSAGE_MAX_LENGTH = 2000;

export const SUPPORT_FORM_FIELD_ORDER = ["name", "email", "reason", "message"];

function readValue(source, key) {
  if (source instanceof FormData) {
    return source.get(key);
  }

  return source[key];
}

function normalizeValue(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeOptionalValue(value) {
  const normalized = normalizeValue(value);

  return normalized ? normalized : null;
}

function normalizeCheckboxValue(value) {
  return normalizeValue(value) === "yes";
}

function resolveDate(value) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function getReasonLabel(reasonId, reasonOptions = []) {
  return reasonOptions.find((reason) => reason.id === reasonId)?.label ?? reasonId;
}

export function normalizeSupportFormPayload(source, reasonOptions = [], defaults = {}) {
  const reason =
    normalizeValue(readValue(source, "reason")) || defaults.defaultReasonId || "";

  return {
    surfaceId: normalizeValue(readValue(source, "surfaceId")) || defaults.surfaceId || "",
    originPath:
      normalizeValue(readValue(source, "originPath")) || defaults.originPath || "",
    formId: normalizeValue(readValue(source, "formId")) || defaults.formId || "",
    contextId: normalizeOptionalValue(readValue(source, "contextId")),
    renderedAt: normalizeValue(readValue(source, "renderedAt")),
    honeypot: normalizeValue(readValue(source, "website")),
    name: normalizeValue(readValue(source, "name")),
    email: normalizeValue(readValue(source, "email")).toLowerCase(),
    reason,
    reasonLabel: reason ? getReasonLabel(reason, reasonOptions) : "",
    message: normalizeValue(readValue(source, "message")),
    updatesOptIn: normalizeCheckboxValue(readValue(source, "updates"))
  };
}

export function validateSupportForm(payload, reasonOptions = []) {
  const errors = {};
  const knownReasons = new Set(reasonOptions.map((reason) => reason.id));

  if (payload.name.length < NAME_MIN_LENGTH) {
    errors.name = "Enter the name we should use when replying.";
  } else if (payload.name.length > NAME_MAX_LENGTH) {
    errors.name = "Keep the name under 120 characters.";
  }

  if (!EMAIL_PATTERN.test(payload.email)) {
    errors.email = "Enter a valid email address so we can reply.";
  }

  if (!payload.reason) {
    errors.reason = "Choose the type of enquiry.";
  } else if (knownReasons.size > 0 && !knownReasons.has(payload.reason)) {
    errors.reason = "Choose one of the listed enquiry routes.";
  }

  if (payload.message.length < MESSAGE_MIN_LENGTH) {
    errors.message = "Add a little more detail so the team can route your enquiry.";
  } else if (payload.message.length > MESSAGE_MAX_LENGTH) {
    errors.message = "Keep your message under 2000 characters.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateEnquirySubmission(
  payload,
  {
    allowedContextIds = [],
    allowedOriginPaths = [],
    reasonOptions = [],
    surfaceId = ""
  } = {}
) {
  const fieldValidation = validateSupportForm(payload, reasonOptions);
  let formError = "";
  let code = "";

  if (!surfaceId || payload.surfaceId !== surfaceId) {
    formError = "This form could not be verified. Reload the page and try again.";
    code = "invalid-surface";
  } else if (
    payload.originPath &&
    allowedOriginPaths.length > 0 &&
    !allowedOriginPaths.includes(payload.originPath)
  ) {
    formError = "This form could not be verified on the current route.";
    code = "invalid-origin";
  } else if (
    payload.contextId &&
    (allowedContextIds.length === 0 || !allowedContextIds.includes(payload.contextId))
  ) {
    formError =
      "This prefilled route is no longer available. Start again from the page you were using.";
    code = "invalid-context";
  } else if (!resolveDate(payload.renderedAt)) {
    formError = "This form has expired. Reload the page and try again.";
    code = "invalid-render-time";
  }

  return {
    isValid: fieldValidation.isValid && !formError,
    fieldErrors: fieldValidation.errors,
    formError,
    code
  };
}

export function getRenderedAtDate(renderedAt) {
  return resolveDate(renderedAt);
}
