#!/usr/bin/env python3
"""Assert every brochure carries its source content intact.

Guards the two failure modes the auto-fit layout can produce: text clipped by
the page crop, and a section silently dropped. Compares the PDF text layer
against the catalogue, normalised for the typographic substitutions the
brochure makes (thin spaces, m2, multiplication signs, en dashes).

Covers the seven product brochures and both editions of the range brochure,
including the price integrity of the no-prices edition.
"""
import fitz, re, html, importlib.util, sys

spec = importlib.util.spec_from_file_location("gen", "gen.py")
g = importlib.util.module_from_spec(spec)
spec.loader.exec_module(g)

rspec = importlib.util.spec_from_file_location("rng", "range.py")
rng = importlib.util.module_from_spec(rspec)
rspec.loader.exec_module(rng)

SUBS = [("&thinsp;", " "), (" ", " "), (" ", " "), ("²", "2"),
        ("×", "x"), ("°", "deg"), ("–", "-"), ("—", "-"),
        ("’", "'"), ("‘", "'"), ("“", '"'), ("”", '"')]


def norm(s):
    s = re.sub(r"<[^>]+>", "", str(s))
    s = html.unescape(s)
    for a, b in SUBS:
        s = s.replace(a, b)
    s = re.sub(r"\s+", " ", s).strip()
    # PDF text extraction keeps the line break inside a hyphenated word
    # ("front- door"); collapse so it matches the source string.
    return s.replace("- ", "-")


def text_of(path):
    d = fitz.open(path)
    return d, norm(" ".join(p.get_text() for p in d))


bad = 0

# --------------------------------------------------------- product brochures
for slug in g.ORDER:
    cfg = dict(g.CONFIG[slug]); cfg.update(g.EXTRA[slug])
    d, txt = text_of(f"out/{slug}.pdf")
    p = g.PRODUCTS[slug]
    probs = []

    # Long prose blocks: check the tail, which is what a clipped page loses.
    for key in ("note", "options_note", "fine", "options_lede", "feature_cap", "band2_cap",
                "band4_cap", "sub", "sizes_lede", "sizes_note", "sizes_note_core",
                "plan_note", "layouts_lede"):
        if key in cfg and norm(cfg[key])[-45:] not in txt:
            probs.append(f"clipped:{key}")

    for f in p["features"]:
        if norm(f)[-40:] not in txt:
            probs.append(f"feat:{f[:24]}")
    for u in p["useCases"]:
        if norm(u["title"]) not in txt:
            probs.append(f"use:{u['title']}")
    for v in (p.get("variants") or []):
        if norm(v["name"]) not in txt:
            probs.append(f"var:{v['name']}")
        if norm(g.rands(v["price"])) not in txt:
            probs.append(f"varprice:{v['name']}")
    for s in p["specs"]:
        if norm(s["value"])[-35:] not in txt:
            probs.append(f"spec:{s['label']}")
    for o in p["options"]:
        if norm(o["label"]) not in txt:
            probs.append(f"opt:{o['label']}")
    # The FAQ page is the whole point of nobody having to phone.
    for f in p["faqs"]:
        if norm(f["q"])[-40:] not in txt:
            probs.append(f"faq:{f['q'][:26]}")
        if norm(f["a"])[-45:] not in txt:
            probs.append(f"faqans:{f['q'][:26]}")
    # Who pays for what.
    scope = {**g.SCOPE_DEFAULT, **g.SCOPE.get(slug, {})}
    for key in ("in", "sep", "you"):
        for line in scope[key]:
            if norm(line)[-38:] not in txt:
                probs.append(f"scope:{line[:26]}")
    for cap in (c for _, c in (cfg.get("gallery") or [])):
        if norm(cap)[-38:] not in txt:
            probs.append(f"galcap:{cap[:26]}")
    # Every size drawn on a plans page offers its own quote route.
    if slug in ("apple-cabins", "glamping-capsules"):
        n_qr, n_expected = txt.count("Scan for a quotation"), len(p["variants"])
        if n_qr != n_expected:
            probs.append(f"qr:{n_qr} of {n_expected}")

    # price integrity
    if p.get("priceOnRequest"):
        if re.search(r"R\s?\d{2,}", txt):
            probs.append("PRICE LEAKED on price-on-request product")
    elif norm(g.rands(p["startingPrice"])) not in txt:
        probs.append("starting price missing")

    for must in [g.SITE["phoneDisplay"], g.SITE["email"], "tinyhomesa.com", "Centurion"]:
        if must not in txt:
            probs.append(f"missing:{must}")

    print(f"{slug:<22} {len(d)}p  " + ("OK" if not probs else "!! " + "; ".join(probs)))
    bad += len(probs)

# ----------------------------------------------------------- range brochures
for stem, priced in (("full-range", True), ("full-range-no-prices", False)):
    d, txt = text_of(f"out/{stem}.pdf")
    probs = []
    for slug in rng.ORDER:
        p = g.PRODUCTS[slug]
        if norm(rng.PAGES[slug]["name"]) not in txt:
            probs.append(f"product:{slug}")
        if norm(rng.PAGES[slug]["best"])[-40:] not in txt:
            probs.append(f"best:{slug}")
        # Every size of every product, not just the cheapest.
        for v in (p.get("variants") or []):
            if norm(v["name"]) not in txt:
                probs.append(f"var:{v['name']}")
            if priced and norm(g.rands(v["price"])) not in txt:
                probs.append(f"varprice:{v['name']}")
        if priced and not p.get("priceOnRequest") and not p.get("variants"):
            if norm(g.rands(p["startingPrice"])) not in txt:
                probs.append(f"price:{slug}")
    if not priced:
        # The whole reason this edition exists: no rand figure anywhere.
        leaks = re.findall(r"R\s?\d[\d ]{2,}", txt)
        if leaks:
            probs.append(f"PRICE LEAKED: {leaks[:5]}")
    print(f"{stem:<22} {len(d)}p  " + ("OK" if not probs else "!! " + "; ".join(probs)))
    bad += len(probs)

print(f"\nreal issues: {bad}")
sys.exit(1 if bad else 0)
