"use server";

import {
  parseCartCommand,
  type CartActionState,
  type CartCommand,
} from "@/lib/cart/contract";
import { executeCartCommand } from "@/lib/cart/server";

async function runCartAction(
  kind: CartCommand["kind"],
  formData: FormData
): Promise<CartActionState> {
  const command = parseCartCommand(kind, formData);
  if (!command) {
    return {
      status: "error",
      code: "invalid-input",
      message: "Enter a valid cart quantity.",
    };
  }

  try {
    return await executeCartCommand(command);
  } catch (error) {
    console.error("Cart action failed", error);
    return {
      status: "error",
      code: "unexpected",
      message: "The cart could not be updated. Try again.",
    };
  }
}

export async function addToCart(
  _previousState: CartActionState,
  formData: FormData
): Promise<CartActionState> {
  return runCartAction("increment", formData);
}

export async function setCartQuantity(
  _previousState: CartActionState,
  formData: FormData
): Promise<CartActionState> {
  return runCartAction("setQuantity", formData);
}

export async function removeFromCart(
  _previousState: CartActionState,
  formData: FormData
): Promise<CartActionState> {
  return runCartAction("remove", formData);
}
