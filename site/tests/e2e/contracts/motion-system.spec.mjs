import { gotoRoute } from "../support/assertions.mjs";
import { expect, test } from "../support/fixtures.mjs";

test("default motion gives route cards useful hover and keyboard focus states without changing links", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/");

  const routeGrid = page.locator(".home-route-grid");
  const actionCard = routeGrid.locator("[data-route-card]").first();

  await routeGrid.scrollIntoViewIfNeeded();
  await expect
    .poll(async () =>
      routeGrid.evaluate((element) =>
        [...element.querySelectorAll("[data-route-card]")].every(
          (card) => card instanceof HTMLElement && card.dataset.inView === "true"
        )
      )
    )
    .toBe(true);

  const hrefBefore = await actionCard.getAttribute("href");
  const gridBoxBefore = await routeGrid.evaluate((element) => ({
    height: element.getBoundingClientRect().height,
    width: element.getBoundingClientRect().width
  }));

  await actionCard.hover();

  const hoverState = await actionCard.evaluate((element) => {
    const styles = getComputedStyle(element);

    return {
      borderColor: styles.borderColor,
      boxShadow: styles.boxShadow,
      transform: styles.transform
    };
  });
  const gridBoxAfterHover = await routeGrid.evaluate((element) => ({
    height: element.getBoundingClientRect().height,
    width: element.getBoundingClientRect().width
  }));

  await actionCard.focus();

  const focusState = await actionCard.evaluate((element) => {
    const styles = getComputedStyle(element);

    return {
      outlineStyle: styles.outlineStyle,
      outlineWidth: styles.outlineWidth
    };
  });

  expect(hrefBefore).toBe("/sessions/");
  await expect(actionCard).toHaveAttribute("href", hrefBefore ?? "");
  expect(hoverState.transform).not.toBe("none");
  expect(hoverState.borderColor).not.toBe("rgba(0, 0, 0, 0)");
  expect(hoverState.boxShadow).not.toBe("none");
  expect(focusState.outlineStyle).not.toBe("none");
  expect(focusState.outlineWidth).not.toBe("0px");
  expect(Math.abs(gridBoxAfterHover.height - gridBoxBefore.height)).toBeLessThanOrEqual(
    1
  );
  expect(Math.abs(gridBoxAfterHover.width - gridBoxBefore.width)).toBeLessThanOrEqual(1);

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
  await expect(toggle).toHaveText("Menu");
  await toggle.click();
  await expect(header).toHaveAttribute("data-nav-state", "open");
  await expect(toggle).toHaveAttribute("data-toggle-state", "open");
  await expect(toggle).toHaveText("Close");
  await expect(page.locator("[data-nav-panel]")).toBeVisible();

  await toggle.click();
  await expect.poll(async () => header.getAttribute("data-nav-state")).toBe("closed");
  await expect(toggle).toHaveAttribute("data-toggle-state", "closed");
  await expect(toggle).toHaveText("Menu");

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

  const accordionItem = page.locator("[data-disclosure-item]").nth(1);
  await page.locator("[data-disclosure-item] summary").nth(1).click();
  await expect(accordionItem).toHaveAttribute("data-disclosure-state", "expanded");

  await gotoRoute(page, "/");

  const actionCard = page.locator("[data-route-card]").first();

  await actionCard.hover();
  const reducedTransform = await actionCard.evaluate(
    (element) => getComputedStyle(element).transform
  );

  expect(["none", "matrix(1, 0, 0, 1, 0, 0)"]).toContain(reducedTransform);

  void pageIssues;
});
