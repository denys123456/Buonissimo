"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

import { useCart } from "@/components/cart-provider";
import { business } from "@/lib/business";
import { haversineDistanceKm } from "@/lib/delivery";
import { getOrderingAvailability, weeklySchedule } from "@/lib/order-hours";
import type {
  CheckoutPayload,
  FulfillmentMethod,
  PaymentMethod
} from "@/lib/types";
import { formatPrice } from "@/lib/utils";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? "";

type Status = {
  type: "idle" | "error" | "loading";
  message?: string;
};

type DeliveryValidationState =
  | { type: "idle"; message: "" }
  | { type: "checking"; message: "" }
  | { type: "valid"; message: "" }
  | { type: "too-far"; message: "Esti in afara zonei de livrare." }
  | { type: "unverified"; message: "Locatia nu a putut fi validata automat." };

type ModalState = {
  title: string;
  message: string;
  primaryLabel: string;
  secondaryLabel?: string;
  onPrimary: () => void;
  onSecondary?: () => void;
};

async function geocodeWithGoogle(address: string, signal: AbortSignal) {
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", address);
  url.searchParams.set("key", GOOGLE_MAPS_API_KEY);

  const response = await fetch(url.toString(), {
    signal,
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error("Unable to geocode the address");
  }

  const data = (await response.json()) as {
    status: string;
    results?: Array<{ geometry?: { location?: { lat?: number; lng?: number } } }>;
  };

  if (data.status !== "OK" || !data.results?.length) {
    throw new Error("Unable to validate delivery distance for this address");
  }

  const location = data.results[0]?.geometry?.location;
  const lat = Number(location?.lat);
  const lng = Number(location?.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error("Unable to parse geocoded coordinates");
  }

  return { lat, lng };
}

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
  const [isDeliveryLocked, setIsDeliveryLocked] = useState(false);
  const [modal, setModal] = useState<ModalState | null>(null);
  const rangeModalAddressRef = useRef("");

  const phoneError = useMemo(() => {
    if (!phoneTouched && phone.length === 0) {
      return "";
    }

    if (phone.length !== 10) {
      return "Phone number must contain exactly 10 digits";
    }

    return "";
  }, [phone, phoneTouched]);

  const scheduleText = useMemo(() => weeklySchedule.join("\n"), []);
  const helperMessage = useMemo(() => {
    if (fulfillmentMethod !== "delivery") {
      return "";
    }

    if (deliveryValidation.type === "checking") {
      return "Validam automat distanta de livrare.";
    }

    if (deliveryValidation.type === "unverified") {
      return deliveryValidation.message;
    }

    return "Livrarea este disponibila doar in raza de 10 km.";
  }, [deliveryValidation, fulfillmentMethod]);

  useEffect(() => {
    const syncAvailability = () => setIsOrderingOpen(getOrderingAvailability(new Date()));

    syncAvailability();
    const interval = window.setInterval(syncAvailability, 60000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const trimmedAddress = address.trim();

    if (!trimmedAddress) {
      rangeModalAddressRef.current = "";
      setIsDeliveryLocked(false);
      setDeliveryValidation(
        fulfillmentMethod === "pickup"
          ? { type: "valid", message: "" }
          : { type: "idle", message: "" }
      );
      return;
    }

    if (fulfillmentMethod === "pickup" && !isDeliveryLocked) {
      setDeliveryValidation({ type: "valid", message: "" });
      return;
    }

    let active = true;
    const controller = new AbortController();

    const timeoutId = window.setTimeout(async () => {
      if (!GOOGLE_MAPS_API_KEY) {
        if (!active || controller.signal.aborted) {
          return;
        }

        setIsDeliveryLocked(false);
        setDeliveryValidation({
          type: "unverified",
          message: "Locatia nu a putut fi validata automat."
        });
        return;
      }

      setDeliveryValidation({ type: "checking", message: "" });

      try {
        const destination = await geocodeWithGoogle(trimmedAddress, controller.signal);
        if (!active || controller.signal.aborted) {
          return;
        }

        const distance = haversineDistanceKm(business.location, destination);
        console.debug("[checkout] delivery distance", {
          address: trimmedAddress,
          distanceKm: Number(distance.toFixed(2)),
          source: "google-geocode+haversine",
          destination
        });

        if (distance > business.deliveryRadiusKm) {
          setIsDeliveryLocked(true);
          setDeliveryValidation({
            type: "too-far",
            message: "Esti in afara zonei de livrare."
          });

          if (rangeModalAddressRef.current !== trimmedAddress) {
            rangeModalAddressRef.current = trimmedAddress;
            setFulfillmentMethod("pickup");
            setModal({
              title: "Zona de livrare",
              message:
                "Esti in afara zonei de livrare.\nPoti continua doar cu ridicare din locatie.",
              primaryLabel: "OK",
              secondaryLabel: "Schimba in ridicare",
              onPrimary: () => setModal(null),
              onSecondary: () => {
                setFulfillmentMethod("pickup");
                setModal(null);
              }
            });
          }

          return;
        }

        rangeModalAddressRef.current = "";
        setIsDeliveryLocked(false);
        setDeliveryValidation({ type: "valid", message: "" });
      } catch {
        if (!active || controller.signal.aborted) {
          return;
        }

        setIsDeliveryLocked(false);
        setDeliveryValidation({
          type: "unverified",
          message: "Locatia nu a putut fi validata automat."
        });
      }
    }, 350);

    return () => {
      active = false;
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [address, fulfillmentMethod, isDeliveryLocked]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPhoneTouched(true);
    setStatus({ type: "idle" });

    if (!isOrderingOpen.canOrder) {
      setModal({
        title: "Comenzi indisponibile",
        message: `Momentan nu se pot plasa comenzi.\nProgram:\n${scheduleText}`,
        primaryLabel: "OK",
        onPrimary: () => setModal(null)
      });
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

    if (fulfillmentMethod === "delivery" && deliveryValidation.type === "too-far") {
      setFulfillmentMethod("pickup");
      setModal({
        title: "Zona de livrare",
        message:
          "Esti in afara zonei de livrare.\nPoti continua doar cu ridicare din locatie.",
        primaryLabel: "OK",
        secondaryLabel: "Schimba in ridicare",
        onPrimary: () => setModal(null),
        onSecondary: () => {
          setFulfillmentMethod("pickup");
          setModal(null);
        }
      });
      return;
    }

    const form = new FormData(event.currentTarget);
    const notes = String(form.get("notes") || "");
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
        notes:
          fulfillmentMethod === "delivery" && deliveryValidation.type === "unverified"
            ? `${notes}${notes ? "\n\n" : ""}[Distance validation: unverified]`
            : notes
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
      const message = "error" in data ? data.error : "Checkout failed";
      setStatus({ type: "idle" });
      setModal({
        title: "Comanda nu a putut fi finalizata",
        message:
          message === "Google Maps API key is missing"
            ? "Locatia nu a putut fi validata automat."
            : message,
        primaryLabel: "OK",
        onPrimary: () => setModal(null)
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
            onChange={(event) => {
              setAddress(event.target.value);
              if (isDeliveryLocked) {
                setIsDeliveryLocked(false);
              }
            }}
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
                disabled={isDeliveryLocked}
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
            Plata
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
        <button
          type="submit"
          disabled={status.type === "loading" || items.length === 0 || phone.length !== 10}
          className="premium-button mt-5 flex w-full disabled:cursor-not-allowed disabled:opacity-50"
        >
          {paymentMethod === "card" ? "Plateste cu cardul" : "Trimite comanda"}
        </button>
        {status.type === "error" && status.message ? (
          <p className="mt-4 text-sm text-accent">{status.message}</p>
        ) : null}
        {helperMessage ? (
          <p className="mt-4 text-xs leading-5 text-ink/55">{helperMessage}</p>
        ) : null}
      </div>
      {modal ? (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkout-modal-title"
        >
          <div className="modal-card">
            <p className="text-xs uppercase tracking-[0.24em] text-ink/45">Buonissimo</p>
            <h2 id="checkout-modal-title" className="mt-3 text-2xl text-ink">
              {modal.title}
            </h2>
            <p className="mt-4 whitespace-pre-line text-sm text-ink/70">
              {modal.message}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              {modal.secondaryLabel ? (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={modal.onSecondary}
                >
                  {modal.secondaryLabel}
                </button>
              ) : null}
              <button type="button" className="premium-button" onClick={modal.onPrimary}>
                {modal.primaryLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
}
