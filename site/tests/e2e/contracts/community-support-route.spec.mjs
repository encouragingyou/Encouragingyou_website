import { assertNoHorizontalOverflow, gotoRoute } from "../support/assertions.mjs";
import { expect, test } from "../support/fixtures.mjs";

test("community support detail route broadens the welcome without pretending it is a live events portal or care service", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/programmes/community-support-intergenerational-connection/");
  await assertNoHorizontalOverflow(page);

  const main = page.locator("main");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Bringing people together across generations through support and connection."
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
  await expect(main.getByText("Start with a short support conversation")).toBeVisible();
  await expect(main.getByText("What this route is not")).toBeVisible();
  await expect(
    main.getByText("Different visitors need different next steps.")
  ).toBeVisible();
  await expect(main.locator(".session-card")).toHaveCount(0);
  await expect(main.locator(".faq-item").first()).toBeVisible();
  await expect(main.getByText("Public-proof boundary", { exact: true })).toBeVisible();
  await expect(
    main.getByRole("link", { name: "Contact the team", exact: true }).first()
  ).toBeVisible();
  await expect(
    main.getByRole("link", { name: "See current sessions" }).first()
  ).toBeVisible();
  await expect(main.getByRole("link", { name: "Get involved" }).first()).toBeVisible();
  await expect(main.getByRole("link", { name: "See safeguarding" })).toBeVisible();

  void pageIssues;
});

test("community support route hands off cleanly to contact and get involved while keeping support and supporter paths distinct", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/programmes/community-support-intergenerational-connection/");

  const main = page.locator("main");

  await main.getByRole("link", { name: "Contact the team", exact: true }).first().click();
  await expect(page).toHaveURL(/\/contact\/$/u);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "We're here to help you find the right next step."
  );

  await gotoRoute(page, "/programmes/community-support-intergenerational-connection/");
  await main.getByRole("link", { name: "Get involved" }).first().click();
  await expect(page).toHaveURL(/\/get-involved\/$/u);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Get involved in a way that works for you."
  );

  void pageIssues;
});

test.describe("no-js community support route", () => {
  test.use({ javaScriptEnabled: false });

  test("critical content and audience-routing actions stay reachable without client scripting", async ({
    page,
    pageIssues
  }) => {
    await gotoRoute(page, "/programmes/community-support-intergenerational-connection/");

    const main = page.locator("main");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Bringing people together across generations through support and connection."
      })
    ).toBeVisible();
    await expect(main.locator(".faq-item").first()).toBeVisible();
    await expect(
      main.getByRole("link", { name: "Contact the team", exact: true }).first()
    ).toBeVisible();
    await expect(
      main.getByRole("link", { name: "See current sessions" }).first()
    ).toBeVisible();
    await expect(main.getByRole("link", { name: "Get involved" }).first()).toBeVisible();

    void pageIssues;
  });
});
