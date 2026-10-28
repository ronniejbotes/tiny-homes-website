"use client";

import { MotionConfig, motion, type Variants } from "framer-motion";
import { cn } from "@/lib/cn";

/* ---- Shared motion language ----
   One easing curve and a small set of durations power every reveal across the
   site, so the whole page moves as a single system. EASE is the project's
   ease-out-expo (mirrors --ease-out-expo in globals.css): a confident, non-bouncy
   settle that suits a calm, architectural brand. Exported so home sections can
   compose bespoke transforms (parallax, count-ups, drift) on the same curve. */
export const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const DURATION = {
  reveal: 0.7,
  child: 0.65,
} as const;

/* Reduced-motion handling is delegated to <MotionConfig reducedMotion="user">:
   framer-motion disables the transform (x/y) animation for prefers-reduced-motion
   visitors while the opacity fade still completes, so revealed content always
   reaches its visible state. Deriving this manually from useReducedMotion()
   left Stagger grids permanently invisible, the hook resolves only after the
   hidden `initial` state has been committed, and `initial` is mount-only. */

/* When a reveal fires: as soon as the top edge is 40px inside the viewport
   ("some" plus a bottom margin), not once a fraction of the element is visible.
   A fraction never fires on an element taller than the viewport divided by it.
   Until 29 October 2026 Stagger waited for 15% of its group. The /blog list had
   grown to 17 posts, about 6,300px, so the cards needed 945px of a laptop's
   roughly 870px viewport and stayed invisible however far a visitor scrolled. */
const VIEWPORT_MARGIN = "0px 0px -40px 0px";

/**
 * Scroll-triggered reveal. Fades + rises content into view once, when its top
 * edge comes 40px into the viewport. Respects prefers-reduced-motion.
 *
 * `amount` is still accepted, but a number only suits an element that is
 * always shorter than the viewport; see VIEWPORT_MARGIN above.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  amount = "some",
  duration = DURATION.reveal,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  amount?: number | "some" | "all";
  duration?: number;
  as?: "div" | "section" | "li" | "span";
}) {
  const MotionTag = motion[Tag];

  return (
    <MotionConfig reducedMotion="user">
      <MotionTag
        className={className}
        initial={{ opacity: 0, y }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount, margin: VIEWPORT_MARGIN }}
        transition={{ duration, delay, ease: EASE }}
      >
        {children}
      </MotionTag>
    </MotionConfig>
  );
}

const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

const staggerChild: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: DURATION.child, ease: EASE } },
};

/** Parent that staggers its <StaggerItem> children into view.
 *  The run begins when the group's top edge is 40px into the viewport, the
 *  same rule as Reveal, so a long list can never stay hidden. `as` (optional)
 *  lets a staggered group render as a real list, the way Reveal already
 *  allows; it defaults to "div". */
export function Stagger({
  children,
  className,
  amount = "some",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  amount?: number | "some" | "all";
  as?: "div" | "ul" | "ol";
}) {
  const MotionTag = motion[Tag];

  return (
    <MotionConfig reducedMotion="user">
      <MotionTag
        className={className}
        variants={staggerParent}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount, margin: VIEWPORT_MARGIN }}
      >
        {children}
      </MotionTag>
    </MotionConfig>
  );
}

/** A staggered child. With no extra props it fades up exactly as before.
 *  Pass `x` (and/or a custom `y`) for a subtle directional drift, used to
 *  give the showcase grid an alternating left/right entrance. The parent's
 *  reducedMotion="user" still strips the transform for reduced-motion users. */
export function StaggerItem({
  children,
  className,
  x = 0,
  y = 24,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  x?: number;
  y?: number;
  as?: "div" | "li";
}) {
  const MotionTag = motion[Tag];
  const custom = x !== 0 || y !== 24;
  const variants: Variants | undefined = custom
    ? {
        hidden: { opacity: 0, x, y },
        show: {
          opacity: 1,
          x: 0,
          y: 0,
          transition: { duration: DURATION.child, ease: EASE },
        },
      }
    : undefined;

  return (
    <MotionTag className={cn(className)} variants={variants ?? staggerChild}>
      {children}
    </MotionTag>
  );
}
