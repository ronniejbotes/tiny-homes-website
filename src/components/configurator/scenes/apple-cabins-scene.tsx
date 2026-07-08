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

/**
 * Apple cabin — elongated angular pod with a long glazed side and mullions.
 * Interior: x 190–640, floor y 400. Kitchen + living left, central wet room,
 * bedroom right — the two-room layout with the bathroom in the middle.
 *
 * Zoning (worst case, all options + furnished):
 *   kitchen 196–296 (counter 193–299) · sofa 300–362 · wet room 372–460 ·
 *   bed 478–573 · side table 574–590 · floor plant 596–620.
 *   Wall plane: frames 214–277 (y244–265) · shelving 310–354 (y244–314) ·
 *   pendant x370 · aircon 394–438 (y236–277) · TV 512–556 (y248–300) ·
 *   curtain drapes 484–508 and 566–590 (y240–334, above the bed).
 *   Outside: solar on roof 320–500 · outdoor aircon unit 122–156 (left) ·
 *   balcony deck 656–744 (right).
 */
export function AppleCabinsScene({ visuals, furnished }: SceneProps) {
  const kitchenOn = Boolean(visuals["kitchen"]);
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
      {/* Interior depth wash */}
      <path d="M 186 396 L 214 232 L 604 224 L 644 396 Z" fill="url(#th-wall-wash)" opacity={0.12} aria-hidden="true" />

      {/* Upgraded walls layer */}
      <Layer id="walls" show={Boolean(visuals["walls"])}>
        <SlatWalls x={196} w={440} top={240} bottom={400} />
      </Layer>

      {/* Slab + feet */}
      <rect x={176} y={400} width={478} height={10} rx={2} fill="var(--color-sand)" stroke={INK} strokeWidth={SW} strokeOpacity={0.85} />
      <rect x={230} y={410} width={16} height={22} fill="var(--color-stone)" opacity={0.55} />
      <rect x={590} y={410} width={16} height={22} fill="var(--color-stone)" opacity={0.55} />

      {/* Floor finish */}
      <BaseFloor x={196} w={440} floor={400} />
      <Layer id="floors" show={Boolean(visuals["floors"])}>
        <PlankFloor x={196} w={440} floor={400} />
      </Layer>

      {/* Under-floor heating: warm glow strip, behind furniture */}
      <Layer id="heating" show={Boolean(visuals["heating"])}>
        <HeatingGlow x={196} w={440} floor={400} />
      </Layer>

      {/* Premium insulation: roofline + slanted end walls */}
      <Layer id="insulation" show={Boolean(visuals["insulation"])}>
        <InsulationBand x1={230} y1={218} x2={600} y2={212} />
        <InsulationBand x1={206} y1={240} x2={180} y2={390} />
        <InsulationBand x1={618} y1={230} x2={650} y2={390} />
      </Layer>

      {/* Blackout curtains framing the bedroom glass */}
      <Layer id="curtains" show={Boolean(visuals["curtains"])}>
        <Curtains x={486} y={238} w={100} h={94} />
      </Layer>

      {/* Modules: central bathroom, kitchen on the left */}
      <Layer id="wet-room" show={Boolean(visuals["wet-room"])}>
        <WetRoom x={372} floor={400} w={88} partitions="both" />
      </Layer>
      <Layer id="kitchen" show={kitchenOn}>
        <Kitchen x={196} floor={400} w={100} />
      </Layer>
      <Layer id="cupboards" show={kitchenOn && Boolean(visuals["cupboards"])}>
        <Cupboards x={202} w={80} bottom={336} />
      </Layer>

      {/* Aircon: indoor unit high above the wet room, outdoor unit at ground left */}
      <Layer id="aircon" show={Boolean(visuals["aircon"])}>
        <AirconSplit x={394} y={236} withOutdoor outdoorX={122} outdoorY={404} />
      </Layer>

      {/* Solar array on the roofline */}
      <Layer id="solar" show={Boolean(visuals["solar"])}>
        <SolarPanels x={320} y={184} w={180} />
      </Layer>

      {/* Balcony deck off the bedroom end */}
      <Layer id="deck" show={Boolean(visuals["deck"])}>
        <DeckExtension x={656} floor={400} w={88} />
      </Layer>

      {/* Furnished */}
      <Layer id="f-rug" show={furnished} delay={0}>
        <Rug cx={335} floor={400} rx={28} />
      </Layer>
      <Layer id="f-sofa" show={furnished} delay={0.05}>
        <SofaWithCushions x={300} floor={400} w={52} />
      </Layer>
      <Layer id="f-bed" show={furnished} delay={0.1}>
        <DoubleBed x={478} floor={400} w={84} />
      </Layer>
      <Layer id="f-table" show={furnished} delay={0.15}>
        <SideTable x={574} floor={400} />
      </Layer>
      <Layer id="f-tv" show={furnished} delay={0.2}>
        <WallTv x={512} y={248} w={44} />
      </Layer>
      <Layer id="f-frames" show={furnished} delay={0.25}>
        <PictureFrames x={214} y={244} />
      </Layer>
      <Layer id="f-shelves" show={furnished} delay={0.3}>
        <ShelvingUnit x={310} y={244} w={44} />
      </Layer>
      <Layer id="f-pendant" show={furnished} delay={0.35}>
        <PendantLamp x={370} top={224} drop={42} />
      </Layer>
      <Layer id="f-plant" show={furnished} delay={0.4}>
        <FloorPlant x={596} floor={400} />
      </Layer>
    </svg>
  );
}
