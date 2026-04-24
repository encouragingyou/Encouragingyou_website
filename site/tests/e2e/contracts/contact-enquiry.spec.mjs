import { gotoRoute } from "../support/assertions.mjs";
import { expect, test } from "../support/fixtures.mjs";
import {
  expectSupportFormStatus,
  fillSupportForm,
  submitSupportForm
} from "../support/forms.mjs";
import { getResilienceSurfaceText } from "../../../src/lib/content/resilience-state.js";

test("contact enquiry submits successfully with inline confirmation and trust cues intact", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/contact/");

  await expect(
    page.locator(".support-panel").getByRole("link", { name: "Privacy Notice" })
  ).toBeVisible();
  await expect(
    page.locator("main").getByRole("link", { name: "Read safeguarding" }).first()
  ).toBeVisible();

  await fillSupportForm(page, {
    name: "Alex",
    email: "alex@example.com",
    reason: "general",
    message: "I would like to understand the best first step before I travel.",
    updatesOptIn: true
  });
  await submitSupportForm(page);

  await expect(page).toHaveURL(/\/contact\/$/u);
  await expectSupportFormStatus(
    page,
    /Your message is with the team\. They will reply with the right next step as soon as they can\. Reference EY-/u
  );

  void pageIssues;
});

test("session detail ask-to-join routes through contact with session context and return path preserved", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/sessions/cv-support/");
  await page.locator("main").getByRole("link", { name: "Ask to join" }).click();

  await expect(page).toHaveURL(
    /\/contact\/\?context=session%3Acv-support#contact-form$/u
  );
  await expect(page.getByText("You're asking about CV support.")).toBeVisible();
  await expect(page.locator("#support-reason")).toHaveValue("cv-support");
  await expect(
    page.locator("main").getByRole("link", { name: "Back to CV support" }).first()
  ).toBeVisible();

  void pageIssues;
});

test("contact enquiry surfaces a spam-blocked state when the honeypot is filled", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/contact/");

  await fillSupportForm(page, {
    name: "Alex",
    email: "alex@example.com",
    reason: "general",
    message: "I would like to understand the best first step before I travel."
  });

  await page.locator('[name="website"]').evaluate((input) => {
    input.value = "bot";
  });
  await submitSupportForm(page);

  await expectSupportFormStatus(page, getResilienceSurfaceText("form-reload-required"));

  void pageIssues;
});

test.describe("no-js contact enquiry", () => {
  test.use({ javaScriptEnabled: false });

  test("submits through the redirect fallback and returns to the same form shell", async ({
    page,
    pageIssues
  }) => {
    await gotoRoute(page, "/contact/");

    await fillSupportForm(page, {
      name: "Alex",
      email: "alex@example.com",
      reason: "general",
      message: "I would like to understand the best first step before I travel."
    });
    await submitSupportForm(page);

    await expect(page).toHaveURL(
      /\/contact\/\?enquiry=success&enquirySurface=support-general&enquiryCode=sent&enquiryRef=EY-[A-F0-9-]+&form=contact-form#contact-form$/u
    );
    await expectSupportFormStatus(
      page,
      /Your message is with the team\. They will reply with the right next step as soon as they can\. Reference EY-/u
    );
    await expect(
      page.getByRole("navigation", { name: "Breadcrumb" }).getByText("Contact")
    ).toBeVisible();

    void pageIssues;
  });
});
