import { assertNoHorizontalOverflow, gotoRoute } from "../support/assertions.mjs";
import { expect, test } from "../support/fixtures.mjs";
import {
  expectSupportFormStatus,
  fillSupportForm,
  submitSupportForm,
  waitForSupportFormReady
} from "../support/forms.mjs";

test("safeguarding hub exposes separate child and adult routes plus the dedicated concern surface", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/safeguarding/");
  await assertNoHorizontalOverflow(page);

  const main = page.locator("main");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Use the right safeguarding route quickly and clearly."
    })
  ).toBeVisible();
  await expect(
    main.getByText("Immediate danger needs emergency services first")
  ).toBeVisible();
  await expect(main.locator(".safeguarding-route-card")).toHaveCount(2);
  await expect(
    main.getByRole("heading", { name: "Public safeguarding contact" })
  ).toBeVisible();
  await expect(
    main.getByRole("button", { name: "Send safeguarding message" })
  ).toBeVisible();
  await expect(main.locator("#support-reason")).toHaveCount(0);
  await expect(
    main.getByRole("heading", { name: "Public safeguarding proof boundary" })
  ).toBeVisible();

  void pageIssues;
});

test("child safeguarding route keeps route-specific guidance, the shared concern surface, and the safeguarding parent context", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/safeguarding/child/");
  await assertNoHorizontalOverflow(page);

  const main = page.locator("main");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Raise child safeguarding concerns clearly and without delay."
    })
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to Safeguarding" })).toBeVisible();
  await expect(main.getByRole("heading", { name: "What to do now" })).toBeVisible();
  await expect(
    main.getByRole("link", { name: "Read adult safeguarding" }).first()
  ).toBeVisible();
  await expect(main.locator("[data-support-form]")).toHaveAttribute(
    "data-delivery",
    "secure"
  );
  await expect(
    main.getByRole("button", { name: "Send safeguarding message" })
  ).toBeVisible();

  void pageIssues;
});

test("safeguarding concern form submits through the secure route and keeps the emergency boundary visible", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/safeguarding/");

  await fillSupportForm(page, {
    name: "Concerned adult",
    email: "concern@example.com",
    message:
      "I want to raise a non-emergency safeguarding concern and share the main facts clearly."
  });
  await waitForSupportFormReady(page);
  await submitSupportForm(page, "Send safeguarding message");

  await expect(page).toHaveURL(/\/safeguarding\/$/u);
  await expectSupportFormStatus(
    page,
    /Your safeguarding message is with the team\. If the risk becomes immediate, call 999 rather than waiting for a reply\. Reference EY-/u
  );
  await expect(
    page
      .locator("main")
      .getByText(/call 999 first|emergency services first/u)
      .first()
  ).toBeVisible();

  void pageIssues;
});

test.describe("no-js safeguarding routes", () => {
  test.use({ javaScriptEnabled: false });

  test("child safeguarding keeps the route guidance and secure concern shell reachable without client scripting", async ({
    page,
    pageIssues
  }) => {
    await gotoRoute(page, "/safeguarding/child/");

    const main = page.locator("main");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Raise child safeguarding concerns clearly and without delay."
      })
    ).toBeVisible();
    await expect(main.getByRole("heading", { name: "What to do now" })).toBeVisible();
    await expect(main.locator("[data-support-form]")).toHaveAttribute(
      "data-delivery",
      "secure"
    );
    await expect(main.locator('input[name="reason"][type="hidden"]')).toHaveValue(
      "safeguarding"
    );
    await expect(
      main.getByRole("button", { name: "Send safeguarding message" })
    ).toBeVisible();

    void pageIssues;
  });
});
