import { expect, test } from "@playwright/test";

test("accessibility and site policy routes are now live legal surfaces rather than placeholders", async ({
  page
}) => {
  await page.goto("/accessibility/");

  await expect(
    page.getByRole("heading", {
      name: "How accessibility is handled on the live EncouragingYou website."
    })
  ).toBeVisible();
  await expect(page.getByRole("navigation", { name: "On this page" })).toBeVisible();
  await expect(page.getByText("Need help using the site?")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Send accessibility feedback" })
  ).toBeVisible();
  await expect(
    page
      .getByText(
        "This site does not show a cookie banner at launch. The Cookie Notice explains the live first-party aggregate analytics model"
      )
      .first()
  ).toBeVisible();

  await page.goto("/terms/");

  await expect(
    page.getByRole("heading", {
      name: "How this site works, what to expect from it, and where the boundaries are."
    })
  ).toBeVisible();
  await expect(page.getByRole("navigation", { name: "On this page" })).toBeVisible();
  await expect(
    page.getByText("No public directions link is live at launch.")
  ).toBeVisible();
});

test("support routes reuse the governed privacy and helper microcopy", async ({
  page
}) => {
  await page.goto("/contact/");

  await expect(page.getByText("Privacy reminder")).toBeVisible();
  await expect(
    page.getByText(
      "Share enough detail for the team to reply clearly. You do not need to include anything you are not comfortable sending by email."
    )
  ).toBeVisible();
  await expect(
    page.getByText("The optional updates box is separate from your main message.")
  ).toBeVisible();
  await expect(page.getByText("If you prefer email, contact")).toBeVisible();

  await page.goto("/get-involved/");

  await expect(page.getByText("Privacy reminder")).toBeVisible();
  await expect(
    page.getByText(
      "Share enough detail for the team to reply clearly. You do not need to include anything you are not comfortable sending by email."
    )
  ).toBeVisible();

  await page.goto("/volunteer/");

  await expect(page.getByText("Privacy reminder")).toBeVisible();
  await expect(
    page.getByText("Let us know how you'd like to help and how much time you can offer.")
  ).toBeVisible();
  await expect(
    page.getByText("The optional updates box is separate from your volunteer enquiry.")
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Send volunteer enquiry" })
  ).toBeVisible();

  await page.goto("/partner/");

  await expect(page.getByText("Privacy reminder")).toBeVisible();
  await expect(
    page.getByText(
      "Tell us who you are, what kind of partnership or referral conversation this is, and what would be most useful to discuss next."
    )
  ).toBeVisible();
  await expect(
    page.getByText(
      "The optional updates box is separate from the partnership or referral enquiry."
    )
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Send partnership enquiry" })
  ).toBeVisible();

  await page.goto("/safeguarding/");

  await expect(page.getByText("Privacy reminder")).toBeVisible();
  await expect(
    page.getByText("This form does not include the optional updates box.")
  ).toBeVisible();
  await expect(
    page.getByLabel("I would like occasional updates about future sessions and events.")
  ).toHaveCount(0);
});
