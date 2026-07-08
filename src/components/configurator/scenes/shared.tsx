"use client";

/**
 * Shared drawing language for the configurator cutaway scenes.
 *
 * All scenes use viewBox="0 0 800 500", ink strokes ~2.2px at 0.85 opacity,
 * token colors via CSS vars only, ground line at y=432 and (usually) an
 * interior floor at y=400. Every toggling layer is wrapped in <Layer>.
 */

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export const INK = "var(--color-ink)";
export const SW = 2.2;
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/* ------------------------------------------------------------------ */
/* Animated toggle layer                                               */
/* ------------------------------------------------------------------ */

export function Layer({
  id,
  show,
  delay = 0,
  children,
}: {
  id: string;
  show: boolean;
  delay?: number;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.g
          key={id}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: { duration: 0.35, delay, ease: EASE },
          }}
          exit={{
            opacity: 0,
            ...(reduce ? {} : { y: 8 }),
            transition: { duration: 0.2, ease: "easeOut" },
          }}
        >
          {children}
        </motion.g>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/* Scenery                                                             */
/* ------------------------------------------------------------------ */

export function Scenery() {
  return (
    <g>
      <rect x={0} y={0} width={800} height={500} fill="var(--color-cream)" />
      <line
        x1={24}
        y1={432}
        x2={776}
        y2={432}
        stroke="var(--color-sage)"
        strokeWidth={3}
        strokeLinecap="round"
      />
    </g>
  );
}

export function Tree({ x, h = 92 }: { x: number; h?: number }) {
  const base = 432;
  return (
    <g opacity={0.92}>
      <line
        x1={x}
        y1={base}
        x2={x}
        y2={base - h * 0.5}
        stroke={INK}
        strokeWidth={SW}
        strokeOpacity={0.85}
        strokeLinecap="round"
      />
      <circle cx={x} cy={base - h * 0.5 - h * 0.24} r={h * 0.3} fill="var(--color-moss)" opacity={0.85} />
      <circle cx={x - h * 0.17} cy={base - h * 0.42} r={h * 0.19} fill="var(--color-sage)" opacity={0.9} />
    </g>
  );
}

