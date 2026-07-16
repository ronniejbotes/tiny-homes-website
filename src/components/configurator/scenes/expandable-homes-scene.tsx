"use client";

import { motion, useReducedMotion, type Transition } from "framer-motion";
import { getProduct } from "@/data/products";
import { DEFAULT_EXPANDABLE_VARIANT } from "../floorplan/plans";
import type { SceneProps } from "./types";
import {
  AirconSplit,
  BaseFloor,
  CoffeeTable,
  Cupboards,
  Curtains,
  DeckExtension,
  DoubleBed,
  FloorPlant,
  GlazingHighlight,
  InsulationBand,
  Kitchen,
  Layer,
  PendantLamp,
  PictureFrames,
  Plant,
  PlankFloor,
  Rug,
  Scenery,
  ShelvingUnit,
  Shrub,
  SideTable,
  SlatWalls,
  SofaWithCushions,
  SolarPanels,
  Tree,
  WallTv,
  WetRoom,
  INK,
  SW,
} from "./shared";

/* ------------------------------------------------------------------ */
/* Per-variant geometry                                                */
/*                                                                     */
/* The shell is derived from a config per variant: interior span       */
/* (ix .. ix+iw, centred on x=400), whether the slid-out wings and     */
/* raised centre module are present, and where each option layer and   */
/* furniture item sits. Floor stays at y=400, ground at y=432.         */
/* Solar sits on the raised centre roof (y142) for winged variants and */
/* on the flat roof (y182) for slim shells; the deck hangs off the     */
/* right wall and tracks the variant width.                            */
/* ------------------------------------------------------------------ */

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const FLOOR = 400;

interface XW {
  x: number;
  w: number;
}

interface VariantGeom {
  /** Interior left edge and width; outer walls sit 8px outside. */
  ix: number;
  iw: number;
  /** Slid-out wings + raised centre module (B20 / B40 only). */
  wings: boolean;
  /** Centre-module seams. Nominal fade target when wings are absent. */
  cx0: number;
  cw: number;
  win: { x: number; y: number; w: number; h: number };
  kitchen: XW;
  cup: XW;
  wet: { x: number; partitions: "left" | "both" };
  sofa: XW | null;
  coffee: XW | null;
  rug: { cx: number; rx: number };
  bed: XW;
  table: { x: number } | null;
  /** Large potted plant (scaled) or the compact one where space is tight. */
  plantBig: { x: number; s: number } | null;
  plantSmall: { x: number } | null;
  tv: { x: number; y: number; w: number };
  frames: { x: number; y: number };
  shelf: { x: number; y: number } | null;
  pendant: { x: number; top: number; drop: number };
  aircon: { x: number; y: number };
  solar: XW;
  deck: XW;
  /** B40 only: two partition walls + a second bed = three-bedroom read. */
  threeBed: { partitions: [number, number]; bed2: XW } | null;
}

/** B40 (12m Expandable Home) — full-width shell with wings. */
const B40: VariantGeom = {
  ix: 158,
  iw: 484,
  wings: true,
  cx0: 304,
  cw: 192,
  win: { x: 424, y: 192, w: 44, h: 30 },
  kitchen: { x: 168, w: 118 },
  cup: { x: 174, w: 96 },
  wet: { x: 322, partitions: "both" },
  sofa: { x: 414, w: 48 },
  coffee: null,
  rug: { cx: 445, rx: 28 },
  bed: { x: 500, w: 66 },
  table: null,
  plantBig: { x: 294, s: 0.8 },
  plantSmall: null,
  tv: { x: 420, y: 244, w: 46 },
  frames: { x: 506, y: 252 },
  shelf: { x: 590, y: 224 },
  pendant: { x: 540, top: 196, drop: 20 },
  aircon: { x: 184, y: 236 },
  solar: { x: 330, w: 160 },
  deck: { x: 650, w: 60 },
  threeBed: { partitions: [496, 584], bed2: { x: 588, w: 42 } },
};

