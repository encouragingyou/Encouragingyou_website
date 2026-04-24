import test from "node:test";
import assert from "node:assert/strict";

import {
  deriveProgrammeAccessState,
  selectProgrammeLinkedOpportunityNotice
} from "../src/lib/domain/programme-route-state.js";

const labels = {
  liveSession: {
    label: "Live Saturday route",
    summary: "A recurring session already sits inside this support pillar.",
    tone: "success"
  },
  sessionLimited: {
    label: "Session details vary",
    summary: "Live delivery exists, but the clearest next date may need confirming.",
    tone: "accent"
  },
  overviewOnly: {
    label: "Programme overview",
    summary:
      "This support area is public now, even where delivery still starts with overview guidance.",
    tone: "soft"
  },
  enquiryOnly: {
    label: "Enquiry-led route",
    summary:
      "This support direction starts with a conversation rather than a published timetable.",
    tone: "accent"
  }
};

const scheduledLinkedSession = {
  title: "Youth club",
  href: "/sessions/youth-club/",
  summary: "Every Saturday · 6:45 PM to 8:45 PM · next Sat 25 Apr"
};

const limitedLinkedSession = {
  title: "Youth club",
  href: "/sessions/youth-club/",
  summary: "Every Saturday · time to be confirmed"
};

test("programme access state uses the scheduled linked session when delivery is live", () => {
  const state = deriveProgrammeAccessState({
    existingDeliveryMode: "active-session-linked",
    labels,
    linkedSessionSummaries: [limitedLinkedSession],
    scheduledLinkedSession
  });

  assert.equal(state.id, "live-session");
  assert.equal(state.label, labels.liveSession.label);
  assert.equal(state.tone, "success");
  assert.deepEqual(state.linkedSession, scheduledLinkedSession);
});

test("programme access state falls back to session-limited when no scheduled linked session is available", () => {
  const state = deriveProgrammeAccessState({
    existingDeliveryMode: "active-session-linked",
    labels,
    linkedSessionSummaries: [limitedLinkedSession],
    scheduledLinkedSession: null
  });

  assert.equal(state.id, "session-limited");
  assert.equal(state.label, labels.sessionLimited.label);
  assert.equal(state.tone, "accent");
  assert.deepEqual(state.linkedSession, limitedLinkedSession);
});

test("programme access state distinguishes overview-only and enquiry-only family routes", () => {
  const overviewOnly = deriveProgrammeAccessState({
    existingDeliveryMode: "launch-overview-only",
    labels,
    linkedSessionSummaries: [],
    scheduledLinkedSession: null
  });
  const enquiryOnly = deriveProgrammeAccessState({
    existingDeliveryMode: "growth-planned",
    labels,
    linkedSessionSummaries: [],
    scheduledLinkedSession: null
  });

  assert.equal(overviewOnly.id, "overview-only");
  assert.equal(overviewOnly.label, labels.overviewOnly.label);
  assert.equal(overviewOnly.linkedSession, null);

  assert.equal(enquiryOnly.id, "enquiry-only");
  assert.equal(enquiryOnly.label, labels.enquiryOnly.label);
  assert.equal(enquiryOnly.linkedSession, null);
});

test("linked opportunity notices follow the programme access state across live, overview, and enquiry-led routes", () => {
  const activeNotice = {
    title: "Youth club is currently the live route",
    body: "Use the youth club session page for timings and calendar details.",
    tone: "info"
  };
  const fallbackNotice = {
    title: "Need the next youth club date confirmed?",
    body: "Use the contact route to confirm the next date.",
    tone: "important"
  };
  const overviewNotice = {
    title: "Programme live, public timing still intentionally light",
    body: "Use contact if you want help finding the right next route.",
    tone: "info"
  };
  const enquiryNotice = {
    title: "Start with a conversation",
    body: "Current access starts with an enquiry rather than a published timetable.",
    tone: "important"
  };

  assert.deepEqual(
    selectProgrammeLinkedOpportunityNotice({
      stateId: "live-session",
      activeNotice,
      fallbackNotice,
      overviewNotice,
      enquiryNotice
    }),
    activeNotice
  );
  assert.deepEqual(
    selectProgrammeLinkedOpportunityNotice({
      stateId: "session-limited",
      activeNotice,
      fallbackNotice,
      overviewNotice,
      enquiryNotice
    }),
    fallbackNotice
  );
  assert.deepEqual(
    selectProgrammeLinkedOpportunityNotice({
      stateId: "overview-only",
      activeNotice,
      fallbackNotice,
      overviewNotice,
      enquiryNotice
    }),
    overviewNotice
  );
  assert.deepEqual(
    selectProgrammeLinkedOpportunityNotice({
      stateId: "enquiry-only",
      activeNotice,
      fallbackNotice,
      overviewNotice,
      enquiryNotice
    }),
    enquiryNotice
  );
});
