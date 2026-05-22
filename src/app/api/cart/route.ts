import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  getAvailableProductById,
  getAvailableProductsByIds,
} from "@/lib/products";
import {
  isCartQuantity,
  MAX_CART_ITEMS,
  MAX_ITEM_QUANTITY,
  normalizeCartData,
  parseCartMutation,
  type CartData,
} from "@/lib/cart-data";
import {
  getCartMutationPolicyRejection,
  readCartJsonBody,
  shouldUseSecureCartCookie,
} from "@/lib/cart-policy";
import { Prisma } from "@/generated/prisma/client";
import type { Cart, CartItem } from "@/types";

const CART_COOKIE = "cart";

async function getCartFromCookie(): Promise<CartData> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(CART_COOKIE)?.value;
  if (!raw) return {};
  try {
    return normalizeCartData(JSON.parse(raw));
  } catch {
    return {};
  }
}

async function buildCartResponse(cartData: CartData): Promise<Cart> {
  const productIds = Object.keys(cartData).map(Number);

  const products = await getAvailableProductsByIds(productIds);
  let cartTotal = new Prisma.Decimal(0);

  const items: CartItem[] = products.map((p) => {
    const entry = cartData[String(p.id)];
    const quantity = entry?.quantity ?? 0;
    const price = p.price.toString();
    const itemTotal = p.price.mul(quantity);
    const total = itemTotal.toFixed(2);
    cartTotal = cartTotal.plus(itemTotal);

    return {
      productId: p.id,
      name: p.name,
      price,
      quantity,
      total,
    };
  });

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartTotal.toFixed(2);

  return { items, totalPrice, totalItems };
}

export async function GET() {
  const cartData = await getCartFromCookie();
  const cart = await buildCartResponse(cartData);
  return NextResponse.json(cart);
}

export async function POST(request: NextRequest) {
  const policyRejection = getCartMutationPolicyRejection(request.headers);

  if (policyRejection === "unsupported-media-type") {
    return NextResponse.json(
      { error: "Cart requests must use JSON" },
      { status: 415 }
    );
  }

  if (policyRejection === "payload-too-large") {
    return NextResponse.json(
      { error: "Cart request body is too large" },
      { status: 413 }
    );
  }

  const bodyResult = await readCartJsonBody(request);

  if (bodyResult.status === "payload-too-large") {
    return NextResponse.json(
      { error: "Cart request body is too large" },
      { status: 413 }
    );
  }

  if (bodyResult.status === "invalid-json") {
    return NextResponse.json({ error: "Invalid cart request" }, { status: 400 });
  }

  const mutation = parseCartMutation(bodyResult.value);
  if (!mutation) {
    return NextResponse.json({ error: "Invalid cart request" }, { status: 400 });
  }

  const cartData = await getCartFromCookie();
  const id = String(mutation.productId);

  if (mutation.action === "add") {
    const product = await getAvailableProductById(mutation.productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (cartData[id]) {
      const nextQuantity = cartData[id].quantity + mutation.quantity;
      if (!isCartQuantity(nextQuantity)) {
        return NextResponse.json(
          { error: `Cart item quantity cannot exceed ${MAX_ITEM_QUANTITY}` },
          { status: 400 }
        );
      }
      cartData[id].quantity = nextQuantity;
    } else {
      if (Object.keys(cartData).length >= MAX_CART_ITEMS) {
        return NextResponse.json(
          { error: `Cart cannot contain more than ${MAX_CART_ITEMS} items` },
          { status: 400 }
        );
      }
      cartData[id] = { quantity: mutation.quantity };
    }
  } else if (mutation.action === "update") {
    if (cartData[id]) {
      cartData[id].quantity = mutation.quantity;
    }
  } else {
    delete cartData[id];
  }

  const cart = await buildCartResponse(cartData);
  const response = NextResponse.json(cart);
  response.cookies.set(CART_COOKIE, JSON.stringify(cartData), {
    httpOnly: true,
    sameSite: "lax",
    secure: shouldUseSecureCartCookie(),
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return response;
}
