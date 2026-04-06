import { NextResponse } from "next/server";

import { buildStoredOrder, validateDeliveryDistance } from "@/lib/order-service";
import { setPendingStripeOrder } from "@/lib/orders-store";
import { buildOrderMetadata } from "@/lib/stripe-metadata";
import { getStripeServer } from "@/lib/stripe";
import type { CheckoutPayload } from "@/lib/types";
import { calculateCartTotal } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CheckoutPayload;

    if (!payload.items?.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const distanceKm = await validateDeliveryDistance(payload);
    const stripe = getStripeServer();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    if (!baseUrl) {
      throw new Error("NEXT_PUBLIC_BASE_URL is missing");
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout`,
      payment_method_types: ["card"],
      line_items: payload.items.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "ron",
          product_data: {
            name: item.name,
            description: item.weight || item.group
          },
          unit_amount: item.price * 100
        }
      })),
      customer_email: payload.customer.email,
      metadata: {
        total: String(calculateCartTotal(payload.items))
      }
    });

    const order = buildStoredOrder(payload, {
      distanceKm,
      stripeSessionId: session.id
    });
    setPendingStripeOrder(session.id, order);

    await stripe.checkout.sessions.update(session.id, {
      metadata: {
        ...session.metadata,
        ...buildOrderMetadata(order)
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create checkout session" },
      { status: 400 }
    );
  }
}
