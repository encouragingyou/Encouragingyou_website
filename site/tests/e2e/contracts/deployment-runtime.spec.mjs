import { expect, test } from "../support/fixtures.mjs";

test("runtime surfaces local deployment metadata and a healthy release endpoint", async ({
  page,
  request
}) => {
  const expectedSurface = process.env.PLAYWRIGHT_DEPLOYMENT_SURFACE ?? "shared";
  const homeResponse = await page.goto("/", { waitUntil: "domcontentloaded" });

  expect(
    homeResponse?.ok(),
    "Expected the entry route to load successfully"
  ).toBeTruthy();
  expect(homeResponse?.headers()["x-deployment-channel"]).toBe("local");
  expect(homeResponse?.headers()["x-deployment-surface"]).toBe(expectedSurface);

  await expect(page.locator("html")).toHaveAttribute("data-deployment-channel", "local");
  await expect(page.locator("html")).toHaveAttribute(
    "data-deployment-surface",
    expectedSurface
  );
  await expect(page.locator("html")).toHaveAttribute("data-release-id", "local-dev");

  if (expectedSurface === "admin") {
    await expect(page).toHaveURL(/\/admin\/login\//u);
  }

  const health = await request.get("/api/health/");

  expect(health.ok(), "Expected the health endpoint to report success").toBeTruthy();
  expect(health.headers()["cache-control"]).toBe("no-store");
  expect(health.headers()["x-deployment-channel"]).toBe("local");
  expect(health.headers()["x-deployment-surface"]).toBe(expectedSurface);

  const body = await health.json();

  expect(body.status).toBe("ok");
  expect(body.deployment.channel).toBe("local");
  expect(body.deployment.surface).toBe(expectedSurface);
  expect(body.deployment.releaseId).toBe("local-dev");

  if (expectedSurface === "admin") {
    expect(body.surface.publicRoutesEnabled).toBe(false);
    expect(body.surface.adminRoutesEnabled).toBe(true);
    expect(body.storage.enquiryReady).toBeNull();
    expect(body.storage.analyticsReady).toBeNull();
    expect(body.storage.adminReady).toBe(true);
    expect(body.admin.portalEnabled).toBe(true);
    expect(body.admin.cryptoReady).toBe(true);
    expect(body.analytics.mode).toBe("off");
    expect(body.indexing.searchAllowed).toBe(false);
    return;
  }

  expect(body.storage.enquiryReady).toBe(true);
  expect(body.storage.analyticsReady).toBe(true);
  expect(body.analytics.mode).toBe("statistical");
  expect(body.indexing.searchAllowed).toBe(true);

  if (expectedSurface === "public") {
    expect(body.surface.publicRoutesEnabled).toBe(true);
    expect(body.surface.adminRoutesEnabled).toBe(false);
    expect(body.storage.adminReady).toBeNull();
  } else {
    expect(body.surface.publicRoutesEnabled).toBe(true);
    expect(body.surface.adminRoutesEnabled).toBe(true);
    expect(body.storage.adminReady).toBe(true);
  }
});
