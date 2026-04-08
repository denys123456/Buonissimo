"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

import { useCart } from "@/components/cart-provider";
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

const ALLOWED_DELIVERY_CITIES = [
  "Cordun",
  "Simionesti",
  "Pildesti",
  "Sabaoani",
  "Roman",
  "Traian",
  "Adjudeni",
  "Tamaseni",
  "Rachiteni",
  "Iugani",
  "Gheraesti",
  "Barticesti",
  "Botesti"
] as const;

type Status = {
  type: "idle" | "error" | "loading";
  message?: string;
};

type DeliveryValidationState =
  | { type: "idle"; message: "" }
  | { type: "valid"; message: "" }
  | { type: "invalid-city"; message: "Nu livram in aceasta zona." };

type ModalState = {
  title: string;
  message: string;
  primaryLabel: string;
  secondaryLabel?: string;
  onPrimary: () => void;
  onSecondary?: () => void;
};

export function CheckoutForm() {
  const { items, total, clearCart } = useCart();
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const [fulfillmentMethod, setFulfillmentMethod] =
    useState<FulfillmentMethod>("delivery");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [streetNumber, setStreetNumber] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [pickupNote, setPickupNote] = useState("");
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
  const isAllowedCity = useMemo(
    () => (city ? ALLOWED_DELIVERY_CITIES.includes(city as (typeof ALLOWED_DELIVERY_CITIES)[number]) : false),
    [city]
  );
  const combinedDeliveryAddress = useMemo(() => {
    const parts = [
      street.trim() ? `Str. ${street.trim()}` : "",
      streetNumber.trim() ? `Nr. ${streetNumber.trim()}` : "",
      postalCode.trim() ? `Cod postal ${postalCode.trim()}` : "",
      city.trim()
    ].filter(Boolean);

    return parts.join(", ");
  }, [city, postalCode, street, streetNumber]);
  const helperMessage = useMemo(() => {
    if (fulfillmentMethod !== "delivery") {
      return "";
    }

    if (deliveryValidation.type === "invalid-city") {
      return deliveryValidation.message;
    }

    return "Livrarea este disponibila doar in localitatile selectabile din lista.";
  }, [deliveryValidation, fulfillmentMethod]);

  useEffect(() => {
    const syncAvailability = () => setIsOrderingOpen(getOrderingAvailability(new Date()));

    syncAvailability();
    const interval = window.setInterval(syncAvailability, 60000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!city) {
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

    if (!isAllowedCity) {
      setIsDeliveryLocked(true);
      setDeliveryValidation({
        type: "invalid-city",
        message: "Nu livram in aceasta zona."
      });

      if (rangeModalAddressRef.current !== city) {
        rangeModalAddressRef.current = city;
        setFulfillmentMethod("pickup");
        setModal({
          title: "Zona de livrare",
          message:
            "Nu livram in aceasta zona.\nPoti continua doar cu ridicare din locatie.",
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
  }, [city, fulfillmentMethod, isAllowedCity, isDeliveryLocked]);

  useEffect(() => {
    if (status.type !== "error") {
      return;
    }

    if (fulfillmentMethod === "delivery" && !city) {
      return;
    }

    setStatus({ type: "idle" });
  }, [city, fulfillmentMethod, status.type, street, streetNumber, postalCode, pickupNote]);

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

    if (fulfillmentMethod === "delivery" && (!street.trim() || !streetNumber.trim() || !city)) {
      setStatus({
        type: "error",
        message: "Completeaza strada, numarul si localitatea pentru livrare."
      });
      return;
    }

    if (fulfillmentMethod === "delivery" && !isAllowedCity) {
      setFulfillmentMethod("pickup");
      setModal({
        title: "Zona de livrare",
        message:
          "Nu livram in aceasta zona.\nPoti continua doar cu ridicare din locatie.",
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
    const payload: CheckoutPayload = {
      items,
      fulfillmentMethod,
      paymentMethod,
      customer: {
        name: String(form.get("name") || ""),
        phone,
        email: String(form.get("email") || ""),
        address: fulfillmentMethod === "delivery" ? combinedDeliveryAddress : "",
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
      const message = "error" in data ? data.error : "Checkout failed";
      setStatus({ type: "idle" });
      setModal({
        title: "Comanda nu a putut fi finalizata",
        message,
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
          {fulfillmentMethod === "delivery" ? "Street" : "Pickup note"}
          <input
            name={fulfillmentMethod === "delivery" ? "street" : "address"}
            required={fulfillmentMethod === "delivery"}
            value={fulfillmentMethod === "delivery" ? street : pickupNote}
            onChange={(event) => {
              if (fulfillmentMethod === "delivery") {
                setStreet(event.target.value);
              } else {
                setPickupNote(event.target.value);
              }
            }}
            placeholder={fulfillmentMethod === "delivery" ? "Strada" : "Optional"}
            className="premium-input"
          />
        </label>
      </div>
      {fulfillmentMethod === "delivery" ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <label className="text-sm text-ink/70">
            Number
            <input
              name="streetNumber"
              required
              value={streetNumber}
              onChange={(event) => setStreetNumber(event.target.value)}
              placeholder="Numar"
              className="premium-input"
            />
          </label>
          <label className="text-sm text-ink/70">
            Postal Code
            <input
              name="postalCode"
              value={postalCode}
              onChange={(event) => setPostalCode(event.target.value)}
              placeholder="Cod postal"
              className="premium-input"
            />
          </label>
          <label className="text-sm text-ink/70">
            City
            <select
              name="city"
              required
              value={city}
              onChange={(event) => {
                setCity(event.target.value);
                if (isDeliveryLocked) {
                  setIsDeliveryLocked(false);
                }
              }}
              className="premium-input"
            >
              <option value="">Selecteaza localitatea</option>
              {ALLOWED_DELIVERY_CITIES.map((allowedCity) => (
                <option key={allowedCity} value={allowedCity}>
                  {allowedCity}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}
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
