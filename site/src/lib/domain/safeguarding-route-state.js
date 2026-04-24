function buildMailtoHref(email, subject) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
}

function getVerificationLabel(verification) {
  if (verification === "confirmed") {
    return "Operationally confirmed";
  }

  if (verification === "needs-operational-confirmation") {
    return "Supported by the public brief";
  }

  if (verification === "needs-client-confirmation") {
    return "Awaiting confirmation";
  }

  return "Working assumption";
}

/**
 * @param {Record<string, any>} safeguardingInfo
 */
export function deriveSafeguardingRouteState(safeguardingInfo) {
  const namedLeadPublished =
    Boolean(safeguardingInfo.publicConcernRoute.namedLead) &&
    safeguardingInfo.publicConcernRoute.namedLeadStatus === "confirmed";
  const policyAvailable = Boolean(safeguardingInfo.policyDocument.url);
  const secureConcernFormAvailable =
    safeguardingInfo.secureConcernForm.status === "available";

  return {
    immediateDanger: {
      ...safeguardingInfo.immediateDanger,
      statusLabel: "Call 999 first"
    },
    publicConcernRoute: {
      email: safeguardingInfo.publicConcernRoute.email,
      mailtoHref: buildMailtoHref(
        safeguardingInfo.publicConcernRoute.email,
        safeguardingInfo.publicConcernRoute.emailSubject
      ),
      label: namedLeadPublished
        ? safeguardingInfo.publicConcernRoute.namedLead
        : safeguardingInfo.publicConcernRoute.sharedInboxLabel,
      namedLeadState: namedLeadPublished ? "published" : "withheld",
      statusLabel: namedLeadPublished
        ? "Named contact published"
        : "Named contact not published yet",
      summary: safeguardingInfo.publicConcernRoute.summary,
      responseBoundary: safeguardingInfo.publicConcernRoute.responseBoundary,
      handoffNote: safeguardingInfo.publicConcernRoute.handoffNote
    },
    secureConcernForm: {
      state: secureConcernFormAvailable ? "available" : "deferred",
      statusLabel: secureConcernFormAvailable
        ? "Secure form available"
        : "Secure form intentionally deferred",
      surfaceId: safeguardingInfo.secureConcernForm.surfaceId,
      routeId: safeguardingInfo.secureConcernForm.routeId,
      summary: safeguardingInfo.secureConcernForm.summary,
      boundaryNote: safeguardingInfo.secureConcernForm.boundaryNote
    },
    policyDocument: {
      title: safeguardingInfo.policyDocument.title,
      state: policyAvailable ? "available" : "awaiting-publication",
      href: safeguardingInfo.policyDocument.url,
      statusLabel: policyAvailable ? "Policy available" : "Policy not published yet",
      summary: policyAvailable
        ? safeguardingInfo.policyDocument.summaryWhenAvailable
        : safeguardingInfo.policyDocument.summaryWhenUnavailable
    },
    vettingAndTraining: {
      summary: safeguardingInfo.vettingAndTraining.summary,
      statusLabel: getVerificationLabel(safeguardingInfo.vettingAndTraining.verification),
      bullets: safeguardingInfo.vettingAndTraining.bullets
    },
    preparationChecklist: safeguardingInfo.preparationChecklist,
    generalContactBoundary: safeguardingInfo.generalContactBoundary,
    proofBoundary: safeguardingInfo.proofBoundary,
    routes: safeguardingInfo.routes.map((route) => ({
      ...route,
      alternatePageId: route.alternatePageId,
      branch: safeguardingInfo.branches[route.id]
    }))
  };
}

/**
 * @param {Record<string, any>} safeguardingInfo
 * @param {"child" | "adult"} branchId
 */
export function getSafeguardingBranchState(safeguardingInfo, branchId) {
  const route = safeguardingInfo.routes.find((entry) => entry.id === branchId);

  if (!route) {
    throw new Error(`Unknown safeguarding branch: ${branchId}`);
  }

  return {
    ...route,
    branch: safeguardingInfo.branches[branchId]
  };
}
