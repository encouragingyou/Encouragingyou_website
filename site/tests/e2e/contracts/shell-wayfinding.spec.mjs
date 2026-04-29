import { assertVisibleFocusRing, gotoRoute } from "../support/assertions.mjs";
import { expect, test } from "../support/fixtures.mjs";

const expectedPrimaryNav = [
  ["Sessions", "/sessions/"],
  ["CV help", "/programmes/career-support-cv-help/"],
  ["Youth club", "/sessions/youth-club/"],
  ["Programmes", "/programmes/"],
  ["About", "/about/"],
  ["Get involved", "/get-involved/"],
  ["Contact", "/contact/"],
  ["Safeguarding", "/safeguarding/"]
];

const internalHrefPattern = /^(?!mailto:|tel:|https?:\/\/|#).+/u;

async function collectInternalShellAndHomeHrefs(page) {
  return page.evaluate((patternSource) => {
    const internalPattern = new RegExp(patternSource, "u");
    const selectors = [
      "header a[href]",
      "footer a[href]",
      '[data-home-section="route-hub"] a[href]'
    ];
    const hrefs = selectors.flatMap((selector) =>
      Array.from(
        document.querySelectorAll(selector),
        (link) => link.getAttribute("href") ?? ""
      )
    );

    return Array.from(
      new Set(
        hrefs
          .filter((href) => internalPattern.test(href))
          .map((href) => {
            const [path] = href.split("#");

            return path.endsWith("/") || path === "/" ? path : `${path}/`;
          })
      )
    ).sort();
  }, internalHrefPattern.source);
}

test("primary navigation uses concise multi-page labels and checked routes", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/");

  const primaryLinks = page
    .getByRole("navigation", { name: "Primary" })
    .locator(".site-nav__link");

  await expect(primaryLinks).toHaveCount(expectedPrimaryNav.length);

  for (const [index, [label, href]] of expectedPrimaryNav.entries()) {
    await expect(primaryLinks.nth(index)).toHaveText(label);
    await expect(primaryLinks.nth(index)).toHaveAttribute("href", href);
  }

  void pageIssues;
});

test("header, footer, and homepage route-card links resolve locally", async ({
  page,
  request,
  pageIssues
}) => {
  await gotoRoute(page, "/");

  const internalHrefs = await collectInternalShellAndHomeHrefs(page);

  expect(internalHrefs).toEqual([
    "/",
    "/about/",
    "/accessibility/",
    "/contact/",
    "/cookies/",
    "/events-updates/",
    "/get-involved/",
    "/partner/",
    "/privacy/",
    "/programmes/",
    "/programmes/career-support-cv-help/",
    "/safeguarding/",
    "/sessions/",
    "/sessions/youth-club/",
    "/terms/",
    "/volunteer/"
  ]);
  expect(internalHrefs.some((href) => href.includes("#"))).toBeFalsy();

  for (const href of internalHrefs) {
    const response = await request.get(href);

    expect(response.ok(), `Expected ${href} to resolve`).toBeTruthy();
  }

  void pageIssues;
});

test("session detail pages expose back-link, breadcrumb trail, and route context", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/sessions/cv-support/");

  await expect(page.getByRole("link", { name: "Back to Sessions" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toContainText(
    "Home"
  );
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toContainText(
    "Sessions"
  );
  await expect(
    page
      .locator("main")
      .getByText(/Based in Rochdale\. Exact venue details are shared on enquiry\./u)
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Get support" }).first()).toBeVisible();

  void pageIssues;
});

test("get involved pages switch the shell CTA and keep utility trust links visible", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/get-involved/");

  await expect(
    page.getByRole("link", { name: "Contact the team" }).first()
  ).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Utility" })).toContainText(
    "Privacy Notice"
  );
  await expect(page.getByRole("navigation", { name: "Utility" })).toContainText(
    "Safeguarding"
  );

  void pageIssues;
});

test("volunteer route derives breadcrumb context from the get involved parent", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/volunteer/");

  await expect(
    page.locator(".shell-wayfinding").getByRole("link", { name: "Back to Get Involved" })
  ).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toContainText(
    "Get Involved"
  );
  await expect(
    page.getByRole("navigation", { name: "Breadcrumb" }).getByText("Volunteer With Us")
  ).toBeVisible();

  void pageIssues;
});

test("partner route also derives breadcrumb context from the get involved parent", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/partner/");

  await expect(
    page.locator(".shell-wayfinding").getByRole("link", { name: "Back to Get Involved" })
  ).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toContainText(
    "Get Involved"
  );
  await expect(
    page.getByRole("navigation", { name: "Breadcrumb" }).getByText("Partner With Us")
  ).toBeVisible();

  void pageIssues;
});

test("safeguarding route upgrades the header CTA to the concern action", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/safeguarding/");

  await expect(
    page.getByRole("link", { name: "Raise a concern" }).first()
  ).toHaveAttribute("href", /\/safeguarding\/#safeguarding-concern$/u);

  void pageIssues;
});

test("child safeguarding derives breadcrumb context from the safeguarding hub", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/safeguarding/child/");

  await expect(
    page.locator(".shell-wayfinding").getByRole("link", { name: "Back to Safeguarding" })
  ).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toContainText(
    "Safeguarding"
  );
  await expect(
    page.getByRole("navigation", { name: "Breadcrumb" }).getByText("Child Safeguarding")
  ).toBeVisible();

  void pageIssues;
});

test("nested routes keep the correct primary-nav current state", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/programmes/career-support-cv-help/");

  await expect(
    page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "CV help" })
  ).toHaveAttribute("aria-current", "page");
  await expect(
    page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "Programmes" })
  ).not.toHaveAttribute("aria-current", "page");

  await gotoRoute(page, "/sessions/youth-club/");

  await expect(
    page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "Youth club" })
  ).toHaveAttribute("aria-current", "page");
  await expect(
    page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "Sessions" })
  ).not.toHaveAttribute("aria-current", "page");

  await gotoRoute(page, "/sessions/cv-support/");

  await expect(
    page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "Sessions" })
  ).toHaveAttribute("aria-current", "page");

  await gotoRoute(page, "/volunteer/");

  await expect(
    page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "Get involved" })
  ).toHaveAttribute("aria-current", "page");

  await gotoRoute(page, "/partner/");

  await expect(
    page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "Get involved" })
  ).toHaveAttribute("aria-current", "page");

  void pageIssues;
});

test.describe("mobile shell focus", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("focus stays visible and returns to the toggle when the mobile nav closes", async ({
    page,
    pageIssues
  }) => {
    await gotoRoute(page, "/about/");

    await page.keyboard.press("Tab");
    const skipLink = page.getByRole("link", { name: "Skip to content" });

    await assertVisibleFocusRing(skipLink);

    const toggle = page.locator("[data-nav-toggle]");

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");

    await page.keyboard.press("Tab");
    const firstNavLink = page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link")
      .first();

    await assertVisibleFocusRing(firstNavLink);
    await expect(firstNavLink).toHaveText("Sessions");
    await page.keyboard.press("Escape");
    await expect(toggle).toBeFocused();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");

    void pageIssues;
  });
});

test.describe("no-js shell", () => {
  test.use({ javaScriptEnabled: false });

  test("primary navigation stays visible without client scripting", async ({
    page,
    pageIssues
  }) => {
    await gotoRoute(page, "/about/");

    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
    await expect(page.getByRole("link", { name: "About" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Sessions" }).first()).toBeVisible();
    await expect(page.locator("[data-nav-panel]")).toBeVisible();

    void pageIssues;
  });
});
