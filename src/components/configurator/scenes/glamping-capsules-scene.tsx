"use client";

import type { SceneProps } from "./types";
import {
  BaseFloor,
  Bed,
  Cupboards,
  InsulationBand,
  InsulationPath,
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
} from "./shared";

/**
 * Glamping capsule — rounded capsule ends, wraparound glass, curved roof,
 * raised on piers. Interior floor y 392, x 214–586. Kitchen + sofa left,
 * wet room centre, bedroom right.
 */
export function GlampingCapsulesScene({ selected, furnished }: SceneProps) {
  const kitchenOn = Boolean(selected["kitchen-unit"]);
  const floor = 392;
  return (
    <svg
      viewBox="0 0 800 500"
      role="img"
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <title>Cutaway illustration of a glamping capsule showing your selected options</title>
      <Scenery />
      <Tree x={84} h={104} />
      <Shrub x={732} />

      {/* Capsule shell: rounded outer + interior */}
      <rect x={150} y={215} width={500} height={185} rx={60} fill="var(--color-sand)" stroke={INK} strokeWidth={2.5} strokeOpacity={0.85} />
      <rect x={159} y={224} width={482} height={168} rx={52} fill="var(--color-parchment)" />

      {/* Wraparound glass: tint + mullions */}
      <rect x={200} y={232} width={400} height={152} fill="var(--color-sage)" opacity={0.09} />
      {[230, 280, 330, 380, 430, 480, 530, 570].map((mx) => (
        <line key={mx} x1={mx} y1={226} x2={mx} y2={388} stroke={INK} strokeWidth={1.3} strokeOpacity={0.16} />
      ))}
      {/* Curved roof seam */}
      <path d="M 196 248 Q 400 212 604 248" fill="none" stroke={INK} strokeWidth={1.2} strokeOpacity={0.3} />

      {/* Upgraded walls layer */}
      <Layer id="walls" show={Boolean(selected["upgraded-walls"])}>
        <SlatWalls x={214} w={372} top={244} bottom={392} />
      </Layer>

      {/* Piers to the ground */}
      <rect x={240} y={400} width={14} height={32} fill="var(--color-stone)" opacity={0.55} />
      <rect x={393} y={400} width={14} height={32} fill="var(--color-stone)" opacity={0.55} />
      <rect x={546} y={400} width={14} height={32} fill="var(--color-stone)" opacity={0.55} />

      {/* Floor finish */}
      <BaseFloor x={214} w={372} floor={floor} />
      <Layer id="floors" show={Boolean(selected["upgraded-floors"])}>
        <PlankFloor x={214} w={372} floor={floor} />
      </Layer>

      {/* Premium insulation: curved shell lining */}
      <Layer id="insulation" show={Boolean(selected["premium-insulation"])}>
        <InsulationBand x1={262} y1={229} x2={538} y2={229} />
        <InsulationPath d="M 168 330 Q 166 234 254 229" />
        <InsulationPath d="M 632 330 Q 634 234 546 229" />
      </Layer>

      {/* Modules: central wet room, kitchen left */}
      <Layer id="wet-room" show={Boolean(selected["wet-room"])}>
        <WetRoom x={400} floor={floor} w={88} partitions="both" />
      </Layer>
      <Layer id="kitchen" show={kitchenOn}>
        <Kitchen x={228} floor={floor} w={100} />
      </Layer>
      <Layer id="cupboards" show={kitchenOn && Boolean(selected["overhead-cupboards"])}>
        <Cupboards x={234} w={80} bottom={332} />
      </Layer>

      {/* Furnished */}
      <Layer id="f-rug" show={furnished} delay={0}>
        <Rug cx={356} floor={floor} rx={22} />
      </Layer>
      <Layer id="f-sofa" show={furnished} delay={0.06}>
        <SofaItem x={336} floor={floor} w={46} />
      </Layer>
      <Layer id="f-bed" show={furnished} delay={0.12}>
        <Bed x={496} floor={floor} w={68} />
      </Layer>
      <Layer id="f-table" show={furnished} delay={0.18}>
        <SideTable x={571} floor={floor} />
      </Layer>
      <Layer id="f-plant" show={furnished} delay={0.24}>
        <Plant x={210} floor={floor} />
      </Layer>
      <Layer id="f-art" show={furnished} delay={0.3}>
        <WallArt x={336} y={262} />
      </Layer>
    </svg>
  );
}
