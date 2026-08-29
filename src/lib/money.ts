import type { Prisma } from "@/generated/prisma/client";

const CURRENCY_DECIMAL_PLACES = 2;

export function formatPrice(value: Prisma.Decimal): string {
  return value.toFixed(CURRENCY_DECIMAL_PLACES);
}
