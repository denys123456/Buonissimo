export type CartItem = {
  cartKey: string;
  id: string;
  name: string;
  price: number;
  basePrice: number;
  weight?: string;
  quantity: number;
  group: string;
  extras: CartExtra[];
};

export type CartExtra = {
  id: string;
  name: string;
  price: number;
};

export type FulfillmentMethod = "delivery" | "pickup";
export type PaymentMethod = "card" | "cash";

export type CustomerDetails = {
  name: string;
  phone: string;
  email: string;
  address: string;
  notes?: string;
};

export type CheckoutPayload = {
  items: CartItem[];
  fulfillmentMethod: FulfillmentMethod;
  paymentMethod: PaymentMethod;
  customer: CustomerDetails;
};

export type StoredOrder = CheckoutPayload & {
  id: string;
  total: number;
  createdAt: string;
  paymentLabel: "Card (Stripe)" | "Cash";
  distanceKm?: number;
  stripeSessionId?: string;
};
