import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram } from "lucide-react";

import { business } from "@/lib/business";
import { weeklySchedule } from "@/lib/order-hours";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white/80 backdrop-blur-sm">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-3 lg:px-8">
        <div>
          <Link href="/" className="inline-flex items-center">
            <Image
              src="/pics/logo.png"
              alt="Buonissimo"
              width={144}
              height={48}
              className="h-10 w-auto object-contain"
            />
          </Link>
          <p className="mt-3 max-w-sm text-sm text-ink/70">
            Pizza bună, comandă simplă și un site gândit clar, fără pași inutili.
          </p>
        </div>
        <div className="text-sm text-ink/70">
          <p>{business.address}</p>
          <p className="mt-2">{business.phone}</p>
          <p className="mt-2">Rating {business.rating} ({business.reviews} review-uri)</p>
          <div className="mt-4 space-y-1">
            <p className="font-medium text-ink">Program</p>
            {weeklySchedule.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4 text-sm text-ink/80">
          <div className="flex gap-6">
            <Link href="/menu">Meniu</Link>
            <Link href="/gallery">Galerie</Link>
            <Link href="/reviews">Review-uri</Link>
          </div>
          <div className="flex gap-4">
            <Link
              href="https://www.instagram.com/pizzeriabuonissimo/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2"
            >
              <Instagram className="h-4 w-4" />
              Instagram
            </Link>
            <Link
              href="https://www.facebook.com/p/Pizzeria-Buonissimo-61577259454598/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2"
            >
              <Facebook className="h-4 w-4" />
              Facebook
            </Link>
          </div>
          <Link href={business.mapsUrl} target="_blank">
            Google Maps
          </Link>
        </div>
      </div>
    </footer>
  );
}
