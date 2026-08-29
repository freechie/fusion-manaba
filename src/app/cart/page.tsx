import Link from "next/link";
import CartLineForm from "@/components/cart/CartLineForm";
import { readCartSnapshot } from "@/lib/cart/server";

export default async function CartPage() {
  const cart = await readCartSnapshot();

  if (cart.lines.length === 0) {
    return (
      <section className="mx-auto max-w-3xl rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Your cart
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Your cart is empty.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600"
        >
          Browse baked goods
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl">
      <h1 className="mb-8 text-4xl font-bold text-gray-900 dark:text-white">
        Your cart
      </h1>
      <ul className="space-y-4">
        {cart.lines.map((line) => (
          <li
            key={line.productId}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="sm:flex sm:items-center sm:justify-between sm:gap-6">
              <div>
                <Link
                  href={`/products/${line.slug}`}
                  className="text-2xl font-semibold text-gray-900 hover:text-orange-600 dark:text-white dark:hover:text-orange-400"
                >
                  {line.name}
                </Link>
                <p className="mt-1 text-gray-600 dark:text-gray-300">
                  ${line.unitPrice} each
                </p>
                <p className="mt-2 font-semibold text-gray-900 dark:text-white">
                  Line total: ${line.lineTotal}
                </p>
              </div>
              <CartLineForm
                productId={line.productId}
                productName={line.name}
                quantity={line.quantity}
              />
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex justify-end">
        <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex justify-between text-gray-600 dark:text-gray-300">
            <span>Items</span>
            <span>{cart.unitCount}</span>
          </div>
          <div className="mt-3 flex justify-between text-2xl font-bold text-gray-900 dark:text-white">
            <span>Subtotal</span>
            <span>${cart.subtotal}</span>
          </div>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            Checkout is not implemented in this portfolio build.
          </p>
        </div>
      </div>
    </section>
  );
}
