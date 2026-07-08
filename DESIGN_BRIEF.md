# Tiny Homes SA — Design & Build Brief

The shared contract for everyone building this site. Read fully before writing code.

## Company

Tiny Homes SA (www.tinyhomesa.com) supplies high-end prefab tiny homes for affordable,
sustainable living in South Africa. Based in Raslouw, Centurion, Gauteng; delivers
nationwide (R6 000–R22 000 per unit). ~90 days from deposit to move-in.
Phone 083 660 3743 · admin@tinyhomesa.com · WhatsApp wa.me/27836603743.

Six products (slugs are also the routes, e.g. `/folding-homes`):
folding-homes (from R54 950), expandable-homes (R200 000), nature-cabins (R375 000),
the-dome (R180 000), apple-cabins (R550 000), glamping-capsules (R1 100 000).
All prices ex VAT. Full data: `src/data/products.ts` (single source of truth — never
hardcode product facts in components).

## Aesthetic: warm editorial minimalism

Think architectural magazine, not SaaS landing page. Oversized Fraunces display
headings, generous whitespace, warm palette, real photography, restrained motion.

- Tokens live in `src/app/globals.css` (Tailwind v4 `@theme`). Use ONLY these color
  utilities: `cream, parchment, sand, ink, stone, forest, forest-light, moss, sage,
  clay, clay-dark, clay-light, border`. Never raw hex in components.
- Headings: `text-display` class (Fraunces). Eyebrows: `text-eyebrow` + `text-clay`
  (or `text-sage` on dark). Body: default Inter, `text-stone` for secondary.
- Dark sections use `bg-forest text-cream` (see footer for reference).
- Buttons/primitives: use `src/components/ui/button.tsx` (ButtonLink/Button),
  `container.tsx`, `section-heading.tsx`. Radius language: rounded-full pills,
  rounded-2xl/3xl cards.
- Icons: lucide-react only. NO emojis as icons.

## Motion rules

- Use `Reveal`, `Stagger`, `StaggerItem` from `src/components/ui/reveal.tsx` for
  scroll reveals (they handle prefers-reduced-motion). Custom framer-motion is fine
  for hero/parallax but MUST respect `useReducedMotion`.
- Micro-interactions 150–300ms; scroll reveals ~0.7s ease-out-expo; animate only
  transform/opacity; nothing blocks input; animate 1–2 key elements per view.

## Layout & quality bars

- Mobile-first; test mentally at 375 / 768 / 1024 / 1440. No horizontal scroll.
- Navbar is fixed h-16 (sm:h-20): every page's first section needs top padding
  (`pt-28 sm:pt-36` typical) unless it's a full-bleed hero designed for overlap.
- Touch targets ≥44px. Visible labels on inputs. WCAG AA contrast: `stone` on
  `cream` is the minimum-contrast pair allowed for text; never lighter.
- Images: ALWAYS `next/image` with proper `sizes`, `alt` from the manifest
  `src/data/images.json` (never invent paths — import the manifest). Set
  `priority` only on the LCP hero image.

## SEO / GEO

- Every page exports Metadata (title ≤60 chars, description 150–160 chars,
  canonical via `alternates`), OpenGraph with a real image from the manifest.
- JSON-LD via `<script type="application/ld+json">` — helpers in `src/lib/schema.ts`
  (Agent D owns that file; others import from it if it exists, else inline).
- Semantic HTML: one h1 per page, sequential headings, `<section>` with
  aria-labelledby where sensible. FAQ content on product pages uses FAQPage schema.
- Write copy that answers questions directly (GEO): prices, sizes, delivery,
  timelines stated as facts near headings.

## File ownership (do not touch files outside your lane)

- Foundation (done): globals.css, layout.tsx, lib/*, data/products.ts,
  components/ui/*, components/layout/*.
- Agent A: `src/app/page.tsx` + `src/components/home/*`
- Agent B: `src/components/configurator/*` (owns product-configurator.tsx + scenes/*)
- Agent C: `src/app/[product]/page.tsx` + `src/components/product/*`
- Agent D: `src/app/about/*`, `src/app/contact/*`, `src/app/sitemap.ts`,
  `src/app/robots.ts`, `src/lib/schema.ts`, `src/app/manifest.ts`, `public/llms.txt`
