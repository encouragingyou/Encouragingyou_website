import { gotoRoute } from "../support/assertions.mjs";
import { expect, test } from "../support/journey-fixtures.mjs";
import {
  expectSupportFormStatus,
  fillSupportForm,
  fillSupportFormWithKeyboard,
  waitForSupportFormReady
} from "../support/forms.mjs";
import { activateWithKeyboard, getInvolvementCard } from "../support/journeys.mjs";
import { waitForEnquiryRecord } from "../support/storage.mjs";

test("@journey-pr @journey-keyboard keyboard volunteer journey completes without mouse-only actions", async ({
  page,
  pageIssues,
  journeyAudit,
  journeyData
}) => {
  await gotoRoute(page, "/get-involved/");

  const volunteerLink = getInvolvementCard(page, "Volunteer with us").getByRole("link", {
    name: "See volunteer with us"
  });

  await activateWithKeyboard(volunteerLink);
  await expect(page).toHaveURL(/\/volunteer\/$/u);
  await expect(
    page.locator(".support-panel").getByRole("link", { name: "Privacy Notice" })
  ).toBeVisible();
  await expect(
    page
      .locator("main")
      .getByRole("link", { name: "Read safeguarding information" })
      .first()
  ).toBeVisible();
  journeyAudit.note("Opened the volunteer route using keyboard activation");

  const message = journeyData.message(
    "I can offer a few hours each month and want to understand what a realistic first volunteer conversation looks like."
  );

  await fillSupportFormWithKeyboard(page, {
    email: journeyData.email,
    message,
    name: journeyData.name
  });

  const submitButton = page.getByRole("button", { name: "Send volunteer enquiry" });
  await waitForSupportFormReady(page);
  await activateWithKeyboard(submitButton);
  await expectSupportFormStatus(
    page,
    /Your volunteer enquiry is with the team\. They will reply with the next fair step when they can\. Reference EY-/u
  );

  const storedEnquiry = await waitForEnquiryRecord(
    (record) =>
      record.sender?.email === journeyData.email &&
      record.message?.includes(journeyData.nonce)
  );

  expect(storedEnquiry.surfaceId).toBe("volunteer-enquiry");
  expect(storedEnquiry.originPath).toBe("/volunteer/");
  expect(storedEnquiry.reason?.id).toBe("volunteer");
  journeyAudit.note("Stored volunteer enquiry verified", {
    referenceId: storedEnquiry.referenceId
  });

  void pageIssues;
});

test("@journey-rc safeguarding concern flow submits through the dedicated secure surface and preserves emergency context", async ({
  page,
  pageIssues,
  journeyAudit,
  journeyData
}) => {
  await gotoRoute(page, "/safeguarding/child/");
  await expect(
    page
      .locator("main")
      .getByText(/Immediate danger needs emergency services first|call 999/u)
      .first()
  ).toBeVisible();

  const message = journeyData.message(
    "I need to raise a non-emergency safeguarding concern clearly and make sure the right route sees it."
  );

  await fillSupportForm(page, {
    email: journeyData.email,
    message,
    name: journeyData.name
  });
  await waitForSupportFormReady(page);
  await page.getByRole("button", { name: "Send safeguarding message" }).click();
  await expectSupportFormStatus(
    page,
    /Your safeguarding message is with the team\. If the risk becomes immediate, call 999 rather than waiting for a reply\. Reference EY-/u
  );
  await expect(
    page
      .locator("main")
      .getByText(
        /call 999 rather than waiting for a reply|Immediate danger needs emergency services first/u
      )
      .first()
  ).toBeVisible();

  const storedEnquiry = await waitForEnquiryRecord(
    (record) =>
      record.sender?.email === journeyData.email &&
      record.message?.includes(journeyData.nonce)
  );

  expect(storedEnquiry.surfaceId).toBe("safeguarding-concern");
  expect(storedEnquiry.originPath).toBe("/safeguarding/child/");
  expect(storedEnquiry.reason?.id).toBe("safeguarding");
  journeyAudit.note("Stored safeguarding concern verified", {
    referenceId: storedEnquiry.referenceId
  });

  void pageIssues;
});
