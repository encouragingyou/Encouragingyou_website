import { assertNoHorizontalOverflow, gotoRoute } from "../support/assertions.mjs";
import { expect, test } from "../support/fixtures.mjs";

test("events updates route keeps the editorial feed distinct from live sessions while surfacing current public items", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/events-updates/");
  await assertNoHorizontalOverflow(page);

  const main = page.locator("main");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "A calm place for public dates, updates, and current opportunities."
    })
  ).toBeVisible();
  await expect(
    main.getByText("Live support still belongs on Sessions", { exact: true })
  ).toBeVisible();
  await expect(
    main.getByText("Events appear when details are confirmed", { exact: true })
  ).toBeVisible();
  await expect(
    main.getByText("Community event dates will appear here once they are confirmed.", {
      exact: true
    })
  ).toBeVisible();
  await expect(main.getByText("Dates to be confirmed", { exact: true })).toBeVisible();
  await expect(
    main.getByText("Time shared when confirmed", { exact: true })
  ).toBeVisible();
  await expect(main.getByText("Rochdale", { exact: true })).toBeVisible();
  await expect(main.getByRole("link", { name: "View event details" })).toBeVisible();
  await expect(main.getByRole("link", { name: "Read update" })).toBeVisible();
  await expect(main.getByRole("link", { name: "Read opportunity" })).toBeVisible();
  await expect(main.getByRole("link", { name: "Browse live sessions" })).toBeVisible();
  await expect(
    main.getByRole("link", { name: "Explore involvement routes" })
  ).toBeVisible();

  void pageIssues;
});

test("events updates filter controls progressively narrow the visible feed without hiding the route itself", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/events-updates/");

  const main = page.locator("main");
  const feed = main.locator("[data-editorial-feed]");

  await expect(feed).toHaveAttribute("data-editorial-enhanced", "true");

  await main.getByRole("button", { name: /Opportunities/u }).click();

  await expect(
    main.getByText("Volunteer, partner, or refer someone through one clear route.", {
      exact: true
    })
  ).toBeVisible();
  await expect(
    main.getByText("Recurring Saturday support stays on the Sessions route.", {
      exact: true
    })
  ).toBeHidden();
  await expect(
    main.getByText("Community event dates will appear here once they are confirmed.", {
      exact: true
    })
  ).toBeHidden();
  await expect(main.getByText("Showing 1 opportunity.", { exact: true })).toBeVisible();

  await main.getByRole("button", { name: /All items/u }).click();
  await expect(
    main.getByText("Showing all public items.", { exact: true })
  ).toBeVisible();

  void pageIssues;
});

test.describe("no-js events updates route", () => {
  test.use({ javaScriptEnabled: false });

  test("the core feed, pinned item, and live-route handoffs remain readable without filtering enhancement", async ({
    page,
    pageIssues
  }) => {
    await gotoRoute(page, "/events-updates/");

    const main = page.locator("main");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "A calm place for public dates, updates, and current opportunities."
      })
    ).toBeVisible();
    await expect(main.getByRole("link", { name: "View event details" })).toBeVisible();
    await expect(
      main.getByText("Recurring Saturday support stays on the Sessions route.", {
        exact: true
      })
    ).toBeVisible();
    await expect(
      main.getByText("Volunteer, partner, or refer someone through one clear route.", {
        exact: true
      })
    ).toBeVisible();
    await expect(
      main.getByText(
        "Confirmed updates, opportunities, and event notices in one calm feed.",
        {
          exact: true
        }
      )
    ).toBeVisible();

    void pageIssues;
  });
});
