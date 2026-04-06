"use client";

import { Star } from "lucide-react";

import { MotionSection, Reveal, Stagger } from "@/components/motion/reveal";
import { business } from "@/lib/business";

const reviewHighlights = [
  "4.7 average rating",
  "24 reviews",
  "Clean pickup and delivery ordering flow"
];

export function ReviewsOverview() {
  return (
    <MotionSection className="section-shell">
      <div className="mx-auto max-w-5xl rounded-[2.5rem] border border-line bg-white/90 p-8 shadow-premium lg:p-12">
        <Reveal className="text-center">
          <div className="inline-flex items-center gap-3 rounded-full border border-line px-4 py-2 text-sm text-ink/70">
            <Star className="h-4 w-4 fill-gold text-gold" />
            Reviews
          </div>
          <h1 className="mt-6 text-6xl text-ink">{business.rating}</h1>
          <p className="mt-3 text-lg text-ink/70">{business.reviews} reviews</p>
        </Reveal>
        <Stagger className="mt-10 grid gap-4 md:grid-cols-3">
          {reviewHighlights.map((item) => (
            <Reveal
              key={item}
              className="rounded-3xl border border-line bg-sand/25 p-5 text-center text-sm text-ink/75"
            >
              {item}
            </Reveal>
          ))}
        </Stagger>
      </div>
    </MotionSection>
  );
}
