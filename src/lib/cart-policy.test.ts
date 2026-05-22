import assert from "node:assert/strict";
import test from "node:test";
import {
  getCartMutationPolicyRejection,
  MAX_CART_MUTATION_BODY_BYTES,
  readCartJsonBody,
  shouldUseSecureCartCookie,
} from "./cart-policy";

test("cart mutation policy requires a JSON media type", () => {
  assert.equal(
    getCartMutationPolicyRejection(new Headers()),
    "unsupported-media-type"
  );
  assert.equal(
    getCartMutationPolicyRejection(
      new Headers({ "content-type": "text/plain", "content-length": "10" })
    ),
    "unsupported-media-type"
  );
  assert.equal(
    getCartMutationPolicyRejection(
      new Headers({ "content-type": "application/cart+json; charset=utf-8" })
    ),
    null
  );
});

test("cart mutation policy rejects declared oversized bodies", () => {
  assert.equal(
    getCartMutationPolicyRejection(
      new Headers({
        "content-type": "application/json",
        "content-length": String(MAX_CART_MUTATION_BODY_BYTES + 1),
      })
    ),
    "payload-too-large"
  );
  assert.equal(
    getCartMutationPolicyRejection(
      new Headers({
        "content-type": "application/json",
        "content-length": String(MAX_CART_MUTATION_BODY_BYTES),
      })
    ),
    null
  );
});

test("cart JSON reader bounds payloads without a declared length", async () => {
  const valid = await readCartJsonBody(
    new Request("https://example.test/api/cart", {
      method: "POST",
      body: JSON.stringify({ action: "add", productId: 1, quantity: 1 }),
    })
  );
  assert.deepEqual(valid, {
    status: "ok",
    value: { action: "add", productId: 1, quantity: 1 },
  });

  const oversized = await readCartJsonBody(
    new Request("https://example.test/api/cart", {
      method: "POST",
      body: JSON.stringify({
        padding: "x".repeat(MAX_CART_MUTATION_BODY_BYTES),
      }),
    })
  );
  assert.deepEqual(oversized, { status: "payload-too-large" });
});

test("cart cookies are secure by default in production and on Vercel", () => {
  assert.equal(shouldUseSecureCartCookie({ NODE_ENV: "development" }), false);
  assert.equal(shouldUseSecureCartCookie({ NODE_ENV: "production" }), true);
  assert.equal(
    shouldUseSecureCartCookie({
      CART_COOKIE_SECURE: "false",
      NODE_ENV: "production",
      VERCEL: "1",
    }),
    true
  );
});

test("cart cookie secure override supports local HTTP test runs", () => {
  assert.equal(
    shouldUseSecureCartCookie({
      CART_COOKIE_SECURE: "false",
      NODE_ENV: "production",
    }),
    false
  );
  assert.equal(
    shouldUseSecureCartCookie({
      CART_COOKIE_SECURE: "true",
      NODE_ENV: "development",
    }),
    true
  );
});
