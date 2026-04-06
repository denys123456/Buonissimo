import type { Metadata } from "next";

import { CartProvider } from "@/components/cart-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { business } from "@/lib/business";

import "./globals.css";

export const metadata: Metadata = {
  title: business.name,
  description: `${business.name} ordering website with premium UI, delivery validation, and secure checkout.`
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FCFBF7] font-sans text-ink antialiased">
        <CartProvider>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  );
}
