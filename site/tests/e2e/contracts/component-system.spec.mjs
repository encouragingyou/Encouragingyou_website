import { assertNoHorizontalOverflow, gotoRoute } from "../support/assertions.mjs";
import { waitForSupportFormReady } from "../support/forms.mjs";
import { expect, test } from "../support/fixtures.mjs";

test("component preview route exposes stable button, card, notice, accordion, and CTA states", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/system/components/");
  await assertNoHorizontalOverflow(page);

  const buttonsSection = page.locator('[data-component-preview-section="buttons"]');
  const cardsSection = page.locator('[data-component-preview-section="cards"]');
  const statesSection = page.locator('[data-component-preview-section="states"]');

  await expect(
    buttonsSection.getByRole("button", { name: "Opening message flow" })
  ).toHaveAttribute("data-button-state", "loading");
  await expect(
    buttonsSection.getByRole("button", { name: "Disabled action" })
  ).toBeDisabled();
  await expect(buttonsSection.getByRole("link", { name: "Current CTA" })).toHaveAttribute(
    "aria-current",
    "page"
  );

  await expect(cardsSection.locator('[data-card-state="selected"]')).toBeVisible();
  await expect(statesSection.locator('details[open="open"], details[open]')).toHaveCount(
    1
  );
  await expect(page.getByText("Success notice")).toBeVisible();
  await expect(page.getByText("Error notice")).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Section-level calls to action now have a shared shell."
    })
  ).toBeVisible();

  void pageIssues;
});

test("contact form exposes validation feedback and clears errors as fields recover", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/contact/");

  const form = page.locator("[data-support-form]");
  const submit = form.getByRole("button", { name: "Send message" });
  const status = form.locator("[data-form-status]");

  await waitForSupportFormReady(page, 100);
  await submit.click();

  await expect(status).toContainText(
    "Check the highlighted fields before sending your message."
  );
  await expect(form.locator("#support-name")).toBeFocused();
  await expect(form.locator('[data-field-error="name"]')).toContainText(
    "Enter the name we should use when replying."
  );
  await expect(form.locator('[data-field-error="email"]')).toContainText(
    "Enter a valid email address so we can reply."
  );
  await expect(form.locator('[data-field-error="reason"]')).toContainText(
    "Choose the type of enquiry."
  );
  await expect(form.locator('[data-field-error="message"]')).toContainText(
    "Add a little more detail so the team can route your enquiry."
  );

  await form.locator("#support-name").fill("Alex Example");
  await form.locator("#support-email").fill("alex@example.com");
  await form.locator("#support-reason").selectOption({ index: 1 });
  await form
    .locator("#support-message")
    .fill("I would like to know how to join next Saturday.");

  await expect(status).toBeHidden();
  await expect(form.locator('[data-field-error="name"]')).toBeHidden();
  await expect(form.locator('[data-field-error="email"]')).toBeHidden();
  await expect(form.locator('[data-field-error="reason"]')).toBeHidden();
  await expect(form.locator('[data-field-error="message"]')).toBeHidden();
  await expect(submit).toHaveAttribute("data-button-state", "default");

  void pageIssues;
});
