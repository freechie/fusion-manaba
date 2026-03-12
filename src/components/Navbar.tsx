"use client";

import Link from "next/link";
import { useCart } from "@/context/CartProvider";

export default function Navbar() {
  const { cart } = useCart();

  const totalItems = cart?.totalItems ?? 0;

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link
          href="/"
          className="text-2xl font-bold text-gray-800 dark:text-white"
        >
          Fusion Manaba
        </Link>
        <div>
          <p className="text-gray-600 dark:text-gray-300">
            Cart ({totalItems})
          </p>
        </div>
      </nav>
    </header>
  );
}
