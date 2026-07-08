"use client";

import type { SceneProps } from "./types";
import {
  AirconSplit,
  BaseFloor,
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
  PlankFloor,
  Rug,
  Scenery,
  ShelvingUnit,
  Shrub,
  SlatWalls,
  SofaWithCushions,
  SolarPanels,
  StackGhost,
  Tree,
  WallTv,
  WetRoom,
  Window,
  INK,
  SW,
} from "./shared";

/**
 * Folding home — compact rectangular cabin with fold-seam hints.
 * Interior: x 248–572, floor y 400. Kitchen left (x 260–348), living centre
 * (x 351–486), wet room right (x 486–572). Two windows: main (296–346) and
 * a smaller one in the wet zone (496–540) so glazing reads on both.
 *
 * Collision-checked zones (worst case: every visual on + furnished):
 *   floor: kitchen slab 257–351 | plant 352–382 | sofa 384–431 | bed 434–484 | wet 486–572
 *   wall:  window1 296–346 (y240–278), curtains1 rod y238 (clears frames at
 *          x358) | frames 358–422 (y218–239) | tv 356–400 (y254–304) |
 *          pendant 414–434 (y242–260) | shelving 438–482 (y216–286) |
 *          aircon 496–540 (y206–236) | window2 496–540 (y242–279),
 *          curtains2 rod y240 (clears the aircon bottom y236)
 *   roof:  solar 336–466 (y162–188) | stack ghost 244–576 (y20–154)
 *   right: deck 580–652 (ground) | shrub 666+
 */
export function FoldingHomesScene({ visuals, furnished }: SceneProps) {
  const kitchenOn = Boolean(visuals["kitchen"]);
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

      {/* Stacking/linking potential: ghosted second unit above the roof */}
      <Layer id="stack" show={Boolean(visuals["stack"])}>
        <StackGhost x={244} y={20} w={332} h={134} />
      </Layer>

      {/* Interior back wall + depth wash */}
      <rect x={248} y={208} width={324} height={192} fill="var(--color-parchment)" />
      <rect x={248} y={208} width={324} height={192} fill="url(#th-wall-wash)" opacity={0.5} />

      {/* Upgraded walls layer (background) */}
      <Layer id="walls" show={Boolean(visuals["walls"])}>
        <SlatWalls x={248} w={324} top={208} bottom={400} />
      </Layer>

      {/* Main window on the back wall (glass sheen for depth) */}
      <rect x={296} y={240} width={50} height={38} rx={2} fill="var(--color-cream)" stroke={INK} strokeWidth={1.8} strokeOpacity={0.7} />
      <rect x={298.5} y={242.5} width={45} height={33} rx={1.5} fill="url(#th-glass)" />
      <line x1={321} y1={240} x2={321} y2={278} stroke={INK} strokeWidth={1.2} strokeOpacity={0.5} />

      {/* Second (wet-zone) window */}
      <Window x={496} y={242} w={44} h={34} />

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

      {/* Roof solar array */}
      <Layer id="solar" show={Boolean(visuals["solar"])}>
        <SolarPanels x={336} y={162} w={130} />
      </Layer>

      {/* Floor finish */}
      <BaseFloor x={248} w={324} floor={400} />
      <Layer id="floors" show={Boolean(visuals["floors"])}>
        <PlankFloor x={248} w={324} floor={400} />
      </Layer>

      {/* Premium insulation: infill within wall/roof cross-sections */}
      <Layer id="insulation" show={Boolean(visuals["insulation"])}>
        <InsulationBand x1={236} y1={194} x2={584} y2={194} />
        <InsulationBand x1={244} y1={206} x2={244} y2={396} />
        <InsulationBand x1={576} y1={206} x2={576} y2={396} />
      </Layer>

      {/* Double-glazing highlight on both windows */}
      <Layer id="glazing" show={Boolean(visuals["glazing"])}>
        <GlazingHighlight x={296} y={240} w={50} h={38} />
        <GlazingHighlight x={496} y={242} w={44} h={34} />
      </Layer>

      {/* Blackout curtains on both windows */}
      <Layer id="curtains" show={Boolean(visuals["curtains"])}>
        <Curtains x={296} y={236} w={50} h={46} />
        <Curtains x={496} y={238} w={44} h={42} />
      </Layer>

      {/* Wall-split aircon (indoor high on the wet-zone wall, outdoor at grade) */}
      <Layer id="aircon" show={Boolean(visuals["aircon"])}>
        <AirconSplit x={496} y={206} withOutdoor outdoorX={192} outdoorY={406} />
      </Layer>

      {/* Small front deck off the right gable */}
      <Layer id="deck" show={Boolean(visuals["deck"])}>
        <DeckExtension x={580} w={72} />
      </Layer>

      {/* Modules */}
      <Layer id="wet-room" show={Boolean(visuals["wet-room"])}>
        <WetRoom x={486} floor={400} w={86} partitions="left" />
      </Layer>
      <Layer id="kitchen" show={kitchenOn}>
        <Kitchen x={260} floor={400} w={88} />
      </Layer>
      <Layer id="cupboards" show={kitchenOn && Boolean(visuals["cupboards"])}>
        <Cupboards x={264} w={76} bottom={336} />
      </Layer>

      {/* Furnished */}
      <Layer id="f-rug" show={furnished} delay={0}>
        <Rug cx={420} floor={400} rx={30} />
      </Layer>
      <Layer id="f-bed" show={furnished} delay={0.06}>
        <DoubleBed x={434} floor={400} w={44} />
      </Layer>
      <Layer id="f-sofa" show={furnished} delay={0.12}>
        <SofaWithCushions x={384} floor={400} w={34} />
      </Layer>
      <Layer id="f-plant" show={furnished} delay={0.18}>
        <FloorPlant x={357} floor={400} scale={0.85} />
      </Layer>
      <Layer id="f-tv" show={furnished} delay={0.24}>
        <WallTv x={356} y={254} w={44} />
      </Layer>
      <Layer id="f-frames" show={furnished} delay={0.3}>
        <PictureFrames x={358} y={218} />
      </Layer>
      <Layer id="f-shelf" show={furnished} delay={0.36}>
        <ShelvingUnit x={438} y={216} w={44} />
      </Layer>
      <Layer id="f-pendant" show={furnished} delay={0.42}>
        <PendantLamp x={424} top={208} drop={34} />
      </Layer>
    </svg>
  );
}
