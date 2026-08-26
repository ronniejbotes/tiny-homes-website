#!/usr/bin/env python3
"""
Tiny Homes SA full-range brochure.

Builds one A4 catalogue covering the whole range, in two editions:

  priced    every "from" figure shown, as published on the site
  no-prices no rand figure anywhere, for quoting at negotiated rates

Every size of every product is listed, not just the cheapest one: each product
page carries its own model table, a full index lists every model in the range on
one page, and the products with manufacturer floor plans get a page of them. The
point is that a reader can decide, and ask for a quotation, without phoning to
find out what the other sizes cost.

The no-prices edition is not the priced one with the numbers hidden: prices are
never composed into it, the price columns, price strips and the quote QR codes
(which would open a page showing the published price) are absent rather than
blanked, and a checker asserts no currency figure survives anywhere in the PDF.

Shares CSS, fonts, helpers and the auto-fit pass with gen.py so the range
brochure and the seven single-product brochures are one visual family.
"""
import pathlib, re, subprocess, sys

import gen
import plan as planlib
from gen import (BASE, CHROME, CSS, EXTRA, FIT_JS, IMAGES, LAYOUT_PLANS, PRODUCTS, SITE, SITE_IMG,
                 b64, datauri, dims_clause as dims_of, esc, img_by_name, m2, plan_rooms, prep,
                 prep_file, qr_svg, quote_url, rands, render, sentences, svg_scoped)

# Order the range is presented in: cheapest and simplest first, building to the
# flagship, with the two non-home lines last.
ORDER = ["folding-homes", "expandable-homes", "apple-cabins", "nature-cabins",
         "glamping-capsules", "outdoor-kitchens", "safari-tents"]

# Products that carry a page of floor plans or layouts after their own page.
PLAN_PAGE_COUNT = {"expandable-homes": 1, "apple-cabins": 1, "glamping-capsules": 2}

COVER_IMAGE = ("nature-cabins", "exterior-timber-render.jpg")
WHY_BAND = ("expandable-homes", "scenic-winelands.jpg")
ORDER_BAND = ("folding-homes", "exterior-timber-door.jpg")
BACK_BAND = ("glamping-capsules", "exterior-night-pool.jpg")

