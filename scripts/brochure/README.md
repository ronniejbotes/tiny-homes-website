# Brochures

Generates the Tiny Homes SA print brochures: seven single-product A4 brochures
plus the full-range catalogue in a priced and a no-prices edition. Output is a
PDF and a self-contained HTML file per brochure (fonts and images inlined, so a
single file can be emailed or opened offline).

Everything is generated from `src/data/products.ts` and `src/data/images.json`,
so the brochures cannot drift from the website. **Correct facts in the
catalogue first, re-dump, then regenerate. Never edit a PDF.**

## Build

```bash
cd scripts/brochure
node --experimental-strip-types dump.mjs   # catalogue -> data.json
python3 gen.py                             # all seven product brochures
python3 gen.py apple-cabins                # or just one
python3 range.py                           # both range editions (slow, serial)
python3 range.py priced                    # one edition, so the two can run in parallel
python3 check.py                           # assert nothing was dropped or clipped
```

Output lands in `out/`. Requires Google Chrome, `sips` (macOS), PyMuPDF
(`fitz`), Pillow and `segno`.

## What each file does

| File | Role |
| --- | --- |
| `dump.mjs` | Exports the catalogue, site details, image manifest and floor-plan geometry to `data.json` |
| `gen.py` | The seven product brochures: content, per-product config, shared CSS and the page templates |
| `range.py` | The full-range catalogue, in both editions. Imports gen's CSS, helpers and page furniture |
| `plan.py` | Draws floor plans from the site's own plan geometry, and the outdoor-kitchen size ladder |
| `check.py` | Reads each PDF's text layer back and asserts every fact survived |

## Things worth knowing

**Floor plans come from two places.** Apple cabins, glamping capsules and
expandable homes ship manufacturer CAD sheets under `images.layoutPlans`; those
are inlined as vector SVG with their CSS scoped per drawing (a `<style>` block
inside inline SVG is document-scoped in HTML, so six sheets that all define
`.lbl` would otherwise trample each other). The X-Fold and nature cabin have no
CAD sheet, so `plan.py` draws them from the same geometry the website's
configurator uses, via `getPlan()` in `dump.mjs`.

**Auto-fit.** Each page's flowing content is measured after fonts and images
settle and scaled down if it would overflow, iteratively: compensating the width
re-wraps the text the scale was derived from, so one pass under-shoots and clips
the last line. The build prints the scale per page and flags anything under
0.88, which means that page is carrying too much and wants splitting.

**The no-prices edition never composes a price.** Price columns, price strips
and the quote QR codes are absent rather than blanked, because the QR would open
a quote page showing the published price. `check.py` asserts no rand figure
survives anywhere in that PDF.

**Paper grain is screen-only.** Chrome rasterises the noise overlay per page
when printing, at roughly 390 kB a page: half the weight of a finished brochure,
for a texture nobody can see on paper. The HTML edition keeps it.

**QR codes** point at `/quote?product=…&variant=…`, which the quote form parses
into a pre-selected configuration, so a reader can price the exact size they are
looking at without typing anything.
