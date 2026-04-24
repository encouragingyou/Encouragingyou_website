import { expect } from "./fixtures.mjs";

export async function fillSupportForm(
  page,
  { email, message, name, reason, updatesOptIn = false }
) {
  if (name !== undefined) {
    await page.locator("#support-name").fill(name);
  }

  if (email !== undefined) {
    await page.locator("#support-email").fill(email);
  }

  if (reason !== undefined) {
    await page.locator("#support-reason").selectOption(reason);
  }

  if (message !== undefined) {
    await page.locator("#support-message").fill(message);
  }

  const updates = page.locator("#support-updates");

  if (updatesOptIn !== undefined && (await updates.count()) > 0) {
    if (updatesOptIn) {
      await updates.check();
    } else {
      await updates.uncheck();
    }
  }
}

export async function fillSupportFormWithKeyboard(
  page,
  { email, message, name, updatesOptIn }
) {
  if (name !== undefined) {
    await page.locator("#support-name").focus();
    await page.keyboard.type(name);
  }

  if (email !== undefined) {
    await page.locator("#support-email").focus();
    await page.keyboard.type(email);
  }

  if (message !== undefined) {
    await page.locator("#support-message").focus();
    await page.keyboard.type(message);
  }

  const updates = page.locator("#support-updates");

  if (updatesOptIn !== undefined && (await updates.count()) > 0) {
    await updates.focus();

    const isChecked = await updates.isChecked();

    if (isChecked !== updatesOptIn) {
      await updates.press("Space");
    }
  }
}

export async function waitForSupportFormReady(page, minimumAgeMs = 900) {
  try {
    await page.waitForFunction(
      (requiredAge) => {
        const renderedAtField = document.querySelector('input[name="renderedAt"]');

        if (!(renderedAtField instanceof HTMLInputElement)) {
          return false;
        }

        const renderedAt = Date.parse(renderedAtField.value);

        if (Number.isNaN(renderedAt)) {
          return false;
        }

        return Date.now() - renderedAt >= requiredAge;
      },
      minimumAgeMs,
      {
        timeout: minimumAgeMs + 2_000
      }
    );
  } catch {
    await page.waitForTimeout(minimumAgeMs);
  }
}

export async function submitSupportForm(page, submitLabel = "Send message") {
  const submitButton = page.getByRole("button", { name: submitLabel });

  await submitButton.evaluate((element) => {
    element.scrollIntoView({
      block: "center",
      inline: "nearest"
    });
  });

  try {
    await submitButton.click();
  } catch {
    await submitButton.focus();
    await submitButton.press("Enter");
  }
}

export async function expectSupportFormStatus(page, message) {
  await expect(page.locator("[data-form-status]")).toContainText(message);
}