# Per-product page content. Blurbs are written price-free from the start so the
# no-prices edition never needs prose surgery.
PAGES = {
    "folding-homes": {
        "name": "X-Fold",
        "eyebrow": "Folding homes",
        "image": "exterior-forest-render.jpg",
        "blurb": ("Flips from flat-pack to a fully enclosed, EPS-insulated 15 m&sup2; room in minutes: "
                  "two workers, four steps. Upgraded floor beams, insulated panels and a basic electrical "
                  "setup come standard. It arrives wired for electricity, ready for plumbing to be added "
                  "locally, and folds back down when the site moves."),
        "facts": [("15 m&sup2;", "Floor area"), ("Minutes", "To unfold"),
                  ("2 high", "Stackable"), ("Steel", "Frame")],
        "ticks": ["Upgraded floor beams for added support",
                  "EPS insulation: warmer in winter, cooler in summer",
                  "Two plug points, a light fitting and a small DB board",
                  "Relocatable: fold it back down and move it"],
        "best": "Site offices, staff accommodation, garden rooms, guest suites, secure storerooms and rapid-deployment housing.",
    },
    "expandable-homes": {
        "name": "Expandable Homes",
        "eyebrow": "Expandable homes",
        "image": "brochure-hero.jpg",
        "blurb": ("A granny flat, family home or office that arrives as one compact module and expands on "
                  "site into as much as 74 m&sup2; of living space. Bedrooms, a fitted bathroom and a kitchen "
                  "are built in at the factory, with 75 mm EPS insulated walls, vinyl flooring and "
                  "double-glazed windows standard on every size."),
        "facts": [("18 – 74 m&sup2;", "Floor area"), ("Hours", "To expand"),
                  ("Up to 4", "Bedrooms"), ("107", "Exterior finishes")],
        "ticks": ["Bathroom and kitchen included on every size",
                  "Full stainless-steel kitchen in the 6m and 12m models",
                  "Layouts from open-plan to four bedrooms",
                  "Window and door placement of your choice"],
        "best": "Granny flats, family homes, farm cottages, staff and student accommodation, site offices and clinics.",
    },
    "apple-cabins": {
        "name": "Apple Cabins",
        "eyebrow": "Apple cabins",
        "image": "hero-pod-fynbos.jpg",
        "blurb": ("Futuristic architecture wrapped in curved, floor-to-ceiling panoramic glass. Luxurious "
                  "bathroom fittings come in all three sizes, with a kitchenette in the 9 m and 11.8 m "
                  "cabins, plus smart-lock entry and integrated lighting and plumbing. Each cabin arrives "
                  "fully assembled and is ready for occupation within hours."),
        "facts": [("13 – 26.5 m&sup2;", "Floor area"), ("Hours", "To install"),
                  ("3 sizes", "To choose from"), ("Smart-lock", "Entry")],
        "ticks": ["Floor-to-ceiling panoramic glass with double glazing",
                  "Luxurious bathroom fittings in all three sizes",
                  "Premium interior finishes with curtain tracks",
                  "Insulated, low-maintenance build"],
        "best": "Eco-resorts, glamping pods, short-stay rentals, vineyard suites and backyard guest rooms.",
    },
    "nature-cabins": {
        "name": "Nature Cabins",
        "eyebrow": "Nature cabins",
        "image": "exterior-timber-cabin-deck.jpg",
        "blurb": ("A 21 m&sup2; cabin with a 1.5 &times; 3.2 m viewing terrace, 26 m&sup2; in total, that drops "
                  "lightly into beach, bush or mountain sites. Nothing is left on the options list: polyurethane-insulated walls, "
                  "double glazing, a fitted bathroom, a kitchen with a stone countertop, Midea air "
                  "conditioning and a storage geyser are all standard."),
        "facts": [("21 m&sup2;", "Plus terrace"), ("Fully built", "On arrival"),
                  ("Included", "Kitchen &amp; bath"), ("Aircon", "As standard")],
        "ticks": ["Warm timber look with steel durability",
                  "Kitchen with stone countertop and induction cooker",
                  "Fully fitted bathroom and a storage water heater",
                  "1.5 &times; 3.2 m viewing terrace"],
        "best": "Airbnb and self-catering units, guest farms, bush retreats, coastal getaways and lodge suites.",
    },
    "glamping-capsules": {
        "name": "Glamping Capsules",
        "eyebrow": "Glamping capsules",
        "image": "exterior-forest-1.jpg",
        "blurb": ("The flagship of the range: rooms sit either side of the bathroom, each wrapped in 270&deg; "
                  "oversized floor-to-ceiling double glazing and roomy enough for a queen bed and a lounge "
                  "area. Choose the core range or the more premium Space range, which carries a far wider "
                  "options list. Both arrive fully built, with no on-site construction."),
        "facts": [("18.6 – 38 m&sup2;", "Floor area"), ("270&deg;", "Panoramic glazing"),
                  ("6 models", "Across two ranges"), ("Fully built", "On arrival")],
        "ticks": ["Bathroom with premium fittings and a geyser as standard",
                  "Multi-layer thermal insulation throughout",
                  "Intelligent front-door access",
                  "Optional balcony on the larger models"],
        "best": "Luxury lodge suites, glamping businesses, wine estates, coastal retreats and honeymoon suites.",
    },
    "outdoor-kitchens": {
        "name": "Outdoor Kitchens",
        "eyebrow": "Outdoor kitchens",
        "image": "party-braai-dusk.jpg",
        "blurb": ("Press the remote and the motorised roof lifts to reveal a complete entertainment kitchen: "
                  "a quartz stone countertop with a water-barrier edge, a stainless-steel sink with pull-out "
                  "faucet and recessed lighting with an adjustable LED strip. Corrosion-resistant galvanised "
                  "steel and aluminium alloy, built to live outdoors year-round."),
        "facts": [("2.5 – 3.9 m", "Four lengths"), ("Motorised", "Lift-up roof"),
                  ("Quartz", "Stone countertop"), ("Ready", "To use on arrival")],
        "ticks": ["Remote-controlled motorised lift-up roof",
                  "Stainless-steel sink with plumbing and electrics embedded",
                  "Aluminium honeycomb panels: heat resistant, wipe clean",
                  "Add a gas grill, induction stove, bar fridge or extractor"],
        "best": "Braai areas, patios, pool decks, lodges and guest farms, developer amenities and garden bars.",
    },
    "safari-tents": {
        "name": "Safari Tents",
        "eyebrow": "Luxury safari tents",
        "image": "hero-single-suite-sunset.jpg",
        "blurb": ("Luxury canvas tented suites for game lodges and glamping resorts. Meru-style and curved "
                  "stretch-tension canvas roofs over timber structures, with raised decks and en-suite "
                  "layouts available. Because no two sites or briefs are the same, every tent is configured "
                  "to your site, layout and guest experience."),
        "facts": [("Custom", "Sizes to brief"), ("Canvas", "Meru &amp; stretch"),
                  ("En-suite", "Layouts available"), ("Africa", "Engineered for")],
        "ticks": ["Meru-style and curved stretch-tension roof designs",
                  "Timber structures with raised decks for views and airflow",
                  "En-suite layouts for full lodge-suite comfort",
                  "Configured to your site, brief and guest experience"],
        "best": "Game lodge suites, glamping resorts, private reserves, bush camps, boutique hotels and event venues.",
    },
}

WHY = [
    ("Off-grid &amp; solar ready", "Specified for solar and battery systems where the site has no grid connection."),
    ("Rapid deployment", "Factory-built and delivered finished, so a home is standing in hours or days, not months."),
    ("A relocatable asset", "Several lines fold down or lift out, so the building moves when the operation does."),
    ("Backed for the long haul", "A 1-year limited guarantee on every product, with full after-sales support."),
    ("Sustainable steel construction", "Steel frames and insulated panels, with far less site waste than a conventional build."),
    ("Engineered for South Africa", "Insulation, glazing and finishes specified for local heat, cold and coastal exposure."),
]

