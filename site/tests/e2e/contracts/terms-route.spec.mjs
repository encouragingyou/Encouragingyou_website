import { assertNoHorizontalOverflow, gotoRoute } from "../support/assertions.mjs";
import { expect, test } from "../support/fixtures.mjs";

test("terms route explains live site boundaries without reverting to placeholder copy", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/terms/");
  await assertNoHorizontalOverflow(page);

  const main = page.locator("main");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "How this site works, what to expect from it, and where the boundaries are."
    })
  ).toBeVisible();
  await expect(main.getByRole("navigation", { name: "On this page" })).toBeVisible();
  await expect(
    main.getByRole("heading", {
      name: "External links and third-party destinations"
    })
  ).toBeVisible();
  await expect(
    main.getByText("No public directions link is live at launch.")
  ).toBeVisible();
  await expect(
    main.getByText(
      "The site does not show a cookie banner at launch because advertising, profiling, and other non-essential tracking are absent."
    )
  ).toBeVisible();
  await expect(
    main.getByText("Calendar downloads are available on the current live session routes.")
  ).toBeVisible();

  void pageIssues;
});
