import { assertNoHorizontalOverflow, gotoRoute } from "../support/assertions.mjs";
import { expect, test } from "../support/fixtures.mjs";
import {
  expectSupportFormStatus,
  fillSupportForm,
  submitSupportForm
} from "../support/forms.mjs";

test("partner route exposes clear audiences, collaboration pathways, and a dedicated enquiry flow", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/partner/");
  await assertNoHorizontalOverflow(page);

  const main = page.locator("main");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Start a partnership conversation that is clear, local, and proportionate."
    })
  ).toBeVisible();
  await expect(
    main.getByText("Launch illustration, not participant photography.", {
      exact: true
    })
  ).toBeVisible();
  await expect(
    main.getByRole("heading", {
      name: "Useful for institutions, local groups, and practical supporters who need the right starting point."
    })
  ).toBeVisible();
  await expect(
    main.getByRole("heading", {
      name: "Partnership does not have to mean one fixed model."
    })
  ).toBeVisible();
  await expect(
    main.getByRole("heading", {
      name: "Public trust should come from clarity, not overclaiming."
    })
  ).toBeVisible();
  await expect(
    main.getByRole("heading", {
      name: "Start with the local context, then route the next step properly."
    })
  ).toBeVisible();
  await expect(main.getByRole("heading", { name: "Safe to publish now" })).toBeVisible();
  await expect(
    main.getByRole("heading", {
      name: "Questions people often ask before starting a partnership conversation."
    })
  ).toBeVisible();
  await expect(main.locator(".involvement-role-card")).toHaveCount(3);
  await expect(
    main.getByText("Use the route that matches the real reason for getting in touch.")
  ).toBeVisible();
  await expect(main.getByRole("link", { name: "Privacy Notice" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Send partnership enquiry" })
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Current page status" })).toHaveCount(0);

  void pageIssues;
});

test("partner journey keeps get involved, safeguarding, and privacy routes close to the enquiry path", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/get-involved/");

  const partnerCard = page.locator(".involvement-pathway-card").filter({
    has: page.getByRole("heading", { name: "Partner with us" })
  });

  await partnerCard.getByRole("link", { name: "See partner with us" }).click();
  await expect(page).toHaveURL(/\/partner\/$/u);

  await page
    .locator("main")
    .getByRole("link", { name: "Read safeguarding information" })
    .first()
    .click();
  await expect(page).toHaveURL(/\/safeguarding\/$/u);

  await gotoRoute(page, "/partner/");
  await page
    .locator(".support-panel")
    .getByRole("link", { name: "Privacy Notice" })
    .click();
  await expect(page).toHaveURL(/\/privacy\/$/u);

  await gotoRoute(page, "/partner/");
  await page
    .locator(".shell-wayfinding")
    .getByRole("link", { name: "Back to Get Involved" })
    .click();
  await expect(page).toHaveURL(/\/get-involved\/$/u);

  void pageIssues;
});

test("partner enquiry keeps partnership selected by default, allows referral routing, and focuses the first invalid field", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/partner/");

  const reasonField = page.locator("#support-reason");
  const submit = page.getByRole("button", { name: "Send partnership enquiry" });

  await expect(reasonField.locator("option")).toHaveCount(2);
  await expect(reasonField).toHaveValue("partner");

  await submit.click();
  await expect(page.locator("#support-name")).toBeFocused();
  await expect(
    page.getByText("Check the highlighted fields before sending your message.")
  ).toBeVisible();

  await page.locator("#support-name").fill("Alex");
  await page.locator("#support-email").fill("alex@example.com");
  await page.locator("#support-reason").selectOption("referral");
  await page.locator("#support-message").fill("Too short");
  await submit.click();

  await expect(page.locator("#support-message")).toBeFocused();
  await expect(
    page.getByText("Add a little more detail so the team can route your enquiry.")
  ).toBeVisible();

  void pageIssues;
});

test("partner enquiry submits successfully and keeps the wider route context visible", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/partner/");

  await fillSupportForm(page, {
    name: "Alex",
    email: "alex@example.com",
    reason: "referral",
    message:
      "I am writing on behalf of a local organisation and need to discuss the right referral or collaboration starting point."
  });
  await submitSupportForm(page, "Send partnership enquiry");

  await expect(page).toHaveURL(/\/partner\/$/u);
  await expectSupportFormStatus(
    page,
    /Your partnership enquiry is with the team\. They will reply with the most useful next conversation they can offer\. Reference EY-/u
  );
  await expect(page.getByRole("heading", { name: "Safe to publish now" })).toBeVisible();

  void pageIssues;
});

test.describe("no-js partner route", () => {
  test.use({ javaScriptEnabled: false });

  test("critical content, FAQ disclosure, and the partner enquiry path stay reachable without client scripting", async ({
    page,
    pageIssues
  }) => {
    await gotoRoute(page, "/partner/");

    const main = page.locator("main");
    const firstFaq = main.locator(".faq-item").first();

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Start a partnership conversation that is clear, local, and proportionate."
      })
    ).toBeVisible();
    await expect(main.locator(".involvement-role-card")).toHaveCount(3);
    await expect(
      main.getByRole("link", { name: "Read safeguarding information" }).first()
    ).toBeVisible();
    await expect(
      main.getByRole("button", { name: "Send partnership enquiry" })
    ).toBeVisible();
    await expect(main.locator("#support-reason")).toHaveValue("partner");

    await firstFaq.locator("summary").click();
    await expect(firstFaq).toHaveAttribute("open", "");

    void pageIssues;
  });
});