EXTRA_CSS = """
.rng{width:100%;border-collapse:collapse}
.rng th{text-align:left;font-size:6.9pt;font-weight:600;letter-spacing:.13em;text-transform:uppercase;
  color:var(--stone);padding-bottom:2.6mm;border-bottom:1px solid var(--border)}
.rng td{padding:3.6mm 4mm 3.6mm 0;border-bottom:1px solid var(--border);vertical-align:middle;font-size:8.6pt}
.rng th{padding-right:4mm}
.rng td:last-child,.rng th:last-child{padding-right:0}
/* Fixed widths: the size and setup values are long enough to collide with the
   next column if the browser is left to distribute the width itself. */
.rng{table-layout:fixed}
.rng col.c-th{width:26mm} .rng col.c-sz{width:26mm}
.rng col.c-set{width:34mm} .rng col.c-amt{width:26mm}
.rng td.th{padding-right:5mm}
.rng td.th img{width:21mm;height:15mm;object-fit:cover;display:block;border-radius:2px}
.rng .nm{font-family:'Fraunces',serif;font-variation-settings:"SOFT" 40,"opsz" 120;font-weight:600;
  font-size:12pt;color:var(--forest);letter-spacing:-.01em}
.rng .sub{font-size:7.6pt;color:var(--stone);margin-top:.6mm}
.rng .val{color:var(--ink)}
.rng .amt{font-family:'Fraunces',serif;font-variation-settings:"SOFT" 40,"opsz" 120;font-weight:600;
  font-size:11.5pt;color:var(--forest);white-space:nowrap;text-align:right}
.rng .por{font-size:8pt;color:var(--stone);white-space:nowrap;text-align:right}
.rng th.r{text-align:right}

.why{column-count:2;column-gap:9mm}
.why .w{break-inside:avoid;padding:3mm 0;border-top:1px solid var(--border)}
.why h3{font-size:9.4pt;color:var(--forest)}
.why p{font-size:8.1pt;line-height:1.45;margin-top:.7mm}

.facts{display:flex;border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
.facts .f{flex:1;padding:4.5mm 1mm;text-align:center;border-right:1px solid var(--border)}
.facts .f:last-child{border-right:0}
.facts .v{font-family:'Fraunces',serif;font-variation-settings:"SOFT" 40,"opsz" 120;font-weight:600;
  font-size:13pt;color:var(--forest);letter-spacing:-.02em;line-height:1.1}
.facts .v.sm{font-size:10.5pt}
.facts .l{font-size:6.5pt;font-weight:500;letter-spacing:.11em;text-transform:uppercase;
  color:var(--stone);margin-top:1.4mm}

.pricestrip{display:flex;align-items:baseline;justify-content:space-between;gap:6mm;
  border-top:2.4px solid var(--clay);background:var(--parchment);padding:4mm 6mm}
.pricestrip .lab{font-size:7.2pt;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--stone)}
.pricestrip .amt{font-family:'Fraunces',serif;font-variation-settings:"SOFT" 40,"opsz" 144;font-weight:600;
  font-size:19pt;color:var(--forest);letter-spacing:-.02em}
.pricestrip .vat{font-size:7.4pt;color:var(--stone)}

.bestfor{border-left:2.4px solid var(--moss);padding:2.5mm 0 2.5mm 5mm;font-size:8.4pt;line-height:1.45}
.bestfor .k{font-size:6.9pt;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--moss)}
.bestfor p{margin-top:1mm;color:var(--ink)}

/* Back-cover image: grows to take whatever height is left above the contact
   panel, so the page closes on a photograph rather than a void. */
.flow-inner > .fill{flex:1 1 auto;min-height:60mm}

/* index and per-product model tables: three or four columns, not the two the
   base .up table assumes */
.up.models th:last-child,.up.models td:last-child{text-align:inherit}
.up.models th{white-space:nowrap}
.up.models td{padding:2.3mm 0;vertical-align:baseline}
.up.models td .name{font-weight:600}
.up.models .sz{color:var(--stone)}
.up.models .amt{font-size:11pt}
.up.models .por{font-size:8pt;color:var(--stone);white-space:nowrap}
.up.models.fixed{table-layout:fixed}
.up.models.fixed td{vertical-align:top}

/* the model index: two balanced columns of small tables */
.idx-cols{display:flex;gap:10mm}
.idx-cols > div{flex:1;min-width:0}
.idxgroup{margin-bottom:5mm}
.idxgroup .up.models{margin-top:2mm}
.idxgroup .up.models th{font-size:6.4pt;padding-bottom:1.6mm}
.idxgroup .up.models td{padding:1.9mm 0;font-size:8.2pt}
.idxgroup .up.models .amt{font-size:10pt}
.idxgroup .up.models .sz{font-size:7.8pt}

.toc{display:flex;flex-wrap:wrap;gap:2.5mm 0}
.toc .t{flex:0 0 50%;font-size:8.4pt;color:var(--stone);display:flex;gap:3mm}
.toc .t b{color:var(--forest);font-weight:600;min-width:7mm}
"""


def facts_row(facts):
    out = ""
    for v, l in facts:
        plain = re.sub(r"&[a-z]+;|&#?\w+;", "x", v)
        cls = "v sm" if len(plain) > 9 else "v"
        out += f'<div class="f"><div class="{cls} nums">{v}</div><div class="l">{l}</div></div>'
    return f'<div class="facts">{out}</div>'


def cover(im, priced):
    stat = ([("7", "Product lines"), ("15 – 74 m&sup2;", "Sizes"),
             ("Nationwide", "Delivery"), ("1 year", "Guarantee")] if not priced else
            [("7", "Product lines"), ("15 – 74 m&sup2;", "Sizes"),
             ("&plusmn;90 days", "Deposit to site"), ("1 year", "Guarantee")])
    stats = ""
    for v, l in stat:
        plain = re.sub(r"&[a-z]+;|&#?\w+;", "x", v)
        cls = "v" + (" xs" if len(plain) > 12 else " sm" if len(plain) > 8 else "")
        stats += f'<div class="stat"><div class="{cls} nums">{v}</div><div class="l">{l}</div></div>'
    lede = ("Seven product lines, factory-built in Centurion, Gauteng and delivered across South Africa. "
            "From a flat-pack room you can unfold before lunch to a flagship glamping capsule wrapped in "
            "270&deg; of glass, plus outdoor kitchens for entertaining and canvas suites for lodges.")
    return f"""
<section class="page grain">
  <div class="hero">
    <img class="bg" style="object-position:50% 56%" src="{im['cover']}" alt="{esc(im['cover_alt'])}">
    <div class="hero-scrim"></div>
    <div class="hero-inner">
      <img class="hero-logo" src="{im['logo_white']}" alt="Tiny Homes SA">
      <div class="hero-foot">
        <div class="eyebrow on-dark">The full range</div>
        <h1 class="display">Tiny Homes SA</h1>
        <div class="sub">Innovative instant housing solutions.</div>
        <div class="tag">Seven ways to build it better, delivered nationwide.</div>
      </div>
    </div>
  </div>
  <div class="cover-body">
    <div class="cover-grid"><p>{lede}</p></div>
    <div class="stats">{stats}</div>
  </div>
  <div class="cover-foot">
    <div><strong>tinyhomesa.com</strong></div>
    <div>{SITE['phoneDisplay']} &nbsp;&middot;&nbsp; Centurion, Gauteng &nbsp;&middot;&nbsp; Delivered nationwide</div>
  </div>
</section>"""


