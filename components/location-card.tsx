"use client";

import { MapPin } from "lucide-react";

import { MotionSection, Reveal } from "@/components/motion/reveal";
import { business } from "@/lib/business";

export function LocationCard() {
  return (
    <MotionSection className="section-shell">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal className="section-card p-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sand text-accent">
            <MapPin className="h-5 w-5" />
          </div>
          <h2 className="mt-6 text-4xl text-ink">Locație</h2>
          <p className="mt-4 text-base text-ink/70">{business.address}</p>
          <div className="mt-5 rounded-3xl border border-line/70 bg-cream/95 p-5 shadow-sm">
            <p className="text-sm uppercase tracking-[0.24em] text-ink/45">Program</p>
            <div className="mt-3 space-y-1 text-sm text-ink/75">
              <p>Luni - Marți: Închis</p>
              <p>Miercuri - Joi: 11:00 - 21:30</p>
              <p>Vineri - Duminică: 11:00 - 22:30</p>
            </div>
          </div>
          <a
            href={business.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="secondary-button mt-6"
          >
            Deschide în Google Maps
          </a>
        </Reveal>
        <a
          href={business.mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="group overflow-hidden rounded-[2rem] border border-line bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-premium"
        >
          <iframe
            title="Pizzeria Buonissimo map"
            src="https://www.google.com/maps?q=Strada+Orizontului+76+Sabaoani&z=15&output=embed"
            className="h-[380px] w-full transition duration-500 group-hover:scale-[1.015]"
            loading="lazy"
          />
        </a>
      </div>
    </MotionSection>
  );
}
