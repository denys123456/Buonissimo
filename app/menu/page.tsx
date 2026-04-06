import { CartSummary } from "@/components/cart-summary";
import { MenuGrid } from "@/components/menu-grid";

export default function MenuPage() {
  return (
    <section className="section-shell">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.3fr_0.7fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-ink/45">Menu</p>
          <h1 className="mt-3 text-5xl text-ink">Tot meniul</h1>
          <p className="mt-4 max-w-2xl text-lg text-ink/65">
            Vezi pizza, extraopțiuni și băuturi într-un meniu clar, ușor de parcurs.
          </p>
          <div className="mt-10">
            <MenuGrid />
          </div>
        </div>
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <CartSummary />
        </div>
      </div>
    </section>
  );
}
