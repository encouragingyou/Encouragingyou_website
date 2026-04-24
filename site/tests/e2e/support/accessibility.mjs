import AxeBuilder from "@axe-core/playwright";

import { expect } from "./fixtures.mjs";

function formatViolations(violations) {
  return violations
    .map((violation) => {
      const nodes = violation.nodes
        .map((node) => node.target.join(" "))
        .filter(Boolean)
        .join(" | ");

      return `${violation.id} (${violation.impact ?? "unknown"}): ${violation.help}${
        nodes ? ` -> ${nodes}` : ""
      }`;
    })
    .join("\n");
}

export async function expectNoBlockingAxeViolations(page, options = {}) {
  const { excludeSelectors = [] } = options;
  let axe = new AxeBuilder({ page });

  for (const selector of excludeSelectors) {
    axe = axe.exclude(selector);
  }

  const results = await axe.analyze();
  const blockingViolations = results.violations.filter((violation) =>
    ["serious", "critical"].includes(violation.impact ?? "")
  );

  expect(
    blockingViolations,
    `Expected no serious or critical Axe violations.\n${formatViolations(blockingViolations)}`
  ).toEqual([]);
}
