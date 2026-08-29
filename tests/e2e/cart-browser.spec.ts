import { expect, test } from "@playwright/test";
import { testFixtures } from "../../prisma/test-fixtures";

const product = testFixtures.availableProduct;

test("shopper can add, update, persist, and remove a cart line", async ({
  page,
}) => {
  await page.goto("/");
  const productCard = page
    .getByRole("heading", { name: product.name })
    .locator("..")
    .locator("..");

  await productCard.getByRole("button", { name: "Add item to cart" }).click();
  await expect(page.getByRole("link", { name: "Cart (1)" })).toBeVisible();

  const cartCookie = (await page.context().cookies()).find(
    (cookie) => cookie.name === "cart"
  );
  expect(cartCookie).toMatchObject({
    httpOnly: true,
    sameSite: "Lax",
  });

  await page.getByRole("link", { name: "Cart (1)" }).click();
  await expect(page.getByRole("heading", { name: "Your cart" })).toBeVisible();
  await expect(page.getByRole("link", { name: product.name })).toBeVisible();
  await expect(page.getByText("Line total: $12.50")).toBeVisible();

  const quantity = page.getByRole("spinbutton", {
    name: `Quantity for ${product.name}`,
  });
  await quantity.fill("3");
  await page.getByRole("button", { name: "Update" }).click();

  await expect(page.getByRole("link", { name: "Cart (3)" })).toBeVisible();
  await expect(page.getByText("Line total: $37.50")).toBeVisible();
  await expect(page.getByText("$37.50", { exact: true })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("link", { name: "Cart (3)" })).toBeVisible();
  await expect(quantity).toHaveValue("3");

  await page.getByRole("button", { name: "Remove" }).click();
  await expect(page.getByText("Your cart is empty.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Cart (0)" })).toBeVisible();
});
