import test from "node:test";
import assert from "node:assert/strict";

import {
  buildEditorialDetailHref,
  buildEditorialFeedModel,
  deriveEditorialItemState,
  filterEditorialItems
} from "../src/lib/domain/editorial-feed.js";

function buildDetail(overrides = {}) {
  return {
    intro: {
      eyebrow: "Update",
      title: "Detail title",
      summary: "Detail summary"
    },
    sections: [
      {
        id: "summary",
        title: "Summary",
        paragraphs: ["Detail summary"]
      }
    ],
    ctaBand: {
      title: "Next step",
      actions: [
        {
          label: "Contact the team",
          routeId: "contact",
          variant: "primary"
        }
      ]
    },
    ...overrides
  };
}

test("past dated events step down from featured emphasis instead of staying pinned as upcoming", () => {
  const feed = {
    index: {},
    categories: [
      { id: "event", label: "Events", description: "Events" },
      { id: "update", label: "Updates", description: "Updates" },
      { id: "opportunity", label: "Opportunities", description: "Opportunities" }
    ],
    items: [
      {
        id: "past-event",
        slug: "past-event",
        title: "Past event",
        summary: "Past event summary",
        eventDate: "2026-04-01",
        routeId: "contact",
        audience: ["community-members"],
        updateType: "event",
        publicationStatus: "published",
        featured: true,
        sortOrder: 2,
        archiveBehavior: "demote-to-feed",
        eventLifecycle: "scheduled",
        detail: buildDetail({
          intro: {
            eyebrow: "Event",
            title: "Past event",
            summary: "Past event summary"
          }
        })
      },
      {
        id: "current-update",
        slug: "current-update",
        title: "Current update",
        summary: "Current update summary",
        routeId: "sessions",
        audience: ["young-people"],
        updateType: "update",
        publicationStatus: "published",
        sortOrder: 1,
        archiveBehavior: "keep-visible",
        updateLifecycle: "current",
        detail: buildDetail({
          intro: {
            eyebrow: "Update",
            title: "Current update",
            summary: "Current update summary"
          }
        })
      }
    ]
  };

  const model = buildEditorialFeedModel(feed, { referenceDate: "2026-05-01" });
  const pastEvent = model.publicItems.find((item) => item.id === "past-event");

  assert.equal(model.featuredItem, null);
  assert.equal(pastEvent.temporalState, "past-event");
  assert.ok(model.feedItems.some((item) => item.id === "past-event"));
});

test("categories stay available even when one filter currently has zero public items", () => {
  const feed = {
    index: {},
    categories: [
      { id: "event", label: "Events", description: "Events" },
      { id: "update", label: "Updates", description: "Updates" },
      { id: "opportunity", label: "Opportunities", description: "Opportunities" }
    ],
    items: [
      {
        id: "opportunity-open",
        slug: "opportunity-open",
        title: "Open opportunity",
        summary: "Opportunity summary",
        routeId: "get-involved",
        audience: ["community-members"],
        updateType: "opportunity",
        publicationStatus: "published",
        sortOrder: 1,
        archiveBehavior: "keep-visible",
        updateLifecycle: "current",
        detail: buildDetail({
          intro: {
            eyebrow: "Opportunity",
            title: "Open opportunity",
            summary: "Opportunity summary"
          },
          ctaBand: {
            title: "Next step",
            actions: [
              {
                label: "See ways to get involved",
                routeId: "get-involved",
                variant: "primary"
              }
            ]
          }
        })
      }
    ]
  };

  const model = buildEditorialFeedModel(feed, { referenceDate: "2026-05-01" });
  const eventCategory = model.categories.find((item) => item.id === "event");

  assert.equal(eventCategory.count, 0);
  assert.equal(eventCategory.hasItems, false);
  assert.equal(filterEditorialItems(model.publicItems, "event").length, 0);
  assert.equal(filterEditorialItems(model.publicItems, "all").length, 1);
});

