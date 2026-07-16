# Site-wide image overhaul — design

Date: 2026-07-16 · Status: awaiting owner approval

## Goal

Replace or repair every image on the site so nothing looks like a supplier
download: no more bad crops, low-resolution files, or obvious composites
(e.g. the folding-home product render pasted onto a stock grass field at
`public/images/products/folding-homes/exterior-lawn-1.jpg`).

**Owner decisions already made in-session:**

- **Sourcing: hybrid.** Anything showing the actual product keeps its real
  photo, AI-enhanced (background replaced, upscaled, outpainted). Pure
  lifestyle/atmosphere imagery may be fully AI-generated.
- **Scope: every image** — all 55 product images + 6 gallery shots indexed in
  `src/data/images.json`. One consistent standard, not spot fixes.
- **Style: match each product's vibe** (see settings map below).
- **Review: style-proof first, then autopilot.** Owner approves 4 sample
  images, then the rest runs unattended.
- **Pipeline: multi-agent workflow** for the audit and bulk processing.
- **Credits: scarce.** Bulk work uses unlimited/cheap models (Nano Banana 2
  Lite 1k, GPT Image 2 low). Credits (1,000 on Plus plan) are reserved for
  hero images and upscales. Credit burn is reported after the style proof
  with a forecast before autopilot begins.

## Out of scope

- Brand assets (`public/images/brand/`), videos, 3D models.
- `src/data/products.ts` — prices remain locked (vetted 2026-07-16).
- Copy/layout changes, except where an "image" is really page content in
  disguise (see tech-specs-table note below).

## Per-product settings map

| Products | Setting |
|---|---|
| Folding homes (X-Fold), outdoor kitchens | Tidy suburban plots, paved yards, job sites |
| Expandable homes, nature cabins, apple cabins | Mountain / forest clearings |
| Safari tents, glamping capsules, the Dome | Bushveld lodge scenery, acacias |
| Gallery strip / landing imagery | Mix of the above, golden-hour |

Golden-hour light throughout, matching the site's sand/clay/forest palette.
Interiors keep their real geometry; only quality is lifted.

## Phase 1 — Vision audit (multi-agent)

Vision agents inspect all 61 images and produce a per-image work order:

- **Classify:** real photo / supplier render / composite / diagram / collage.
  The 33 exteriors are scenery candidates; the 9 diagrams and the
  collages/spec-tables are not — they are graded for legibility and kept,
  redrawn clean, or flagged.
  - `expandable-homes/tech-specs-table.jpg` (750×139) is flagged now: a
    specs table as a JPEG should likely become real page content. Audit
    confirms; wire-in phase implements if approved.
- **Grade:** resolution (26 images are under 900 px wide), crop quality,
  compositing artifacts.
- **Treatment:** one of `keep` / `recrop+optimize` / `background-replace` /
  `upscale` / `regenerate-from-reference` / `cull`.

Output: a work-order JSON checked into the session scratchpad plus a summary
for the owner.

## Phase 2 — Style proof (owner approval gate)

Four representative images, processed inline and shown to the owner:

1. `folding-homes/exterior-lawn-1.jpg` — background replaced with a tidy
   suburban plot (the "grass field" example).
2. One low-res interior — upscale/regeneration quality check.
3. One bushveld scenery shot (safari tent or glamping capsule).
4. One product hero at full hero resolution (credit-tier model allowed).

Deliverables at the gate: the 4 images, actual credits spent, and a forecast
for the remaining ~57. If the forecast is too expensive, treatments are
trimmed (more `recrop+optimize`, fewer regenerations) rather than
overspending. **Autopilot does not start until the owner approves both the
look and the forecast.**

## Phase 3 — Autopilot (multi-agent workflow)

Per image, pipelined concurrently:

1. Craft prompt from the work order (product reference image attached).
2. Submit Higgsfield job — cheap/unlimited model per credit policy; heroes
   may use credit-tier models within the approved forecast.
3. Vision agent quality-checks result vs original: product geometry
   preserved, no artifacts, correct setting. One retry on failure; images
   that fail twice are left unchanged and reported.
4. Local post-processing: resize to slot target, compress.

Originals are preserved via git history (all images are tracked files).

## Phase 4 — Wire-in and review

- Update `src/data/images.json`: new dimensions, rewritten alt text
  matching the new content, hero flags preserved.
- Full `npm run build` must pass.
- Start localhost for owner review. **No commits — the owner reviews and
  commits themselves.**

## Open items resolved by the audit

- Exact per-image treatments and counts per category.
- Which gallery-strip images are replaced vs regenerated.
- Whether `tech-specs-table.jpg` becomes page content.
