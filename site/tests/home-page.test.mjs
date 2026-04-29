import test from "node:test";
import assert from "node:assert/strict";

import ctaBlocks from "../src/content/ctaBlocks/default.json" with { type: "json" };
import faqs from "../src/content/faqs/default.json" with { type: "json" };
import formSurfaces from "../src/content/formSurfaces/default.json" with { type: "json" };
import homePage from "../src/content/homePage/default.json" with { type: "json" };
import involvementRoutes from "../src/content/involvementRoutes/default.json" with { type: "json" };
import navigation from "../src/content/navigation/default.json" with { type: "json" };
import pageDefinitions from "../src/content/pageDefinitions/launch.json" with { type: "json" };
import careerSupportProgramme from "../src/content/programmes/career-support-cv-help.json" with { type: "json" };
import communityFriendshipProgramme from "../src/content/programmes/community-friendship.json" with { type: "json" };
import communitySupportProgramme from "../src/content/programmes/community-support-intergenerational-connection.json" with { type: "json" };
import personalGrowthProgramme from "../src/content/programmes/personal-growth-life-skills.json" with { type: "json" };
import routePages from "../src/content/routePages/default.json" with { type: "json" };
import safeguardingInfo from "../src/content/safeguardingInfo/default.json" with { type: "json" };
import cvSupportSession from "../src/content/sessions/cv-support.json" with { type: "json" };
import youthClubSession from "../src/content/sessions/youth-club.json" with { type: "json" };
import updatesFeed from "../src/content/updatesFeed/default.json" with { type: "json" };

const allPages = [
  ...pageDefinitions.launchPages,
  ...pageDefinitions.placeholderPages,
  ...pageDefinitions.phaseTwoPages
];
const ctaIndex = new Map(ctaBlocks.blocks.map((cta) => [cta.id, cta]));
const homeActionIndex = new Map(homePage.actions.map((action) => [action.id, action]));
const pageIndex = new Map(allPages.map((page) => [page.id, page]));
const routePageIndex = new Map(routePages.pages.map((page) => [page.pageId, page]));
const formSurfaceIndex = new Map(
  formSurfaces.surfaces.map((surface) => [surface.id, surface])
);
const faqGroupIndex = new Map(faqs.groups.map((group) => [group.id, group]));
const involvementRouteIndex = new Map(
  involvementRoutes.routes.map((route) => [route.id, route])
);
const programmeContent = [
  communityFriendshipProgramme,
  personalGrowthProgramme,
  careerSupportProgramme,
  communitySupportProgramme
];

function collectStrings(value) {
  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap(collectStrings);
  }

  if (value && typeof value === "object") {
    return Object.values(value).flatMap(collectStrings);
  }

  return [];
}

function resolveActionHref(actionId) {
  const action = homeActionIndex.get(actionId);

  assert.ok(action, `Missing home action: ${actionId}`);

  if (action.ctaId) {
    const cta = ctaIndex.get(action.ctaId);

    assert.ok(cta, `Missing CTA: ${action.ctaId}`);
    return cta.href ?? pageIndex.get(cta.routeId).route;
  }

  return action.href ?? pageIndex.get(action.routeId).route;
}

function assertRoute(pageId, expectedRoute) {
  const page = pageIndex.get(pageId);

  assert.ok(page, `Missing route definition: ${pageId}`);
  assert.equal(page.route, expectedRoute);
  assert.equal(page.contentStatus, "seeded");
}

function assertContainsCopy(source, pattern, context) {
  assert.match(JSON.stringify(source), pattern, context);
}

test("homepage content locks the compact route hub conversion contract", () => {
  assert.equal(homePage.conversionStack.primaryActionId, "join-session");
  assert.equal(homePage.conversionStack.secondaryActionId, "ask-a-support-question");
  assert.equal(
    homePage.hero.headline,
    "Helping young people in Rochdale build confidence, friendships and future opportunities."
  );
  assert.equal(homePage.hero.secondaryActionId, "ask-a-support-question");
  assert.match(homePage.hero.summary, /young people in Rochdale/u);
  assert.match(homePage.hero.summary, /Youth club/u);
  assert.match(homePage.hero.summary, /CV and application help/u);
  assert.match(homePage.hero.summary, /low-pressure friendship/u);
  assert.match(homePage.hero.summary, /confidence-building/u);
  assert.match(homePage.hero.summary, /practical support/u);
  assert.doesNotMatch(homePage.metaDescription, /\bBuild confidence\b/u);
  assert.doesNotMatch(homePage.hero.summary, /\b\d+\s*(?:-|to)\s*\d+\b/u);
  assert.ok(
    homePage.launchBoundaries.staysOnHomepageNow.includes(
      "route hub cards into verified pages"
    )
  );
});

