import {
  CART_COOKIE_VERSION,
  MAX_CART_ITEMS,
  MAX_ITEM_QUANTITY,
  type CartCommand,
  type StoredCart,
} from "./contract";

export type ApplyCartCommandResult =
  | { readonly status: "ok"; readonly cart: StoredCart }
  | {
      readonly status: "error";
      readonly code: "quantity-limit" | "cart-limit";
    };

export function retainAvailableItems(
  cart: StoredCart,
  availableProductIds: ReadonlySet<number>
): StoredCart {
  return {
    version: CART_COOKIE_VERSION,
    items: cart.items.filter((item) => availableProductIds.has(item.productId)),
  };
}

export function applyCartCommand(
  cart: StoredCart,
  command: CartCommand
): ApplyCartCommandResult {
  const itemIndex = cart.items.findIndex(
    (item) => item.productId === command.productId
  );

  switch (command.kind) {
    case "increment": {
      if (itemIndex === -1) {
        if (cart.items.length >= MAX_CART_ITEMS) {
          return { status: "error", code: "cart-limit" };
        }

        return {
          status: "ok",
          cart: {
            version: CART_COOKIE_VERSION,
            items: [
              ...cart.items,
              { productId: command.productId, quantity: command.quantity },
            ],
          },
        };
      }

      const currentItem = cart.items[itemIndex];
      const quantity = currentItem.quantity + command.quantity;
      if (quantity > MAX_ITEM_QUANTITY) {
        return { status: "error", code: "quantity-limit" };
      }

      return {
        status: "ok",
        cart: {
          version: CART_COOKIE_VERSION,
          items: cart.items.map((item, index) =>
            index === itemIndex ? { ...item, quantity } : item
          ),
        },
      };
    }

    case "setQuantity":
      return {
        status: "ok",
        cart: {
          version: CART_COOKIE_VERSION,
          items: cart.items.map((item, index) =>
            index === itemIndex ? { ...item, quantity: command.quantity } : item
          ),
        },
      };

    case "remove":
      return {
        status: "ok",
        cart: {
          version: CART_COOKIE_VERSION,
          items: cart.items.filter(
            (item) => item.productId !== command.productId
          ),
        },
      };

    default: {
      const exhaustiveCommand: never = command;
      return exhaustiveCommand;
    }
  }
}
