import {
  assertNoHorizontalOverflow,
  assertVisibleFocusRing
} from "../support/assertions.mjs";
import { loginAsEditor, loginAsPublisher } from "../support/admin.mjs";
import { expect, test } from "../support/fixtures.mjs";

const expectedSurface = process.env.PLAYWRIGHT_DEPLOYMENT_SURFACE ?? "shared";

test.skip(
  expectedSurface !== "admin",
  "Admin surface isolation checks only apply to the dedicated admin deployment surface."
);

test("@admin-surface admin surface redirects root into the isolated login flow and blocks public routes", async ({
  page,
  request
}) => {
  const rootResponse = await page.goto("/", { waitUntil: "networkidle" });

  expect(
    rootResponse?.ok(),
    "Expected admin root to resolve through the login flow"
  ).toBeTruthy();
  await expect(page).toHaveURL(/\/admin\/login\//u);
  expect(rootResponse?.headers()["x-robots-tag"] ?? "").toContain("noindex");
  await expect(page.locator("html")).toHaveAttribute("data-deployment-surface", "admin");

  const contactResponse = await request.get("/contact/");
  const robotsResponse = await request.get("/robots.txt");
  const sitemapResponse = await request.get("/sitemap.xml");

  expect(contactResponse.status()).toBe(404);
  expect(await robotsResponse.text()).toContain("Disallow: /");
  expect(await sitemapResponse.text()).not.toContain("<loc>");
});

test("@admin-surface editor access stays role-gated at the server boundary", async ({
  page
}) => {
  await loginAsEditor(page);

  const reviewResponse = await page.goto("/admin/review/", { waitUntil: "networkidle" });

  expect(reviewResponse?.status(), "Expected review queue denial to return 403").toBe(
    403
  );
  await expect(page.getByText("Publisher access required")).toBeVisible();

  await page.goto("/admin/documents/home-page-default/", { waitUntil: "networkidle" });
  await expect(
    page.getByRole("button", { name: "Request review", exact: true })
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Approve" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Publish", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Revert to published" })).toHaveCount(0);
});

test.describe("@admin-surface mobile admin editing stays keyboard-safe and workflow-capable", () => {
  test.use({
    viewport: {
      width: 390,
      height: 844
    }
  });

  test("publisher can move through request-review, approve, publish, and revert on mobile", async ({
    page
  }) => {
    await loginAsPublisher(page);
    await page.goto("/admin/documents/home-page-default/", { waitUntil: "networkidle" });
    await assertNoHorizontalOverflow(page);

    const editableField = page.locator("[data-admin-field]:not([disabled])").first();

    await editableField.focus();
    await assertVisibleFocusRing(editableField);
    await editableField.fill("Admin-only mobile workflow check.");

    await page.getByRole("button", { name: "Request review", exact: true }).click();
    await expect(page.getByText("Ready for review.")).toBeVisible();

    await page.getByRole("button", { name: "Approve" }).click();
    await expect(
      page.getByText("Approved. The draft can now be published")
    ).toBeVisible();

    await page.getByRole("button", { name: "Publish", exact: true }).click();
    await expect(page.getByText("Publish intent recorded.")).toBeVisible();

    await page.getByRole("button", { name: "Revert to published" }).click();
    await expect(
      page.getByText("Draft reverted to the last published snapshot.")
    ).toBeVisible();
  });
});
