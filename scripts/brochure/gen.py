#!/usr/bin/env python3
"""
Tiny Homes SA product brochures.

Generates a self-contained A4 brochure (HTML + PDF) per product, using the
site's own brand tokens, fonts, photography and copy. Content comes straight
from src/data/products.ts via data.json, so the brochures cannot drift from
the catalogue.

The brochure is written to answer a buyer's whole question list without a phone
call: every size with its own floor plan, dimensions and price; the full
specification; every optional extra with its price; a photo gallery; the use
cases; and the FAQs. Each size carries a QR code that opens the quote form with
that model already selected.

Layout is fixed-page (A4) with a JS auto-fit pass: each page's flowing content
is measured after fonts and images settle, and scaled down slightly if it would
overflow. That keeps a single template honest across products whose content
volume varies from 7 specs to 15 options.
"""
import base64, html, json, pathlib, re, subprocess, sys

import segno

import plan as planlib

BASE = pathlib.Path(__file__).parent
# Resolved from this file, not hard-coded: a worktree or a second clone has to
# read its own images, or it silently renders another checkout's photographs.
SITE_IMG = pathlib.Path(__file__).resolve().parents[2] / "public" / "images"
DATA = json.loads((BASE / "data.json").read_text())
PRODUCTS = {p["slug"]: p for p in DATA["products"]}
SITE = DATA["site"]
IMAGES = DATA["images"]["products"]
LAYOUT_PLANS = DATA["images"].get("layoutPlans", {})
PLANS = DATA.get("plans", {})

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"


# ----------------------------------------------------------------- helpers
def b64(p):
    return base64.b64encode(pathlib.Path(p).read_bytes()).decode()


def datauri(p):
    ext = pathlib.Path(p).suffix.lower()
    mime = "image/png" if ext == ".png" else "image/jpeg"
    return f"data:{mime};base64,{b64(p)}"


def esc(s):
    return html.escape(str(s), quote=False)


def rands(n):
    """R54 900 with a thin space, matching the site's price rendering."""
    return "R" + f"{int(n):,}".replace(",", "&thinsp;")


def m2(s):
    """m2 -> m² and keep non-breaking where it reads better."""
    return str(s).replace("m2", "m&sup2;").replace("m²", "m&sup2;")


def sentences(text, max_chars=300):
    parts = re.split(r"(?<=[.!?])\s+", text.strip())
    out = ""
    for p in parts:
        if out and len(out) + len(p) > max_chars:
            break
        out = (out + " " + p).strip()
    return out


def opt_price(o):
    if o.get("pricePerM2"):
        return rands(o["pricePerM2"]) + "/m&sup2;"
    if not o.get("price"):
        return '<span class="quoted">Quoted</span>'
    return rands(o["price"])


def img_by_name(slug, name):
    for i in IMAGES[slug]:
        if i["src"].split("/")[-1] == name:
            return i
    raise KeyError(f"{slug}: no image {name}")


def prep(slug, name, out, maxw):
    """Resize a source image for print without ever upscaling it."""
    meta = img_by_name(slug, name)
    return prep_file(SITE_IMG / "products" / slug / name, f"{slug}/{out}", maxw, meta["width"])


def prep_file(src, out_rel, maxw, src_width=None, quality=82):
    """
    Resize any file under public/images for print.

    Line-art diagrams (the manufacturers' layout sheets, the fold diagram) stay
    PNG: JPEG at brochure quality smears thin black rules into grey mush. They
    are palette-quantised instead, which is lossless enough for a drawing of
    black lines on white and cuts the embedded weight by about three quarters.
    A brochure that will not go through email is not a brochure.
    """
    src = pathlib.Path(src)
    keep_png = src.suffix.lower() == ".png"
    w = min(maxw, src_width) if src_width else maxw
    dest = BASE / "img" / (out_rel if not keep_png else str(pathlib.Path(out_rel).with_suffix(".png")))
    dest.parent.mkdir(parents=True, exist_ok=True)
    fmt = (["-s", "format", "png"] if keep_png
           else ["-s", "format", "jpeg", "-s", "formatOptions", str(quality)])
    subprocess.run(["sips", *fmt, "-Z", str(w), str(src), "--out", str(dest)],
                   check=True, capture_output=True)
    if keep_png:
        from PIL import Image
        img = Image.open(dest).convert("RGB").quantize(colors=48, method=Image.MEDIANCUT, dither=Image.NONE)
        img.save(dest, optimize=True)
    return dest


def band_img(slug, name, caption):
    """(data URI, alt, caption) for a full-bleed photo band."""
    return (datauri(prep(slug, name, f"band-{pathlib.Path(name).stem}.jpg", 1300)),
            img_by_name(slug, name)["alt"], caption)


def quote_url(slug, variant_id=None):
    """Deep link into the quote form, pre-selecting the product (and size)."""
    url = f"{SITE['url']}/quote?product={slug}"
    return url + (f"&variant={variant_id}" if variant_id else "")


def qr_svg(url, size_mm=15, dark=None):
    """
    Inline QR pointing at the pre-filled quote form.

    Printed brochures lose every hyperlink; the QR is how a reader gets from a
    page they are holding to a quotation without typing anything.
    """
    qr = segno.make(url, error="m")
    svg = qr.svg_inline(scale=4, border=0, dark=dark or "#1e3a2b", light=None)
    svg = svg.replace("<svg ", f'<svg style="width:{size_mm}mm;height:{size_mm}mm;display:block" ', 1)
    return svg


_SVG_RULE = re.compile(r"([^{}]+)\{([^{}]*)\}")


def svg_scoped(path, uid, max_h_mm=None):
    """
    Inline a manufacturer plan sheet with its CSS scoped to this one drawing.

    A <style> block inside inline SVG is document-scoped in HTML, so six plan
    sheets that all define `.lbl` at different sizes would trample each other.
    Prefixing every selector with the wrapper's id keeps them apart, and the
    plans stay vector in the PDF instead of being rasterised through an <img>.
    """
    src = pathlib.Path(path).read_text()
    src = re.sub(r"<\?xml[^>]*\?>", "", src)

    def scope(m):
        css = m.group(1)
        rules = ""
        for r in _SVG_RULE.finditer(css):
            sel = ",".join(f"#{uid} {s.strip()}" for s in r.group(1).split(","))
            body = r.group(2).replace("font-family:Inter,", "font-family:'InterVar',Inter,")
            rules += f"{sel}{{{body}}}"
        return f"<style>{rules}</style>"

    src = re.sub(r"<style>(.*?)</style>", scope, src, flags=re.S)
    # Drop the intrinsic width/height so the plan scales to its column.
    src = re.sub(r'(<svg[^>]*?)\s+width="[\d.]+"\s+height="[\d.]+"', r"\1", src, count=1)
    style = f"width:100%;height:auto;display:block" + (f";max-height:{max_h_mm}mm" if max_h_mm else "")
    src = src.replace("<svg ", f'<svg style="{style}" ', 1)
    return f'<div id="{uid}" class="plansheet">{src}</div>'


_DIMS_RE = re.compile(r"^\s*([\d.]+\s*(?:[×x]\s*[\d.]+\s*){1,2}m(?:\s+expanded)?)", re.I)


def dims_clause(v):
    """The dimensions at the head of a variant description, and nothing after."""
    m = _DIMS_RE.match(v["description"].replace("&times;", "×"))
    return m.group(1).strip() if m else v["description"].split(",")[0].strip()[:46]


def plan_rooms(label):
    """'9 m · 20 m² · 2 bedrooms, bathroom, kitchen' -> the rooms half."""
    parts = [p.strip() for p in label.split("·")]
    return parts[-1] if len(parts) > 2 else ""


