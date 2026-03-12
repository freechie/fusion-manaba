import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { Cart, CartItem } from "@/types";

const CART_COOKIE = "cart";

interface CartData {
  [productId: string]: { quantity: number; price: string };
}

async function getCartFromCookie(): Promise<CartData> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(CART_COOKIE)?.value;
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function buildCartResponse(cartData: CartData): Promise<Cart> {
  const productIds = Object.keys(cartData).map(Number);

  const products = await db.product.findMany({
    where: { id: { in: productIds } },
    include: { category: true },
  });

  const items: CartItem[] = products.map((p) => {
    const entry = cartData[String(p.id)];
    const quantity = entry?.quantity ?? 0;
    const price = p.price.toString();
    const total = (parseFloat(price) * quantity).toFixed(2);
    return {
      productId: p.id,
      name: p.name,
      price,
      quantity,
      total,
    };
  });

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items
    .reduce((sum, item) => sum + parseFloat(item.total), 0)
    .toFixed(2);

  return { items, totalPrice, totalItems };
}

export async function GET() {
  const cartData = await getCartFromCookie();
  const cart = await buildCartResponse(cartData);
  return NextResponse.json(cart);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, productId, quantity = 1 } = body;
  const cartData = await getCartFromCookie();
  const id = String(productId);

  if (action === "add") {
    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    if (cartData[id]) {
      cartData[id].quantity += quantity;
    } else {
      cartData[id] = { quantity, price: product.price.toString() };
    }
  } else if (action === "update") {
    if (cartData[id]) {
      cartData[id].quantity = quantity;
    }
  } else if (action === "remove") {
    delete cartData[id];
  }

  const cart = await buildCartResponse(cartData);
  const response = NextResponse.json(cart);
  response.cookies.set(CART_COOKIE, JSON.stringify(cartData), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return response;
}