def page_why(im, folio):
    why = "".join(f'<div class="w"><h3>{t}</h3><p>{b}</p></div>' for t, b in WHY)
    toc = ""
    folio = 5
    for slug in ORDER:
        toc += f'<div class="t"><b>{folio:02d}</b><span>{PAGES[slug]["name"]}</span></div>'
        folio += 1 + PLAN_PAGE_COUNT.get(slug, 0)
    return f"""
<section class="page grain">
  <div class="flow pad head"><div class="flow-inner">
    <div class="eyebrow">Why tiny living</div>
    <h2 class="display">Built in a factory, not on your lawn</h2>
    <hr class="rule-clay" style="margin-top:5mm">
    <p class="lede" style="margin-top:7mm;max-width:156mm">
      Every home in this range is built under a roof, to the same spec, every time, then delivered
      finished. That is what removes the two things that make a conventional build painful: months of
      site work, and a price that moves while it happens.
    </p>
    <div class="why" style="margin-top:7mm">{why}</div>

    <div style="margin-top:8mm">
      <div class="eyebrow">In this brochure</div>
      <hr class="rule" style="margin:3mm 0 4.5mm">
      <div class="toc">{toc}</div>
    </div>

    <div class="grow" style="min-height:8mm"></div>
    <div class="band" style="height:66mm">
      <img src="{im['why_band']}" alt="{esc(im['why_band_alt'])}">
      <div class="scrim"></div>
      <div class="lbl">Delivered from Centurion, Gauteng to all nine provinces, and quoted across the border on request.</div>
    </div>
  </div></div>
  <div class="folio"><span>Tiny Homes SA</span><span class="n nums">{folio:02d}</span></div>
</section>"""


def page_glance(im, priced, folio):
    rows = ""
    for slug in ORDER:
        p = PRODUCTS[slug]
        cfg = PAGES[slug]
        cell = ""
        if priced:
            if p.get("priceOnRequest"):
                price = '<span class="por">On request</span>'
            elif p.get("variants"):
                # The whole price ladder, not just its bottom rung: a "from"
                # figure on its own is the thing that makes people phone.
                lo = min(v["price"] for v in p["variants"])
                hi = max(v["price"] for v in p["variants"])
                price = (f'<span class="amt nums">{rands(lo)}</span>'
                         f'<div class="sub nums" style="text-align:right">to {rands(hi)}</div>')
            else:
                price = f'<span class="amt nums">{rands(p["startingPrice"])}</span>'
            cell = f"<td>{price}</td>"
        n_sizes = len(p.get("variants") or [])
        sizes = f'<div class="sub">{n_sizes} sizes</div>' if n_sizes else ""
        rows += (f'<tr><td class="th"><img src="{im["thumbs"][slug]}" alt=""></td>'
                 f'<td><div class="nm">{esc(cfg["name"])}</div>'
                 f'<div class="sub">{esc(p["tagline"])}</div></td>'
                 f'<td class="val nums">{m2(p["sizeLabel"])}{sizes}</td>'
                 f'<td class="val">{esc(p["setupTime"])}</td>{cell}</tr>')
    cols = ('<col class="c-th"><col><col class="c-sz"><col class="c-set">'
            + ('<col class="c-amt">' if priced else ''))
    head = (cols + '<tr><th></th><th>Product</th><th>Size</th><th>Setup</th>'
            + ('<th class="r">Price ex VAT</th>' if priced else '') + '</tr>')
    note = ("Every product carries a 1-year limited guarantee. Delivery and installation are quoted "
            "separately on your location and site access, and the groundwork is arranged by you. Finance is "
            "available through a third-party provider, subject to credit approval."
            + (" Prices exclude VAT and are subject to change." if priced else
               " Pricing for every line is provided on request, quoted to your site and specification."))
    return f"""
<section class="page grain">
  <div class="flow pad head"><div class="flow-inner">
    <div class="eyebrow">The range</div>
    <h2 class="display">At a glance</h2>
    <hr class="rule-clay" style="margin-top:5mm">
    <p class="lede" style="margin-top:7mm;max-width:154mm">
      Seven lines, one factory. Sizes are the finished floor area; setup is what happens once the unit
      is on your prepared site. Full specifications for each follow on the pages after this.
    </p>
    <table class="rng" style="margin-top:7mm">{head}{rows}</table>
    <div class="grow" style="min-height:8mm"></div>
    <div class="note">{note}</div>
  </div></div>
  <div class="folio"><span>Tiny Homes SA</span><span class="n nums">{folio:02d}</span></div>
</section>"""


def models_table(p, priced, ids=None):
    """
    Every size of a product, with its dimensions and (when priced) its price.

    This is the answer to a "from R…" figure: a reader can see the whole ladder
    of sizes without going to the website or picking up the phone.
    """
    variants = [v for v in (p.get("variants") or []) if not ids or v["id"] in ids]
    if not variants:
        return ""
    cols = ('<col><col style="width:19mm"><col style="width:44mm">'
            + ('<col style="width:25mm">' if priced else ''))
    head = (cols + '<tr><th>Model</th><th style="text-align:right">Size</th>'
            '<th style="text-align:left;padding-left:5mm">Dimensions</th>'
            + ('<th style="text-align:right">Price ex VAT</th>' if priced else '')
            + '</tr>')
    rows = ""
    for v in variants:
        cell = f'<td style="text-align:right"><span class="amt nums">{rands(v["price"])}</span></td>' if priced else ""
        rows += (f'<tr><td><div class="name">{esc(v["name"])}</div></td>'
                 f'<td style="text-align:right"><span class="sz nums">{m2(v["size"])}</span></td>'
                 f'<td style="padding-left:5mm"><span class="sz nums">{m2(esc(dims_of(v)))}</span></td>{cell}</tr>')
    return f'<table class="up models fixed" style="margin-top:3.5mm">{head}{rows}</table>'


