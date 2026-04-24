import { assertNoHorizontalOverflow, gotoRoute } from "../support/assertions.mjs";
import { expect, test } from "../support/fixtures.mjs";

test("contact route exposes decision paths, clear contact methods, and honest location handling", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/contact/");
  await assertNoHorizontalOverflow(page);

  const main = page.locator("main");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "We're here to help you find the right next step."
    })
  ).toBeVisible();
  await expect(
    main.getByRole("heading", {
      name: "Different questions deserve different first steps."
    })
  ).toBeVisible();
  await expect(main.locator(".involvement-pathway-card")).toHaveCount(4);
  await expect(
    main.getByRole("heading", {
      name: "Use the channel that matches the kind of first contact you need."
    })
  ).toBeVisible();
  await expect(main.locator(".contact-method-card")).toHaveCount(4);
  await expect(main.getByText("Public phone number not yet confirmed")).toBeVisible();
  await expect(
    main.getByRole("heading", { name: "Rochdale is the public location anchor." })
  ).toBeVisible();
  await expect(main.getByRole("heading", { name: "Contact route FAQs" })).toBeVisible();
  await expect(page.locator("main iframe")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Current page status" })).toHaveCount(0);

  void pageIssues;
});

test("contact route keeps sessions, safeguarding, and privacy close to the enquiry path", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/contact/");

  await page
    .locator("main")
    .getByRole("link", { name: "Browse live sessions" })
    .first()
    .click();
  await expect(page).toHaveURL(/\/sessions\/$/u);

  await gotoRoute(page, "/contact/");
  await page
    .locator("main")
    .getByRole("link", { name: "Read safeguarding" })
    .first()
    .click();
  await expect(page).toHaveURL(/\/safeguarding\/$/u);

  await gotoRoute(page, "/contact/");
  await page
    .locator(".support-panel")
    .getByRole("link", { name: "Privacy Notice" })
    .click();
  await expect(page).toHaveURL(/\/privacy\/$/u);

  void pageIssues;
});

test.describe("no-js contact route", () => {
  test.use({ javaScriptEnabled: false });

  test("decision cards, method cards, FAQ disclosure, and the enquiry shell stay reachable without client scripting", async ({
    page,
    pageIssues
  }) => {
    await gotoRoute(page, "/contact/");

    const main = page.locator("main");
    const firstFaq = main.locator(".faq-item").first();

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "We're here to help you find the right next step."
      })
    ).toBeVisible();
    await expect(main.locator(".involvement-pathway-card")).toHaveCount(4);
    await expect(main.locator(".contact-method-card")).toHaveCount(4);
    await expect(main.locator("#support-form, #contact-form")).toHaveCount(1);
    await expect(main.locator("[data-support-form]")).toHaveAttribute(
      "data-delivery",
      "secure"
    );
    await expect(main.locator("#support-reason").locator("option")).toHaveCount(8);

    await firstFaq.locator("summary").click();
    await expect(firstFaq).toHaveAttribute("open", "");

    void pageIssues;
  });
});
