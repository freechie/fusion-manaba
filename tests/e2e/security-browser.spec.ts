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
  const availableCard = page
    .getByRole("heading", { name: availableProduct.name })
    .locator("..")
    .locator("..");
  await expect(availableCard.getByText("$12.50", { exact: true })).toBeVisible();
  await expect(page.getByText(unavailableProduct.name)).toHaveCount(0);

  await page.getByRole("link", { name: availableProduct.name }).click();
  await expect(page.getByRole("heading", { name: availableProduct.name })).toBeVisible();
  await expect(page.getByText("$12.50", { exact: true })).toBeVisible();

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

test("cart ignores malformed and unavailable cookie entries", async ({ page }) => {
  await page.goto("/");
  await page.context().addCookies([
    {
      name: "cart",
      value: JSON.stringify({
        version: 1,
        items: [
          { productId: availableProduct.id, quantity: 2 },
          { productId: unavailableProduct.id, quantity: 3 },
          { productId: "bad", quantity: 1 },
          { productId: availableProduct.id, quantity: 5 },
        ],
      }),
      url: page.url(),
    },
  ]);

  await page.reload();
  await expect(page.getByText("Cart (2)")).toBeVisible();
  await page.getByRole("link", { name: "Cart (2)" }).click();
  await expect(
    page.getByRole("link", { name: availableProduct.name })
  ).toBeVisible();
  await expect(page.getByText(unavailableProduct.name)).toHaveCount(0);
  await expect(page.getByText("Line total: $25.00")).toBeVisible();
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
