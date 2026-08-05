#!/usr/bin/env python3
"""
Print floor plans for the brochures.

Draws the same geometry the website's configurator draws: the plan objects come
from src/components/configurator/floorplan/plans.ts via getPlan() in dump.mjs,
so a plan printed here and a plan on the site are the same drawing. The port is
of the *rendering*, not the data: shell with wall thickness, door swing, windows,
included rooms with top-down fixtures, furniture footprints and dimension lines.

Output is inline SVG (not an <img>), so it picks up the brochure's embedded
fonts and prints as vector at any size.

Products with manufacturer CAD sheets (apple cabins, glamping capsules,
expandable homes) use those sheets instead; this covers the two products whose
plan only exists as geometry, plus the to-scale size ladder used for the
outdoor kitchens, which have four lengths and no plan at all.
"""
import html

# Brochure palette (gen.py CSS), baked in: an SVG in a printed page cannot
# resolve CSS custom properties the way the site's stylesheet does.
CREAM = "#faf6ef"
PARCHMENT = "#f4eee2"
SAND = "#e9dfce"
INK = "#1c1b17"
STONE = "#67635a"
FOREST = "#1e3a2b"
SAGE = "#a8bfa0"
CLAY = "#b4552d"

PAD = {"top": 30, "right": 30, "bottom": 34, "left": 44}


def _f(n):
    """Trim float noise out of the path data."""
    return f"{n:.2f}".rstrip("0").rstrip(".")


def _fmt1(n):
    return f"{n:.1f}"


def _label(x, y, text, fill=FOREST, size=10, rotate=None, weight=600):
    """Text with a cream halo, so a label stays legible over a fixture or fill."""
    t = html.escape(str(text))
    rot = f' transform="rotate({rotate} {_f(x)} {_f(y)})"' if rotate else ""
    return (f'<text x="{_f(x)}" y="{_f(y)}"{rot} fill="{fill}" font-size="{size}" font-weight="{weight}" '
            f'text-anchor="middle" stroke="{CREAM}" stroke-width="3" paint-order="stroke" '
            f'stroke-linejoin="round" style="font-variant-numeric:tabular-nums">{t}</text>')


def _fixture(kind, cx, cy, X, Y, S):
    """Top-down plumbing and kitchen glyphs, matching the site's Fixture set."""
    common = f'fill="{CREAM}" stroke="{INK}" stroke-width="1" opacity="0.85"'
    if kind == "shower":
        return (f'<rect x="{_f(X(cx - 0.4))}" y="{_f(Y(cy - 0.4))}" width="{_f(S(0.8))}" height="{_f(S(0.8))}" rx="2" {common}/>'
                f'<circle cx="{_f(X(cx))}" cy="{_f(Y(cy))}" r="{_f(max(1.5, S(0.035)))}" fill="{INK}" opacity="0.85"/>')
    if kind == "wc":
        return (f'<rect x="{_f(X(cx - 0.19))}" y="{_f(Y(cy - 0.3))}" width="{_f(S(0.38))}" height="{_f(S(0.15))}" rx="1.5" {common}/>'
                f'<ellipse cx="{_f(X(cx))}" cy="{_f(Y(cy + 0.09))}" rx="{_f(S(0.15))}" ry="{_f(S(0.19))}" {common}/>')
    if kind == "basin":
        return (f'<circle cx="{_f(X(cx))}" cy="{_f(Y(cy))}" r="{_f(S(0.2))}" {common}/>'
                f'<circle cx="{_f(X(cx))}" cy="{_f(Y(cy - 0.09))}" r="{_f(max(1, S(0.03)))}" fill="{INK}" opacity="0.85"/>')
    if kind == "sink":
        return (f'<rect x="{_f(X(cx - 0.25))}" y="{_f(Y(cy - 0.19))}" width="{_f(S(0.5))}" height="{_f(S(0.38))}" rx="2" {common}/>'
                f'<circle cx="{_f(X(cx))}" cy="{_f(Y(cy))}" r="{_f(max(1.5, S(0.05)))}" fill="none" stroke="{INK}" stroke-width="1" opacity="0.85"/>')
    if kind == "hob":
        return (f'<rect x="{_f(X(cx - 0.275))}" y="{_f(Y(cy - 0.2))}" width="{_f(S(0.55))}" height="{_f(S(0.4))}" rx="2" {common}/>'
                f'<circle cx="{_f(X(cx - 0.13))}" cy="{_f(Y(cy))}" r="{_f(S(0.09))}" fill="none" stroke="{INK}" stroke-width="1" opacity="0.85"/>'
                f'<circle cx="{_f(X(cx + 0.13))}" cy="{_f(Y(cy))}" r="{_f(S(0.09))}" fill="none" stroke="{INK}" stroke-width="1" opacity="0.85"/>')
    return ""


