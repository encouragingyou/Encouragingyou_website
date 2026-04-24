import { assertNoHorizontalOverflow, gotoRoute } from "../support/assertions.mjs";
import { expect, test } from "../support/fixtures.mjs";

test("accessibility route exposes the live statement, known limitations, and dedicated feedback form", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/accessibility/");
  await assertNoHorizontalOverflow(page);

  const main = page.locator("main");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "How accessibility is handled on the live EncouragingYou website."
    })
  ).toBeVisible();
  await expect(main.getByRole("navigation", { name: "On this page" })).toBeVisible();
  await expect(
    main.getByRole("heading", {
      name: "Some boundaries are already known, and they are shown here plainly."
    })
  ).toBeVisible();
  await expect(main.getByText("No independent audit published yet")).toBeVisible();
  await expect(
    main.getByRole("button", { name: "Send accessibility feedback" })
  ).toBeVisible();
  await expect(
    main.getByLabel("I would like occasional updates about future sessions and events.")
  ).toHaveCount(0);
  await expect(
    main.getByRole("link", { name: "Read the Cookie Notice" }).first()
  ).toBeVisible();

  void pageIssues;
});