def page_product(slug, im, priced, folio):
    p = PRODUCTS[slug]
    cfg = PAGES[slug]
    ticks = "".join(f"<li>{t}</li>" for t in cfg["ticks"])
    multi = bool(p.get("variants"))

    if priced:
        if p.get("priceOnRequest"):
            strip = ('<div class="pricestrip"><div><div class="lab">Pricing</div></div>'
                     '<div class="amt">Price on request</div>'
                     '<div class="vat">Quoted after a consultation</div></div>')
        elif multi:
            lo, hi = min(v["price"] for v in p["variants"]), max(v["price"] for v in p["variants"])
            strip = (f'<div class="pricestrip"><div><div class="lab">{len(p["variants"])} sizes</div></div>'
                     f'<div class="amt nums">{rands(lo)} – {rands(hi)}</div>'
                     f'<div class="vat">excluding VAT</div></div>')
        else:
            strip = (f'<div class="pricestrip"><div><div class="lab">One size</div></div>'
                     f'<div class="amt nums">{rands(p["startingPrice"])}</div>'
                     f'<div class="vat">excluding VAT</div></div>')
    else:
        strip = ('<div class="pricestrip"><div><div class="lab">Pricing</div></div>'
                 '<div class="amt">On request</div>'
                 '<div class="vat">Quoted to your site and specification</div></div>')

    sizes = ""
    if multi:
        sizes = (f'<div style="margin-top:6mm"><div class="eyebrow">'
                 f'{"The sizes and what each costs" if priced else "The sizes available"}</div>'
                 f'<hr class="rule" style="margin:3mm 0 0">{models_table(p, priced)}</div>')
    return f"""
<section class="page grain">
  <div class="flow pad head" style="padding-top:13mm"><div class="flow-inner">
    <div class="eyebrow">{cfg['eyebrow']}</div>
    <h2 class="display">{esc(cfg['name'])}</h2>
    <div class="sub-tag" style="font-family:'Fraunces',serif;font-variation-settings:'SOFT' 40,'opsz' 90;
      font-size:13pt;color:var(--moss);margin-top:2mm;letter-spacing:-.01em">{esc(p['tagline'])}</div>

    <div class="band" style="height:{'62mm' if multi else '78mm'};margin-top:6mm">
      <img src="{im['photo']}" alt="{esc(im['photo_alt'])}">
    </div>

    <p style="font-size:9.2pt;line-height:1.6;margin-top:6mm;max-width:158mm">{cfg['blurb']}</p>

    <div style="margin-top:6mm">{facts_row(cfg['facts'])}</div>

    <div style="margin-top:6mm">
      <div class="eyebrow">Included as standard</div>
      <hr class="rule" style="margin:3mm 0 4.5mm">
      <ul class="ticks" style="column-count:2;column-gap:9mm">{ticks}</ul>
    </div>
    {sizes}

    <div class="bestfor" style="margin-top:6mm">
      <div class="k">Best for</div>
      <p>{cfg['best']}</p>
    </div>

    <div class="grow" style="min-height:5mm"></div>
    {strip}
  </div></div>
  <div class="folio"><span>{esc(cfg['name'])}</span><span class="n nums">{folio:02d}</span></div>
</section>"""


def quick_row():
    """The four facts that apply to everything, beside the price list."""
    return "".join(f'<div class="q"><div class="k">{k}</div><div class="v">{v}</div><p>{b}</p></div>'
                   for k, v, b in gen.QUICK)


def page_index(priced, folio):
    """
    Every model in the range on one page, so nothing hides behind a "from".

    Twenty-six rows will not fit down a single A4 column at a readable size, so
    the products are dealt into two columns balanced by row count.
    """
    blocks = []
    for slug in ORDER:
        p = PRODUCTS[slug]
        cfg = PAGES[slug]
        rows = ""
        if p.get("variants"):
            for v in p["variants"]:
                cell = (f'<td style="text-align:right"><span class="amt nums">{rands(v["price"])}</span></td>'
                        if priced else "")
                rows += (f'<tr><td><div class="name">{esc(v["name"])}</div></td>'
                         f'<td style="text-align:right"><span class="sz nums">{m2(v["size"])}</span></td>{cell}</tr>')
            n = len(p["variants"])
        else:
            por = p.get("priceOnRequest")
            cell = ""
            if priced:
                amt = ('<span class="por">On request</span>' if por
                       else f'<span class="amt nums">{rands(p["startingPrice"])}</span>')
                cell = f'<td style="text-align:right">{amt}</td>'
            rows += (f'<tr><td><div class="name">{esc(p["shortName"])}</div></td>'
                     f'<td style="text-align:right"><span class="sz nums">{m2(p["sizeLabel"])}</span></td>{cell}</tr>')
            n = 1
        head = ('<tr><th>Model</th><th style="text-align:right;width:19mm">Size</th>'
                + ('<th style="text-align:right;width:24mm">Ex VAT</th>' if priced else '')
                + '</tr>')
        blocks.append((n + 1,
                       f'<div class="idxgroup"><div class="eyebrow">{esc(cfg["name"])}</div>'
                       f'<table class="up models idx">{head}{rows}</table></div>'))

    total = sum(n for n, _ in blocks)
    left, right, run = "", "", 0
    for n, html_ in blocks:
        if run + n / 2 <= total / 2:
            left += html_
        else:
            right += html_
        run += n

    lede = ("Every model we build, on one page, with the price for each. These are the units themselves, "
            "excluding VAT; delivery and any optional extras are quoted separately, and the groundwork is "
            "arranged by you. Each "
            "product's own pages follow, with the sizes drawn to scale."
            if priced else
            "Every model we build, on one page. Pricing for each is provided on request, quoted to your "
            "site, specification and volume. Each product's own pages follow, with the sizes drawn to scale.")
    note = ("Prices are subject to change and are confirmed on your written quotation. The optional extras "
            "for each range are listed in that product's own brochure, and confirmed line by line when we "
            "quote."
            if priced else
            "Sizes are the finished floor area or overall length. The optional extras for each range are "
            "listed in that product's own brochure and quoted with the unit.")
    return f"""
<section class="page grain">
  <div class="flow pad head"><div class="flow-inner">
    <div class="eyebrow">The index</div>
    <h2 class="display">{'Every model, every price' if priced else 'Every model and size'}</h2>
    <hr class="rule-clay" style="margin-top:5mm">
    <p class="lede" style="margin-top:6mm;max-width:156mm">{lede}</p>
    <div class="idx-cols" style="margin-top:6mm"><div>{left}</div><div>{right}</div></div>
    <div class="grow" style="min-height:6mm"></div>
    <div class="quick" style="margin-bottom:6mm">{quick_row()}</div>
    <div class="note">{note}</div>
  </div></div>
  <div class="folio"><span>Tiny Homes SA</span><span class="n nums">{folio:02d}</span></div>
</section>"""