const GEOM: Record<string, VariantGeom> = {
  /* 6m Compact (b10-bk) — compact fully fitted module; shares the Slim's
     single-module silhouette (representative), no wings. */
  "b10-bk": {
    ix: 280,
    iw: 240,
    wings: false,
    cx0: 316,
    cw: 168,
    win: { x: 298, y: 234, w: 40, h: 38 },
    kitchen: { x: 286, w: 74 },
    cup: { x: 290, w: 62 },
    wet: { x: 432, partitions: "left" },
    sofa: null,
    coffee: null,
    rug: { cx: 392, rx: 22 },
    bed: { x: 366, w: 42 },
    table: null,
    plantBig: null,
    plantSmall: { x: 415 },
    tv: { x: 370, y: 230, w: 42 },
    frames: { x: 368, y: 200 },
    shelf: null,
    pendant: { x: 435, top: 196, drop: 26 },
    aircon: { x: 446, y: 204 },
    solar: { x: 340, w: 120 },
    deck: { x: 528, w: 80 },
    threeBed: null,
  },
  /* Compact single module, studio interior — no wings, no sofa/shelving. */
  "b20-slim": {
    ix: 280,
    iw: 240,
    wings: false,
    cx0: 316,
    cw: 168,
    win: { x: 298, y: 234, w: 40, h: 38 },
    kitchen: { x: 286, w: 74 },
    cup: { x: 290, w: 62 },
    wet: { x: 432, partitions: "left" },
    sofa: null,
    coffee: null,
    rug: { cx: 392, rx: 22 },
    bed: { x: 366, w: 42 },
    table: null,
    plantBig: null,
    plantSmall: { x: 415 },
    tv: { x: 370, y: 230, w: 42 },
    frames: { x: 368, y: 200 },
    shelf: null,
    pendant: { x: 435, top: 196, drop: 26 },
    aircon: { x: 446, y: 204 },
    solar: { x: 340, w: 120 },
    deck: { x: 528, w: 80 },
    threeBed: null,
  },
  /* Medium shell: centre module + two modest slid-out wings. */
  b20: {
    ix: 222,
    iw: 356,
    wings: true,
    cx0: 318,
    cw: 164,
    win: { x: 392, y: 192, w: 40, h: 30 },
    kitchen: { x: 228, w: 84 },
    cup: { x: 232, w: 72 },
    wet: { x: 490, partitions: "left" },
    sofa: { x: 348, w: 40 },
    coffee: null,
    rug: { cx: 372, rx: 26 },
    bed: { x: 404, w: 58 },
    table: { x: 472 },
    plantBig: { x: 320, s: 0.75 },
    plantSmall: null,
    tv: { x: 350, y: 238, w: 44 },
    frames: { x: 440, y: 240 },
    shelf: { x: 246, y: 218 },
    pendant: { x: 334, top: 160, drop: 56 },
    aircon: { x: 522, y: 216 },
    solar: { x: 340, w: 130 },
    deck: { x: 586, w: 70 },
    threeBed: null,
  },
  /* 6m Open Plan — same winged shell as the 6m, single open volume. */
  "b20-open": {
    ix: 222,
    iw: 356,
    wings: true,
    cx0: 318,
    cw: 164,
    win: { x: 392, y: 192, w: 40, h: 30 },
    kitchen: { x: 228, w: 84 },
    cup: { x: 232, w: 72 },
    wet: { x: 490, partitions: "left" },
    sofa: { x: 348, w: 40 },
    coffee: null,
    rug: { cx: 372, rx: 26 },
    bed: { x: 404, w: 58 },
    table: { x: 472 },
    plantBig: { x: 320, s: 0.75 },
    plantSmall: null,
    tv: { x: 350, y: 238, w: 44 },
    frames: { x: 440, y: 240 },
    shelf: { x: 246, y: 218 },
    pendant: { x: 334, top: 160, drop: 56 },
    aircon: { x: 522, y: 216 },
    solar: { x: 340, w: 130 },
    deck: { x: 586, w: 70 },
    threeBed: null,
  },
  // b40-slim was removed from the catalogue (the Slim 12m shell is available
  // on request only) — its geometry went with it.
  b40: B40,
};

/** Variant id → size string ("28 m²"), read from the catalogue. */
const SIZE_LABELS: Record<string, string> = Object.fromEntries(
  (getProduct("expandable-homes")?.variants ?? []).map((v) => [v.id, v.size]),
);

