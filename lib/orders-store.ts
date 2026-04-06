import type { StoredOrder } from "@/lib/types";

declare global {
  var __buonissimoOrders: StoredOrder[] | undefined;
  var __buonissimoPendingStripeOrders:
    | Record<string, StoredOrder>
    | undefined;
}

const orders = globalThis.__buonissimoOrders ?? [];
globalThis.__buonissimoOrders = orders;
const pendingStripeOrders = globalThis.__buonissimoPendingStripeOrders ?? {};
globalThis.__buonissimoPendingStripeOrders = pendingStripeOrders;

export function addOrder(order: StoredOrder) {
  orders.unshift(order);
}

export function listOrders() {
  return orders;
}

export function findOrderByStripeSession(sessionId: string) {
  return orders.find((order) => order.stripeSessionId === sessionId);
}

export function setPendingStripeOrder(sessionId: string, order: StoredOrder) {
  pendingStripeOrders[sessionId] = order;
}

export function getPendingStripeOrder(sessionId: string) {
  return pendingStripeOrders[sessionId];
}
