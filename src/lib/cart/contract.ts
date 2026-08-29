export const CART_COOKIE_NAME = "cart";
export const CART_COOKIE_VERSION = 1;
export const MAX_CART_ITEMS = 50;
export const MAX_ITEM_QUANTITY = 99;

const MAX_PRODUCT_ID = 2_147_483_647;

export interface StoredCartItem {
  readonly productId: number;
  readonly quantity: number;
}

export interface StoredCart {
  readonly version: typeof CART_COOKIE_VERSION;
  readonly items: readonly StoredCartItem[];
}

export interface CartLine {
  readonly productId: number;
  readonly slug: string;
  readonly name: string;
  readonly unitPrice: string;
  readonly quantity: number;
  readonly lineTotal: string;
}

export interface CartSnapshot {
  readonly lines: readonly CartLine[];
  readonly unitCount: number;
  readonly subtotal: string;
}

export type CartCommand =
  | { readonly kind: "increment"; readonly productId: number; readonly quantity: number }
  | { readonly kind: "setQuantity"; readonly productId: number; readonly quantity: number }
  | { readonly kind: "remove"; readonly productId: number };

export type CartActionState =
  | { readonly status: "idle" }
  | { readonly status: "success" }
  | {
      readonly status: "error";
      readonly code:
        | "invalid-input"
        | "product-unavailable"
        | "quantity-limit"
        | "cart-limit"
        | "unexpected";
      readonly message: string;
    };

export const INITIAL_CART_ACTION_STATE: CartActionState = { status: "idle" };
export const EMPTY_STORED_CART: StoredCart = {
  version: CART_COOKIE_VERSION,
  items: [],
};
export const EMPTY_CART_SNAPSHOT: CartSnapshot = {
  lines: [],
  unitCount: 0,
  subtotal: "0.00",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isProductId(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value > 0 &&
    value <= MAX_PRODUCT_ID
  );
}

export function isCartQuantity(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value > 0 &&
    value <= MAX_ITEM_QUANTITY
  );
}

export function parseStoredCart(value: unknown): StoredCart {
  if (
    !isRecord(value) ||
    value.version !== CART_COOKIE_VERSION ||
    !Array.isArray(value.items)
  ) {
    return EMPTY_STORED_CART;
  }

  const items: StoredCartItem[] = [];
  const productIds = new Set<number>();

  for (const item of value.items) {
    if (items.length >= MAX_CART_ITEMS) {
      break;
    }

    if (
      !isRecord(item) ||
      !isProductId(item.productId) ||
      !isCartQuantity(item.quantity) ||
      productIds.has(item.productId)
    ) {
      continue;
    }

    productIds.add(item.productId);
    items.push({ productId: item.productId, quantity: item.quantity });
  }

  return { version: CART_COOKIE_VERSION, items };
}

function parseFormInteger(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    return null;
  }

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

export function parseCartCommand(
  kind: CartCommand["kind"],
  formData: FormData
): CartCommand | null {
  const productId = parseFormInteger(formData.get("productId"));
  if (!isProductId(productId)) {
    return null;
  }

  if (kind === "remove") {
    return { kind, productId };
  }

  const quantity = parseFormInteger(formData.get("quantity"));
  if (!isCartQuantity(quantity)) {
    return null;
  }

  return { kind, productId, quantity };
}
