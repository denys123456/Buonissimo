"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import { useCart } from "@/components/cart-provider";
import { extraOptions, getExtraLabel } from "@/lib/menu";
import { getOrderingAvailability } from "@/lib/order-hours";
import { formatPrice } from "@/lib/utils";

export function CartSummary() {
  const { items, total, incrementItem, removeItem, deleteItem, updateExtras } = useCart();
  const [availability, setAvailability] = useState(() => getOrderingAvailability());

  useEffect(() => {
    const syncAvailability = () => setAvailability(getOrderingAvailability(new Date()));

    syncAvailability();
    const interval = window.setInterval(syncAvailability, 60000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 hidden h-8 rounded-t-[2rem] bg-gradient-to-b from-[#fcfbf7] to-transparent lg:block" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 hidden h-8 rounded-b-[2rem] bg-gradient-to-t from-[#fcfbf7] to-transparent lg:block" />
      <motion.div
        layout
        className="rounded-[2rem] border border-line bg-white/92 p-6 shadow-soft backdrop-blur-sm lg:max-h-[80vh] lg:overflow-y-auto lg:scroll-smooth"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-3xl text-ink">Cos</h2>
          <span className="text-sm text-ink/55">{items.length} produse</span>
        </div>
        <div className="mt-6 space-y-4">
          {items.length === 0 ? (
            <p className="text-sm text-ink/60">
              Cosul este gol. Adauga produse din meniu pentru a continua.
            </p>
          ) : (
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.div
                  key={item.cartKey}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-3xl border border-line/80 bg-sand/35 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-base font-medium text-ink">{item.name}</p>
                      <p className="mt-1 text-sm text-ink/55">
                        {item.weight ? `${item.weight} - ` : ""}
                        {formatPrice(item.price)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteItem(item.cartKey)}
                      className="text-ink/55 transition hover:text-accent"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {item.group.includes("Pizza") ? (
                    <div className="mt-4 rounded-2xl border border-line/70 bg-white/65 p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-ink/45">
                        Extras
                      </p>
                      <div className="mt-3 grid gap-2">
                        {extraOptions.map((extra) => {
                          const checked = item.extras.some((selected) => selected.id === extra.id);
                          const label = getExtraLabel(extra.id, extra.name);

                          return (
                            <label
                              key={`${item.cartKey}-${extra.id}`}
                              className="flex cursor-pointer items-center justify-between rounded-2xl border border-line/60 bg-white px-3 py-2 text-sm text-ink/80 transition hover:border-ink"
                            >
                              <span>{label}</span>
                              <span className="flex items-center gap-3">
                                <span className="text-ink/55">+{formatPrice(extra.price)}</span>
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => {
                                    const nextExtraIds = checked
                                      ? item.extras
                                          .filter((selected) => selected.id !== extra.id)
                                          .map((selected) => selected.id)
                                      : [...item.extras.map((selected) => selected.id), extra.id];

                                    updateExtras(item.cartKey, nextExtraIds);
                                  }}
                                  aria-label={label}
                                />
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="inline-flex items-center gap-3 rounded-full border border-line bg-white px-3 py-2 shadow-sm">
                      <button
                        type="button"
                        onClick={() => removeItem(item.cartKey)}
                        className="transition hover:text-accent"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-6 text-center text-sm">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => incrementItem(item.cartKey)}
                        className="transition hover:text-accent"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm font-medium text-ink">
                      {formatPrice(item.quantity * item.price)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
        <div className="mt-6 border-t border-line pt-4">
          <div className="flex items-center justify-between text-lg text-ink">
            <span>Total</span>
            <strong>{formatPrice(total)}</strong>
          </div>
          {availability.canOrder ? (
            <Link href="/checkout" className="premium-button mt-5 flex w-full">
              Continua catre checkout
            </Link>
          ) : (
            <div className="mt-5 rounded-full bg-ink/10 px-6 py-3 text-center text-sm text-ink/55">
              Checkout indisponibil in afara programului
            </div>
          )}
          {!availability.canOrder ? (
            <p className="mt-4 text-sm text-accent">{availability.message}</p>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}
