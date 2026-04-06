import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripeServer() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe secret key is missing");
  }

  stripeClient ??= new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-08-27.basil"
  });

  return stripeClient;
}
