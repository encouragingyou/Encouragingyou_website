import { assertVerticalOrder, gotoRoute } from "../support/assertions.mjs";
import { expect, test } from "../support/fixtures.mjs";

test("about route assembles the narrative stack in the intended reading order", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/about/");

  const origin = page.locator("#about-origin");
  const purpose = page.locator("#about-purpose");
  const leadership = page.locator("#about-leadership");
  const approach = page.locator("#about-approach");
  const values = page.locator("#about-values");
  const audience = page.locator("#about-audience");
  const community = page.locator("#about-community");
  const trust = page.locator("#about-trust");
  const nextStep = page.locator("#about-next-step");

  await expect(
    origin.getByRole("heading", {
      name: "EncouragingYou started with a gap we could already see around us."
    })
  ).toBeVisible();
  await expect(
    purpose.getByRole("heading", { name: "Purpose first, with community at the centre." })
  ).toBeVisible();
  await expect(
    values.getByRole("heading", { name: "What people should feel in the way we work." })
  ).toBeVisible();
  await expect(
    trust.getByRole("heading", {
      name: "Confidence should come from clear routes and visible care, not inflated claims."
    })
  ).toBeVisible();

  await assertVerticalOrder([
    origin,
    purpose,
    leadership,
    approach,
    values,
    audience,
    community,
    trust,
    nextStep
  ]);

  void pageIssues;
});

test("about route keeps proof boundaries explicit and routes visitors onward", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/about/");

  const hero = page.locator("#about-hero");
  const trust = page.locator("#about-trust");
  const nextStep = page.locator("#about-next-step");

  await expect(
    hero.getByText("Launch illustration, not participant photography.", {
      exact: true
    })
  ).toBeVisible();
  await expect(trust.getByText("What we are not claiming in public yet.")).toBeVisible();
  await expect(trust.getByText("Safe to publish now")).toBeVisible();
  await expect(trust.getByText("Still waiting for approval")).toBeVisible();
  await expect(trust.getByText("Held back until verified")).toBeVisible();
  await expect(trust).not.toContainText("Trained and vetted team");

  await expect(
    nextStep.getByRole("link", { name: "See our programmes", exact: true })
  ).toBeVisible();
  await expect(
    nextStep.getByRole("link", { name: "Join a session", exact: true })
  ).toBeVisible();
  await expect(
    nextStep.getByRole("link", { name: "Contact the team", exact: true })
  ).toBeVisible();
  await expect(
    nextStep.getByRole("link", { name: "See involvement routes", exact: true })
  ).toBeVisible();

  void pageIssues;
});
