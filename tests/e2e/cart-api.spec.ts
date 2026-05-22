import { expect, test } from "@playwright/test";
import { testFixtures } from "../../prisma/test-fixtures";
import { MAX_CART_MUTATION_BODY_BYTES } from "../../src/lib/cart-policy";

const availableProduct = testFixtures.availableProduct;
const unavailableProduct = testFixtures.unavailableProduct;

test("cart API rejects malformed, non-JSON, and oversized mutations", async ({
  request,
}) => {
  const malformed = await request.post("/api/cart", {
    data: '{"action":"add"',
    headers: { "content-type": "application/json" },
  });
  expect(malformed.status()).toBe(400);

  const wrongContentType = await request.post("/api/cart", {
    data: JSON.stringify({
      action: "add",
      productId: availableProduct.id,
      quantity: 1,
    }),
    headers: { "content-type": "text/plain" },
  });
  expect(wrongContentType.status()).toBe(415);

  const oversized = await request.post("/api/cart", {
    data: JSON.stringify({
      action: "add",
      productId: availableProduct.id,
      quantity: 1,
      padding: "x".repeat(MAX_CART_MUTATION_BODY_BYTES),
    }),
    headers: { "content-type": "application/json" },
  });
  expect(oversized.status()).toBe(413);
});

test("cart API rejects invalid mutations and unavailable products", async ({
  request,
}) => {
  for (const data of [
    { action: "update", productId: availableProduct.id, quantity: 0 },
    { action: "add", productId: "90001", quantity: 1 },
    { action: "clear", productId: availableProduct.id },
  ]) {
    const response = await request.post("/api/cart", { data });
    expect(response.status()).toBe(400);
  }

  const unavailable = await request.post("/api/cart", {
    data: {
      action: "add",
      productId: unavailableProduct.id,
      quantity: 1,
    },
  });
  expect(unavailable.status()).toBe(404);
});

test("cart API keeps available cart totals and cookie mutations consistent", async ({
  request,
}) => {
  const added = await request.post("/api/cart", {
    data: {
      action: "add",
      productId: availableProduct.id,
      quantity: 2,
    },
  });
  expect(added.status()).toBe(200);
  await expect(added.json()).resolves.toMatchObject({
    items: [
      {
        productId: availableProduct.id,
        price: availableProduct.price,
        quantity: 2,
        total: "8.50",
      },
    ],
    totalItems: 2,
    totalPrice: "8.50",
  });

  const updated = await request.post("/api/cart", {
    data: {
      action: "update",
      productId: availableProduct.id,
      quantity: 3,
    },
  });
  expect(updated.status()).toBe(200);
  await expect(updated.json()).resolves.toMatchObject({
    items: [{ productId: availableProduct.id, quantity: 3, total: "12.75" }],
    totalItems: 3,
    totalPrice: "12.75",
  });

  const removed = await request.post("/api/cart", {
    data: { action: "remove", productId: availableProduct.id },
  });
  expect(removed.status()).toBe(200);
  await expect(removed.json()).resolves.toEqual({
    items: [],
    totalItems: 0,
    totalPrice: "0.00",
  });
});

test("cart API normalizes cookie-derived items", async ({ request }) => {
  const cookieCart = JSON.stringify({
    [availableProduct.id]: { quantity: 2 },
    [unavailableProduct.id]: { quantity: 3 },
    bad: { quantity: 1 },
    "0": { quantity: 1 },
    "5": { quantity: 999 },
  });
  const response = await request.get("/api/cart", {
    headers: { cookie: `cart=${encodeURIComponent(cookieCart)}` },
  });

  expect(response.status()).toBe(200);
  await expect(response.json()).resolves.toMatchObject({
    items: [{ productId: availableProduct.id, quantity: 2, total: "8.50" }],
    totalItems: 2,
    totalPrice: "8.50",
  });
});
