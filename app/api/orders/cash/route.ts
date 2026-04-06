import { NextResponse } from "next/server";

import {
  buildStoredOrder,
  persistAndEmailOrder,
  validateDeliveryDistance
} from "@/lib/order-service";
import type { CheckoutPayload } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CheckoutPayload;

    if (!payload.items?.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const distanceKm = await validateDeliveryDistance(payload);
    const order = buildStoredOrder(payload, { distanceKm });
    await persistAndEmailOrder(order);

    return NextResponse.json({ ok: true, orderId: order.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to place order" },
      { status: 400 }
    );
  }
}
