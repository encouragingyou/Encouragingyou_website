import { assertNoHorizontalOverflow, gotoRoute } from "../support/assertions.mjs";
import { expect, test } from "../support/fixtures.mjs";
import {
  expectSupportFormStatus,
  fillSupportForm,
  submitSupportForm
} from "../support/forms.mjs";

test("volunteer route exposes clear pathways, safeguarding context, and a dedicated enquiry flow", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/volunteer/");
  await assertNoHorizontalOverflow(page);

  const main = page.locator("main");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Volunteer in a way that feels clear, supported, and fair."
    })
  ).toBeVisible();
  await expect(
    main.getByText("Launch illustration, not participant photography.", {
      exact: true
    })
  ).toBeVisible();
  await expect(main.getByText("Start with the right level of honesty")).toBeVisible();
  await expect(
    main.getByRole("heading", { name: "Different people help in different ways." })
  ).toBeVisible();
  await expect(
    main.getByRole("heading", { name: "Support should come before commitment." })
  ).toBeVisible();
  await expect(
    main.getByRole("heading", {
      name: "Safeguarding is part of the route, not fine print."
    })
  ).toBeVisible();
  await expect(
    main.getByRole("heading", { name: "Start with what you can genuinely offer." })
  ).toBeVisible();
  await expect(
    main.getByRole("heading", { name: "Questions people often ask before volunteering." })
  ).toBeVisible();
  await expect(main.locator(".involvement-role-card")).toHaveCount(3);
  await expect(
    main.getByText("Privacy and safeguarding stay visible near the enquiry path.")
  ).toBeVisible();
  await expect(main.getByRole("link", { name: "Privacy Notice" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Send volunteer enquiry" })
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Current page status" })).toHaveCount(0);

  void pageIssues;
});

test("volunteer journey keeps get involved, safeguarding, and privacy routes close to the enquiry path", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/get-involved/");

  const volunteerCard = page.locator(".involvement-pathway-card").filter({
    has: page.getByRole("heading", { name: "Volunteer with us" })
  });

  await volunteerCard.getByRole("link", { name: "See volunteer with us" }).click();
  await expect(page).toHaveURL(/\/volunteer\/$/u);

  await page
    .locator("main")
    .getByRole("link", { name: "Read safeguarding information" })
    .first()
    .click();
  await expect(page).toHaveURL(/\/safeguarding\/$/u);

  await gotoRoute(page, "/volunteer/");
  await page
    .locator(".support-panel")
    .getByRole("link", { name: "Privacy Notice" })
    .click();
  await expect(page).toHaveURL(/\/privacy\/$/u);

  await gotoRoute(page, "/volunteer/");
  await page
    .locator(".shell-wayfinding")
    .getByRole("link", { name: "Back to Get Involved" })
    .click();
  await expect(page).toHaveURL(/\/get-involved\/$/u);

  void pageIssues;
});

test("volunteer enquiry validation keeps the reason locked to volunteering and focuses the first invalid field", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/volunteer/");

  const reasonField = page.locator("#support-reason");
  const submit = page.getByRole("button", { name: "Send volunteer enquiry" });

  await expect(reasonField.locator("option")).toHaveCount(1);
  await expect(reasonField).toHaveValue("volunteer");

  await submit.click();
  await expect(page.locator("#support-name")).toBeFocused();
  await expect(
    page.getByText("Check the highlighted fields before sending your message.")
  ).toBeVisible();

  await page.locator("#support-name").fill("Alex");
  await page.locator("#support-email").fill("alex@example.com");
  await page.locator("#support-message").fill("Too short");
  await submit.click();

  await expect(page.locator("#support-message")).toBeFocused();
  await expect(
    page.getByText("Add a little more detail so the team can route your enquiry.")
  ).toBeVisible();

  void pageIssues;
});

test("volunteer enquiry submits successfully and keeps the route context intact", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/volunteer/");

  await fillSupportForm(page, {
    name: "Alex",
    email: "alex@example.com",
    message:
      "I can offer a few hours twice a month and would like to hear what feels realistic."
  });
  await submitSupportForm(page, "Send volunteer enquiry");

  await expect(page).toHaveURL(/\/volunteer\/$/u);
  await expectSupportFormStatus(
    page,
    /Your volunteer enquiry is with the team\. They will reply with the next fair step when they can\. Reference EY-/u
  );
  await expect(
    page.locator(".shell-wayfinding").getByRole("link", { name: "Back to Get Involved" })
  ).toBeVisible();

  void pageIssues;
});

test.describe("no-js volunteer route", () => {
  test.use({ javaScriptEnabled: false });

  test("critical content, FAQ disclosure, and the volunteer enquiry path stay reachable without client scripting", async ({
    page,
    pageIssues
  }) => {
    await gotoRoute(page, "/volunteer/");

    const main = page.locator("main");
    const firstFaq = main.locator(".faq-item").first();

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Volunteer in a way that feels clear, supported, and fair."
      })
    ).toBeVisible();
    await expect(main.locator(".involvement-role-card")).toHaveCount(3);
    await expect(
      main.getByRole("link", { name: "Read safeguarding information" }).first()
    ).toBeVisible();
    await expect(
      main.getByRole("button", { name: "Send volunteer enquiry" })
    ).toBeVisible();
    await expect(main.locator("#support-reason")).toHaveValue("volunteer");

    await firstFaq.locator("summary").click();
    await expect(firstFaq).toHaveAttribute("open", "");

    void pageIssues;
  });
});
