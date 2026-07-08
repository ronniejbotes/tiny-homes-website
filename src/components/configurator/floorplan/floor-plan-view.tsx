"use client";

/**
 * Live, to-scale floor plan of the configured home (SPEC-VISUALIZER-V2 §2b).
 *
 * Draws the shell with wall thickness, door swing, windows, active module
 * zones (with top-down fixtures), furniture footprints when furnished, decks
 * and dimension lines — all from the metric geometry in ./plans.ts.
 */

import { useId } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { activeVisuals, type Product } from "@/data/products";
import {
  furnitureAreaM2,
  getPlan,
  moduleAreaM2,
  type PlanFixture,
  type ProductPlan,
} from "./plans";

const VB_W = 800;
const VB_H = 500;
const PAD = { top: 46, right: 30, bottom: 56, left: 62 };

const INK = "var(--color-ink)";
const CREAM = "var(--color-cream)";
const PARCHMENT = "var(--color-parchment)";
const SAND = "var(--color-sand)";
const STONE = "var(--color-stone)";
const FOREST = "var(--color-forest)";
const SAGE = "var(--color-sage)";
const CLAY = "var(--color-clay)";

const fmt1 = (n: number) => n.toFixed(1);

export interface FloorPlanViewProps {
  product: Product;
  selected: Partial<Record<string, boolean>>;
  furnished: boolean;
  variantId?: string;
}