def plan_svg(plan, width=820, furnished=True, uid="p"):
    """Render one ProductPlan as inline SVG, sized to `width` user units."""
    wall = plan["wall"]
    interior, exterior = plan["interior"], plan["exterior"]
    door = plan["door"]
    deck = plan.get("deck")
    deck_shown = bool(deck and deck.get("standard"))

    swing_out = door.get("swing") == "out"
    out = door["width"] if swing_out else 0
    x_min = min(-wall, deck["rect"]["x"] if deck_shown else -wall, -out if door["side"] == "left" else 0)
    x_max = max(interior["w"] + wall,
                deck["rect"]["x"] + deck["rect"]["w"] if deck_shown else 0,
                interior["w"] + out if door["side"] == "right" else 0)
    y_min = min(-wall, -out if door["side"] == "top" else 0)
    y_max = max(interior["d"] + wall,
                deck["rect"]["y"] + deck["rect"]["h"] if deck_shown else 0,
                interior["d"] + out if door["side"] == "bottom" else 0)

    bw, bh = x_max - x_min, y_max - y_min
    s = (width - PAD["left"] - PAD["right"]) / bw
    height = bh * s + PAD["top"] + PAD["bottom"]
    ox, oy = PAD["left"], PAD["top"]

    def X(m):
        return ox + (m - x_min) * s

    def Y(m):
        return oy + (m - y_min) * s

    def S(m):
        return m * s

    parts = [
        f'<defs><pattern id="{uid}-deck" width="8" height="8" patternUnits="userSpaceOnUse" '
        f'patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" stroke="{SAGE}" stroke-width="1.4"/>'
        f'</pattern></defs>'
    ]

    # deck / terrace, drawn only when it ships as standard
    if deck_shown:
        d = deck["rect"]
        tall = d["h"] > d["w"]
        parts.append(
            f'<rect x="{_f(X(d["x"]))}" y="{_f(Y(d["y"]))}" width="{_f(S(d["w"]))}" height="{_f(S(d["h"]))}" '
            f'fill="{SAGE}" opacity="0.14" rx="3"/>'
            f'<rect x="{_f(X(d["x"]))}" y="{_f(Y(d["y"]))}" width="{_f(S(d["w"]))}" height="{_f(S(d["h"]))}" '
            f'fill="url(#{uid}-deck)" opacity="0.5" stroke="{SAGE}" stroke-width="1.5" rx="3"/>')
        parts.append(_label(
            X(d["x"] + d["w"] * (0.5 if tall else 0.25)),
            Y(d["y"] + d["h"] / 2) + 3,
            f'{deck["label"]} · {_fmt1(d["w"] * d["h"])} m²',
            rotate=-90 if tall else None, size=9.5))

    # shell: ink wall band with a cream interior floor
    parts.append(
        f'<rect x="{_f(X(-wall))}" y="{_f(Y(-wall))}" width="{_f(S(exterior["w"]))}" '
        f'height="{_f(S(exterior["d"]))}" rx="3" fill="{INK}"/>'
        f'<rect x="{_f(X(0))}" y="{_f(Y(0))}" width="{_f(S(interior["w"]))}" '
        f'height="{_f(S(interior["d"]))}" fill="{CREAM}"/>')

    for seam in plan.get("seams") or []:
        parts.append(
            f'<line x1="{_f(X(seam["x1"]))}" y1="{_f(Y(seam["y1"]))}" x2="{_f(X(seam["x2"]))}" '
            f'y2="{_f(Y(seam["y2"]))}" stroke="{STONE}" stroke-width="1" stroke-dasharray="7 5" opacity="0.65"/>')

    # included rooms, their fixtures and labels
    for zone in plan["zones"]:
        if not zone.get("standard"):
            continue
        rect, dashed = zone["rect"], zone.get("dashed")
        parts.append(
            f'<rect x="{_f(X(rect["x"]))}" y="{_f(Y(rect["y"]))}" width="{_f(S(rect["w"]))}" '
            f'height="{_f(S(rect["h"]))}" rx="4" fill="{"none" if dashed else PARCHMENT}" '
            f'stroke="{FOREST}" stroke-width="1.5"' + (' stroke-dasharray="5 4"' if dashed else "") + '/>')
        for f in plan["fixtures"]:
            if f["zone"] == zone["key"]:
                parts.append(_fixture(f["kind"], f["cx"], f["cy"], X, Y, S))
        text = f'{zone["label"]} · {_fmt1(zone["areaM2"])} m²' if zone.get("areaM2") else zone["label"]
        # Labels sit on the room's bottom edge, except in a shallow strip of a
        # room (a galley kitchen), where that puts them across the wall line.
        shallow = S(rect["h"]) < 48
        parts.append(_label(
            X(rect["x"] + rect["w"] / 2),
            Y(rect["y"] + rect["h"] / 2) + 3 if (dashed or shallow) else Y(rect["y"] + rect["h"]) - 6,
            text, size=8 if dashed else 9.5))

    # furniture footprints: what the space actually holds
    if furnished:
        for item in plan["furniture"]:
            rect = item["rect"]
            parts.append(
                f'<rect x="{_f(X(rect["x"]))}" y="{_f(Y(rect["y"]))}" width="{_f(S(rect["w"]))}" '
                f'height="{_f(S(rect["h"]))}" rx="3" fill="{SAND}" stroke="{STONE}" stroke-width="1.2"/>')
            parts.append(_label(X(rect["x"] + rect["w"] / 2), Y(rect["y"] + rect["h"] / 2) + 3,
                                item["label"], fill=INK, size=9 if S(rect["w"]) > 64 else 8, weight=500))

    # windows: sand strips in the wall band
    for win in plan["windows"]:
        horizontal = win["side"] in ("top", "bottom")
        wx = win["offset"] if horizontal else (-wall if win["side"] == "left" else interior["w"])
        wy = (-wall if win["side"] == "top" else interior["d"]) if horizontal else win["offset"]
        ww = win["length"] if horizontal else wall
        wh = wall if horizontal else win["length"]
        parts.append(f'<rect x="{_f(X(wx))}" y="{_f(Y(wy))}" width="{_f(S(ww))}" height="{_f(S(wh))}" fill="{SAND}"/>')
        if horizontal:
            mid = Y(wy + wall / 2)
            parts.append(f'<line x1="{_f(X(wx))}" y1="{_f(mid)}" x2="{_f(X(wx + ww))}" y2="{_f(mid)}" stroke="{INK}" stroke-width="1"/>')
        else:
            mid = X(wx + wall / 2)
            parts.append(f'<line x1="{_f(mid)}" y1="{_f(Y(wy))}" x2="{_f(mid)}" y2="{_f(Y(wy + wh))}" stroke="{INK}" stroke-width="1"/>')

    # door: gap in the wall, leaf and swing arc, entrance marker
    w = door["width"]
    side, hinge_start = door["side"], door["hinge"] == "start"
    if side == "top":
        nx, ny = 0, 1
        hx, hy = (door["offset"] if hinge_start else door["offset"] + w), 0
        ax, ay = (1 if hinge_start else -1), 0
    elif side == "left":
        nx, ny = 1, 0
        hx, hy = 0, (door["offset"] if hinge_start else door["offset"] + w)
        ax, ay = 0, (1 if hinge_start else -1)
    elif side == "right":
        nx, ny = -1, 0
        hx, hy = interior["w"], (door["offset"] if hinge_start else door["offset"] + w)
        ax, ay = 0, (1 if hinge_start else -1)
    else:  # bottom
        nx, ny = 0, -1
        hx, hy = (door["offset"] if hinge_start else door["offset"] + w), interior["d"]
        ax, ay = (1 if hinge_start else -1), 0
    if swing_out:
        nx, ny = -nx, -ny
    leaf = (hx + nx * w, hy + ny * w)
    arc = (hx + ax * w, hy + ay * w)
    sweep = 1 if nx * ay - ny * ax > 0 else 0
    horizontal = side in ("top", "bottom")
    gap = ((door["offset"], -wall if side == "top" else interior["d"], w, wall) if horizontal
           else (-wall if side == "left" else interior["w"], door["offset"], wall, w))
    parts.append(f'<rect x="{_f(X(gap[0]))}" y="{_f(Y(gap[1]))}" width="{_f(S(gap[2]))}" height="{_f(S(gap[3]))}" fill="{CREAM}"/>')
    parts.append(
        f'<path d="M {_f(X(leaf[0]))} {_f(Y(leaf[1]))} A {_f(S(w))} {_f(S(w))} 0 0 {sweep} {_f(X(arc[0]))} {_f(Y(arc[1]))}" '
        f'fill="none" stroke="{INK}" stroke-width="1" stroke-dasharray="3 3" opacity="0.7"/>'
        f'<line x1="{_f(X(hx))}" y1="{_f(Y(hy))}" x2="{_f(X(leaf[0]))}" y2="{_f(Y(leaf[1]))}" stroke="{INK}" stroke-width="2"/>')

    mid_door = door["offset"] + w / 2
    if side == "bottom":
        cx, base = X(mid_door), Y(interior["d"] + wall)
        parts.append(
            f'<line x1="{_f(cx)}" y1="{_f(base + 16)}" x2="{_f(cx)}" y2="{_f(base + 7)}" stroke="{STONE}" stroke-width="1.5"/>'
            f'<polygon points="{_f(cx)},{_f(base + 2)} {_f(cx - 4)},{_f(base + 8)} {_f(cx + 4)},{_f(base + 8)}" fill="{STONE}"/>')
        parts.append(_label(cx, base + 27, "Entrance", fill=STONE, size=9, weight=500))
    elif side == "right":
        cy, base = Y(mid_door), X(interior["w"] + wall)
        parts.append(
            f'<line x1="{_f(base + 16)}" y1="{_f(cy)}" x2="{_f(base + 7)}" y2="{_f(cy)}" stroke="{STONE}" stroke-width="1.5"/>'
            f'<polygon points="{_f(base + 2)},{_f(cy)} {_f(base + 8)},{_f(cy - 4)} {_f(base + 8)},{_f(cy + 4)}" fill="{STONE}"/>')
        parts.append(_label(base + 27, cy, "Entrance", fill=STONE, size=9, rotate=-90, weight=500))

    # overall external dimensions on two sides
    dim_top = Y(-wall) - 14
    dim_left = X(x_min) - 16
    parts.append(
        f'<g stroke="{STONE}" stroke-width="1">'
        f'<line x1="{_f(X(-wall))}" y1="{_f(dim_top)}" x2="{_f(X(interior["w"] + wall))}" y2="{_f(dim_top)}"/>'
        f'<line x1="{_f(X(-wall))}" y1="{_f(dim_top - 5)}" x2="{_f(X(-wall))}" y2="{_f(dim_top + 5)}"/>'
        f'<line x1="{_f(X(interior["w"] + wall))}" y1="{_f(dim_top - 5)}" x2="{_f(X(interior["w"] + wall))}" y2="{_f(dim_top + 5)}"/>'
        f'<line x1="{_f(dim_left)}" y1="{_f(Y(-wall))}" x2="{_f(dim_left)}" y2="{_f(Y(interior["d"] + wall))}"/>'
        f'<line x1="{_f(dim_left - 5)}" y1="{_f(Y(-wall))}" x2="{_f(dim_left + 5)}" y2="{_f(Y(-wall))}"/>'
        f'<line x1="{_f(dim_left - 5)}" y1="{_f(Y(interior["d"] + wall))}" x2="{_f(dim_left + 5)}" y2="{_f(Y(interior["d"] + wall))}"/>'
        f'</g>')
    parts.append(_label(X(interior["w"] / 2), dim_top - 6, f'{exterior["w"]} m', fill=STONE, size=10, weight=500))
    parts.append(_label(dim_left - 8, Y(interior["d"] / 2), f'{exterior["d"]} m', fill=STONE, size=10,
                        rotate=-90, weight=500))

    body = "".join(parts)
    return (f'<svg viewBox="0 0 {_f(width)} {_f(height)}" width="100%" style="display:block" '
            f'role="img" aria-label="Floor plan">{body}</svg>')


