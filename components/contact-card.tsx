"use client";

import { Phone, Star } from "lucide-react";

import { MotionSection, Reveal, Stagger } from "@/components/motion/reveal";
import { business } from "@/lib/business";

export function ContactCard() {
  return (
    <MotionSection className="section-shell pb-16 pt-8">
      <Stagger className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
        <Reveal className="section-card p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-ink/45">Phone</p>
          <a
            href={business.phoneHref}
            className="mt-5 inline-flex items-center gap-3 text-2xl text-ink hover:text-accent"
          >
            <Phone className="h-5 w-5" />
            {business.phone}
          </a>
        </Reveal>
        <Reveal className="section-card p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-ink/45">Address</p>
          <p className="mt-5 text-2xl leading-9 text-ink">{business.address}</p>
        </Reveal>
        <Reveal className="section-card p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-ink/45">Reviews</p>
          <p className="mt-5 inline-flex items-center gap-3 text-2xl text-ink">
            <Star className="h-5 w-5 fill-gold text-gold" />
            {business.rating} ({business.reviews} reviews)
          </p>
        </Reveal>
      </Stagger>
    </MotionSection>
  );
}
