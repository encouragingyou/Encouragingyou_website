import contactInfo from "../../content/contactInfo/default.json" with { type: "json" };
import formSurfaces from "../../content/formSurfaces/default.json" with { type: "json" };
import cvSupport from "../../content/sessions/cv-support.json" with { type: "json" };
import youthClub from "../../content/sessions/youth-club.json" with { type: "json" };

export const ENQUIRY_ENDPOINT_PATH = "/api/enquiry/";
export const ENQUIRY_STATUS_PARAM = "enquiry";
export const ENQUIRY_SURFACE_PARAM = "enquirySurface";
export const ENQUIRY_CODE_PARAM = "enquiryCode";
export const ENQUIRY_REFERENCE_PARAM = "enquiryRef";
export const ENQUIRY_CONTEXT_PARAM = "context";
export const ENQUIRY_FORM_ID_PARAM = "form";
export const ENQUIRY_HONEYPOT_FIELD = "website";
export const enquiryDeliveryModes = ["secure", "email"];

const sessionReasonOverrides = new Map([["cv-support", "cv-support"]]);
const sessionContextIndex = new Map(
  [cvSupport, youthClub].map((session) => {
    const reasonId = sessionReasonOverrides.get(session.slug) ?? "join-session";
    const title = `You're asking about ${session.shortTitle}.`;
    const body =
      reasonId === "cv-support"
        ? "The form is prefilled for CV support so the team can keep that session context attached to your message."
        : `The form is prefilled so the team can keep the ${session.shortTitle.toLowerCase()} context attached to your message.`;

    return [
      `session:${session.slug}`,
      {
        id: `session:${session.slug}`,
        kind: "session",
        label: session.shortTitle,
        reasonId,
        routePath: session.route,
        returnLabel: `Back to ${session.shortTitle}`,
        title,
        body
      }
    ];
  })
);

const surfaceIndex = new Map(
  formSurfaces.surfaces.map((surface) => [surface.id, surface])
);
const reasonIndex = new Map(
  contactInfo.reasonOptions.map((reason) => [reason.id, reason])
);
const surfaceOriginAllowlist = new Map([
  ["support-general", new Set(["/", "/contact/"])],
  ["involvement-general", new Set(["/get-involved/"])],
  ["volunteer-enquiry", new Set(["/volunteer/"])],
  ["partner-enquiry", new Set(["/partner/"])],
  ["accessibility-feedback", new Set(["/accessibility/"])],
  [
    "safeguarding-concern",
    new Set(["/safeguarding/", "/safeguarding/child/", "/safeguarding/adult/"])
  ]
]);

function cloneContext(context) {
  if (!context) {
    return null;
  }

  return { ...context };
}

export function getFormSurfaceById(surfaceId) {
  return surfaceIndex.get(surfaceId) ?? null;
}

export function getReasonById(reasonId) {
  return reasonIndex.get(reasonId) ?? null;
}

export function getAllowedOriginPaths(surfaceId) {
  return [...(surfaceOriginAllowlist.get(surfaceId) ?? new Set(["/contact/"]))];
}

export function getFallbackOriginPath(surfaceId) {
  return getAllowedOriginPaths(surfaceId)[0] ?? "/contact/";
}

export function isAllowedOriginPath(surfaceId, candidatePath) {
  return surfaceOriginAllowlist.get(surfaceId)?.has(candidatePath) ?? false;
}

export function getReasonOptionsForSurface(surfaceId) {
  const surface = getFormSurfaceById(surfaceId);

  if (!surface) {
    return [];
  }

  const allowedReasonIds =
    surface.allowedReasonIds ?? contactInfo.reasonOptions.map((reason) => reason.id);

  return contactInfo.reasonOptions.filter((reason) =>
    allowedReasonIds.includes(reason.id)
  );
}

export function getEnquiryContextById(contextId) {
  return cloneContext(sessionContextIndex.get(contextId));
}

export function buildSessionEnquiryHref(sessionSlug) {
  const contextId = `session:${sessionSlug}`;

  if (!sessionContextIndex.has(contextId)) {
    throw new Error(`Unknown session enquiry context: ${sessionSlug}`);
  }

  const href = new URL("/contact/", "https://www.encouragingyou.co.uk");

  href.searchParams.set(ENQUIRY_CONTEXT_PARAM, contextId);
  href.hash = "contact-form";

  return `${href.pathname}${href.search}${href.hash}`;
}

export function buildEnquiryStatusHref(
  originPath,
  { surfaceId, status, code, referenceId, contextId, formId }
) {
  const href = new URL(originPath, "https://www.encouragingyou.co.uk");

  href.searchParams.set(ENQUIRY_STATUS_PARAM, status);
  href.searchParams.set(ENQUIRY_SURFACE_PARAM, surfaceId);

  if (code) {
    href.searchParams.set(ENQUIRY_CODE_PARAM, code);
  }

  if (referenceId) {
    href.searchParams.set(ENQUIRY_REFERENCE_PARAM, referenceId);
  }

  if (contextId) {
    href.searchParams.set(ENQUIRY_CONTEXT_PARAM, contextId);
  }

  if (formId) {
    href.searchParams.set(ENQUIRY_FORM_ID_PARAM, formId);
    href.hash = formId;
  }

  return `${href.pathname}${href.search}${href.hash}`;
}

export function resolveEnquiryDeliveryMode(
  value = globalThis.process?.env?.ENQUIRY_DELIVERY_MODE
) {
  return enquiryDeliveryModes.includes(value) ? value : "secure";
}

export function readEnquiryStatus(urlOrSearchParams, surfaceId) {
  const searchParams =
    urlOrSearchParams instanceof URLSearchParams
      ? urlOrSearchParams
      : urlOrSearchParams?.searchParams;

  if (!searchParams) {
    return null;
  }

  if (searchParams.get(ENQUIRY_SURFACE_PARAM) !== surfaceId) {
    return null;
  }

  const status = searchParams.get(ENQUIRY_STATUS_PARAM);

  if (!status) {
    return null;
  }

  return {
    status,
    code: searchParams.get(ENQUIRY_CODE_PARAM) ?? null,
    referenceId: searchParams.get(ENQUIRY_REFERENCE_PARAM) ?? null,
    contextId: searchParams.get(ENQUIRY_CONTEXT_PARAM) ?? null,
    formId: searchParams.get(ENQUIRY_FORM_ID_PARAM) ?? null
  };
}