# ------------------------------------------------------------------ config
# Hand-picked per product: the cover line, the four cover stats, the section
# headings and which photographs carry which page. Everything else is derived
# from the catalogue.
CONFIG = {
    "folding-homes": {
        "h1": "X-Fold",
        "eyebrow": "Folding homes",
        "sub": "Flat on a truck. A room in minutes.",
        "stats": [("15 m&sup2;", "Floor area"), ("Minutes", "To unfold"),
                  ("2 high", "Stackable"), ("1 year", "Guarantee")],
        "h2_product": "Four steps, two workers",
        "h2_uses": "One room, seven jobs",
        "images": {"cover": "exterior-timber-door.jpg", "feature": "interior-shell-furnished-v2.jpg",
                   "band2": "interior-shell-empty-v2.jpg", "band4": "exterior-forest-render.jpg"},
        "feature_cap": "Finished inside on arrival. It ships wired but without plumbing; a local installer can add a bathroom or wet room on site.",
        "band2_cap": "It arrives as a finished room, not a kit: white wall boards, a vinyl floor, and the steel door, window and DB board already in.",
        "band4_cap": "Delivered nationwide from Centurion, Gauteng, on a level slab or precast plinths.",
        "cover_pos": "50% 50%",
        "gallery": [
            ("interior-shell-empty-v2.jpg", "Inside before fit-out: white wall boards, a vinyl floor, and the steel door, window and DB board already fitted."),
            ("interior-facilities-collage.png", "Fit-out options, from bunk bedrooms to an ablution layout, arranged to your brief."),
            ("exterior-timber-door.jpg", "Wood-grain walls with a black frame. The hinge runs the length of the side wall, and the window sits beside the door."),
            ("exterior-forest-render.jpg", "Grey walls with a white frame, on a paved plinth: two of the four standard finishes."),
        ],
    },
    "expandable-homes": {
        "h1": "Expandable Homes",
        "eyebrow": "Expandable homes",
        "sub": "One module. A whole house.",
        "stats": [("18 – 74 m&sup2;", "Floor area"), ("Hours", "To expand"),
                  ("Up to 4", "Bedrooms"), ("1 year", "Guarantee")],
        "h2_product": "Arrives as one module",
        "h2_uses": "What people build with it",
        "images": {"cover": "brochure-hero.jpg", "feature": "brochure-dollhouse.jpg",
                   "band2": "interior-living-dining.jpg", "band4": "scenic-winelands.jpg"},
        "feature_cap": "Bedrooms, bathroom and kitchen are built in at the factory and travel with the module.",
        "band2_cap": "Insulated rooms with double glazing, vinyl flooring and factory-installed plumbing and electrics.",
        "band4_cap": "Delivered nationwide from Centurion, Gauteng, and expanded on site within hours.",
        "cover_pos": "50% 55%",
        "gallery": [
            ("brochure-exterior-6.jpg", "Expanded onto a large timber deck: the module opens out to its full width on site."),
            ("brochure-interior-2.jpg", "A bedroom with a full-height double-glazed window and an upholstered headboard wall."),
            ("brochure-interior-1.jpg", "Open-plan living and kitchen inside the expanded module."),
            ("brochure-exterior-5.jpg", "Raised on stilts with a railed deck, for sloping or flood-prone ground."),
            ("scenic-coastal.jpg", "Coastal sites are specified for salt air: the polyurethane metal carved board is required there."),
        ],
    },
    "nature-cabins": {
        "h1": "Nature Cabins",
        "eyebrow": "Nature cabins",
        "sub": "For places worth waking up in.",
        "stats": [("21 m&sup2;", "Plus terrace"), ("Fully built", "On arrival"),
                  ("Included", "Kitchen &amp; bath"), ("1 year", "Guarantee")],
        "h2_product": "Nothing left on the options list",
        "h2_uses": "Where it earns its keep",
        "images": {"cover": "exterior-timber-cabin-deck.jpg", "feature": "interior-fireplace-lounge.jpg",
                   "band2": "interior-bathtub-view.jpg", "band4": "exterior-forest-aerial.jpg"},
        "feature_cap": "A fitted bathroom, a kitchen with a stone countertop and induction cooker, and Midea air conditioning all come standard. Interior photography is illustrative: the wall boards are white as standard, or bamboo on request, never timber cladding.",
        "band2_cap": "Double-glazed aluminium framed glazing, and a waterproof SPC laminate floor over 18 mm cement fibre board.",
        "band4_cap": "Arrives as a fully built unit; the site must be reachable by an oversized cargo truck.",
        "cover_pos": "50% 58%",
        "gallery": [
            ("exterior-timber-render.jpg", "The arched timber gable and glazed front: the elevation that faces the view."),
            ("exterior-deck-morning-mist.jpg", "The glazed gable end and its 1.5 × 3.2 m viewing terrace at dawn."),
            ("detail-timber-window.jpg", "Honey-toned exterior cladding with black-framed double glazing."),
            ("interior-bedroom-forest-view.jpg", "The bed faces the glazed gable end: 21 m² laid out around the view."),
            ("exterior-dusk-firepit.jpg", "Lit at dusk, with the terrace and fire pit doing the work the main lodge would otherwise do."),
        ],
    },
    "apple-cabins": {
        "h1": "Apple Cabins",
        "eyebrow": "Apple cabins",
        "sub": "Big living in a small package.",
        "stats": [("13 – 26.5 m&sup2;", "Floor area"), ("Hours", "To install"),
                  ("3 sizes", "To choose from"), ("1 year", "Guarantee")],
        "h2_product": "Plug in and you are ready",
        "h2_uses": "Where it works",
        "images": {"cover": "hero-pod-fynbos.jpg", "feature": "interior-kitchenette-render.jpg",
                   "band2": "exterior-deck-sunset.jpg", "band4": "exterior-terrace-dusk.jpg"},
        "feature_cap": "A kitchenette is included in the 9 m and 11.8 m cabins, with luxurious bathroom fittings in all three sizes.",
        "band2_cap": "Curved, floor-to-ceiling panoramic glass with double glazing and an insulated, low-maintenance build.",
        "band4_cap": "Arrives fully assembled and professionally installed, ready for occupation within hours.",
        "cover_pos": "50% 52%",
        "gallery": [
            ("interior-pod-length.jpg", "Down the length of a cabin: bed, walnut kitchenette and the glazed wall alongside."),
            ("interior-bathroom.jpg", "The bathroom fittings included in all three sizes, with an LED mirror and a glass screen."),
            ("exterior-night-glow.jpg", "Lit at night on a timber deck: the glazing is the reason guests book the pod."),
            ("exterior-office-pod-render.jpg", "A timber-slat end wall and full-height glass, specified as an office pod."),
            ("exterior-garden-path.jpg", "Dropped into a garden as a self-contained guest suite with its own front door."),
        ],
    },
    "glamping-capsules": {
        "h1": "Glamping Capsules",
        "eyebrow": "Glamping capsules",
        "sub": "The art of glamping, perfected.",
        "stats": [("18.6 – 38 m&sup2;", "Floor area"), ("270&deg;", "Panoramic glazing"),
                  ("6 models", "Across two ranges"), ("1 year", "Guarantee")],
        "h2_product": "Two ranges, one idea",
        "h2_uses": "Where it works",
        "images": {"cover": "exterior-forest-1.jpg", "feature": "interior-bed-bushveld-view.jpg",
                   "band2": "exterior-night-pool.jpg", "band4": "exterior-capsule-row-dusk.jpg"},
        "feature_cap": "Rooms sit either side of the bathroom, each wrapped in 270&deg; floor-to-ceiling double glazing.",
        "band2_cap": "The bathroom and its premium fittings, a geyser and intelligent front-door access are standard on every model.",
        "band4_cap": "Arrives fully built with no on-site construction, ready for immediate occupancy.",
        "cover_pos": "50% 55%",
        "gallery": [
            ("interior-lounge.jpg", "A lounge area inside the capsule, with the glazing wrapped around it."),
            ("interior-ensuite.jpg", "The bathroom and its premium fittings, standard on every model in both ranges."),
            ("exterior-mountain-resort.jpg", "Curved panoramic glazing and a railed terrace, set for the view."),
            ("detail-panoramic-glass.jpg", "Black-framed double glazing: 270° of it, in each room."),
            ("exterior-deck-sundowners.jpg", "Raised on a deck at sunset: the unit itself is the reason for the nightly rate."),
        ],
    },
    "outdoor-kitchens": {
        "h1": "Outdoor Kitchens",
        "eyebrow": "Outdoor kitchens",
        "sub": "Then close the roof on the weather.",
        "stats": [("2.5 – 3.9 m", "Four lengths"), ("Motorised", "Lift-up roof"),
                  ("Quartz", "Stone countertop"), ("1 year", "Guarantee")],
        "h2_product": "Press the remote",
        "h2_uses": "Where it works",
        "images": {"cover": "party-braai-dusk.jpg", "feature": "kitchen-counter-prep.jpg",
                   "band2": "kitchen-storage-detail.jpg", "band4": "poolside-party-golden-hour.jpg"},
        "feature_cap": "A quartz stone countertop with a water-barrier edge, and a sink cover that doubles as extra workspace.",
        "band2_cap": "Aluminium honeycomb interior panels: high-temperature resistant, and they wipe clean after the braai.",
        "band4_cap": "Corrosion-resistant galvanised steel and aluminium alloy, built to live outdoors year-round.",
        "cover_pos": "50% 50%",
        "gallery": [
            ("kitchen-open-garden.jpg", "The canopy raised: the full working kitchen, sink, counter and lighting all exposed."),
            ("kitchen-braai-dusk.jpg", "The built-in gas braai lit, with the roof up and the LED strip on."),
            ("kitchen-patio-pool.jpg", "Beside a pool at blue hour: waterproofed throughout and built to stay outside."),
            ("kitchen-morning-coffee.jpg", "The same unit at sunrise. The quartz counter and sink cover carry the morning too."),
            ("patio-watching-the-game.jpg", "Closed down to a clean weatherproof box when the entertaining is over."),
        ],
    },
    "safari-tents": {
        "h1": "Safari Tents",
        "eyebrow": "Luxury safari tents",
        "sub": "Luxury under canvas.",
        "stats": [("Custom", "Sizes to brief"), ("Canvas", "Meru &amp; stretch"),
                  ("En-suite", "Layouts available"), ("1 year", "Guarantee")],
        "h2_product": "Configured to your site",
        "h2_uses": "Where it works",
        "images": {"cover": "hero-single-suite-sunset.jpg", "feature": "interior-ensuite-tub.jpg",
                   "band2": "interior-lounge-styling.jpg", "band4": "desert-mountain-camp-aerial.jpg"},
        "feature_cap": "En-suite layouts are available, configured to your brief and the guest experience you are building.",
        "band2_cap": "Canvas over timber structures, with raised decks available for views and airflow.",
        "band4_cap": "Supplied and installed by our manufacturing partner; Tiny Homes SA is not involved in the installation.",
        "cover_pos": "50% 55%",
        "gallery": [
            ("dusk-firepit-dining-deck.jpg", "A scalloped olive roof over a timber deck, with dining and a fire pit outside."),
            ("twilight-tented-suite-reflection.jpg", "A twin-peaked suite lit at twilight: canvas over a timber structure."),
            ("deck-lounge-firepit-twilight.jpg", "Deck furniture and a fire pit: the deck is specified with the tent, not after it."),
            ("hillside-suite-plunge-pool-sunset.jpg", "An elevated suite with a wraparound deck and a plunge pool, configured to the site."),
            ("exterior-dawn-mist.jpg", "A charcoal canopy over cream canvas at dawn, engineered for sun, wind and rain."),
        ],
    },
    "garages": {
        "h1": "DIY Garages",
        "eyebrow": "DIY garage kits",
        "sub": "Fold open, bolt, done.",
        "stats": [("18 or 36 m&sup2;", "Single or double"), ("About a day", "Two people"),
                  ("No welding", "Bolts together"), ("1 year", "Guarantee")],
        "h2_product": "Up in a day, by you",
        "h2_uses": "Where it works",
        "images": {"cover": "hero-single-garage.jpg", "feature": "garage-in-use-workbench.jpg",
                   "band2": "exterior-double-open-cars.jpg", "band4": "exterior-single-open-bakkie.jpg"},
        "feature_cap": "Chromadek colour-coated IBR sheeting on walls and roof, with all flashings, anchors and fixings included.",
        "band2_cap": "Manual roller doors and a pre-hung steel side door come on every kit.",
        "band4_cap": "Delivered flat-packed nationwide, with turnkey slab and assembly available on request.",
        "cover_pos": "50% 55%",
        "gallery": [],
    },
}

# DIY garages are withdrawn pending an engineer's sign-off and a resolution on
# CPA liability (owner decision 2026-08-04), so no garage brochure is produced.
ORDER = ["folding-homes", "expandable-homes", "nature-cabins", "apple-cabins",
         "glamping-capsules", "outdoor-kitchens", "safari-tents"]

FINE_STD = ("All prices in South African Rand and exclude VAT, and are subject to change. Delivery "
            "and installation are quoted separately, and the groundwork is arranged by you. "
            "Optional-extra pricing is confirmed line by line on your formal quotation. Finance and "
            "lay-bye are subject to credit approval. Tiny Homes (Pty) Ltd.")

