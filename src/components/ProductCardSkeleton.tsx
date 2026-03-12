export default function ProductCardSkeleton() {
  return (
    <div
      data-testid="product-card-skeleton"
      className="rounded-xl border bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800"
      role="status"
      aria-label="Loading product"
    >
      <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="mt-4 h-4 w-1/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="mt-6 h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="mt-6 h-10 w-1/3 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
    </div>
  );
}
