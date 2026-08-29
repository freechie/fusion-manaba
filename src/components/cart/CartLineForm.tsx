"use client";

import { useActionState } from "react";
import {
  removeFromCart,
  setCartQuantity,
} from "@/app/actions/cart";
import {
  INITIAL_CART_ACTION_STATE,
  MAX_ITEM_QUANTITY,
  type CartActionState,
} from "@/lib/cart/contract";

interface CartLineFormProps {
  readonly productId: number;
  readonly productName: string;
  readonly quantity: number;
}

function CartActionMessage({ state }: { readonly state: CartActionState }) {
  if (state.status !== "error") {
    return null;
  }

  return (
    <p role="alert" className="mt-2 text-sm text-red-700 dark:text-red-300">
      {state.message}
    </p>
  );
}

export default function CartLineForm({
  productId,
  productName,
  quantity,
}: CartLineFormProps) {
  const [updateState, updateAction, updatePending] = useActionState(
    setCartQuantity,
    INITIAL_CART_ACTION_STATE
  );
  const [removeState, removeAction, removePending] = useActionState(
    removeFromCart,
    INITIAL_CART_ACTION_STATE
  );

  return (
    <div className="mt-4 sm:mt-0">
      <div className="flex flex-wrap items-end gap-3">
        <form action={updateAction} className="flex items-end gap-2">
          <input type="hidden" name="productId" value={productId} />
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Quantity
            <input
              aria-label={`Quantity for ${productName}`}
              className="mt-1 block w-20 rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              defaultValue={quantity}
              max={MAX_ITEM_QUANTITY}
              min={1}
              name="quantity"
              required
              type="number"
            />
          </label>
          <button
            type="submit"
            disabled={updatePending || removePending}
            className="rounded-md bg-gray-800 px-4 py-2 font-semibold text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-white"
          >
            {updatePending ? "Updating..." : "Update"}
          </button>
        </form>

        <form action={removeAction}>
          <input type="hidden" name="productId" value={productId} />
          <button
            type="submit"
            disabled={removePending || updatePending}
            className="rounded-md px-3 py-2 font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:text-red-300 dark:hover:bg-red-950"
          >
            {removePending ? "Removing..." : "Remove"}
          </button>
        </form>
      </div>
      <CartActionMessage state={updateState} />
      <CartActionMessage state={removeState} />
    </div>
  );
}
