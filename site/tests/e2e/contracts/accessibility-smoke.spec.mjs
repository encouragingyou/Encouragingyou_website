import {
  assertClearOfStickyHeader,
  assertCurrentUrlHash,
  assertElementVisibleWithinViewport,
  assertNoHorizontalOverflow,
  gotoRoute
} from "../support/assertions.mjs";
import { expect, test } from "../support/fixtures.mjs";

test("skip link is keyboard reachable and jumps to the main landmark", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/");
  await page.keyboard.press("Tab");

  const skipLink = page.getByRole("link", { name: "Skip to content" });

  await expect(skipLink).toBeFocused();
  await skipLink.press("Enter");
  await assertCurrentUrlHash(page, "#main");

  void pageIssues;
});

test("skip link tray stays unclipped and reaches the footer landmark cleanly", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/");
  await page.keyboard.press("Tab");

  const skipLinks = page.locator(".skip-links .skip-link");
  const viewport = page.viewportSize();
  const boxes = await skipLinks.evaluateAll((elements) =>
    elements.map((element) => {
      const { top, right, bottom, left } = element.getBoundingClientRect();

      return { top, right, bottom, left };
    })
  );

  expect(boxes).toHaveLength(3);

  for (let index = 1; index < boxes.length; index += 1) {
    expect(boxes[index].top).toBeGreaterThanOrEqual(boxes[index - 1].bottom - 1);
  }

  expect(Math.min(...boxes.map((box) => box.left))).toBeGreaterThanOrEqual(0);

  if (viewport) {
    expect(Math.max(...boxes.map((box) => box.right))).toBeLessThanOrEqual(
      viewport.width + 1
    );
  }

  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");

  const footerSkipLink = page.getByRole("link", { name: "Skip to footer" });
  const footer = page.getByRole("contentinfo");

  await expect(footerSkipLink).toBeFocused();
  await footerSkipLink.press("Enter");
  await assertCurrentUrlHash(page, "#site-footer");
  await expect(footer).toBeInViewport();
  await assertClearOfStickyHeader(page, footer);

  void pageIssues;
});

test("skip to primary navigation keeps the desktop nav target visible", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/about/");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");

  const primaryNavSkipLink = page.getByRole("link", {
    name: "Skip to primary navigation"
  });

  await expect(primaryNavSkipLink).toBeFocused();
  await primaryNavSkipLink.press("Enter");
  await assertCurrentUrlHash(page, "#primary-navigation");
  await assertElementVisibleWithinViewport(
    page,
    page.getByRole("navigation", { name: "Primary" })
  );

  void pageIssues;
});

test("FAQ disclosures can be opened from the keyboard", async ({ page, pageIssues }) => {
  await gotoRoute(page, "/");
  const firstDisclosure = page.locator(".faq-item").first();
  const firstSummary = firstDisclosure.locator("summary");

  await firstSummary.focus();
  await page.keyboard.press("Enter");
  await expect(firstDisclosure).toHaveAttribute("open", "");

  void pageIssues;
});

test("reduced motion mode still exposes the core homepage content", async ({
  page,
  pageIssues
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await gotoRoute(page, "/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(
    page.locator("main").getByRole("link", { name: "Get support", exact: true })
  ).toBeVisible();

  const scrollBehavior = await page.evaluate(
    () => getComputedStyle(document.documentElement).scrollBehavior
  );

  expect(scrollBehavior).toBe("auto");

  void pageIssues;
});

test.describe("mobile skip links", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("skip to primary navigation opens the mobile menu and focuses the first nav link", async ({
    page,
    pageIssues
  }) => {
    await gotoRoute(page, "/about/");
    await page.keyboard.press("Tab");

    const skipLinks = page.locator(".skip-links .skip-link");
    const viewport = page.viewportSize();
    const boxes = await skipLinks.evaluateAll((elements) =>
      elements.map((element) => {
        const { left, right } = element.getBoundingClientRect();

        return { left, right };
      })
    );

    if (viewport) {
      expect(Math.min(...boxes.map((box) => box.left))).toBeGreaterThanOrEqual(0);
      expect(Math.max(...boxes.map((box) => box.right))).toBeLessThanOrEqual(
        viewport.width + 1
      );
    }

    await page.keyboard.press("Tab");

    const primaryNavSkipLink = page.getByRole("link", {
      name: "Skip to primary navigation"
    });
    const menuToggle = page.locator("[data-nav-toggle]");

    await expect(primaryNavSkipLink).toBeFocused();
    await primaryNavSkipLink.press("Enter");
    await expect(menuToggle).toHaveAttribute("aria-expanded", "true");

    const firstNavLink = page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link")
      .first();

    await expect(firstNavLink).toBeFocused();
    await assertCurrentUrlHash(page, "#primary-navigation");
    await assertElementVisibleWithinViewport(page, firstNavLink);
    await assertNoHorizontalOverflow(page);

    void pageIssues;
  });
});
