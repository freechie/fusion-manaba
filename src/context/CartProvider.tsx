"use client";

import {
  createContext,
  useState,
  useContext,
  useCallback,
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

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(emptyCart);
  const [loading, setLoading] = useState(false);

  const addItem = useCallback(async (productId: number, quantity: number) => {
    setLoading(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", productId, quantity }),
      });
      const updatedCart = await res.json();
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
        const updatedCart = await res.json();
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
      const updatedCart = await res.json();
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
