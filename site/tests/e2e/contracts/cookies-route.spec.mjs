import { assertNoHorizontalOverflow, gotoRoute } from "../support/assertions.mjs";
import { expect, test } from "../support/fixtures.mjs";

test("cookies route explains the live analytics objection model and audited storage state", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/cookies/");
  await assertNoHorizontalOverflow(page);

  const main = page.locator("main");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "How this site uses cookies and other storage or access technologies."
    })
  ).toBeVisible();
  await expect(main.getByRole("navigation", { name: "On this page" })).toBeVisible();
  await expect(
    main.getByText(
      "The live build does not run advertising, remarketing, or third-party analytics."
    )
  ).toBeVisible();
  await expect(
    main.getByText("Control the live anonymous measurement layer.")
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Turn off anonymous analytics" })
  ).toBeVisible();
  await expect(
    main.getByRole("heading", {
      name: "What the launch build actually does on a visitor's device."
    })
  ).toBeVisible();
  await expect(
    main.getByRole("heading", {
      name: "What is confirmed absent at launch."
    })
  ).toBeVisible();
  await expect(main.locator(".storage-access-card")).toHaveCount(11);
  await expect(page.getByRole("button", { name: /accept/i })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /reject/i })).toHaveCount(0);

  void pageIssues;
});