# Second pass of per-product copy: the caveat box, the ordering step that is
# genuinely product-specific, the sizes page and how the dimensions bar should
# read. Kept apart from CONFIG so the visual choices above stay readable.
EXTRA = {
    "folding-homes": {
        "dims_label": "Floor area",
        "dims_ext_label": "External length &times; width &times; height",
        "dims_note": "Sits on a level concrete slab or properly levelled precast plinths.",
        "note": ("<strong>Building near the coast?</strong> The metal carved board exterior is required on "
                 "coastal sites, because standard panels corrode in salt air. All upgrade pricing is "
                 "provisional and confirmed line by line on your formal quotation."),
        "order4_title": "Unfold and connect",
        "order_setup": "Two workers unfold it in minutes; connect the power and it is in use.",
        "fine": FINE_STD,
        "h2_sizes": "One size, drawn to scale",
        "sizes_lede": ("The X-Fold is built in a single 15 m&sup2; size. This is that floor, drawn to scale "
                       "with furniture on it, so you can see what actually fits before you buy: the plan "
                       "below is the same drawing the configurator on our website works from."),
        "plan_note": ("<strong>No plumbing, by design.</strong> The X-Fold arrives wired for electricity "
                      "with two plug points, a light fitting and a small DB board, but no water. A local "
                      "installer can fit a shower and toilet on site, which is what most owners do when "
                      "the unit is used as a guest room or a rental."),
    },
    "expandable-homes": {
        "dims_label": "Floor area range",
        "dims_ext_label": "Largest model, expanded",
        "dims_note": "Sits on a level concrete slab or precast plinths.",
        "note": ("<strong>Per-m&sup2; upgrades scale with the size you choose.</strong> The polyurethane "
                 "metal carved board is also required on coastal sites, because standard panels corrode "
                 "in salt air."),
        "order4_title": "Expand and move in",
        "order_setup": "Expands on site within hours; on a prepared slab you can move in the same day.",
        "fine": FINE_STD,
        "h2_sizes": "Three sizes, three prices",
        "sizes_lede": ("Every size arrives as one module and expands on site. All three include a bathroom "
                       "and a kitchen, 75 mm EPS insulated walls, vinyl flooring and double-glazed windows "
                       "and a door as standard. What changes with size is the number of rooms and the "
                       "layouts available, which are set out on the next page."),
        "sizes_note": ("<strong>Prices are per unit, ex VAT, for the home itself.</strong> Delivery is quoted "
                       "separately on your location and site access; the groundwork and the connections "
                       "to water, power and sewer are arranged by you."),
        "h2_layouts": "Choose your layout",
        "layouts_lede": ("The internal layout is chosen when you order, at no change to the prices above. "
                         "These are the standard arrangements for each size: eight for the 6m home and "
                         "seven for the 12m, including laundry, walk-in-wardrobe and office variants. "
                         "Window and door placement is yours to choose, and non-standard layouts are "
                         "quoted on request."),
    },
    "nature-cabins": {
        "dims_label": "Floor area",
        "dims_ext_label": "External length &times; width &times; height",
        "dims_note": "Delivered by oversized cargo truck.",
        # Owner correction 2026-08-04: units now arrive fully built, and the
        # groundwork and final connections are the client's, not ours.
        "note": ("<strong>Groundwork and the final connections are arranged by the client.</strong> Water, "
                 "electricity, sewerage and the foundation must be completed before delivery, and the final "
                 "connections are made once the cabin is placed. Delivery is by oversized cargo truck, so "
                 "the site has to be reachable without 4x4 access."),
        "order4_title": "Connect and move in",
        "order4_body": ("The cabin arrives fully built, so only the final connections to water, electricity "
                        "and sewerage remain, arranged by you on a prepared site."),
        "fine": (FINE_STD + " Interior photography is illustrative: interior wall boards are white as "
                 "standard and bamboo on request, and the finish is confirmed on your quotation."),
        "h2_sizes": "The floor, drawn to scale",
        "sizes_lede": ("The nature cabin is built in one size: 21 m&sup2; of cabin plus a 1.5 &times; 3.2 m "
                       "viewing terrace, 8.1 m long and 26 m&sup2; overall. The bathroom and the kitchen are "
                       "included in that floor, and this is where they sit."),
        "plan_note": ("<strong>Everything in this plan is included in the price.</strong> The bathroom, the "
                      "kitchen with its stone countertop and induction cooker, the air conditioning, the "
                      "geyser and the viewing terrace are all standard: there is no options list to price "
                      "on top. Furniture is shown to scale to give a sense of the space, and is not supplied."),
    },
    "apple-cabins": {
        "dims_label": "Floor area range",
        "dims_ext_label": "Largest cabin, external",
        "dims_note": "Arrives fully assembled and professionally installed.",
        "note": ("<strong>Various sizes and designs are available</strong> beyond the three shown here. "
                 "Cabins can also be paired with solar and battery systems, gas geysers and rainwater "
                 "tanks for remote sites, quoted per project."),
        "order4_title": "Installed and ready",
        "order_setup": "Arrives fully assembled and professionally installed, ready within hours.",
        "fine": FINE_STD,
        "h2_sizes": "Three sizes, three floor plans",
        "sizes_lede": ("All three cabins are 2.25 m wide and 2.63 m high; what changes is the length, and "
                       "with it the number of rooms. Each plan below is the manufacturer's, drawn to scale. "
                       "Bathroom fittings are included in all three; the kitchenette comes with the 9 m and "
                       "11.8 m cabins."),
        "sizes_note": ("<strong>Prices are per cabin, ex VAT, delivered fully assembled.</strong> Delivery "
                       "and site preparation are quoted separately on your location and access."),
    },
    "glamping-capsules": {
        "dims_label": "Floor area range",
        "dims_ext_label": "Largest capsule, external",
        "dims_note": "Arrives fully built, with no on-site construction.",
        "note": ("<strong>The six models shown are a sample</strong> of the most popular layouts. Both "
                 "ranges build other sizes and layouts to order, so tell us what you need and we will "
                 "check it with the factory."),
        "h2_options": "Only what your site needs",
        "options_lede": ("The bathroom and its premium fittings, a geyser, multi-layer thermal insulation, "
                         "complete plumbing and electrical, interior and exterior lighting and intelligent "
                         "front-door access are standard on every model. The kitchen and air conditioning "
                         "are extras, so you only pay for what you actually want."),
        "options_note": ("<strong>These extras are a selection.</strong> There are far more options than we "
                         "can sensibly list, and the Space range carries the wider choice. Where a price "
                         "spans a range it varies with the model size, and is confirmed on your quotation."),
        "option_groups": [
            ("Core range", ["capsule-aircon", "capsule-kitchen", "underfloor-heating",
                            "smart-curtains", "capsule-skylight"]),
            ("Space range", ["space-kitchen", "space-floor-heating-sm", "space-floor-heating-l",
                             "space-curtains-sm", "space-curtains-l", "space-insulation-sm",
                             "space-insulation-l", "space-skylight", "space-enclosed-balcony",
                             "space-projector"]),
        ],
        "order4_title": "Placed and occupied",
        "order_setup": "Arrives fully built and is placed on site, ready for immediate occupancy.",
        "fine": FINE_STD,
        # Six models is too many for one page of plans, and they split naturally
        # into the two ranges the price list already distinguishes.
        "size_groups": [
            ("The core range", "Three capsules, six sizes",
             ["capsule-5-85", "capsule-8-5", "capsule-11-5"],
             "The more affordable build, with a shorter options list. Every model carries the bathroom "
             "and its premium fittings, a geyser, multi-layer insulation and the 270&deg; glazing as "
             "standard; the kitchen here is basic cabinetry with a sink, at R4&thinsp;900 per metre."),
            ("The Space range", "The premium build",
             ["space-d5", "space-d8", "space-d7"],
             "The same idea built further: a wider options list, a full kitchen with a 900 mm double "
             "stove and 80 L oven available, an enclosable balcony and upgraded 100 mm insulation. "
             "Layouts differ from the core range, so the plans are worth comparing side by side."),
        ],
        "sizes_note_core": ("<strong>The kitchen and air conditioning are the only real decisions.</strong> "
                            "Everything else on these three models is standard, and the Space range on the "
                            "next page is the same idea with a wider options list and a higher specification."),
        "sizes_note": ("<strong>Other sizes and layouts are built to order.</strong> The 11.5 m Space "
                       "capsule can be built as a two-bedroom, for example. Tell us what you need and we "
                       "will check it with the factory before you commit to anything."),
    },
    "outdoor-kitchens": {
        "dims_html": ("2.5 – 3.9 m", "Four lengths", "0.8 &times; 2.4 m", "Depth &times; height, all lengths",
                      "500 – 750 kg depending on length."),
        "note": ("<strong>Choose one cooking method:</strong> a single or double gas grill, an induction "
                 "flat-top stove or a kettle grill. Extra cabinetry runs at R3&thinsp;100 per metre."),
        "h2_options": "Tailor yours",
        "options_lede": ("The kitchen arrives complete with its motorised roof, quartz countertop, sink and "
                         "lighting. These add-ons let you build it out into exactly the entertainment area "
                         "you want."),
        "options_note": ("<strong>Choose one cooking method.</strong> Extra cabinetry is R3&thinsp;100 per "
                         "metre, so tell us the length you need and we will quote it on your formal "
                         "quotation."),
        "order4_title": "Delivered ready to use",
        "order_setup": "Delivered ready to use: connect water and power, then open the roof.",
        # No demo unit is in the showroom, so the brochure must not invite a
        # visit to see one (owner note 2026-08-04).
        "contact_sell": ("Send us your site details and we will come back with a written quotation for the "
                         "length and add-ons you want."),
        "fine": FINE_STD,
        "h2_sizes": "Four lengths, to scale",
        "sizes_lede": ("Every unit is 0.8 m deep and 2.4 m high; the length is the only decision, and it "
                       "sets how much counter and cabinetry you get. The four are drawn against each other "
                       "below, so you can measure the wall you have in mind against them."),
        "sizes_note": ("<strong>The 3.5 m and 3.9 m units take the double gas grill and the kettle "
                       "grill;</strong> the two shorter lengths take the single gas grill or the induction "
                       "flat top. Weights are for the unit alone, before add-ons."),
        "ladder": [("2.5 m", 2.5, 2.4, "approx 500 kg"), ("2.9 m", 2.9, 2.4, "approx 600 kg"),
                   ("3.5 m", 3.5, 2.4, "approx 700 kg"), ("3.9 m", 3.9, 2.4, "approx 750 kg")],
    },
    "garages": {
        "dims_html": ("18 or 36 m&sup2;", "Single or double", "6 &times; 3 m or 6 &times; 6 m", "Footprint",
                      "3.0 m at the high side, anchored to a level concrete slab."),
        "note": ("<strong>Gable roof upgrades are quoted per kit.</strong> The standard roof is a mono-pitch "
                 "lean-to; a pitched apex roof is available on both sizes and priced on your quotation."),
        "order4_title": "Assemble it yourself",
        "order_setup": "Two people, about a day, bolted together with no welding or cutting on site.",
        "fine": FINE_STD,
    },
    "safari-tents": {
        "dims_html": ("Custom", "Sizes built to brief", "Meru &amp; stretch", "Canvas roof styles",
                      "Priced on request after a consultation."),
        "note": ("<strong>Every tent is configured to your site and brief.</strong> Sizes, layouts and "
                 "finishes are set during the consultation, and you receive an itemised quotation before "
                 "anything is committed."),
        "order2_title": "Quoted per project",
        "order2_body": ("Lead time is confirmed with your itemised quotation once the brief and site are "
                        "settled."),
        "order4_title": "Supplied and installed",
        "order_setup": "Supplied and installed by our manufacturing partner; Tiny Homes SA is not involved in the installation.",
        "fine": ("Safari tents are priced on request: every project is quoted after a consultation, and the "
                 "itemised quotation is confirmed in writing before anything is committed. Prices exclude "
                 "VAT. Delivery and installation are quoted separately, and the groundwork is arranged by "
                 "you. Finance and lay-bye are subject to credit approval. Tiny Homes (Pty) Ltd."),
    },
}

# Who pays for what. The single most common reason a reader picks up the phone
# is that a price does not say what it covers, so every brochure states it in
# three columns: what the figure buys, what is quoted on top, and what the
# customer has to have ready. Defaults hold unless a product overrides them.
SCOPE_DEFAULT = {
    "in": ["The unit itself, built and finished in the factory to the specification on this page",
           "Everything listed under Included as standard",
           "1-year limited guarantee, with full after-sales support"],
    "sep": ["Delivery from Centurion, on distance and site access",
            "Any optional extras you choose",
            "VAT"],
    "you": ["A level, prepared foundation, finished before delivery",
            "Access for a delivery truck and for offloading",
            "Connections to water, electricity and sewerage",
            "Any municipal approval your site or zoning requires"],
}

