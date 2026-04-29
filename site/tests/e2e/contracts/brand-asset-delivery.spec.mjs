import { gotoRoute } from "../support/assertions.mjs";
import { expect, test } from "../support/fixtures.mjs";

test("shell brand mark serves responsive raster sources", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/");

  const headerIcon = page.locator(".site-header__brand .brand-mark__icon");
  const headerWordmark = page.locator(".site-header__brand .brand-mark__wordmark");
  const footerIcon = page.locator(".site-footer__brand .brand-mark__icon");
  const footerWordmark = page.locator(".site-footer__brand .brand-mark__wordmark");

  await expect(headerIcon).toHaveAttribute(
    "srcset",
    /encouragingyou-mark-64\.png 64w, .*encouragingyou-mark-128\.png 128w, .*encouragingyou-mark-192\.png 192w/u
  );
  await expect(headerWordmark).toHaveAttribute(
    "srcset",
    /encouragingyou-wordmark-180\.png 180w, .*encouragingyou-wordmark-360\.png 360w, .*encouragingyou-wordmark-544\.png 544w/u
  );

  await expect(
    page.locator(".site-header__brand .brand-mark__icon-frame source[type='image/webp']")
  ).toHaveAttribute("srcset", /encouragingyou-mark-64\.webp 64w/u);
  await expect(
    page.locator(
      ".site-header__brand .brand-mark__wordmark-frame source[type='image/webp']"
    )
  ).toHaveAttribute("srcset", /encouragingyou-wordmark-180\.webp 180w/u);

  await expect
    .poll(async () => headerIcon.evaluate((image) => image.currentSrc))
    .toMatch(/encouragingyou-mark-(64|128|192)\.webp$/u);
  await expect
    .poll(async () => headerWordmark.evaluate((image) => image.currentSrc))
    .toMatch(/encouragingyou-wordmark-(180|360|544)\.webp$/u);

  await expect(footerIcon).toHaveAttribute("srcset", /encouragingyou-mark-64\.png 64w/u);
  await expect(footerWordmark).toHaveAttribute(
    "srcset",
    /encouragingyou-wordmark-180\.png 180w/u
  );

  void pageIssues;
});