export function Shrub({ x }: { x: number }) {
  return (
    <g>
      <ellipse cx={x} cy={432 - 10} rx={24} ry={11} fill="var(--color-sage)" opacity={0.8} />
      <ellipse cx={x + 17} cy={432 - 7} rx={14} ry={7} fill="var(--color-moss)" opacity={0.55} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Floors & walls                                                      */
/* ------------------------------------------------------------------ */

/** Plain stone-tint slab — the OFF state of the floor. Always rendered. */
export function BaseFloor({ x, w, floor }: { x: number; w: number; floor: number }) {
  return <rect x={x} y={floor} width={w} height={8} rx={2} fill="var(--color-stone)" opacity={0.3} />;
}

/** Warm plank boards — the upgraded-floors ON state, overlays the slab. */
export function PlankFloor({ x, w, floor }: { x: number; w: number; floor: number }) {
  const pw = 30;
  const n = Math.floor(w / pw);
  const planks: React.ReactElement[] = [];
  for (let i = 0; i < n; i++) {
    planks.push(
      <rect
        key={i}
        x={x + i * pw + 1.5}
        y={floor}
        width={pw - 3}
        height={8}
        rx={2}
        fill={i % 2 === 0 ? "var(--color-clay-light)" : "var(--color-sand)"}
        opacity={0.95}
      />,
    );
  }
  const rem = w - n * pw;
  if (rem > 8) {
    planks.push(
      <rect
        key="tail"
        x={x + n * pw + 1.5}
        y={floor}
        width={rem - 3}
        height={8}
        rx={2}
        fill={n % 2 === 0 ? "var(--color-clay-light)" : "var(--color-sand)"}
        opacity={0.95}
      />,
    );
  }
  return <g>{planks}</g>;
}

/** Vertical timber slat wall treatment — upgraded-walls ON state (background tint). */
export function SlatWalls({
  x,
  w,
  top,
  bottom,
}: {
  x: number;
  w: number;
  top: number;
  bottom: number;
}) {
  const lines: React.ReactElement[] = [];
  for (let px = x + 10; px < x + w - 4; px += 14) {
    lines.push(
      <line
        key={px}
        x1={px}
        y1={top}
        x2={px}
        y2={bottom}
        stroke="var(--color-clay)"
        strokeWidth={1.4}
        strokeOpacity={0.32}
      />,
    );
  }
  return (
    <g>
      <rect x={x} y={top} width={w} height={bottom - top} fill="var(--color-sage)" opacity={0.16} />
      {lines}
    </g>
  );
}

/** Thickened insulated cross-section band along a straight wall/roof edge. */
export function InsulationBand({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="var(--color-sage)"
        strokeWidth={9}
        strokeOpacity={0.55}
        strokeLinecap="round"
      />
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={INK}
        strokeWidth={1.8}
        strokeDasharray="1.5 7"
        strokeOpacity={0.5}
        strokeLinecap="round"
      />
    </g>
  );
}

/** Curved variant of the insulation band for domes and capsules. */
export function InsulationPath({ d }: { d: string }) {
  return (
    <g fill="none">
      <path d={d} stroke="var(--color-sage)" strokeWidth={9} strokeOpacity={0.55} strokeLinecap="round" />
      <path
        d={d}
        stroke={INK}
        strokeWidth={1.8}
        strokeDasharray="1.5 7"
        strokeOpacity={0.5}
        strokeLinecap="round"
      />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Modules                                                             */
/* ------------------------------------------------------------------ */

/** Bathroom module: tiled floor, partition(s), shower + spray, toilet, basin. */
export function WetRoom({
  x,
  floor,
  w = 88,
  h = 118,
  partitions = "right",
}: {
  x: number;
  floor: number;
  w?: number;
  h?: number;
  partitions?: "left" | "right" | "both";
}) {
  const showerX = x + 16;
  const headY = floor - h + 18;
  const ticks: React.ReactElement[] = [];
  for (let tx = x + 12; tx < x + w - 4; tx += 12) {
    ticks.push(
      <line key={tx} x1={tx} y1={floor + 1} x2={tx} y2={floor + 7} stroke={INK} strokeWidth={1} strokeOpacity={0.3} />,
    );
  }
  return (
    <g>
      {/* tiled floor patch */}
      <rect x={x + 2} y={floor} width={w - 4} height={8} fill="var(--color-sage)" opacity={0.55} />
      {ticks}
      {/* partitions */}
      {partitions !== "left" && (
        <line x1={x + w} y1={floor - h} x2={x + w} y2={floor} stroke={INK} strokeWidth={SW} strokeOpacity={0.85} strokeLinecap="round" />
      )}
      {partitions !== "right" && (
        <line x1={x} y1={floor - h} x2={x} y2={floor} stroke={INK} strokeWidth={SW} strokeOpacity={0.85} strokeLinecap="round" />
      )}
      {/* shower arm + head */}
      <path
        d={`M ${showerX - 9} ${headY - 9} h 13 v 6`}
        fill="none"
        stroke={INK}
        strokeWidth={SW}
        strokeOpacity={0.85}
        strokeLinecap="round"
      />
      <rect x={showerX - 2} y={headY - 3} width={12} height={5} rx={2.5} fill={INK} opacity={0.85} />
      {/* spray arc */}
      <path
        d={`M ${showerX} ${headY + 5} l -4 28 M ${showerX + 4} ${headY + 5} v 30 M ${showerX + 8} ${headY + 5} l 4 28`}
        fill="none"
        stroke="var(--color-sage)"
        strokeWidth={2}
        strokeDasharray="2 5"
        strokeLinecap="round"
      />
      {/* toilet: cistern, seat, pedestal */}
      <rect x={x + 34} y={floor - 30} width={8} height={26} rx={2} fill="var(--color-parchment)" stroke={INK} strokeWidth={1.6} strokeOpacity={0.75} />
      <rect x={x + 41} y={floor - 17} width={17} height={6} rx={3} fill="var(--color-cream)" stroke={INK} strokeWidth={1.6} strokeOpacity={0.75} />
      <rect x={x + 45} y={floor - 11} width={8} height={11} rx={2} fill="var(--color-parchment)" stroke={INK} strokeWidth={1.4} strokeOpacity={0.6} />
      {/* basin on pedestal + tap */}
      <rect x={x + 63} y={floor - 40} width={19} height={6} rx={3} fill="var(--color-cream)" stroke={INK} strokeWidth={1.6} strokeOpacity={0.75} />
      <rect x={x + 70} y={floor - 34} width={5} height={34} fill={INK} opacity={0.45} />
      <path d={`M ${x + 72} ${floor - 43} v -5 h 6`} fill="none" stroke={INK} strokeWidth={1.8} strokeOpacity={0.8} strokeLinecap="round" />
    </g>
  );
}

/** Kitchen counter run: counter, sink + tap, hob rings, under-counter fridge. */
export function Kitchen({ x, floor, w = 110 }: { x: number; floor: number; w?: number }) {
  const h = 34;
  const top = floor - h;
  return (
    <g>
      {/* counter body */}
      <rect x={x} y={top} width={w} height={h} rx={3} fill="var(--color-sand)" stroke={INK} strokeWidth={SW} strokeOpacity={0.85} />
      {/* counter top */}
      <rect x={x - 3} y={top - 4} width={w + 6} height={4} rx={2} fill="var(--color-clay)" opacity={0.9} />
      {/* sink recess + tap */}
      <rect x={x + 10} y={top - 3.5} width={22} height={3.5} fill="var(--color-cream)" stroke={INK} strokeWidth={1.1} strokeOpacity={0.55} />
      <path d={`M ${x + 21} ${top - 6} v -8 h 8`} fill="none" stroke={INK} strokeWidth={2} strokeOpacity={0.85} strokeLinecap="round" />
      {/* hob rings */}
      <ellipse cx={x + w - 44} cy={top - 6} rx={5.5} ry={2} fill="none" stroke={INK} strokeWidth={1.6} strokeOpacity={0.8} />
      <ellipse cx={x + w - 28} cy={top - 6} rx={5.5} ry={2} fill="none" stroke={INK} strokeWidth={1.6} strokeOpacity={0.8} />
      {/* under-counter fridge outline */}
      <rect x={x + w - 32} y={top + 6} width={25} height={h - 11} rx={2} fill="var(--color-cream)" stroke={INK} strokeWidth={1.6} strokeOpacity={0.7} />
      <line x1={x + w - 28} y1={top + 10} x2={x + w - 28} y2={top + 19} stroke={INK} strokeWidth={1.6} strokeOpacity={0.6} strokeLinecap="round" />
      {/* cabinet door line */}
      <line x1={x + 40} y1={top + 4} x2={x + 40} y2={floor - 4} stroke={INK} strokeWidth={1.2} strokeOpacity={0.4} />
    </g>
  );
}

/** Overhead cupboard row (only rendered when the kitchen is on). */
export function Cupboards({ x, w, bottom }: { x: number; w: number; bottom: number }) {
  const h = 26;
  const doors = Math.max(2, Math.round(w / 40));
  const dividers: React.ReactElement[] = [];
  const handles: React.ReactElement[] = [];
  for (let i = 1; i < doors; i++) {
    const dx = x + (i * w) / doors;
    dividers.push(
      <line key={i} x1={dx} y1={bottom - h + 3} x2={dx} y2={bottom - 3} stroke={INK} strokeWidth={1.2} strokeOpacity={0.5} />,
    );
  }
  for (let i = 0; i < doors; i++) {
    const cx = x + (i * w) / doors + w / doors / 2;
    handles.push(
      <line key={i} x1={cx - 4} y1={bottom - 6} x2={cx + 4} y2={bottom - 6} stroke={INK} strokeWidth={1.6} strokeOpacity={0.6} strokeLinecap="round" />,
    );
  }
  return (
    <g>
      <rect x={x} y={bottom - h} width={w} height={h} rx={3} fill="var(--color-sand)" stroke={INK} strokeWidth={SW} strokeOpacity={0.85} />
      {dividers}
      {handles}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Furniture                                                           */
/* ------------------------------------------------------------------ */

/** Bed with headboard, pillows and duvet. Footprint: x .. x+w+5. */
export function Bed({ x, floor, w = 78 }: { x: number; floor: number; w?: number }) {
  const h = 22;
  return (
    <g>
      <rect x={x} y={floor - 54} width={7} height={54} rx={3} fill="var(--color-clay)" opacity={0.9} />
      <rect x={x + 5} y={floor - h} width={w} height={h} rx={4} fill="var(--color-sand)" stroke={INK} strokeWidth={SW} strokeOpacity={0.85} />
      <rect x={x + 32} y={floor - h - 5} width={w - 27} height={9} rx={4.5} fill="var(--color-sage)" opacity={0.95} />
      <rect x={x + 9} y={floor - h - 9} width={20} height={10} rx={4} fill="var(--color-cream)" stroke={INK} strokeWidth={1.4} strokeOpacity={0.6} />
      <rect x={x + 13} y={floor - h - 15} width={18} height={9} rx={4} fill="var(--color-parchment)" stroke={INK} strokeWidth={1.4} strokeOpacity={0.6} />
    </g>
  );
}

/** Round bed for The Dome. Footprint: cx-58 .. cx+58. */
export function RoundBed({ cx, floor }: { cx: number; floor: number }) {
  return (
    <g>
      <path d={`M ${cx - 52} ${floor - 14} a 52 34 0 0 1 104 0`} fill="none" stroke="var(--color-clay)" strokeWidth={4} strokeOpacity={0.85} strokeLinecap="round" />
      <path d={`M ${cx - 40} ${floor - 16} q 40 -34 80 0`} fill="var(--color-sage)" opacity={0.55} />
      <ellipse cx={cx} cy={floor - 12} rx={56} ry={12} fill="var(--color-sand)" stroke={INK} strokeWidth={SW} strokeOpacity={0.85} />
      <rect x={cx - 34} y={floor - 30} width={20} height={9} rx={4} fill="var(--color-cream)" stroke={INK} strokeWidth={1.4} strokeOpacity={0.6} />
      <rect x={cx + 12} y={floor - 30} width={20} height={9} rx={4} fill="var(--color-cream)" stroke={INK} strokeWidth={1.4} strokeOpacity={0.6} />
    </g>
  );
}

/** Bedside table with a small lamp. Footprint: x .. x+16. */
export function SideTable({ x, floor }: { x: number; floor: number }) {
  return (
    <g>
      <rect x={x} y={floor - 20} width={16} height={20} rx={2} fill="var(--color-parchment)" stroke={INK} strokeWidth={1.8} strokeOpacity={0.8} />
      <line x1={x + 8} y1={floor - 20} x2={x + 8} y2={floor - 31} stroke={INK} strokeWidth={1.8} strokeOpacity={0.8} />
      <path d={`M ${x + 2} ${floor - 31} h 12 l -3 -8 h -6 z`} fill="var(--color-clay)" opacity={0.9} />
    </g>
  );
}

/** Compact sofa. Footprint: x .. x+w+9. */
export function SofaItem({ x, floor, w = 50 }: { x: number; floor: number; w?: number }) {
  return (
    <g>
      <rect x={x} y={floor - 38} width={10} height={38} rx={4} fill="var(--color-clay)" opacity={0.92} />
      <rect x={x + 4} y={floor - 21} width={w} height={15} rx={5} fill="var(--color-clay)" opacity={0.92} />
      <rect x={x + w - 1} y={floor - 29} width={9} height={23} rx={4} fill="var(--color-clay-dark)" opacity={0.9} />
      <rect x={x + 8} y={floor - 29} width={16} height={10} rx={4} fill="var(--color-clay-light)" />
      <line x1={x + 8} y1={floor - 6} x2={x + 8} y2={floor} stroke={INK} strokeWidth={2} strokeOpacity={0.8} />
      <line x1={x + w} y1={floor - 6} x2={x + w} y2={floor} stroke={INK} strokeWidth={2} strokeOpacity={0.8} />
    </g>
  );
}

/** Coffee table. Footprint: x .. x+w. */
export function CoffeeTable({ x, floor, w = 24 }: { x: number; floor: number; w?: number }) {
  return (
    <g>
      <rect x={x} y={floor - 15} width={w} height={3.5} rx={1.75} fill={INK} opacity={0.85} />
      <line x1={x + 4} y1={floor - 12} x2={x + 4} y2={floor} stroke={INK} strokeWidth={2} strokeOpacity={0.85} />
      <line x1={x + w - 4} y1={floor - 12} x2={x + w - 4} y2={floor} stroke={INK} strokeWidth={2} strokeOpacity={0.85} />
    </g>
  );
}

/** Rug ellipse lying on the floor. */
export function Rug({ cx, floor, rx = 34 }: { cx: number; floor: number; rx?: number }) {
  return (
    <ellipse
      cx={cx}
      cy={floor + 4}
      rx={rx}
      ry={4.5}
      fill="var(--color-clay)"
      opacity={0.28}
      stroke="var(--color-clay)"
      strokeOpacity={0.45}
      strokeWidth={1.4}
    />
  );
}

/** Potted plant, compact spread (~±9px around pot centre). Footprint: x .. x+12. */
export function Plant({ x, floor }: { x: number; floor: number }) {
  const cx = x + 6;
  return (
    <g>
      <path d={`M ${x} ${floor - 13} h 12 l -2 13 h -8 z`} fill="var(--color-clay-dark)" opacity={0.9} />
      <path d={`M ${cx} ${floor - 13} q -8 -10 -9 -22`} fill="none" stroke="var(--color-moss)" strokeWidth={2.4} strokeLinecap="round" />
      <path d={`M ${cx} ${floor - 13} q 1 -14 2 -26`} fill="none" stroke="var(--color-moss)" strokeWidth={2.4} strokeLinecap="round" />
      <path d={`M ${cx} ${floor - 13} q 8 -8 9 -18`} fill="none" stroke="var(--color-sage)" strokeWidth={2.4} strokeLinecap="round" />
    </g>
  );
}

/** Two small framed prints for the wall. Footprint: x .. x+50. */
export function WallArt({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width={26} height={20} rx={2} fill="var(--color-parchment)" stroke={INK} strokeWidth={1.8} strokeOpacity={0.8} />
      <path d={`M ${x + 4} ${y + 14} l 6 -7 l 5 5 l 4 -6 l 3 4`} fill="none" stroke="var(--color-moss)" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      <rect x={x + 33} y={y + 4} width={16} height={13} rx={2} fill="var(--color-sage)" opacity={0.7} stroke={INK} strokeWidth={1.4} strokeOpacity={0.6} />
    </g>
  );
}

/** Pendant light hanging from a ceiling point (used in The Dome). */
export function Pendant({ x, top, drop = 52 }: { x: number; top: number; drop?: number }) {
  return (
    <g>
      <line x1={x} y1={top} x2={x} y2={top + drop} stroke={INK} strokeWidth={1.6} strokeOpacity={0.8} />
      {/* shade: narrow at cord, wide at mouth */}
      <path
        d={`M ${x - 3} ${top + drop} h 6 l 5 12 h -16 z`}
        fill="var(--color-clay)"
        opacity={0.9}
      />
    </g>
  );
}
