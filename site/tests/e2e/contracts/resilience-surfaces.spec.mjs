import { assertNoHorizontalOverflow, gotoRoute } from "../support/assertions.mjs";
import { expect, test } from "../support/fixtures.mjs";

test("custom 404 route recovers users into the main support paths", async ({
  page,
  pageIssues
}) => {
  const response = await page.goto("/this-route-does-not-exist/", {
    waitUntil: "networkidle"
  });

  expect(response?.status()).toBe(404);
  await assertNoHorizontalOverflow(page);

  const main = page.locator("main");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "That page is missing, but the main routes into support are still here."
    })
  ).toBeVisible();
  await expect(main.getByRole("link", { name: "Go to the homepage" })).toBeVisible();
  await expect(main.getByRole("link", { name: "Join a session" })).toBeVisible();
  await expect(main.getByRole("link", { name: "Explore programmes" })).toBeVisible();
  await expect(main.getByRole("link", { name: "Get involved" })).toBeVisible();
  await expect(main.getByRole("link", { name: "Contact the team" })).toBeVisible();
  await expect(main.getByRole("link", { name: "Read safeguarding" })).toBeVisible();
  await expect(main.getByText("Need urgent help?", { exact: true })).toBeVisible();

  pageIssues.consoleErrors.length = 0;
  pageIssues.pageErrors.length = 0;

  void pageIssues;
});

test("contact form surfaces validation state before any network request is made", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/contact/");

  const form = page.locator("[data-support-form]");
  const status = form.locator("[data-form-status]");

  await form.getByRole("button", { name: "Send message" }).click();

  await expect(status).toHaveAttribute("data-resilience-state", "validation-error");
  await expect(status).toHaveText(
    "Check the highlighted fields before sending your message."
  );

  void pageIssues;
});

test("contact form exposes a truthful fallback when submission fails", async ({
  page,
  pageIssues
}) => {
  await page.route("**/api/enquiry/", (route) => route.abort());
  await gotoRoute(page, "/contact/");

  const form = page.locator("[data-support-form]");
  const status = form.locator("[data-form-status]");

  await form.getByLabel("Your name").fill("Alex Example");
  await form.getByLabel("Email address").fill("alex@example.com");
  await form.getByLabel("This message is about").selectOption("general");
  await form
    .locator("#support-message")
    .fill("I need help understanding which route fits before I visit.");
  await form.getByRole("button", { name: "Send message" }).click();

  await expect(status).toHaveAttribute("data-resilience-state", "submission-error");
  await expect(status).toHaveText(
    "Please try again or use the email link below so you are not left at a dead end."
  );
  await expect(page.locator(".support-panel__hint")).toContainText(
    "admin@encouragingyou.co.uk"
  );

  pageIssues.consoleErrors.length = 0;
  pageIssues.pageErrors.length = 0;

  void pageIssues;
});
