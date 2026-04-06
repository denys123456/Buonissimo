import { NextResponse } from "next/server";

import { finalizeStripeOrder } from "@/lib/order-service";
import { getPendingStripeOrder } from "@/lib/orders-store";
import { readOrderMetadata } from "@/lib/stripe-metadata";
import { getStripeServer } from "@/lib/stripe";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json({ error: "Missing Stripe session id" }, { status: 400 });
    }

    const stripe = getStripeServer();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment has not been completed" }, { status: 400 });
    }

    const order = readOrderMetadata(session.metadata) ?? getPendingStripeOrder(sessionId);
    if (!order) {
      return NextResponse.json(
        { error: "Order data is not available for this session" },
        { status: 400 }
      );
    }

    await finalizeStripeOrder(order);

    return NextResponse.json({ ok: true, orderId: order.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to confirm the order" },
      { status: 400 }
    );
  }
}
