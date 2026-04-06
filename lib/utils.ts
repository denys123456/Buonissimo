import { clsx } from "clsx";

import type { CartExtra } from "@/lib/types";

export function cn(...values: Array<string | false | null | undefined>) {
  return clsx(values);
}

export function formatPrice(value: number) {
  return `${value} LEI`;
}

export function calculateCartTotal(items: { price: number; quantity: number }[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function calculateExtrasTotal(extras: CartExtra[]) {
  return extras.reduce((sum, extra) => sum + extra.price, 0);
}

export function buildCartItemName(name: string, extras: CartExtra[]) {
  if (extras.length === 0) {
    return name;
  }

  return `${name} (${extras.map((extra) => extra.name).join(", ")})`;
}
