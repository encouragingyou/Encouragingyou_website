import { assertNoHorizontalOverflow, gotoRoute } from "../support/assertions.mjs";
import { expect, test } from "../support/fixtures.mjs";

test("privacy route exposes the real enquiry scope, current system states, and complaint path", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/privacy/");
  await assertNoHorizontalOverflow(page);

  const main = page.locator("main");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "How this site handles the personal information people share with us."
    })
  ).toBeVisible();
  await expect(main.getByRole("navigation", { name: "On this page" })).toBeVisible();
  await expect(main.locator(".privacy-collection-card")).toHaveCount(6);
  await expect(
    main.getByRole("heading", {
      name: "What systems are and are not connected at launch."
    })
  ).toBeVisible();
  await expect(main.getByText("Not connected").first()).toBeVisible();
  await expect(main.getByText("Not running").first()).toBeVisible();
  await expect(main.getByRole("link", { name: "Go to the ICO" })).toBeVisible();
  await expect(
    main.getByText(
      "This notice is tied to the launch build that is live in the repo now."
    )
  ).toBeVisible();
  await expect(
    main.getByText("The fuller production notice will be expanded")
  ).toHaveCount(0);

  void pageIssues;
});
