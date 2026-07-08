"use client";

import type { SceneProps } from "./types";
import {
  AirconSplit,
  BaseFloor,
  Cupboards,
  Curtains,
  DoubleBed,
  FloorPlant,
  GlazingHighlight,
  HeatingGlow,
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
  Tree,
  WallTv,
  WetRoom,
  INK,
  SW,
} from "./shared";

/**
 * Nature cabin — pitched roof, timber-clad gable with a small gable window,
 * front deck with railing (standard, not gated on a visual).
 * Interior: x 258–562, floor y 400, ceiling y 248. Wet room left (258–346),
 * kitchen centre (352–440), living/sleeping right (443–562).
 *
 * Collision-checked zones (worst case: every visual on + furnished):
 *   floor: wet 258–346 | kitchen slab 349–443 | sofa 446–495 | bed 498–558
 *   wall:  aircon 274–318 (y250–280, above wet top y282) |
 *          pendant 347–367 (y264–278) | window 368–412 (y268–305) |
 *          frames 444–508 (y252–273) | tv 448–492 (y278–328) |
 *          shelving 512–556 (y252–322) — bed headboard top y340
 *   gable: window 376–424 (y170–203), curtains hug it; solar on the right
 *          roof slope from x440 (clear of the gable face)
 *   deck:  boards 570–648, plant 587–613 sits between posts 584/614
 */
export function NatureCabinsScene({ visuals, furnished }: SceneProps) {
  const kitchenOn = Boolean(visuals["kitchen"]);
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

      {/* Interior back wall + depth wash */}
      <rect x={258} y={248} width={304} height={152} fill="var(--color-parchment)" />
      <rect x={258} y={248} width={304} height={152} fill="url(#th-wall-wash)" opacity={0.5} />

      {/* Upgraded walls layer */}
      <Layer id="walls" show={Boolean(visuals["walls"])}>
        <SlatWalls x={258} w={304} top={248} bottom={400} />
      </Layer>

      {/* Window above the kitchen zone (glass sheen for depth) */}
      <rect x={368} y={268} width={44} height={34} rx={2} fill="var(--color-cream)" stroke={INK} strokeWidth={1.8} strokeOpacity={0.7} />
      <rect x={370.5} y={270.5} width={39} height={29} rx={1.5} fill="url(#th-glass)" />
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

      {/* Gable window */}
      <rect x={376} y={170} width={48} height={30} rx={2} fill="var(--color-cream)" stroke={INK} strokeWidth={1.8} strokeOpacity={0.7} />
      <rect x={378.5} y={172.5} width={43} height={25} rx={1.5} fill="url(#th-glass)" />
      <line x1={400} y1={170} x2={400} y2={200} stroke={INK} strokeWidth={1.2} strokeOpacity={0.5} />

      {/* Pitched roof slab, extended over the deck */}
      <path
        d="M 230 256 L 400 124 L 642 272 L 630 280 L 400 140 L 242 264 Z"
        fill="var(--color-sand)"
        stroke={INK}
        strokeWidth={SW}
        strokeOpacity={0.85}
        strokeLinejoin="round"
      />

      {/* Solar array on the right roof slope */}
      <Layer id="solar" show={Boolean(visuals["solar"])}>
        <SolarPanels x={440} y={122} w={118} angle={31.5} />
      </Layer>

      {/* Deck with railing (standard) */}
      <rect x={570} y={400} width={78} height={8} rx={2} fill="var(--color-clay-light)" opacity={0.85} stroke={INK} strokeWidth={1.8} strokeOpacity={0.7} />
      <rect x={578} y={408} width={10} height={24} fill="var(--color-stone)" opacity={0.55} />
      <rect x={636} y={408} width={10} height={24} fill="var(--color-stone)" opacity={0.55} />
      <line x1={584} y1={366} x2={584} y2={400} stroke={INK} strokeWidth={2.2} strokeOpacity={0.8} />
      <line x1={614} y1={366} x2={614} y2={400} stroke={INK} strokeWidth={2.2} strokeOpacity={0.8} />
      <line x1={644} y1={366} x2={644} y2={400} stroke={INK} strokeWidth={2.2} strokeOpacity={0.8} />
      <line x1={572} y1={364} x2={650} y2={364} stroke={INK} strokeWidth={2.4} strokeOpacity={0.85} strokeLinecap="round" />

      {/* Floor finish */}
      <BaseFloor x={258} w={304} floor={400} />
      <Layer id="floors" show={Boolean(visuals["floors"])}>
        <PlankFloor x={258} w={304} floor={400} />
      </Layer>

      {/* Underfloor heating: warm glow rising off the slab */}
      <Layer id="heating" show={Boolean(visuals["heating"])}>
        <HeatingGlow x={258} w={304} floor={400} height={22} />
      </Layer>

      {/* Premium insulation: roof slopes + walls */}
      <Layer id="insulation" show={Boolean(visuals["insulation"])}>
        <InsulationBand x1={254} y1={248} x2={394} y2={142} />
        <InsulationBand x1={406} y1={142} x2={586} y2={252} />
        <InsulationBand x1={254} y1={246} x2={254} y2={396} />
        <InsulationBand x1={566} y1={246} x2={566} y2={396} />
      </Layer>

      {/* Double-glazing highlight on both windows */}
      <Layer id="glazing" show={Boolean(visuals["glazing"])}>
        <GlazingHighlight x={368} y={268} w={44} h={34} />
        <GlazingHighlight x={376} y={170} w={48} h={30} />
      </Layer>

      {/* Blackout curtains on the gable window */}
      <Layer id="curtains" show={Boolean(visuals["curtains"])}>
        <Curtains x={376} y={166} w={48} h={38} />
      </Layer>

      {/* Wall-split aircon (indoor above the wet zone, outdoor at grade) */}
      <Layer id="aircon" show={Boolean(visuals["aircon"])}>
        <AirconSplit x={274} y={250} withOutdoor outdoorX={198} outdoorY={404} />
      </Layer>

      {/* Modules */}
      <Layer id="wet-room" show={Boolean(visuals["wet-room"])}>
        <WetRoom x={258} floor={400} w={88} partitions="right" />
      </Layer>
      <Layer id="kitchen" show={kitchenOn}>
        <Kitchen x={352} floor={400} w={88} />
      </Layer>
      <Layer id="cupboards" show={kitchenOn && Boolean(visuals["cupboards"])}>
        <Cupboards x={358} w={76} bottom={336} />
      </Layer>

      {/* Furnished */}
      <Layer id="f-rug" show={furnished} delay={0}>
        <Rug cx={470} floor={400} rx={24} />
      </Layer>
      <Layer id="f-sofa" show={furnished} delay={0.06}>
        <SofaWithCushions x={446} floor={400} w={36} />
      </Layer>
      <Layer id="f-bed" show={furnished} delay={0.12}>
        <DoubleBed x={498} floor={400} w={54} />
      </Layer>
      <Layer id="f-plant" show={furnished} delay={0.18}>
        <FloorPlant x={590} floor={400} scale={0.75} />
      </Layer>
      <Layer id="f-frames" show={furnished} delay={0.24}>
        <PictureFrames x={444} y={252} />
      </Layer>
      <Layer id="f-tv" show={furnished} delay={0.3}>
        <WallTv x={448} y={278} w={44} />
      </Layer>
      <Layer id="f-shelf" show={furnished} delay={0.36}>
        <ShelvingUnit x={512} y={252} w={44} />
      </Layer>
      <Layer id="f-pendant" show={furnished} delay={0.42}>
        <PendantLamp x={357} top={248} drop={16} />
      </Layer>
    </svg>
  );
}
