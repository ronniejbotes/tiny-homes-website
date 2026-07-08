"use client";

/**
 * Shared drawing language for the configurator cutaway scenes.
 *
 * All scenes use viewBox="0 0 800 500", ink strokes ~2.2px at 0.85 opacity,
 * token colors via CSS vars only, ground line at y=432 and (usually) an
 * interior floor at y=400. Every toggling layer is wrapped in <Layer>.
 *
 * V2: rich flat-illustration language. <Scenery> now embeds <SceneDefs>
 * (namespaced "th-" gradients, patterns and a soft-shadow blur filter) so
 * every primitive rendered in the same SVG can reference them. Furniture
 * pieces carry soft ground shadows and 2-tone fills for depth.
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

/** Semantic convenience: a Layer that groups several primitives together. */
export function LayerGroup({
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
  return (
    <Layer id={id} show={show} delay={delay}>
      {children}
    </Layer>
  );
}

/* ------------------------------------------------------------------ */
/* Shared defs — gradients, patterns, soft-shadow filter               */
/* ------------------------------------------------------------------ */

/**
 * Namespaced defs used by the primitives below. Rendered once per scene by
 * <Scenery>; export kept public for scenes that compose their own backdrop.
 */
export function SceneDefs() {
  return (
    <defs>
      {/* interior wall wash: parchment fading into sand */}
      <linearGradient id="th-wall-wash" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="var(--color-parchment)" stopOpacity={0.9} />
        <stop offset="100%" stopColor="var(--color-sand)" stopOpacity={0.75} />
      </linearGradient>
      {/* floor planks: warm clay wash at low opacity */}
      <linearGradient id="th-plank" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="var(--color-clay-light)" stopOpacity={0.35} />
        <stop offset="100%" stopColor="var(--color-clay)" stopOpacity={0.22} />
      </linearGradient>
      {/* soft sky wash for the top of the scene */}
      <linearGradient id="th-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="var(--color-sage)" stopOpacity={0.16} />
        <stop offset="70%" stopColor="var(--color-cream)" stopOpacity={0} />
      </linearGradient>
      {/* window glass sheen */}
      <linearGradient id="th-glass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="var(--color-sage)" stopOpacity={0.38} />
        <stop offset="55%" stopColor="var(--color-cream)" stopOpacity={0.14} />
        <stop offset="100%" stopColor="var(--color-sage)" stopOpacity={0.28} />
      </linearGradient>
      {/* warm lamp glow */}
      <radialGradient id="th-glow" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor="var(--color-clay-light)" stopOpacity={0.4} />
        <stop offset="100%" stopColor="var(--color-clay-light)" stopOpacity={0} />
      </radialGradient>
      {/* underfloor heating strip: fades upward from the floor line */}
      <linearGradient id="th-heat" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="var(--color-clay-light)" stopOpacity={0} />
        <stop offset="100%" stopColor="var(--color-clay-light)" stopOpacity={0.55} />
      </linearGradient>
      {/* tv screen */}
      <linearGradient id="th-screen" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="var(--color-forest)" stopOpacity={0.95} />
        <stop offset="100%" stopColor="var(--color-forest-light)" stopOpacity={0.95} />
      </linearGradient>
      {/* soft cast-shadow blur */}
      <filter id="th-soft" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation={1.8} />
      </filter>
      {/* subtle wood grain: thin sand strokes */}
      <pattern id="th-wood" width={46} height={9} patternUnits="userSpaceOnUse">
        <path
          d="M 0 2.5 q 11 1.6 23 0 t 23 0"
          fill="none"
          stroke="var(--color-sand)"
          strokeWidth={0.9}
          strokeOpacity={0.55}
        />
        <path
          d="M 0 6.5 q 14 -1.4 26 0 t 20 0"
          fill="none"
          stroke="var(--color-sand)"
          strokeWidth={0.7}
          strokeOpacity={0.4}
        />
      </pattern>
      {/* very low-opacity fabric stipple */}
      <pattern id="th-fabric" width={6} height={6} patternUnits="userSpaceOnUse">
        <circle cx={1.4} cy={1.4} r={0.65} fill={INK} opacity={0.05} />
        <circle cx={4.4} cy={4.4} r={0.65} fill={INK} opacity={0.04} />
      </pattern>
    </defs>
  );
}

/** Soft elliptical ground shadow under a furniture piece. */
export function GroundShadow({
  cx,
  y,
  rx,
  opacity = 0.1,
}: {
  cx: number;
  y: number;
  rx: number;
  opacity?: number;
}) {
  return (
    <ellipse
      cx={cx}
      cy={y + 3}
      rx={rx}
      ry={Math.max(3, rx * 0.14)}
      fill={INK}
      opacity={opacity}
      filter="url(#th-soft)"
      aria-hidden="true"
    />
  );
}

/* ------------------------------------------------------------------ */
/* Scenery                                                             */
/* ------------------------------------------------------------------ */

export function Scenery() {
  return (
    <g aria-hidden="true">
      <SceneDefs />
      <rect x={0} y={0} width={800} height={500} fill="var(--color-cream)" />
      {/* soft sky wash */}
      <rect x={0} y={0} width={800} height={300} fill="url(#th-sky)" />
      {/* faint ground band below the line */}
      <rect x={0} y={432} width={800} height={68} fill="var(--color-sage)" opacity={0.08} />
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
    <g opacity={0.92} aria-hidden="true">
      <ellipse cx={x} cy={base + 2} rx={h * 0.22} ry={4} fill={INK} opacity={0.08} filter="url(#th-soft)" />
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
      {/* canopy highlight */}
      <circle cx={x + h * 0.1} cy={base - h * 0.5 - h * 0.32} r={h * 0.12} fill="var(--color-sage)" opacity={0.55} />
    </g>
  );
}

export function Shrub({ x }: { x: number }) {
  return (
    <g aria-hidden="true">
      <ellipse cx={x + 6} cy={432 + 1} rx={26} ry={3.5} fill={INK} opacity={0.06} filter="url(#th-soft)" />
      <ellipse cx={x} cy={432 - 10} rx={24} ry={11} fill="var(--color-sage)" opacity={0.8} />
      <ellipse cx={x + 17} cy={432 - 7} rx={14} ry={7} fill="var(--color-moss)" opacity={0.55} />
      <ellipse cx={x - 9} cy={432 - 14} rx={9} ry={5} fill="var(--color-sage)" opacity={0.5} />
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
  return (
    <g aria-hidden="true">
      {planks}
      {/* warm wash + grain over the boards for depth */}
      <rect x={x} y={floor} width={w} height={8} rx={2} fill="url(#th-plank)" />
      <rect x={x} y={floor} width={w} height={8} rx={2} fill="url(#th-wood)" opacity={0.7} />
    </g>
  );
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
    <g aria-hidden="true">
      <rect x={x} y={top} width={w} height={bottom - top} fill="var(--color-sage)" opacity={0.16} />
      <rect x={x} y={top} width={w} height={bottom - top} fill="url(#th-wall-wash)" opacity={0.25} />
      {lines}
    </g>
  );
}

/** Thickened insulated cross-section band along a straight wall/roof edge. */
export function InsulationBand({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return (
    <g aria-hidden="true">
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
    <g fill="none" aria-hidden="true">
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
    <g aria-hidden="true">
      {/* wall wash behind the wet zone */}
      <rect x={x + 2} y={floor - h + 6} width={w - 4} height={h - 6} fill="url(#th-wall-wash)" opacity={0.3} />
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
      {/* fixture shadows */}
      <ellipse cx={x + 47} cy={floor + 2} rx={14} ry={2.5} fill={INK} opacity={0.08} filter="url(#th-soft)" />
      <ellipse cx={x + 72} cy={floor + 2} rx={10} ry={2.5} fill={INK} opacity={0.08} filter="url(#th-soft)" />
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
    <g aria-hidden="true">
      <GroundShadow cx={x + w / 2} y={floor + 2} rx={w / 2 - 4} opacity={0.08} />
      {/* counter body */}
      <rect x={x} y={top} width={w} height={h} rx={3} fill="var(--color-sand)" stroke={INK} strokeWidth={SW} strokeOpacity={0.85} />
      {/* cabinet wood grain + side shading */}
      <rect x={x + 1} y={top + 1} width={w - 2} height={h - 2} rx={3} fill="url(#th-wood)" opacity={0.8} />
      <rect x={x + w - 8} y={top + 1} width={7} height={h - 2} rx={3} fill="var(--color-clay)" opacity={0.18} />
      {/* counter top */}
      <rect x={x - 3} y={top - 4} width={w + 6} height={4} rx={2} fill="var(--color-clay)" opacity={0.9} />
      <rect x={x - 3} y={top - 4} width={w + 6} height={1.6} rx={0.8} fill="var(--color-clay-light)" opacity={0.7} />
      {/* sink recess + tap */}
      <rect x={x + 10} y={top - 3.5} width={22} height={3.5} fill="var(--color-cream)" stroke={INK} strokeWidth={1.1} strokeOpacity={0.55} />
      <path d={`M ${x + 21} ${top - 6} v -8 h 8`} fill="none" stroke={INK} strokeWidth={2} strokeOpacity={0.85} strokeLinecap="round" />
      {/* hob rings */}
      <ellipse cx={x + w - 44} cy={top - 6} rx={5.5} ry={2} fill="none" stroke={INK} strokeWidth={1.6} strokeOpacity={0.8} />
      <ellipse cx={x + w - 28} cy={top - 6} rx={5.5} ry={2} fill="none" stroke={INK} strokeWidth={1.6} strokeOpacity={0.8} />
      {/* under-counter fridge outline */}
      <rect x={x + w - 32} y={top + 6} width={25} height={h - 11} rx={2} fill="var(--color-cream)" stroke={INK} strokeWidth={1.6} strokeOpacity={0.7} />
      <line x1={x + w - 28} y1={top + 10} x2={x + w - 28} y2={top + 19} stroke={INK} strokeWidth={1.6} strokeOpacity={0.6} strokeLinecap="round" />
      {/* cabinet door line + handle */}
      <line x1={x + 40} y1={top + 4} x2={x + 40} y2={floor - 4} stroke={INK} strokeWidth={1.2} strokeOpacity={0.4} />
      <line x1={x + 34} y1={top + 9} x2={x + 34} y2={top + 16} stroke={INK} strokeWidth={1.6} strokeOpacity={0.5} strokeLinecap="round" />
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
    <g aria-hidden="true">
      <rect x={x} y={bottom - h} width={w} height={h} rx={3} fill="var(--color-sand)" stroke={INK} strokeWidth={SW} strokeOpacity={0.85} />
      <rect x={x + 1} y={bottom - h + 1} width={w - 2} height={h - 2} rx={3} fill="url(#th-wood)" opacity={0.75} />
      {/* under-cabinet shade line */}
      <rect x={x + 2} y={bottom - 2.5} width={w - 4} height={2.5} rx={1.2} fill={INK} opacity={0.12} />
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
    <g aria-hidden="true">
      <GroundShadow cx={x + w / 2 + 4} y={floor} rx={w / 2 + 4} />
      <rect x={x} y={floor - 54} width={7} height={54} rx={3} fill="var(--color-clay)" opacity={0.9} />
      <rect x={x + 1.5} y={floor - 54} width={2.5} height={54} rx={1.2} fill="var(--color-clay-light)" opacity={0.55} />
      <rect x={x + 5} y={floor - h} width={w} height={h} rx={4} fill="var(--color-sand)" stroke={INK} strokeWidth={SW} strokeOpacity={0.85} />
      {/* duvet with fold line */}
      <rect x={x + 32} y={floor - h - 5} width={w - 27} height={9} rx={4.5} fill="var(--color-sage)" opacity={0.95} />
      <path
        d={`M ${x + 36} ${floor - h + 1} q ${(w - 27) / 2 - 4} 3 ${w - 35} 0`}
        fill="none"
        stroke="var(--color-moss)"
        strokeWidth={1.3}
        strokeOpacity={0.55}
        strokeLinecap="round"
      />
      <rect x={x + 5} y={floor - h} width={w} height={h} rx={4} fill="url(#th-fabric)" />
      {/* pillows */}
      <rect x={x + 9} y={floor - h - 9} width={20} height={10} rx={4} fill="var(--color-cream)" stroke={INK} strokeWidth={1.4} strokeOpacity={0.6} />
      <rect x={x + 13} y={floor - h - 15} width={18} height={9} rx={4} fill="var(--color-parchment)" stroke={INK} strokeWidth={1.4} strokeOpacity={0.6} />
    </g>
  );
}

/** Round bed for The Dome. Footprint: cx-58 .. cx+58. */
export function RoundBed({ cx, floor }: { cx: number; floor: number }) {
  return (
    <g aria-hidden="true">
      <GroundShadow cx={cx} y={floor + 1} rx={56} />
      <path d={`M ${cx - 52} ${floor - 14} a 52 34 0 0 1 104 0`} fill="none" stroke="var(--color-clay)" strokeWidth={4} strokeOpacity={0.85} strokeLinecap="round" />
      <path d={`M ${cx - 40} ${floor - 16} q 40 -34 80 0`} fill="var(--color-sage)" opacity={0.55} />
      <ellipse cx={cx} cy={floor - 12} rx={56} ry={12} fill="var(--color-sand)" stroke={INK} strokeWidth={SW} strokeOpacity={0.85} />
      <ellipse cx={cx} cy={floor - 12} rx={56} ry={12} fill="url(#th-fabric)" />
      <path
        d={`M ${cx - 30} ${floor - 10} q 30 6 60 0`}
        fill="none"
        stroke="var(--color-clay)"
        strokeWidth={1.2}
        strokeOpacity={0.35}
        strokeLinecap="round"
      />
      <rect x={cx - 34} y={floor - 30} width={20} height={9} rx={4} fill="var(--color-cream)" stroke={INK} strokeWidth={1.4} strokeOpacity={0.6} />
      <rect x={cx + 12} y={floor - 30} width={20} height={9} rx={4} fill="var(--color-cream)" stroke={INK} strokeWidth={1.4} strokeOpacity={0.6} />
    </g>
  );
}

/** Bedside table with a small lamp. Footprint: x .. x+16. */
export function SideTable({ x, floor }: { x: number; floor: number }) {
  return (
    <g aria-hidden="true">
      <GroundShadow cx={x + 8} y={floor} rx={11} opacity={0.09} />
      <rect x={x} y={floor - 20} width={16} height={20} rx={2} fill="var(--color-parchment)" stroke={INK} strokeWidth={1.8} strokeOpacity={0.8} />
      <rect x={x + 1} y={floor - 20} width={14} height={2.4} rx={1.2} fill="var(--color-sand)" opacity={0.9} />
      <line x1={x + 8} y1={floor - 20} x2={x + 8} y2={floor - 31} stroke={INK} strokeWidth={1.8} strokeOpacity={0.8} />
      <path d={`M ${x + 2} ${floor - 31} h 12 l -3 -8 h -6 z`} fill="var(--color-clay)" opacity={0.9} />
      <ellipse cx={x + 8} cy={floor - 33} rx={10} ry={7} fill="url(#th-glow)" opacity={0.5} />
    </g>
  );
}

/** Compact sofa. Footprint: x .. x+w+9. */
export function SofaItem({ x, floor, w = 50 }: { x: number; floor: number; w?: number }) {
  return (
    <g aria-hidden="true">
      <GroundShadow cx={x + w / 2 + 4} y={floor} rx={w / 2 + 8} />
      <rect x={x} y={floor - 38} width={10} height={38} rx={4} fill="var(--color-clay)" opacity={0.92} />
      <rect x={x + 2} y={floor - 37} width={3} height={30} rx={1.5} fill="var(--color-clay-light)" opacity={0.5} />
      <rect x={x + 4} y={floor - 21} width={w} height={15} rx={5} fill="var(--color-clay)" opacity={0.92} />
      <rect x={x + w - 1} y={floor - 29} width={9} height={23} rx={4} fill="var(--color-clay-dark)" opacity={0.9} />
      <rect x={x + 8} y={floor - 29} width={16} height={10} rx={4} fill="var(--color-clay-light)" />
      {/* seat seam */}
      <line x1={x + 4 + w / 2} y1={floor - 19} x2={x + 4 + w / 2} y2={floor - 8} stroke="var(--color-clay-dark)" strokeWidth={1.2} strokeOpacity={0.5} />
      <rect x={x + 4} y={floor - 21} width={w} height={15} rx={5} fill="url(#th-fabric)" />
      <line x1={x + 8} y1={floor - 6} x2={x + 8} y2={floor} stroke={INK} strokeWidth={2} strokeOpacity={0.8} />
      <line x1={x + w} y1={floor - 6} x2={x + w} y2={floor} stroke={INK} strokeWidth={2} strokeOpacity={0.8} />
    </g>
  );
}

/** Larger sofa: 3 seat cushions, 2 back cushions and a clay throw blanket. */
export function SofaWithCushions({ x, floor, w = 72 }: { x: number; floor: number; w?: number }) {
  const seatY = floor - 22;
  const seatW = (w - 10) / 3;
  return (
    <g aria-hidden="true">
      <GroundShadow cx={x + w / 2 + 5} y={floor} rx={w / 2 + 10} />
      {/* base frame */}
      <rect x={x + 2} y={floor - 14} width={w + 6} height={12} rx={4} fill="var(--color-clay-dark)" opacity={0.92} />
      {/* arms */}
      <rect x={x} y={floor - 40} width={10} height={38} rx={4.5} fill="var(--color-clay)" opacity={0.94} />
      <rect x={x + w} y={floor - 40} width={10} height={38} rx={4.5} fill="var(--color-clay-dark)" opacity={0.92} />
      <rect x={x + 2} y={floor - 39} width={3} height={30} rx={1.5} fill="var(--color-clay-light)" opacity={0.5} />
      {/* back cushions */}
      <rect x={x + 9} y={floor - 37} width={(w - 8) / 2 - 2} height={16} rx={5} fill="var(--color-clay)" opacity={0.85} />
      <rect x={x + 9 + (w - 8) / 2} y={floor - 37} width={(w - 8) / 2 - 2} height={16} rx={5} fill="var(--color-clay)" opacity={0.8} />
      {/* 3 seat cushions */}
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={x + 8 + i * (seatW + 1)}
          y={seatY}
          width={seatW - 1}
          height={11}
          rx={4.5}
          fill={i === 1 ? "var(--color-clay-light)" : "var(--color-clay)"}
          opacity={0.95}
        />
      ))}
      <rect x={x + 8} y={seatY} width={w - 8} height={11} rx={4.5} fill="url(#th-fabric)" />
      {/* throw blanket over the right arm */}
      <path
        d={`M ${x + w - 2} ${floor - 40} q 8 2 10 6 v 22 q -5 3 -9 0 v -20 q -1 -5 -1 -8 z`}
        fill="var(--color-clay-light)"
        opacity={0.9}
      />
      <path
        d={`M ${x + w + 2} ${floor - 32} v 18 M ${x + w + 5} ${floor - 31} v 17`}
        fill="none"
        stroke="var(--color-clay)"
        strokeWidth={1}
        strokeOpacity={0.5}
      />
      {/* legs */}
      <line x1={x + 8} y1={floor - 3} x2={x + 8} y2={floor} stroke={INK} strokeWidth={2} strokeOpacity={0.8} />
      <line x1={x + w + 2} y1={floor - 3} x2={x + w + 2} y2={floor} stroke={INK} strokeWidth={2} strokeOpacity={0.8} />
    </g>
  );
}

