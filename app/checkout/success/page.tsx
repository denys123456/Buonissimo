"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { useCart } from "@/components/cart-provider";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const [message, setMessage] = useState("Processing your order...");
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) {
      return;
    }

    hasProcessed.current = true;
    const cash = searchParams.get("cash");
    const sessionId = searchParams.get("session_id");

    clearCart();

    if (cash === "1") {
      setMessage("Your cash order has been placed and emailed successfully.");
      return;
    }

    if (!sessionId) {
      setMessage("Payment completed, but the session could not be verified.");
      return;
    }

    fetch(`/api/orders/confirm-stripe?session_id=${sessionId}`)
      .then(async (response) => {
        const data = (await response.json()) as { error?: string };
        if (!response.ok) {
          setMessage(data.error || "Unable to confirm the Stripe order.");
          return;
        }

        setMessage("Your card order was confirmed and emailed successfully.");
      })
      .catch(() => {
        setMessage("Payment succeeded, but order confirmation could not be completed.");
      });
  }, [clearCart, searchParams]);

  return (
    <section className="section-shell">
      <div className="mx-auto max-w-3xl rounded-[2.5rem] border border-line bg-white p-10 text-center shadow-soft">
        <p className="text-sm uppercase tracking-[0.24em] text-ink/45">Success</p>
        <h1 className="mt-4 text-5xl text-ink">Order received</h1>
        <p className="mt-5 text-lg text-ink/65">{message}</p>
        <Link href="/menu" className="premium-button mt-8">
          Back to menu
        </Link>
      </div>
    </section>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <section className="section-shell">
          <div className="mx-auto max-w-3xl rounded-[2.5rem] border border-line bg-white p-10 text-center shadow-soft">
            <p className="text-sm uppercase tracking-[0.24em] text-ink/45">Success</p>
            <h1 className="mt-4 text-5xl text-ink">Order received</h1>
            <p className="mt-5 text-lg text-ink/65">Processing your order...</p>
          </div>
        </section>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