def page_plans(slug, priced, folio, ids=None, title=None, lede=None, note=None):
    """
    A product's floor plans in the range brochure.

    The plan sheets are the manufacturers' own, the same ones the single-product
    brochures print, so a reader comparing two ranges is comparing like with like.
    """
    p = PRODUCTS[slug]
    cfg = PAGES[slug]
    sheets = LAYOUT_PLANS.get(slug, {})
    rows = ""
    for v in p["variants"]:
        if ids and v["id"] not in ids:
            continue
        sheet = sheets.get(v["id"])
        if not sheet:
            continue
        src = SITE_IMG / sheet[0]["src"].replace("/images/", "", 1)
        price = (f'<div><div class="mamt nums">{rands(v["price"])}</div>'
                 f'<div class="mvat">ex VAT</div></div>' if priced else "")
        qr = (f'<div class="mfoot">{qr_svg(quote_url(slug, v["id"]), 13)}'
              f'<div class="qcap">Scan for a quotation<br>on this exact size</div></div>' if priced else "")
        rooms = plan_rooms(sheet[0]["label"])
        rows += f"""
        <div class="model">
          <div class="mplan">{svg_scoped(src, f'rp-{slug}-{v["id"]}')}</div>
          <div class="minfo">
            <div class="mhead"><div class="mname">{esc(v["name"])}</div>{price}</div>
            <div class="mmeta nums">{m2(v["size"])} &nbsp;&middot;&nbsp; {m2(esc(dims_of(v)))}</div>
            <p class="mdesc">{m2(esc(sentences(v["description"], 175)))}</p>
            {f'<div class="mrooms">In this plan: {m2(esc(rooms))}</div>' if rooms else ''}
            {qr}
          </div>
        </div>"""
    return f"""
<section class="page grain">
  <div class="flow pad head"><div class="flow-inner">
    <div class="eyebrow">{esc(cfg['name'])} &middot; floor plans</div>
    <h2 class="display">{title or 'The sizes, drawn to scale'}</h2>
    <hr class="rule-clay" style="margin-top:5mm">
    <p class="lede" style="margin-top:6mm;max-width:158mm">{lede or ''}</p>
    <div style="margin-top:5mm">{rows}</div>
    <div class="grow" style="min-height:5mm"></div>
    {f'<div class="note">{note}</div>' if note else ''}
  </div></div>
  <div class="folio"><span>{esc(cfg['name'])}</span><span class="n nums">{folio:02d}</span></div>
</section>"""


def page_expandable_sizes(im, priced, folio):
    """Expandable homes have no per-model plan sheet, but they do have layouts."""
    p = PRODUCTS["expandable-homes"]
    tiles = "".join(
        f'<div class="l"><img src="{src}" alt="{esc(label)} layout"><div class="n">{esc(label)}</div></div>'
        for label, src in im["exp_layouts"])
    return f"""
<section class="page grain">
  <div class="flow pad head"><div class="flow-inner">
    <div class="eyebrow">Expandable homes &middot; sizes &amp; layouts</div>
    <h2 class="display">Three sizes, fifteen layouts</h2>
    <hr class="rule-clay" style="margin-top:5mm">
    <p class="lede" style="margin-top:6mm;max-width:158mm">
      Every size arrives as one module and expands on site, and all three include a bathroom and a
      kitchen. What changes is the floor area and the number of rooms: the internal layout is chosen
      when you order, at no change to the price.
    </p>
    <div class="cols" style="margin-top:6mm;align-items:flex-start">
      <div class="figure" style="flex:0 0 58mm"><img src="{im['exp_sizes']}" alt="Transport and expanded dimensions"></div>
      <div style="flex:1">
        <div class="eyebrow">{'The sizes and what each costs' if priced else 'The sizes available'}</div>
        <hr class="rule" style="margin:3mm 0 0">
        {models_table(p, priced)}
      </div>
    </div>
    <div style="margin-top:7mm">
      <div class="eyebrow">A sample of the standard layouts</div>
      <hr class="rule" style="margin:3mm 0 5mm">
      <div class="layouts">{tiles}</div>
    </div>
    <div class="grow" style="min-height:5mm"></div>
    <div class="note">
      <strong>Fifteen standard layouts are available across the two larger sizes</strong>, including
      laundry, walk-in-wardrobe and office variants, all at the same price. The full set is in the
      expandable homes brochure.
    </div>
  </div></div>
  <div class="folio"><span>Expandable Homes</span><span class="n nums">{folio:02d}</span></div>
</section>"""


