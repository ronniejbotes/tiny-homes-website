"use client";

import type { SceneProps } from "./types";
import {
  BaseFloor,
  Cupboards,
  FloorPlant,
  HeatingGlow,
  InsulationPath,
  Kitchen,
  Layer,
  PendantLamp,
  PictureFrames,
  PlankFloor,
  RoundBed,
  Rug,
  Scenery,
  ShelvingUnit,
  Shrub,
  SolarPanels,
  Tree,
  WallTv,
  WetRoom,
  INK,
  SW,
} from "./shared";

/**
 * The Dome — semicircular transparent dome with panel segments and a terrace.
 * Interior: x 212–588, floor y 400. Wet room left, round bed centre,
 * kitchen right, floor plant out on the terrace.
 *
 * Zoning (worst case, all options + furnished):
 *   left drape 217–235 · floor aircon 236–252 · wet room 254–342 ·
 *   round bed 344–456 · kitchen 468–556 (counter 465–559) · right drape 565–583.
 *   Wall plane: frames 272–335 (y244–265) · pendant x380 · TV 408–452 (y236–286) ·
 *   shelving 484–532 (y240–310, cupboards top at 314).
 *
 * Local primitives (not in shared.tsx): DomeDrape (gathered blackout curtain
 * for the curved interior — shared <Curtains> is window-shaped) and
 * FloorAircon (floor-standing unit; a wall split has nowhere to mount on a
 * transparent shell).
 */