/* ------------------------------------------------------------------ */
/* Animated translation wrapper                                        */
/* ------------------------------------------------------------------ */

/** Slides children (drawn at local 0,0) to an absolute scene position. */
function Slide({ x, y = 0, children }: { x: number; y?: number; children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.g
      initial={false}
      animate={{ x, y }}
      transition={reduce ? { duration: 0 } : { duration: 0.35, ease: EASE }}
    >
      {children}
    </motion.g>
  );
}

/* ------------------------------------------------------------------ */
/* Scene                                                               */
/* ------------------------------------------------------------------ */

/**
 * Expandable home — the shell resizes per variant: the Slim 6m is a compact
 * studio module, the 6m adds modest wings, and the 12m is the full-width
 * three-bedroom silhouette. All option layers reposition from the variant
 * geometry; a dimension line under the house shows the variant's floor area.
 *
 * Worst-case collision walk (all visuals on + furnished) per variant is
 * encoded in the GEOM coordinates: floor runs left→right as
 * kitchen | plant | sofa (+coffee) | bed (+table) | wet room, and the wall
 * hangs shelving / tv / frames / pendant / aircon in non-overlapping slots
 * clear of the window + curtain drapes and of headboards below.
 */
export function ExpandableHomesScene({ visuals, furnished, variantId }: SceneProps) {
  const reduce = useReducedMotion();
  // Same fallback as the floor plan (plans.ts) — the catalogue's first variant.
  const g = GEOM[variantId ?? DEFAULT_EXPANDABLE_VARIANT] ?? GEOM[DEFAULT_EXPANDABLE_VARIANT];
  const sizeLabel = variantId ? SIZE_LABELS[variantId] : undefined;
  const t: Transition = reduce ? { duration: 0 } : { duration: 0.35, ease: EASE };
  const kitchenOn = Boolean(visuals["kitchen"]);
  const right = g.ix + g.iw;
  const seamL = g.cx0;
  const seamR = g.cx0 + g.cw;
  const solarY = g.wings ? 116 : 156;

  return (
    <svg
      viewBox="0 0 800 500"
      role="img"
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <title>Cutaway illustration of an expandable home showing your selected options</title>
      <defs>
        {/* Interior mask — floor and wall finishes are clipped to this so
            they track the shell while it resizes. */}
        <clipPath id="exp-interior-clip">
          <motion.rect
            initial={false}
            animate={{ attrX: g.ix, width: g.iw }}
            transition={t}
            y={150}
            height={262}
          />
        </clipPath>
      </defs>

      <Scenery />
      <Tree x={80} h={100} />
      <Shrub x={744} />

      {/* Interior back walls: full-width base + raised centre (wings only) */}
      <motion.rect
        initial={false}
        animate={{ attrX: g.ix, width: g.iw }}
        transition={t}
        y={194}
        height={206}
        fill="var(--color-parchment)"
      />
      <motion.rect
        initial={false}
        animate={{ attrX: seamL, width: g.cw, opacity: g.wings ? 1 : 0 }}
        transition={t}
        y={158}
        height={36}
        fill="var(--color-parchment)"
      />
      {/* Depth wash over the interior wall */}
      <motion.rect
        initial={false}
        animate={{ attrX: g.ix, width: g.iw }}
        transition={t}
        y={194}
        height={206}
        fill="url(#th-wall-wash)"
        opacity={0.45}
      />

      {/* Upgraded walls layer (clipped to the animating interior) */}
      <g clipPath="url(#exp-interior-clip)">
        <Layer id="walls" show={Boolean(visuals["walls"])}>
          <SlatWalls x={158} w={484} top={200} bottom={400} />
        </Layer>
      </g>

      {/* Window on the back wall (glass sheen for depth) */}
      <Slide x={g.win.x} y={g.win.y}>
        <rect x={0} y={0} width={g.win.w} height={g.win.h} rx={2} fill="var(--color-cream)" stroke={INK} strokeWidth={1.8} strokeOpacity={0.7} />
        <rect x={2.5} y={2.5} width={g.win.w - 5} height={g.win.h - 5} rx={1.5} fill="url(#th-glass)" />
        <line x1={g.win.w / 2} y1={0} x2={g.win.w / 2} y2={g.win.h} stroke={INK} strokeWidth={1.2} strokeOpacity={0.5} />
      </Slide>

      {/* Double-glazing highlight, tracking the window */}
      <Layer id="glazing" show={Boolean(visuals["glazing"])}>
        <Slide x={g.win.x} y={g.win.y}>
          <GlazingHighlight x={0} y={0} w={g.win.w} h={g.win.h} />
        </Slide>
      </Layer>

      {/* Curtains hugging the window */}
      <Layer id="curtains" show={Boolean(visuals["curtains"])}>
        <Slide x={g.win.x} y={g.win.y}>
          <Curtains x={0} y={-4} w={g.win.w} h={g.win.h + 10} />
        </Slide>
      </Layer>

      {/* Shell: slab + plinths */}
      <motion.rect
        initial={false}
        animate={{ attrX: g.ix - 8, width: g.iw + 16 }}
        transition={t}
        y={400}
        height={12}
        rx={2}
        fill="var(--color-sand)"
        stroke={INK}
        strokeWidth={SW}
        strokeOpacity={0.85}
      />
      <motion.rect initial={false} animate={{ attrX: g.ix + 24 }} transition={t} y={412} width={14} height={20} fill="var(--color-stone)" opacity={0.55} />
      <motion.rect initial={false} animate={{ attrX: g.ix + g.iw / 2 - 7 }} transition={t} y={412} width={14} height={20} fill="var(--color-stone)" opacity={0.55} />
      <motion.rect initial={false} animate={{ attrX: right - 38 }} transition={t} y={412} width={14} height={20} fill="var(--color-stone)" opacity={0.55} />

      {/* Outer walls */}
      <motion.rect initial={false} animate={{ attrX: g.ix - 8 }} transition={t} y={190} width={8} height={210} fill="var(--color-sand)" stroke={INK} strokeWidth={SW} strokeOpacity={0.85} />
      <motion.rect initial={false} animate={{ attrX: right }} transition={t} y={190} width={8} height={210} fill="var(--color-sand)" stroke={INK} strokeWidth={SW} strokeOpacity={0.85} />

      {/* Timber deck off the right wall, tracking the variant width */}
      <Layer id="deck" show={Boolean(visuals["deck"])}>
        <Slide x={g.deck.x}>
          <DeckExtension x={0} w={g.deck.w} />
        </Slide>
      </Layer>

      {/* Winged roofscape: raised centre module + wing roofs (B20 / B40) */}
      <motion.g initial={false} animate={{ opacity: g.wings ? 1 : 0 }} transition={t}>
        <motion.rect initial={false} animate={{ attrX: seamL - 4 }} transition={t} y={154} width={8} height={32} fill="var(--color-sand)" stroke={INK} strokeWidth={SW} strokeOpacity={0.85} />
        <motion.rect initial={false} animate={{ attrX: seamR - 4 }} transition={t} y={154} width={8} height={32} fill="var(--color-sand)" stroke={INK} strokeWidth={SW} strokeOpacity={0.85} />
        <motion.rect
          initial={false}
          animate={{ attrX: seamL - 12, width: g.cw + 24 }}
          transition={t}
          y={142}
          height={12}
          rx={3}
          fill="var(--color-sand)"
          stroke={INK}
          strokeWidth={SW}
          strokeOpacity={0.85}
        />
        <motion.rect
          initial={false}
          animate={{ attrX: g.ix - 16, width: seamL - (g.ix - 16) }}
          transition={t}
          y={182}
          height={12}
          rx={3}
          fill="var(--color-sand)"
          stroke={INK}
          strokeWidth={SW}
          strokeOpacity={0.85}
        />
        <motion.rect
          initial={false}
          animate={{ attrX: seamR, width: right + 16 - seamR }}
          transition={t}
          y={182}
          height={12}
          rx={3}
          fill="var(--color-sand)"
          stroke={INK}
          strokeWidth={SW}
          strokeOpacity={0.85}
        />
        {/* Telescoping seam lines + slide-out chevrons */}
        <Slide x={seamL}>
          <line x1={0} y1={196} x2={0} y2={398} stroke={INK} strokeWidth={1.6} strokeDasharray="4 6" strokeOpacity={0.35} />
        </Slide>
        <Slide x={seamR}>
          <line x1={0} y1={196} x2={0} y2={398} stroke={INK} strokeWidth={1.6} strokeDasharray="4 6" strokeOpacity={0.35} />
        </Slide>
        <Slide x={g.ix}>
          <path d="M 14 176 h -12 m 4 -4 l -4 4 l 4 4" fill="none" stroke="var(--color-clay)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Slide>
        <Slide x={right}>
          <path d="M -14 176 h 12 m -4 -4 l 4 4 l -4 4" fill="none" stroke="var(--color-clay)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Slide>
      </motion.g>

      {/* Flat single-module roof (Slim shells) */}
      <motion.g initial={false} animate={{ opacity: g.wings ? 0 : 1 }} transition={t}>
        <motion.rect
          initial={false}
          animate={{ attrX: g.ix - 14, width: g.iw + 28 }}
          transition={t}
          y={182}
          height={12}
          rx={3}
          fill="var(--color-sand)"
          stroke={INK}
          strokeWidth={SW}
          strokeOpacity={0.85}
        />
      </motion.g>

      {/* Solar array: centre-module roof (wings) or flat roof (slim) */}
      <Layer id="solar" show={Boolean(visuals["solar"])}>
        <Slide x={g.solar.x} y={solarY}>
          <SolarPanels x={0} y={0} w={g.solar.w} />
        </Slide>
      </Layer>

      {/* Floor finish (clipped to the animating interior) */}
      <g clipPath="url(#exp-interior-clip)">
        <BaseFloor x={158} w={484} floor={FLOOR} />
        <Layer id="floors" show={Boolean(visuals["floors"])}>
          <PlankFloor x={158} w={484} floor={FLOOR} />
        </Layer>
      </g>

      {/* Premium insulation */}
      <Layer id="insulation" show={Boolean(visuals["insulation"])}>
        <Slide x={g.ix - 4}>
          <InsulationBand x1={0} y1={196} x2={0} y2={396} />
        </Slide>
        <Slide x={right + 4}>
          <InsulationBand x1={0} y1={196} x2={0} y2={396} />
        </Slide>
        <motion.g initial={false} animate={{ opacity: g.wings ? 1 : 0 }} transition={t}>
          <InsulationBand x1={seamL - 8} y1={148} x2={seamR + 8} y2={148} />
          <InsulationBand x1={g.ix - 12} y1={188} x2={seamL - 6} y2={188} />
          <InsulationBand x1={seamR + 6} y1={188} x2={right + 12} y2={188} />
        </motion.g>
        <motion.g initial={false} animate={{ opacity: g.wings ? 0 : 1 }} transition={t}>
          <InsulationBand x1={g.ix - 10} y1={188} x2={right + 10} y2={188} />
        </motion.g>
      </Layer>

      {/* Wall-split aircon */}
      <Layer id="aircon" show={Boolean(visuals["aircon"])}>
        <Slide x={g.aircon.x} y={g.aircon.y}>
          <AirconSplit x={0} y={0} />
        </Slide>
      </Layer>

      {/* Modules */}
      <Layer id="wet-room" show={Boolean(visuals["wet-room"])}>
        <Slide x={g.wet.x}>
          <WetRoom x={0} floor={FLOOR} w={88} partitions={g.wet.partitions} />
        </Slide>
      </Layer>
      <Layer id="kitchen" show={kitchenOn}>
        <Slide x={g.kitchen.x}>
          <Kitchen x={0} floor={FLOOR} w={g.kitchen.w} />
        </Slide>
      </Layer>
      <Layer id="cupboards" show={kitchenOn && Boolean(visuals["cupboards"])}>
        <Slide x={g.cup.x}>
          <Cupboards x={0} w={g.cup.w} bottom={336} />
        </Slide>
      </Layer>

      {/* Furnished */}
      <Layer id="f-rug" show={furnished} delay={0}>
        <Slide x={g.rug.cx}>
          <Rug cx={0} floor={FLOOR} rx={g.rug.rx} />
        </Slide>
      </Layer>
      <Layer id="f-sofa" show={furnished && Boolean(g.sofa)} delay={0.06}>
        <Slide x={g.sofa?.x ?? 0}>
          <SofaWithCushions x={0} floor={FLOOR} w={g.sofa?.w ?? 44} />
        </Slide>
      </Layer>
      <Layer id="f-coffee" show={furnished && Boolean(g.coffee)} delay={0.12}>
        <Slide x={g.coffee?.x ?? 0}>
          <CoffeeTable x={0} floor={FLOOR} w={g.coffee?.w ?? 18} />
        </Slide>
      </Layer>
      <Layer id="f-bed" show={furnished} delay={0.18}>
        <Slide x={g.bed.x}>
          <DoubleBed x={0} floor={FLOOR} w={g.bed.w} />
        </Slide>
      </Layer>
      <Layer id="f-table" show={furnished && Boolean(g.table)} delay={0.24}>
        <Slide x={g.table?.x ?? 0}>
          <SideTable x={0} floor={FLOOR} />
        </Slide>
      </Layer>
      <Layer id="f-plant" show={furnished && Boolean(g.plantBig ?? g.plantSmall)} delay={0.3}>
        <Slide x={g.plantBig?.x ?? g.plantSmall?.x ?? 0}>
          {g.plantBig ? (
            <FloorPlant x={0} floor={FLOOR} scale={g.plantBig.s} />
          ) : (
            <Plant x={0} floor={FLOOR} />
          )}
        </Slide>
      </Layer>
      <Layer id="f-tv" show={furnished} delay={0.36}>
        <Slide x={g.tv.x} y={g.tv.y}>
          <WallTv x={0} y={0} w={g.tv.w} />
        </Slide>
      </Layer>
      <Layer id="f-frames" show={furnished} delay={0.42}>
        <Slide x={g.frames.x} y={g.frames.y}>
          <PictureFrames x={0} y={0} />
        </Slide>
      </Layer>
      <Layer id="f-shelf" show={furnished && Boolean(g.shelf)} delay={0.48}>
        <Slide x={g.shelf?.x ?? 0} y={g.shelf?.y ?? 0}>
          <ShelvingUnit x={0} y={0} w={44} />
        </Slide>
      </Layer>
      <Layer id="f-pendant" show={furnished} delay={0.54}>
        <Slide x={g.pendant.x} y={g.pendant.top}>
          <PendantLamp x={0} top={0} drop={g.pendant.drop} />
        </Slide>
      </Layer>
      {/* B40 three-bedroom character: partition walls + second bed */}
      <Layer id="f-threebed" show={furnished && Boolean(g.threeBed)} delay={0.6}>
        {g.threeBed && (
          <g>
            <line x1={g.threeBed.partitions[0]} y1={196} x2={g.threeBed.partitions[0]} y2={398} stroke={INK} strokeWidth={SW} strokeOpacity={0.85} strokeLinecap="round" />
            <line x1={g.threeBed.partitions[1]} y1={196} x2={g.threeBed.partitions[1]} y2={398} stroke={INK} strokeWidth={SW} strokeOpacity={0.85} strokeLinecap="round" />
            <DoubleBed x={g.threeBed.bed2.x} floor={FLOOR} w={g.threeBed.bed2.w} />
          </g>
        )}
      </Layer>

      {/* Dimension line: the variant's floor area under the house */}
      {sizeLabel && (
        <g aria-hidden="true">
          <motion.rect
            initial={false}
            animate={{ attrX: g.ix - 8, width: g.iw + 16 }}
            transition={t}
            y={455}
            height={2}
            rx={1}
            fill={INK}
            opacity={0.55}
          />
          <Slide x={g.ix - 8}>
            <line x1={0} y1={449} x2={0} y2={463} stroke={INK} strokeWidth={2} strokeOpacity={0.55} strokeLinecap="round" />
          </Slide>
          <Slide x={right + 8}>
            <line x1={0} y1={449} x2={0} y2={463} stroke={INK} strokeWidth={2} strokeOpacity={0.55} strokeLinecap="round" />
          </Slide>
          <text x={400} y={481} textAnchor="middle" fontSize={15} fontWeight={500} fill={INK} opacity={0.7}>
            {sizeLabel}
          </text>
        </g>
      )}
    </svg>
  );
}
