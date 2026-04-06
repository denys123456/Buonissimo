import { Resend } from "resend";

import { business } from "@/lib/business";
import type { StoredOrder } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

export async function sendOrderEmail(order: StoredOrder) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const to = process.env.ORDER_NOTIFICATION_EMAIL;
  const from = process.env.ORDER_FROM_EMAIL;

  if (!resendApiKey || !to || !from) {
    throw new Error("Email configuration is incomplete");
  }

  const resend = new Resend(resendApiKey);
  const lines = order.items
    .map((item) => `- ${item.name} x${item.quantity} - ${formatPrice(item.price * item.quantity)}`)
    .join("<br />");

  await resend.emails.send({
    from,
    to,
    subject: `New order - ${business.name}`,
    html: `
      <div style="font-family:Arial,sans-serif;padding:24px;line-height:1.6;color:#111">
        <h2 style="margin:0 0 16px">New order from ${business.name}</h2>
        <p><strong>Customer name:</strong> ${order.customer.name}</p>
        <p><strong>Phone:</strong> ${order.customer.phone}</p>
        <p><strong>Address:</strong> ${order.customer.address || "Pickup"}</p>
        <p><strong>Payment method:</strong> ${order.paymentLabel}</p>
        <p><strong>Delivery or Pickup:</strong> ${order.fulfillmentMethod === "delivery" ? "Delivery" : "Pickup"}</p>
        <p><strong>Total price:</strong> ${formatPrice(order.total)}</p>
        <div style="margin-top:16px">
          <strong>Products ordered:</strong>
          <div style="margin-top:8px">${lines}</div>
        </div>
      </div>
    `
  });
}