/** Double bed: headboard, duvet with fold line, two pillows. Footprint: x .. x+w+6. */
export function DoubleBed({ x, floor, w = 96 }: { x: number; floor: number; w?: number }) {
  const h = 24;
  return (
    <g aria-hidden="true">
      <GroundShadow cx={x + w / 2 + 3} y={floor} rx={w / 2 + 6} />
      {/* headboard */}
      <rect x={x} y={floor - 60} width={8} height={60} rx={3.5} fill="var(--color-clay)" opacity={0.92} />
      <rect x={x + 1.6} y={floor - 59} width={2.6} height={52} rx={1.3} fill="var(--color-clay-light)" opacity={0.5} />
      {/* base + mattress */}
      <rect x={x + 6} y={floor - 10} width={w} height={10} rx={3} fill="var(--color-clay-dark)" opacity={0.35} />
      <rect x={x + 6} y={floor - h} width={w} height={16} rx={5} fill="var(--color-cream)" stroke={INK} strokeWidth={SW} strokeOpacity={0.85} />
      {/* duvet draped over the lower two-thirds, with fold line */}
      <path
        d={`M ${x + 34} ${floor - h - 4} h ${w - 32} q 5 1 5 6 v 10 q 0 4 -5 4 h -${w - 32} q 3 -10 0 -20 z`}
        fill="var(--color-sage)"
        opacity={0.92}
      />
      <path
        d={`M ${x + 38} ${floor - h + 2} q ${(w - 36) / 2} 4 ${w - 40} 0`}
        fill="none"
        stroke="var(--color-moss)"
        strokeWidth={1.4}
        strokeOpacity={0.6}
        strokeLinecap="round"
      />
      <path d={`M ${x + 34} ${floor - h - 4} q 3 10 0 20`} fill="none" stroke="var(--color-moss)" strokeWidth={1.2} strokeOpacity={0.45} />
      {/* two pillows */}
      <rect x={x + 11} y={floor - h - 10} width={22} height={11} rx={4.5} fill="var(--color-cream)" stroke={INK} strokeWidth={1.4} strokeOpacity={0.6} />
      <rect x={x + 15} y={floor - h - 17} width={20} height={10} rx={4.5} fill="var(--color-parchment)" stroke={INK} strokeWidth={1.4} strokeOpacity={0.6} />
      <rect x={x + 6} y={floor - h} width={w} height={16} rx={5} fill="url(#th-fabric)" />
    </g>
  );
}

