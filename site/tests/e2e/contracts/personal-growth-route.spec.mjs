import { assertNoHorizontalOverflow, gotoRoute } from "../support/assertions.mjs";
import { expect, test } from "../support/fixtures.mjs";

test("personal growth detail route keeps the enquiry-led path, trust cues, and next-step actions explicit", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/programmes/personal-growth-life-skills/");
  await assertNoHorizontalOverflow(page);

  const main = page.locator("main");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Practise real-life confidence, motivation, and everyday next steps."
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
  await expect(
    main.getByText("Programme live, public timing still intentionally light")
  ).toBeVisible();
  await expect(main.locator(".session-card")).toHaveCount(0);
  await expect(
    main.getByRole("heading", {
      name: "Use a short enquiry to work out the right next step."
    })
  ).toBeVisible();
  await expect(main.getByText("Why contact comes first")).toBeVisible();
  await expect(main.getByText("Need something scheduled today?")).toBeVisible();
  await expect(main.locator(".faq-item").first()).toBeVisible();
  await expect(main.getByText("Public-proof boundary", { exact: true })).toBeVisible();
  await expect(main.getByRole("link", { name: "Ask a question" }).first()).toBeVisible();
  await expect(
    main.getByRole("link", { name: "See current sessions" }).first()
  ).toBeVisible();

  void pageIssues;
});

test("personal growth detail route hands off cleanly to contact without pretending a live schedule exists", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/programmes/personal-growth-life-skills/");

  const main = page.locator("main");

  await expect(
    main.getByText(/does not yet publish a separate recurring timetable/u)
  ).toBeVisible();

  await main.getByRole("link", { name: "Ask a question" }).first().click();
  await expect(page).toHaveURL(/\/contact\/$/u);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "We're here to help you find the right next step."
  );

  void pageIssues;
});

test.describe("no-js personal growth route", () => {
  test.use({ javaScriptEnabled: false });

  test("critical content and enquiry-led actions stay reachable without client scripting", async ({
    page,
    pageIssues
  }) => {
    await gotoRoute(page, "/programmes/personal-growth-life-skills/");

    const main = page.locator("main");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Practise real-life confidence, motivation, and everyday next steps."
      })
    ).toBeVisible();
    await expect(main.locator(".faq-item").first()).toBeVisible();
    await expect(
      main.getByRole("link", { name: "Ask a question" }).first()
    ).toBeVisible();
    await expect(
      main.getByRole("link", { name: "See current sessions" }).first()
    ).toBeVisible();

    void pageIssues;
  });
});
