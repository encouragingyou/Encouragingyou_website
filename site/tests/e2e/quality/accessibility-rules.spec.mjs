import {
  assertCurrentUrlHash,
  assertNoHorizontalOverflow,
  assertVisibleFocusRing,
  gotoRoute
} from "../support/assertions.mjs";
import { expectNoBlockingAxeViolations } from "../support/accessibility.mjs";
import { expect, test } from "../support/fixtures.mjs";

const accessibilitySmokeRoutes = [
  { label: "home", path: "/" },
  { label: "programmes", path: "/programmes/" },
  { label: "contact", path: "/contact/" },
  { label: "get involved", path: "/get-involved/" },
  { label: "child safeguarding", path: "/safeguarding/child/" },
  { label: "cookies", path: "/cookies/" }
];

const promptViewportMatrix = [
  { name: "390x844", size: { width: 390, height: 844 } },
  { name: "768x1024", size: { width: 768, height: 1024 } },
  { name: "1440x900", size: { width: 1440, height: 900 } }
];

const responsiveTrustRoutes = [
  "/",
  "/sessions/",
  "/sessions/youth-club/",
  "/contact/",
  "/safeguarding/"
];

const expectedRouteCards = [
  ["Join a session", "/sessions/"],
  ["Get CV help", "/programmes/career-support-cv-help/"],
  ["Visit youth club", "/sessions/youth-club/"],
  ["Programmes", "/programmes/"],
  ["About", "/about/"],
  ["Get involved", "/get-involved/"],
  ["Ask a question", "/contact/"],
  ["Safeguarding", "/safeguarding/"]
];

async function expectHeadingStructure(page) {
  const headings = await page
    .locator("main :is(h1,h2,h3,h4,h5,h6)")
    .evaluateAll((elements) =>
      elements.map((element) => ({
        level: Number(element.tagName.slice(1)),
        text: element.textContent?.replace(/\s+/gu, " ").trim() ?? ""
      }))
    );

  expect(
    headings.filter((heading) => heading.level === 1),
    "Expected exactly one H1 in main content"
  ).toHaveLength(1);

  const firstH1Index = headings.findIndex((heading) => heading.level === 1);
  let previousLevel = 1;

  for (const heading of headings.slice(firstH1Index + 1)) {
    expect(
      heading.level - previousLevel,
      `Expected heading "${heading.text}" not to skip from h${previousLevel} to h${heading.level}`
    ).toBeLessThanOrEqual(1);
    previousLevel = heading.level;
  }
}

async function expectMinimumTapTarget(locator, label) {
  const boxes = await locator.evaluateAll((elements) =>
    elements.map((element) => {
      const rect = element.getBoundingClientRect();

      return {
        height: rect.height,
        width: rect.width
      };
    })
  );

  expect(boxes.length, `Expected ${label} tap targets to exist`).toBeGreaterThan(0);

  for (const box of boxes) {
    expect(
      box.width,
      `Expected ${label} tap target width to be at least 44px`
    ).toBeGreaterThanOrEqual(44);
    expect(
      box.height,
      `Expected ${label} tap target height to be at least 44px`
    ).toBeGreaterThanOrEqual(44);
  }
}

