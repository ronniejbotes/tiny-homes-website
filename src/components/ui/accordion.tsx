"use client";

import { useId, useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/cn";

export interface AccordionEntry {
  q: string;
  a: string;
}

/**
 * Accessible FAQ accordion: one panel open at a time, animated height.
 *
 * Every answer is rendered into the HTML, open or closed. Closed panels
 * collapse to zero height (the grid-rows 0fr/1fr transition) and are `inert`,
 * so they are neither seen, focused nor read out, but a crawler reading the
 * served page still finds every answer. Unmounting closed panels left all but
 * the first answer out of the HTML, while the FAQPage JSON-LD built from the
 * same items carried them all (found 14 October 2026).
 */
export function Accordion({ items }: { items: AccordionEntry[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();

  return (
    <div className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-parchment/60">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`${baseId}-panel-${i}`}
                id={`${baseId}-button-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex min-h-14 w-full cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left text-base font-medium text-ink transition-colors hover:bg-sand/40 sm:text-lg"
              >
                {item.q}
                <Plus
                  aria-hidden="true"
                  className={cn(
                    "h-5 w-5 shrink-0 text-clay transition-transform duration-200",
                    isOpen && "rotate-45",
                  )}
                />
              </button>
            </h3>
            <div
              id={`${baseId}-panel-${i}`}
              role="region"
              aria-labelledby={`${baseId}-button-${i}`}
              inert={!isOpen}
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-300 ease-in-out motion-reduce:transition-none",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <p className="max-w-3xl px-6 pb-6 leading-relaxed text-stone">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
