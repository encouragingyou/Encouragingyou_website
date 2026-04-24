import { gotoRoute } from "../support/assertions.mjs";
import { expect, test } from "../support/fixtures.mjs";

test("default motion gives interactive cards a subtle hover lift", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/system/components/");

  const actionCard = page
    .locator('[data-component-preview-section="cards"] .action-card')
    .first();

  await actionCard.hover();

  const transform = await actionCard.evaluate(
    (element) => getComputedStyle(element).transform
  );

  expect(transform).not.toBe("none");

  void pageIssues;
});

test("mobile navigation and sticky header expose structural state changes", async ({
  page,
  pageIssues
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoRoute(page, "/");

  const header = page.locator("[data-nav-shell]");
  const toggle = page.locator("[data-nav-toggle]");

  await expect(header).toHaveAttribute("data-header-scrolled", "false");
  await page.evaluate(() => window.scrollTo(0, 260));
  await expect(header).toHaveAttribute("data-header-scrolled", "true");

  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(header).toHaveAttribute("data-nav-state", "open");
  await expect(page.locator("[data-nav-panel]")).toBeVisible();

  await toggle.click();
  await expect.poll(async () => header.getAttribute("data-nav-state")).toBe("closed");

  void pageIssues;
});

test("reduced motion keeps reveal content visible and removes hover translation", async ({
  page,
  pageIssues
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await gotoRoute(page, "/system/components/");

  await expect
    .poll(async () =>
      page.evaluate(() => ({
        motion: document.documentElement.dataset.motion,
        motionReady: document.documentElement.dataset.motionReady
      }))
    )
    .toEqual({
      motion: "reduced",
      motionReady: "true"
    });

  const firstRevealState = await page.evaluate(() => {
    const target = document.querySelector('[data-motion~="reveal"]');

    if (!(target instanceof HTMLElement)) {
      return null;
    }

    const styles = getComputedStyle(target);

    return {
      inView: target.dataset.inView ?? null,
      opacity: styles.opacity,
      transform: styles.transform
    };
  });

  expect(firstRevealState).not.toBeNull();
  expect(Number(firstRevealState.opacity)).toBeGreaterThanOrEqual(0.99);
  expect(firstRevealState.transform).toBe("none");
  expect(firstRevealState.inView).toBe("true");

  const actionCard = page
    .locator('[data-component-preview-section="cards"] .action-card')
    .first();

  await actionCard.hover();
  const reducedTransform = await actionCard.evaluate(
    (element) => getComputedStyle(element).transform
  );

  expect(["none", "matrix(1, 0, 0, 1, 0, 0)"]).toContain(reducedTransform);

  const accordionItem = page.locator("[data-disclosure-item]").nth(1);
  await page.locator("[data-disclosure-item] summary").nth(1).click();
  await expect(accordionItem).toHaveAttribute("data-disclosure-state", "expanded");

  void pageIssues;
});
