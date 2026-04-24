import { gotoRoute } from "../support/assertions.mjs";
import { expect, test } from "../support/fixtures.mjs";

test("get involved hub separates live, route-ready, and contact-led pathways", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/get-involved/");

  const main = page.locator("main");
  const featuredPathway = main.locator(".involvement-pathway-card--featured");

  await expect(
    main.getByRole("heading", {
      level: 1,
      name: "Get involved in a way that works for you."
    })
  ).toBeVisible();
  await expect(
    featuredPathway.getByRole("heading", { name: "Join a session" })
  ).toBeVisible();
  await expect(featuredPathway.getByText("2 live Saturday sessions")).toBeVisible();
  await expect(main.getByRole("heading", { name: "Volunteer with us" })).toBeVisible();
  await expect(main.getByRole("heading", { name: "Partner with us" })).toBeVisible();
  await expect(
    main.getByRole("heading", { name: "Refer someone", exact: true })
  ).toBeVisible();
  await expect(
    main.getByRole("heading", { name: "Support in another practical way" })
  ).toBeVisible();
  await expect(main.getByText("Current opportunities and support needed")).toBeVisible();
  await expect(main.getByRole("link", { name: "Browse live sessions" })).toBeVisible();
  await expect(
    main.getByRole("link", { name: "See volunteer with us" }).first()
  ).toBeVisible();
  await expect(main.getByRole("link", { name: "See partner with us" })).toBeVisible();
  await expect(main.getByRole("button", { name: "Send message" })).toBeVisible();

  void pageIssues;
});

test("get involved hub hands off into volunteer, dedicated partner, and editorial opportunity routes", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/get-involved/");

  const main = page.locator("main");

  await main.getByRole("link", { name: "See volunteer with us" }).first().click();
  await expect(page).toHaveURL(/\/volunteer\/$/u);

  await gotoRoute(page, "/get-involved/");
  await main.getByRole("link", { name: "See partner with us" }).click();
  await expect(page).toHaveURL(/\/partner\/$/u);

  await gotoRoute(page, "/get-involved/");
  await main
    .locator(".involvement-spotlight")
    .getByRole("link", { name: "Read opportunity" })
    .click();
  await expect(page).toHaveURL(
    /\/events-updates\/volunteer-partner-or-refer-someone\/$/u
  );

  void pageIssues;
});
