import { randomUUID } from "crypto";

import { business } from "@/lib/business";
import { haversineDistanceKm } from "@/lib/delivery";
import { sendOrderEmail } from "@/lib/email";
import { geocodeAddress } from "@/lib/geocode";
import { addOrder, findOrderByStripeSession } from "@/lib/orders-store";
import type { CheckoutPayload, StoredOrder } from "@/lib/types";
import { calculateCartTotal } from "@/lib/utils";

export async function validateDeliveryDistance(payload: CheckoutPayload) {
  if (payload.fulfillmentMethod !== "delivery") {
    return undefined;
  }

  if (!payload.customer.address.trim()) {
    throw new Error("Delivery address is required");
  }

  const customerLocation = await geocodeAddress(payload.customer.address);
  const distanceKm = haversineDistanceKm(business.location, customerLocation);

  if (distanceKm > business.deliveryRadiusKm) {
    throw new Error("Delivery not available in your area (out of range)");
  }

  return Number(distanceKm.toFixed(2));
}

export function buildStoredOrder(
  payload: CheckoutPayload,
  options: { distanceKm?: number; stripeSessionId?: string }
): StoredOrder {
  return {
    ...payload,
    id: randomUUID(),
    total: calculateCartTotal(payload.items),
    createdAt: new Date().toISOString(),
    paymentLabel: payload.paymentMethod === "card" ? "Card (Stripe)" : "Cash",
    distanceKm: options.distanceKm,
    stripeSessionId: options.stripeSessionId
  };
}

export async function persistAndEmailOrder(order: StoredOrder) {
  addOrder(order);
  await sendOrderEmail(order);
  return order;
}

export async function finalizeStripeOrder(order: StoredOrder) {
  const existing = order.stripeSessionId
    ? findOrderByStripeSession(order.stripeSessionId)
    : undefined;

  if (existing) {
    return existing;
  }

  return persistAndEmailOrder(order);
}
