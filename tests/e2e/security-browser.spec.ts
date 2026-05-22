import { expect, test, type Page } from "@playwright/test";
import { testFixtures } from "../../prisma/test-fixtures";

const availableProduct = testFixtures.availableProduct;
const unavailableProduct = testFixtures.unavailableProduct;

function readScriptNonce(contentSecurityPolicy: string | undefined) {
  return contentSecurityPolicy?.match(
    /script-src[^;]*'nonce-([^']+)'/
  )?.[1];
}

function cspConsoleMessages(page: Page) {
  const messages: string[] = [];

  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      /content security policy|content-security-policy/i.test(message.text())
    ) {
      messages.push(message.text());
    }
  });

  return messages;
}

test("catalog hides unavailable products and their detail page is unreachable", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: availableProduct.name })
  ).toBeVisible();
  await expect(page.getByText(unavailableProduct.name)).toHaveCount(0);

  await page.goto(`/products/${unavailableProduct.slug}`);
  await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "This page could not be found." })
  ).toBeVisible();
});

test("cart persists after browser hydration and reload", async ({ page }) => {
  await page.goto("/");

  const availableCard = page
    .getByRole("heading", { name: availableProduct.name })
    .locator("..")
    .locator("..");
  await availableCard.getByRole("button", { name: "Add item to cart" }).click();

  await expect(page.getByText("Cart (1)")).toBeVisible();
  await page.reload();
  await expect(page.getByText("Cart (1)")).toBeVisible();
});

test("failed cart adds do not show a successful add state", async ({ page }) => {
  await page.route("**/api/cart", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "test failure" }),
      });
      return;
    }

    await route.continue();
  });

  await page.goto("/");
  const addButton = page
    .getByRole("button", { name: "Add item to cart" })
    .first();
  await addButton.click();

  await expect(addButton).toContainText("Add to Cart");
  await expect(addButton).not.toContainText("Added!");
});

test("rendered pages carry rotating nonce CSP and security headers", async ({
  page,
}) => {
  const firstResponse = await page.goto("/");
  const firstHeaders = firstResponse?.headers();
  const firstCsp = firstHeaders?.["content-security-policy"];
  const firstNonce = readScriptNonce(firstCsp);

  expect(firstNonce).toBeTruthy();
  expect(firstCsp).not.toMatch(/script-src[^;]*'unsafe-inline'/);
  expect(firstHeaders?.["x-content-type-options"]).toBe("nosniff");
  expect(firstHeaders?.["x-frame-options"]).toBe("DENY");
  expect(firstHeaders?.["referrer-policy"]).toBe(
    "strict-origin-when-cross-origin"
  );
  expect(firstHeaders?.["permissions-policy"]).toBe(
    "camera=(), geolocation=(), microphone=()"
  );

  const secondResponse = await page.goto("/");
  const secondNonce = readScriptNonce(
    secondResponse?.headers()["content-security-policy"]
  );
  expect(secondNonce).toBeTruthy();
  expect(secondNonce).not.toBe(firstNonce);
});

test("catalog and cart flow has no CSP console errors", async ({ page }) => {
  const cspErrors = cspConsoleMessages(page);

  await page.goto("/");
  await page.getByRole("button", { name: "Add item to cart" }).first().click();
  await expect(page.getByText("Cart (1)")).toBeVisible();

  expect(cspErrors).toEqual([]);
});