export function TheDomeScene({ visuals, furnished }: SceneProps) {
  const kitchenOn = Boolean(visuals["kitchen"]);
  const curtainsOn = Boolean(visuals["curtains"]) || Boolean(visuals["walls"]);
  return (
    <svg
      viewBox="0 0 800 500"
      role="img"
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <title>Cutaway illustration of a transparent dome home showing your selected options</title>
      <Scenery />
      <Tree x={90} h={100} />
      <Shrub x={740} />

      {/* Transparent dome shell */}
      <path
        d="M 190 400 A 210 220 0 0 1 610 400"
        fill="var(--color-sage)"
        fillOpacity={0.12}
        stroke={INK}
        strokeWidth={2.5}
        strokeOpacity={0.85}
        strokeLinecap="round"
      />
      {/* Panel segment meridians + latitude seams */}
      <path d="M 250 400 A 150 190 0 0 1 550 400" fill="none" stroke={INK} strokeWidth={1.2} strokeOpacity={0.3} />
      <path d="M 310 400 A 90 150 0 0 1 490 400" fill="none" stroke={INK} strokeWidth={1.2} strokeOpacity={0.3} />
      <line x1={256} y1={240} x2={544} y2={240} stroke={INK} strokeWidth={1.2} strokeOpacity={0.28} />
      <line x1={213} y1={300} x2={587} y2={300} stroke={INK} strokeWidth={1.2} strokeOpacity={0.28} />

      {/* Interior depth wash rising from the floor */}
      <rect x={216} y={332} width={368} height={68} fill="url(#th-wall-wash)" opacity={0.15} aria-hidden="true" />

      {/* Base slab + plinths */}
      <rect x={190} y={400} width={420} height={12} rx={2} fill="var(--color-sand)" stroke={INK} strokeWidth={SW} strokeOpacity={0.85} />
      <rect x={222} y={412} width={14} height={20} fill="var(--color-stone)" opacity={0.55} />
      <rect x={564} y={412} width={14} height={20} fill="var(--color-stone)" opacity={0.55} />

      {/* Terrace with low railing */}
      <rect x={610} y={404} width={92} height={8} rx={2} fill="var(--color-clay-light)" opacity={0.85} stroke={INK} strokeWidth={1.8} strokeOpacity={0.7} />
      <rect x={620} y={412} width={10} height={20} fill="var(--color-stone)" opacity={0.55} />
      <rect x={686} y={412} width={10} height={20} fill="var(--color-stone)" opacity={0.55} />
      <line x1={622} y1={374} x2={622} y2={404} stroke={INK} strokeWidth={2.2} strokeOpacity={0.8} />
      <line x1={654} y1={374} x2={654} y2={404} stroke={INK} strokeWidth={2.2} strokeOpacity={0.8} />
      <line x1={686} y1={374} x2={686} y2={404} stroke={INK} strokeWidth={2.2} strokeOpacity={0.8} />
      <line x1={612} y1={372} x2={700} y2={372} stroke={INK} strokeWidth={2.4} strokeOpacity={0.85} strokeLinecap="round" />

      {/* Floor finish */}
      <BaseFloor x={212} w={376} floor={400} />
      <Layer id="floors" show={Boolean(visuals["floors"])}>
        <PlankFloor x={212} w={376} floor={400} />
      </Layer>

      {/* Under-floor heating: warm glow strip, behind everything on the floor */}
      <Layer id="heating" show={Boolean(visuals["heating"])}>
        <HeatingGlow x={212} w={376} floor={400} />
      </Layer>

      {/* Premium insulation: insulated inner lining following the dome curve */}
      <Layer id="insulation" show={Boolean(visuals["insulation"])}>
        <InsulationPath d="M 215 398 A 185 195 0 0 1 585 398" />
      </Layer>

      {/* Blackout curtains on tracks along the dome interior (upgraded-walls visual) */}
      <Layer id="curtains" show={curtainsOn}>
        <DomeDrape x={218} top={294} />
        <DomeDrape x={566} top={294} flip />
      </Layer>

      {/* Floor-standing aircon (no solid wall to hang a split unit on) */}
      <Layer id="aircon" show={Boolean(visuals["aircon"])}>
        <FloorAircon x={236} floor={400} />
      </Layer>

      {/* Modules */}
      <Layer id="wet-room" show={Boolean(visuals["wet-room"])}>
        <WetRoom x={254} floor={400} w={88} partitions="right" />
      </Layer>
      <Layer id="kitchen" show={kitchenOn}>
        <Kitchen x={468} floor={400} w={88} />
      </Layer>
      <Layer id="cupboards" show={kitchenOn && Boolean(visuals["cupboards"])}>
        <Cupboards x={474} w={76} bottom={340} />
      </Layer>

      {/* Discreet solar array on a service plinth beside the base — never on the shell */}
      <Layer id="solar" show={Boolean(visuals["solar"])}>
        <rect x={106} y={423} width={76} height={9} rx={2} fill="var(--color-stone)" opacity={0.55} />
        <SolarPanels x={112} y={398} w={64} />
        <line
          x1={182}
          y1={427}
          x2={224}
          y2={427}
          stroke={INK}
          strokeWidth={1.6}
          strokeOpacity={0.5}
          strokeDasharray="3 4"
          strokeLinecap="round"
        />
      </Layer>

      {/* Furnished */}
      <Layer id="f-rug" show={furnished} delay={0}>
        <Rug cx={400} floor={400} rx={46} />
      </Layer>
      <Layer id="f-bed" show={furnished} delay={0.05}>
        <RoundBed cx={400} floor={400} />
      </Layer>
      <Layer id="f-tv" show={furnished} delay={0.1}>
        <WallTv x={408} y={236} w={44} />
      </Layer>
      <Layer id="f-frames" show={furnished} delay={0.15}>
        <PictureFrames x={272} y={244} />
      </Layer>
      <Layer id="f-shelves" show={furnished} delay={0.2}>
        <ShelvingUnit x={484} y={240} />
      </Layer>
      <Layer id="f-pendant" show={furnished} delay={0.25}>
        <PendantLamp x={380} top={198} drop={50} />
      </Layer>
      <Layer id="f-plant" show={furnished} delay={0.3}>
        <FloorPlant x={640} floor={404} />
      </Layer>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Local primitives                                                    */
/* ------------------------------------------------------------------ */

/**
 * Gathered blackout drape hanging from a short track that follows the dome
 * shell. Local because shared <Curtains> is shaped around a rectangular
 * window, not a curved interior. Body spans roughly x-1 .. x+17.
 */
function DomeDrape({ x, top, flip = false }: { x: number; top: number; flip?: boolean }) {
  const h = 400 - top;
  return (
    <g aria-hidden="true">
      {/* track segment hugging the shell + end stop */}
      <line
        x1={flip ? x + 18 : x - 2}
        y1={top - 2}
        x2={flip ? x - 4 : x + 20}
        y2={top - 24}
        stroke={INK}
        strokeWidth={2}
        strokeOpacity={0.75}
        strokeLinecap="round"
      />
      <circle cx={flip ? x + 18 : x - 2} cy={top - 2} r={2.2} fill="var(--color-clay)" />
      {/* gathered drape body */}
      <path
        d={`M ${x + 2} ${top}
            h 12
            q 3 ${h * 0.3} 0 ${h * 0.55}
            q 2 ${h * 0.28} -1 ${h * 0.45 - 2}
            q -5 3 -10 0
            q -3 ${-h * 0.25} -1 ${-h * 0.45}
            q -2 ${-h * 0.3} 0 ${-h * 0.55}
            z`}
        fill="url(#th-wall-wash)"
        stroke="var(--color-sand)"
        strokeWidth={1}
        strokeOpacity={0.7}
      />
      {/* fold lines */}
      <path
        d={`M ${x + 6} ${top + 6} q 2 ${h * 0.35} -0.5 ${h * 0.8}`}
        fill="none"
        stroke="var(--color-cream)"
        strokeWidth={1.2}
        strokeOpacity={0.8}
      />
      <path
        d={`M ${x + 11} ${top + 6} q 2.5 ${h * 0.3} 0 ${h * 0.72}`}
        fill="none"
        stroke="var(--color-clay)"
        strokeWidth={0.9}
        strokeOpacity={0.25}
      />
      {/* tieback */}
      <path
        d={`M ${x + 2} ${top + h * 0.58} q 6 4 12 0`}
        fill="none"
        stroke="var(--color-clay)"
        strokeWidth={2}
        strokeOpacity={0.75}
        strokeLinecap="round"
      />
    </g>
  );
}

/** Slim floor-standing aircon column with louvres, status light and cool wisps. */
function FloorAircon({ x, floor }: { x: number; floor: number }) {
  const w = 16;
  const h = 50;
  const top = floor - h;
  return (
    <g aria-hidden="true">
      <ellipse cx={x + w / 2} cy={floor + 2} rx={11} ry={2.5} fill={INK} opacity={0.08} filter="url(#th-soft)" />
      <rect x={x} y={top} width={w} height={h} rx={5} fill="var(--color-cream)" stroke={INK} strokeWidth={1.8} strokeOpacity={0.8} />
      <rect x={x + 2.5} y={top + 4} width={w - 5} height={16} rx={2.5} fill="var(--color-parchment)" opacity={0.9} />
      {/* louvre lines */}
      <line x1={x + 4} y1={top + 8} x2={x + w - 4} y2={top + 8} stroke={INK} strokeWidth={1} strokeOpacity={0.4} />
      <line x1={x + 4} y1={top + 12} x2={x + w - 4} y2={top + 12} stroke={INK} strokeWidth={1} strokeOpacity={0.35} />
      <line x1={x + 4} y1={top + 16} x2={x + w - 4} y2={top + 16} stroke={INK} strokeWidth={1} strokeOpacity={0.3} />
      {/* status dot */}
      <circle cx={x + w / 2} cy={floor - 8} r={1.4} fill="var(--color-moss)" />
      {/* cool air wisps rising from the top */}
      <path
        d={`M ${x + 4} ${top - 4} q 3 -4 0 -9 M ${x + 8} ${top - 4} q 3 -5 0 -11 M ${x + 12} ${top - 4} q 3 -4 0 -9`}
        fill="none"
        stroke="var(--color-sage)"
        strokeWidth={1.6}
        strokeOpacity={0.6}
        strokeDasharray="3 4"
        strokeLinecap="round"
      />
    </g>
  );
}
