import { gotoRoute } from "../support/assertions.mjs";
import { expect, test } from "../support/fixtures.mjs";

test("homepage emits canonical, description, and Open Graph defaults in the initial HTML", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/");

  await expect(page.locator("head link[rel='canonical']")).toHaveAttribute(
    "href",
    "https://www.encouragingyou.co.uk/"
  );
  await expect(page.locator("head meta[name='description']")).toHaveAttribute(
    "content",
    /Youth club, CV help, friendship, confidence-building, and practical next steps for young people in Rochdale/u
  );
  await expect(page.locator("head meta[property='og:title']")).toHaveAttribute(
    "content",
    /EncouragingYou \| Youth-led support in Rochdale/u
  );
  await expect(page.locator("head meta[property='og:image']")).toHaveAttribute(
    "content",
    "https://www.encouragingyou.co.uk/social/home.png"
  );
  await expect(page.locator("head meta[name='twitter:card']")).toHaveAttribute(
    "content",
    "summary_large_image"
  );

  void pageIssues;
});

test("privacy route stays linked but noindex with a self-canonical URL", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/privacy/");

  await expect(page.locator("head meta[name='robots']")).toHaveAttribute(
    "content",
    "noindex,follow"
  );
  await expect(page.locator("head link[rel='canonical']")).toHaveAttribute(
    "href",
    "https://www.encouragingyou.co.uk/privacy/"
  );
  await expect(page.locator("head meta[property='og:image']")).toHaveAttribute(
    "content",
    "https://www.encouragingyou.co.uk/social/legal.png"
  );
  await expect(
    page.getByRole("navigation", { name: "Related routes" }).getByRole("link", {
      name: "Contact the team"
    })
  ).toBeVisible();

  void pageIssues;
});

test("session detail pages keep a self-canonical URL, one H1, and contextual related links", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/sessions/cv-support/");

  await expect(page.locator("head link[rel='canonical']")).toHaveAttribute(
    "href",
    "https://www.encouragingyou.co.uk/sessions/cv-support/"
  );
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(
    page.getByRole("navigation", { name: "Related routes" }).getByRole("link", {
      name: "See the wider career support route"
    })
  ).toBeVisible();

  void pageIssues;
});

test("safeguarding route uses its own route-family preview asset while staying indexable", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/safeguarding/");

  await expect(page.locator("head meta[property='og:image']")).toHaveAttribute(
    "content",
    "https://www.encouragingyou.co.uk/social/safeguarding.png"
  );
  await expect(page.locator("head meta[name='robots']")).toHaveAttribute(
    "content",
    "index,follow"
  );
  await expect(page.locator("h1")).toHaveCount(1);

  void pageIssues;
});