/** Wall-mounted flat TV: thin bezel, screen reflection, console shelf below. */
export function WallTv({ x, y, w = 56 }: { x: number; y: number; w?: number }) {
  const h = w * 0.58;
  return (
    <g aria-hidden="true">
      {/* bezel + screen */}
      <rect x={x} y={y} width={w} height={h} rx={3} fill={INK} opacity={0.9} />
      <rect x={x + 2} y={y + 2} width={w - 4} height={h - 4} rx={2} fill="url(#th-screen)" />
      {/* diagonal reflection */}
      <path
        d={`M ${x + w * 0.16} ${y + 2} l ${w * 0.16} 0 l -${w * 0.24} ${h - 4} l -${w * 0.16} 0 z`}
        fill="var(--color-cream)"
        opacity={0.1}
      />
      <path
        d={`M ${x + w * 0.42} ${y + 2} l ${w * 0.07} 0 l -${w * 0.24} ${h - 4} l -${w * 0.07} 0 z`}
        fill="var(--color-cream)"
        opacity={0.07}
      />
      {/* console shelf below */}
      <rect x={x + 4} y={y + h + 12} width={w - 8} height={4} rx={2} fill="var(--color-sand)" stroke={INK} strokeWidth={1.4} strokeOpacity={0.7} />
      <line x1={x + 10} y1={y + h + 16} x2={x + 10} y2={y + h + 24} stroke={INK} strokeWidth={1.6} strokeOpacity={0.6} />
      <line x1={x + w - 10} y1={y + h + 16} x2={x + w - 10} y2={y + h + 24} stroke={INK} strokeWidth={1.6} strokeOpacity={0.6} />
      {/* soft cast shadow on the wall */}
      <rect x={x + 3} y={y + h + 2} width={w - 6} height={3} rx={1.5} fill={INK} opacity={0.08} filter="url(#th-soft)" />
    </g>
  );
}

