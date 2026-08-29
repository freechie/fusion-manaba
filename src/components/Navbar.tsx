import Link from "next/link";
import { readCartSnapshot } from "@/lib/cart/server";

export default async function Navbar() {
  const cart = await readCartSnapshot();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link
          href="/"
          className="text-2xl font-bold text-gray-800 dark:text-white"
        >
          Fusion Manaba
        </Link>
        <Link
          href="/cart"
          className="text-gray-600 hover:text-orange-600 dark:text-gray-300 dark:hover:text-orange-400"
        >
          Cart ({cart.unitCount})
        </Link>
      </nav>
    </header>
  );
}
