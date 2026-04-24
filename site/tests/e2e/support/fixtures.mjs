import { expect, test as base } from "@playwright/test";

const allowedConsoleErrorPatterns = [];

export const test = base.extend({
  pageIssues: async ({ page }, use) => {
    const consoleErrors = [];
    const pageErrors = [];
    const handleConsole = (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    };
    const handlePageError = (error) => {
      pageErrors.push(error.message);
    };

    page.on("console", handleConsole);
    page.on("pageerror", handlePageError);

    await use({ consoleErrors, pageErrors });

    page.off("console", handleConsole);
    page.off("pageerror", handlePageError);

    const unexpectedConsoleErrors = consoleErrors.filter(
      (entry) => !allowedConsoleErrorPatterns.some((pattern) => pattern.test(entry))
    );

    expect(unexpectedConsoleErrors, "Unexpected browser console errors").toEqual([]);
    expect(pageErrors, "Unexpected page errors").toEqual([]);
  }
});

export { expect };
