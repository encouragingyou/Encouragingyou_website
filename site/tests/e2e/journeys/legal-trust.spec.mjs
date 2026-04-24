import { gotoRoute } from "../support/assertions.mjs";
import { expect, test } from "../support/journey-fixtures.mjs";
import {
  expectSupportFormStatus,
  fillSupportForm,
  submitSupportForm,
  waitForSupportFormReady
} from "../support/forms.mjs";
import {
  expectAnalyticsPreferenceCookie,
  followFooterLegalLink,
  turnOffAnonymousAnalytics
} from "../support/journeys.mjs";
import { waitForEnquiryRecord } from "../support/storage.mjs";

test("@journey-pr contact trust path reaches privacy, cookies, accessibility, and terms while keeping analytics objection state coherent", async ({
  page,
  pageIssues,
  journeyAudit
}) => {
  await gotoRoute(page, "/contact/");
  await page
    .locator(".support-panel")
    .getByRole("link", { name: "Privacy Notice" })
    .click();
  await expect(page).toHaveURL(/\/privacy\/$/u);
  await expect(page.locator(".privacy-collection-card")).toHaveCount(6);
  journeyAudit.note("Opened the privacy notice from the contact enquiry surface");

  await followFooterLegalLink(page, "Cookie Notice", /\/cookies\/$/u);
  await turnOffAnonymousAnalytics(page);
  await expectAnalyticsPreferenceCookie(page, "objected");
  journeyAudit.note("Turned off anonymous analytics from the cookie route");

  await followFooterLegalLink(page, "Accessibility Statement", /\/accessibility\/$/u);
  await expect(
    page.getByRole("button", { name: "Send accessibility feedback" })
  ).toBeVisible();
  await expect(
    page.getByLabel("I would like occasional updates about future sessions and events.")
  ).toHaveCount(0);

  await followFooterLegalLink(page, "Terms / Site Policy", /\/terms\/$/u);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "How this site works, what to expect from it, and where the boundaries are."
    })
  ).toBeVisible();

  await gotoRoute(page, "/");
  await expect(page.locator("html")).toHaveAttribute(
    "data-analytics-collection",
    "false"
  );

  void pageIssues;
});

test.describe("@journey-rc @journey-mobile mobile accessibility feedback journey", () => {
  test.use({
    hasTouch: true,
    isMobile: true,
    viewport: { height: 844, width: 390 }
  });

  test("accessibility feedback can be sent from a legal route without introducing marketing opt-in", async ({
    page,
    pageIssues,
    journeyAudit,
    journeyData
  }) => {
    await gotoRoute(page, "/accessibility/");
    await expect(
      page.getByRole("button", { name: "Send accessibility feedback" })
    ).toBeVisible();
    await expect(
      page.getByLabel("I would like occasional updates about future sessions and events.")
    ).toHaveCount(0);

    const message = journeyData.message(
      "The legal and trust surfaces need to stay readable on mobile, and I want to report a specific accessibility barrier."
    );

    await fillSupportForm(page, {
      email: journeyData.email,
      message,
      name: journeyData.name
    });
    await waitForSupportFormReady(page);
    await submitSupportForm(page, "Send accessibility feedback");
    await expectSupportFormStatus(
      page,
      /Your accessibility message is with the team\. They will reply with the most useful next step they can offer\. Reference EY-/u
    );

    const storedEnquiry = await waitForEnquiryRecord(
      (record) =>
        record.sender?.email === journeyData.email &&
        record.message?.includes(journeyData.nonce)
    );

    expect(storedEnquiry.surfaceId).toBe("accessibility-feedback");
    expect(storedEnquiry.originPath).toBe("/accessibility/");
    expect(storedEnquiry.reason?.id).toBe("accessibility");
    journeyAudit.note("Stored accessibility feedback verified", {
      referenceId: storedEnquiry.referenceId
    });

    void pageIssues;
  });
});
