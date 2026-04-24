import { expect, test } from "../support/fixtures.mjs";
import { gotoRoute } from "../support/assertions.mjs";
import { submitSupportForm } from "../support/forms.mjs";
import { getResilienceSurfaceText } from "../../../src/lib/content/resilience-state.js";
import {
  configureVisualViewport,
  stabilizeVisualPage,
  visualSnapshotOptions
} from "../support/visual.mjs";

const expectedSurface = process.env.PLAYWRIGHT_DEPLOYMENT_SURFACE ?? "shared";

test.skip(
  expectedSurface !== "public",
  "Visual baselines are enforced in the isolated public surface pipeline."
);

test.describe("visual regression baselines", () => {
  test("homepage desktop shell stays visually stable", async ({ page, pageIssues }) => {
    await configureVisualViewport(page, { width: 1536, height: 960 });
    await gotoRoute(page, "/");
    await stabilizeVisualPage(page);
    await expect(page).toHaveScreenshot("home-desktop.png", visualSnapshotOptions);

    void pageIssues;
  });

  test("homepage mobile shell stays visually stable", async ({ page, pageIssues }) => {
    await configureVisualViewport(page, { width: 390, height: 844 });
    await gotoRoute(page, "/");
    await stabilizeVisualPage(page);
    await expect(page).toHaveScreenshot("home-mobile.png", visualSnapshotOptions);

    void pageIssues;
  });

  test("contact validation state stays visually stable", async ({ page, pageIssues }) => {
    await configureVisualViewport(page, { width: 1280, height: 960 });
    await gotoRoute(page, "/contact/");
    await submitSupportForm(page);
    await expect(page.locator("[data-form-status]")).toContainText(
      getResilienceSurfaceText("form-validation-error")
    );
    await stabilizeVisualPage(page);
    await expect(page.locator("[data-support-form]")).toHaveScreenshot(
      "contact-form-validation.png",
      visualSnapshotOptions
    );

    void pageIssues;
  });

  test("cookie notice stays visually stable", async ({ page, pageIssues }) => {
    await configureVisualViewport(page, { width: 1280, height: 960 });
    await gotoRoute(page, "/cookies/");
    await stabilizeVisualPage(page);
    await expect(page.locator("main")).toHaveScreenshot(
      "cookies-page.png",
      visualSnapshotOptions
    );

    void pageIssues;
  });

  test("404 recovery page stays visually stable", async ({ page, pageIssues }) => {
    await configureVisualViewport(page, { width: 1280, height: 960 });

    const response = await page.goto("/this-route-should-not-exist/", {
      waitUntil: "networkidle"
    });

    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "That page is missing, but the main routes into support are still here."
      })
    ).toBeVisible();
    pageIssues.consoleErrors.length = 0;
    pageIssues.pageErrors.length = 0;
    await stabilizeVisualPage(page);
    await expect(page.locator("main")).toHaveScreenshot(
      "not-found-page.png",
      visualSnapshotOptions
    );

    void pageIssues;
  });
});