SCOPE = {
    "folding-homes": {
        "in": ["The unit itself, unfolded and standing: walls, roof, floor, steel door and two windows",
               "EPS insulation and upgraded floor beams",
               "Electrics: two plug points, a light fitting and a small DB board",
               "1-year limited guarantee, with full after-sales support"],
        "sep": ["Delivery from Centurion, on distance and site access",
                "Offloading: the crane or forklift, and the two people who unfold it, arranged by us",
                "Any optional extras you choose",
                "VAT"],
        "you": ["A level concrete slab or properly levelled precast plinths",
                "The power connection to the DB board",
                "A local plumber, if you want a bathroom or wet room added"],
    },
    "expandable-homes": {
        "in": ["The home as one module, with the bathroom and kitchen fitted",
               "75 mm EPS insulated walls, vinyl flooring, double-glazed windows and a door",
               "Plumbing and electrics installed in the factory",
               "Your choice of layout and of the 107 exterior finishes"],
    },
    "nature-cabins": {
        "in": ["The cabin, fully built, with its 1.5 × 3.2 m viewing terrace",
               "Fitted bathroom, kitchen with stone countertop and induction cooker",
               "Midea air conditioning and a 40–60 L storage electric water heater",
               "Polyurethane-insulated walls, double glazing and SPC laminate flooring"],
        "sep": ["Delivery by oversized cargo truck, on distance and site access",
                "VAT"],
        "you": ["The foundation and all services, completed before delivery",
                "The final connections once the cabin is placed",
                "Site access for an oversized cargo truck: 4x4-only sites cannot be served",
                "Any municipal approval your site or zoning requires"],
    },
    "apple-cabins": {
        "in": ["The cabin, delivered fully assembled and professionally installed",
               "Luxurious bathroom fittings in all three sizes; kitchenette in the 9 m and 11.8 m",
               "Panoramic double glazing, smart-lock entry, integrated lighting and plumbing",
               "Premium interior finishes with curtain tracks"],
    },
    "glamping-capsules": {
        "in": ["The capsule, fully built, with 270° double glazing throughout",
               "Bathroom with premium fittings, and a geyser",
               "Multi-layer thermal insulation, complete plumbing and electrical",
               "Interior and exterior lighting, intelligent front-door access"],
        "sep": ["Delivery from Centurion, on distance and site access",
                "The kitchen and air conditioning, and any other extras you choose",
                "VAT"],
    },
    "outdoor-kitchens": {
        "in": ["The kitchen, delivered ready to use in the length and colour you choose",
               "Motorised lift-up roof, quartz countertop, stainless-steel sink and pull-out faucet",
               "Embedded plumbing and electrical, distribution box with leakage protection",
               "Recessed lighting with an adjustable LED ambient strip"],
        "sep": ["Delivery and installation, on distance and site access",
                "Any add-ons: grills, stove, extractor, bar fridge, speaker or ceiling",
                "VAT"],
        "you": ["A level, hard standing where the unit will live",
                "Water and power within reach of the unit",
                "Access to get a 500–750 kg unit to the spot"],
    },
    "safari-tents": {
        "in": ["The tent, deck and layout exactly as set out in your itemised quotation",
               "Supply and installation by our manufacturing partner, who installs on site, not us",
               "Configuration to your site, brief and guest experience",
               "Full after-sales support"],
        "sep": ["Delivery and installation, quoted per project",
                "VAT"],
        "you": ["Groundwork and platform preparation",
                "Site access for delivery and installation crews",
                "Services to the tent: water, power and waste",
                "Any municipal or reserve approval the site requires"],
    },
}

# The four questions every reader asks before the specific ones, answered once
# on the FAQ page so nobody has to phone to establish the basics.
QUICK = [
    ("Lead time", "&plusmn;90 days", "From deposit to delivered on site for most orders."),
    ("Guarantee", "1 year", "Limited guarantee on every product, with full after-sales support."),
    ("Delivery", "Nationwide", "From Centurion, Gauteng to all nine provinces; cross-border on request."),
    ("Finance", "Available", "Finance and lay-bye, subject to credit approval."),
]


# --------------------------------------------------------------------- CSS
CSS = """
@font-face { font-family:'Fraunces'; src:url(data:font/woff2;base64,__FRAUNCES__) format('woff2');
  font-weight:100 900; font-style:normal; font-display:block; }
@font-face { font-family:'InterVar'; src:url(data:font/woff2;base64,__INTER__) format('woff2');
  font-weight:100 900; font-style:normal; font-display:block; }

:root{
  --cream:#faf6ef; --parchment:#f4eee2; --sand:#e9dfce; --ink:#1c1b17; --stone:#67635a;
  --forest:#1e3a2b; --forest-light:#2d5540; --moss:#44684f; --sage:#a8bfa0;
  --clay:#b4552d; --clay-dark:#9a4522; --border:#ddd3c1;
}
*{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
html{background:#6b6a66}
body{font-family:'InterVar',ui-sans-serif,system-ui,sans-serif;color:var(--ink);background:#6b6a66;
  -webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;font-size:9.5pt;line-height:1.55}

@page{size:A4;margin:0}
.page{position:relative;width:210mm;height:297mm;overflow:hidden;background:var(--cream);
  page-break-after:always;break-after:page}
.page:last-child{page-break-after:auto;break-after:auto}
@media screen{ body{padding:12mm 0} .page{margin:0 auto 10mm;box-shadow:0 4px 12px rgba(0,0,0,.28),0 18px 46px rgba(0,0,0,.34)} }

.pad{padding:0 16mm}
.flow{overflow:hidden}
/* Flex column for two reasons: it stops child margins collapsing through the
   wrapper (which made scrollHeight under-report and clipped the last line of
   a page), and it lets the closing block pin to the foot of the page. */
.flow-inner{transform-origin:top left;display:flex;flex-direction:column;min-height:100%;padding-bottom:1mm}
.flow-inner > *{flex-shrink:0}
/* Absorbs leftover height so the closing block sits at the foot of the page,
   while min-height keeps a real gap when the page is full. */
.flow-inner > .grow{flex:1 1 auto;flex-shrink:1;min-height:6mm}

/* Paper grain, screen only. Chrome rasterises this overlay per page when it
   prints, which costs roughly 390 kB a page: half the weight of a finished
   brochure, spent on a texture nobody can see once it is on paper. A brochure
   that will not go through email is worth less than the texture. */
@media screen{
  .grain::after{content:"";position:absolute;inset:0;pointer-events:none;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")}
}

.display{font-family:'Fraunces',ui-serif,Georgia,serif;font-weight:560;letter-spacing:-.02em;
  line-height:1.02;font-variation-settings:"SOFT" 40,"WONK" 0,"opsz" 144;font-optical-sizing:auto}
.eyebrow{font-size:7.4pt;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:var(--clay)}
.eyebrow.on-dark{color:var(--sage)}
h2.display{font-size:26pt;color:var(--forest)}
h3{font-size:10.5pt;font-weight:600;letter-spacing:-.005em;color:var(--ink)}
.lede{font-size:10.2pt;line-height:1.6;color:var(--stone)}
p{color:var(--stone)}
.nums{font-variant-numeric:tabular-nums}
.rule{height:1px;background:var(--border);border:0}
.rule-clay{height:2.4px;width:34mm;background:var(--clay);border:0;border-radius:2px}

/* cover */
.hero{position:relative;height:184mm;width:100%;overflow:hidden;background:var(--forest)}
.hero .bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.hero-scrim{position:absolute;inset:0;background:
  radial-gradient(120% 90% at 15% 92%,rgba(28,27,23,.68),transparent 62%),
  linear-gradient(to top,rgba(28,27,23,.80) 0%,rgba(28,27,23,.34) 44%,rgba(28,27,23,.14) 100%)}
.hero-inner{position:absolute;inset:0;padding:14mm 16mm;display:flex;flex-direction:column}
.hero-logo{width:44mm}
.hero-foot{margin-top:auto}
.hero h1{font-size:54pt;color:var(--cream);margin:3.5mm 0 0;max-width:150mm}
.hero .sub{font-family:'Fraunces',serif;font-variation-settings:"SOFT" 40,"opsz" 90;font-size:18pt;
  font-weight:400;color:var(--sage);letter-spacing:-.01em;margin-top:1.5mm}
.hero .tag{font-size:10.5pt;color:rgba(250,246,239,.90);margin-top:5mm;max-width:150mm}

.cover-body{padding:11mm 16mm 0}
.cover-grid{display:flex;gap:10mm;align-items:flex-start}
.cover-grid p{font-size:9.1pt;line-height:1.6}
.price-card{flex:0 0 54mm;border:1.2px solid var(--border);border-top:2.4px solid var(--clay);
  background:var(--parchment);padding:5mm 4mm 5.5mm;text-align:center}
.price-card .from{font-size:7.4pt;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--stone)}
.price-card .amt{font-family:'Fraunces',serif;font-variation-settings:"SOFT" 40,"opsz" 144;font-weight:600;
  font-size:25pt;color:var(--forest);letter-spacing:-.02em;line-height:1.1;margin-top:1mm}
.price-card .amt.por{font-size:15pt;line-height:1.2;margin-top:2mm}
.price-card .vat{font-size:7.6pt;color:var(--stone);margin-top:.5mm}

.stats{display:flex;margin-top:9mm;border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
.stat{flex:1;padding:5.5mm 1mm;text-align:center;border-right:1px solid var(--border)}
.stat:last-child{border-right:0}
.stat .v{font-family:'Fraunces',serif;font-variation-settings:"SOFT" 40,"opsz" 120;font-weight:600;
  font-size:16pt;color:var(--forest);letter-spacing:-.02em;line-height:1.1}
.stat .v.sm{font-size:12.5pt}
.stat .v.xs{font-size:10.5pt}
.stat .l{font-size:6.8pt;font-weight:500;letter-spacing:.11em;text-transform:uppercase;color:var(--stone);margin-top:1.6mm}
.cover-foot{position:absolute;left:16mm;right:16mm;bottom:11mm;display:flex;justify-content:space-between;
  font-size:8pt;color:var(--stone);letter-spacing:.04em}
.cover-foot strong{color:var(--forest);font-weight:600}

/* furniture */
.folio{position:absolute;left:16mm;right:16mm;bottom:9mm;display:flex;justify-content:space-between;
  align-items:center;font-size:7.2pt;letter-spacing:.12em;text-transform:uppercase;color:var(--stone)}
.folio .n{font-weight:600;color:var(--forest)}
.head{padding-top:15mm}
.head h2{margin-top:3mm}
.head .rule-clay{margin-top:5mm}

.cols{display:flex;gap:9mm}
.figure{border:1px solid var(--border);background:#fff;padding:4mm}
.figure img{width:100%;display:block}
.photo{width:100%;display:block;border:1px solid var(--border)}
.cap{font-size:7.4pt;color:var(--stone);margin-top:3mm;line-height:1.45}

.ticks{list-style:none}
.ticks li{position:relative;padding-left:6.2mm;margin-bottom:3.4mm;font-size:8.8pt;line-height:1.45;
  color:var(--ink);break-inside:avoid}
.ticks li::before{content:"";position:absolute;left:0;top:1.5mm;width:3.4mm;height:1.8mm;
  border-left:1.5px solid var(--moss);border-bottom:1.5px solid var(--moss);transform:rotate(-45deg)}

.band{position:relative;width:210mm;margin-left:-16mm;overflow:hidden}
.band img{width:100%;height:100%;object-fit:cover;display:block}
.band .lbl{position:absolute;left:16mm;bottom:7mm;right:16mm;color:var(--cream);font-size:8.2pt;
  text-shadow:0 1px 6px rgba(28,27,23,.85);max-width:135mm}
.band .scrim{position:absolute;inset:0;
  background:linear-gradient(to top,rgba(28,27,23,.74) 0%,rgba(28,27,23,.16) 46%,transparent 70%)}

/* spec */
.spec{column-count:2;column-gap:10mm}
.spec .row{break-inside:avoid;padding:2.2mm 0;border-bottom:1px solid var(--border)}
.spec .k{font-size:6.9pt;font-weight:600;letter-spacing:.13em;text-transform:uppercase;color:var(--clay)}
.spec .v{font-size:8.4pt;line-height:1.42;color:var(--ink);margin-top:.7mm}

.dims{display:flex;align-items:center;gap:8mm;background:var(--forest);color:var(--cream);padding:5mm 8mm}
.dims .big{font-family:'Fraunces',serif;font-variation-settings:"SOFT" 40,"opsz" 144;font-weight:600;
  font-size:17pt;letter-spacing:-.02em}
.dims .sm{font-size:8.2pt;color:rgba(250,246,239,.82);line-height:1.45}
.dims .divider{width:1px;align-self:stretch;background:rgba(250,246,239,.28)}

/* tables */
.up{width:100%;border-collapse:collapse}
.up th{text-align:left;font-size:7pt;font-weight:600;letter-spacing:.13em;text-transform:uppercase;
  color:var(--stone);padding-bottom:2.4mm;border-bottom:1px solid var(--border)}
.up th:last-child,.up td:last-child{text-align:right}
.up th:last-child{white-space:nowrap;width:26mm}
.up td{padding:2.6mm 0;border-bottom:1px solid var(--border);vertical-align:top;font-size:8.6pt}
.up .name{font-weight:600;color:var(--ink)}
.up .desc{font-size:7.9pt;color:var(--stone);line-height:1.45;margin-top:.8mm}
.up .amt{font-family:'Fraunces',serif;font-variation-settings:"SOFT" 40,"opsz" 120;font-weight:600;
  font-size:12pt;color:var(--forest);white-space:nowrap}
.up .amt .quoted{font-family:'InterVar',sans-serif;font-size:8.4pt;font-weight:500;color:var(--stone)}
.up .sz{font-size:8.2pt;color:var(--stone);white-space:nowrap}

.note{border-left:2.4px solid var(--clay);background:var(--parchment);padding:3.5mm 5mm;
  font-size:8.2pt;line-height:1.45;color:var(--ink)}
.note strong{color:var(--clay-dark)}

/* who pays for what */
.scope{display:flex;gap:7mm}
.scope .sc{flex:1;border-top:2px solid var(--border);padding-top:3mm}
.scope .k{font-size:7pt;font-weight:600;letter-spacing:.13em;text-transform:uppercase}
.scope ul{list-style:none;margin-top:2.5mm}
.scope li{position:relative;padding-left:3.4mm;font-size:7.9pt;line-height:1.42;color:var(--ink);
  margin-bottom:2.2mm}
.scope li::before{content:"";position:absolute;left:0;top:1.5mm;width:1.4mm;height:1.4mm;
  border-radius:50%;background:var(--sand)}

/* use cases */
.uses{column-count:2;column-gap:9mm}
.uses .u{break-inside:avoid;padding:2.5mm 0;border-top:1px solid var(--border)}
.uses h3{font-size:9.2pt;color:var(--forest)}
.uses p{font-size:8pt;line-height:1.42;margin-top:.7mm}

/* ordering */
.order{display:flex;gap:7mm}
.order .o{flex:1}
.order .o .k{font-family:'Fraunces',serif;font-variation-settings:"SOFT" 40,"opsz" 120;font-weight:600;
  font-size:13pt;color:var(--clay)}
.order .o h3{font-size:8.8pt;margin-top:1.2mm}
.order .o p{font-size:7.9pt;line-height:1.42;margin-top:.8mm}

/* contact */
.contact{position:absolute;left:0;right:0;bottom:0;background:var(--forest);color:var(--cream);
  padding:8mm 16mm 7mm}
.contact .top{display:flex;justify-content:space-between;align-items:center;gap:10mm}
.contact h2{font-size:19pt;color:var(--cream)}
.contact .sell{font-size:8.3pt;color:rgba(250,246,239,.78);margin-top:2mm;line-height:1.45;max-width:104mm}
.contact .logo{width:36mm;flex:0 0 36mm}
.contact .grid{display:flex;gap:7mm;margin-top:6mm;padding-top:5mm;border-top:1px solid rgba(250,246,239,.22)}
.contact .c{flex:1}
.contact .c.wide{flex:1.35}
.contact .c .k{font-size:6.8pt;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--sage)}
.contact .c .v{font-size:8.6pt;color:var(--cream);margin-top:1.2mm;line-height:1.4}
.contact .fine{font-size:6.9pt;color:rgba(250,246,239,.55);margin-top:6mm;line-height:1.5}
.contact .qr{flex:0 0 25mm;text-align:center}
.contact .qr .box{background:var(--cream);padding:2mm;border-radius:2px;display:inline-block}
.contact .qr .k{font-size:6.2pt;font-weight:600;letter-spacing:.1em;text-transform:uppercase;
  color:var(--sage);margin-top:1.6mm;line-height:1.3}

/* models: one size, its plan, its price */
.model{display:flex;gap:7mm;align-items:flex-start;padding:5mm 0;border-top:1px solid var(--border)}
.model:first-of-type{border-top:0;padding-top:2mm}
.model .mplan{flex:0 0 104mm;background:var(--cream);border:1px solid var(--border);padding:3mm}
.model .minfo{flex:1;min-width:0}
.model .mhead{display:flex;justify-content:space-between;align-items:baseline;gap:4mm}
.model .mname{font-family:'Fraunces',serif;font-variation-settings:"SOFT" 40,"opsz" 120;font-weight:600;
  font-size:14pt;color:var(--forest);letter-spacing:-.01em;line-height:1.1}
.model .mamt{font-family:'Fraunces',serif;font-variation-settings:"SOFT" 40,"opsz" 120;font-weight:600;
  font-size:14pt;color:var(--forest);white-space:nowrap}
.model .mvat{font-size:6.8pt;font-weight:500;letter-spacing:.1em;text-transform:uppercase;
  color:var(--stone);text-align:right;margin-top:.4mm}
.model .mmeta{font-size:8.2pt;color:var(--clay);font-weight:600;margin-top:1.6mm;letter-spacing:.02em}
.model .mdesc{font-size:8.2pt;line-height:1.45;margin-top:2mm}
.model .mrooms{font-size:7.8pt;line-height:1.4;color:var(--ink);margin-top:2.5mm;
  border-left:2px solid var(--sage);padding-left:3.5mm}
.model .mfoot{display:flex;align-items:center;gap:3.5mm;margin-top:3.5mm}
.model .mfoot .qcap{font-size:6.9pt;line-height:1.35;color:var(--stone)}
.plansheet{width:100%}
.plancap{font-size:7.2pt;color:var(--stone);margin-top:2mm;text-align:center}

/* expandable layout sheets */
.layouts{display:flex;flex-wrap:wrap;gap:4mm}
.layouts .l{flex:0 0 calc(33.333% - 2.7mm);border:1px solid var(--border);background:#fff;padding:2mm 2mm 1.5mm}
.layouts.wide .l{flex:0 0 calc(33.333% - 2.7mm)}
.layouts .l img{width:100%;display:block}
.layouts .l .n{font-size:7pt;font-weight:600;color:var(--forest);text-align:center;margin-top:1.5mm}

/* gallery: fixed photo heights, because five photographs at their natural
   aspect ratios overflow an A4 page by half a page and the auto-fit pass
   would answer that by shrinking the whole page to a third of its size. */
.gal-wide{width:100%;height:74mm;object-fit:cover;display:block;border:1px solid var(--border)}
.gal-grid{display:flex;flex-wrap:wrap;gap:6mm}
.gal-grid .g{flex:0 0 calc(50% - 3mm)}
.gal-grid .g img{width:100%;height:52mm;object-fit:cover;display:block;border:1px solid var(--border)}
.gal-grid .cap{margin-top:2mm}

/* faq */
.faq{column-count:2;column-gap:9mm}
.faq .q{break-inside:avoid;padding:0 0 3.5mm}
.faq h3{font-size:8.8pt;color:var(--forest);line-height:1.35}
.faq p{font-size:7.9pt;line-height:1.45;margin-top:1mm}
.quick{display:flex;border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
.quick .q{flex:1;padding:4mm 3mm;border-right:1px solid var(--border)}
.quick .q:last-child{border-right:0}
.quick .k{font-size:6.6pt;font-weight:600;letter-spacing:.13em;text-transform:uppercase;color:var(--clay)}
.quick .v{font-family:'Fraunces',serif;font-variation-settings:"SOFT" 40,"opsz" 120;font-weight:600;
  font-size:13pt;color:var(--forest);margin-top:1.2mm;line-height:1.1}
.quick p{font-size:7.4pt;line-height:1.4;margin-top:1.2mm}
"""

