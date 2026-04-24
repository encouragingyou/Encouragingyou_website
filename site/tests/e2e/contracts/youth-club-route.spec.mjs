import {
  assertCalendarFile,
  assertLandmarkOrder,
  assertNoHorizontalOverflow,
  assertShellLandmarks,
  assertSingleH1,
  gotoRoute
} from "../support/assertions.mjs";
import { expect, test } from "../support/fixtures.mjs";

test("youth club detail route exposes first-visit reassurance, atmosphere, and truthful next steps", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/sessions/youth-club/");
  await assertNoHorizontalOverflow(page);
  await assertShellLandmarks(page);
  await assertLandmarkOrder(page);
  await assertSingleH1(
    page,
    "Youth club built around welcome, friendship, and safe space."
  );

  const main = page.locator("main");

  await expect(main.locator(".disclosure-note").first()).toHaveText(
    "Launch illustration, not participant photography."
  );
  await expect(
    main.getByText(
      "Come as you are. If a first visit feels like a big step, a young person or parent/carer can ask first."
    )
  ).toBeVisible();
  await expect(
    main.getByRole("heading", {
      name: "Make the first visit feel welcoming before anyone travels."
    })
  ).toBeVisible();
  await expect(main.getByRole("heading", { name: "When it runs" })).toBeVisible();
  await expect(main.getByRole("heading", { name: "Where it happens" })).toBeVisible();
  await expect(main.getByRole("heading", { name: "What to bring" })).toBeVisible();
  await expect(
    main.getByText("Based in Rochdale. Exact venue details are shared on enquiry.")
  ).toBeVisible();
  await expect(
    main.getByRole("heading", {
      name: "A first visit should feel welcoming, social, and easy to grow into."
    })
  ).toBeVisible();
  await expect(
    main.getByRole("heading", {
      name: "Belonging should feel possible before the first visit."
    })
  ).toBeVisible();
  await expect(
    main.getByRole("heading", {
      name: "Questions people often ask before a first visit."
    })
  ).toBeVisible();
  await expect(main.locator(".faq-item")).toHaveCount(4);
  await expect(
    main.getByText(
      "The programme page explains the broader belonging-first route across community and friendship. This session page owns the live Saturday timing, calendar file, and first-visit detail."
    )
  ).toBeVisible();
  await expect(main.getByRole("link", { name: "Ask to join" })).toHaveAttribute(
    "href",
    /\/contact\/\?context=session%3Ayouth-club#contact-form/u
  );
  await expect(main.getByRole("link", { name: "Add to calendar" })).toBeVisible();
  await expect(main.getByRole("link", { name: "See wider route" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Testimonials", exact: true })
  ).toHaveCount(0);

  void pageIssues;
});

test("youth club detail returns cleanly to the sessions hub and wider community route", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/sessions/youth-club/");

  await page
    .getByRole("navigation", { name: "Breadcrumb" })
    .getByRole("link", { name: "Sessions" })
    .click();
  await expect(page).toHaveURL(/\/sessions\/$/u);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Recurring offers that are easy to understand and easy to return to."
  );

  await gotoRoute(page, "/sessions/youth-club/");
  await page.locator("main").getByRole("link", { name: "See wider route" }).click();
  await expect(page).toHaveURL(/\/programmes\/community-friendship\/$/u);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "A welcoming space to connect, relax, and feel part of something."
  );

  void pageIssues;
});

test("sessions hub to youth club keeps calendar and ask-first support paths reachable", async ({
  page,
  request,
  pageIssues
}) => {
  await gotoRoute(page, "/sessions/");

  const youthClubCard = page.locator(".session-hub-card").filter({
    has: page.getByRole("heading", { name: "Youth club" })
  });

  await youthClubCard.getByRole("link", { name: "See details" }).click();
  await expect(page).toHaveURL(/\/sessions\/youth-club\/$/u);

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

test.describe("no-js youth club route", () => {
  test.use({ javaScriptEnabled: false });

  test("critical content, FAQ disclosure, and next-step links stay reachable without client scripting", async ({
    page,
    pageIssues
  }) => {
    await gotoRoute(page, "/sessions/youth-club/");

    const main = page.locator("main");
    const firstFaq = main.locator(".faq-item").first();

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Youth club built around welcome, friendship, and safe space."
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