test.describe("@a11y axe smoke coverage", () => {
  test.describe.configure({ mode: "parallel" });

  for (const route of accessibilitySmokeRoutes) {
    test(`${route.label} has no serious or critical Axe violations`, async ({
      page,
      pageIssues
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await gotoRoute(page, route.path);
      await expectNoBlockingAxeViolations(page);

      void pageIssues;
    });
  }
});

test.describe("@a11y prompt 09 responsive and trust coverage", () => {
  for (const viewport of promptViewportMatrix) {
    test(`key routes keep heading order and avoid overflow at ${viewport.name}`, async ({
      page,
      pageIssues
    }) => {
      await page.setViewportSize(viewport.size);

      for (const path of responsiveTrustRoutes) {
        await gotoRoute(page, path);
        await assertNoHorizontalOverflow(page);
        await expect(page.locator("main h1")).toBeVisible();
        await expectHeadingStructure(page);
      }

      void pageIssues;
    });
  }

  test("skip links still focus their target landmarks", async ({ page, pageIssues }) => {
    await gotoRoute(page, "/");
    await page.keyboard.press("Tab");

    const skipLink = page.getByRole("link", { name: "Skip to content" });

    await assertVisibleFocusRing(skipLink);
    await skipLink.press("Enter");
    await assertCurrentUrlHash(page, "#main");

    await gotoRoute(page, "/");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    const footerSkipLink = page.getByRole("link", { name: "Skip to footer" });

    await assertVisibleFocusRing(footerSkipLink);
    await footerSkipLink.press("Enter");
    await assertCurrentUrlHash(page, "#site-footer");

    void pageIssues;
  });

  test("homepage route cards expose visible-label accessible names and descriptions", async ({
    page,
    pageIssues
  }) => {
    await gotoRoute(page, "/");

    const routeHub = page.locator('[data-home-section="route-hub"]');

    for (const [name, href] of expectedRouteCards) {
      const link = routeHub.getByRole("link", { exact: true, name });

      await expect(link).toHaveAttribute("href", href);
      await expect(link).toHaveAttribute("aria-labelledby", /-title$/u);
      await expect(link).toHaveAttribute("aria-describedby", /-summary$/u);
    }

    await expectMinimumTapTarget(routeHub.locator("[data-route-card]"), "route-card");

    void pageIssues;
  });

  test("privacy and safeguarding links remain visible near high-anxiety routes", async ({
    page,
    pageIssues
  }) => {
    await gotoRoute(page, "/");

    const homeTrust = page.locator('[data-home-section="home-reassurance"]');

    await expect(
      homeTrust.getByRole("link", { exact: true, name: "Privacy notice" })
    ).toHaveAttribute("href", "/privacy/");
    await expect(
      homeTrust.getByRole("link", { exact: true, name: "Safeguarding information" })
    ).toHaveAttribute("href", "/safeguarding/");

    await gotoRoute(page, "/sessions/");
    const sessionsTrust = page.getByRole("navigation", {
      name: "Sessions privacy and safeguarding links"
    });

    await expect(
      sessionsTrust.getByRole("link", { exact: true, name: "Privacy notice" })
    ).toHaveAttribute("href", "/privacy/");
    await expect(
      sessionsTrust.getByRole("link", { exact: true, name: "Safeguarding" })
    ).toHaveAttribute("href", "/safeguarding/");
    await expectMinimumTapTarget(sessionsTrust.getByRole("link"), "sessions trust-link");

    await gotoRoute(page, "/sessions/youth-club/");
    const sessionDetailTrust = page.getByRole("navigation", {
      name: "Session privacy and safeguarding links"
    });

    await expect(
      sessionDetailTrust.getByRole("link", { exact: true, name: "Privacy notice" })
    ).toHaveAttribute("href", "/privacy/");
    await expect(
      sessionDetailTrust.getByRole("link", { exact: true, name: "Safeguarding" })
    ).toHaveAttribute("href", "/safeguarding/");

    await gotoRoute(page, "/contact/");

    await expect(
      page.locator(".support-panel").getByRole("link", {
        exact: true,
        name: "Read the Privacy Notice"
      })
    ).toHaveAttribute("href", "/privacy/");
    await expect(
      page
        .locator("main")
        .getByRole("link", { exact: true, name: "Read safeguarding" })
        .first()
    ).toHaveAttribute("href", "/safeguarding/");

    const footer = page.getByRole("contentinfo");

    await expect(
      footer.getByRole("link", { exact: true, name: "Privacy" })
    ).toHaveAttribute("href", "/privacy/");
    await expect(
      footer.getByRole("link", { exact: true, name: "Safeguarding" })
    ).toHaveAttribute("href", "/safeguarding/");

    void pageIssues;
  });

  test("important safety states carry text, not colour alone", async ({
    page,
    pageIssues
  }) => {
    await gotoRoute(page, "/safeguarding/");

    const urgentNotice = page
      .locator("[data-tone='important']")
      .filter({ hasText: /999|immediate danger/iu })
      .first();

    await expect(urgentNotice).toBeVisible();

    void pageIssues;
  });
});
