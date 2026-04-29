import {
  assertNoHorizontalOverflow,
  assertVisibleFocusRing,
  gotoRoute
} from "../support/assertions.mjs";
import { expect, test } from "../support/fixtures.mjs";

const finalQaRoutes = [
  "/",
  "/sessions/",
  "/sessions/cv-support/",
  "/sessions/youth-club/",
  "/programmes/",
  "/programmes/career-support-cv-help/",
  "/about/",
  "/get-involved/",
  "/contact/",
  "/safeguarding/"
];

const promptViewportMatrix = [
  { name: "390x844", size: { width: 390, height: 844 } },
  { name: "768x1024", size: { width: 768, height: 1024 } },
  { name: "1440x900", size: { width: 1440, height: 900 } }
];

const homeRouteCardLinks = [
  ["Join a session", "/sessions/"],
  ["Get CV help", "/programmes/career-support-cv-help/"],
  ["Visit youth club", "/sessions/youth-club/"],
  ["Programmes", "/programmes/"],
  ["About", "/about/"],
  ["Get involved", "/get-involved/"],
  ["Ask a question", "/contact/"],
  ["Safeguarding", "/safeguarding/"]
];

async function expectNoTextBoxOverlap(page) {
  const collisions = await page.locator("main").evaluate((main) => {
    const selector = [
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "p",
      "summary",
      "label",
      "a.button",
      "button",
      ".card-panel__heading",
      ".card-panel__summary",
      ".page-intro__summary",
      ".notice-block__title"
    ].join(",");
    const candidates = Array.from(main.querySelectorAll(selector));
    const isVisible = (element) => {
      if (element.closest("[hidden], [aria-hidden='true'], .u-visually-hidden")) {
        return false;
      }

      const closedDisclosure = element.closest("details:not([open])");

      if (closedDisclosure && !element.closest("summary")) {
        return false;
      }

      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      const text = (element.innerText || element.textContent || "")
        .replace(/\s+/gu, " ")
        .trim();

      return (
        text.length > 0 &&
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        rect.width > 2 &&
        rect.height > 2
      );
    };
    const elements = candidates
      .filter(isVisible)
      .filter(
        (element) =>
          !candidates.some(
            (other) => other !== element && other.contains(element) && isVisible(other)
          )
      );
    const boxes = elements.map((element) => {
      const rect = element.getBoundingClientRect();
      const text = (element.innerText || element.textContent || "")
        .replace(/\s+/gu, " ")
        .trim()
        .slice(0, 80);

      return {
        bottom: rect.bottom,
        left: rect.left,
        right: rect.right,
        text,
        top: rect.top
      };
    });
    const results = [];

    for (let index = 0; index < boxes.length; index += 1) {
      for (let compareIndex = index + 1; compareIndex < boxes.length; compareIndex += 1) {
        const a = boxes[index];
        const b = boxes[compareIndex];
        const xOverlap = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        const yOverlap = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);

        if (xOverlap > 3 && yOverlap > 3) {
          results.push(`"${a.text}" overlaps "${b.text}"`);
        }
      }
    }

    return results;
  });

  expect(collisions, "Expected visible main-content text boxes not to overlap").toEqual(
    []
  );
}

async function expectClickableRouteTargets(page) {
  const targets = await page.evaluate(() => {
    const selectors = [
      "main a.button[href]",
      "main button:not([disabled])",
      "main [data-route-card][href]",
      "main .programme-pillar-card a[href]",
      "main .session-hub-card a[href]",
      "main .safeguarding-route-card a[href]",
      "main .involvement-pathway-card a[href]"
    ];
    const elements = Array.from(
      new Set(selectors.flatMap((selector) => [...document.querySelectorAll(selector)]))
    );

    return elements
      .map((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        const text = (element.innerText || element.textContent || "")
          .replace(/\s+/gu, " ")
          .trim();

        return {
          height: rect.height,
          text,
          visible:
            text.length > 0 &&
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            rect.width > 0 &&
            rect.height > 0,
          width: rect.width
        };
      })
      .filter((target) => target.visible);
  });

  expect(
    targets.length,
    "Expected each QA route to expose clickable route targets"
  ).toBeGreaterThan(0);

  for (const target of targets) {
    expect(
      target.width,
      `Expected clickable target "${target.text}" to be at least 44px wide`
    ).toBeGreaterThanOrEqual(44);
    expect(
      target.height,
      `Expected clickable target "${target.text}" to be at least 40px tall`
    ).toBeGreaterThanOrEqual(40);
  }
}

