/**
 * @typedef {{
 *   title: string;
 *   href: string;
 *   summary: string;
 * }} LinkedSessionSummary
 */

/**
 * @typedef {{
 *   label: string;
 *   summary: string;
 *   tone: "default" | "soft" | "accent" | "inverse" | "meta" | "success";
 * }} ProgrammeStateLabel
 */

/**
 * @typedef {{
 *   existingDeliveryMode: string;
 *   labels: {
 *     liveSession: ProgrammeStateLabel;
 *     sessionLimited: ProgrammeStateLabel;
 *     overviewOnly: ProgrammeStateLabel;
 *     enquiryOnly: ProgrammeStateLabel;
 *   };
 *   linkedSessionSummaries: LinkedSessionSummary[];
 *   scheduledLinkedSession?: LinkedSessionSummary | null;
 * }} ProgrammeAccessStateOptions
 */

/**
 * @typedef {{
 *   title?: string;
 *   body: string;
 *   tone: string;
 *   action?: {
 *     label: string;
 *     variant: string;
 *     routeId?: string;
 *     href?: string;
 *   };
 * }} LinkedOpportunityNotice
 */

/**
 * @param {ProgrammeAccessStateOptions} options
 */
export function deriveProgrammeAccessState({
  existingDeliveryMode,
  labels,
  linkedSessionSummaries,
  scheduledLinkedSession = null
}) {
  if (existingDeliveryMode === "active-session-linked") {
    if (scheduledLinkedSession) {
      return {
        id: "live-session",
        label: labels.liveSession.label,
        summary: labels.liveSession.summary,
        tone: labels.liveSession.tone,
        linkedSession: scheduledLinkedSession
      };
    }

    return {
      id: "session-limited",
      label: labels.sessionLimited.label,
      summary: labels.sessionLimited.summary,
      tone: labels.sessionLimited.tone,
      linkedSession: linkedSessionSummaries[0] ?? null
    };
  }

  if (existingDeliveryMode === "launch-overview-only") {
    return {
      id: "overview-only",
      label: labels.overviewOnly.label,
      summary: labels.overviewOnly.summary,
      tone: labels.overviewOnly.tone,
      linkedSession: null
    };
  }

  return {
    id: "enquiry-only",
    label: labels.enquiryOnly.label,
    summary: labels.enquiryOnly.summary,
    tone: labels.enquiryOnly.tone,
    linkedSession: null
  };
}

/**
 * @param {{
 *   stateId: string;
 *   activeNotice?: LinkedOpportunityNotice | null;
 *   fallbackNotice?: LinkedOpportunityNotice | null;
 *   overviewNotice?: LinkedOpportunityNotice | null;
 *   enquiryNotice?: LinkedOpportunityNotice | null;
 * }} options
 */
export function selectProgrammeLinkedOpportunityNotice({
  stateId,
  activeNotice,
  fallbackNotice,
  overviewNotice,
  enquiryNotice
}) {
  if (stateId === "live-session") {
    return activeNotice ?? null;
  }

  if (stateId === "session-limited") {
    return fallbackNotice ?? null;
  }

  if (stateId === "overview-only") {
    return overviewNotice ?? null;
  }

  if (stateId === "enquiry-only") {
    return enquiryNotice ?? null;
  }

  return null;
}
