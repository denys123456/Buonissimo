"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

import { useCart } from "@/components/cart-provider";
import { cn } from "@/lib/utils";

const navItems: Array<{ href: Route; label: string }> = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/gallery", label: "Gallery" },
  { href: "/reviews", label: "Reviews" },
  { href: "/checkout", label: "Checkout" }
];

export function SiteHeader() {
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center">
            <Image
              src="/pics/logo.png"
              alt="Buonissimo"
              width={180}
              height={60}
              priority
              className="h-12 w-auto object-contain md:h-14"
            />
          </Link>
          <Link
            href="/checkout"
            className={cn(
              "inline-flex items-center gap-2 rounded-full border border-line bg-white/80 px-4 py-2 text-sm text-ink shadow-sm transition duration-300",
              "hover:-translate-y-0.5 hover:border-ink hover:shadow-soft"
            )}
          >
            <ShoppingBag className="h-4 w-4" />
            Cart
            <motion.span
              key={count}
              initial={{ scale: 0.8, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-full bg-sand px-2 py-0.5 text-xs text-ink"
            >
              {count}
            </motion.span>
          </Link>
        </div>
        <nav className="mt-4 flex items-center gap-5 overflow-x-auto whitespace-nowrap text-sm text-ink/80">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-ink">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
