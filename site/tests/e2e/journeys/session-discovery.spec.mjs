import {
  assertClearOfStickyHeader,
  assertElementVisibleWithinViewport,
  gotoRoute
} from "../support/assertions.mjs";
import { expect, test } from "../support/journey-fixtures.mjs";
import {
  expectSupportFormStatus,
  fillSupportForm,
  submitSupportForm,
  waitForSupportFormReady
} from "../support/forms.mjs";
import {
  expectContextualContactState,
  getSessionCard,
  openPrimaryRoute,
  openSessionDetail,
  openSessionsHubFromHome,
  verifyCalendarDownload
} from "../support/journeys.mjs";
import { waitForEnquiryRecord } from "../support/storage.mjs";

test("@journey-pr homepage session discovery reaches CV support and completes the contextual enquiry path", async ({
  page,
  pageIssues,
  request,
  journeyAudit,
  journeyData
}) => {
  await openSessionsHubFromHome(page);
  journeyAudit.note("Opened the sessions hub from the homepage hero CTA");

  await openSessionDetail(page, "CV support");
  await expect(page).toHaveURL(/\/sessions\/cv-support\/$/u);
  await expect(page.getByText("Every Saturday", { exact: true }).first()).toBeVisible();
  await verifyCalendarDownload(page, request);
  journeyAudit.note("Opened the CV support detail route and verified the calendar file");

  await page.getByRole("link", { name: "Ask to join" }).click();
  await expect(page).toHaveURL(
    /\/contact\/\?context=session%3Acv-support#contact-form$/u
  );
  await expectContextualContactState(page, {
    backLinkName: "Back to CV support",
    contextText: "You're asking about CV support.",
    reasonValue: "cv-support"
  });

  const message = journeyData.message(
    "I would like to join the CV support session and understand the next step before I travel."
  );

  await fillSupportForm(page, {
    email: journeyData.email,
    message,
    name: journeyData.name
  });
  await waitForSupportFormReady(page);
  await submitSupportForm(page);
  await expectSupportFormStatus(
    page,
    /Your message is with the team\. They will reply with the right next step as soon as they can\. Reference EY-/u
  );
  journeyAudit.note("Submitted the contextual CV support enquiry from the contact route");

  const storedEnquiry = await waitForEnquiryRecord(
    (record) =>
      record.sender?.email === journeyData.email &&
      record.message?.includes(journeyData.nonce)
  );

  expect(storedEnquiry.surfaceId).toBe("support-general");
  expect(storedEnquiry.originPath).toBe("/contact/");
  expect(storedEnquiry.context?.id).toBe("session:cv-support");
  expect(storedEnquiry.reason?.id).toBe("cv-support");
  journeyAudit.note("Verified the stored enquiry record", {
    referenceId: storedEnquiry.referenceId,
    surfaceId: storedEnquiry.surfaceId
  });

  void pageIssues;
});

test.describe("@journey-pr @journey-mobile mobile touch session discovery", () => {
  test.use({
    hasTouch: true,
    isMobile: true,
    viewport: { height: 844, width: 390 }
  });

  test("mobile get involved flow reaches Youth Club and preserves the contextual contact route", async ({
    page,
    pageIssues,
    journeyAudit,
    journeyData
  }) => {
    await gotoRoute(page, "/");
    await openPrimaryRoute(page, "Get Involved");
    await expect(page).toHaveURL(/\/get-involved\/$/u);
    journeyAudit.note("Opened Get Involved through the mobile primary navigation");

    await page.getByRole("link", { name: "Browse live sessions" }).click();
    await expect(page).toHaveURL(/\/sessions\/$/u);
    await assertClearOfStickyHeader(
      page,
      page.getByRole("heading", { level: 1, name: /Recurring offers/u })
    );

    const youthClubCard = getSessionCard(page, "Youth club");

    await youthClubCard.getByRole("link", { name: "See details" }).click();
    await expect(page).toHaveURL(/\/sessions\/youth-club\/$/u);
    await assertElementVisibleWithinViewport(
      page,
      page.getByRole("link", { name: "Ask to join" })
    );

    await page.getByRole("link", { name: "Ask to join" }).click();
    await expect(page).toHaveURL(
      /\/contact\/\?context=session%3Ayouth-club#contact-form$/u
    );
    await expectContextualContactState(page, {
      backLinkName: "Back to Youth club",
      contextText: "You're asking about Youth club.",
      reasonValue: "join-session"
    });

    const message = journeyData.message(
      "I would like to ask about the Youth Club atmosphere, first visit details, and the right next step."
    );

    await fillSupportForm(page, {
      email: journeyData.email,
      message,
      name: journeyData.name
    });
    await waitForSupportFormReady(page);
    await submitSupportForm(page);
    await expectSupportFormStatus(
      page,
      /Your message is with the team\. They will reply with the right next step as soon as they can\. Reference EY-/u
    );

    const storedEnquiry = await waitForEnquiryRecord(
      (record) =>
        record.sender?.email === journeyData.email &&
        record.message?.includes(journeyData.nonce)
    );

    expect(storedEnquiry.context?.id).toBe("session:youth-club");
    expect(storedEnquiry.reason?.id).toBe("join-session");
    journeyAudit.note("Stored Youth Club enquiry verified", {
      referenceId: storedEnquiry.referenceId
    });

    void pageIssues;
  });
});

test.describe("@journey-rc @journey-fallback no-js session enquiry fallback", () => {
  test.use({ javaScriptEnabled: false });

  test("CV support ask-to-join still submits through the no-js contact fallback", async ({
    page,
    pageIssues,
    journeyAudit,
    journeyData
  }) => {
    await gotoRoute(page, "/sessions/cv-support/");
    await page.getByRole("link", { name: "Ask to join" }).click();
    await expect(page).toHaveURL(
      /\/contact\/\?context=session%3Acv-support#contact-form$/u
    );
    await expectContextualContactState(page, {
      backLinkName: "Back to CV support",
      contextText: "You're asking about CV support.",
      reasonValue: "cv-support"
    });

    const message = journeyData.message(
      "I need the non-JavaScript fallback path to keep the CV support context attached to my message."
    );

    await fillSupportForm(page, {
      email: journeyData.email,
      message,
      name: journeyData.name
    });
    await waitForSupportFormReady(page);
    await submitSupportForm(page);
    await expect(page).toHaveURL(
      /\/contact\/\?enquiry=success&enquirySurface=support-general&enquiryCode=sent&enquiryRef=EY-[A-F0-9-]+&context=session%3Acv-support&form=contact-form#contact-form$/u
    );
    await expectSupportFormStatus(
      page,
      /Your message is with the team\. They will reply with the right next step as soon as they can\. Reference EY-/u
    );

    const storedEnquiry = await waitForEnquiryRecord(
      (record) =>
        record.sender?.email === journeyData.email &&
        record.message?.includes(journeyData.nonce)
    );

    expect(storedEnquiry.context?.id).toBe("session:cv-support");
    journeyAudit.note("Verified the no-js fallback enquiry record", {
      referenceId: storedEnquiry.referenceId
    });

    void pageIssues;
  });
});
