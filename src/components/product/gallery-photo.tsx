"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { ProductImage } from "./product-images";

/**
 * One gallery tile that opens its photo full size on a tap or click.
 *
 * The tiles zoomed on hover but did nothing on a tap, and Clarity counted the
 * taps as dead clicks on every product page (29 Oct 2026 review, Fix-now item
 * 8: "a tap opens the photo full size"). A native <dialog> opened with
 * showModal() sits in the top layer, so the transformed reveal wrappers and
 * the tile's overflow-hidden can't clip it, and it brings focus handling and
 * Escape-to-close with it. The full-size <Image> renders only while the dialog
 * is open, so the page HTML carries no second copy of each photo and nothing
 * extra downloads until someone asks for it.
 */
export function GalleryPhoto({ image, sizes }: { image: ProductImage; sizes: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && dialog && !dialog.open) dialog.showModal();
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="absolute inset-0 block h-full w-full cursor-zoom-in overflow-hidden rounded-2xl focus-visible:outline-offset-[-4px]"
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-300 ease-[var(--ease-smooth)] group-hover:scale-105"
        />
      </button>

      <dialog
        ref={dialogRef}
        aria-label={image.alt}
        onClose={() => setOpen(false)}
        // A tap on the dark surround (the dialog box itself, not the photo or
        // the button) closes it, as people expect of a photo viewer.
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
        className="m-0 h-full max-h-none w-full max-w-none overscroll-contain bg-ink/95 p-0"
      >
        {open && (
          <div className="pointer-events-none flex h-full w-full items-center justify-center p-4 sm:p-10">
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              sizes="100vw"
              className="pointer-events-auto h-auto max-h-full w-auto max-w-full rounded-xl object-contain"
            />
          </div>
        )}
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          aria-label="Close photo"
          className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-cream/90 text-ink transition-colors hover:bg-cream sm:right-6 sm:top-6"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </dialog>
    </>
  );
}
