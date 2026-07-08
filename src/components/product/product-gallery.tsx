import Image from "next/image";
import { cn } from "@/lib/cn";
import { Container } from "@/components/ui/container";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import type { ProductImage } from "./product-images";

/**
 * Masonry-ish photo grid. With more than four images the first (largest)
 * image spans a 2×2 block; span helpers keep the final row filled at each
 * breakpoint. Skipped entirely when there is at most one extra image.
 */
export function ProductGallery({
  productName,
  images,
}: {
  productName: string;
  images: ProductImage[];
}) {
  const count = images.length;
  if (count < 2) return null;

  const featureFirst = count > 4;
  // Cells used on the sm 3-col grid: 4 for the feature image + 1 each.
  const fillLastSm = featureFirst && (count + 3) % 3 === 2;
  // Cells used on the mobile 2-col grid: 2 for the feature image + 1 each.
  const fillLastMobile = ((featureFirst ? count + 1 : count) % 2) === 1;

  const gridCols =
    featureFirst || count === 3
      ? "grid-cols-2 sm:grid-cols-3"
      : count === 4
        ? "grid-cols-2 lg:grid-cols-4"
        : "grid-cols-1 sm:grid-cols-2";

  return (
    <section aria-label={`${productName} photo gallery`} className="pb-16 sm:pb-24">
      <Container>
        <Stagger
          className={cn(
            "grid auto-rows-[200px] gap-3 sm:auto-rows-[240px] sm:gap-4 lg:auto-rows-[280px]",
            gridCols,
          )}
        >
          {images.map((image, i) => {
            const isFirst = i === 0;
            const isLast = i === count - 1;
            return (
              <StaggerItem
                key={image.src}
                className={cn(
                  "group relative overflow-hidden rounded-2xl",
                  featureFirst && isFirst && "col-span-2 sm:row-span-2",
                  isLast && fillLastMobile && "max-sm:col-span-2",
                  isLast && fillLastSm && "sm:col-span-2",
                )}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes={
                    featureFirst && isFirst
                      ? "(min-width: 640px) 62vw, 100vw"
                      : "(min-width: 640px) 33vw, 50vw"
                  }
                  className="object-cover transition-transform duration-300 ease-[var(--ease-smooth)] group-hover:scale-105"
                />
              </StaggerItem>
            );
          })}
        </Stagger>
      </Container>
    </section>
  );
}