test("home visibility can exclude a pinned placeholder item while leaving practical public items visible", () => {
  const hiddenHomeItem = deriveEditorialItemState(
    {
      id: "featured-event",
      slug: "featured-event",
      title: "Featured event",
      summary: "Featured event summary",
      dateLabel: "Dates to be confirmed",
      routeId: "contact",
      audience: ["community-members"],
      updateType: "event",
      publicationStatus: "published",
      featured: true,
      showOnHome: false,
      sortOrder: 1,
      archiveBehavior: "demote-to-feed",
      eventLifecycle: "date-to-be-confirmed",
      detail: buildDetail({
        intro: {
          eyebrow: "Event",
          title: "Featured event",
          summary: "Featured event summary"
        }
      })
    },
    { referenceDate: "2026-05-01" }
  );

  const visibleHomeItem = deriveEditorialItemState(
    {
      id: "live-update",
      slug: "live-update",
      title: "Live update",
      summary: "Live update summary",
      routeId: "sessions",
      audience: ["young-people"],
      updateType: "update",
      publicationStatus: "published",
      sortOrder: 2,
      archiveBehavior: "keep-visible",
      updateLifecycle: "current",
      detail: buildDetail({
        intro: {
          eyebrow: "Update",
          title: "Live update",
          summary: "Live update summary"
        },
        ctaBand: {
          title: "Next step",
          actions: [
            {
              label: "Join a session",
              routeId: "sessions",
              variant: "primary"
            }
          ]
        }
      })
    },
    { referenceDate: "2026-05-01" }
  );

  assert.equal(hiddenHomeItem.homeVisible, false);
  assert.equal(visibleHomeItem.homeVisible, true);
});

test("detail routes stay available for archived or closed editorial items without keeping them current in the feed", () => {
  const archivedUpdate = deriveEditorialItemState(
    {
      id: "archived-update",
      slug: "archived-update",
      title: "Archived update",
      summary: "Archived update summary",
      routeId: "contact",
      actionLabel: "Contact the team",
      audience: ["community-members"],
      updateType: "update",
      publicationStatus: "archived",
      sortOrder: 4,
      updateLifecycle: "superseded",
      archiveBehavior: "keep-visible",
      detail: {
        intro: {
          eyebrow: "Update",
          title: "Archived update",
          summary: "Archived update summary"
        },
        sections: [
          {
            id: "summary",
            title: "Summary",
            paragraphs: ["Archived update summary"]
          }
        ],
        ctaBand: {
          title: "Next step",
          actions: [
            {
              label: "Contact the team",
              routeId: "contact",
              variant: "primary"
            }
          ]
        }
      }
    },
    { referenceDate: "2026-05-01" }
  );

  const closedOpportunity = deriveEditorialItemState(
    {
      id: "closed-opportunity",
      slug: "closed-opportunity",
      title: "Closed opportunity",
      summary: "Closed opportunity summary",
      routeId: "get-involved",
      actionLabel: "See ways to get involved",
      audience: ["community-members"],
      updateType: "opportunity",
      publicationStatus: "published",
      endDate: "2026-04-01",
      sortOrder: 5,
      updateLifecycle: "closed",
      archiveBehavior: "remove",
      detail: {
        intro: {
          eyebrow: "Opportunity",
          title: "Closed opportunity",
          summary: "Closed opportunity summary"
        },
        sections: [
          {
            id: "summary",
            title: "Summary",
            paragraphs: ["Closed opportunity summary"]
          }
        ],
        ctaBand: {
          title: "Next step",
          actions: [
            {
              label: "See ways to get involved",
              routeId: "get-involved",
              variant: "primary"
            }
          ]
        }
      }
    },
    { referenceDate: "2026-05-01" }
  );

  assert.equal(archivedUpdate.detailVisible, true);
  assert.equal(archivedUpdate.indexVisible, false);
  assert.equal(archivedUpdate.temporalState, "archived");
  assert.equal(closedOpportunity.detailVisible, true);
  assert.equal(closedOpportunity.indexVisible, false);
  assert.equal(closedOpportunity.temporalState, "closed");
});

test("detail hrefs are derived from the canonical editorial slug instead of the handoff route", () => {
  assert.equal(
    buildEditorialDetailHref({ slug: "community-events-and-workshops" }),
    "/events-updates/community-events-and-workshops/"
  );
});
