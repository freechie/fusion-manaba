import { db } from "@/lib/db";
import type { Product } from "@/types";
import ProductCard from "@/components/ProductCard";

export default async function HomePage() {
  const rawProducts = await db.product.findMany({
    where: { isAvailable: true },
    include: { category: true },
    orderBy: { createdAt: "asc" },
  });

  // Convert Decimal to string for serialization
  const products: Product[] = rawProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: p.price.toString(),
    isAvailable: p.isAvailable,
    category: {
      id: p.category.id,
      name: p.category.name,
      slug: p.category.slug,
    },
  }));

  return (
    <>
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-800 dark:text-gray-200">
          Fusion Manaba
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Home-Baked Goods with Love
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
}
