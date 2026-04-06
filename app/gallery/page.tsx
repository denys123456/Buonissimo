import { GallerySections } from "@/components/gallery-sections";

export default function GalleryPage() {
  return (
    <section className="section-shell">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm uppercase tracking-[0.24em] text-ink/45">Gallery</p>
        <h1 className="mt-3 text-5xl text-ink">Food and location</h1>
        <p className="mt-4 max-w-2xl text-lg text-ink/65">
          The gallery loads the available files from the local <code>pics</code> folder.
        </p>
        <div className="mt-12">
          <GallerySections />
        </div>
      </div>
    </section>
  );
}
