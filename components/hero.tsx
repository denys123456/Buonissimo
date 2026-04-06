"use client";

import Link from "next/link";
import { ArrowRight, Clock3, Facebook, Instagram, Star } from "lucide-react";

import { DecorativeAccents } from "@/components/decorative-accents";
import { Reveal, Stagger } from "@/components/motion/reveal";
import { business } from "@/lib/business";
import { weeklySchedule } from "@/lib/order-hours";

export function Hero() {
  return (
    <section className="section-shell relative overflow-hidden pb-10 pt-12 lg:pt-16">
      <div className="mx-auto grid max-w-7xl gap-10 rounded-[2.5rem] border border-line/70 bg-paper bg-premium px-8 py-10 shadow-premium lg:grid-cols-[1.2fr_0.8fr] lg:px-12 lg:py-14">
        <DecorativeAccents />
        <Stagger className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-sm text-ink/75">
            <Star className="h-4 w-4 fill-gold text-gold" />
            {business.rating} rating / {business.reviews} reviews
          </div>
          <h1 className="mt-6 max-w-3xl text-5xl leading-tight text-ink md:text-6xl">
            Pizza bună, fără complicații. Comanzi rapid, primești exact ce vrei.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-ink/70">
            Meniu clar, comandă simplă și livrare rapidă.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/menu" className="premium-button">
              Comandă acum
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href={business.phoneHref} className="secondary-button">
              {business.phone}
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-3 text-sm text-ink/55">
            <span className="rounded-full border border-line/80 bg-white/70 px-4 py-2">
              Raza de livrare {business.deliveryRadiusKm} km
            </span>
            <span className="rounded-full border border-line/80 bg-white/70 px-4 py-2">
              Card sau numerar
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-line/80 bg-white/70 px-4 py-2">
              <Clock3 className="h-4 w-4" />
              Comandă simplă și de pe telefon
            </span>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="https://www.instagram.com/pizzeriabuonissimo/"
              target="_blank"
              rel="noreferrer"
              className="secondary-button"
            >
              <Instagram className="h-4 w-4" />
              Instagram
            </Link>
            <Link
              href="https://www.facebook.com/p/Pizzeria-Buonissimo-61577259454598/"
              target="_blank"
              rel="noreferrer"
              className="secondary-button"
            >
              <Facebook className="h-4 w-4" />
              Facebook
            </Link>
          </div>
        </Stagger>
        <Reveal
          className="relative z-10 grid gap-4 rounded-[2rem] border border-white/60 bg-white/75 p-6 shadow-soft backdrop-blur-sm"
          delay={0.12}
        >
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-ink/50">
              Address
            </p>
            <p className="mt-2 text-xl text-ink">{business.address}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-3xl border border-line/70 bg-cream/95 p-5 shadow-sm">
              <p className="text-sm text-ink/55">Price range</p>
              <p className="mt-3 text-3xl text-ink">{business.priceRange}</p>
            </div>
            <div className="rounded-3xl border border-line/70 bg-cream/95 p-5 shadow-sm">
              <p className="text-sm text-ink/55">Rază livrare</p>
              <p className="mt-3 text-3xl text-ink">{business.deliveryRadiusKm} KM</p>
            </div>
          </div>
          <div className="rounded-3xl border border-line/70 bg-cream/95 p-5 shadow-sm">
            <p className="text-sm text-ink/55">Program</p>
            <div className="mt-3 space-y-1 text-sm text-ink/80">
              {weeklySchedule.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
