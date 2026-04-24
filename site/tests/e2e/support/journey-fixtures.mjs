import { randomUUID } from "node:crypto";

import { test as base, expect } from "./fixtures.mjs";

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-+|-+$/gu, "")
    .slice(0, 48);
}

export const test = base.extend({
  journeyAudit: async ({ page }, use, testInfo) => {
    const notes = [];
    const failedResponses = [];
    const handleResponse = (response) => {
      const status = response.status();
      const request = response.request();
      const resourceType = request.resourceType();

      if (status < 400 || !["document", "fetch", "xhr"].includes(resourceType)) {
        return;
      }

      failedResponses.push({
        method: request.method(),
        resourceType,
        status,
        url: response.url()
      });
    };

    page.on("response", handleResponse);

    const audit = {
      note(step, details = {}) {
        notes.push({
          at: new Date().toISOString(),
          step,
          url: page.url(),
          ...details
        });
      },
      async attachJson(name, value) {
        await testInfo.attach(name, {
          body: JSON.stringify(value, null, 2),
          contentType: "application/json"
        });
      }
    };

    await use(audit);

    page.off("response", handleResponse);

    if (testInfo.status !== testInfo.expectedStatus) {
      await testInfo.attach("journey-audit", {
        body: JSON.stringify(
          {
            failedResponses,
            notes,
            title: testInfo.title,
            url: page.url(),
            viewport: page.viewportSize()
          },
          null,
          2
        ),
        contentType: "application/json"
      });
    }
  },
  // Playwright fixtures require an object-destructuring first parameter even when no parent fixtures are needed.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  journeyData: async ({ page: _page }, use, testInfo) => {
    const nonce = `${slugify(testInfo.title) || "journey"}-${testInfo.workerIndex}-${testInfo.retry}-${randomUUID().slice(0, 8)}`;
    const label = nonce.replace(/-/gu, " ");

    await use({
      email: `journey+${nonce}@example.com`,
      name: `Journey ${label}`,
      nonce,
      message(prefix) {
        return `${prefix} [journey:${nonce}]`;
      }
    });
  }
});

export { expect };
