"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useState } from "react";

import { MotionSection, Reveal, Stagger } from "@/components/motion/reveal";
import { useCart } from "@/components/cart-provider";
import { featuredPizzaIds, menuMap } from "@/lib/menu";
import { formatPrice } from "@/lib/utils";

export function FeaturedPizzas() {
  const { addItem } = useCart();
  const [activeId, setActiveId] = useState<string | null>(null);
  const items = featuredPizzaIds.map((id) => menuMap.get(id)).filter(Boolean);

  return (
    <MotionSection className="section-shell pt-14">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between gap-6">
          <Reveal>
            <p className="text-sm uppercase tracking-[0.24em] text-ink/45">
              Pizza recomandată
            </p>
            <h2 className="mt-3 text-4xl text-ink">Recomandate</h2>
          </Reveal>
          <Link href="/menu" className="text-sm text-ink/70 transition hover:text-ink">
            Vezi tot meniul
          </Link>
        </div>
        <Stagger className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {items.map((item) =>
            item ? (
              <Reveal
                key={item.id}
                className="group section-card relative overflow-hidden p-6 hover:scale-[1.02] hover:shadow-premium"
              >
                <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-accent/6 blur-2xl transition duration-300 group-hover:bg-accent/10" />
                <p className="text-sm uppercase tracking-[0.24em] text-ink/40">
                  {item.group}
                </p>
                <h3 className="mt-4 text-3xl text-ink">{item.name}</h3>
                <div className="mt-3 flex items-center justify-between text-sm text-ink/60">
                  <span>{item.weight}</span>
                  <span>{formatPrice(item.price)}</span>
                </div>
                <p className="mt-4 text-sm text-ink/55">
                  Extraopțiunile se aleg din meniu și pot fi schimbate direct din coș.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    addItem(item.id);
                    setActiveId(item.id);
                    window.setTimeout(() => {
                      setActiveId((current) => (current === item.id ? null : current));
                    }, 450);
                  }}
                  className="mt-8 inline-flex items-center gap-2 rounded-full border border-line bg-white/85 px-4 py-2 text-sm text-ink shadow-sm transition duration-300 hover:scale-[1.02] hover:border-ink hover:shadow-soft"
                >
                  <Plus className="h-4 w-4" />
                  {activeId === item.id ? "Adăugat" : "Adaugă în coș"}
                </button>
              </Reveal>
            ) : null
          )}
        </Stagger>
      </div>
    </MotionSection>
  );
}
