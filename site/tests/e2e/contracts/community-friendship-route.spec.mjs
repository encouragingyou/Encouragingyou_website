import { assertNoHorizontalOverflow, gotoRoute } from "../support/assertions.mjs";
import { expect, test } from "../support/fixtures.mjs";

test("community and friendship detail route keeps the promise, handoff, and proof boundary explicit", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/programmes/community-friendship/");
  await assertNoHorizontalOverflow(page);

  const main = page.locator("main");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "A welcoming space to connect, relax, and feel part of something."
    })
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /Back to Programmes/u })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toContainText(
    "Programmes"
  );
  await expect(
    main.getByText("Launch illustration, not participant photography.", {
      exact: true
    })
  ).toBeVisible();
  await expect(main.getByText("Youth club is currently the live route")).toBeVisible();
  await expect(main.getByText("Venue details and first contact")).toBeVisible();
  await expect(
    main.getByRole("heading", {
      name: "The first experience should feel welcoming, not intimidating."
    })
  ).toBeVisible();
  await expect(main.locator(".faq-item").first()).toBeVisible();
  await expect(main.getByText("Public-proof boundary", { exact: true })).toBeVisible();
  await expect(main.getByRole("link", { name: "See live route" }).first()).toBeVisible();
  await expect(
    main.getByRole("link", { name: "Contact the team", exact: true }).first()
  ).toBeVisible();
  await expect(main.getByRole("link", { name: "Add to calendar" })).toBeVisible();

  void pageIssues;
});

test("community and friendship detail page keeps venue disclosure honest and distinct from session logistics", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/programmes/community-friendship/");

  const main = page.locator("main");

  await expect(
    main.getByText(/venue details can be shared on enquiry/u).first()
  ).toBeVisible();
  await expect(
    main.getByText(
      "The programme page explains the belonging-first offer. The youth club session page carries timings, calendar access, and first-visit logistics."
    )
  ).toBeVisible();
  await expect(
    main.getByRole("heading", {
      name: "Youth club is the clearest live expression of this programme."
    })
  ).toBeVisible();
  await expect(
    main.getByRole("link", { name: "Back to all programmes", exact: true })
  ).toBeVisible();

  void pageIssues;
});

test.describe("no-js community and friendship route", () => {
  test.use({ javaScriptEnabled: false });

  test("critical content and next-step actions stay reachable without client scripting", async ({
    page,
    pageIssues
  }) => {
    await gotoRoute(page, "/programmes/community-friendship/");

    const main = page.locator("main");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "A welcoming space to connect, relax, and feel part of something."
      })
    ).toBeVisible();
    await expect(main.locator(".faq-item").first()).toBeVisible();
    await expect(
      main.getByRole("link", { name: "See live route" }).first()
    ).toBeVisible();
    await expect(
      main.getByRole("link", { name: "Contact the team", exact: true }).first()
    ).toBeVisible();

    void pageIssues;
  });
});
