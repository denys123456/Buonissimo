import { readdir } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

type GalleryImage = {
  src: string;
  alt: string;
  order: number;
};

async function getGalleryImages(prefix: "img" | "location", altPrefix: string) {
  const directory = path.join(process.cwd(), "pics");
  const files = await readdir(directory);

  return files
    .map((file) => {
      const match = file.match(new RegExp(`^${prefix}(\\d+)\\.(jpg|jpeg|png|webp)$`, "i"));
      if (!match) {
        return null;
      }

      return {
        src: `/pics/${file}`,
        alt: `${altPrefix} ${match[1]}`,
        order: Number(match[1])
      } satisfies GalleryImage;
    })
    .filter((image): image is GalleryImage => image !== null)
    .sort((left, right) => left.order - right.order)
    .map(({ order, ...image }) => image);
}

export async function GET() {
  const [foodImages, locationImages] = await Promise.all([
    getGalleryImages("img", "Food photo"),
    getGalleryImages("location", "Location photo")
  ]);

  return NextResponse.json({ foodImages, locationImages });
}
