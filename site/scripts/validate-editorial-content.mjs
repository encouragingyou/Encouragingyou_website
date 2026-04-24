import contactInfo from "../src/content/contactInfo/default.json" with { type: "json" };
import editorialSystem from "../src/content/editorialSystem/default.json" with { type: "json" };
import faqs from "../src/content/faqs/default.json" with { type: "json" };
import formSurfaces from "../src/content/formSurfaces/default.json" with { type: "json" };
import homePage from "../src/content/homePage/default.json" with { type: "json" };
import involvementRoutes from "../src/content/involvementRoutes/default.json" with { type: "json" };
import notices from "../src/content/notices/default.json" with { type: "json" };
import pageDefinitions from "../src/content/pageDefinitions/launch.json" with { type: "json" };
import programmePageContent from "../src/content/programmePageContent/default.json" with { type: "json" };
import routePages from "../src/content/routePages/default.json" with { type: "json" };
import safeguardingInfo from "../src/content/safeguardingInfo/default.json" with { type: "json" };
import sessionPageContent from "../src/content/sessionPageContent/default.json" with { type: "json" };
import siteSettings from "../src/content/siteSettings/default.json" with { type: "json" };
import trustSignals from "../src/content/trustSignals/default.json" with { type: "json" };
import updatesFeed from "../src/content/updatesFeed/default.json" with { type: "json" };

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function walkStrings(value, path = "$") {
  if (typeof value === "string") {
    return [{ path, value }];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item, index) => walkStrings(item, `${path}[${index}]`));
  }

  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, nestedValue]) =>
      walkStrings(nestedValue, `${path}.${key}`)
    );
  }

  return [];
}

const allPages = [
  ...pageDefinitions.launchPages,
  ...pageDefinitions.placeholderPages,
  ...pageDefinitions.phaseTwoPages
];
const audienceCoverage = new Set(
  editorialSystem.audienceModes.map((mode) => mode.audience)
);
const templateCoverage = new Set(
  editorialSystem.templateContracts.map((contract) => contract.template)
);
const placeholderPolicyCoverage = new Set(
  editorialSystem.placeholderPolicies.map(
    (policy) => `${policy.contentStatus}:${policy.trustCritical}`
  )
);

for (const page of allPages) {
  assert(
    templateCoverage.has(page.template),
    `editorialSystem.templateContracts is missing template coverage for ${page.template}.`
  );

  if (page.contentStatus === "outline-only" || page.contentStatus === "placeholder") {
    assert(
      placeholderPolicyCoverage.has(`${page.contentStatus}:${page.trustCritical}`),
      `editorialSystem.placeholderPolicies is missing a policy for ${page.id} (${page.contentStatus}, trustCritical=${page.trustCritical}).`
    );
  }

  for (const audience of page.primaryAudiences) {
    assert(
      audienceCoverage.has(audience),
      `editorialSystem.audienceModes is missing coverage for ${audience}.`
    );
  }
}

for (const reason of contactInfo.reasonOptions) {
  for (const audience of reason.targetAudience) {
    assert(
      audienceCoverage.has(audience),
      `editorialSystem.audienceModes is missing contact reason audience ${audience}.`
    );
  }
}

for (const route of involvementRoutes.routes) {
  for (const audience of route.audiences) {
    assert(
      audienceCoverage.has(audience),
      `editorialSystem.audienceModes is missing involvement-route audience ${audience}.`
    );
  }
}

const contentSources = [
  ["homePage", homePage],
  ["contactInfo", contactInfo],
  ["faqs", faqs],
  ["formSurfaces", formSurfaces],
  ["involvementRoutes", involvementRoutes],
  ["notices", notices],
  ["programmePageContent", programmePageContent],
  ["routePages", routePages],
  ["safeguardingInfo", safeguardingInfo],
  ["sessionPageContent", sessionPageContent],
  ["siteSettings", siteSettings],
  ["trustSignals", trustSignals],
  ["updatesFeed", updatesFeed]
];

const bannedPhrases = editorialSystem.bannedPublicPhrases.map((phrase) =>
  phrase.toLowerCase()
);

for (const [sourceName, sourceValue] of contentSources) {
  for (const entry of walkStrings(sourceValue, sourceName)) {
    const lowered = entry.value.toLowerCase();

    for (const phrase of bannedPhrases) {
      assert(
        !lowered.includes(phrase),
        `${entry.path} contains banned public phrase "${phrase}".`
      );
    }
  }
}

assert(
  editorialSystem.futurePromptChecklist.length >= 6,
  "editorialSystem.futurePromptChecklist should stay concise but substantive."
);
assert(
  editorialSystem.contentPatterns.length >= 8,
  "editorialSystem.contentPatterns should cover the major route contexts."
);

console.log(
  `[editorial-validate] validated ${editorialSystem.audienceModes.length} audience modes, ${editorialSystem.templateContracts.length} template contracts, and ${contentSources.length} publishable content sources`
);
