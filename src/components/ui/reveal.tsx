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
   left Stagger grids permanently invisible — the hook resolves only after the
   hidden `initial` state has been committed, and `initial` is mount-only. */

/**
 * Scroll-triggered reveal. Fades + rises content into view once, when ~20%
 * of it enters the viewport. Respects prefers-reduced-motion.
 *
 * Backward-compatible: every prop that existed before (children, className,
 * delay, y, as) keeps its original default and behaviour. `amount` and
 * `duration` are new, optional, and default to the previous hard-coded values.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  amount = 0.2,
  duration = DURATION.reveal,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  amount?: number;
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
        viewport={{ once: true, amount, margin: "0px 0px -40px 0px" }}
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
 *  `amount` (new, optional) tunes how much must be visible before the run
 *  begins; it defaults to the previous 0.15. */
export function Stagger({
  children,
  className,
  amount = 0.15,
}: {
  children: React.ReactNode;
  className?: string;
  amount?: number;
}) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className={className}
        variants={staggerParent}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}

/** A staggered child. With no extra props it fades up exactly as before.
 *  Pass `x` (and/or a custom `y`) for a subtle directional drift — used to
 *  give the showcase grid an alternating left/right entrance. The parent's
 *  reducedMotion="user" still strips the transform for reduced-motion users. */
export function StaggerItem({
  children,
  className,
  x = 0,
  y = 24,
}: {
  children: React.ReactNode;
  className?: string;
  x?: number;
  y?: number;
}) {
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
    <motion.div className={cn(className)} variants={variants ?? staggerChild}>
      {children}
    </motion.div>
  );
}
