import type { ReactNode } from "react";

/**
 * A table cell's column heading, shown only on a phone. Under `sm` the
 * comparison tables (housing pods, blog posts) are a stack of cards, one per
 * row, and their <thead> is visually hidden, so each cell carries its own
 * heading. From `sm` up the table's real header row is back and this is
 * hidden. Added 15 October 2026 (mobile review).
 */
export function PhoneLabel({ children }: { children: ReactNode }) {
  return (
    <span className="mb-0.5 block text-xs font-medium tracking-[0.12em] text-stone uppercase sm:hidden">
      {children}
    </span>
  );
}