export function FloorPlanView({ product, selected, furnished, variantId }: FloorPlanViewProps) {
  const reduceMotion = useReducedMotion();
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, "");

  const plan = getPlan(product, variantId);
  const visuals = activeVisuals(product, selected);
  const { wall, interior, exterior } = plan;

  /* ---------- scale: fit plan (plus deck) into the viewBox ---------- */
  const xMin = Math.min(-wall, plan.deck ? plan.deck.rect.x : -wall);
  const xMax = Math.max(interior.w + wall, plan.deck ? plan.deck.rect.x + plan.deck.rect.w : 0);
  const yMin = -wall;
  const yMax = Math.max(interior.d + wall, plan.deck ? plan.deck.rect.y + plan.deck.rect.h : 0);
  const boundsW = xMax - xMin;
  const boundsH = yMax - yMin;
  const s = Math.min((VB_W - PAD.left - PAD.right) / boundsW, (VB_H - PAD.top - PAD.bottom) / boundsH);
  const ox = PAD.left + (VB_W - PAD.left - PAD.right - boundsW * s) / 2;
  const oy = PAD.top + (VB_H - PAD.top - PAD.bottom - boundsH * s) / 2;
  const X = (m: number) => ox + (m - xMin) * s;
  const Y = (m: number) => oy + (m - yMin) * s;
  const S = (m: number) => m * s;

  /* ---------- space summary ---------- */
  const floorArea = plan.floorAreaM2;
  const modulesArea = moduleAreaM2(product, selected, plan, variantId);
  const furnitureArea = furnished ? furnitureAreaM2(plan) : 0;
  const freeArea = Math.max(0, floorArea - modulesArea - furnitureArea);
  const freePct = floorArea > 0 ? Math.round((freeArea / floorArea) * 100) : 0;
  const tightFit = floorArea > 0 && freeArea / floorArea < 0.15;

  /* ---------- a11y description ---------- */
  const variant = product.variants?.find((v) => v.id === variantId);
  const title = variant ? `${variant.name} ${product.shortName.toLowerCase()}` : product.shortName.toLowerCase();
  const activeParts = plan.zones
    .filter((z) => z.standard || visuals[z.key])
    .map((z) => z.label.toLowerCase().replace("ac", "air conditioning"));
  if (visuals.heating) activeParts.push("underfloor heating");
  const deckShown = plan.deck && (plan.deck.standard || visuals.deck);
  if (deckShown && plan.deck) activeParts.push(plan.deck.label.split(" — ")[0].toLowerCase());
  const ariaLabel =
    `Floor plan of ${title}` +
    (activeParts.length > 0 ? ` with ${activeParts.join(", ")}` : "") +
    (furnished ? ", furnished" : "") +
    `; ${fmt1(freeArea)} of ${fmt1(floorArea)} square metres free`;

  const fade = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: reduceMotion ? { duration: 0 } : { duration: 0.3, ease: "easeOut" as const },
  };

  const stadium = plan.shape === "stadium";
  const outerRx = stadium ? S(exterior.d / 2) : 3;
  const innerRx = stadium ? S(interior.d / 2) : 0;

  /* ---------- door geometry (opening at offset..offset+width along the wall) ---------- */
  const door = plan.door;
  const doorGeom = (() => {
    const w = door.width;
    let hx: number, hy: number, ax: number, ay: number, nx: number, ny: number;
    switch (door.side) {
      case "top":
        nx = 0; ny = 1;
        hx = door.hinge === "start" ? door.offset : door.offset + w;
        hy = 0;
        ax = door.hinge === "start" ? 1 : -1; ay = 0;
        break;
      case "left":
        nx = 1; ny = 0;
        hx = 0;
        hy = door.hinge === "start" ? door.offset : door.offset + w;
        ax = 0; ay = door.hinge === "start" ? 1 : -1;
        break;
      case "right":
        nx = -1; ny = 0;
        hx = interior.w;
        hy = door.hinge === "start" ? door.offset : door.offset + w;
        ax = 0; ay = door.hinge === "start" ? 1 : -1;
        break;
      default: // bottom
        nx = 0; ny = -1;
        hx = door.hinge === "start" ? door.offset : door.offset + w;
        hy = interior.d;
        ax = door.hinge === "start" ? 1 : -1; ay = 0;
        break;
    }
    const leafEnd = { x: hx + nx * w, y: hy + ny * w };
    const arcEnd = { x: hx + ax * w, y: hy + ay * w };
    const sweep = nx * ay - ny * ax > 0 ? 1 : 0;
    const horizontal = door.side === "top" || door.side === "bottom";
    const gap = horizontal
      ? { x: door.offset, y: door.side === "top" ? -wall : interior.d, w: door.width, h: wall }
      : { x: door.side === "left" ? -wall : interior.w, y: door.offset, w: wall, h: door.width };
    return { hinge: { x: hx, y: hy }, leafEnd, arcEnd, sweep, gap };
  })();

  /* ---------- dimension lines (top + left, shell exterior) ---------- */
  const dimTopY = Y(-wall) - 16;
  const dimLeftX = X(xMin) - 16;

  return (
    <div>
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={ariaLabel}
        className="h-auto w-full"
        style={{ display: "block" }}
      >
        <defs>
          <pattern id={`${uid}-deck`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="8" stroke={SAGE} strokeWidth="1.4" />
          </pattern>
          <pattern id={`${uid}-heat`} width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
            <line x1="0" y1="0" x2="0" y2="10" stroke={CLAY} strokeWidth="2.5" />
          </pattern>
        </defs>

        {/* deck / terrace / balcony (standard decks always drawn) */}
        <AnimatePresence initial={false}>
          {deckShown && plan.deck && (
            <motion.g key="deck" {...fade}>
              <rect
                x={X(plan.deck.rect.x)}
                y={Y(plan.deck.rect.y)}
                width={S(plan.deck.rect.w)}
                height={S(plan.deck.rect.h)}
                fill={SAGE}
                opacity={0.14}
                rx={3}
              />
              <rect
                x={X(plan.deck.rect.x)}
                y={Y(plan.deck.rect.y)}
                width={S(plan.deck.rect.w)}
                height={S(plan.deck.rect.h)}
                fill={`url(#${uid}-deck)`}
                opacity={0.5}
                stroke={SAGE}
                strokeWidth={1.5}
                rx={3}
              />
              <PlanLabel
                x={X(plan.deck.rect.x + plan.deck.rect.w * 0.25)}
                y={Y(plan.deck.rect.y + plan.deck.rect.h / 2) + 3}
                fill={FOREST}
                size={10}
              >
                {`${plan.deck.label} · ${fmt1(plan.deck.rect.w * plan.deck.rect.h)} m²`}
              </PlanLabel>
            </motion.g>
          )}
        </AnimatePresence>

        {/* shell: wall band (ink) with interior floor (cream) */}
        <rect
          x={X(-wall)}
          y={Y(-wall)}
          width={S(exterior.w)}
          height={S(exterior.d)}
          rx={outerRx}
          fill={INK}
        />
        <rect
          x={X(0)}
          y={Y(0)}
          width={S(interior.w)}
          height={S(interior.d)}
          rx={innerRx}
          fill={CREAM}
        />

        {/* expandable wing seams */}
        {plan.seams?.map((seam, i) => (
          <line
            key={`seam-${i}`}
            x1={X(seam.x1)}
            y1={Y(seam.y1)}
            x2={X(seam.x2)}
            y2={Y(seam.y2)}
            stroke={STONE}
            strokeWidth={1}
            strokeDasharray="7 5"
            opacity={0.65}
          />
        ))}

        {/* underfloor heating — full-floor hatch at 8% */}
        <AnimatePresence initial={false}>
          {visuals.heating && (
            <motion.g key="heating" {...fade}>
              <rect
                x={X(0)}
                y={Y(0)}
                width={S(interior.w)}
                height={S(interior.d)}
                rx={innerRx}
                fill={`url(#${uid}-heat)`}
                opacity={0.08}
              />
            </motion.g>
          )}
        </AnimatePresence>

        {/* module zones + their fixtures (standard rooms always drawn) */}
        <AnimatePresence initial={false}>
          {plan.zones
            .filter((zone) => zone.standard || visuals[zone.key])
            .map((zone) => (
              <motion.g key={zone.key} {...fade}>
                <rect
                  x={X(zone.rect.x)}
                  y={Y(zone.rect.y)}
                  width={S(zone.rect.w)}
                  height={S(zone.rect.h)}
                  rx={4}
                  fill={zone.dashed ? "none" : PARCHMENT}
                  stroke={FOREST}
                  strokeWidth={1.5}
                  strokeDasharray={zone.dashed ? "5 4" : undefined}
                />
                {plan.fixtures
                  .filter((f) => f.zone === zone.key)
                  .map((f) => (
                    <Fixture key={`${zone.key}-${f.kind}-${f.cx}`} fixture={f} X={X} Y={Y} S={S} />
                  ))}
                <PlanLabel
                  x={X(zone.rect.x + zone.rect.w / 2)}
                  y={
                    zone.dashed
                      ? Y(zone.rect.y + zone.rect.h / 2) + 3
                      : Y(zone.rect.y + zone.rect.h) - 6
                  }
                  fill={FOREST}
                  size={zone.key === "aircon" ? 8 : zone.dashed ? 8 : 10}
                >
                  {zone.areaM2 ? `${zone.label} · ${fmt1(zone.areaM2)} m²` : zone.label}
                </PlanLabel>
              </motion.g>
            ))}
        </AnimatePresence>

        {/* furniture footprints */}
        <AnimatePresence initial={false}>
          {furnished && (
            <motion.g key="furniture" {...fade}>
              {plan.furniture.map((item) =>
                item.round ? (
                  <g key={item.id}>
                    <circle
                      cx={X(item.rect.x + item.rect.w / 2)}
                      cy={Y(item.rect.y + item.rect.h / 2)}
                      r={S(item.rect.w / 2)}
                      fill={SAND}
                      stroke={STONE}
                      strokeWidth={1.2}
                    />
                    <PlanLabel
                      x={X(item.rect.x + item.rect.w / 2)}
                      y={Y(item.rect.y + item.rect.h / 2) + 3}
                      fill={INK}
                      size={9}
                    >
                      {item.label}
                    </PlanLabel>
                  </g>
                ) : (
                  <g key={item.id}>
                    <rect
                      x={X(item.rect.x)}
                      y={Y(item.rect.y)}
                      width={S(item.rect.w)}
                      height={S(item.rect.h)}
                      rx={3}
                      fill={SAND}
                      stroke={STONE}
                      strokeWidth={1.2}
                    />
                    <PlanLabel
                      x={X(item.rect.x + item.rect.w / 2)}
                      y={Y(item.rect.y + item.rect.h / 2) + 3}
                      fill={INK}
                      size={S(item.rect.w) > 64 ? 9 : 8}
                    >
                      {item.label}
                    </PlanLabel>
                  </g>
                ),
              )}
            </motion.g>
          )}
        </AnimatePresence>

        {/* windows — sand strips in the wall band */}
        {plan.windows.map((win, i) => {
          const horizontal = win.side === "top" || win.side === "bottom";
          const wx = horizontal ? win.offset : win.side === "left" ? -wall : interior.w;
          const wy = horizontal ? (win.side === "top" ? -wall : interior.d) : win.offset;
          const ww = horizontal ? win.length : wall;
          const wh = horizontal ? wall : win.length;
          const midX = horizontal ? 0 : X(wx + wall / 2);
          const midY = horizontal ? Y(wy + wall / 2) : 0;
          return (
            <g key={`win-${i}`}>
              <rect x={X(wx)} y={Y(wy)} width={S(ww)} height={S(wh)} fill={SAND} />
              {horizontal ? (
                <line x1={X(wx)} y1={midY} x2={X(wx + ww)} y2={midY} stroke={INK} strokeWidth={1} />
              ) : (
                <line x1={midX} y1={Y(wy)} x2={midX} y2={Y(wy + wh)} stroke={INK} strokeWidth={1} />
              )}
            </g>
          );
        })}

        {/* door: gap in the wall, leaf + swing arc, entrance arrow */}
        <rect
          x={X(doorGeom.gap.x)}
          y={Y(doorGeom.gap.y)}
          width={S(doorGeom.gap.w)}
          height={S(doorGeom.gap.h)}
          fill={CREAM}
        />
        <path
          d={`M ${X(doorGeom.leafEnd.x)} ${Y(doorGeom.leafEnd.y)} A ${S(door.width)} ${S(door.width)} 0 0 ${doorGeom.sweep} ${X(doorGeom.arcEnd.x)} ${Y(doorGeom.arcEnd.y)}`}
          fill="none"
          stroke={INK}
          strokeWidth={1}
          strokeDasharray="3 3"
          opacity={0.7}
        />
        <line
          x1={X(doorGeom.hinge.x)}
          y1={Y(doorGeom.hinge.y)}
          x2={X(doorGeom.leafEnd.x)}
          y2={Y(doorGeom.leafEnd.y)}
          stroke={INK}
          strokeWidth={2}
        />
        {door.side === "bottom" && (
          <g>
            <line
              x1={X(door.offset + door.width / 2)}
              y1={Y(interior.d + wall) + 16}
              x2={X(door.offset + door.width / 2)}
              y2={Y(interior.d + wall) + 7}
              stroke={STONE}
              strokeWidth={1.5}
            />
            <polygon
              points={`${X(door.offset + door.width / 2)},${Y(interior.d + wall) + 2} ${X(door.offset + door.width / 2) - 4},${Y(interior.d + wall) + 8} ${X(door.offset + door.width / 2) + 4},${Y(interior.d + wall) + 8}`}
              fill={STONE}
            />
            <PlanLabel
              x={X(door.offset + door.width / 2)}
              y={Y(interior.d + wall) + 27}
              fill={STONE}
              size={9}
            >
              Entrance
            </PlanLabel>
          </g>
        )}

        {/* dimension lines: overall external size on two sides */}
        <g stroke={STONE} strokeWidth={1}>
          <line x1={X(-wall)} y1={dimTopY} x2={X(interior.w + wall)} y2={dimTopY} />
          <line x1={X(-wall)} y1={dimTopY - 5} x2={X(-wall)} y2={dimTopY + 5} />
          <line x1={X(interior.w + wall)} y1={dimTopY - 5} x2={X(interior.w + wall)} y2={dimTopY + 5} />
          <line x1={dimLeftX} y1={Y(-wall)} x2={dimLeftX} y2={Y(interior.d + wall)} />
          <line x1={dimLeftX - 5} y1={Y(-wall)} x2={dimLeftX + 5} y2={Y(-wall)} />
          <line x1={dimLeftX - 5} y1={Y(interior.d + wall)} x2={dimLeftX + 5} y2={Y(interior.d + wall)} />
        </g>
        <PlanLabel x={X(interior.w / 2)} y={dimTopY - 6} fill={STONE} size={10}>
          {`${exterior.w} m`}
        </PlanLabel>
        <text
          x={dimLeftX - 8}
          y={Y(interior.d / 2)}
          fill={STONE}
          fontSize={10}
          textAnchor="middle"
          transform={`rotate(-90 ${dimLeftX - 8} ${Y(interior.d / 2)})`}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {`${exterior.d} m`}
        </text>
      </svg>

      {/* space summary bar */}
      <div
        className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm"
        style={{ color: "var(--color-stone)", fontVariantNumeric: "tabular-nums" }}
      >
        <span>
          Floor area <strong style={{ color: INK, fontWeight: 600 }}>{fmt1(floorArea)} m²</strong>
        </span>
        <span aria-hidden="true">·</span>
        <span>Modules {fmt1(modulesArea)} m²</span>
        <span aria-hidden="true">·</span>
        <span>Furniture {fmt1(furnitureArea)} m²</span>
        <span aria-hidden="true">·</span>
        <span>
          Free <strong style={{ color: INK, fontWeight: 600 }}>{fmt1(freeArea)} m²</strong> ({freePct}%)
        </span>
        {tightFit && (
          <span style={{ color: SAGE, fontWeight: 600 }}>Tight fit</span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Small presentational helpers                                        */
/* ------------------------------------------------------------------ */

/** SVG text with a cream halo so labels stay legible over fixtures and fills. */
function PlanLabel({
  x,
  y,
  fill,
  size,
  children,
}: {
  x: number;
  y: number;
  fill: string;
  size: number;
  children: string;
}) {
  return (
    <text
      x={x}
      y={y}
      fill={fill}
      fontSize={size}
      textAnchor="middle"
      stroke={CREAM}
      strokeWidth={3}
      paintOrder="stroke"
      strokeLinejoin="round"
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      {children}
    </text>
  );
}

/** Top-down plumbing/kitchen fixture glyphs. */
function Fixture({
  fixture,
  X,
  Y,
  S,
}: {
  fixture: PlanFixture;
  X: (m: number) => number;
  Y: (m: number) => number;
  S: (m: number) => number;
}) {
  const { kind, cx, cy } = fixture;
  const stroke = INK;
  const common = { fill: CREAM, stroke, strokeWidth: 1, opacity: 0.85 };
  switch (kind) {
    case "shower":
      return (
        <g>
          <rect x={X(cx - 0.4)} y={Y(cy - 0.4)} width={S(0.8)} height={S(0.8)} rx={2} {...common} />
          <circle cx={X(cx)} cy={Y(cy)} r={Math.max(1.5, S(0.035))} fill={stroke} opacity={0.85} />
        </g>
      );
    case "wc":
      return (
        <g>
          <rect x={X(cx - 0.19)} y={Y(cy - 0.3)} width={S(0.38)} height={S(0.15)} rx={1.5} {...common} />
          <ellipse cx={X(cx)} cy={Y(cy + 0.09)} rx={S(0.15)} ry={S(0.19)} {...common} />
        </g>
      );
    case "basin":
      return (
        <g>
          <circle cx={X(cx)} cy={Y(cy)} r={S(0.2)} {...common} />
          <circle cx={X(cx)} cy={Y(cy - 0.09)} r={Math.max(1, S(0.03))} fill={stroke} opacity={0.85} />
        </g>
      );
    case "sink":
      return (
        <g>
          <rect x={X(cx - 0.25)} y={Y(cy - 0.19)} width={S(0.5)} height={S(0.38)} rx={2} {...common} />
          <circle cx={X(cx)} cy={Y(cy)} r={Math.max(1.5, S(0.05))} fill="none" stroke={stroke} strokeWidth={1} opacity={0.85} />
        </g>
      );
    case "hob":
      return (
        <g>
          <rect x={X(cx - 0.275)} y={Y(cy - 0.2)} width={S(0.55)} height={S(0.4)} rx={2} {...common} />
          <circle cx={X(cx - 0.13)} cy={Y(cy)} r={S(0.09)} fill="none" stroke={stroke} strokeWidth={1} opacity={0.85} />
          <circle cx={X(cx + 0.13)} cy={Y(cy)} r={S(0.09)} fill="none" stroke={stroke} strokeWidth={1} opacity={0.85} />
        </g>
      );
    default: {
      const exhaustive: never = kind;
      return exhaustive;
    }
  }
}

/** Referenced for type completeness in docs; keeps ProductPlan in the public surface. */
export type { ProductPlan };
