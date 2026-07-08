"use client";

import type { SceneProps } from "./types";
import {
  BaseFloor,
  Cupboards,
  InsulationPath,
  Kitchen,
  Layer,
  Pendant,
  Plant,
  PlankFloor,
  RoundBed,
  Rug,
  Scenery,
  Shrub,
  SideTable,
  SlatWalls,
  Tree,
  WetRoom,
  INK,
  SW,
} from "./shared";

/**
 * The Dome — semicircular transparent dome with panel segments and a terrace.
 * Interior: x 212–588, floor y 400. Wet room left, round bed centre,
 * kitchen right, plant out on the terrace.
 */
export function TheDomeScene({ selected, furnished }: SceneProps) {
  const kitchenOn = Boolean(selected["kitchen-unit"]);
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

      {/* Upgraded walls: low timber wainscot lining inside the dome */}
      <Layer id="walls" show={Boolean(selected["upgraded-walls"])}>
        <SlatWalls x={246} w={308} top={336} bottom={400} />
      </Layer>

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
      <Layer id="floors" show={Boolean(selected["upgraded-floors"])}>
        <PlankFloor x={212} w={376} floor={400} />
      </Layer>

      {/* Premium insulation: insulated inner lining following the dome curve */}
      <Layer id="insulation" show={Boolean(selected["premium-insulation"])}>
        <InsulationPath d="M 215 398 A 185 195 0 0 1 585 398" />
      </Layer>

      {/* Modules */}
      <Layer id="wet-room" show={Boolean(selected["wet-room"])}>
        <WetRoom x={236} floor={400} w={88} partitions="right" />
      </Layer>
      <Layer id="kitchen" show={kitchenOn}>
        <Kitchen x={468} floor={400} w={88} />
      </Layer>
      <Layer id="cupboards" show={kitchenOn && Boolean(selected["overhead-cupboards"])}>
        <Cupboards x={474} w={76} bottom={340} />
      </Layer>

      {/* Furnished */}
      <Layer id="f-rug" show={furnished} delay={0}>
        <Rug cx={436} floor={400} rx={24} />
      </Layer>
      <Layer id="f-bed" show={furnished} delay={0.06}>
        <RoundBed cx={384} floor={400} />
      </Layer>
      <Layer id="f-table" show={furnished} delay={0.12}>
        <SideTable x={446} floor={400} />
      </Layer>
      <Layer id="f-pendant" show={furnished} delay={0.18}>
        <Pendant x={384} top={192} drop={56} />
      </Layer>
      <Layer id="f-plant" show={furnished} delay={0.24}>
        <Plant x={650} floor={404} />
      </Layer>
    </svg>
  );
}
