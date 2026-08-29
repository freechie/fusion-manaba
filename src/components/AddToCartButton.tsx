"use client";

import { useActionState } from "react";
import { addToCart } from "@/app/actions/cart";
import { INITIAL_CART_ACTION_STATE } from "@/lib/cart/contract";
import { ShoppingCart, Check, Loader2 } from "lucide-react";
import clsx from "clsx";

interface AddToCartButtonProps {
  productId: number;
}

const DEFAULT_QUANTITY = 1;

export default function AddToCartButton({ productId }: AddToCartButtonProps) {
  const [state, formAction, isPending] = useActionState(
    addToCart,
    INITIAL_CART_ACTION_STATE
  );
  const isAdded = state.status === "success" && !isPending;

  const buttonContent = {
    icon: isPending ? (
      <Loader2 size={20} className="animate-spin mr-2" />
    ) : isAdded ? (
      <Check size={20} className="mr-2" />
    ) : (
      <ShoppingCart size={20} className="mr-2" />
    ),
    text: isPending ? "Adding..." : isAdded ? "Added!" : "Add to Cart",
  };

  return (
    <form action={formAction} className="absolute bottom-4 right-6">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="quantity" value={DEFAULT_QUANTITY} />
      <button
        type="submit"
        disabled={isPending}
        className={clsx(
          "flex items-center justify-center w-40 h-11 font-semibold rounded-lg shadow-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800",
          {
            "bg-gray-400 dark:bg-gray-600 dark:text-white cursor-not-allowed":
              isPending,
            "bg-green-400 dark:bg-green-600 dark:text-white": isAdded,
            "bg-orange-400 hover:bg-orange-600 dark:bg-orange-700 dark:hover:bg-orange-800 text-white focus:ring-orange-500":
              !isPending && !isAdded,
          }
        )}
        aria-live="polite"
        aria-label={
          isPending
            ? "Adding item to cart"
            : isAdded
              ? "Item added to cart"
              : "Add item to cart"
        }
      >
        {buttonContent.icon}
        <span>{buttonContent.text}</span>
      </button>
      {state.status === "error" && !isPending ? (
        <p
          role="alert"
          className="absolute right-0 mt-1 w-56 text-right text-sm text-red-700 dark:text-red-300"
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
