import manifest from "@/data/images.json";

type ManifestImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
  kind: string;
  hero: boolean;
};

const productImages = manifest.products as Record<string, ManifestImage[]>;

/** The designated hero shot for a product, falling back to its first photo. */
function heroPhoto(slug: string): ManifestImage {
  const images = productImages[slug];
  return images.find((img) => img.hero) ?? images[0];
}

/** Look up a real photo by a filename fragment, explicit and immune to
    reordering, unlike indexing into the manifest array by position. */
function photoNamed(slug: string, filenameContains: string): ManifestImage {
  const images = productImages[slug];
  const match = images.find((img) => img.src.includes(filenameContains));
  if (!match) throw new Error(`gallery-strip: no image matching "${filenameContains}" in ${slug}`);
  return match;
}

export type GalleryShot = {
  image: Pick<ManifestImage, "src" | "alt">;
  width: string;
  sizes: string;
};

/* Curated photo strip; fixed widths/heights so the marquee never shifts layout.
   Each entry carries a sizes string matching its rendered card width. Every
   image is a real product photo, looked up by filename/hero flag, not by
   array index, so the manifest can be reordered without breaking this row.

   One shot per product line, plus a second glamping capsule shot where the
   safari tent used to be (removed 29 October 2026): seven cards, so the row
   stays as wide as it was. Card widths deliberately alternate large/medium/small: a uniform row
   reads as a contact sheet rather than a gallery, and the varied rhythm is also
   what keeps the marquee wide enough to loop seamlessly on ultra-wide screens.

   Read on the server only (page.tsx passes the result to GalleryStrip), so the
   image manifest stays out of the browser's JavaScript. */
export const galleryShots: GalleryShot[] = [
  {
    image: heroPhoto("folding-homes"),
    width: "w-[22rem] sm:w-[26rem]",
    sizes: "(min-width: 640px) 416px, 352px",
  },
  {
    image: heroPhoto("apple-cabins"),
    width: "w-72 sm:w-80",
    sizes: "(min-width: 640px) 320px, 288px",
  },
  {
    image: photoNamed("glamping-capsules", "exterior-capsule-row-dusk"),
    width: "w-[22rem] sm:w-[26rem]",
    sizes: "(min-width: 640px) 416px, 352px",
  },
  {
    /* The hero, not exterior-balcony-deck; that shot carries a baked-in
       watermark and a legible third-party badge on the pod itself. */
    image: heroPhoto("glamping-capsules"),
    width: "w-72 sm:w-80",
    sizes: "(min-width: 640px) 320px, 288px",
  },
  {
    image: photoNamed("outdoor-kitchens", "kitchen-patio-pool"),
    width: "w-72 sm:w-80",
    sizes: "(min-width: 640px) 320px, 288px",
  },
  {
    image: photoNamed("nature-cabins", "exterior-two-cabins"),
    width: "w-72 sm:w-80",
    sizes: "(min-width: 640px) 320px, 288px",
  },
  {
    image: photoNamed("expandable-homes", "interior-living-dining"),
    width: "w-[22rem] sm:w-[26rem]",
    sizes: "(min-width: 640px) 416px, 352px",
  },
].map(({ image, width, sizes }) => ({
  image: { src: image.src, alt: image.alt },
  width,
  sizes,
}));
