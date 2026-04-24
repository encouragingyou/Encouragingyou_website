import { expect } from "./fixtures.mjs";

export async function gotoRoute(page, path) {
  const response = await page.goto(path, { waitUntil: "networkidle" });

  expect(response?.ok(), `Expected ${path} to load successfully`).toBeTruthy();
}

export async function assertSingleH1(page, expectedHeading) {
  const h1 = page.locator("h1");

  await expect(h1).toHaveCount(1);

  if (expectedHeading) {
    await expect(h1).toHaveText(expectedHeading);
  }
}

export async function assertShellLandmarks(page) {
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
  await expect(page.locator("main")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeAttached();
}

export async function assertLandmarkOrder(page) {
  const order = await page.evaluate(() =>
    ["header", "main", "footer"].map((selector) => {
      const element = document.querySelector(selector);

      return element
        ? Array.from(document.body.children).findIndex((child) => child === element)
        : -1;
    })
  );

  expect(order[0], "Expected header to be present in body order").toBeGreaterThanOrEqual(
    0
  );
  expect(order[1], "Expected main to be present in body order").toBeGreaterThan(order[0]);
  expect(order[2], "Expected footer to be present in body order").toBeGreaterThan(
    order[1]
  );
}

export async function assertNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => {
    const html = document.documentElement;
    const body = document.body;

    return Math.max(
      html.scrollWidth - html.clientWidth,
      body.scrollWidth - body.clientWidth
    );
  });

  expect(
    overflow,
    "Expected page layout to avoid horizontal overflow"
  ).toBeLessThanOrEqual(1);
}

export async function assertCurrentUrlHash(page, hash) {
  await expect
    .poll(async () => new URL(page.url()).hash, {
      message: `Expected URL hash to be ${hash}`
    })
    .toBe(hash);
}

export async function assertImageLoaded(locator) {
  await expect(locator).toBeVisible();

  await expect
    .poll(async () =>
      locator.evaluate(
        (image) => image.complete && image.naturalWidth > 0 && image.naturalHeight > 0
      )
    )
    .toBe(true);
}

export async function assertVisibleFocusRing(locator) {
  await expect(locator).toBeFocused();

  const styles = await locator.evaluate((element) => {
    const computed = getComputedStyle(element);

    return {
      boxShadow: computed.boxShadow,
      outlineStyle: computed.outlineStyle,
      outlineWidth: computed.outlineWidth
    };
  });

  expect(
    styles.outlineStyle !== "none" || styles.boxShadow !== "none",
    "Expected a visible focus indicator"
  ).toBeTruthy();
  expect(
    styles.outlineWidth === "0px" && styles.boxShadow === "none",
    "Expected focus indicator width or shadow to be present"
  ).toBeFalsy();
}

export async function assertCalendarFile(request, href) {
  const response = await request.get(href);

  expect(response.ok(), `Expected ${href} to be reachable`).toBeTruthy();
  expect(response.headers()["content-type"] ?? "").toContain("text/calendar");
  expect(await response.text()).toContain("BEGIN:VCALENDAR");
}

export async function openPrimaryNavIfNeeded(page) {
  const menuToggle = page.locator("[data-nav-toggle]");

  if ((await menuToggle.count()) === 0) {
    return;
  }

  const toggle = menuToggle.first();
  const isHidden = await toggle.evaluate((element) => element.hidden);

  if (isHidden) {
    return;
  }

  const expanded = await toggle.getAttribute("aria-expanded");

  if (expanded !== "true") {
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
  }
}

export async function assertElementVisibleWithinViewport(page, locator) {
  await expect(locator).toBeVisible();

  const box = await locator.boundingBox();
  const viewport = page.viewportSize();

  expect(box, "Expected target element to have a bounding box").not.toBeNull();
  expect(viewport, "Expected page viewport size to be available").not.toBeNull();

  if (!box || !viewport) {
    return;
  }

  expect(
    box.y,
    "Expected target element to start within the viewport"
  ).toBeGreaterThanOrEqual(0);
  expect(
    box.y + Math.min(box.height, viewport.height),
    "Expected target element to remain meaningfully inside the viewport"
  ).toBeLessThanOrEqual(viewport.height + 8);
}

export async function assertClearOfStickyHeader(page, locator) {
  await expect(locator).toBeVisible();

  const [headerBox, targetBox] = await Promise.all([
    page.getByRole("banner").boundingBox(),
    locator.boundingBox()
  ]);

  expect(headerBox, "Expected header bounding box").not.toBeNull();
  expect(targetBox, "Expected target bounding box").not.toBeNull();

  if (!headerBox || !targetBox) {
    return;
  }

  expect(
    targetBox.y,
    "Expected target content to remain below the sticky header"
  ).toBeGreaterThanOrEqual(headerBox.y + headerBox.height - 4);
}

export async function assertVerticalOrder(locators) {
  const boxes = [];

  for (const locator of locators) {
    await expect(locator).toBeVisible();
    boxes.push(await locator.boundingBox());
  }

  const filtered = boxes.filter(Boolean);

  expect(filtered.length, "Expected all target elements to have bounding boxes").toBe(
    locators.length
  );

  for (let index = 1; index < filtered.length; index += 1) {
    expect(
      filtered[index].y,
      "Expected later content to appear below earlier content"
    ).toBeGreaterThanOrEqual(filtered[index - 1].y);
  }
}
