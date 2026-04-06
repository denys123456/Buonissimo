"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import { Reveal, Stagger } from "@/components/motion/reveal";

type GalleryImage = {
  src: string;
  alt: string;
};

function GalleryThumb({
  image,
  priority = false
}: {
  image: GalleryImage;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-sand/40 text-sm text-ink/55">
        Imagine indisponibilă
      </div>
    );
  }

  return (
    <Image
      src={image.src}
      alt={image.alt}
      fill
      unoptimized
      priority={priority}
      quality={100}
      sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
      className="animate-[fadeIn_.25s_ease] object-cover transition duration-300 group-hover:scale-105"
      onError={() => setFailed(true)}
    />
  );
}

function GalleryGrid({
  title,
  subtitle,
  images,
  onSelect
}: {
  title: string;
  subtitle: string;
  images: GalleryImage[];
  onSelect: (image: GalleryImage) => void;
}) {
  if (images.length === 0) {
    return null;
  }

  return (
    <Reveal>
      <div className="mb-7">
        <p className="text-sm uppercase tracking-[0.24em] text-ink/45">{subtitle}</p>
        <h2 className="mt-2 text-4xl text-ink">{title}</h2>
      </div>
      <Stagger className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {images.map((image, index) => (
          <Reveal key={image.src} delay={index * 0.03}>
            <button
              type="button"
              onClick={() => onSelect(image)}
              className="group relative block w-full overflow-hidden rounded-[1.75rem] border border-line/70 bg-white/85 text-left shadow-soft transition duration-300 hover:shadow-premium"
            >
              <div className="relative block aspect-[4/3] w-full overflow-hidden">
                <GalleryThumb image={image} priority={index < 4} />
                <div className="glass-overlay" />
              </div>
            </button>
          </Reveal>
        ))}
      </Stagger>
    </Reveal>
  );
}

export function GallerySections() {
  const [foodImages, setFoodImages] = useState<GalleryImage[]>([]);
  const [locationImages, setLocationImages] = useState<GalleryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadImages() {
      const response = await fetch("/api/pics", { cache: "no-store" });
      if (!response.ok) {
        if (active) {
          setLoaded(true);
        }
        return;
      }

      const data = (await response.json()) as {
        foodImages: GalleryImage[];
        locationImages: GalleryImage[];
      };

      if (!active) {
        return;
      }

      setFoodImages(data.foodImages);
      setLocationImages(data.locationImages);
      setLoaded(true);
    }

    void loadImages();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedImage) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedImage(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage]);

  const hasImages = foodImages.length > 0 || locationImages.length > 0;

  return (
    <>
      {!loaded ? (
        <div className="rounded-[2rem] border border-line/80 bg-white/80 p-8 text-ink/60 shadow-soft">
          Se încarcă galeria...
        </div>
      ) : null}
      {loaded && !hasImages ? (
        <div className="rounded-[2rem] border border-line/80 bg-white/80 p-8 text-ink/60 shadow-soft">
          Nu au fost găsite imagini în folderul local <code>pics</code>.
        </div>
      ) : null}
      {hasImages ? (
        <div className="space-y-16">
          <GalleryGrid
            title="Food"
            subtitle="Preparatele noastre"
            images={foodImages}
            onSelect={setSelectedImage}
          />
          <GalleryGrid
            title="Locație"
            subtitle="Spațiul Buonissimo"
            images={locationImages}
            onSelect={setSelectedImage}
          />
        </div>
      ) : null}
      <AnimatePresence>
        {selectedImage ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.8)] p-6 backdrop-blur-[8px]"
            onClick={() => setSelectedImage(null)}
          >
            <button
              type="button"
              className="absolute right-5 top-5 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur"
              onClick={() => setSelectedImage(null)}
              aria-label="Close gallery image"
            >
              <X className="h-5 w-5" />
            </button>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative flex max-h-[90vh] max-w-[90vw] items-center justify-center"
              onClick={(event) => event.stopPropagation()}
            >
              <Image
                src={selectedImage.src}
                alt={selectedImage.alt}
                width={1600}
                height={1200}
                unoptimized
                quality={100}
                priority
                className="max-h-[90vh] max-w-[90vw] rounded-[1.5rem] object-contain shadow-premium"
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
