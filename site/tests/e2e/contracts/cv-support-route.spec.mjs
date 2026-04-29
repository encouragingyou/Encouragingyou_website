import {
  assertCalendarFile,
  assertLandmarkOrder,
  assertNoHorizontalOverflow,
  assertShellLandmarks,
  assertSingleH1,
  gotoRoute
} from "../support/assertions.mjs";
import { expect, test } from "../support/fixtures.mjs";

test("cv support detail route exposes trustworthy session detail and truthful next steps", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/sessions/cv-support/");
  await assertNoHorizontalOverflow(page);
  await assertShellLandmarks(page);
  await assertLandmarkOrder(page);
  await assertSingleH1(
    page,
    "CV support for drafts, applications, interviews, and next steps."
  );

  const main = page.locator("main");

  await expect(main.locator(".disclosure-note").first()).toHaveText(
    "Launch illustration, not participant photography."
  );
  await expect(
    main.getByRole("heading", {
      name: "Know the shape of the session before you travel."
    })
  ).toBeVisible();
  await expect(main.getByRole("heading", { name: "When it runs" })).toBeVisible();
  await expect(
    main.getByText(/CV support runs every Saturday at 16:45 for 120 minutes/u)
  ).toBeVisible();
  await expect(main.getByRole("heading", { name: "Where it happens" })).toBeVisible();
  await expect(main.getByRole("heading", { name: "What to bring" })).toBeVisible();
  await expect(
    main.getByText("Based in Rochdale. Exact venue details are shared on enquiry.")
  ).toBeVisible();
  await expect(
    main.getByRole("heading", {
      name: "Practical support focused on the next useful step."
    })
  ).toBeVisible();
  await expect(
    main.getByRole("heading", { name: "The core session promise" })
  ).toBeVisible();
  await expect(
    main.getByRole("heading", {
      name: "Keep anxiety low and the next step obvious."
    })
  ).toBeVisible();
  await expect(
    main.getByRole("heading", {
      name: "Questions people often ask before a first visit."
    })
  ).toBeVisible();
  await expect(main.locator(".faq-item")).toHaveCount(3);
  await expect(
    main.getByText("This session sits inside the wider Career Support & CV Help route.")
  ).toBeVisible();
  await expect(main.getByRole("link", { name: "Ask to join" })).toHaveAttribute(
    "href",
    /\/contact\/\?context=session%3Acv-support#contact-form/u
  );
  await expect(main.getByRole("link", { name: "Add to calendar" })).toBeVisible();
  await expect(main.getByRole("link", { name: "See wider route" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Testimonials", exact: true })
  ).toHaveCount(0);

  void pageIssues;
});

test("cv support detail returns cleanly to the sessions hub and wider career route", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/sessions/cv-support/");

  await page
    .getByRole("navigation", { name: "Breadcrumb" })
    .getByRole("link", { name: "Sessions" })
    .click();
  await expect(page).toHaveURL(/\/sessions\/$/u);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Recurring offers that are easy to understand and easy to return to."
  );

  await gotoRoute(page, "/sessions/cv-support/");
  await page.locator("main").getByRole("link", { name: "See wider route" }).click();
  await expect(page).toHaveURL(/\/programmes\/career-support-cv-help\/$/u);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Get help with CVs, applications, interviews, and next steps."
  );

  void pageIssues;
});

test("sessions hub to cv support keeps calendar and support handoffs reachable", async ({
  page,
  request,
  pageIssues
}) => {
  await gotoRoute(page, "/sessions/");

  const cvCard = page.locator(".session-hub-card").filter({
    has: page.getByRole("heading", { name: "CV support" })
  });

  await cvCard.getByRole("link", { name: "See details" }).click();
  await expect(page).toHaveURL(/\/sessions\/cv-support\/$/u);

  const calendarHref = await page
    .locator("main")
    .getByRole("link", { name: "Add to calendar" })
    .first()
    .getAttribute("href");

  await assertCalendarFile(request, calendarHref);

  await page
    .locator("main")
    .getByRole("link", { name: "Contact the team" })
    .first()
    .click();
  await expect(page).toHaveURL(/\/contact\/$/u);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "We're here to help you find the right next step."
  );

  void pageIssues;
});

test.describe("no-js cv support route", () => {
  test.use({ javaScriptEnabled: false });

  test("critical content, FAQ disclosure, and next-step links stay reachable without client scripting", async ({
    page,
    pageIssues
  }) => {
    await gotoRoute(page, "/sessions/cv-support/");

    const main = page.locator("main");
    const firstFaq = main.locator(".faq-item").first();

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "CV support for drafts, applications, interviews, and next steps."
      })
    ).toBeVisible();
    await expect(main.getByRole("heading", { name: "When it runs" })).toBeVisible();
    await expect(main.getByRole("link", { name: "Ask to join" })).toBeVisible();
    await expect(main.getByRole("link", { name: "Add to calendar" })).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Breadcrumb" }).getByText("Sessions")
    ).toBeVisible();

    await firstFaq.locator("summary").click();
    await expect(firstFaq).toHaveAttribute("open", "");

    void pageIssues;
  });
});
