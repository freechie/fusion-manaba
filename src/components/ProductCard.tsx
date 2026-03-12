import Link from "next/link";
import type { Product } from "@/types";
import AddToCartButton from "./AddToCartButton";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="relative bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-6 pb-20 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <Link href={`/products/${product.slug}`}>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white hover:text-orange-500 transition-colors">
          {product.name}
        </h2>
      </Link>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {product.category.name}
      </p>
      <p className="mb-6 min-h-[72px] text-gray-700 dark:text-gray-300">
        {product.description || "A delicious treat, crafted with care."}
      </p>
      <div className="text-3xl font-bold text-right text-green-700 dark:text-green-500">
        ${product.price}
      </div>

      <AddToCartButton productId={product.id} />
    </div>
  );
}
