import { CartSummary } from "@/components/cart-summary";
import { CheckoutForm } from "@/components/checkout-form";

export default function CheckoutPage() {
  return (
    <section className="section-shell">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.8fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-ink/45">Checkout</p>
          <h1 className="mt-3 text-5xl text-ink">Comandă și plată</h1>
          <p className="mt-4 max-w-2xl text-lg text-ink/65">
            Alege cum vrei să primești comanda și finalizează plata în câțiva pași.
          </p>
          <div className="mt-10">
            <CheckoutForm />
          </div>
        </div>
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <CartSummary />
        </div>
      </div>
    </section>
  );
}
