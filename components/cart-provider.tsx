"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { extraOptions, getExtraLabel, menuMap } from "@/lib/menu";
import type { CartItem } from "@/lib/types";
import {
  buildCartItemName,
  calculateCartTotal,
  calculateExtrasTotal
} from "@/lib/utils";

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  addItem: (id: string, extraIds?: string[]) => void;
  incrementItem: (cartKey: string) => void;
  removeItem: (cartKey: string) => void;
  deleteItem: (cartKey: string) => void;
  updateExtras: (cartKey: string, extraIds: string[]) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const storageKey = "buonissimo-cart";
const extraMap = new Map(
  extraOptions.map((item) => [
    item.id,
    {
      id: item.id,
      name: getExtraLabel(item.id, item.name),
      price: item.price
    }
  ])
);

function buildCartKey(id: string, extraIds: string[]) {
  const suffix = [...new Set(extraIds)].sort().join(",");
  return suffix ? `${id}__${suffix}` : id;
}

function resolveExtras(extraIds: string[]) {
  return [...new Set(extraIds)]
    .map((extraId) => extraMap.get(extraId))
    .filter((extra): extra is NonNullable<typeof extra> => Boolean(extra));
}

function buildCartItem(id: string, extraIds: string[], quantity = 1) {
  const product = menuMap.get(id);
  if (!product) {
    return null;
  }

  const extras = resolveExtras(extraIds);

  return {
    cartKey: buildCartKey(id, extras.map((extra) => extra.id)),
    id: product.id,
    name: buildCartItemName(product.name, extras),
    price: product.price + calculateExtrasTotal(extras),
    basePrice: product.price,
    weight: product.weight,
    quantity,
    group: product.group,
    extras
  } satisfies CartItem;
}

function normalizeCartItem(
  item: Partial<CartItem> & Pick<CartItem, "id" | "name" | "price" | "quantity" | "group">
): CartItem | null {
  const normalized = buildCartItem(
    item.id,
    item.extras?.map((extra) => extra.id) ?? [],
    item.quantity
  );

  if (!normalized) {
    return null;
  }

  if (!item.extras?.length && typeof item.basePrice !== "number") {
    return {
      ...normalized,
      cartKey: item.cartKey ?? normalized.cartKey,
      name: item.name,
      price: item.price,
      weight: item.weight
    };
  }

  return normalized;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      setHydrated(true);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as Array<
        Partial<CartItem> & Pick<CartItem, "id" | "name" | "price" | "quantity" | "group">
      >;
      const normalizedItems = parsed
        .map(normalizeCartItem)
        .filter((item): item is CartItem => item !== null);
      setItems(normalizedItems);
    } catch {
      window.localStorage.removeItem(storageKey);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [hydrated, items]);

  const value = useMemo(() => {
    const addItem = (id: string, extraIds: string[] = []) => {
      const nextItem = buildCartItem(id, extraIds);
      if (!nextItem) {
        return;
      }

      setItems((current) => {
        const existing = current.find((item) => item.cartKey === nextItem.cartKey);
        if (existing) {
          return current.map((item) =>
            item.cartKey === nextItem.cartKey
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }

        return [...current, nextItem];
      });
    };

    const incrementItem = (cartKey: string) => {
      setItems((current) =>
        current.map((item) =>
          item.cartKey === cartKey ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    };

    const removeItem = (cartKey: string) => {
      setItems((current) =>
        current.flatMap((item) => {
          if (item.cartKey !== cartKey) {
            return [item];
          }

          return item.quantity > 1 ? [{ ...item, quantity: item.quantity - 1 }] : [];
        })
      );
    };

    const deleteItem = (cartKey: string) => {
      setItems((current) => current.filter((item) => item.cartKey !== cartKey));
    };

    const updateExtras = (cartKey: string, extraIds: string[]) => {
      setItems((current) =>
        current.reduce<CartItem[]>((nextItems, item) => {
          if (item.cartKey !== cartKey) {
            nextItems.push(item);
            return nextItems;
          }

          const rebuilt = buildCartItem(item.id, extraIds, item.quantity);
          if (!rebuilt) {
            return nextItems;
          }

          const existingIndex = nextItems.findIndex(
            (currentItem) => currentItem.cartKey === rebuilt.cartKey
          );

          if (existingIndex >= 0) {
            const existingItem = nextItems[existingIndex];
            nextItems[existingIndex] = {
              ...existingItem,
              quantity: existingItem.quantity + rebuilt.quantity
            };
            return nextItems;
          }

          nextItems.push(rebuilt);
          return nextItems;
        }, [])
      );
    };

    const clearCart = () => setItems([]);

    return {
      items,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      total: calculateCartTotal(items),
      addItem,
      incrementItem,
      removeItem,
      deleteItem,
      updateExtras,
      clearCart
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