/** Two small framed prints for the wall. Footprint: x .. x+50. */
export function WallArt({ x, y }: { x: number; y: number }) {
  return (
    <g aria-hidden="true">
      <rect x={x} y={y} width={26} height={20} rx={2} fill="var(--color-parchment)" stroke={INK} strokeWidth={1.8} strokeOpacity={0.8} />
      <path d={`M ${x + 4} ${y + 14} l 6 -7 l 5 5 l 4 -6 l 3 4`} fill="none" stroke="var(--color-moss)" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={x + 19} cy={y + 6} r={2} fill="var(--color-clay)" opacity={0.8} />
      <rect x={x + 33} y={y + 4} width={16} height={13} rx={2} fill="var(--color-sage)" opacity={0.7} stroke={INK} strokeWidth={1.4} strokeOpacity={0.6} />
      <path d={`M ${x + 36} ${y + 13} q 5 -6 10 -3`} fill="none" stroke="var(--color-cream)" strokeWidth={1.4} strokeOpacity={0.8} strokeLinecap="round" />
    </g>
  );
}

/** Set of three frames with tiny abstract art in sage/clay. Footprint: x .. x+64. */
export function PictureFrames({ x, y }: { x: number; y: number }) {
  return (
    <g aria-hidden="true">
      {/* frame 1: landscape with hills */}
      <rect x={x} y={y + 3} width={24} height={18} rx={2} fill="var(--color-cream)" stroke={INK} strokeWidth={1.7} strokeOpacity={0.8} />
      <path d={`M ${x + 3} ${y + 16} q 5 -8 9 -2 q 4 -7 9 -1`} fill="none" stroke="var(--color-sage)" strokeWidth={1.6} strokeLinecap="round" />
      {/* frame 2: portrait with arch */}
      <rect x={x + 29} y={y} width={15} height={21} rx={2} fill="var(--color-parchment)" stroke={INK} strokeWidth={1.7} strokeOpacity={0.8} />
      <path d={`M ${x + 32} ${y + 17} v -7 a 4.5 4.5 0 0 1 9 0 v 7`} fill="var(--color-clay)" opacity={0.75} />
      {/* frame 3: small square with sun */}
      <rect x={x + 49} y={y + 6} width={14} height={13} rx={2} fill="var(--color-sage)" opacity={0.55} stroke={INK} strokeWidth={1.5} strokeOpacity={0.65} />
      <circle cx={x + 56} cy={y + 12} r={3} fill="var(--color-clay-light)" opacity={0.9} />
    </g>
  );
}

/** Wall shelving: 3 shelves with book spines (moss/clay/sage) + small plant. */
export function ShelvingUnit({ x, y, w = 48 }: { x: number; y: number; w?: number }) {
  const gap = 24;
  const spines: Array<{ dx: number; h: number; c: string }> = [
    { dx: 4, h: 13, c: "var(--color-moss)" },
    { dx: 9, h: 15, c: "var(--color-clay)" },
    { dx: 14, h: 12, c: "var(--color-sage)" },
    { dx: 19, h: 14, c: "var(--color-clay-dark)" },
  ];
  return (
    <g aria-hidden="true">
      {[0, 1, 2].map((row) => {
        const sy = y + row * gap;
        return (
          <g key={row}>
            {/* shelf board with bracket */}
            <rect x={x} y={sy + 18} width={w} height={3.5} rx={1.75} fill="var(--color-sand)" stroke={INK} strokeWidth={1.3} strokeOpacity={0.7} />
            <rect x={x + 1} y={sy + 21.5} width={w - 2} height={1.6} rx={0.8} fill={INK} opacity={0.08} />
            {row === 0 ? (
              <>
                {/* top shelf: small plant + one book stack */}
                <path d={`M ${x + 8} ${sy + 18} l 1.5 -7 h 6 l 1.5 7 z`} fill="var(--color-clay-dark)" opacity={0.9} />
                <path d={`M ${x + 12.5} ${sy + 11} q -4 -4 -4 -8 M ${x + 12.5} ${sy + 11} q 3 -5 5 -7`} fill="none" stroke="var(--color-moss)" strokeWidth={1.8} strokeLinecap="round" />
                <rect x={x + 26} y={sy + 14} width={14} height={2.6} rx={1.3} fill="var(--color-clay)" opacity={0.85} />
                <rect x={x + 28} y={sy + 11} width={11} height={2.6} rx={1.3} fill="var(--color-sage)" opacity={0.85} />
              </>
            ) : (
              spines.map((s, i) => (
                <rect
                  key={i}
                  x={x + s.dx + (row === 2 ? 14 : 6)}
                  y={sy + 18 - s.h}
                  width={3.6}
                  height={s.h}
                  rx={1.2}
                  fill={s.c}
                  opacity={0.85}
                />
              ))
            )}
          </g>
        );
      })}
    </g>
  );
}

