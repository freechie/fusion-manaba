import assert from "node:assert/strict";
import test from "node:test";
import { Prisma } from "@/generated/prisma/client";
import { formatPrice } from "./money";

test("formatPrice always returns two decimal places", () => {
  assert.equal(formatPrice(new Prisma.Decimal("12.5")), "12.50");
  assert.equal(formatPrice(new Prisma.Decimal("12")), "12.00");
  assert.equal(formatPrice(new Prisma.Decimal("4.25")), "4.25");
});
