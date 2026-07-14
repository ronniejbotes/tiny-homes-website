"use client";

import { MotionConfig, motion, type Variants } from "framer-motion";
import { cn } from "@/lib/cn";

/* Reduced-motion handling is delegated to <MotionConfig reducedMotion="user">:
   framer-motion disables the transform (y) animation for prefers-reduced-motion
   visitors while the opacity fade still completes, so revealed content always
   reaches its visible state. Deriving this manually from useReducedMotion()
   left Stagger grids permanently invisible — the hook resolves only after the
   hidden `initial` state has been committed, and `initial` is mount-only. */

/**
 * Scroll-triggered reveal. Fades + rises content into view once, when ~20%
 * of it enters the viewport. Respects prefers-reduced-motion.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "section" | "li" | "span";
}) {
  const MotionTag = motion[Tag];

  return (
    <MotionConfig reducedMotion="user">
      <MotionTag
        className={className}
        initial={{ opacity: 0, y }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2, margin: "0px 0px -40px 0px" }}
        transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
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
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
};

/** Parent that staggers its <StaggerItem> children into view. */
export function Stagger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className={className}
        variants={staggerParent}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={cn(className)} variants={staggerChild}>
      {children}
    </motion.div>
  );
}
