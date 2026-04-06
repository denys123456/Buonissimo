"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Reveal, Stagger } from "@/components/motion/reveal";
import { useCart } from "@/components/cart-provider";
import {
  extraOptions,
  getExtraLabel,
  itemSupportsExtras,
  menuCategories,
  menuItems
} from "@/lib/menu";
import { formatPrice } from "@/lib/utils";

function ExtraSelector({
  selectedExtras,
  onToggle
}: {
  selectedExtras: string[];
  onToggle: (extraId: string) => void;
}) {
  return (
    <div className="mt-4 grid gap-2">
      {extraOptions.map((extra) => {
        const checked = selectedExtras.includes(extra.id);
        const label = getExtraLabel(extra.id, extra.name);

        return (
          <label
            key={extra.id}
            className="flex cursor-pointer items-center justify-between rounded-2xl border border-line/80 bg-sand/35 px-3 py-3 text-sm text-ink/80 transition hover:border-ink"
          >
            <span>{label}</span>
            <span className="flex items-center gap-3">
              <span className="text-ink/55">+{formatPrice(extra.price)}</span>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(extra.id)}
                aria-label={label}
              />
            </span>
          </label>
        );
      })}
    </div>
  );
}

export function MenuGrid() {
  const { addItem } = useCart();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<Record<string, string[]>>({});

  return (
    <div className="space-y-16">
      {menuCategories.map((category) => {
        const items = menuItems.filter((item) => item.section === category.key);
        const grouped = Object.entries(
          items.reduce<Record<string, typeof items>>((acc, item) => {
            acc[item.group] ??= [];
            acc[item.group].push(item);
            return acc;
          }, {})
        );

        return (
          <Reveal key={category.key} id={category.key} className="scroll-mt-28">
            <div className="mb-8">
              <p className="text-sm uppercase tracking-[0.24em] text-ink/45">
                Category
              </p>
              <h2 className="mt-2 text-4xl text-ink">{category.label}</h2>
            </div>
            <Stagger className="space-y-6">
              {grouped.map(([group, groupItems]) => (
                <Reveal
                  key={group}
                  className="rounded-[2rem] border border-line/80 bg-white/90 p-6 shadow-soft backdrop-blur-sm"
                >
                  <h3 className="text-2xl text-ink">{group}</h3>
                  <div className="mt-5 divide-y divide-line">
                    {groupItems.map((item) => {
                      const supportsExtras = itemSupportsExtras(item);
                      const itemExtras = selectedExtras[item.id] ?? [];
                      const active = activeId === item.id;

                      return (
                        <div
                          key={item.id}
                          className="group flex flex-col gap-4 py-4 md:flex-row md:items-start md:justify-between"
                        >
                          <div className="max-w-xl">
                            <p className="text-lg font-medium text-ink">{item.name}</p>
                            <p className="mt-1 text-sm text-ink/55">
                              {item.weight ? item.weight : "Serving"} - {formatPrice(item.price)}
                            </p>
                            {supportsExtras ? (
                              <ExtraSelector
                                selectedExtras={itemExtras}
                                onToggle={(extraId) =>
                                  setSelectedExtras((current) => {
                                    const currentExtras = current[item.id] ?? [];
                                    const nextExtras = currentExtras.includes(extraId)
                                      ? currentExtras.filter((id) => id !== extraId)
                                      : [...currentExtras, extraId];

                                    return { ...current, [item.id]: nextExtras };
                                  })
                                }
                              />
                            ) : null}
                            {item.section === "extra" ? (
                              <p className="mt-3 text-sm text-ink/55">
                                Extras are available only as add-ons for pizzas.
                              </p>
                            ) : null}
                          </div>
                          {item.section === "extra" ? null : (
                            <button
                              type="button"
                              onClick={() => {
                                addItem(item.id, itemExtras);
                                setActiveId(item.id);
                                window.setTimeout(() => {
                                  setActiveId((current) => (current === item.id ? null : current));
                                }, 450);
                              }}
                              className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-white/90 px-4 py-2 text-sm text-ink shadow-sm transition duration-300 hover:scale-[1.02] hover:border-ink hover:shadow-soft"
                            >
                              <Plus className="h-4 w-4" />
                              {active ? "Added" : "Add to cart"}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Reveal>
              ))}
            </Stagger>
          </Reveal>
        );
      })}
    </div>
  );
}