/** Potted plant, compact spread (~±9px around pot centre). Footprint: x .. x+12. */
export function Plant({ x, floor }: { x: number; floor: number }) {
  const cx = x + 6;
  return (
    <g aria-hidden="true">
      <ellipse cx={cx} cy={floor + 2} rx={9} ry={2.5} fill={INK} opacity={0.08} filter="url(#th-soft)" />
      <path d={`M ${x} ${floor - 13} h 12 l -2 13 h -8 z`} fill="var(--color-clay-dark)" opacity={0.9} />
      <path d={`M ${x + 1.5} ${floor - 13} h 3 l -1 13 h -1.5 z`} fill="var(--color-clay)" opacity={0.6} />
      <path d={`M ${cx} ${floor - 13} q -8 -10 -9 -22`} fill="none" stroke="var(--color-moss)" strokeWidth={2.4} strokeLinecap="round" />
      <path d={`M ${cx} ${floor - 13} q 1 -14 2 -26`} fill="none" stroke="var(--color-moss)" strokeWidth={2.4} strokeLinecap="round" />
      <path d={`M ${cx} ${floor - 13} q 8 -8 9 -18`} fill="none" stroke="var(--color-sage)" strokeWidth={2.4} strokeLinecap="round" />
      <ellipse cx={cx - 8} cy={floor - 35} rx={3} ry={4.5} fill="var(--color-moss)" opacity={0.75} transform={`rotate(-24 ${cx - 8} ${floor - 35})`} />
      <ellipse cx={cx + 8.5} cy={floor - 31} rx={2.6} ry={4} fill="var(--color-sage)" opacity={0.8} transform={`rotate(26 ${cx + 8.5} ${floor - 31})`} />
    </g>
  );
}

/** Larger floor plant: 2-tone pot + layered leaves. Footprint: x .. x+20. */
export function FloorPlant({ x, floor, scale = 1 }: { x: number; floor: number; scale?: number }) {
  const cx = x + 10;
  return (
    <g aria-hidden="true" transform={scale === 1 ? undefined : `translate(${cx} ${floor}) scale(${scale}) translate(${-cx} ${-floor})`}>
      <ellipse cx={cx} cy={floor + 2} rx={13} ry={3} fill={INK} opacity={0.09} filter="url(#th-soft)" />
      {/* pot with rim + shaded side */}
      <path d={`M ${x + 1} ${floor - 18} h 18 l -3 18 h -12 z`} fill="var(--color-clay)" opacity={0.92} />
      <path d={`M ${x + 13} ${floor - 18} h 6 l -3 18 h -4.5 z`} fill="var(--color-clay-dark)" opacity={0.55} />
      <rect x={x - 0.5} y={floor - 20.5} width={21} height={3.5} rx={1.75} fill="var(--color-clay-dark)" opacity={0.9} />
      {/* layered leaves */}
      <path d={`M ${cx} ${floor - 20} q -12 -12 -13 -30`} fill="none" stroke="var(--color-moss)" strokeWidth={2.6} strokeLinecap="round" />
      <path d={`M ${cx} ${floor - 20} q 0 -18 2 -36`} fill="none" stroke="var(--color-moss)" strokeWidth={2.6} strokeLinecap="round" />
      <path d={`M ${cx} ${floor - 20} q 12 -10 14 -26`} fill="none" stroke="var(--color-sage)" strokeWidth={2.6} strokeLinecap="round" />
      <ellipse cx={cx - 12} cy={floor - 49} rx={4.5} ry={7} fill="var(--color-moss)" opacity={0.85} transform={`rotate(-26 ${cx - 12} ${floor - 49})`} />
      <ellipse cx={cx + 2.5} cy={floor - 55} rx={4} ry={7} fill="var(--color-forest-light)" opacity={0.8} transform={`rotate(4 ${cx + 2.5} ${floor - 55})`} />
      <ellipse cx={cx + 13} cy={floor - 45} rx={4} ry={6.5} fill="var(--color-sage)" opacity={0.85} transform={`rotate(28 ${cx + 13} ${floor - 45})`} />
    </g>
  );
}

/** Pendant light hanging from a ceiling point (used in The Dome). */
export function Pendant({ x, top, drop = 52 }: { x: number; top: number; drop?: number }) {
  return (
    <g aria-hidden="true">
      <line x1={x} y1={top} x2={x} y2={top + drop} stroke={INK} strokeWidth={1.6} strokeOpacity={0.8} />
      {/* shade: narrow at cord, wide at mouth */}
      <path
        d={`M ${x - 3} ${top + drop} h 6 l 5 12 h -16 z`}
        fill="var(--color-clay)"
        opacity={0.9}
      />
      <path d={`M ${x - 3} ${top + drop} h 2.4 l -2 12 h -3.4 z`} fill="var(--color-clay-light)" opacity={0.6} />
      {/* warm glow */}
      <ellipse cx={x} cy={top + drop + 18} rx={22} ry={12} fill="url(#th-glow)" opacity={0.6} />
    </g>
  );
}

/** Pendant lamp with cord, 2-tone shade and warm glow (alias-grade upgrade). */
export function PendantLamp({ x, top, drop = 52 }: { x: number; top: number; drop?: number }) {
  return (
    <g aria-hidden="true">
      <circle cx={x} cy={top + 1.5} r={2} fill={INK} opacity={0.7} />
      <line x1={x} y1={top} x2={x} y2={top + drop} stroke={INK} strokeWidth={1.5} strokeOpacity={0.8} />
      <path d={`M ${x - 4} ${top + drop} h 8 l 6 14 h -20 z`} fill="var(--color-clay)" opacity={0.92} />
      <path d={`M ${x - 4} ${top + drop} h 3 l -2.4 14 h -4.6 z`} fill="var(--color-clay-light)" opacity={0.65} />
      <line x1={x - 9} y1={top + drop + 14} x2={x + 9} y2={top + drop + 14} stroke="var(--color-clay-dark)" strokeWidth={1.6} strokeOpacity={0.8} strokeLinecap="round" />
      {/* warm glow ellipse, clay-light ~15% */}
      <ellipse cx={x} cy={top + drop + 24} rx={26} ry={14} fill="var(--color-clay-light)" opacity={0.15} />
      <ellipse cx={x} cy={top + drop + 22} rx={16} ry={9} fill="url(#th-glow)" opacity={0.55} />
    </g>
  );
}

/** Small table lamp for side tables / consoles. Footprint: x .. x+18. */
export function TableLamp({ x, floor }: { x: number; floor: number }) {
  const cx = x + 9;
  return (
    <g aria-hidden="true">
      <ellipse cx={cx} cy={floor + 1.5} rx={8} ry={2} fill={INK} opacity={0.08} filter="url(#th-soft)" />
      <ellipse cx={cx} cy={floor - 1.5} rx={6} ry={2} fill="var(--color-clay-dark)" opacity={0.85} />
      <line x1={cx} y1={floor - 2} x2={cx} y2={floor - 14} stroke={INK} strokeWidth={1.7} strokeOpacity={0.8} />
      <path d={`M ${cx - 7} ${floor - 14} h 14 l -3 -9 h -8 z`} fill="var(--color-clay)" opacity={0.92} />
      <path d={`M ${cx - 7} ${floor - 14} h 3.5 l -1.4 -9 h -3.4 z`} fill="var(--color-clay-light)" opacity={0.6} />
      <ellipse cx={cx} cy={floor - 17} rx={13} ry={8} fill="url(#th-glow)" opacity={0.55} />
    </g>
  );
}

