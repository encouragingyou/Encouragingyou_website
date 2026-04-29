import {
  assertCurrentUrlHash,
  assertLandmarkOrder,
  assertNoHorizontalOverflow,
  assertShellLandmarks,
  assertSingleH1,
  assertVisibleFocusRing,
  gotoRoute
} from "../support/assertions.mjs";
import { expect, test } from "../support/fixtures.mjs";

const legalFooterRoutes = [
  {
    label: "Privacy",
    href: "/privacy/",
    heading: "How this site handles the personal information people share with us."
  },
  {
    label: "Cookies",
    href: "/cookies/",
    heading: "How this site uses cookies and other storage or access technologies."
  },
  {
    label: "Accessibility",
    href: "/accessibility/",
    heading: "How accessibility is handled on the live EncouragingYou website."
  },
  {
    label: "Terms",
    href: "/terms/",
    heading: "How this site works, what to expect from it, and where the boundaries are."
  }
];

test.describe("@trust legal and disclosure governance", () => {
  test("footer legal links stay discoverable from the homepage", async ({
    page,
    pageIssues
  }) => {
    await gotoRoute(page, "/");

    const footer = page.getByRole("contentinfo");

    for (const route of legalFooterRoutes) {
      await expect(footer.getByRole("link", { name: route.label })).toHaveAttribute(
        "href",
        route.href
      );
    }

    await footer.getByRole("link", { name: "Cookies" }).click();
    await expect(page).toHaveURL(/\/cookies\/$/u);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      legalFooterRoutes[1].heading
    );

    void pageIssues;
  });

  test("legal routes keep a single H1, landmarks, and skip-link entry", async ({
    page,
    pageIssues
  }) => {
    for (const route of legalFooterRoutes) {
      await gotoRoute(page, route.href);
      await assertShellLandmarks(page);
      await assertLandmarkOrder(page);
      await assertSingleH1(page, route.heading);
      await assertNoHorizontalOverflow(page);
    }

    await gotoRoute(page, "/privacy/");
    await page.keyboard.press("Tab");

    const skipLink = page.getByRole("link", { name: "Skip to content" });

    await assertVisibleFocusRing(skipLink);
    await skipLink.press("Enter");
    await assertCurrentUrlHash(page, "#main");

    void pageIssues;
  });

  test("synthetic imagery surfaces render prominent, compact, and sitewide disclosure variants", async ({
    page,
    pageIssues
  }) => {
    await gotoRoute(page, "/");

    await expect(
      page.locator(".home-hero [data-disclosure-variant='prominent']").first()
    ).toBeVisible();
    await expect(
      page.locator(".site-footer [data-disclosure-variant='sitewide']").first()
    ).toBeVisible();

    await gotoRoute(page, "/programmes/");
    await expect(
      page.locator(".programme-pillar-card [data-disclosure-variant='compact']")
    ).toHaveCount(4);

    await gotoRoute(page, "/about/");
    await expect(
      page.locator(
        "[data-notice-id='ai-illustration'][data-disclosure-variant='prominent']"
      )
    ).toHaveCount(2);
    await expect(page.locator(".proof-boundary")).toBeVisible();

    await gotoRoute(page, "/volunteer/");
    await expect(
      page.locator("[data-notice-id='ai-illustration'][data-disclosure-context='hero']")
    ).toBeVisible();

    await gotoRoute(page, "/events-updates/volunteer-partner-or-refer-someone/");
    await expect(
      page.locator("[data-notice-id='ai-illustration'][data-disclosure-context='detail']")
    ).toBeVisible();

    void pageIssues;
  });

  test("cookie route stays in the audited no-banner state without dialog or consent persistence UI", async ({
    page,
    pageIssues
  }) => {
    await gotoRoute(page, "/cookies/");

    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByRole("button", { name: /accept/i })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /reject/i })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /customi[sz]e/i })).toHaveCount(0);
    await expect(page.getByText(/cookie preferences/i)).toHaveCount(0);

    const persistenceState = await page.evaluate(() => {
      const localStorageKeys = Object.keys(window.localStorage).filter((key) =>
        /(cookie|consent|preference)/iu.test(key)
      );
      const sessionStorageKeys = Object.keys(window.sessionStorage).filter((key) =>
        /(cookie|consent|preference)/iu.test(key)
      );

      return {
        cookieString: document.cookie,
        localStorageKeys,
        sessionStorageKeys
      };
    });

    expect(persistenceState.localStorageKeys).toEqual([]);
    expect(persistenceState.sessionStorageKeys).toEqual([]);
    expect(persistenceState.cookieString).not.toMatch(/(consent|preference)/iu);

    void pageIssues;
  });
});

test.describe("@trust no-js disclosure fallback", () => {
  test.use({ javaScriptEnabled: false });

  test("AI illustration disclosures remain visible without client scripting", async ({
    page,
    pageIssues
  }) => {
    await gotoRoute(page, "/");

    await expect(
      page.locator(".home-hero [data-disclosure-variant='prominent']").first()
    ).toBeVisible();
    await expect(
      page.locator(".site-footer [data-disclosure-variant='sitewide']").first()
    ).toBeVisible();

    void pageIssues;
  });
});
