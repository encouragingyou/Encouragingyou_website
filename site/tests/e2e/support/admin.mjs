import { adminFixtureAccounts } from "../../../src/lib/cms/admin-config.js";
import { generateTotpCode } from "../../../src/lib/cms/admin-totp.js";
import { expect } from "./fixtures.mjs";

const publisherFixture = adminFixtureAccounts.find(
  (fixture) => fixture.roleId === "publisher"
);
const editorFixture = adminFixtureAccounts.find(
  (fixture) => fixture.roleId === "client-editor"
);

async function loginAsFixture(page, fixture, roleLabel) {
  if (!fixture) {
    throw new Error(`Missing local ${roleLabel} bootstrap fixture.`);
  }

  await page.goto("/admin/", { waitUntil: "networkidle" });
  await expect(page).toHaveURL(/\/admin\/login\//u);

  await page.getByLabel("Email address").fill(fixture.email);
  await page.getByLabel("Password").fill(fixture.password);
  await page.getByRole("button", { name: "Continue to MFA" }).click();

  await expect(page).toHaveURL(/\/admin\/login\/mfa\//u);
  await page.getByLabel("Authenticator or recovery code").fill(
    generateTotpCode({
      secret: fixture.totpSecret
    })
  );
  await page.getByRole("button", { name: "Finish sign in" }).click();
  await expect(page).toHaveURL(/\/admin\/$/u);
}

export async function loginAsPublisher(page) {
  await loginAsFixture(page, publisherFixture, "publisher");
}

export async function loginAsEditor(page) {
  await loginAsFixture(page, editorFixture, "client editor");
}