# JS auto-fit: measure each page's flowing content once fonts and images have
# settled, then scale it to the available height if it would overflow. The
# resulting scale factors are written to body[data-fit] so a --dump-dom pass
# can report which pages are straining.
FIT_JS = """
(async function(){
  try { await document.fonts.ready; } catch(e) {}
  await Promise.all([...document.images].map(i => i.complete ? null :
    new Promise(r => { i.onload = i.onerror = r; })));
  const MM = 3.7795275591;
  const report = [];
  document.querySelectorAll('.page').forEach((page, idx) => {
    const flow = page.querySelector('.flow');
    if (!flow) { report.push(1); return; }
    const inner = flow.querySelector('.flow-inner');
    const contact = page.querySelector('.contact');
    const reserve = contact ? contact.offsetHeight + 6 * MM : 16 * MM;
    const box = page.clientHeight - flow.offsetTop - reserve;
    flow.style.height = box + 'px';
    // .flow carries the page's own top padding, so the space the content
    // actually gets is the border box minus that padding. Measuring against
    // the border box let roughly 15mm of content run off the crop.
    const cs = getComputedStyle(flow);
    const avail = box - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    // Scaling is iterative: compensating the width so the scaled content still
    // spans the measure re-wraps every paragraph, which changes the height the
    // scale was derived from. One pass therefore under-shoots and clips the
    // last line; this converges in two or three.
    let s = 1;
    for (let i = 0; i < 8; i++) {
      const h = inner.scrollHeight * s;
      if (h <= avail - 2) break;
      s *= (avail - 4) / h;
      inner.style.transform = 'scale(' + s + ')';
      inner.style.width = (100 / s) + '%';
    }
    report.push(Math.round(s * 1000) / 1000);
  });
  document.body.setAttribute('data-fit', JSON.stringify(report));
})();
"""


# ----------------------------------------------------------------- sections
def cover(p, cfg, im):
    por = p.get("priceOnRequest")
    if por:
        price_block = ('<div class="from">Pricing</div>'
                       '<div class="amt por">Price on request</div>'
                       '<div class="vat">Quoted after a consultation</div>')
    else:
        price_block = (f'<div class="from">From</div>'
                       f'<div class="amt nums">{rands(p["startingPrice"])}</div>'
                       f'<div class="vat">excluding VAT</div>')

    stats = ""
    for v, l in cfg["stats"]:
        plain = re.sub(r"&[a-z]+;|&#?\w+;", "x", v)
        cls = "v" + (" xs" if len(plain) > 12 else " sm" if len(plain) > 8 else "")
        stats += f'<div class="stat"><div class="{cls} nums">{v}</div><div class="l">{l}</div></div>'

    return f"""
<section class="page grain">
  <div class="hero">
    <img class="bg" style="object-position:{cfg['cover_pos']}" src="{im['cover']}" alt="{esc(cfg['alt_cover'])}">
    <div class="hero-scrim"></div>
    <div class="hero-inner">
      <img class="hero-logo" src="{im['logo_white']}" alt="Tiny Homes SA">
      <div class="hero-foot">
        <div class="eyebrow on-dark">{cfg['eyebrow']}</div>
        <h1 class="display">{cfg['h1']}</h1>
        <div class="sub">{cfg['sub']}</div>
        <div class="tag">{esc(p['tagline'])}</div>
      </div>
    </div>
  </div>
  <div class="cover-body">
    <div class="cover-grid">
      <p>{m2(esc(p['summary']))}</p>
      <div class="price-card">{price_block}</div>
    </div>
    <div class="stats">{stats}</div>
  </div>
  <div class="cover-foot">
    <div><strong>tinyhomesa.com</strong></div>
    <div>{SITE['phoneDisplay']} &nbsp;&middot;&nbsp; Centurion, Gauteng &nbsp;&middot;&nbsp; Delivered nationwide</div>
  </div>
</section>"""


