import { gotoRoute } from "../support/assertions.mjs";
import { expectNoBlockingAxeViolations } from "../support/accessibility.mjs";
import { test } from "../support/fixtures.mjs";

const accessibilitySmokeRoutes = [
  { label: "home", path: "/" },
  { label: "programmes", path: "/programmes/" },
  { label: "contact", path: "/contact/" },
  { label: "get involved", path: "/get-involved/" },
  { label: "child safeguarding", path: "/safeguarding/child/" },
  { label: "cookies", path: "/cookies/" }
];

test.describe("@a11y axe smoke coverage", () => {
  test.describe.configure({ mode: "parallel" });

  for (const route of accessibilitySmokeRoutes) {
    test(`${route.label} has no serious or critical Axe violations`, async ({
      page,
      pageIssues
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await gotoRoute(page, route.path);
      await expectNoBlockingAxeViolations(page);

      void pageIssues;
    });
  }
});