test("homepage copy stays specific without invented public age ranges", () => {
  const askAction = homeActionIndex.get("ask-a-support-question");
  const cvAction = homeActionIndex.get("get-cv-help");
  const programmeSection = homePage.sections.find(
    (section) => section.id === "programme-teasers"
  );

  assert.equal(askAction.label, "Ask a question");
  assert.equal(
    askAction.summary,
    "Send a short message if you are unsure what fits or want to check timing, privacy, or safety."
  );
  assert.equal(
    cvAction.summary,
    "Get real help writing your CV, applying for jobs, and preparing for interviews."
  );
  assert.match(programmeSection.summary, /confidence, life skills, motivation/u);
  assert.match(programmeSection.summary, /low-pressure friendship/u);
  assert.match(programmeSection.summary, /practical help/u);

  for (const copy of collectStrings(homePage)) {
    assert.doesNotMatch(copy, /\b\d+\s*(?:-|to)\s*\d+\b/u);
  }
});

test("homepage route hub actions resolve to verified launch routes", () => {
  assert.equal(resolveActionHref("join-session"), "/sessions/");
  assert.equal(resolveActionHref("get-cv-help"), "/programmes/career-support-cv-help/");
  assert.equal(resolveActionHref("explore-programmes"), "/programmes/");
  assert.equal(resolveActionHref("about-organisation"), "/about/");
  assert.equal(resolveActionHref("volunteer-or-partner"), "/get-involved/");
  assert.equal(resolveActionHref("get-support"), "/contact/");
  assert.equal(resolveActionHref("ask-a-support-question"), "/contact/");
  assert.equal(resolveActionHref("safeguarding-information"), "/safeguarding/");

  const youthClubPage = pageIndex.get("session-youth-club");

  assert.ok(youthClubPage, "Missing Youth club route definition");
  assert.equal(youthClubPage.route, "/sessions/youth-club/");
});

test("old homepage depth has verified destination routes instead of homepage-only content", () => {
  const aboutPage = routePageIndex.get("about");
  const programmesPage = routePageIndex.get("programmes");
  const sessionsPage = routePageIndex.get("sessions");
  const contactPage = routePageIndex.get("contact");
  const getInvolvedPage = routePageIndex.get("get-involved");
  const eventsPage = routePageIndex.get("events-updates");
  const safeguardingPage = routePageIndex.get("safeguarding");

  for (const [pageId, route] of [
    ["about", "/about/"],
    ["programmes", "/programmes/"],
    ["programme-career-support-cv-help", "/programmes/career-support-cv-help/"],
    ["sessions", "/sessions/"],
    ["session-cv-support", "/sessions/cv-support/"],
    ["session-youth-club", "/sessions/youth-club/"],
    ["get-involved", "/get-involved/"],
    ["volunteer", "/volunteer/"],
    ["partner", "/partner/"],
    ["contact", "/contact/"],
    ["safeguarding", "/safeguarding/"],
    ["safeguarding-child", "/safeguarding/child/"],
    ["safeguarding-adult", "/safeguarding/adult/"],
    ["events-updates", "/events-updates/"]
  ]) {
    assertRoute(pageId, route);
  }

  assert.equal(aboutPage.storySections.length, 4);
  assertContainsCopy(aboutPage, /EncouragingYou started/u, "About owns the origin story");
  assertContainsCopy(aboutPage, /Run by young leaders/u, "About owns youth-led story");

  assert.equal(programmesPage.audienceSection.items.length, 4);
  for (const programme of programmeContent) {
    assert.ok(programme.route.startsWith("/programmes/"));
    assert.ok(programme.bodySections.length >= 3);
  }

  assertContainsCopy(sessionsPage, /CV support at 16:45 and youth club at 18:45/u);
  assert.equal(cvSupportSession.route, "/sessions/cv-support/");
  assert.equal(cvSupportSession.schedule.label, "Every Saturday");
  assert.equal(cvSupportSession.schedule.startTime, "16:45");
  assert.equal(cvSupportSession.schedule.durationMinutes, 120);
  assert.equal(careerSupportProgramme.route, "/programmes/career-support-cv-help/");
  assert.ok(careerSupportProgramme.relatedSessionIds.includes("cv-support"));
  assertContainsCopy(careerSupportProgramme, /CV writing/u);

  assert.equal(youthClubSession.route, "/sessions/youth-club/");
  assert.equal(youthClubSession.schedule.label, "Every Saturday");
  assert.equal(youthClubSession.schedule.startTime, "18:45");
  assert.equal(youthClubSession.schedule.durationMinutes, 120);
  assert.ok(communityFriendshipProgramme.relatedSessionIds.includes("youth-club"));
  assertContainsCopy(
    youthClubSession,
    /Games, activities, conversation, and chill time/u
  );

  assert.ok(getInvolvedPage.routeCards.length >= 5);
  assert.equal(involvementRouteIndex.get("volunteer").routeId, "volunteer");
  assert.equal(involvementRouteIndex.get("partner").routeId, "partner");
  assertContainsCopy(getInvolvedPage, /Volunteer pathways/u);
  assertContainsCopy(getInvolvedPage, /Partner and referral-friendly/u);

  assert.equal(contactPage.formSurfaceId, "support-general");
  assert.ok(formSurfaceIndex.get("support-general"));
  assert.ok(faqGroupIndex.get("contact"));
  assertContainsCopy(contactPage, /short form below/u);

  assert.equal(safeguardingInfo.routes.length, 2);
  assert.equal(safeguardingInfo.routes[0].pageId, "safeguarding-child");
  assert.equal(safeguardingInfo.routes[1].pageId, "safeguarding-adult");
  assertContainsCopy(safeguardingPage, /Child and adult routes kept separate/u);
  assertContainsCopy(
    safeguardingInfo,
    /Immediate danger needs emergency services first/u
  );

  assert.ok(updatesFeed.items.length >= 3);
  assert.equal(
    updatesFeed.items.some((item) => item.slug === "community-events-and-workshops"),
    true
  );
  assertContainsCopy(
    eventsPage,
    /Recurring Saturday support stays on the Sessions route/u
  );
});

