import assert from "node:assert/strict";
import test from "node:test";
import { shouldUseSecureCartCookie } from "./cart-policy";

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
