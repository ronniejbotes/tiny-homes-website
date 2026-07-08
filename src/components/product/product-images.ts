import manifest from "@/data/images.json";

export interface ProductImage {
  src: string;
  width: number;
  height: number;
  alt: string;
  kind: string;
  hero: boolean;
}

const productImages = manifest.products as Record<string, ProductImage[]>;

/** All manifest images for a product slug. */
export function getProductImages(slug: string): ProductImage[] {
  return productImages[slug] ?? [];
}

/** The designated hero image (falls back to the first image). */
export function getHeroImage(slug: string): ProductImage | undefined {
  const images = getProductImages(slug);
  return images.find((image) => image.hero) ?? images[0];
}

/** Photographic images for the gallery row: everything except the hero, diagrams and icons. */
export function getGalleryImages(slug: string): ProductImage[] {
  const hero = getHeroImage(slug);
  return getProductImages(slug).filter(
    (image) => image !== hero && image.kind !== "diagram" && image.kind !== "icon",
  );
}
