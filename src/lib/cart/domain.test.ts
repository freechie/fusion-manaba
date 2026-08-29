import assert from "node:assert/strict";
import test from "node:test";
import {
  CART_COOKIE_VERSION,
  MAX_CART_ITEMS,
  type StoredCart,
} from "./contract";
import { applyCartCommand, retainAvailableItems } from "./domain";

const oneItemCart: StoredCart = {
  version: CART_COOKIE_VERSION,
  items: [{ productId: 12, quantity: 2 }],
};

test("applyCartCommand increments existing items and appends new items", () => {
  assert.deepEqual(
    applyCartCommand(oneItemCart, {
      kind: "increment",
      productId: 12,
      quantity: 3,
    }),
    {
      status: "ok",
      cart: {
        version: CART_COOKIE_VERSION,
        items: [{ productId: 12, quantity: 5 }],
      },
    }
  );

  assert.deepEqual(
    applyCartCommand(oneItemCart, {
      kind: "increment",
      productId: 13,
      quantity: 1,
    }),
    {
      status: "ok",
      cart: {
        version: CART_COOKIE_VERSION,
        items: [
          { productId: 12, quantity: 2 },
          { productId: 13, quantity: 1 },
        ],
      },
    }
  );
});

test("applyCartCommand rejects quantity and distinct-item limit violations", () => {
  assert.deepEqual(
    applyCartCommand(oneItemCart, {
      kind: "increment",
      productId: 12,
      quantity: 98,
    }),
    { status: "error", code: "quantity-limit" }
  );

  const fullCart: StoredCart = {
    version: CART_COOKIE_VERSION,
    items: Array.from({ length: MAX_CART_ITEMS }, (_, index) => ({
      productId: index + 1,
      quantity: 1,
    })),
  };
  assert.deepEqual(
    applyCartCommand(fullCart, {
      kind: "increment",
      productId: MAX_CART_ITEMS + 1,
      quantity: 1,
    }),
    { status: "error", code: "cart-limit" }
  );

  assert.deepEqual(oneItemCart, {
    version: CART_COOKIE_VERSION,
    items: [{ productId: 12, quantity: 2 }],
  });
});

test("applyCartCommand sets quantities and removes items without mutating input", () => {
  assert.deepEqual(
    applyCartCommand(oneItemCart, {
      kind: "setQuantity",
      productId: 12,
      quantity: 5,
    }),
    {
      status: "ok",
      cart: {
        version: CART_COOKIE_VERSION,
        items: [{ productId: 12, quantity: 5 }],
      },
    }
  );
  assert.deepEqual(
    applyCartCommand(oneItemCart, { kind: "remove", productId: 12 }),
    {
      status: "ok",
      cart: { version: CART_COOKIE_VERSION, items: [] },
    }
  );
});

test("retainAvailableItems removes stale products and keeps order", () => {
  const cart: StoredCart = {
    version: CART_COOKIE_VERSION,
    items: [
      { productId: 12, quantity: 2 },
      { productId: 13, quantity: 1 },
      { productId: 14, quantity: 3 },
    ],
  };

  assert.deepEqual(retainAvailableItems(cart, new Set([14, 12])), {
    version: CART_COOKIE_VERSION,
    items: [
      { productId: 12, quantity: 2 },
      { productId: 14, quantity: 3 },
    ],
  });
});
