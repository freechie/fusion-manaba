import assert from "node:assert/strict";
import test from "node:test";
import {
  isCartQuantity,
  MAX_CART_ITEMS,
  normalizeCartData,
  parseCartMutation,
} from "./cart-data";

test("parseCartMutation defaults add quantity to one", () => {
  assert.deepEqual(parseCartMutation({ action: "add", productId: 12 }), {
    action: "add",
    productId: 12,
    quantity: 1,
  });
});

test("parseCartMutation rejects invalid actions, ids, and quantities", () => {
  assert.equal(parseCartMutation({ action: "clear", productId: 1 }), null);
  assert.equal(parseCartMutation({ action: "add", productId: "1" }), null);
  assert.equal(
    parseCartMutation({ action: "update", productId: 1, quantity: 0 }),
    null
  );
  assert.equal(
    parseCartMutation({ action: "update", productId: 1, quantity: 1.5 }),
    null
  );
});

test("parseCartMutation ignores quantity for remove", () => {
  assert.deepEqual(
    parseCartMutation({ action: "remove", productId: 9, quantity: "bad" }),
    {
      action: "remove",
      productId: 9,
    }
  );
});

test("normalizeCartData discards malformed cookie entries", () => {
  assert.deepEqual(
    normalizeCartData({
      "2": { quantity: 3, price: "ignored" },
      "0": { quantity: 1 },
      "3": { quantity: 0 },
      bad: { quantity: 1 },
      "4": null,
    }),
    {
      "2": { quantity: 3 },
    }
  );
});

test("normalizeCartData caps accepted cookie entries", () => {
  const cookieData = Object.fromEntries(
    Array.from({ length: MAX_CART_ITEMS + 1 }, (_, index) => [
      String(index + 1),
      { quantity: 1 },
    ])
  );

  assert.equal(Object.keys(normalizeCartData(cookieData)).length, MAX_CART_ITEMS);
});

test("cart quantities stay within route bounds", () => {
  assert.equal(isCartQuantity(1), true);
  assert.equal(isCartQuantity(99), true);
  assert.equal(isCartQuantity(100), false);
  assert.equal(isCartQuantity(-1), false);
});
