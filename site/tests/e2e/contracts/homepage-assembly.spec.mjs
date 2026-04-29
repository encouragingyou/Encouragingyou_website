import {
  assertNoHorizontalOverflow,
  assertShellLandmarks,
  gotoRoute
} from "../support/assertions.mjs";
import { expect, test } from "../support/fixtures.mjs";

const oldHomepageSectionIds = [
  "quick-actions",
  "trust-strip",
  "live-sessions",
  "programme-teasers",
  "about-teaser",
  "community-support",
  "updates-surface",
  "involvement-cta",
  "faq-cluster",
  "contact-panel"
];

test("homepage presents the compact route hub and short intro", async ({
  page,
  pageIssues,
  request
}) => {
  await gotoRoute(page, "/");

  const main = page.locator("main");
  const routeHub = main.locator('[data-home-section="route-hub"]');

  const mainHeading = main.locator("h1");

  await expect(mainHeading).toHaveCount(1);
  await expect(mainHeading).toHaveText(
    "Helping young people in Rochdale build confidence, friendships and future opportunities."
  );
  await assertShellLandmarks(page);
  await expect(routeHub).toBeVisible();
  await expect(main.locator("[data-home-section]")).toHaveCount(2);
  await expect(routeHub.getByRole("heading", { name: "Who it is for" })).toBeVisible();
  await expect(routeHub.getByRole("heading", { name: "What happens" })).toBeVisible();
  await expect(routeHub.getByRole("heading", { name: "Why it matters" })).toBeVisible();

  await expect(routeHub).toContainText("Young people in Rochdale");
  await expect(routeHub).toContainText("Youth club, CV and application help");
  await expect(routeHub).toContainText(
    "We help young people speak up, make friends, and feel more confident in real-life situations."
  );
  await expect(routeHub).not.toContainText(/\b\d+\s*(?:-|to)\s*\d+\b/u);

  for (const [name, href] of [
    ["Join a session", "/sessions/"],
    ["Get CV help", "/programmes/career-support-cv-help/"],
    ["Visit youth club", "/sessions/youth-club/"],
    ["Programmes", "/programmes/"],
    ["About", "/about/"],
    ["Get involved", "/get-involved/"],
    ["Ask a question", "/contact/"],
    ["Safeguarding", "/safeguarding/"]
  ]) {
    const cardHeading = routeHub.getByRole("heading", { name, exact: true });
    const cardLink = cardHeading.locator("xpath=ancestor::a[1]");

    await expect(cardHeading).toHaveCount(1);
    await expect(cardLink).toHaveAttribute("href", href);

    const response = await request.get(href);

    expect(response.ok(), `Expected route hub link ${href} to load`).toBeTruthy();
  }

  for (const sectionId of oldHomepageSectionIds) {
    await expect(main.locator(`[data-home-section="${sectionId}"]`)).toHaveCount(0);
  }
  await assertNoHorizontalOverflow(page);

  void pageIssues;
});

test("homepage keeps reassurance links without full forms or feed surfaces", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/");

  const reassurance = page.locator('[data-home-section="home-reassurance"]');

  await expect(reassurance).toBeVisible();
  await expect(reassurance.getByRole("link", { name: "Ask a question" })).toHaveAttribute(
    "href",
    "/contact/"
  );
  await expect(
    reassurance.getByRole("link", { name: "Safeguarding information" })
  ).toHaveAttribute("href", "/safeguarding/");
  await expect(page.getByRole("button", { name: "Send message" })).toHaveCount(0);
  await expect(page.locator('[data-home-section="updates-surface"]')).toHaveCount(0);
  await assertNoHorizontalOverflow(page);

  void pageIssues;
});
