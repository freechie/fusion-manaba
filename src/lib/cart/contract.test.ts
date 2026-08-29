import assert from "node:assert/strict";
import test from "node:test";
import {
  CART_COOKIE_VERSION,
  MAX_CART_ITEMS,
  parseCartCommand,
  parseStoredCart,
} from "./contract";

test("parseStoredCart accepts valid versioned items in insertion order", () => {
  assert.deepEqual(
    parseStoredCart({
      version: CART_COOKIE_VERSION,
      items: [
        { productId: 12, quantity: 2 },
        { productId: 13, quantity: 1 },
      ],
    }),
    {
      version: CART_COOKIE_VERSION,
      items: [
        { productId: 12, quantity: 2 },
        { productId: 13, quantity: 1 },
      ],
    }
  );
});

test("parseStoredCart resets unknown versions and malformed roots", () => {
  assert.deepEqual(parseStoredCart(null), {
    version: CART_COOKIE_VERSION,
    items: [],
  });
  assert.deepEqual(parseStoredCart({ version: 2, items: [] }), {
    version: CART_COOKIE_VERSION,
    items: [],
  });
});

test("parseStoredCart drops invalid and duplicate entries and caps item count", () => {
  const validItems = Array.from({ length: MAX_CART_ITEMS + 5 }, (_, index) => ({
    productId: index + 1,
    quantity: 1,
  }));

  const parsed = parseStoredCart({
    version: CART_COOKIE_VERSION,
    items: [
      { productId: 1, quantity: 0 },
      { productId: "2", quantity: 1 },
      ...validItems,
      { productId: 1, quantity: 2 },
    ],
  });

  assert.equal(parsed.items.length, MAX_CART_ITEMS);
  assert.deepEqual(parsed.items[0], { productId: 1, quantity: 1 });
  assert.deepEqual(parsed.items.at(-1), {
    productId: MAX_CART_ITEMS,
    quantity: 1,
  });
});

test("parseCartCommand validates form values at the action boundary", () => {
  const increment = new FormData();
  increment.set("productId", "12");
  increment.set("quantity", "2");
  assert.deepEqual(parseCartCommand("increment", increment), {
    kind: "increment",
    productId: 12,
    quantity: 2,
  });

  const remove = new FormData();
  remove.set("productId", "12");
  assert.deepEqual(parseCartCommand("remove", remove), {
    kind: "remove",
    productId: 12,
  });

  increment.set("quantity", "100");
  assert.equal(parseCartCommand("setQuantity", increment), null);
  increment.set("productId", "12.5");
  assert.equal(parseCartCommand("increment", increment), null);
});
