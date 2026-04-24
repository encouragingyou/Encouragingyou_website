import { assertNoHorizontalOverflow, gotoRoute } from "../support/assertions.mjs";
import { expect, test } from "../support/fixtures.mjs";

test("career support detail route keeps the broader programme promise distinct from the live CV session", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/programmes/career-support-cv-help/");
  await assertNoHorizontalOverflow(page);

  const main = page.locator("main");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Practical support with CVs, applications, and next steps."
    })
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /Back to Programmes/u })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toContainText(
    "Programmes"
  );
  await expect(
    main.getByText("Launch illustration, not participant photography.", {
      exact: true
    })
  ).toBeVisible();
  await expect(main.getByText("CV support is the live route right now")).toBeVisible();
  await expect(main.getByText("What the session page owns")).toBeVisible();
  await expect(
    main.getByRole("heading", {
      name: "The route should feel useful straight away, not intimidating."
    })
  ).toBeVisible();
  await expect(main.locator(".faq-item").first()).toBeVisible();
  await expect(main.getByText("Public-proof boundary", { exact: true })).toBeVisible();
  await expect(main.getByRole("link", { name: "See CV support" }).first()).toBeVisible();
  await expect(
    main.getByRole("link", { name: "Contact the team", exact: true }).first()
  ).toBeVisible();
  await expect(main.getByRole("link", { name: "Add to calendar" })).toBeVisible();

  void pageIssues;
});

test("career support route hands off cleanly into the live CV support session and keeps contact available as fallback", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/programmes/career-support-cv-help/");

  const main = page.locator("main");

  await expect(
    main.getByText(
      "The CV support session page carries the exact Saturday timing, calendar access, and first-visit detail."
    )
  ).toBeVisible();

  await main.getByRole("link", { name: "See CV support" }).first().click();
  await expect(page).toHaveURL(/\/sessions\/cv-support\/$/u);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "CV support that is practical, calm, and one-to-one."
  );
  await expect(page.getByText("Every Saturday", { exact: true }).first()).toBeVisible();

  await gotoRoute(page, "/programmes/career-support-cv-help/");
  await main.getByRole("link", { name: "Contact the team", exact: true }).first().click();
  await expect(page).toHaveURL(/\/contact\/$/u);

  void pageIssues;
});

test.describe("no-js career support route", () => {
  test.use({ javaScriptEnabled: false });

  test("critical content and both next-step routes stay reachable without client scripting", async ({
    page,
    pageIssues
  }) => {
    await gotoRoute(page, "/programmes/career-support-cv-help/");

    const main = page.locator("main");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Practical support with CVs, applications, and next steps."
      })
    ).toBeVisible();
    await expect(main.locator(".faq-item").first()).toBeVisible();
    await expect(
      main.getByRole("link", { name: "See CV support" }).first()
    ).toBeVisible();
    await expect(
      main.getByRole("link", { name: "Contact the team", exact: true }).first()
    ).toBeVisible();

    void pageIssues;
  });
});
