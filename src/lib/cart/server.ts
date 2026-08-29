import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { cookies } from "next/headers";
import { shouldUseSecureCartCookie } from "@/lib/cart-policy";
import { formatPrice } from "@/lib/money";
import { getAvailableProductsByIds } from "@/lib/products";
import {
  CART_COOKIE_NAME,
  EMPTY_CART_SNAPSHOT,
  EMPTY_STORED_CART,
  MAX_CART_ITEMS,
  MAX_ITEM_QUANTITY,
  parseStoredCart,
  type CartActionState,
  type CartCommand,
  type CartSnapshot,
  type StoredCart,
} from "./contract";
import { applyCartCommand, retainAvailableItems } from "./domain";

const CART_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function parseCartCookie(rawValue: string | undefined): StoredCart {
  if (!rawValue) {
    return EMPTY_STORED_CART;
  }

  try {
    return parseStoredCart(JSON.parse(rawValue));
  } catch {
    return EMPTY_STORED_CART;
  }
}

async function loadAvailableCartProducts(cart: StoredCart) {
  if (cart.items.length === 0) {
    return [];
  }

  return getAvailableProductsByIds(cart.items.map((item) => item.productId));
}

async function readStoredCart(): Promise<StoredCart> {
  const cookieStore = await cookies();
  return parseCartCookie(cookieStore.get(CART_COOKIE_NAME)?.value);
}

export async function readCartSnapshot(): Promise<CartSnapshot> {
  const storedCart = await readStoredCart();
  if (storedCart.items.length === 0) {
    return EMPTY_CART_SNAPSHOT;
  }

  const products = await loadAvailableCartProducts(storedCart);
  const productById = new Map(products.map((product) => [product.id, product]));
  let subtotal = new Prisma.Decimal(0);

  const lines = storedCart.items.flatMap((item) => {
    const product = productById.get(item.productId);
    if (!product) {
      return [];
    }

    const lineTotal = product.price.mul(item.quantity);
    subtotal = subtotal.plus(lineTotal);

    return [
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        unitPrice: formatPrice(product.price),
        quantity: item.quantity,
        lineTotal: formatPrice(lineTotal),
      },
    ];
  });

  return {
    lines,
    unitCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotal: formatPrice(subtotal),
  };
}

function cartCommandError(
  code: "quantity-limit" | "cart-limit"
): CartActionState {
  if (code === "quantity-limit") {
    return {
      status: "error",
      code,
      message: `Each cart item is limited to ${MAX_ITEM_QUANTITY}.`,
    };
  }

  return {
    status: "error",
    code,
    message: `The cart is limited to ${MAX_CART_ITEMS} different products.`,
  };
}

export async function executeCartCommand(
  command: CartCommand
): Promise<CartActionState> {
  const cookieStore = await cookies();
  const storedCart = parseCartCookie(cookieStore.get(CART_COOKIE_NAME)?.value);
  const productIds = new Set(storedCart.items.map((item) => item.productId));
  productIds.add(command.productId);

  const products = await getAvailableProductsByIds([...productIds]);
  const availableProductIds = new Set(products.map((product) => product.id));
  const currentCart = retainAvailableItems(storedCart, availableProductIds);

  if (
    command.kind === "increment" &&
    !availableProductIds.has(command.productId)
  ) {
    return {
      status: "error",
      code: "product-unavailable",
      message: "This product is no longer available.",
    };
  }

  const result = applyCartCommand(currentCart, command);
  if (result.status === "error") {
    return cartCommandError(result.code);
  }

  cookieStore.set(CART_COOKIE_NAME, JSON.stringify(result.cart), {
    httpOnly: true,
    sameSite: "lax",
    secure: shouldUseSecureCartCookie(),
    path: "/",
    maxAge: CART_COOKIE_MAX_AGE_SECONDS,
  });

  return { status: "success" };
}
