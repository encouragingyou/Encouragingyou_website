import { assertVerticalOrder, gotoRoute } from "../support/assertions.mjs";
import { expect, test } from "../support/fixtures.mjs";

test("homepage assembles the canonical decision surfaces in order", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/");

  const main = page.locator("main");
  const trust = main.locator('[data-home-section="trust-strip"]');
  const liveSessions = main.locator('[data-home-section="live-sessions"]');
  const about = main.locator('[data-home-section="about-teaser"]');
  const communitySupport = main.locator('[data-home-section="community-support"]');
  const updates = main.locator('[data-home-section="updates-surface"]');
  const contact = main.locator('[data-home-section="contact-panel"]');

  await expect(
    about.getByRole("heading", {
      name: "Youth-led leadership with practical care built in."
    })
  ).toBeVisible();
  await expect(
    updates.getByRole("heading", {
      name: "Public updates can stay light without disappearing."
    })
  ).toBeVisible();
  await expect(updates.locator(".card-panel--interactive")).toHaveCount(2);
  await expect(contact.getByText("Launch contact note", { exact: true })).toBeVisible();
  await expect(contact.getByRole("button", { name: "Send message" })).toBeVisible();

  await assertVerticalOrder([
    trust,
    liveSessions,
    about,
    communitySupport,
    updates,
    contact
  ]);

  void pageIssues;
});

test("homepage hero and trust surfaces keep first-step and reassurance routes visible", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/");

  const hero = page.locator(".home-hero");
  const trust = page.locator('[data-home-section="trust-strip"]');
  const updates = page.locator('[data-home-section="updates-surface"]');

  await expect(hero.getByText("Common next steps", { exact: true })).toBeVisible();
  await expect(
    hero.getByRole("link", { name: "Get CV help", exact: true })
  ).toBeVisible();
  await expect(
    hero.getByRole("link", { name: "See all programmes", exact: true })
  ).toBeVisible();
  await expect(hero.locator(".home-hero__panel")).toContainText("CV support");
  await expect(hero.locator(".home-hero__panel")).toContainText("Youth club");

  await expect(
    trust.getByRole("link", { name: "Why EncouragingYou exists", exact: true })
  ).toBeVisible();
  await expect(
    trust.getByRole("link", { name: "Safeguarding information", exact: true })
  ).toBeVisible();
  await expect(
    trust.getByRole("link", { name: "Privacy notice", exact: true })
  ).toBeVisible();
  await expect(
    updates.getByRole("link", {
      name: "Recurring Saturday support stays on the Sessions route."
    })
  ).toBeVisible();
  await expect(
    updates.getByRole("link", {
      name: "Volunteer, partner, or refer someone through one clear route."
    })
  ).toBeVisible();

  void pageIssues;
});