def page_order(im, priced, folio):
    step2 = ("Most homes are ready in around 90 days from deposit to delivered on site."
             if priced else
             "Most homes are ready in around 90 days from deposit to delivered on site.")
    fine = ("Delivery and installation are quoted separately on your location and site access, and the "
            "groundwork is arranged by you. Optional-extra pricing is confirmed line by line on your "
            "formal quotation. Third-party finance is subject to credit approval."
            if priced else
            "Every line in this brochure is quoted to your site and specification. Delivery and "
            "installation are quoted separately on your location and site access, and the groundwork is "
            "arranged by you. Third-party finance is subject to credit approval.")
    return f"""
<section class="page grain">
  <div class="flow pad head"><div class="flow-inner">
    <div class="eyebrow">How it works</div>
    <h2 class="display">From deposit to front door</h2>
    <hr class="rule-clay" style="margin-top:5mm">

    <ol class="steps" style="margin-top:8mm">
      <li><div class="num">1</div><h3>Choose and customise</h3>
        <p>Pick the line that fits the job, then make it yours: finishes, insulation, wet rooms,
           kitchens and the extras each range offers.</p></li>
      <li><div class="num">2</div><h3>Secure with a deposit</h3>
        <p>Confirm your order with a deposit and we get to work in the factory. Finance is available
           through a third-party provider, subject to credit approval.</p></li>
      <li><div class="num">3</div><h3>Delivered in &plusmn;90 days</h3>
        <p>{step2} Delivery runs from Centurion, Gauteng to anywhere in South Africa, quoted on your
           location and site access.</p></li>
      <li><div class="num">4</div><h3>Installed and handed over</h3>
        <p>Setup runs from minutes for an X-Fold to professional installation for cabins and capsules.
           In Gauteng, our turnkey team can prepare the groundwork while your unit is being built.</p></li>
    </ol>

    <div style="margin-top:8mm">
      <div class="eyebrow">Good to know</div>
      <hr class="rule" style="margin:3mm 0 4.5mm">
      <ul class="ticks" style="column-count:2;column-gap:9mm">
        <li>1-year limited guarantee on every product, with full after-sales support</li>
        <li>Delivered to all nine provinces, and quoted across the border on request</li>
        <li>Coastal sites are specified for salt air on quotation</li>
        <li>Turnkey groundwork, plinths and connections available on request in Gauteng</li>
      </ul>
    </div>

    <div class="grow" style="min-height:7mm"></div>
    <div class="band" style="height:46mm">
      <img src="{im['order_band']}" alt="{esc(im['order_band_alt'])}">
      <div class="scrim"></div>
      <div class="lbl">Repeatable, relocatable and built for volume as readily as for a single unit.</div>
    </div>
    <div class="note" style="margin-top:6mm">{fine}</div>
  </div></div>
  <div class="folio"><span>Tiny Homes SA</span><span class="n nums">{folio:02d}</span></div>
</section>"""


def page_contact(im, priced):
    fine = ("All prices in South African Rand and exclude VAT, and are subject to change. Delivery and "
            "installation are quoted separately, and the groundwork is arranged by you. Optional-extra "
            "pricing is confirmed line by line on your formal quotation. Third-party finance is subject "
            "to credit approval. Tiny Homes (Pty) Ltd."
            if priced else
            "This brochure carries no pricing. Every product is quoted individually to your site, "
            "specification and volume, and the itemised quotation is confirmed in writing before "
            "anything is committed. Delivery and installation are quoted separately, and the groundwork "
            "is arranged by you. Third-party finance is subject to credit approval. Tiny Homes (Pty) Ltd.")
    return f"""
<section class="page grain">
  <div class="flow pad head"><div class="flow-inner">
    <div class="eyebrow">Speak to us</div>
    <h2 class="display">Ready when you are</h2>
    <hr class="rule-clay" style="margin-top:5mm">
    <p class="lede" style="margin-top:7mm;max-width:150mm">
      Visit the showroom in Centurion to walk through the range, or send us your site details and what
      you are trying to build, and we will come back with a written quotation.
    </p>
    <div class="band fill" style="margin-top:8mm">
      <img src="{im['back_band']}" alt="{esc(im['back_band_alt'])}">
    </div>
  </div></div>

  <div class="contact">
    <div class="top">
      <div>
        <div class="eyebrow on-dark">Tiny Homes SA</div>
        <h2 class="display" style="margin-top:2.5mm">Innovative instant housing solutions.</h2>
        <p class="sell">Prefab tiny homes, cabins, glamping capsules, outdoor kitchens and safari tents,
          built in Centurion and delivered across South Africa.</p>
      </div>
      <img class="logo" src="{im['logo_white']}" alt="Tiny Homes SA">
    </div>
    <div class="grid">
      <div class="c"><div class="k">Call or WhatsApp</div><div class="v nums">{SITE['phoneDisplay']}</div></div>
      <div class="c"><div class="k">Email</div><div class="v">{SITE['email']}</div></div>
      <div class="c wide"><div class="k">Showroom</div>
        <div class="v">{SITE['address']['streetAddress']}, {SITE['address']['locality']}<br>
          {SITE['address']['city']}, {SITE['address']['region']}</div></div>
      <div class="c"><div class="k">Online</div><div class="v">tinyhomesa.com</div></div>
    </div>
    <div class="fine">{fine}</div>
  </div>
</section>"""


