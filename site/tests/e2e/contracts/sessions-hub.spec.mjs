import { gotoRoute } from "../support/assertions.mjs";
import { expect, test } from "../support/fixtures.mjs";

test("sessions hub exposes live rail, comparison cards, and escalation paths", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/sessions/");

  const main = page.locator("main");
  const cvCard = main.locator(".session-hub-card").filter({
    has: page.getByRole("heading", { name: "CV support" })
  });

  await expect(main.getByText(/Two Saturday sessions currently live\./u)).toBeVisible();
  await expect(main.locator(".sessions-live-rail__item")).toHaveCount(2);
  await expect(
    main.getByText("Practical detail and reassurance should stay public.")
  ).toBeVisible();
  await expect(cvCard.getByText("Inside Career Support & CV Help")).toBeVisible();
  await expect(cvCard.getByRole("link", { name: "See details" })).toBeVisible();
  await expect(cvCard.getByRole("link", { name: "Add to calendar" })).toBeVisible();
  await expect(cvCard.getByRole("link", { name: "See programme" })).toBeVisible();
  await expect(main.getByRole("link", { name: "Contact the team" }).last()).toBeVisible();

  void pageIssues;
});

test("sessions hub can hand off into the wider programme route without losing the contact path", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/sessions/");

  const youthCard = page.locator(".session-hub-card").filter({
    has: page.getByRole("heading", { name: "Youth club" })
  });

  await youthCard.getByRole("link", { name: "See programme" }).click();
  await expect(page).toHaveURL(/\/programmes\/community-friendship\/$/u);

  await gotoRoute(page, "/sessions/");
  await page
    .locator("main")
    .getByRole("link", { name: "Contact the team" })
    .last()
    .click();
  await expect(page).toHaveURL(/\/contact\/$/u);

  void pageIssues;
});