def page_product(p, cfg, im, folio):
    ticks = "".join(f"<li>{m2(esc(f))}</li>" for f in p["features"])
    img_tag = (f'<div class="figure"><img src="{im["feature"]}" alt="{esc(cfg["alt_feature"])}"></div>'
               if cfg.get("feature_is_diagram")
               else f'<img class="photo" src="{im["feature"]}" alt="{esc(cfg["alt_feature"])}">')
    return f"""
<section class="page grain">
  <div class="flow pad head"><div class="flow-inner">
    <div class="eyebrow">The product</div>
    <h2 class="display">{cfg['h2_product']}</h2>
    <hr class="rule-clay" style="margin-top:5mm">

    <p class="lede" style="margin-top:7mm;max-width:158mm">{m2(esc(sentences(p['description'], 330)))}</p>

    <div class="cols" style="margin-top:8mm">
      <div style="flex:0 0 80mm">
        {img_tag}
        <div class="cap">{cfg['feature_cap']}</div>
      </div>
      <div style="flex:1">
        <div class="eyebrow">Included as standard</div>
        <hr class="rule" style="margin:3.5mm 0 5mm">
        <ul class="ticks">{ticks}</ul>
      </div>
    </div>

    <div class="grow" style="min-height:9mm"></div>
    <div class="band" style="height:52mm">
      <img src="{im['band2']}" alt="{esc(cfg['alt_band2'])}">
      <div class="scrim"></div>
      <div class="lbl">{cfg['band2_cap']}</div>
    </div>
  </div></div>
  <div class="folio"><span>{esc(cfg['h1'])}</span><span class="n nums">{folio:02d}</span></div>
</section>"""


def model_row(p, v, plan_html, rooms):
    """One size: its plan, its dimensions, its price and its own quote QR."""
    dims = dims_clause(v)
    rooms_html = (f'<div class="mrooms">In this plan: {m2(esc(rooms))}</div>' if rooms else "")
    return f"""
    <div class="model">
      <div class="mplan">{plan_html}</div>
      <div class="minfo">
        <div class="mhead"><div class="mname">{esc(v["name"])}</div>
          <div><div class="mamt nums">{rands(v["price"])}</div><div class="mvat">ex VAT</div></div>
        </div>
        <div class="mmeta nums">{m2(v["size"])} &nbsp;&middot;&nbsp; {m2(esc(dims))}</div>
        <p class="mdesc">{m2(esc(sentences(v["description"], 210)))}</p>
        {rooms_html}
        <div class="mfoot">
          {qr_svg(quote_url(p["slug"], v["id"]), 14)}
          <div class="qcap">Scan for a quotation<br>on this exact size</div>
        </div>
      </div>
    </div>"""


def page_models(p, cfg, folio, variant_ids=None, heading=None, eyebrow="Sizes & floor plans",
                lede=None, note_key="sizes_note"):
    """A page of models: each size with its manufacturer floor plan and price."""
    sheets = LAYOUT_PLANS.get(p["slug"], {})
    rows = ""
    for v in p["variants"]:
        if variant_ids and v["id"] not in variant_ids:
            continue
        sheet = sheets.get(v["id"])
        plan_html, rooms = "", ""
        if sheet:
            src = SITE_IMG / sheet[0]["src"].replace("/images/", "", 1)
            plan_html = svg_scoped(src, f'pl-{p["slug"]}-{v["id"]}')
            # The sheet's own label names what the plan contains.
            rooms = plan_rooms(sheet[0]["label"])
        rows += model_row(p, v, plan_html, rooms)
    note = (EXTRA[p["slug"]].get(note_key) or "")
    return f"""
<section class="page grain">
  <div class="flow pad head"><div class="flow-inner">
    <div class="eyebrow">{eyebrow}</div>
    <h2 class="display">{heading or EXTRA[p['slug']].get('h2_sizes', 'Sizes and prices')}</h2>
    <hr class="rule-clay" style="margin-top:5mm">
    <p class="lede" style="margin-top:6mm;max-width:158mm">{lede or EXTRA[p['slug']].get('sizes_lede','')}</p>
    <div style="margin-top:5mm">{rows}</div>
    <div class="grow" style="min-height:5mm"></div>
    {f'<div class="note">{note}</div>' if note else ''}
  </div></div>
  <div class="folio"><span>{esc(cfg['h1'])}</span><span class="n nums">{folio:02d}</span></div>
</section>"""


def page_plan(p, cfg, folio, band=None):
    """Single-size products: the floor plan drawn from the site's own geometry."""
    pl = PLANS[p["slug"]]["default"]
    svg = planlib.plan_svg(pl, width=880, uid=f'dp-{p["slug"]}')
    legend = "".join(
        f'<div class="q"><div class="k">{esc(k)}</div><p style="margin-top:1.2mm">{esc(v)}</p></div>'
        for k, v in planlib.plan_legend(pl))
    ex = pl["exterior"]
    return f"""
<section class="page grain">
  <div class="flow pad head"><div class="flow-inner">
    <div class="eyebrow">Floor plan</div>
    <h2 class="display">{EXTRA[p['slug']].get('h2_sizes', 'The floor, drawn to scale')}</h2>
    <hr class="rule-clay" style="margin-top:5mm">
    <p class="lede" style="margin-top:6mm;max-width:158mm">{EXTRA[p['slug']].get('sizes_lede','')}</p>

    <div style="margin-top:6mm;border:1px solid var(--border);background:var(--cream);padding:5mm 6mm 4mm">
      {svg}
    </div>
    <div class="quick" style="margin-top:6mm">
      <div class="q"><div class="k">Floor area</div><div class="v nums">{m2(p['sizeLabel'])}</div></div>
      <div class="q"><div class="k">External</div><div class="v nums" style="font-size:11pt">{ex['w']} &times; {ex['d']} m</div></div>
      {legend}
    </div>

    <div class="grow" style="min-height:6mm"></div>
    <div class="note">{EXTRA[p['slug']].get('plan_note', EXTRA[p['slug']]['note'])}</div>
    {f'<div class="band" style="height:52mm;margin-top:6mm"><img src="{band[0]}" alt="{esc(band[1])}">'
     f'<div class="scrim"></div><div class="lbl">{band[2]}</div></div>' if band else ''}
  </div></div>
  <div class="folio"><span>{esc(cfg['h1'])}</span><span class="n nums">{folio:02d}</span></div>
</section>"""


def page_sizes_table(p, cfg, im, folio, ladder_svg=None, extra_img=None, extra_cap=None, band=None):
    """
    Sizes for products with no per-model floor plan.

    Expandable homes get the manufacturer's transport/expanded dimension sheet;
    outdoor kitchens get the four lengths drawn against each other. Both then
    list every size with its dimensions, its price and its own quote QR.
    """
    rows = ""
    for v in p["variants"]:
        dims = v["description"].split(",")[0].strip()
        rows += (f'<tr><td><div class="name">{esc(v["name"])}</div>'
                 f'<div class="desc">{m2(esc(sentences(v["description"], 150)))}</div></td>'
                 f'<td><span class="sz nums">{m2(v["size"])}</span></td>'
                 f'<td><span class="amt nums">{rands(v["price"])}</span></td></tr>')
    qrs = "".join(
        f'<div style="text-align:center">{qr_svg(quote_url(p["slug"], v["id"]), 15)}'
        f'<div style="font-size:6.9pt;color:var(--stone);margin-top:1.5mm;line-height:1.3">'
        f'{esc(v["name"])}</div></div>'
        for v in p["variants"])
    fig = ""
    if ladder_svg:
        fig = (f'<div style="margin-top:6mm;border:1px solid var(--border);background:var(--cream);'
               f'padding:5mm 6mm 3mm">{ladder_svg}</div>')
    elif extra_img:
        fig = (f'<div class="cols" style="margin-top:6mm;align-items:flex-start">'
               f'<div class="figure" style="flex:0 0 62mm"><img src="{extra_img}" alt=""></div>'
               f'<div style="flex:1"><div class="cap" style="margin-top:0">{extra_cap}</div></div></div>')
    return f"""
<section class="page grain">
  <div class="flow pad head"><div class="flow-inner">
    <div class="eyebrow">Sizes &amp; prices</div>
    <h2 class="display">{EXTRA[p['slug']].get('h2_sizes','Sizes and prices')}</h2>
    <hr class="rule-clay" style="margin-top:5mm">
    <p class="lede" style="margin-top:6mm;max-width:158mm">{EXTRA[p['slug']].get('sizes_lede','')}</p>
    {fig}
    <table class="up" style="margin-top:7mm">
      <tr><th>Model</th><th style="text-align:left;width:20mm">Size</th><th>Price ex VAT</th></tr>
      {rows}
    </table>
    <div style="margin-top:6mm">
      <div class="eyebrow">Price it yourself</div>
      <hr class="rule" style="margin:3mm 0 4mm">
      <div style="display:flex;gap:8mm;align-items:flex-start">
        <div style="flex:1;font-size:8.2pt;line-height:1.5;color:var(--stone)">
          Each code opens our quote form with that size already selected, so you can add the extras you
          want, see the total and send it to us without typing anything. Or call, WhatsApp or email us and
          we will do it with you.
        </div>
        <div style="display:flex;gap:5mm">{qrs}</div>
      </div>
    </div>
    <div class="grow" style="min-height:5mm"></div>
    <div class="note">{EXTRA[p['slug']].get('sizes_note', EXTRA[p['slug']]['note'])}</div>
    {f'<div class="band" style="height:50mm;margin-top:6mm"><img src="{band[0]}" alt="{esc(band[1])}">'
     f'<div class="scrim"></div><div class="lbl">{band[2]}</div></div>' if band else ''}
  </div></div>
  <div class="folio"><span>{esc(cfg['h1'])}</span><span class="n nums">{folio:02d}</span></div>
</section>"""


def page_layouts(p, cfg, folio, title, sub, items, wide, lede, note, band=None):
    """One page of standard internal layouts for one size of expandable home."""
    tiles = "".join(
        f'<div class="l"><img src="{src}" alt="{esc(label)} layout"><div class="n">{esc(label)}</div></div>'
        for label, src in items)
    return f"""
<section class="page grain">
  <div class="flow pad head"><div class="flow-inner">
    <div class="eyebrow">Layouts</div>
    <h2 class="display">{title}</h2>
    <hr class="rule-clay" style="margin-top:5mm">
    <p class="lede" style="margin-top:6mm;max-width:158mm">{lede}</p>
    <div style="margin-top:6mm"><div class="eyebrow">{sub}</div>
      <hr class="rule" style="margin:3mm 0 5mm">
      <div class="{'layouts wide' if wide else 'layouts'}">{tiles}</div>
    </div>
    <div class="grow" style="min-height:5mm"></div>
    <div class="note">{note}</div>
    {f'<div class="band" style="height:46mm;margin-top:6mm"><img src="{band[0]}" alt="{esc(band[1])}">'
     f'<div class="scrim"></div><div class="lbl">{band[2]}</div></div>' if band else ''}
  </div></div>
  <div class="folio"><span>{esc(cfg['h1'])}</span><span class="n nums">{folio:02d}</span></div>
</section>"""


