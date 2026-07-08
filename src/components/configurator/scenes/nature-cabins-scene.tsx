"use client";

import type { SceneProps } from "./types";
import {
  BaseFloor,
  Bed,
  Cupboards,
  InsulationBand,
  Kitchen,
  Layer,
  Plant,
  PlankFloor,
  Rug,
  Scenery,
  Shrub,
  SideTable,
  SlatWalls,
  Tree,
  WallArt,
  WetRoom,
  INK,
  SW,
} from "./shared";

/**
 * Nature cabin — pitched roof, timber-clad gable, front deck with railing.
 * Interior: x 258–562, floor y 400. Wet room left, kitchen centre, bed right,
 * potted plant out on the deck.
 */
export function NatureCabinsScene({ selected, furnished }: SceneProps) {
  const kitchenOn = Boolean(selected["kitchen-unit"]);
  return (
    <svg
      viewBox="0 0 800 500"
      role="img"
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <title>Cutaway illustration of a nature cabin showing your selected options</title>
      <Scenery />
      <Tree x={110} h={104} />
      <Shrub x={720} />

      {/* Interior back wall */}
      <rect x={258} y={248} width={304} height={152} fill="var(--color-parchment)" />

      {/* Upgraded walls layer */}
      <Layer id="walls" show={Boolean(selected["upgraded-walls"])}>
        <SlatWalls x={258} w={304} top={248} bottom={400} />
      </Layer>

      {/* Window above the kitchen zone */}
      <rect x={368} y={268} width={44} height={34} rx={2} fill="var(--color-cream)" stroke={INK} strokeWidth={1.8} strokeOpacity={0.7} />
      <line x1={390} y1={268} x2={390} y2={302} stroke={INK} strokeWidth={1.2} strokeOpacity={0.5} />

      {/* Shell: slab, plinths, walls */}
      <rect x={250} y={400} width={320} height={12} rx={2} fill="var(--color-sand)" stroke={INK} strokeWidth={SW} strokeOpacity={0.85} />
      <rect x={280} y={412} width={14} height={20} fill="var(--color-stone)" opacity={0.55} />
      <rect x={520} y={412} width={14} height={20} fill="var(--color-stone)" opacity={0.55} />
      <rect x={250} y={240} width={8} height={160} fill="var(--color-sand)" stroke={INK} strokeWidth={SW} strokeOpacity={0.85} />
      <rect x={562} y={240} width={8} height={160} fill="var(--color-sand)" stroke={INK} strokeWidth={SW} strokeOpacity={0.85} />
      {/* Ceiling line */}
      <line x1={258} y1={248} x2={562} y2={248} stroke={INK} strokeWidth={1.4} strokeOpacity={0.35} />

      {/* Timber gable with cladding lines */}
      <path d="M 250 246 L 400 138 L 570 246 Z" fill="var(--color-sand)" opacity={0.55} />
      <line x1={268} y1={230} x2={556} y2={230} stroke="var(--color-clay)" strokeWidth={1.4} strokeOpacity={0.5} />
      <line x1={306} y1={200} x2={518} y2={200} stroke="var(--color-clay)" strokeWidth={1.4} strokeOpacity={0.5} />
      <line x1={346} y1={170} x2={474} y2={170} stroke="var(--color-clay)" strokeWidth={1.4} strokeOpacity={0.5} />

      {/* Pitched roof slab, extended over the deck */}
      <path
        d="M 230 256 L 400 124 L 642 272 L 630 280 L 400 140 L 242 264 Z"
        fill="var(--color-sand)"
        stroke={INK}
        strokeWidth={SW}
        strokeOpacity={0.85}
        strokeLinejoin="round"
      />

      {/* Deck with railing */}
      <rect x={570} y={400} width={78} height={8} rx={2} fill="var(--color-clay-light)" opacity={0.85} stroke={INK} strokeWidth={1.8} strokeOpacity={0.7} />
      <rect x={578} y={408} width={10} height={24} fill="var(--color-stone)" opacity={0.55} />
      <rect x={636} y={408} width={10} height={24} fill="var(--color-stone)" opacity={0.55} />
      <line x1={584} y1={366} x2={584} y2={400} stroke={INK} strokeWidth={2.2} strokeOpacity={0.8} />
      <line x1={614} y1={366} x2={614} y2={400} stroke={INK} strokeWidth={2.2} strokeOpacity={0.8} />
      <line x1={644} y1={366} x2={644} y2={400} stroke={INK} strokeWidth={2.2} strokeOpacity={0.8} />
      <line x1={572} y1={364} x2={650} y2={364} stroke={INK} strokeWidth={2.4} strokeOpacity={0.85} strokeLinecap="round" />

      {/* Floor finish */}
      <BaseFloor x={258} w={304} floor={400} />
      <Layer id="floors" show={Boolean(selected["upgraded-floors"])}>
        <PlankFloor x={258} w={304} floor={400} />
      </Layer>

      {/* Premium insulation: roof slopes + walls */}
      <Layer id="insulation" show={Boolean(selected["premium-insulation"])}>
        <InsulationBand x1={254} y1={248} x2={394} y2={142} />
        <InsulationBand x1={406} y1={142} x2={586} y2={252} />
        <InsulationBand x1={254} y1={246} x2={254} y2={396} />
        <InsulationBand x1={566} y1={246} x2={566} y2={396} />
      </Layer>

      {/* Modules */}
      <Layer id="wet-room" show={Boolean(selected["wet-room"])}>
        <WetRoom x={258} floor={400} w={88} partitions="right" />
      </Layer>
      <Layer id="kitchen" show={kitchenOn}>
        <Kitchen x={352} floor={400} w={100} />
      </Layer>
      <Layer id="cupboards" show={kitchenOn && Boolean(selected["overhead-cupboards"])}>
        <Cupboards x={358} w={84} bottom={336} />
      </Layer>

      {/* Furnished */}
      <Layer id="f-rug" show={furnished} delay={0}>
        <Rug cx={500} floor={400} rx={28} />
      </Layer>
      <Layer id="f-bed" show={furnished} delay={0.06}>
        <Bed x={462} floor={400} w={74} />
      </Layer>
      <Layer id="f-table" show={furnished} delay={0.12}>
        <SideTable x={545} floor={400} />
      </Layer>
      <Layer id="f-plant" show={furnished} delay={0.18}>
        <Plant x={600} floor={400} />
      </Layer>
      <Layer id="f-art" show={furnished} delay={0.24}>
        <WallArt x={472} y={272} />
      </Layer>
    </svg>
  );
}