test("footer keeps depth, legal, and safeguarding routes available after homepage shortening", () => {
  const footerRouteIds = new Set(
    navigation.footerGroups
      .flatMap((group) => group.items)
      .map((item) => item.routeId)
      .filter(Boolean)
  );

  for (const pageId of [
    "about",
    "programmes",
    "sessions",
    "events-updates",
    "get-involved",
    "volunteer",
    "partner",
    "contact",
    "safeguarding",
    "privacy",
    "cookies",
    "accessibility",
    "terms"
  ]) {
    assert.ok(footerRouteIds.has(pageId), `Footer is missing ${pageId}`);
    assert.ok(pageIndex.get(pageId), `Footer route ${pageId} has no page definition`);
  }

  assert.ok(
    navigation.primaryItems.some((item) => item.routeId === "safeguarding"),
    "Safeguarding should remain visible in primary navigation."
  );
  assert.equal(
    navigation.footerGroups.some((group) =>
      group.items.some(
        (item) => item.href === "https://www.instagram.com/encouragingyou1/"
      )
    ),
    true
  );
});

test("homepage trust routing now resolves to distinct routes instead of one blanket link", () => {
  const trustSection = homePage.sections.find((section) => section.id === "trust-strip");
  const trustHrefs = trustSection.trustItems.map((item) =>
    resolveActionHref(item.actionId)
  );

  assert.ok(trustHrefs.includes("/about/"));
  assert.ok(trustHrefs.includes("/privacy/"));
  assert.ok(trustHrefs.includes("/safeguarding/"));
  assert.ok(trustHrefs.includes("/sessions/"));
});

test("homepage state rules and launch boundaries stay explicit", () => {
  assert.equal(updatesFeed.items.length, 3);
  assert.equal(updatesFeed.items.filter((item) => item.showOnHome !== false).length, 2);
  assert.equal(homePage.stateRules.updates.emptyBehavior, "teaser");
  assert.ok(homePage.stateRules.contact.pendingFields.includes("publicPhone"));
  assert.ok(
    homePage.launchBoundaries.deferredToLaterRoutes.includes(
      "full event and update archive"
    )
  );
  assert.ok(
    homePage.launchBoundaries.staysOnHomepageNow.includes(
      "short who, what, and why introduction"
    )
  );
  assert.ok(
    homePage.launchBoundaries.intentionallyExcludedFromLaunch.includes(
      "invented proof quotes or impact numbers"
    )
  );
});
