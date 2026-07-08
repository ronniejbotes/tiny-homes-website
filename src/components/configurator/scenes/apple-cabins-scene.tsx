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
  SofaItem,
  Tree,
  WallArt,
  WetRoom,
  INK,
  SW,
} from "./shared";

/**
 * Apple cabin — elongated angular pod with a long glazed side and mullions.
 * Interior: x 190–640, floor y 400. Kitchen + sofa left, central wet room,
 * bedroom right — the two-room layout with the bathroom in the middle.
 */
export function AppleCabinsScene({ selected, furnished }: SceneProps) {
  const kitchenOn = Boolean(selected["kitchen-unit"]);
  return (
    <svg
      viewBox="0 0 800 500"
      role="img"
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <title>Cutaway illustration of an apple cabin showing your selected options</title>
      <Scenery />
      <Tree x={92} h={100} />
      <Shrub x={730} />

      {/* Angular pod shell (sand) with interior cut out (parchment) */}
      <path
        d="M 172 400 L 206 224 Q 210 214 222 213 L 610 206 Q 622 205 626 214 L 658 400 Z"
        fill="var(--color-sand)"
        stroke={INK}
        strokeWidth={2.5}
        strokeOpacity={0.85}
        strokeLinejoin="round"
      />
      <path d="M 182 398 L 212 228 L 606 220 L 648 398 Z" fill="var(--color-parchment)" />

      {/* Long glass side: tint + mullions */}
      <rect x={212} y={230} width={394} height={162} fill="var(--color-sage)" opacity={0.09} />
      {[240, 295, 350, 405, 460, 515, 570].map((mx) => (
        <line key={mx} x1={mx} y1={229} x2={mx} y2={396} stroke={INK} strokeWidth={1.3} strokeOpacity={0.16} />
      ))}

      {/* Upgraded walls layer */}
      <Layer id="walls" show={Boolean(selected["upgraded-walls"])}>
        <SlatWalls x={196} w={440} top={240} bottom={400} />
      </Layer>

      {/* Slab + feet */}
      <rect x={176} y={400} width={478} height={10} rx={2} fill="var(--color-sand)" stroke={INK} strokeWidth={SW} strokeOpacity={0.85} />
      <rect x={230} y={410} width={16} height={22} fill="var(--color-stone)" opacity={0.55} />
      <rect x={590} y={410} width={16} height={22} fill="var(--color-stone)" opacity={0.55} />

      {/* Floor finish */}
      <BaseFloor x={196} w={440} floor={400} />
      <Layer id="floors" show={Boolean(selected["upgraded-floors"])}>
        <PlankFloor x={196} w={440} floor={400} />
      </Layer>

      {/* Premium insulation: roofline + slanted end walls */}
      <Layer id="insulation" show={Boolean(selected["premium-insulation"])}>
        <InsulationBand x1={230} y1={218} x2={600} y2={212} />
        <InsulationBand x1={206} y1={240} x2={180} y2={390} />
        <InsulationBand x1={618} y1={230} x2={650} y2={390} />
      </Layer>

      {/* Modules: central bathroom, kitchen on the left */}
      <Layer id="wet-room" show={Boolean(selected["wet-room"])}>
        <WetRoom x={372} floor={400} w={88} partitions="both" />
      </Layer>
      <Layer id="kitchen" show={kitchenOn}>
        <Kitchen x={196} floor={400} w={100} />
      </Layer>
      <Layer id="cupboards" show={kitchenOn && Boolean(selected["overhead-cupboards"])}>
        <Cupboards x={202} w={80} bottom={336} />
      </Layer>

      {/* Furnished */}
      <Layer id="f-rug" show={furnished} delay={0}>
        <Rug cx={332} floor={400} rx={26} />
      </Layer>
      <Layer id="f-sofa" show={furnished} delay={0.06}>
        <SofaItem x={306} floor={400} w={46} />
      </Layer>
      <Layer id="f-bed" show={furnished} delay={0.12}>
        <Bed x={478} floor={400} w={74} />
      </Layer>
      <Layer id="f-table" show={furnished} delay={0.18}>
        <SideTable x={562} floor={400} />
      </Layer>
      <Layer id="f-plant" show={furnished} delay={0.24}>
        <Plant x={586} floor={400} />
      </Layer>
      <Layer id="f-art" show={furnished} delay={0.3}>
        <WallArt x={488} y={262} />
      </Layer>
    </svg>
  );
}
