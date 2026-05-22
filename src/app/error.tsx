"use client";

import { useEffect } from "react";

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
      <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-6 py-8 rounded-lg max-w-md">
        <h3 className="font-bold text-2xl">Something went wrong!</h3>
        <p className="mt-2">Please try again in a moment.</p>
      </div>
    </div>
  );
}