/** Rug ellipse lying on the floor — 2-tone border reads as a woven edge. */
export function Rug({ cx, floor, rx = 34 }: { cx: number; floor: number; rx?: number }) {
  return (
    <g aria-hidden="true">
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
      <ellipse
        cx={cx}
        cy={floor + 4}
        rx={rx * 0.72}
        ry={3.2}
        fill="var(--color-sand)"
        opacity={0.5}
        stroke="var(--color-clay-dark)"
        strokeOpacity={0.35}
        strokeWidth={1}
      />
    </g>
  );
}

/** Coffee table. Footprint: x .. x+w. */
export function CoffeeTable({ x, floor, w = 24 }: { x: number; floor: number; w?: number }) {
  return (
    <g aria-hidden="true">
      <GroundShadow cx={x + w / 2} y={floor} rx={w / 2 + 2} opacity={0.09} />
      <rect x={x} y={floor - 15} width={w} height={3.5} rx={1.75} fill={INK} opacity={0.85} />
      <rect x={x + 1} y={floor - 15} width={w - 2} height={1.4} rx={0.7} fill="var(--color-clay-light)" opacity={0.5} />
      <line x1={x + 4} y1={floor - 12} x2={x + 4} y2={floor} stroke={INK} strokeWidth={2} strokeOpacity={0.85} />
      <line x1={x + w - 4} y1={floor - 12} x2={x + w - 4} y2={floor} stroke={INK} strokeWidth={2} strokeOpacity={0.85} />
      {/* small book + mug on top */}
      <rect x={x + w / 2 - 6} y={floor - 18} width={9} height={2.4} rx={1.2} fill="var(--color-sage)" opacity={0.9} />
      <rect x={x + w / 2 + 5} y={floor - 19} width={4} height={4} rx={1} fill="var(--color-clay)" opacity={0.9} />
    </g>
  );
}

/** Tall two-door wardrobe. Footprint: x .. x+w. */
export function Wardrobe({ x, floor, w = 44, h = 108 }: { x: number; floor: number; w?: number; h?: number }) {
  const top = floor - h;
  return (
    <g aria-hidden="true">
      <GroundShadow cx={x + w / 2} y={floor} rx={w / 2 + 2} opacity={0.09} />
      <rect x={x} y={top} width={w} height={h} rx={4} fill="var(--color-sand)" stroke={INK} strokeWidth={SW} strokeOpacity={0.85} />
      <rect x={x + 1} y={top + 1} width={w - 2} height={h - 2} rx={4} fill="url(#th-wood)" opacity={0.8} />
      {/* right door shaded for depth */}
      <rect x={x + w / 2} y={top + 2} width={w / 2 - 2} height={h - 4} rx={3} fill="var(--color-clay)" opacity={0.12} />
      <line x1={x + w / 2} y1={top + 4} x2={x + w / 2} y2={floor - 4} stroke={INK} strokeWidth={1.4} strokeOpacity={0.55} />
      {/* handles */}
      <line x1={x + w / 2 - 5} y1={top + h * 0.42} x2={x + w / 2 - 5} y2={top + h * 0.42 + 10} stroke={INK} strokeWidth={1.8} strokeOpacity={0.65} strokeLinecap="round" />
      <line x1={x + w / 2 + 5} y1={top + h * 0.42} x2={x + w / 2 + 5} y2={top + h * 0.42 + 10} stroke={INK} strokeWidth={1.8} strokeOpacity={0.65} strokeLinecap="round" />
      {/* top cornice */}
      <rect x={x - 2} y={top - 3} width={w + 4} height={4} rx={2} fill="var(--color-clay)" opacity={0.8} />
    </g>
  );
}

/** Small dining set: table + two facing chairs. Footprint: x .. x+w+26. */
export function DiningSet({ x, floor, w = 44 }: { x: number; floor: number; w?: number }) {
  const tableTop = floor - 30;
  const chair = (cx: number, flip: boolean) => (
    <g>
      {/* backrest */}
      <line x1={cx} y1={floor - 42} x2={cx} y2={floor} stroke={INK} strokeWidth={2} strokeOpacity={0.85} strokeLinecap="round" />
      <line x1={cx} y1={floor - 42} x2={cx + (flip ? -3 : 3)} y2={floor - 42} stroke={INK} strokeWidth={2} strokeOpacity={0.7} strokeLinecap="round" />
      {/* seat */}
      <rect x={flip ? cx - 14 : cx} y={floor - 22} width={14} height={3.5} rx={1.75} fill="var(--color-clay)" opacity={0.9} />
      {/* front leg */}
      <line x1={flip ? cx - 12 : cx + 12} y1={floor - 20} x2={flip ? cx - 12 : cx + 12} y2={floor} stroke={INK} strokeWidth={2} strokeOpacity={0.85} strokeLinecap="round" />
    </g>
  );
  return (
    <g aria-hidden="true">
      <GroundShadow cx={x + 13 + w / 2} y={floor} rx={w / 2 + 18} opacity={0.08} />
      {chair(x, false)}
      {/* table */}
      <rect x={x + 13} y={tableTop} width={w} height={3.5} rx={1.75} fill="var(--color-sand)" stroke={INK} strokeWidth={1.6} strokeOpacity={0.8} />
      <rect x={x + 14} y={tableTop} width={w - 2} height={1.4} rx={0.7} fill="var(--color-clay-light)" opacity={0.55} />
      <line x1={x + 18} y1={tableTop + 3} x2={x + 18} y2={floor} stroke={INK} strokeWidth={2} strokeOpacity={0.85} />
      <line x1={x + 8 + w} y1={tableTop + 3} x2={x + 8 + w} y2={floor} stroke={INK} strokeWidth={2} strokeOpacity={0.85} />
      {/* small vase */}
      <path d={`M ${x + 11 + w / 2} ${tableTop} l 1 -6 h 3 l 1 6 z`} fill="var(--color-sage)" opacity={0.85} />
      {chair(x + w + 26, true)}
    </g>
  );
}

