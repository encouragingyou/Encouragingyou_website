import test from "node:test";
import assert from "node:assert/strict";

import cmsMigrationDiffReport from "../src/data/generated/cms-migration-diff-report.json" with { type: "json" };
import cmsPublicReadModel from "../src/data/generated/cms-public-read-model.json" with { type: "json" };
import cmsSchemaCatalog from "../src/data/generated/cms-schema-catalog.json" with { type: "json" };
import cmsWriteModelSeed from "../src/data/generated/cms-write-model-seed.json" with { type: "json" };
import {
  getHomePageContent,
  getProgrammeBySlug,
  getRoutePageContentById,
  getSeoContent
} from "../src/lib/content/content-source-adapter.ts";

test("CMS read model publishes only the validated baseline collections", () => {
  assert.equal(cmsPublicReadModel.publicReadModelState, "published");
  assert.equal(cmsPublicReadModel.publicationContract.draftVisibility, "forbidden");
  assert.equal(cmsMigrationDiffReport.allCollectionsMatchSource, true);
  assert.ok(cmsPublicReadModel.collections.homePage);
  assert.ok(cmsPublicReadModel.collections.routePages);
  assert.ok(cmsPublicReadModel.collections.programmes);
  assert.ok(cmsPublicReadModel.collections.seo);
});

test("content adapter now reads published CMS collections instead of raw editable files", () => {
  assert.equal(
    getHomePageContent().hero.title,
    cmsPublicReadModel.collections.homePage.hero.title
  );
  assert.equal(
    getRoutePageContentById("about").intro.title,
    cmsPublicReadModel.collections.routePages.pages.find(
      (page) => page.pageId === "about"
    ).intro.title
  );
  assert.equal(
    getProgrammeBySlug("career-support-cv-help").title,
    cmsPublicReadModel.collections.programmes.items.find(
      (programme) => programme.slug === "career-support-cv-help"
    ).title
  );
  assert.equal(
    getSeoContent().pageDirectives.find((directive) => directive.pageId === "home")
      .titleOverride,
    cmsPublicReadModel.collections.seo.pageDirectives.find(
      (directive) => directive.pageId === "home"
    ).titleOverride
  );
});

test("CMS schema catalog and write-model seed stay aligned", () => {
  const surfaceBindingIds = new Set(
    cmsSchemaCatalog.surfaceBindings.map(
      (binding) => `${binding.routeId}:${binding.surfaceId}`
    )
  );

  assert.ok(surfaceBindingIds.has("home:hero-and-quick-actions"));
  assert.ok(surfaceBindingIds.has("privacy:privacy-legal-copy"));
  assert.ok(cmsWriteModelSeed.documents.length > 20);
  assert.equal(
    cmsWriteModelSeed.documents.every(
      (document) =>
        document.currentPublishedRevisionId &&
        document.revisions.some(
          (revision) => revision.revisionId === document.currentPublishedRevisionId
        )
    ),
    true
  );
});