def page_steps(p, cfg, im, folio, band=None):
    """The X-Fold's unfold sequence: the thing people ask about before anything else."""
    steps = [
        ("Offload", "We arrange the crane or forklift, quoted with your delivery. It lifts the flat-packed unit onto your level slab or precast plinths."),
        ("Unfold", "Two workers swing the hinged wall and roof panels up and out. No specialist crew and no on-site build."),
        ("Secure", "The steel frame locks square and weather-tight, with its steel door and two windows already fitted."),
        ("Connect", "Connect the power. Two plug points, a light fitting and a small DB board arrive wired and ready."),
    ]
    cells = "".join(
        f'<div class="o"><div class="k nums">{i + 1:02d}</div><h3>{t}</h3><p>{b}</p></div>'
        for i, (t, b) in enumerate(steps))
    return f"""
<section class="page grain">
  <div class="flow pad head"><div class="flow-inner">
    <div class="eyebrow">How it works</div>
    <h2 class="display">Flat on a truck, a room in minutes</h2>
    <hr class="rule-clay" style="margin-top:5mm">
    <p class="lede" style="margin-top:6mm;max-width:158mm">
      Each unit arrives flat on a truck and unfolds into a weather-tight 15&nbsp;m&sup2; home. Walls,
      windows, door and electrics are already installed, so the room is finished the day it lands rather
      than a fortnight later.
    </p>
    <div class="cols" style="margin-top:7mm">
      <div style="flex:0 0 86mm">
        <div class="figure" style="height:56mm;display:flex;align-items:center">
          <img src="{im['fold']}" alt="X-Fold shown half folded" style="max-height:100%;object-fit:contain">
        </div>
        <div class="cap">Hinged wall panels open in an X. The unit ships as a flat deck and squares up into a full-height room.</div>
      </div>
      <div style="flex:1">
        <div class="figure" style="height:56mm;display:flex;align-items:center">
          <img src="{im['folddiag']}" alt="Assembled, flat-packed and stacked states" style="max-height:100%;object-fit:contain">
        </div>
        <div class="cap">Assembled, flat-packed for transport, and stacked two high: the same unit in all three states.</div>
      </div>
    </div>
    <div style="margin-top:7mm">
      <div class="eyebrow">Four steps, two workers</div>
      <hr class="rule" style="margin:3mm 0 5mm">
      <div class="order">{cells}</div>
    </div>
    <div class="grow" style="min-height:6mm"></div>
    <div class="note">
      <strong>Two units on one truck, and back down again.</strong> The X-Fold stacks two high and folds
      back to a flat deck, so it can be moved to the next site rather than written off with the project.
    </div>
    {f'<div class="band" style="height:50mm;margin-top:6mm"><img src="{band[0]}" alt="{esc(band[1])}">'
     f'<div class="scrim"></div><div class="lbl">{band[2]}</div></div>' if band else ''}
  </div></div>
  <div class="folio"><span>{esc(cfg['h1'])}</span><span class="n nums">{folio:02d}</span></div>
</section>"""


def variants_table(p):
    if not p.get("variants"):
        return ""
    rows = ""
    for v in p["variants"]:
        rows += (f'<tr><td><div class="name">{esc(v["name"])}</div>'
                 f'<div class="desc">{m2(esc(sentences(v["description"], 130)))}</div></td>'
                 f'<td><span class="sz nums">{m2(v["size"])}</span></td>'
                 f'<td><span class="amt nums">{rands(v["price"])}</span></td></tr>')
    return f"""
    <div class="eyebrow" style="margin-top:8mm">Sizes &amp; prices</div>
    <table class="up" style="margin-top:3.5mm">
      <tr><th>Model</th><th style="text-align:left;width:20mm">Size</th><th>Price ex VAT</th></tr>
      {rows}
    </table>"""


def merge_options(opts):
    """The catalogue splits some extras into size-banded rows that carry the
    same label (under-floor heating at two prices, say). Printing both looks
    like a mistake, so they collapse into one row with a price range."""
    out = []
    for o in opts:
        if out and out[-1]["label"] == o["label"]:
            out[-1]["_group"].append(o)
        else:
            d = dict(o)
            d["_group"] = [o]
            out.append(d)
    return out


def group_price(o):
    prices = [x.get("price") or 0 for x in o["_group"] if not x.get("pricePerM2")]
    if len(o["_group"]) > 1 and len(set(prices)) > 1:
        return rands(min(prices)) + " – " + rands(max(prices))
    return opt_price(o)


def _opt_rows(opts, sizes=None, context_ids=None):
    """
    Rows for the extras table.

    `context_ids` is the set of models this block is about; an availability
    line is printed only when the extra is offered on some of them but not
    all. Inside a range's own block every extra is available on every model
    listed, and repeating that on each row is noise.
    """
    rows = ""
    for o in merge_options(opts):
        avail = ""
        if sizes:
            group_ids = set()
            for x in o["_group"]:
                if not x.get("availableVariantIds"):
                    group_ids = None
                    break
                group_ids |= set(x["availableVariantIds"])
            scope = set(context_ids) if context_ids else set(sizes)
            if group_ids and group_ids & scope != scope:
                names = [sizes[i] for i in sorted(group_ids & scope, key=list(sizes).index)]
                avail = f'<div class="desc" style="color:var(--moss)">On the {", ".join(names)} only.</div>'
        rows += (f'<tr><td><div class="name">{esc(o["label"])}</div>'
                 f'<div class="desc">{m2(esc(sentences(o["description"], 160)))}</div>{avail}</td>'
                 f'<td><span class="amt nums">{group_price(o)}</span></td></tr>')
    return rows


def options_table(p, cfg=None, heading="Optional extras"):
    if not p["options"]:
        return ""
    sizes = {v["id"]: v["name"] for v in (p.get("variants") or [])}
    groups = (cfg or {}).get("option_groups")
    if groups:
        by_id = {o["id"]: o for o in p["options"]}
        body = ""
        for title, ids in groups:
            picked = [by_id[i] for i in ids if i in by_id]
            if not picked:
                continue
            body += (f'<tr><td colspan="2" style="padding:4mm 0 1.5mm;border-bottom:0;text-align:left">'
                     f'<div class="eyebrow">{title}</div></td></tr>')
            # Everything in a range's block is offered across that range, so the
            # models this block covers are the context for "on the X only".
            context = set()
            for o in picked:
                context |= set(o.get("availableVariantIds") or sizes)
            body += _opt_rows(picked, sizes, context)
        rows = body
    else:
        rows = _opt_rows(p["options"], sizes)
    return f"""
    <div class="eyebrow">{heading}</div>
    <table class="up" style="margin-top:3.5mm">
      <tr><th>Extra</th><th>Price ex VAT</th></tr>
      {rows}
    </table>"""


def scope_block(p):
    """Included / quoted separately / arranged by you, in three columns."""
    s = {**SCOPE_DEFAULT, **SCOPE.get(p["slug"], {})}
    heads = [("In the price", "in", "var(--moss)"),
             ("Quoted separately", "sep", "var(--clay)"),
             ("Arranged by you", "you", "var(--stone)")]
    cols = ""
    for title, key, colour in heads:
        items = "".join(f"<li>{m2(esc(i))}</li>" for i in s[key])
        cols += (f'<div class="sc"><div class="k" style="color:{colour}">{title}</div>'
                 f'<ul>{items}</ul></div>')
    return f'<div class="scope">{cols}</div>'


def page_spec(p, cfg, im, folio, with_options, with_variants=True):
    rows = "".join(f'<div class="row"><div class="k">{esc(s["label"])}</div>'
                   f'<div class="v">{m2(esc(s["value"]))}</div></div>' for s in p["specs"])
    d = p["dims"]
    if cfg.get("dims_html"):
        # Products whose dimensions do not reduce to one external box: safari
        # tents (built to brief, zero dims in the catalogue), garages (two
        # footprints) and outdoor kitchens (four lengths, one section).
        a, al, b, bl, note = cfg["dims_html"]
    else:
        a, al = m2(p["sizeLabel"]), cfg.get("dims_label", "Size")
        b = f"{d['length']} &times; {d['width']} &times; {d['height']} m"
        bl = cfg.get("dims_ext_label", "External length &times; width &times; height")
        note = cfg.get("dims_note", "Setup: " + p["setupTime"])
    dims = f"""
    <div class="dims">
      <div><div class="big nums">{a}</div><div class="sm" style="margin-top:1mm">{al}</div></div>
      <div class="divider"></div>
      <div><div class="big nums">{b}</div><div class="sm" style="margin-top:1mm">{bl}</div></div>
      <div class="divider"></div>
      <div><div class="sm" style="max-width:44mm">{note}</div></div>
    </div>"""
    return f"""
<section class="page grain">
  <div class="flow pad head"><div class="flow-inner">
    <div class="eyebrow">Specification</div>
    <h2 class="display">{cfg.get('h2_spec','The full spec')}</h2>
    <hr class="rule-clay" style="margin-top:5mm">
    <div style="margin-top:6mm">{dims}</div>
    <div class="spec" style="margin-top:7mm">{rows}</div>
    {variants_table(p) if with_variants else ''}
    {'<div style="margin-top:8mm">' + options_table(p, cfg) + '</div>' if with_options else ''}
    <div style="margin-top:8mm">
      <div class="eyebrow">What the price covers</div>
      <hr class="rule" style="margin:3mm 0 4mm">
      {scope_block(p)}
    </div>
    <div class="grow" style="min-height:6mm"></div>
    <div class="note">{cfg['note']}</div>
  </div></div>
  <div class="folio"><span>{esc(cfg['h1'])}</span><span class="n nums">{folio:02d}</span></div>
</section>"""


def page_options(p, cfg, folio):
    return f"""
<section class="page grain">
  <div class="flow pad head"><div class="flow-inner">
    <div class="eyebrow">Make it yours</div>
    <h2 class="display">{cfg.get('h2_options','Optional extras')}</h2>
    <hr class="rule-clay" style="margin-top:5mm">
    <p class="lede" style="margin-top:6mm;max-width:152mm">{cfg['options_lede']}</p>
    <div style="margin-top:7mm">{options_table(p, cfg, heading="The list")}</div>
    <div class="note" style="margin-top:6mm">{cfg['options_note']}</div>
  </div></div>
  <div class="folio"><span>{esc(cfg['h1'])}</span><span class="n nums">{folio:02d}</span></div>
</section>"""


def page_gallery(p, cfg, im, folio):
    """More of the product than one hero shot: five photographs, captioned."""
    g = im["gallery"]
    grid = "".join(
        f'<div class="g"><img src="{src}" alt="{esc(alt)}"><div class="cap">{cap}</div></div>'
        for src, alt, cap in g[1:])
    lead_src, lead_alt, lead_cap = g[0]
    return f"""
<section class="page grain">
  <div class="flow pad head"><div class="flow-inner">
    <div class="eyebrow">In pictures</div>
    <h2 class="display">A closer look</h2>
    <hr class="rule-clay" style="margin-top:5mm">
    <div style="margin-top:6mm">
      <img class="gal-wide" src="{lead_src}" alt="{esc(lead_alt)}">
      <div class="cap">{lead_cap}</div>
    </div>
    <div class="gal-grid" style="margin-top:6mm">{grid}</div>
    <div class="grow" style="min-height:5mm"></div>
    <div class="note" style="font-size:7.8pt">
      Photography shows units in the standard finishes and typical settings. Finishes, colours and
      furniture vary by order; what is included in your price is the specification and options list in
      this brochure, confirmed on your written quotation.
    </div>
  </div></div>
  <div class="folio"><span>{esc(cfg['h1'])}</span><span class="n nums">{folio:02d}</span></div>
</section>"""


