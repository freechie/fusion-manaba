export const MAX_CART_ITEMS = 50;
export const MAX_ITEM_QUANTITY = 99;
const MAX_PRODUCT_ID = 2_147_483_647;

export interface CartData {
  [productId: string]: { quantity: number };
}

export type CartMutation =
  | { action: "add" | "update"; productId: number; quantity: number }
  | { action: "remove"; productId: number };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isCartQuantity(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value > 0 &&
    value <= MAX_ITEM_QUANTITY
  );
}

function isProductId(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value > 0 &&
    value <= MAX_PRODUCT_ID
  );
}

export function parseCartMutation(value: unknown): CartMutation | null {
  if (!isRecord(value) || !isProductId(value.productId)) {
    return null;
  }

  if (value.action === "remove") {
    return { action: value.action, productId: value.productId };
  }

  const quantity = value.quantity ?? 1;

  if (
    (value.action !== "add" && value.action !== "update") ||
    !isCartQuantity(quantity)
  ) {
    return null;
  }

  return {
    action: value.action,
    productId: value.productId,
    quantity,
  };
}

export function normalizeCartData(value: unknown): CartData {
  if (!isRecord(value)) {
    return {};
  }

  const cartData: CartData = {};

  for (const [productId, entry] of Object.entries(value)) {
    const numericProductId = Number(productId);

    if (
      Object.keys(cartData).length >= MAX_CART_ITEMS ||
      !isProductId(numericProductId) ||
      !isRecord(entry) ||
      !isCartQuantity(entry.quantity)
    ) {
      continue;
    }

    cartData[String(numericProductId)] = { quantity: entry.quantity };
  }

  return cartData;
}
