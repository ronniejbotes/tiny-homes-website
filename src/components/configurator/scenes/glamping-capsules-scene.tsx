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
  InsulationPath,
  Kitchen,
  Layer,
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
} from "./shared";

/**
 * Glamping capsule — rounded capsule ends, wraparound glass, curved roof,
 * raised on piers. Interior floor y 392, x 210–588. Kitchen + living left,
 * wet room centre, bedroom right.
 *
 * Zoning (worst case, all options + furnished):
 *   floor plant 210–238 · kitchen 236–328 (counter 233–331) · sofa 340–396 ·
 *   wet room 400–488 · bed 498–573 · floor lamp 572–590.
 *   Wall plane: shelving 248–296 (y234–304, cupboards top 306) · frames
 *   330–393 (y248–269) · aircon 422–466 (y234–264) · TV 518–560 (y246–295) ·
 *   curtain drapes 494–516 and 562–586 (y240–292, above the headboard).
 *   Outside: solar on the flat shell top 330–470 · balcony deck 616–696.
 *
 * Local primitive: FloorLamp — shared.tsx has pendant/table lamps only and
 * the capsule ceiling is glass, so the living-corner light stands on the floor.
 */
export function GlampingCapsulesScene({ visuals, furnished }: SceneProps) {
  const kitchenOn = Boolean(visuals["kitchen"]);
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
      {/* Interior depth wash */}
      <rect x={163} y={230} width={474} height={160} rx={48} fill="url(#th-wall-wash)" opacity={0.12} aria-hidden="true" />

      {/* Upgraded walls layer */}
      <Layer id="walls" show={Boolean(visuals["walls"])}>
        <SlatWalls x={214} w={372} top={244} bottom={392} />
      </Layer>

      {/* Piers to the ground */}
      <rect x={240} y={400} width={14} height={32} fill="var(--color-stone)" opacity={0.55} />
      <rect x={393} y={400} width={14} height={32} fill="var(--color-stone)" opacity={0.55} />
      <rect x={546} y={400} width={14} height={32} fill="var(--color-stone)" opacity={0.55} />

      {/* Floor finish */}
      <BaseFloor x={210} w={378} floor={floor} />
      <Layer id="floors" show={Boolean(visuals["floors"])}>
        <PlankFloor x={210} w={378} floor={floor} />
      </Layer>

      {/* Under-floor heating: warm glow strip, behind furniture */}
      <Layer id="heating" show={Boolean(visuals["heating"])}>
        <HeatingGlow x={210} w={378} floor={floor} />
      </Layer>

      {/* Premium insulation: curved shell lining */}
      <Layer id="insulation" show={Boolean(visuals["insulation"])}>
        <InsulationBand x1={262} y1={229} x2={538} y2={229} />
        <InsulationPath d="M 168 330 Q 166 234 254 229" />
        <InsulationPath d="M 632 330 Q 634 234 546 229" />
      </Layer>

      {/* Blackout curtains framing the bedroom glass */}
      <Layer id="curtains" show={Boolean(visuals["curtains"])}>
        <Curtains x={496} y={238} w={88} h={52} />
      </Layer>

      {/* Modules: central wet room, kitchen left */}
      <Layer id="wet-room" show={Boolean(visuals["wet-room"])}>
        <WetRoom x={400} floor={floor} w={88} partitions="both" />
      </Layer>
      <Layer id="kitchen" show={kitchenOn}>
        <Kitchen x={236} floor={floor} w={92} />
      </Layer>
      <Layer id="cupboards" show={kitchenOn && Boolean(visuals["cupboards"])}>
        <Cupboards x={242} w={74} bottom={332} />
      </Layer>

      {/* Aircon: indoor unit high above the wet room, outdoor unit at ground
          left — the right side is reserved for the balcony deck */}
      <Layer id="aircon" show={Boolean(visuals["aircon"])}>
        <AirconSplit x={422} y={234} withOutdoor outdoorX={108} outdoorY={404} />
      </Layer>

      {/* Solar array on the flat shell top */}
      <Layer id="solar" show={Boolean(visuals["solar"])}>
        <SolarPanels x={330} y={190} w={140} />
      </Layer>

      {/* Balcony deck off the bedroom end, railing drawn locally so it clears
          the curved capsule end */}
      <Layer id="deck" show={Boolean(visuals["deck"])}>
        <DeckExtension x={616} floor={floor} w={80} ground={432} railing={false} />
        <g aria-hidden="true">
          {[656, 668, 680, 692].map((bx) => (
            <line key={bx} x1={bx} y1={366} x2={bx} y2={floor} stroke={INK} strokeWidth={1.4} strokeOpacity={0.55} />
          ))}
          <line x1={650} y1={365} x2={694} y2={365} stroke="var(--color-clay)" strokeWidth={3.5} strokeOpacity={0.9} strokeLinecap="round" />
          <line x1={694} y1={365} x2={694} y2={floor} stroke={INK} strokeWidth={2} strokeOpacity={0.75} strokeLinecap="round" />
        </g>
      </Layer>

      {/* Furnished */}
      <Layer id="f-rug" show={furnished} delay={0}>
        <Rug cx={368} floor={floor} rx={26} />
      </Layer>
      <Layer id="f-sofa" show={furnished} delay={0.05}>
        <SofaWithCushions x={340} floor={floor} w={46} />
      </Layer>
      <Layer id="f-bed" show={furnished} delay={0.1}>
        <DoubleBed x={498} floor={floor} w={68} />
      </Layer>
      <Layer id="f-tv" show={furnished} delay={0.15}>
        <WallTv x={518} y={246} w={42} />
      </Layer>
      <Layer id="f-frames" show={furnished} delay={0.2}>
        <PictureFrames x={330} y={248} />
      </Layer>
      <Layer id="f-shelves" show={furnished} delay={0.25}>
        <ShelvingUnit x={248} y={234} />
      </Layer>
      <Layer id="f-lamp" show={furnished} delay={0.3}>
        <FloorLamp x={574} floor={floor} />
      </Layer>
      <Layer id="f-plant" show={furnished} delay={0.35}>
        <FloorPlant x={214} floor={floor} />
      </Layer>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Local primitives                                                    */
/* ------------------------------------------------------------------ */

/** Standing floor lamp with 2-tone shade and warm glow. Footprint: x .. x+16. */
function FloorLamp({ x, floor }: { x: number; floor: number }) {
  const cx = x + 7;
  return (
    <g aria-hidden="true">
      <ellipse cx={cx} cy={floor + 2} rx={9} ry={2.2} fill={INK} opacity={0.08} filter="url(#th-soft)" />
      <ellipse cx={cx} cy={floor - 1.5} rx={7} ry={2.2} fill="var(--color-clay-dark)" opacity={0.85} />
      <line x1={cx} y1={floor - 2} x2={cx} y2={floor - 78} stroke={INK} strokeWidth={1.8} strokeOpacity={0.8} />
      <path d={`M ${cx - 9} ${floor - 78} h 18 l -4 -14 h -10 z`} fill="var(--color-clay)" opacity={0.92} />
      <path d={`M ${cx - 9} ${floor - 78} h 4 l -1.6 -14 h -3.6 z`} fill="var(--color-clay-light)" opacity={0.6} />
      <ellipse cx={cx} cy={floor - 74} rx={16} ry={10} fill="url(#th-glow)" opacity={0.6} />
    </g>
  );
}
