import {
  assertClearOfStickyHeader,
  assertElementVisibleWithinViewport,
  assertNoHorizontalOverflow,
  assertVerticalOrder,
  gotoRoute,
  openPrimaryNavIfNeeded
} from "../support/assertions.mjs";
import { expect, test } from "../support/fixtures.mjs";
import { viewportMatrix } from "../support/viewports.mjs";

const sessionRoutes = [
  {
    path: "/sessions/cv-support/",
    heading: "CV support for drafts, applications, interviews, and next steps."
  },
  {
    path: "/sessions/youth-club/",
    heading: "Youth club with games, conversation, and space to join in at your pace."
  }
];

for (const viewport of viewportMatrix) {
  test.describe(viewport.name, () => {
    test.use({ viewport: viewport.size });

    test("primary navigation remains reachable from the shell", async ({
      page,
      pageIssues
    }) => {
      await gotoRoute(page, "/");
      await openPrimaryNavIfNeeded(page);

      const navigation = page.getByRole("navigation", { name: "Primary" });
      const navigationLinks = navigation.locator(".site-nav__link");

      await expect(navigationLinks).toHaveCount(8);
      await expect(navigationLinks.first()).toBeVisible();
      await expect(navigation.getByRole("link", { name: "Sessions" })).toBeVisible();
      await expect(navigation.getByRole("link", { name: "CV help" })).toBeVisible();
      await expect(navigation.getByRole("link", { name: "Youth club" })).toBeVisible();
      await expect(
        page.getByRole("link", { name: "Join a session" }).first()
      ).toBeVisible();

      void pageIssues;
    });

    test("home layout keeps the first-step CTA visible without overlap", async ({
      page,
      pageIssues
    }) => {
      await gotoRoute(page, "/");
      await assertNoHorizontalOverflow(page);

      const h1 = page.getByRole("heading", {
        level: 1,
        name: "Helping young people in Rochdale build confidence, friendships and future opportunities."
      });
      const primaryCta = page
        .locator(".home-hero__actions")
        .getByRole("link", { name: "Join a session", exact: true });

      await assertClearOfStickyHeader(page, h1);
      await assertElementVisibleWithinViewport(page, primaryCta);

      void pageIssues;
    });

    test("sessions hub keeps both recurring offers visible and readable", async ({
      page,
      pageIssues
    }) => {
      await gotoRoute(page, "/sessions/");
      await assertNoHorizontalOverflow(page);

      const h1 = page.getByRole("heading", {
        level: 1,
        name: "Recurring offers that are easy to understand and easy to return to."
      });

      await assertClearOfStickyHeader(page, h1);
      await expect(page.locator(".sessions-live-rail__item")).toHaveCount(2);
      await expect(page.getByRole("heading", { name: "CV support" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Youth club" })).toBeVisible();
      await expect(page.getByRole("link", { name: "See details" }).first()).toBeVisible();

      void pageIssues;
    });

    test("community and friendship detail keeps the main actions and reassurance surfaces accessible", async ({
      page,
      pageIssues
    }) => {
      await gotoRoute(page, "/programmes/community-friendship/");
      await assertNoHorizontalOverflow(page);

      const h1 = page.getByRole("heading", {
        level: 1,
        name: "Speak to people, join in at your pace, and feel comfortable coming back."
      });
      const primaryCta = page
        .locator("main")
        .getByRole("link", { name: "See live route" })
        .first();

      await assertClearOfStickyHeader(page, h1);
      await expect(primaryCta).toBeVisible();
      await expect(page.locator(".faq-item").first()).toBeVisible();
      await expect(
        page.getByText("Public-proof boundary", { exact: true })
      ).toBeVisible();

      void pageIssues;
    });

    test("career support detail keeps the live-route and contact actions accessible", async ({
      page,
      pageIssues
    }) => {
      await gotoRoute(page, "/programmes/career-support-cv-help/");
      await assertNoHorizontalOverflow(page);

      const h1 = page.getByRole("heading", {
        level: 1,
        name: "Get help with CVs, applications, interviews, and next steps."
      });
      const primaryCta = page
        .locator("main")
        .getByRole("link", { name: "See CV support" })
        .first();

      await assertClearOfStickyHeader(page, h1);
      await expect(primaryCta).toBeVisible();
      await expect(
        page
          .locator("main")
          .getByRole("link", { name: "Contact the team", exact: true })
          .first()
      ).toBeVisible();
      await expect(page.locator(".faq-item").first()).toBeVisible();
      await expect(
        page.getByText("Public-proof boundary", { exact: true })
      ).toBeVisible();

      void pageIssues;
    });

    test("community support detail keeps the contact-led and audience-routing actions accessible", async ({
      page,
      pageIssues
    }) => {
      await gotoRoute(
        page,
        "/programmes/community-support-intergenerational-connection/"
      );
      await assertNoHorizontalOverflow(page);

      const h1 = page.getByRole("heading", {
        level: 1,
        name: "Bringing people together across generations through support and connection."
      });
      const primaryCta = page
        .locator("main")
        .getByRole("link", { name: "Contact the team", exact: true })
        .first();

      await assertClearOfStickyHeader(page, h1);
      await expect(primaryCta).toBeVisible();
      await expect(
        page.locator("main").getByRole("link", { name: "See current sessions" }).first()
      ).toBeVisible();
      await expect(
        page.locator("main").getByRole("link", { name: "Get involved" }).first()
      ).toBeVisible();
      await expect(page.locator(".faq-item").first()).toBeVisible();
      await expect(
        page.getByText("Public-proof boundary", { exact: true })
      ).toBeVisible();

      void pageIssues;
    });

    test("personal growth detail keeps the enquiry-led actions and proof boundary accessible", async ({
      page,
      pageIssues
    }) => {
      await gotoRoute(page, "/programmes/personal-growth-life-skills/");
      await assertNoHorizontalOverflow(page);

      const h1 = page.getByRole("heading", {
        level: 1,
        name: "Practise real-life confidence, motivation, and everyday next steps."
      });
      const primaryCta = page
        .locator("main")
        .getByRole("link", { name: "Ask a question" })
        .first();

      await assertClearOfStickyHeader(page, h1);
      await expect(primaryCta).toBeVisible();
      await expect(
        page.locator("main").getByRole("link", { name: "See current sessions" }).first()
      ).toBeVisible();
      await expect(page.locator(".faq-item").first()).toBeVisible();
      await expect(
        page.getByText("Public-proof boundary", { exact: true })
      ).toBeVisible();

      void pageIssues;
    });

    for (const sessionRoute of sessionRoutes) {
      test(`${sessionRoute.path} keeps the intro, logistics, and FAQ surfaces reachable`, async ({
        page,
        pageIssues
      }) => {
        await gotoRoute(page, sessionRoute.path);
        await assertNoHorizontalOverflow(page);

        const h1 = page.getByRole("heading", { level: 1, name: sessionRoute.heading });
        const primaryCta = page.getByRole("link", { name: "Ask to join" });

        await assertClearOfStickyHeader(page, h1);
        await assertElementVisibleWithinViewport(page, primaryCta);
        await expect(
          page.locator("main").getByRole("heading", { name: "When it runs" })
        ).toBeVisible();
        await expect(
          page.locator("main").getByRole("heading", { name: "Where it happens" })
        ).toBeVisible();
        await expect(page.getByRole("link", { name: "Add to calendar" })).toBeVisible();
        await expect(
          page.locator("main").getByRole("link", { name: "Contact the team" }).first()
        ).toBeVisible();
        await expect(page.locator(".faq-item").first()).toBeVisible();

        void pageIssues;
      });
    }

    test("contact route keeps the secure enquiry surface and method cards readable", async ({
      page,
      pageIssues
    }) => {
      await gotoRoute(page, "/contact/");
      await assertNoHorizontalOverflow(page);

      const h1 = page.getByRole("heading", {
        level: 1,
        name: "We're here to help you find the right next step."
      });

      await assertClearOfStickyHeader(page, h1);
      await expect(page.locator(".contact-method-card")).toHaveCount(4);
      await expect(page.locator(".support-panel")).toBeVisible();
      await expect(page.locator("[data-support-form]")).toHaveAttribute(
        "data-delivery",
        "secure"
      );
      await expect(
        page.locator(".support-panel").getByRole("button", { name: "Send message" })
      ).toBeVisible();
      await expect(
        page.locator(".support-panel").getByRole("link", { name: "Privacy Notice" })
      ).toBeVisible();

      void pageIssues;
    });

    test("get involved hub keeps the featured pathway, secondary routes, and enquiry form intact", async ({
      page,
      pageIssues
    }) => {
      await gotoRoute(page, "/get-involved/");
      await assertNoHorizontalOverflow(page);

      const h1 = page.getByRole("heading", {
        level: 1,
        name: "Get involved in a way that works for you."
      });

      await assertClearOfStickyHeader(page, h1);
      await expect(page.getByRole("heading", { name: "Join a session" })).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Volunteer with us" })
      ).toBeVisible();
      await expect(page.getByRole("heading", { name: "Partner with us" })).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Support in another practical way" })
      ).toBeVisible();
      await expect(page.getByRole("button", { name: "Send message" })).toBeVisible();

      if (viewport.name === "mobile") {
        await assertVerticalOrder([
          h1,
          page.getByRole("heading", { name: "Join a session" }),
          page.getByRole("heading", { name: "Start with a short message" })
        ]);
      }

      void pageIssues;
    });

    test("volunteer route keeps the enquiry path, safeguarding cue, and role pathways accessible", async ({
      page,
      pageIssues
    }) => {
      await gotoRoute(page, "/volunteer/");
      await assertNoHorizontalOverflow(page);

      const h1 = page.getByRole("heading", {
        level: 1,
        name: "Volunteer in a way that feels clear, supported, and fair."
      });
      const primaryCta = page
        .locator("main")
        .getByRole("link", { name: "Send a volunteer enquiry" });

      await assertClearOfStickyHeader(page, h1);
      await expect(primaryCta).toBeVisible();
      await expect(page.locator(".involvement-role-card")).toHaveCount(3);
      await expect(
        page.getByRole("heading", {
          name: "Safeguarding is part of the route, not fine print."
        })
      ).toBeVisible();
      await expect(page.locator(".support-panel")).toBeVisible();
      await expect(
        page
          .locator(".support-panel")
          .getByRole("button", { name: "Send volunteer enquiry" })
      ).toBeVisible();

      void pageIssues;
    });

    test("partner route keeps the enquiry path, collaboration modes, and credibility boundaries accessible", async ({
      page,
      pageIssues
    }) => {
      await gotoRoute(page, "/partner/");
      await assertNoHorizontalOverflow(page);

      const h1 = page.getByRole("heading", {
        level: 1,
        name: "Start a partnership conversation that is clear, local, and proportionate."
      });
      const primaryCta = page
        .locator(".page-intro")
        .getByRole("link", { name: "Start a partnership enquiry" })
        .first();

      await assertClearOfStickyHeader(page, h1);
      await expect(primaryCta).toBeVisible();
      await expect(page.locator(".involvement-role-card")).toHaveCount(3);
      await expect(
        page.getByRole("heading", {
          name: "Public trust should come from clarity, not overclaiming."
        })
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Safe to publish now" })
      ).toBeVisible();
      await expect(page.locator(".support-panel")).toBeVisible();
      await expect(
        page
          .locator(".support-panel")
          .getByRole("button", { name: "Send partnership enquiry" })
      ).toBeVisible();

      void pageIssues;
    });

    test("safeguarding page keeps the escalation route obvious across breakpoints", async ({
      page,
      pageIssues
    }) => {
      await gotoRoute(page, "/safeguarding/");
      await assertNoHorizontalOverflow(page);

      const h1 = page.getByRole("heading", {
        level: 1,
        name: "Use the right safeguarding route quickly and clearly."
      });
      const concernCta = page
        .locator("main")
        .getByRole("link", { name: "Send a safeguarding message" });

      await assertClearOfStickyHeader(page, h1);
      await assertElementVisibleWithinViewport(page, concernCta);
      await expect(page.locator(".safeguarding-route-card")).toHaveCount(2);
      await expect(
        page
          .locator("main")
          .getByText(/call 999/u)
          .first()
      ).toBeVisible();

      void pageIssues;
    });

    test("component preview keeps reusable surfaces stable across breakpoints", async ({
      page,
      pageIssues
    }) => {
      await gotoRoute(page, "/system/components/");
      await assertNoHorizontalOverflow(page);

      await expect(
        page.getByRole("heading", {
          level: 1,
          name: "Reusable component states rendered in one stable route."
        })
      ).toBeVisible();
      await expect(
        page
          .locator('[data-component-preview-section="buttons"]')
          .getByRole("button", { name: "Opening message flow" })
      ).toBeVisible();
      await expect(
        page
          .locator('[data-component-preview-section="states"]')
          .locator('[data-field-state="invalid"]')
      ).toBeVisible();
      await expect(
        page.getByRole("heading", {
          name: "Section-level calls to action now have a shared shell."
        })
      ).toBeVisible();

      void pageIssues;
    });
  });
}
