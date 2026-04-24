import consentAwareMicrocopy from "../../content/consentAwareMicrocopy/default.json" with { type: "json" };
import editorialSystem from "../../content/editorialSystem/default.json" with { type: "json" };

const audienceModeIndex = new Map(
  editorialSystem.audienceModes.map((mode) => [mode.audience, mode])
);
const templateContractIndex = new Map(
  editorialSystem.templateContracts.map((contract) => [contract.template, contract])
);
const placeholderPolicyIndex = new Map(
  editorialSystem.placeholderPolicies.map((policy) => [
    `${policy.contentStatus}:${policy.trustCritical}`,
    policy
  ])
);

function requireValue<T>(value: T | null | undefined, message: string): T {
  if (value === null || value === undefined) {
    throw new Error(message);
  }

  return value;
}

export function getVoicePrinciples() {
  return editorialSystem.voicePrinciples;
}

export function getAudienceMode(audience: string) {
  return requireValue(
    audienceModeIndex.get(audience),
    `Missing editorial audience mode for ${audience}.`
  );
}

export function getContentPatterns() {
  return editorialSystem.contentPatterns;
}

export function getSupportFormMicrocopy() {
  return consentAwareMicrocopy.forms;
}

export function getSessionStatusMicrocopy() {
  return editorialSystem.microcopyPatterns.sessionStatus;
}

export function getTemplateEditorialContract(template: string) {
  return requireValue(
    templateContractIndex.get(template),
    `Missing editorial template contract for ${template}.`
  );
}

export function buildPlaceholderStatus(page: {
  contentStatus: string;
  trustCritical: boolean;
}) {
  const policy = placeholderPolicyIndex.get(
    `${page.contentStatus}:${page.trustCritical}`
  );

  if (!policy) {
    return null;
  }

  const labels = editorialSystem.microcopyPatterns.placeholderStatus;

  return {
    title: labels.title,
    summary: policy.summary,
    publishNowLabel: labels.publishNowLabel,
    publishNow: policy.publishNow,
    awaitingLabel: labels.awaitingLabel,
    awaiting: policy.awaitingConfirmation,
    hiddenLabel: labels.hiddenLabel,
    hidden: policy.hideUntilVerified
  };
}

export function getFuturePromptChecklist() {
  return editorialSystem.futurePromptChecklist;
}

export function getBannedPublicPhrases() {
  return editorialSystem.bannedPublicPhrases;
}
