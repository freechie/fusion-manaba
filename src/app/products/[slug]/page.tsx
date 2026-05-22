import { notFound } from "next/navigation";
import { connection } from "next/server";
import AddToCartButton from "@/components/AddToCartButton";
import { getAvailableProductBySlug } from "@/lib/products";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  await connection();

  const { slug } = await params;

  const product = await getAvailableProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="relative bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-8 pb-24 shadow-md">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          {product.category.name}
        </p>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {product.name}
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
          {product.description || "A delicious treat, crafted with care."}
        </p>
        <div className="text-4xl font-bold text-green-700 dark:text-green-500">
          ${product.price.toString()}
        </div>

        <AddToCartButton productId={product.id} />
      </div>
    </div>
  );
}