def page_uses(p, cfg, im, folio):
    uses = ""
    for u in p["useCases"]:
        body = sentences(u["body"], 125)
        uses += (f'<div class="u"><h3>{esc(u["title"])}</h3>'
                 f'<p>{m2(esc(body))}</p></div>')
    setup = cfg.get("order_setup", p["setupTime"])
    return f"""
<section class="page grain">
  <div class="flow pad head"><div class="flow-inner">
    <div class="eyebrow">Where it works</div>
    <h2 class="display">{cfg['h2_uses']}</h2>
    <hr class="rule-clay" style="margin-top:5mm">

    <div class="uses" style="margin-top:6mm">{uses}</div>

    <div class="band" style="height:38mm;margin-top:7mm">
      <img src="{im['band4']}" alt="{esc(cfg['alt_band4'])}">
      <div class="scrim"></div>
      <div class="lbl">{cfg['band4_cap']}</div>
    </div>

    <div class="grow" style="min-height:7mm"></div>
    <div>
      <div class="eyebrow">Ordering</div>
      <hr class="rule" style="margin:3mm 0 4.5mm">
      <div class="order">
        <div class="o"><div class="k nums">01</div><h3>Secure with a deposit</h3>
          <p>Confirm your order with a deposit and we get to work. Finance and lay-bye options are
             available, subject to credit approval.</p></div>
        <div class="o"><div class="k nums">02</div><h3>{cfg.get('order2_title', 'Delivered in &plusmn;90 days')}</h3>
          <p>{cfg.get('order2_body', 'From deposit to delivered on site is around 90 days for most orders.')}</p></div>
        <div class="o"><div class="k nums">03</div><h3>Delivered nationwide</h3>
          <p>From Centurion, Gauteng, anywhere in South Africa. Delivery is quoted separately on your
             location and site access.</p></div>
        <div class="o"><div class="k nums">04</div><h3>{cfg.get('order4_title','Installed on site')}</h3>
          <p>{cfg.get('order4_body', setup + ' In Gauteng, our turnkey team can prepare the groundwork while your unit is being built.')}</p></div>
      </div>
    </div>
  </div></div>
  <div class="folio"><span>{esc(cfg['h1'])}</span><span class="n nums">{folio:02d}</span></div>
</section>"""


def page_faq(p, cfg, im, folio):
    """The questions that would otherwise be a phone call, plus the contact panel."""
    quick = "".join(
        f'<div class="q"><div class="k">{k}</div><div class="v">{v}</div><p>{b}</p></div>'
        for k, v, b in QUICK)
    faqs = "".join(
        f'<div class="q"><h3>{m2(esc(f["q"]))}</h3><p>{m2(esc(f["a"]))}</p></div>'
        for f in p["faqs"])
    return f"""
<section class="page grain">
  <div class="flow pad head"><div class="flow-inner">
    <div class="eyebrow">Before you ask</div>
    <h2 class="display">Everything else, answered</h2>
    <hr class="rule-clay" style="margin-top:5mm">
    <div class="quick" style="margin-top:6mm">{quick}</div>
    <div class="faq" style="margin-top:7mm">{faqs}</div>
  </div></div>

  <div class="contact">
    <div class="top">
      <div>
        <div class="eyebrow on-dark">Speak to us</div>
        <h2 class="display" style="margin-top:2.5mm">Ready when you are.</h2>
        <p class="sell">{cfg.get('contact_sell', 'Visit the showroom in Centurion to see the range, or send us your site details and we will come back with a written quotation.')}</p>
      </div>
      <img class="logo" src="{im['logo_white']}" alt="Tiny Homes SA">
    </div>
    <div class="grid">
      <div class="c"><div class="k">Call or WhatsApp</div><div class="v nums">{SITE['phoneDisplay']}</div></div>
      <div class="c"><div class="k">Email</div><div class="v">{SITE['email']}</div></div>
      <div class="c wide"><div class="k">Showroom</div>
        <div class="v">{SITE['address']['streetAddress']}, {SITE['address']['locality']}<br>
          {SITE['address']['city']}, {SITE['address']['region']}</div></div>
      <div class="qr"><div class="box">{qr_svg(quote_url(p['slug']), 20, dark='#1c1b17')}</div>
        <div class="k">Scan to get a<br>written quote</div></div>
    </div>
    <div class="fine">{cfg['fine']}</div>
  </div>
</section>"""


# -------------------------------------------------------------------- build
def build(slug):
    p = PRODUCTS[slug]
    cfg = dict(CONFIG[slug])
    cfg.update(EXTRA[slug])
    if cfg.get("spec_image"):
        cfg["images"] = dict(cfg["images"], spec=cfg["spec_image"])

    # alt text comes from the site's own image manifest, so the brochure
    # describes the photographs exactly as the website does.
    for key, name in cfg["images"].items():
        cfg["alt_" + key] = img_by_name(slug, name)["alt"]

    im = {}
    widths = {"cover": 1600, "feature": 1000, "band2": 1400, "band4": 1400, "spec": 1400}
    for key, name in cfg["images"].items():
        im[key] = datauri(prep(slug, name, f"{key}.jpg", widths[key]))
    im["logo_white"] = datauri(BASE / "img/logo-white.png")

    im["gallery"] = []
    for i, (name, cap) in enumerate(cfg.get("gallery") or []):
        meta = img_by_name(slug, name)
        im["gallery"].append(
            (datauri(prep(slug, name, f"gal{i}.jpg", 1200 if i == 0 else 820)), meta["alt"], cap))

    pages = [cover(p, cfg, im), page_product(p, cfg, im, 2)]
    n = 3

    if slug == "folding-homes":
        im["fold"] = datauri(prep(slug, "folding-mechanism.png", "fold.png", 1100))
        im["folddiag"] = datauri(prep(slug, "unfold-mechanism-diagram.jpg", "folddiag.jpg", 1000))
        pages.append(page_steps(p, cfg, im, n, band=band_img(
            slug, "exterior-forest-render.jpg",
            "The unit arrives finished: steel door, windows, insulation and electrics already fitted."))); n += 1
        pages.append(page_plan(p, cfg, n, band=band_img(
            slug, "exterior-timber-door.jpg",
            "Wood-grain walls with a black frame, one of four standard finishes."))); n += 1
    elif slug == "nature-cabins":
        pages.append(page_plan(p, cfg, n, band=band_img(
            slug, "exterior-two-cabins.jpg",
            "Repeated as guest suites: each cabin is self-contained, with its own bathroom and kitchen."))); n += 1
    elif slug == "apple-cabins":
        pages.append(page_models(p, cfg, n)); n += 1
    elif slug == "glamping-capsules":
        for title, sub, ids, lede in cfg["size_groups"]:
            pages.append(page_models(p, cfg, n, variant_ids=ids, heading=title,
                                     eyebrow="Sizes & floor plans", lede=lede,
                                     note_key="sizes_note" if ids[0].startswith("space") else "sizes_note_core"))
            n += 1
    elif slug == "expandable-homes":
        sheet = datauri(prep(slug, "catalog-sizes.png", "sizes.png", 900))
        pages.append(page_sizes_table(
            p, cfg, im, n, extra_img=sheet,
            extra_cap=("The manufacturer's dimension sheet: each home travels as the compact module on the "
                       "left and opens to the expanded footprint on the right. Transport width is what "
                       "matters for site access; the expanded figure is what you live in.")))
        n += 1
        layout_pages = [
            ("default", "6m layouts &middot; 37 m&sup2;", "Eight standard arrangements, from open plan to four bedrooms",
             cfg["layouts_lede"]),
            ("b40", "12m layouts &middot; 74 m&sup2;", "Seven standard arrangements, including laundry, walk-in-wardrobe and office variants",
             "The 12m home is 12 &times; 6.3 m expanded, and takes the widest choice of layouts in the range. "
             "Two bedrooms are standard; three and four-bedroom arrangements, a laundry, a walk-in wardrobe "
             "and an office are all standard options at no change to the price."),
        ]
        for key, title, sub, lede in layout_pages:
            sheets = LAYOUT_PLANS["expandable-homes"][key]
            items = [(sh["label"],
                      datauri(prep_file(SITE_IMG / sh["src"].replace("/images/", "", 1),
                                        f"{slug}/lay-{pathlib.Path(sh['src']).stem}.png", 620, sh["width"])))
                     for sh in sheets]
            wide = sheets[0]["width"] / sheets[0]["height"] > 1.4
            band = None
            if key == "b40":
                band = (datauri(prep(slug, "interior-lounge.jpg", "laybands.jpg", 1300)),
                        img_by_name(slug, "interior-lounge.jpg")["alt"],
                        "Whichever layout you choose, the finish is the same: vinyl flooring, insulated "
                        "walls and double-glazed windows throughout.")
            pages.append(page_layouts(p, cfg, n, title, sub, items, wide, lede,
                                      "<strong>Every layout is the same price.</strong> The arrangement is "
                                      "chosen when you order, and window and door placement is yours. "
                                      "Non-standard layouts are quoted on request.", band))
            n += 1
    elif slug == "outdoor-kitchens":
        ladder = planlib.size_ladder_svg(cfg["ladder"], width=860, height=200)
        pages.append(page_sizes_table(p, cfg, im, n, ladder_svg=ladder, band=band_img(
            slug, "fire-pit-evening.jpg",
            "Whichever length you choose, the specification is the same: quartz counter, sink, "
            "lighting and the motorised roof."))); n += 1

    split_options = len(p["options"]) > 6
    # The sizes pages already carry every model and price, so the spec page only
    # repeats the variants table for products that never got one.
    has_sizes_page = bool(p.get("variants"))
    pages.append(page_spec(p, cfg, im, n, with_options=bool(p["options"]) and not split_options,
                           with_variants=not has_sizes_page))
    n += 1
    if split_options:
        pages.append(page_options(p, cfg, n)); n += 1
    if im["gallery"]:
        pages.append(page_gallery(p, cfg, im, n)); n += 1
    pages.append(page_uses(p, cfg, im, n)); n += 1
    pages.append(page_faq(p, cfg, im, n))

    css = (CSS.replace("__FRAUNCES__", b64(BASE / "font/fraunces.woff2"))
              .replace("__INTER__", b64(BASE / "font/inter.woff2")))
    doc = f"""<!DOCTYPE html>
<html lang="en-ZA"><head><meta charset="utf-8">
<title>{esc(cfg['h1'])} | Tiny Homes SA</title>
<meta name="description" content="{esc(p['summary'][:180])}">
<style>{css}</style></head><body>
{''.join(pages)}
<script>{FIT_JS}</script>
</body></html>"""

    out = BASE / "out" / f"{slug}.html"
    out.parent.mkdir(exist_ok=True)
    out.write_text(doc)
    return out, len(pages)


def render(html_path, pdf_path, title, subject):
    subprocess.run([CHROME, "--headless", "--disable-gpu", "--no-pdf-header-footer",
                    "--run-all-compositor-stages-before-draw", "--virtual-time-budget=20000",
                    f"--print-to-pdf={pdf_path}", f"file://{html_path}"],
                   check=True, capture_output=True)
    import fitz
    d = fitz.open(pdf_path)
    d.set_metadata({"title": title, "author": "Tiny Homes SA", "subject": subject,
                    "creator": "Tiny Homes SA"})
    tmp = str(pdf_path) + ".tmp"
    d.save(tmp, garbage=4, deflate=True, clean=True)
    d.close()
    pathlib.Path(tmp).replace(pdf_path)


def fit_report(html_path):
    r = subprocess.run([CHROME, "--headless", "--disable-gpu", "--virtual-time-budget=20000",
                        "--dump-dom", f"file://{html_path}"], capture_output=True, text=True)
    m = re.search(r'data-fit="([^"]+)"', r.stdout)
    return json.loads(html.unescape(m.group(1))) if m else None


if __name__ == "__main__":
    only = sys.argv[1:] or ORDER
    for slug in only:
        htmlp, npages = build(slug)
        fits = fit_report(htmlp)
        pdfp = BASE / "out" / f"{slug}.pdf"
        p = PRODUCTS[slug]
        render(htmlp, pdfp, f"{CONFIG[slug]['h1']} | Tiny Homes SA", p["summary"][:200])
        size = pdfp.stat().st_size / 1e6
        flag = ""
        if fits and min(fits) < 0.88:
            flag = f"  <-- TIGHT (min {min(fits)})"
        print(f"{slug:<20} {npages} pages  {size:5.2f} MB  fit={fits}{flag}")
