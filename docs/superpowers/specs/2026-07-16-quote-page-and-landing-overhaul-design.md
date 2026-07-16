# Quote page + landing overhaul — design

Date: 2026-07-16 · Approved by owner in-session

## A. `/quote` — "Get an instant quote now"

New route `src/app/quote/page.tsx` (server, metadata) + client components under
`src/components/quote/`. Two-column desktop layout: form left, sticky live
summary right; stacked on mobile (summary collapses to a bottom bar or inline
card above the submit button).

Form sections, in order:

1. **Choose your home** — visual product cards from `products` (hero image via
   `getHeroImage`, graceful no-image fallback for garages), then variant cards
   for the selected product, then extras grouped by `OptionCategory` with
   prices (`price: 0`/provisional renders "priced on quotation"). Products with
   `options: []` show variants only. `priceOnRequest` products (safari tents)
   show "priced after consultation" instead of a running total.
2. **Your details** — full name, email, phone. All required (delivery
   coordination needs a callback number).
3. **Delivery address** — street address, suburb, city, province (select of the
   9 SA provinces), postal code (4-digit). Helper copy: used to quote delivery
   to the site accurately.
4. **Notes** — optional textarea.

Summary card: product + variant + extras list, estimated total ex VAT
(variant price, else `startingPrice`, + sum of selected option prices,
`formatZAR`), "delivery quoted from your address" line, disclaimer that the
final figure is confirmed on the formal quotation.

Submission: identical mechanism to `lead-form.tsx` — WhatsApp prefill opened
synchronously on submit, mailto fallback, success state. Nothing stored.
Validation mirrors `lead-form.tsx` conventions (blur validation, focus first
error, aria-invalid/aria-describedby).

Deep links: `?product=…&variant=…&options=…` (comma-separated option ids),
consistent with the params `lead-form.tsx` already parses.

Wiring: "Get a quote" accent button in navbar (desktop + mobile), `/quote` in
`sitemap.ts`. Landing hero + final CTA link to `/quote`.

## B. Landing page visual overhaul

Content and section order unchanged. Elevate:

- Hero: slow parallax/zoom on imagery (framer-motion `useScroll`/`useTransform`),
  staggered headline reveal, layered gradient + grain, scroll cue.
- Sections: staggered fade-up reveals (extend `ui/reveal.tsx`
  backward-compatibly), alternating drift on showcase cards, count-up stats on
  view, subtle parallax on gallery images.
- Typography/spacing rhythm pass. Strictly existing sand/clay/forest palette.
- All animation transform/opacity only; fully disabled under
  `prefers-reduced-motion`.

## Constraints

- `src/data/products.ts` is read-only for this work (pricing was vetted against
  the confidential price list earlier today — no price may change).
- No new deps; framer-motion 12 + Tailwind v4 already installed.
- File ownership: quote work owns `app/quote/**`, `components/quote/**`,
  `navbar.tsx`, `site.ts`, `sitemap.ts`; landing work owns `app/page.tsx`,
  `components/home/**`, `ui/reveal.tsx`, `globals.css` (additive).
