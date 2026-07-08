"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/cn";

export interface AccordionEntry {
  q: string;
  a: string;
}

/** Accessible FAQ accordion: one panel open at a time, animated height. */
export function Accordion({ items }: { items: AccordionEntry[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();
  const reduce = useReducedMotion();

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
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`${baseId}-panel-${i}`}
                  role="region"
                  aria-labelledby={`${baseId}-button-${i}`}
                  initial={reduce ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduce ? undefined : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-3xl px-6 pb-6 leading-relaxed text-stone">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
