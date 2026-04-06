import { ContactCard } from "@/components/contact-card";
import { FeaturedPizzas } from "@/components/featured-pizzas";
import { Hero } from "@/components/hero";
import { LocationCard } from "@/components/location-card";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedPizzas />
      <LocationCard />
      <ContactCard />
    </>
  );
}
