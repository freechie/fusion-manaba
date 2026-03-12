import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartProvider";

export const metadata: Metadata = {
  title: "Fusion Manaba | Home-Baked Goods",
  description: "Home-baked goods crafted with love in Ecuador",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50 dark:bg-gray-900 min-h-screen font-sans transition-colors duration-300 flex flex-col">
        <CartProvider>
          <Navbar />
          <main className="flex-grow w-full px-4 sm:px-6 lg:px-12 py-8">
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
