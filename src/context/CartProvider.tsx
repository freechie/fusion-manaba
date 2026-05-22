"use client";

import {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { Cart } from "@/types";

interface CartContextType {
  cart: Cart;
  loading: boolean;
  addItem: (productId: number, quantity: number) => Promise<void>;
  updateItem: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
}

const emptyCart: Cart = { items: [], totalPrice: "0.00", totalItems: 0 };

const CartContext = createContext<CartContextType | undefined>(undefined);

function isCart(value: unknown): value is Cart {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const cart = value as Record<string, unknown>;

  return (
    Array.isArray(cart.items) &&
    typeof cart.totalPrice === "string" &&
    typeof cart.totalItems === "number"
  );
}

async function readCartResponse(response: Response): Promise<Cart> {
  if (!response.ok) {
    throw new Error(`Cart request failed with status ${response.status}`);
  }

  const cart: unknown = await response.json();
  if (!isCart(cart)) {
    throw new Error("Cart response has an invalid shape");
  }

  return cart;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(emptyCart);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadCart() {
      setLoading(true);
      try {
        const currentCart = await readCartResponse(await fetch("/api/cart"));
        if (!ignore) {
          setCart(currentCart);
        }
      } catch (error) {
        console.error("Failed to load cart", error);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void loadCart();

    return () => {
      ignore = true;
    };
  }, []);

  const addItem = useCallback(async (productId: number, quantity: number) => {
    setLoading(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", productId, quantity }),
      });
      const updatedCart = await readCartResponse(res);
      setCart(updatedCart);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateItem = useCallback(
    async (productId: number, quantity: number) => {
      setLoading(true);
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "update", productId, quantity }),
        });
        const updatedCart = await readCartResponse(res);
        setCart(updatedCart);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const removeItem = useCallback(async (productId: number) => {
    setLoading(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove", productId }),
      });
      const updatedCart = await readCartResponse(res);
      setCart(updatedCart);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <CartContext.Provider
      value={{ cart, loading, addItem, updateItem, removeItem }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
