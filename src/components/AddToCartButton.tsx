"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartProvider";
import { ShoppingCart, Check, Loader2 } from "lucide-react";
import clsx from "clsx";

interface AddToCartButtonProps {
  productId: number;
}

const ADDED_STATE_TIMEOUT_MS = 2000;
const DEFAULT_QUANTITY = 1;

export default function AddToCartButton({ productId }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (!isAdded) return;
    const timerId = setTimeout(() => setIsAdded(false), ADDED_STATE_TIMEOUT_MS);
    return () => clearTimeout(timerId);
  }, [isAdded]);

  const handleClick = async () => {
    if (isLoading || isAdded) return;
    setIsLoading(true);
    try {
      await addItem(productId, DEFAULT_QUANTITY);
      setIsAdded(true);
    } catch (error) {
      console.error("Failed to add item to cart", error);
    } finally {
      setIsLoading(false);
    }
  };

  const buttonContent = {
    icon: isLoading ? (
      <Loader2 size={20} className="animate-spin mr-2" />
    ) : isAdded ? (
      <Check size={20} className="mr-2" />
    ) : (
      <ShoppingCart size={20} className="mr-2" />
    ),
    text: isLoading ? "Adding..." : isAdded ? "Added!" : "Add to Cart",
  };

  return (
    <div className="absolute bottom-6 right-6">
      <button
        onClick={handleClick}
        disabled={isLoading || isAdded}
        className={clsx(
          "flex items-center justify-center w-40 h-11 font-semibold rounded-lg shadow-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800",
          {
            "bg-gray-400 dark:bg-gray-600 dark:text-white cursor-not-allowed":
              isLoading,
            "bg-green-400 dark:bg-green-600 dark:text-white": isAdded,
            "bg-orange-400 hover:bg-orange-600 dark:bg-orange-700 dark:hover:bg-orange-800 text-white focus:ring-orange-500":
              !isLoading && !isAdded,
          }
        )}
        aria-live="polite"
        aria-label={isAdded ? "Item added to cart" : "Add item to cart"}
      >
        {buttonContent.icon}
        <span>{buttonContent.text}</span>
      </button>
    </div>
  );
}