async function expectNoUnverifiedClaims(page) {
  const findings = await page.evaluate(() => {
    const text = document.body.innerText.replace(/\s+/gu, " ");
    const checks = [
      {
        label: "public telephone link",
        match: document.querySelector("a[href^='tel:']")?.getAttribute("href") ?? null
      },
      {
        label: "public phone number",
        match: text.match(/\b(?:\+44\s?7\d{3}|0(?:1|2|3|7|8)\d{8,10})\b/u)?.[0]
      },
      {
        label: "public venue postcode",
        match: text.match(/\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/u)?.[0]
      },
      {
        label: "price claim",
        match: text.match(/£\s*\d|\b\d+\s*(?:pounds|gbp)\b/iu)?.[0]
      },
      {
        label: "exact youth age range",
        match: text.match(
          /\b(?:ages?\s*)?\d{1,2}\s*(?:-|to)\s*\d{1,2}\b|\bunder\s+18\b/iu
        )?.[0]
      },
      {
        label: "testimonial claim",
        match: text.match(
          /\btestimonials?\b|\bwhat (?:people|parents|young people) say\b/iu
        )?.[0]
      },
      {
        label: "impact statistic",
        match: text.match(
          /\b\d+\s*(?:young people|families|participants|volunteers|partners|jobs)\b/iu
        )?.[0]
      },
      {
        label: "partner logo",
        match:
          Array.from(document.querySelectorAll("img, svg"))
            .map(
              (element) =>
                `${element.getAttribute("alt") ?? ""} ${element.getAttribute("aria-label") ?? ""}`
            )
            .find(
              (label) => /\bpartner\b/iu.test(label) && !/\bEncouragingYou\b/u.test(label)
            ) ?? null
      }
    ];

    return checks
      .filter((check) => Boolean(check.match))
      .map((check) => `${check.label}: ${check.match}`);
  });

  expect(
    findings,
    "Expected no unverified phone, venue, price, age, testimonial, impact, or partner-logo claims"
  ).toEqual([]);
}

test.describe("@client-feedback final browser QA", () => {
  for (const viewport of promptViewportMatrix) {
    test(`required routes stay usable at ${viewport.name}`, async ({
      page,
      pageIssues
    }) => {
      await page.setViewportSize(viewport.size);

      for (const path of finalQaRoutes) {
        await gotoRoute(page, path);
        await assertNoHorizontalOverflow(page);
        await expectNoTextBoxOverlap(page);
        await expectClickableRouteTargets(page);
        await expectNoUnverifiedClaims(page);
      }

      void pageIssues;
    });
  }

  test("homepage route-card inventory resolves to checked internal routes", async ({
    page,
    request,
    pageIssues
  }) => {
    await gotoRoute(page, "/");

    const routeHub = page.locator('[data-home-section="route-hub"]');

    for (const [name, href] of homeRouteCardLinks) {
      const link = routeHub.getByRole("link", { exact: true, name });

      await expect(link).toHaveAttribute("href", href);

      const response = await request.get(href);

      expect(response.ok(), `Expected route card target ${href} to resolve`).toBeTruthy();
    }

    void pageIssues;
  });

  for (const path of finalQaRoutes) {
    test(`mobile primary menu opens, closes, and exposes visible focus on ${path}`, async ({
      page,
      pageIssues
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await gotoRoute(page, path);

      const toggle = page.locator("[data-nav-toggle]").first();

      for (let index = 0; index < 8; index += 1) {
        if (await toggle.evaluate((element) => element === document.activeElement)) {
          break;
        }

        await page.keyboard.press("Tab");
      }

      await expect(toggle).toBeFocused();
      await assertVisibleFocusRing(toggle);
      await toggle.click();
      await expect(toggle).toHaveAttribute("aria-expanded", "true");
      await expect(
        page.getByRole("navigation", { name: "Primary" }).getByRole("link", {
          name: "Sessions"
        })
      ).toBeVisible();

      await toggle.click();
      await expect(toggle).toHaveAttribute("aria-expanded", "false");

      void pageIssues;
    });
  }
});
