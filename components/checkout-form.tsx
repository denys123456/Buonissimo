"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

import { useCart } from "@/components/cart-provider";
import { business } from "@/lib/business";
import { haversineDistanceKm } from "@/lib/delivery";
import { getOrderingAvailability } from "@/lib/order-hours";
import type {
  CheckoutPayload,
  FulfillmentMethod,
  PaymentMethod
} from "@/lib/types";
import { formatPrice } from "@/lib/utils";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

type Status = {
  type: "idle" | "error" | "loading";
  message?: string;
};

type DeliveryValidationState =
  | { type: "idle"; message: "" }
  | { type: "checking"; message: "" }
  | { type: "valid"; message: "" }
  | { type: "invalid"; message: "Adresa este în afara razei de livrare (10 km)." }
  | { type: "error"; message: "" };

export function CheckoutForm() {
  const { items, total, clearCart } = useCart();
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const [fulfillmentMethod, setFulfillmentMethod] =
    useState<FulfillmentMethod>("delivery");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [isOrderingOpen, setIsOrderingOpen] = useState(() => getOrderingAvailability());
  const [deliveryValidation, setDeliveryValidation] = useState<DeliveryValidationState>({
    type: "idle",
    message: ""
  });

  const phoneError = useMemo(() => {
    if (!phoneTouched && phone.length === 0) {
      return "";
    }

    if (phone.length !== 10) {
      return "Phone number must contain exactly 10 digits";
    }

    return "";
  }, [phone, phoneTouched]);

  useEffect(() => {
    const syncAvailability = () => setIsOrderingOpen(getOrderingAvailability(new Date()));

    syncAvailability();
    const interval = window.setInterval(syncAvailability, 60000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (fulfillmentMethod === "pickup") {
      setDeliveryValidation({ type: "valid", message: "" });
      return;
    }

    const trimmedAddress = address.trim();
    if (!trimmedAddress) {
      setDeliveryValidation({ type: "idle", message: "" });
      return;
    }

    let active = true;
    const controller = new AbortController();

    const timeoutId = window.setTimeout(async () => {
      setDeliveryValidation({ type: "checking", message: "" });

      try {
        const url = new URL("https://nominatim.openstreetmap.org/search");
        url.searchParams.set("q", trimmedAddress);
        url.searchParams.set("format", "jsonv2");
        url.searchParams.set("limit", "1");

        const response = await fetch(url.toString(), {
          signal: controller.signal,
          headers: {
            Accept: "application/json"
          }
        });

        if (!response.ok) {
          throw new Error("Unable to validate address");
        }

        const data = (await response.json()) as Array<{ lat: string; lon: string }>;
        if (!active || controller.signal.aborted) {
          return;
        }

        if (!data.length) {
          setDeliveryValidation({ type: "error", message: "" });
          return;
        }

        const distance = haversineDistanceKm(business.location, {
          lat: Number(data[0].lat),
          lng: Number(data[0].lon)
        });

        if (distance > business.deliveryRadiusKm) {
          setDeliveryValidation({
            type: "invalid",
            message: "Adresa este în afara razei de livrare (10 km)."
          });
          return;
        }

        setDeliveryValidation({ type: "valid", message: "" });
      } catch {
        if (!active || controller.signal.aborted) {
          return;
        }

        setDeliveryValidation({ type: "error", message: "" });
      }
    }, 350);

    return () => {
      active = false;
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [address, fulfillmentMethod]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPhoneTouched(true);

    if (!isOrderingOpen.canOrder) {
      setStatus({ type: "error", message: isOrderingOpen.message });
      return;
    }

    if (!items.length) {
      setStatus({ type: "error", message: "Add products to the cart first" });
      return;
    }

    if (phone.length !== 10) {
      setStatus({
        type: "error",
        message: "Phone number must contain exactly 10 digits"
      });
      return;
    }

    if (
      fulfillmentMethod === "delivery" &&
      deliveryValidation.type === "invalid"
    ) {
      setStatus({
        type: "error",
        message: "Adresa este în afara razei de livrare (10 km)."
      });
      return;
    }

    const form = new FormData(event.currentTarget);
    const payload: CheckoutPayload = {
      items,
      fulfillmentMethod,
      paymentMethod,
      customer: {
        name: String(form.get("name") || ""),
        phone,
        email: String(form.get("email") || ""),
        address:
          fulfillmentMethod === "delivery"
            ? String(form.get("address") || "")
            : "",
        notes: String(form.get("notes") || "")
      }
    };

    setStatus({ type: "loading" });

    const response = await fetch(
      paymentMethod === "card" ? "/api/checkout" : "/api/orders/cash",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    const data = (await response.json()) as
      | { error: string }
      | { url?: string; orderId?: string };

    if (!response.ok) {
      setStatus({
        type: "error",
        message: "error" in data ? data.error : "Checkout failed"
      });
      return;
    }

    if (paymentMethod === "cash") {
      clearCart();
      window.location.href = `/checkout/success?cash=1&orderId=${"orderId" in data ? data.orderId : ""}`;
      return;
    }

    if (!stripePromise || !("url" in data && data.url)) {
      setStatus({ type: "error", message: "Stripe is not configured correctly" });
      return;
    }

    const stripe = await stripePromise;
    if (!stripe) {
      setStatus({ type: "error", message: "Stripe failed to initialize" });
      return;
    }

    window.location.href = data.url;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[2rem] border border-line bg-white/92 p-6 shadow-soft backdrop-blur-sm lg:p-8"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <label className="text-sm text-ink/70">
          Name
          <input name="name" required className="premium-input" />
        </label>
        <label className="text-sm text-ink/70">
          Phone
          <input
            name="phone"
            required
            inputMode="numeric"
            autoComplete="tel"
            value={phone}
            maxLength={10}
            onBlur={() => setPhoneTouched(true)}
            onChange={(event) => {
              setPhoneTouched(true);
              setPhone(event.target.value.replace(/\D/g, "").slice(0, 10));
              if (status.type === "error") {
                setStatus({ type: "idle" });
              }
            }}
            className={`premium-input ${phoneError ? "border-accent" : ""}`}
          />
          {phoneError ? <p className="mt-2 text-sm text-accent">{phoneError}</p> : null}
        </label>
        <label className="text-sm text-ink/70">
          Email
          <input type="email" name="email" required className="premium-input" />
        </label>
        <label className="text-sm text-ink/70">
          {fulfillmentMethod === "delivery" ? "Address" : "Pickup note"}
          <input
            name="address"
            required={fulfillmentMethod === "delivery"}
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder={
              fulfillmentMethod === "delivery"
                ? "Street, number, city"
                : "Optional"
            }
            className="premium-input"
          />
        </label>
      </div>
      <label className="mt-6 block text-sm text-ink/70">
        Notes
        <textarea name="notes" rows={4} className="premium-input resize-none" />
      </label>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <fieldset>
          <legend className="text-sm uppercase tracking-[0.24em] text-ink/45">
            Livrare sau ridicare
          </legend>
          <div className="mt-3 grid gap-3">
            <label className="flex cursor-pointer items-center justify-between rounded-3xl border border-line bg-cream/85 px-4 py-4 shadow-sm transition hover:border-ink">
              <span>Livrare</span>
              <input
                type="radio"
                checked={fulfillmentMethod === "delivery"}
                onChange={() => setFulfillmentMethod("delivery")}
              />
            </label>
            <label className="flex cursor-pointer items-center justify-between rounded-3xl border border-line bg-cream/85 px-4 py-4 shadow-sm transition hover:border-ink">
              <span>Ridicare</span>
              <input
                type="radio"
                checked={fulfillmentMethod === "pickup"}
                onChange={() => setFulfillmentMethod("pickup")}
              />
            </label>
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-sm uppercase tracking-[0.24em] text-ink/45">
            Plată
          </legend>
          <div className="mt-3 grid gap-3">
            <label className="flex cursor-pointer items-center justify-between rounded-3xl border border-line bg-cream/85 px-4 py-4 shadow-sm transition hover:border-ink">
              <span>Card (Stripe)</span>
              <input
                type="radio"
                checked={paymentMethod === "card"}
                onChange={() => setPaymentMethod("card")}
              />
            </label>
            <label className="flex cursor-pointer items-center justify-between rounded-3xl border border-line bg-cream/85 px-4 py-4 shadow-sm transition hover:border-ink">
              <span>Numerar</span>
              <input
                type="radio"
                checked={paymentMethod === "cash"}
                onChange={() => setPaymentMethod("cash")}
              />
            </label>
          </div>
        </fieldset>
      </div>
      <div className="mt-8 rounded-3xl border border-line bg-sand/35 p-5">
        <div className="flex items-center justify-between text-sm text-ink/65">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
        {fulfillmentMethod === "delivery" && deliveryValidation.type === "invalid" ? (
          <p className="mt-5 text-sm text-accent">
            Adresa este în afara razei de livrare (10 km).
          </p>
        ) : null}
        <button
          type="submit"
          disabled={
            status.type === "loading" ||
            items.length === 0 ||
            phone.length !== 10 ||
            !isOrderingOpen.canOrder ||
            (fulfillmentMethod === "delivery" &&
              deliveryValidation.type === "invalid")
          }
          className="premium-button mt-5 flex w-full disabled:cursor-not-allowed disabled:opacity-50"
        >
          {paymentMethod === "card" ? "Plătește cu cardul" : "Trimite comanda"}
        </button>
        {!isOrderingOpen.canOrder ? (
          <p className="mt-4 text-sm text-accent">{isOrderingOpen.message}</p>
        ) : null}
        {status.type === "error" ? (
          <p className="mt-4 text-sm text-accent">{status.message}</p>
        ) : null}
        {fulfillmentMethod === "delivery" ? (
          <p className="mt-4 text-xs leading-5 text-ink/55">
            Livrarea este validată server-side și este disponibilă doar în raza de 10 KM.
          </p>
        ) : null}
      </div>
    </form>
  );
}
