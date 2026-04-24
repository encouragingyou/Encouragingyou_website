import { assertNoHorizontalOverflow, gotoRoute } from "../support/assertions.mjs";
import { loginAsPublisher } from "../support/admin.mjs";
import { expect, test } from "../support/fixtures.mjs";

const expectedSurface = process.env.PLAYWRIGHT_DEPLOYMENT_SURFACE ?? "shared";

test.skip(
  expectedSurface !== "admin",
  "Admin portal journeys only apply to the dedicated admin deployment surface."
);

test("@admin-surface admin dashboard requires sign-in, then stays isolated and route-led", async ({
  page,
  pageIssues
}) => {
  const response = await page.goto("/admin/", { waitUntil: "networkidle" });

  expect(response?.ok(), "Expected /admin/ redirect chain to complete").toBeTruthy();
  await expect(page).toHaveURL(/\/admin\/login\//u);

  await loginAsPublisher(page);

  const dashboardResponse = await page.reload({ waitUntil: "networkidle" });

  expect(dashboardResponse?.ok(), "Expected authenticated /admin/ to load").toBeTruthy();
  expect(dashboardResponse?.headers()["x-robots-tag"] ?? "").toContain("noindex");

  await assertNoHorizontalOverflow(page);
  await expect(
    page.getByRole("heading", { level: 1, name: "Editorial dashboard" })
  ).toBeVisible();
  await expect(
    page.getByText("This portal is invitation-only and edits text and metadata only.")
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Content groups" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Review queue" })).toBeVisible();
  await expect(page.getByText("Authenticated session")).toBeVisible();

  void pageIssues;
});

test("@admin-surface admin editor supports local draft, diff, preview, and review handoff", async ({
  page,
  pageIssues
}) => {
  await loginAsPublisher(page);
  await gotoRoute(page, "/admin/documents/home-page-default/");
  await assertNoHorizontalOverflow(page);

  const editableField = page.locator("[data-admin-field]:not([disabled])").first();

  await editableField.fill("Homepage refreshed for review queue.");
  await expect(page.getByText(/Draft saved locally/)).toBeVisible();
  await expect(page.locator("[data-diff-list]")).toContainText("After:");
  await expect(page.locator("[data-preview-list]")).toContainText(
    "Homepage refreshed for review queue."
  );

  await page.getByRole("button", { name: "Request review" }).click();
  await expect(page.getByText("Ready for review.")).toBeVisible();

  await gotoRoute(page, "/admin/review/");
  await expect(page.locator("[data-admin-review-queue]")).toContainText("Homepage");
  await expect(page.locator("[data-admin-review-queue]")).toContainText("under review");

  void pageIssues;
});