def build(priced):
    # Widths are set from the size each image actually prints at: the full-bleed
    # bands span 210 mm (1300 px ≈ 157 dpi) and the range-table thumbnails only
    # 21 mm. Ten full-page photographs in one document add up fast, and this is a
    # brochure meant to survive being emailed.
    im = {"logo_white": datauri(BASE / "img/logo-white.png")}
    slug, name = COVER_IMAGE
    im["cover"] = datauri(prep(slug, name, "range-cover.jpg", 1400))
    im["cover_alt"] = img_by_name(slug, name)["alt"]
    slug, name = WHY_BAND
    im["why_band"] = datauri(prep(slug, name, "range-why.jpg", 1300))
    im["why_band_alt"] = img_by_name(slug, name)["alt"]
    slug, name = ORDER_BAND
    im["order_band"] = datauri(prep(slug, name, "range-order.jpg", 1300))
    im["order_band_alt"] = img_by_name(slug, name)["alt"]
    slug, name = BACK_BAND
    im["back_band"] = datauri(prep(slug, name, "range-back.jpg", 1300))
    im["back_band_alt"] = img_by_name(slug, name)["alt"]
    im["thumbs"] = {s: datauri(prep(s, PAGES[s]["image"], "range-thumb.jpg", 260))
                    for s in ORDER}
    im["exp_sizes"] = datauri(prep("expandable-homes", "catalog-sizes.png", "range-expsizes.png", 780))
    # A sample of the layouts, not all fifteen: the full set is in the
    # expandable homes brochure, and this page also has to carry the sizes.
    im["exp_layouts"] = [
        (sh["label"], datauri(prep_file(SITE_IMG / sh["src"].replace("/images/", "", 1),
                                        f"expandable-homes/range-lay-{pathlib.Path(sh['src']).stem}.png",
                                        420, sh["width"])))
        for sh in (LAYOUT_PLANS["expandable-homes"]["b20"][:3]
                   + LAYOUT_PLANS["expandable-homes"]["b40"][:3])]

    # Products whose sizes are worth a page of their own: the ones with
    # manufacturer floor plans, plus the expandable homes and their layouts.
    plan_pages = {
        "expandable-homes": [lambda f: page_expandable_sizes(im, priced, f)],
        "apple-cabins": [lambda f: page_plans(
            "apple-cabins", priced, f,
            lede=("All three cabins are 2.25 m wide and 2.63 m high; the length is what changes, and with "
                  "it the number of rooms. Bathroom fittings are included in all three, and the "
                  "kitchenette comes with the 9 m and 11.8 m cabins."),
            note=("<strong>Various sizes and designs are available</strong> beyond the three shown here, "
                  "and cabins can be paired with solar, gas geysers and rainwater tanks for remote "
                  "sites, quoted per project."))],
        "glamping-capsules": [
            lambda f: page_plans(
                "glamping-capsules", priced, f, ids=["capsule-5-85", "capsule-8-5", "capsule-11-5"],
                title="The core range",
                lede=("The more affordable build, with a shorter options list. Every model carries the "
                      "bathroom and its premium fittings, a geyser, multi-layer insulation and the 270&deg; "
                      "glazing as standard.")),
            lambda f: page_plans(
                "glamping-capsules", priced, f, ids=["space-d5", "space-d8", "space-d7"],
                title="The Space range",
                lede=("The same idea built further: a wider options list, a full kitchen with a 900 mm "
                      "double stove available, an enclosable balcony and upgraded 100 mm insulation."),
                note=("<strong>Other sizes and layouts are built to order.</strong> The 11.5 m Space "
                      "capsule can be built as a two-bedroom, for example. Tell us what you need and we "
                      "will check it with the factory."))],
    }

    pages = [cover(im, priced), page_why(im, 2), page_glance(im, priced, 3), page_index(priced, 4)]
    folio = 5
    for slug in ORDER:
        pim = dict(im)
        nm = PAGES[slug]["image"]
        pim["photo"] = datauri(prep(slug, nm, "range-photo.jpg", 1300))
        pim["photo_alt"] = img_by_name(slug, nm)["alt"]
        pages.append(page_product(slug, pim, priced, folio)); folio += 1
        for make in plan_pages.get(slug, []):
            pages.append(make(folio)); folio += 1
    pages.append(page_order(im, priced, folio)); folio += 1
    pages.append(page_contact(im, priced))

    css = (CSS.replace("__FRAUNCES__", b64(BASE / "font/fraunces.woff2"))
              .replace("__INTER__", b64(BASE / "font/inter.woff2")) + EXTRA_CSS)
    title = ("Tiny Homes SA | The Full Range" if priced
             else "Tiny Homes SA | The Full Range (no pricing)")
    doc = f"""<!DOCTYPE html>
<html lang="en-ZA"><head><meta charset="utf-8">
<title>{title}</title>
<meta name="description" content="The full Tiny Homes SA range: folding homes, expandable homes, cabins, glamping capsules, outdoor kitchens and safari tents, built in Centurion and delivered nationwide.">
<style>{css}</style></head><body>
{''.join(pages)}
<script>{FIT_JS}</script>
</body></html>"""

    stem = "full-range" if priced else "full-range-no-prices"
    out = BASE / "out" / f"{stem}.html"
    out.write_text(doc)
    return out, stem, len(pages)


if __name__ == "__main__":
    # Each edition is an independent 17-page render; taking an argument lets the
    # two run as parallel processes instead of one twenty-minute serial pass.
    editions = (True, False)
    if len(sys.argv) > 1:
        editions = (sys.argv[1] != "no-prices",)
    for priced in editions:
        htmlp, stem, n = build(priced)
        fits = gen.fit_report(htmlp)
        pdfp = BASE / "out" / f"{stem}.pdf"
        render(htmlp, pdfp, title := ("Tiny Homes SA | The Full Range" if priced
                                      else "Tiny Homes SA | The Full Range (no pricing)"),
               "The full Tiny Homes SA product range")
        tight = f"  <-- TIGHT (min {min(fits)})" if fits and min(fits) < 0.88 else ""
        print(f"{stem:<22} {n} pages  {pdfp.stat().st_size/1e6:5.2f} MB  fit={fits}{tight}")
