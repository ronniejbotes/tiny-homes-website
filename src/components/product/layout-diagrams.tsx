import Image from "next/image";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import type { ProductImage } from "./product-images";

/**
 * Layouts & floor plans — diagram-kind images rendered at their native aspect
 * ratio (unlike the cropping photo gallery), so plan sheets and cutaway
 * renders stay readable.
 */
export function LayoutDiagrams({
  productName,
  images,
}: {
  productName: string;
  images: ProductImage[];
}) {
  if (images.length === 0) return null;
  return (
    <section aria-label={`${productName} layouts and floor plans`} className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Layouts"
          title="Floor plans and sizes"
          intro="Every layout in the range — pick the one that fits how you'll live, and we'll build to it."
        />
        <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {images.map((image) => (
            <StaggerItem
              key={image.src}
              className="overflow-hidden rounded-2xl border border-border bg-cream"
            >
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="h-auto w-full"
              />
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
