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
 * Folding home — compact rectangular cabin with fold-seam hints.
 * Interior: x 248–572, floor y 400. Kitchen left, wet room right, bed centre.
 */
export function FoldingHomesScene({ selected, furnished }: SceneProps) {
  const kitchenOn = Boolean(selected["kitchen-unit"]);
  return (
    <svg
      viewBox="0 0 800 500"
      role="img"
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <title>Cutaway illustration of a folding home showing your selected options</title>
      <Scenery />
      <Tree x={100} />
      <Shrub x={692} />

      {/* Interior back wall */}
      <rect x={248} y={208} width={324} height={192} fill="var(--color-parchment)" />

      {/* Upgraded walls layer (background) */}
      <Layer id="walls" show={Boolean(selected["upgraded-walls"])}>
        <SlatWalls x={248} w={324} top={208} bottom={400} />
      </Layer>

      {/* Window on the back wall */}
      <rect x={296} y={240} width={50} height={38} rx={2} fill="var(--color-cream)" stroke={INK} strokeWidth={1.8} strokeOpacity={0.7} />
      <line x1={321} y1={240} x2={321} y2={278} stroke={INK} strokeWidth={1.2} strokeOpacity={0.5} />

      {/* Shell: slab, plinths, walls, roof */}
      <rect x={240} y={400} width={340} height={12} rx={2} fill="var(--color-sand)" stroke={INK} strokeWidth={SW} strokeOpacity={0.85} />
      <rect x={272} y={412} width={14} height={20} fill="var(--color-stone)" opacity={0.55} />
      <rect x={534} y={412} width={14} height={20} fill="var(--color-stone)" opacity={0.55} />
      <rect x={240} y={200} width={8} height={200} fill="var(--color-sand)" stroke={INK} strokeWidth={SW} strokeOpacity={0.85} />
      <rect x={572} y={200} width={8} height={200} fill="var(--color-sand)" stroke={INK} strokeWidth={SW} strokeOpacity={0.85} />
      <rect x={228} y={188} width={364} height={12} rx={3} fill="var(--color-sand)" stroke={INK} strokeWidth={SW} strokeOpacity={0.85} />

      {/* Fold-seam hints: hinge points + dashed overhang seams */}
      <circle cx={244} cy={201} r={3} fill="var(--color-clay)" />
      <circle cx={576} cy={201} r={3} fill="var(--color-clay)" />
      <circle cx={244} cy={399} r={3} fill="var(--color-clay)" />
      <circle cx={576} cy={399} r={3} fill="var(--color-clay)" />
      <line x1={229} y1={194} x2={241} y2={194} stroke={INK} strokeWidth={1.6} strokeDasharray="3 3" strokeOpacity={0.6} />
      <line x1={579} y1={194} x2={591} y2={194} stroke={INK} strokeWidth={1.6} strokeDasharray="3 3" strokeOpacity={0.6} />

      {/* Floor finish */}
      <BaseFloor x={248} w={324} floor={400} />
      <Layer id="floors" show={Boolean(selected["upgraded-floors"])}>
        <PlankFloor x={248} w={324} floor={400} />
      </Layer>

      {/* Premium insulation: infill within wall/roof cross-sections */}
      <Layer id="insulation" show={Boolean(selected["premium-insulation"])}>
        <InsulationBand x1={236} y1={194} x2={584} y2={194} />
        <InsulationBand x1={244} y1={206} x2={244} y2={396} />
        <InsulationBand x1={576} y1={206} x2={576} y2={396} />
      </Layer>

      {/* Modules */}
      <Layer id="wet-room" show={Boolean(selected["wet-room"])}>
        <WetRoom x={486} floor={400} w={86} partitions="left" />
      </Layer>
      <Layer id="kitchen" show={kitchenOn}>
        <Kitchen x={260} floor={400} w={100} />
      </Layer>
      <Layer id="cupboards" show={kitchenOn && Boolean(selected["overhead-cupboards"])}>
        <Cupboards x={264} w={84} bottom={336} />
      </Layer>

      {/* Furnished */}
      <Layer id="f-rug" show={furnished} delay={0}>
        <Rug cx={410} floor={400} rx={34} />
      </Layer>
      <Layer id="f-bed" show={furnished} delay={0.06}>
        <Bed x={368} floor={400} w={74} />
      </Layer>
      <Layer id="f-table" show={furnished} delay={0.12}>
        <SideTable x={452} floor={400} />
      </Layer>
      <Layer id="f-plant" show={furnished} delay={0.18}>
        <Plant x={470} floor={400} />
      </Layer>
      <Layer id="f-art" show={furnished} delay={0.24}>
        <WallArt x={386} y={258} />
      </Layer>
    </svg>
  );
}
