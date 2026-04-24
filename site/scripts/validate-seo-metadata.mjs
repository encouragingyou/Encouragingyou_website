import homePage from "../src/content/homePage/default.json" with { type: "json" };
import pageDefinitions from "../src/content/pageDefinitions/launch.json" with { type: "json" };
import programmesCareerSupport from "../src/content/programmes/career-support-cv-help.json" with { type: "json" };
import programmesCommunityFriendship from "../src/content/programmes/community-friendship.json" with { type: "json" };
import programmesCommunitySupport from "../src/content/programmes/community-support-intergenerational-connection.json" with { type: "json" };
import programmesPersonalGrowth from "../src/content/programmes/personal-growth-life-skills.json" with { type: "json" };
import routePages from "../src/content/routePages/default.json" with { type: "json" };
import seo from "../src/content/seo/default.json" with { type: "json" };
import sessionPageContent from "../src/content/sessionPageContent/default.json" with { type: "json" };
import sessionsCvSupport from "../src/content/sessions/cv-support.json" with { type: "json" };
import sessionsYouthClub from "../src/content/sessions/youth-club.json" with { type: "json" };
import updatesFeed from "../src/content/updatesFeed/default.json" with { type: "json" };
import { buildEditorialFeedModel } from "../src/lib/domain/editorial-feed.js";

const programmes = [
  programmesCommunityFriendship,
  programmesPersonalGrowth,
  programmesCareerSupport,
  programmesCommunitySupport
];
const sessions = [sessionsCvSupport, sessionsYouthClub];
const allPages = [...pageDefinitions.launchPages];
const seoDirectiveIndex = new Map(
  seo.pageDirectives.map((directive) => [directive.pageId, directive])
);
const routePageIndex = new Map(routePages.pages.map((page) => [page.pageId, page]));
const sessionPageIndex = new Map(
  sessionPageContent.pages.map((page) => [page.pageId, page])
);
const sessionBySlug = new Map(sessions.map((session) => [session.slug, session]));
const editorialFeed = buildEditorialFeedModel(updatesFeed);
const internalOnlyPages = [
  {
    id: "component-preview",
    route: "/system/components/",
    title: "Component Preview",
    description: "Internal component harness for prompt 12."
  }
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertLengthInRange(value, min, max, label) {
  assert(
    value.length >= min && value.length <= max,
    `${label} should be ${min}-${max} characters, received ${value.length}`
  );
}

function composeTitle(pageId, pageTitle) {
  const directive = seoDirectiveIndex.get(pageId);

  if (directive?.titleOverride) {
    return directive.titleOverride;
  }

  return `${pageTitle}${seo.defaults.titleSeparator}${seo.defaults.siteName}`;
}

function getStaticPageDescription(page) {
  if (page.id === "home") {
    return homePage.metaDescription;
  }

  if (routePageIndex.has(page.id)) {
    return routePageIndex.get(page.id).metaDescription;
  }

  if (sessionPageIndex.has(page.id)) {
    const session = sessionBySlug.get(sessionPageIndex.get(page.id).sessionSlug);

    return session?.seoDescription ?? null;
  }

  if (page.template === "programme-detail") {
    const programmePage = programmes.find(
      (entry) => `programme-${entry.slug}` === page.id
    );

    return programmePage?.seoDescription ?? null;
  }

  return null;
}

function ensureUnique(values, label) {
  const seen = new Set();

  for (const value of values) {
    assert(!seen.has(value), `Duplicate ${label}: ${value}`);
    seen.add(value);
  }
}

const staticRecords = [
  ...allPages.map((page) => {
    const directive = seoDirectiveIndex.get(page.id);
    const description = getStaticPageDescription(page);

    assert(directive, `Missing SEO directive for page id: ${page.id}`);
    assert(description, `Missing SEO description source for page id: ${page.id}`);

    return {
      pageId: page.id,
      route: page.route,
      title: composeTitle(page.id, page.title),
      description,
      indexable: directive.indexing === "index"
    };
  }),
  ...internalOnlyPages.map((page) => {
    const directive = seoDirectiveIndex.get(page.id);

    assert(directive, `Missing SEO directive for page id: ${page.id}`);

    return {
      pageId: page.id,
      route: page.route,
      title: composeTitle(page.id, page.title),
      description: page.description,
      indexable: directive.indexing === "index"
    };
  })
];

const editorialRecords = editorialFeed.detailItems.map((item) => ({
  pageId: `editorial-${item.slug}`,
  route: item.detailHref,
  title: `${item.detail.intro.title}${seo.defaults.titleSeparator}${seo.defaults.siteName}`,
  description: item.detail.intro.summary ?? item.summary,
  indexable: item.indexVisible
}));

ensureUnique(
  [...staticRecords, ...editorialRecords]
    .filter((record) => record.indexable)
    .map((record) => record.route),
  "indexable canonical route"
);
ensureUnique(
  [...staticRecords, ...editorialRecords]
    .filter((record) => record.indexable)
    .map((record) => record.title),
  "indexable title"
);

for (const record of [...staticRecords, ...editorialRecords]) {
  assertLengthInRange(record.title, 12, 80, `${record.pageId} title`);
  assertLengthInRange(record.description, 40, 180, `${record.pageId} description`);
}

for (const directive of seo.pageDirectives) {
  assert(
    typeof directive.primaryTopic === "string" &&
      directive.primaryTopic.trim().length > 0,
    `seo.pageDirectives:${directive.pageId} requires primaryTopic`
  );
  assert(
    typeof directive.searchIntent === "string" &&
      directive.searchIntent.trim().length > 0,
    `seo.pageDirectives:${directive.pageId} requires searchIntent`
  );
}

console.log(
  `[seo-validate] validated ${staticRecords.length} static route directives and ${editorialRecords.length} editorial detail routes`
);
