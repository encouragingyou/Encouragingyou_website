import { gotoRoute } from "../support/assertions.mjs";
import { expect, test } from "../support/fixtures.mjs";

test("programmes overview distinguishes support pillars from live session logistics", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/programmes/");

  const main = page.locator("main");
  const pillarCards = main.locator(".programme-pillar-card");
  const liveSessionCards = main.locator(".sessions-strip .session-card");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Support that meets people where they are."
  );
  await expect(main.getByText("Programmes explain the support theme")).toBeVisible();
  await expect(
    main.getByText("Sessions show live recurring opportunities")
  ).toBeVisible();
  await expect(
    main.getByText("Contact stays available when you are unsure")
  ).toBeVisible();
  await expect(pillarCards).toHaveCount(4);
  await expect(main.getByText("Live Saturday route", { exact: true })).toHaveCount(2);
  await expect(
    main.locator(".programme-pillar-card__state .badge").filter({
      hasText: "Programme overview"
    })
  ).toHaveCount(1);
  await expect(
    main.locator(".programme-pillar-card__state .badge").filter({
      hasText: "Enquiry-led route"
    })
  ).toHaveCount(1);
  await expect(
    main.getByRole("heading", {
      name: "Some pillars already connect to recurring Saturday sessions."
    })
  ).toBeVisible();
  await expect(liveSessionCards).toHaveCount(2);
  await expect(
    main.getByRole("heading", {
      name: "The right pillar should be recognisable even if you do not already know the programme names."
    })
  ).toBeVisible();

  void pageIssues;
});

test("programmes overview bridges both live-route and enquiry-led next steps", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/programmes/");

  const careerSupportCard = page.locator(".programme-pillar-card").filter({
    has: page.getByRole("heading", { name: "Career Support & CV Help" })
  });

  await careerSupportCard.getByRole("link", { name: "See live route" }).click();
  await expect(page).toHaveURL(/\/sessions\/cv-support\/$/u);

  await gotoRoute(page, "/programmes/");

  const communitySupportCard = page.locator(".programme-pillar-card").filter({
    has: page.getByRole("heading", {
      name: /Community Support \/ Intergenerational Connection/u
    })
  });

  await communitySupportCard.getByRole("link", { name: "Get support" }).click();
  await expect(page).toHaveURL(/\/contact\/$/u);

  void pageIssues;
});