def plan_legend(plan, furnished=True):
    """The bits of the drawing a reader needs named: rooms first, then furniture."""
    rooms = [z["label"] for z in plan["zones"] if z.get("standard") and not z.get("dashed")]
    deck = plan.get("deck")
    if deck and deck.get("standard"):
        rooms.append(deck["label"].split(",")[0])
    items = []
    if rooms:
        items.append(("Included", ", ".join(rooms)))
    if furnished and plan["furniture"]:
        items.append(("Furniture shown to scale", ", ".join(f["label"] for f in plan["furniture"])))
    return items


def size_ladder_svg(items, width=820, height=190, unit_depth=None):
    """
    To-scale front elevations of a product that comes in several lengths.

    Used by the outdoor kitchens, where there is no floor plan to draw but the
    only question a buyer actually has is how much wall each length eats.
    Each item is (label, length_m, height_m, note).
    """
    gap_m = 0.55
    total_m = sum(i[1] for i in items) + gap_m * (len(items) - 1)
    tallest = max(i[2] for i in items)
    pad_l, pad_r, pad_t, pad_b = 8, 8, 26, 38
    s = min((width - pad_l - pad_r) / total_m, (height - pad_t - pad_b) / tallest)
    baseline = pad_t + tallest * s
    parts = [f'<line x1="0" y1="{_f(baseline)}" x2="{_f(width)}" y2="{_f(baseline)}" stroke="{SAND}" stroke-width="1.5"/>']
    x = pad_l + max(0, (width - pad_l - pad_r - total_m * s) / 2)
    for label, length, h, note in items:
        w_px, h_px = length * s, h * s
        top = baseline - h_px
        # cabinet body, with the lift-up roof band drawn as its own strip
        roof = min(h_px * 0.17, 13)
        parts.append(
            f'<rect x="{_f(x)}" y="{_f(top + roof)}" width="{_f(w_px)}" height="{_f(h_px - roof)}" rx="2" '
            f'fill="{PARCHMENT}" stroke="{FOREST}" stroke-width="1.4"/>'
            f'<rect x="{_f(x - 2)}" y="{_f(top)}" width="{_f(w_px + 4)}" height="{_f(roof)}" rx="2" '
            f'fill="{FOREST}"/>')
        # counter line and a couple of cabinet divisions, so it reads as a kitchen
        counter = top + roof + (h_px - roof) * 0.42
        parts.append(f'<line x1="{_f(x)}" y1="{_f(counter)}" x2="{_f(x + w_px)}" y2="{_f(counter)}" stroke="{FOREST}" stroke-width="1.2" opacity="0.75"/>')
        divisions = max(1, int(round(length / 0.9)))
        for i in range(1, divisions):
            dx = x + w_px * i / divisions
            parts.append(f'<line x1="{_f(dx)}" y1="{_f(counter)}" x2="{_f(dx)}" y2="{_f(baseline)}" stroke="{STONE}" stroke-width="0.8" opacity="0.5"/>')
        # width dimension under the baseline
        parts.append(
            f'<g stroke="{STONE}" stroke-width="0.9">'
            f'<line x1="{_f(x)}" y1="{_f(baseline + 9)}" x2="{_f(x + w_px)}" y2="{_f(baseline + 9)}"/>'
            f'<line x1="{_f(x)}" y1="{_f(baseline + 5)}" x2="{_f(x)}" y2="{_f(baseline + 13)}"/>'
            f'<line x1="{_f(x + w_px)}" y1="{_f(baseline + 5)}" x2="{_f(x + w_px)}" y2="{_f(baseline + 13)}"/></g>')
        parts.append(_label(x + w_px / 2, baseline + 24, label, fill=FOREST, size=9.5))
        if note:
            parts.append(_label(x + w_px / 2, baseline + 34, note, fill=STONE, size=8, weight=500))
        x += w_px + gap_m * s
    # height dimension on the tallest unit
    parts.append(_label(width - pad_r - 40, pad_t - 12, f"All {_fmt1(tallest)} m high", fill=STONE, size=8.5, weight=500))
    return (f'<svg viewBox="0 0 {_f(width)} {_f(height)}" width="100%" style="display:block" '
            f'role="img" aria-label="Sizes drawn to scale">{"".join(parts)}</svg>')