/** Curtain drapes flanking a window rect: rod, folds, tiebacks. */
export function Curtains({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const drape = (dx: number, flip: boolean) => {
    const s = flip ? -1 : 1;
    return (
      <g>
        <path
          d={`M ${dx} ${y + 3}
              h ${s * (w * 0.2)}
              q ${s * 3} ${h * 0.4} ${s * -2} ${h * 0.62}
              q ${s * 4} ${h * 0.2} ${s * 1} ${h * 0.36 - 2}
              q ${s * -6} 3 ${s * -12} 0
              q ${s * 2} -${h * 0.3} ${s * -1} -${h * 0.55}
              q ${s * -2} -${h * 0.28} ${s * -6} -${h * 0.45}
              z`}
          fill="url(#th-wall-wash)"
          stroke="var(--color-sand)"
          strokeWidth={1}
          strokeOpacity={0.7}
        />
        {/* fold lines */}
        <path d={`M ${dx + s * 5} ${y + 8} q ${s * 2} ${h * 0.4} ${s * -1} ${h * 0.8}`} fill="none" stroke="var(--color-cream)" strokeWidth={1.2} strokeOpacity={0.8} />
        <path d={`M ${dx + s * 11} ${y + 8} q ${s * 3} ${h * 0.35} ${s * 0.5} ${h * 0.72}`} fill="none" stroke="var(--color-clay)" strokeWidth={0.9} strokeOpacity={0.25} />
        {/* tieback */}
        <path
          d={`M ${dx + s * 1} ${y + h * 0.6} q ${s * 7} 4 ${s * 13} 0`}
          fill="none"
          stroke="var(--color-clay)"
          strokeWidth={2}
          strokeOpacity={0.75}
          strokeLinecap="round"
        />
      </g>
    );
  };
  return (
    <g aria-hidden="true">
      {/* rod + finials */}
      <line x1={x - 6} y1={y + 2} x2={x + w + 6} y2={y + 2} stroke={INK} strokeWidth={2} strokeOpacity={0.8} strokeLinecap="round" />
      <circle cx={x - 7} cy={y + 2} r={2.2} fill="var(--color-clay)" />
      <circle cx={x + w + 7} cy={y + 2} r={2.2} fill="var(--color-clay)" />
      {drape(x - 2, false)}
      {drape(x + w + 2, true)}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Windows & option visuals                                            */
/* ------------------------------------------------------------------ */

/** Double-glazing highlight: inner frame line + diagonal sage sheen. */
export function GlazingHighlight({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <g aria-hidden="true">
      {/* second (inner) frame line = double glazing */}
      <rect x={x + 3} y={y + 3} width={w - 6} height={h - 6} rx={2} fill="none" stroke="var(--color-moss)" strokeWidth={1.4} strokeOpacity={0.75} />
      {/* diagonal sheen */}
      <path
        d={`M ${x + w * 0.18} ${y + h - 3} L ${x + w * 0.5} ${y + 3} l ${w * 0.14} 0 L ${x + w * 0.32} ${y + h - 3} z`}
        fill="var(--color-sage)"
        opacity={0.28}
      />
      <line
        x1={x + w * 0.62}
        y1={y + h - 4}
        x2={x + w * 0.88}
        y2={y + 4}
        stroke="var(--color-sage)"
        strokeWidth={1.6}
        strokeOpacity={0.45}
        strokeLinecap="round"
      />
    </g>
  );
}

/** Window: frame + sill + glass gradient + mullion, optional glazing overlay. */
export function Window({
  x,
  y,
  w = 44,
  h = 34,
  glazed = false,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  glazed?: boolean;
}) {
  return (
    <g aria-hidden="true">
      <rect x={x} y={y} width={w} height={h} rx={3} fill="var(--color-parchment)" stroke={INK} strokeWidth={SW} strokeOpacity={0.85} />
      <rect x={x + 2.5} y={y + 2.5} width={w - 5} height={h - 5} rx={2} fill="url(#th-glass)" />
      {/* mullion */}
      <line x1={x + w / 2} y1={y + 3} x2={x + w / 2} y2={y + h - 3} stroke={INK} strokeWidth={1.4} strokeOpacity={0.55} />
      {/* sill */}
      <rect x={x - 3} y={y + h} width={w + 6} height={3} rx={1.5} fill="var(--color-sand)" stroke={INK} strokeWidth={1} strokeOpacity={0.4} />
      {glazed && <GlazingHighlight x={x} y={y} w={w} h={h} />}
    </g>
  );
}

/** Roof-mounted solar array: forest panels, sage grid, mounting rails. */
export function SolarPanels({
  x,
  y,
  w = 128,
  angle = 0,
}: {
  x: number;
  y: number;
  w?: number;
  angle?: number;
}) {
  const panelH = 19;
  const n = Math.max(2, Math.round(w / 34));
  const pw = w / n;
  const panels: React.ReactElement[] = [];
  for (let i = 0; i < n; i++) {
    const px = x + i * pw;
    panels.push(
      <g key={i}>
        <rect x={px + 1.5} y={y} width={pw - 3} height={panelH} rx={2} fill="var(--color-forest)" stroke={INK} strokeWidth={1.4} strokeOpacity={0.6} />
        {/* cell grid */}
        <line x1={px + 2.5} y1={y + panelH / 2} x2={px + pw - 2.5} y2={y + panelH / 2} stroke="var(--color-sage)" strokeWidth={0.9} strokeOpacity={0.55} />
        <line x1={px + pw / 3} y1={y + 1.5} x2={px + pw / 3} y2={y + panelH - 1.5} stroke="var(--color-sage)" strokeWidth={0.9} strokeOpacity={0.55} />
        <line x1={px + (2 * pw) / 3} y1={y + 1.5} x2={px + (2 * pw) / 3} y2={y + panelH - 1.5} stroke="var(--color-sage)" strokeWidth={0.9} strokeOpacity={0.55} />
        {/* sheen */}
        <path d={`M ${px + 4} ${y + panelH - 2} L ${px + 9} ${y + 2} l 3 0 L ${px + 7} ${y + panelH - 2} z`} fill="var(--color-cream)" opacity={0.12} />
      </g>,
    );
  }
  return (
    <g aria-hidden="true" transform={angle ? `rotate(${angle} ${x} ${y + panelH + 6})` : undefined}>
      {/* mounting rails + feet */}
      <rect x={x - 2} y={y + panelH + 1} width={w + 4} height={2.6} rx={1.3} fill={INK} opacity={0.6} />
      <line x1={x + w * 0.16} y1={y + panelH + 3} x2={x + w * 0.16} y2={y + panelH + 7} stroke={INK} strokeWidth={2.2} strokeOpacity={0.65} strokeLinecap="round" />
      <line x1={x + w * 0.84} y1={y + panelH + 3} x2={x + w * 0.84} y2={y + panelH + 7} stroke={INK} strokeWidth={2.2} strokeOpacity={0.65} strokeLinecap="round" />
      {panels}
      {/* highlight along the top edge */}
      <line x1={x + 2} y1={y + 0.8} x2={x + w - 2} y2={y + 0.8} stroke="var(--color-sage)" strokeWidth={1.2} strokeOpacity={0.5} strokeLinecap="round" />
    </g>
  );
}

/** Wall split aircon: indoor unit + louvres, optional outdoor unit on bracket. */
export function AirconSplit({
  x,
  y,
  withOutdoor = false,
  outdoorX,
  outdoorY,
}: {
  x: number;
  y: number;
  withOutdoor?: boolean;
  outdoorX?: number;
  outdoorY?: number;
}) {
  const ox = outdoorX ?? x + 120;
  const oy = outdoorY ?? 404;
  return (
    <g aria-hidden="true">
      {/* indoor unit */}
      <rect x={x + 2} y={y + 14} width={40} height={3} rx={1.5} fill={INK} opacity={0.08} filter="url(#th-soft)" />
      <rect x={x} y={y} width={44} height={15} rx={5} fill="var(--color-cream)" stroke={INK} strokeWidth={1.8} strokeOpacity={0.8} />
      <rect x={x + 1.5} y={y + 1.5} width={41} height={5} rx={2.5} fill="var(--color-parchment)" opacity={0.9} />
      {/* louvre lines */}
      <line x1={x + 5} y1={y + 10.5} x2={x + 33} y2={y + 10.5} stroke={INK} strokeWidth={1.1} strokeOpacity={0.4} />
      <line x1={x + 5} y1={y + 13} x2={x + 30} y2={y + 13} stroke={INK} strokeWidth={1.1} strokeOpacity={0.3} />
      {/* status dot */}
      <circle cx={x + 38.5} cy={y + 11.5} r={1.4} fill="var(--color-moss)" />
      {/* cool air wisps */}
      <path
        d={`M ${x + 8} ${y + 19} q 3 4 0 9 M ${x + 18} ${y + 19} q 3 5 0 11 M ${x + 28} ${y + 19} q 3 4 0 9`}
        fill="none"
        stroke="var(--color-sage)"
        strokeWidth={1.6}
        strokeOpacity={0.6}
        strokeDasharray="3 4"
        strokeLinecap="round"
      />
      {withOutdoor && (
        <g>
          {/* bracket */}
          <path d={`M ${ox + 2} ${oy + 24} l 6 6 M ${ox + 30} ${oy + 24} l -6 6`} stroke={INK} strokeWidth={1.8} strokeOpacity={0.6} strokeLinecap="round" />
          <rect x={ox} y={oy} width={34} height={24} rx={3} fill="var(--color-parchment)" stroke={INK} strokeWidth={1.8} strokeOpacity={0.8} />
          <circle cx={ox + 13} cy={oy + 12} r={8} fill="none" stroke={INK} strokeWidth={1.5} strokeOpacity={0.7} />
          {/* fan blades */}
          <path
            d={`M ${ox + 13} ${oy + 12} l 5 -4 M ${ox + 13} ${oy + 12} l -6 -1 M ${ox + 13} ${oy + 12} l 2 6`}
            stroke={INK}
            strokeWidth={1.4}
            strokeOpacity={0.6}
            strokeLinecap="round"
          />
          <line x1={ox + 26} y1={oy + 5} x2={ox + 30} y2={oy + 5} stroke={INK} strokeWidth={1.4} strokeOpacity={0.5} />
          <line x1={ox + 26} y1={oy + 9} x2={ox + 30} y2={oy + 9} stroke={INK} strokeWidth={1.4} strokeOpacity={0.5} />
        </g>
      )}
    </g>
  );
}

/** Timber deck extension: boards, fascia, posts to ground, railing. */
export function DeckExtension({
  x,
  floor = 400,
  w = 96,
  ground = 432,
  railing = true,
}: {
  x: number;
  floor?: number;
  w?: number;
  ground?: number;
  railing?: boolean;
}) {
  const pw = 16;
  const n = Math.floor(w / pw);
  const boards: React.ReactElement[] = [];
  for (let i = 0; i < n; i++) {
    boards.push(
      <rect
        key={i}
        x={x + i * pw + 1}
        y={floor}
        width={pw - 2}
        height={6}
        rx={1.5}
        fill={i % 2 === 0 ? "var(--color-clay-light)" : "var(--color-sand)"}
        opacity={0.95}
      />,
    );
  }
  const balusters: React.ReactElement[] = [];
  if (railing) {
    for (let bx = x + w - 4; bx > x + 8; bx -= 12) {
      balusters.push(
        <line key={bx} x1={bx} y1={floor - 26} x2={bx} y2={floor} stroke={INK} strokeWidth={1.4} strokeOpacity={0.55} />,
      );
    }
  }
  return (
    <g aria-hidden="true">
      <ellipse cx={x + w / 2} cy={ground + 2} rx={w / 2} ry={3.5} fill={INK} opacity={0.07} filter="url(#th-soft)" />
      {/* boards + grain + fascia */}
      {boards}
      <rect x={x} y={floor} width={w} height={6} fill="url(#th-wood)" opacity={0.7} />
      <rect x={x} y={floor + 6} width={w} height={5} rx={1.5} fill="var(--color-clay)" opacity={0.55} />
      {/* posts to ground */}
      <line x1={x + 6} y1={floor + 10} x2={x + 6} y2={ground} stroke={INK} strokeWidth={2.2} strokeOpacity={0.75} strokeLinecap="round" />
      <line x1={x + w - 6} y1={floor + 10} x2={x + w - 6} y2={ground} stroke={INK} strokeWidth={2.2} strokeOpacity={0.75} strokeLinecap="round" />
      {/* railing */}
      {railing && (
        <g>
          {balusters}
          <line x1={x + 6} y1={floor - 27} x2={x + w - 2} y2={floor - 27} stroke="var(--color-clay)" strokeWidth={3.5} strokeOpacity={0.9} strokeLinecap="round" />
          <line x1={x + w - 2} y1={floor - 27} x2={x + w - 2} y2={floor} stroke={INK} strokeWidth={2} strokeOpacity={0.75} strokeLinecap="round" />
        </g>
      )}
    </g>
  );
}

/** Warm underfloor-heating glow: gradient strip + tiny rising heat waves. */
export function HeatingGlow({
  x,
  w,
  floor,
  height = 24,
}: {
  x: number;
  w: number;
  floor: number;
  height?: number;
}) {
  const waves = [x + w * 0.25, x + w * 0.5, x + w * 0.75];
  return (
    <g aria-hidden="true">
      <rect x={x} y={floor - height} width={w} height={height} fill="url(#th-heat)" opacity={0.3} />
      {waves.map((wx) => (
        <path
          key={wx}
          d={`M ${wx} ${floor - 4} q 3 -5 0 -10 q -3 -5 0 -10`}
          fill="none"
          stroke="var(--color-clay-light)"
          strokeWidth={1.6}
          strokeOpacity={0.5}
          strokeLinecap="round"
        />
      ))}
    </g>
  );
}

/** Ghosted second-unit outline for stacking/linking potential (35% dashed). */
export function StackGhost({
  x,
  y,
  w,
  h,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
}) {
  return (
    <g aria-hidden="true" opacity={0.35}>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={6}
        fill="var(--color-sage)"
        fillOpacity={0.12}
        stroke={INK}
        strokeWidth={2}
        strokeDasharray="7 6"
        strokeLinecap="round"
      />
      {/* dashed window + door hints */}
      <rect x={x + w * 0.14} y={y + h * 0.3} width={w * 0.2} height={h * 0.32} rx={3} fill="none" stroke={INK} strokeWidth={1.6} strokeDasharray="4 5" />
      <rect x={x + w * 0.66} y={y + h * 0.26} width={w * 0.14} height={h * 0.68} rx={3} fill="none" stroke={INK} strokeWidth={1.6} strokeDasharray="4 5" />
      {/* corner seams */}
      <line x1={x + 8} y1={y + h} x2={x + 8} y2={y + h - 10} stroke={INK} strokeWidth={1.6} strokeDasharray="3 4" />
      <line x1={x + w - 8} y1={y + h} x2={x + w - 8} y2={y + h - 10} stroke={INK} strokeWidth={1.6} strokeDasharray="3 4" />
    </g>
  );
}
