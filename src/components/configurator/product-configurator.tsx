"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import Image from "next/image";
import {
  Armchair,
  Box,
  Home,
  Image as ImageIcon,
  LayoutGrid,
  RotateCcw,
  Sofa,
} from "lucide-react";
import {
  activeVisuals,
  configuredPrice,
  type CustomOption,
  type OptionCategory,
  type Product,
  type VisualKey,
} from "@/data/products";
import manifest from "@/data/images.json";
import { formatZAR } from "@/lib/format";
import { site } from "@/lib/site";
import { cn } from "@/lib/cn";
import { ButtonLink, Button } from "@/components/ui/button";
import { scenes } from "./scenes";
import { FoldingHomesScene } from "./scenes/folding-homes-scene";
import { FloorPlanView } from "./floorplan";

/* ------------------------------------------------------------------ */
/* Animated price readout                                              */
/* ------------------------------------------------------------------ */

function AnimatedPrice({ value }: { value: number }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(value);
  const spring = useSpring(mv, { stiffness: 140, damping: 24, mass: 0.6 });
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (reduce) {
      // Snap without animating; display falls back to the raw value below.
      mv.jump(value);
      spring.jump(value);
      return;
    }
    mv.set(value);
  }, [value, reduce, mv, spring]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (v) => setDisplay(Math.round(v)));
    return unsubscribe;
  }, [spring]);

  return <span className="tabular-nums">{formatZAR(reduce ? value : display)}</span>;
}

/* ------------------------------------------------------------------ */
/* Option toggle row                                                   */
/* ------------------------------------------------------------------ */

function OptionToggle({
  option,
  checked,
  disabled,
  helper,
  onToggle,
}: {
  option: CustomOption;
  checked: boolean;
  disabled: boolean;
  helper?: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      // aria-disabled (not native disabled) keeps the row in the Tab order so
      // keyboard users can reach the "Add the … first" helper text. Unlike
      // native disabled it does not suppress clicks, so guard the handler.
      aria-disabled={disabled || undefined}
      onClick={disabled ? undefined : onToggle}
      className={cn(
        "group flex w-full items-start gap-4 rounded-2xl border px-4 py-4 text-left transition-colors duration-200 min-h-[44px]",
        checked ? "border-forest/40 bg-parchment" : "border-border bg-cream hover:border-stone/50",
        disabled && "opacity-50 cursor-not-allowed hover:border-border",
      )}
    >
      <span className="flex-1">
        <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="font-medium text-ink">{option.label}</span>
          <span className="text-sm font-medium text-clay-dark">+{formatZAR(option.price)}</span>
          {option.provisional && (
            <span className="rounded-full border border-border bg-cream px-2 py-0.5 text-[0.6875rem] font-medium uppercase tracking-wide text-stone">
              provisional
            </span>
          )}
        </span>
        <span className="mt-1 block text-sm leading-relaxed text-stone">{option.description}</span>
        {helper && <span className="mt-1.5 block text-xs font-medium text-clay-dark">{helper}</span>}
      </span>
      {/* Visual switch track */}
      <span
        aria-hidden="true"
        className={cn(
          "relative mt-0.5 inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors duration-200",
          checked ? "border-forest bg-forest" : "border-border bg-sand",
        )}
      >
        <span
          className={cn(
            "absolute left-0.5 top-0.5 h-5.5 w-5.5 rounded-full bg-cream shadow-[var(--shadow-soft)] transition-transform duration-200 ease-[var(--ease-smooth)]",
            checked ? "translate-x-5" : "translate-x-0",
          )}
        />
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* View tabs — Cutaway · Floor plan · Photos (SPEC-VISUALIZER-V2 §2)   */
/* ------------------------------------------------------------------ */

const VIEW_TABS = [
  { id: "cutaway", label: "Cutaway", icon: Home },
  { id: "floorplan", label: "Floor plan", icon: LayoutGrid },
  { id: "photos", label: "Photos", icon: ImageIcon },
] as const;

type ViewId = (typeof VIEW_TABS)[number]["id"];

/* ------------------------------------------------------------------ */
/* Photos panel — real imagery from the manifest                       */
/* ------------------------------------------------------------------ */

interface ManifestImage {
  src: string;
  width: number;
  height: number;
  alt: string;
  kind: string;
  hero: boolean;
}

const manifestProductImages = manifest.products as Record<string, ManifestImage[]>;
const manifestGalleryImages = manifest.gallery as ManifestImage[];

/** Lookup of every manifest image by src — option photos may live anywhere. */
const imageBySrc = new Map<string, ManifestImage>();
for (const list of [...Object.values(manifestProductImages), manifestGalleryImages]) {
  for (const img of list) {
    if (!imageBySrc.has(img.src)) imageBySrc.set(img.src, img);
  }
}

const PHOTO_SIZES = "(min-width: 1024px) 30vw, 45vw";

function PhotosPanel({
  product,
  activeOptions,
}: {
  product: Product;
  activeOptions: CustomOption[];
}) {
  const photos = (manifestProductImages[product.slug] ?? []).filter(
    (img) => img.kind !== "diagram" && img.kind !== "icon",
  );
  const optionPhotos = activeOptions.filter((o) => o.photo);

  return (
    <div>
      {/* Real photos of active selections, when we have them (never fabricated) */}
      {optionPhotos.length > 0 && (
        <div className="mb-6">
          <h3 className="text-eyebrow mb-3 text-clay-dark">Your selections in real life</h3>
          <div className="grid grid-cols-2 gap-3">
            {optionPhotos.map((option) => {
              const entry = imageBySrc.get(option.photo as string);
              return (
                <figure
                  key={option.id}
                  className="overflow-hidden rounded-2xl border border-border bg-cream"
                >
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={option.photo as string}
                      alt={entry?.alt ?? `Example image for ${option.label}`}
                      fill
                      sizes={PHOTO_SIZES}
                      className="object-cover"
                    />
                  </div>
                  <figcaption className="px-3 py-2 text-xs leading-relaxed text-stone">
                    {option.label} — example; finishes confirmed on your quote
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </div>
      )}

      {/* Product gallery */}
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {photos.map((img) => (
            <div
              key={img.src}
              className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-cream"
            >
              <Image src={img.src} alt={img.alt} fill sizes={PHOTO_SIZES} className="object-cover" />
            </div>
          ))}
        </div>
      ) : (
        <p className="py-8 text-center text-sm leading-relaxed text-stone">
          Photos of this unit are on their way — the cutaway and floor plan views show your full
          configuration in the meantime.
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main configurator                                                   */
/* ------------------------------------------------------------------ */

const CATEGORY_ORDER: OptionCategory[] = ["structure", "interior", "modules", "energy", "comfort"];
const CATEGORY_LABELS: Record<OptionCategory, string> = {
  structure: "Structure",
  interior: "Interior",
  modules: "Modules",
  energy: "Energy",
  comfort: "Comfort",
};

const NO_OPTIONS: Partial<Record<string, boolean>> = {};

export function ProductConfigurator({ product }: { product: Product }) {
  const reduce = useReducedMotion();
  const uid = useId();
  const [selected, setSelected] = useState<Partial<Record<string, boolean>>>(NO_OPTIONS);
  const [furnished, setFurnished] = useState(false);
  const [variantId, setVariantId] = useState<string | undefined>(product.variants?.[0]?.id);
  const [view, setView] = useState<ViewId>("cutaway");
  const [announcement, setAnnouncement] = useState("");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const total = useMemo(
    () => configuredPrice(product, selected, variantId),
    [product, selected, variantId],
  );

  const activeVariant = product.variants?.find((v) => v.id === variantId);

  const toggleOption = useCallback(
    (option: CustomOption) => {
      setSelected((prev) => {
        const turningOn = !prev[option.id];
        const next: Partial<Record<string, boolean>> = { ...prev, [option.id]: turningOn };
        // Deselecting a prerequisite unchecks its dependents.
        if (!turningOn) {
          for (const opt of product.options) {
            if (opt.requires === option.id) next[opt.id] = false;
          }
        }
        const nextTotal = configuredPrice(product, next, variantId);
        setAnnouncement(
          `${option.label} ${turningOn ? "added" : "removed"}. Total ${formatZAR(nextTotal)}`,
        );
        return next;
      });
    },
    [product, variantId],
  );

  const pickVariant = useCallback(
    (id: string) => {
      setVariantId(id);
      const variant = product.variants?.find((v) => v.id === id);
      if (variant) {
        const nextTotal = configuredPrice(product, selected, id);
        setAnnouncement(`${variant.name} selected. Total ${formatZAR(nextTotal)}`);
      }
    },
    [product, selected],
  );

  const setFurnish = useCallback((value: boolean) => {
    setFurnished(value);
    setAnnouncement(value ? "Furnished view shown." : "Empty shell view shown.");
  }, []);

  const pickView = useCallback((id: ViewId) => {
    setView(id);
    const tab = VIEW_TABS.find((t) => t.id === id);
    if (tab) setAnnouncement(`${tab.label} view.`);
  }, []);

  /* Roving tabindex: Left/Right (plus Home/End) move focus AND selection. */
  const onTabKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
      let next: number | null = null;
      if (event.key === "ArrowRight") next = (index + 1) % VIEW_TABS.length;
      else if (event.key === "ArrowLeft") next = (index - 1 + VIEW_TABS.length) % VIEW_TABS.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = VIEW_TABS.length - 1;
      if (next === null) return;
      event.preventDefault();
      pickView(VIEW_TABS[next].id);
      tabRefs.current[next]?.focus();
    },
    [pickView],
  );

  const reset = useCallback(() => {
    setSelected(NO_OPTIONS);
    setFurnished(false);
    setVariantId(product.variants?.[0]?.id);
    setAnnouncement(
      `Configuration reset. Total ${formatZAR(
        configuredPrice(product, NO_OPTIONS, product.variants?.[0]?.id),
      )}`,
    );
  }, [product]);

  /* Selected chips (effective — dependents only count when prerequisite met) */
  const activeOptions = product.options.filter(
    (o) => selected[o.id] && (!o.requires || selected[o.requires]),
  );

  const selectedIds = activeOptions.map((o) => o.id);
  const contactHref = `/contact?${new URLSearchParams({
    product: product.slug,
    ...(variantId ? { variant: variantId } : {}),
    ...(selectedIds.length ? { options: selectedIds.join(",") } : {}),
  }).toString()}`;

  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    options: product.options.filter((o) => o.category === category),
  })).filter((g) => g.options.length > 0);

  const chips: { key: string; label: string }[] = [
    ...(activeVariant ? [{ key: `variant-${activeVariant.id}`, label: activeVariant.name }] : []),
    ...activeOptions.map((o) => ({ key: o.id, label: o.label })),
  ];

  return (
    <div data-configurator={product.slug}>
      {/* Screen-reader announcements */}
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>

      <div className="grid gap-8 lg:grid-cols-[3fr_2fr] lg:items-start">
        {/* ------------------------------------------------ Scene column */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          {/* View tabs + furnish segmented control */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div
              role="tablist"
              aria-label="Visualiser view"
              className="inline-flex rounded-full border border-border bg-cream p-1"
            >
              {VIEW_TABS.map((tab, index) => {
                const active = view === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    ref={(el) => {
                      tabRefs.current[index] = el;
                    }}
                    type="button"
                    role="tab"
                    id={`${uid}-tab-${tab.id}`}
                    aria-selected={active}
                    aria-controls={`${uid}-panel-${tab.id}`}
                    tabIndex={active ? 0 : -1}
                    onClick={() => pickView(tab.id)}
                    onKeyDown={(event) => onTabKeyDown(event, index)}
                    className={cn(
                      "inline-flex min-h-[44px] items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors duration-200 sm:px-5",
                      active ? "bg-forest text-cream" : "text-stone hover:text-ink",
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Furnish control affects Cutaway and Floor plan; hidden on Photos */}
            {view !== "photos" && (
              <div
                className="inline-flex rounded-full border border-border bg-cream p-1"
                role="group"
                aria-label="Interior view"
              >
                <button
                  type="button"
                  aria-pressed={!furnished}
                  onClick={() => setFurnish(false)}
                  className={cn(
                    "inline-flex min-h-[44px] items-center gap-2 rounded-full px-5 text-sm font-medium transition-colors duration-200",
                    !furnished ? "bg-forest text-cream" : "text-stone hover:text-ink",
                  )}
                >
                  <Box className="h-4 w-4" aria-hidden="true" />
                  Empty shell
                </button>
                <button
                  type="button"
                  aria-pressed={furnished}
                  onClick={() => setFurnish(true)}
                  className={cn(
                    "inline-flex min-h-[44px] items-center gap-2 rounded-full px-5 text-sm font-medium transition-colors duration-200",
                    furnished ? "bg-forest text-cream" : "text-stone hover:text-ink",
                  )}
                >
                  <Sofa className="h-4 w-4" aria-hidden="true" />
                  Furnished
                </button>
              </div>
            )}
          </div>

          {/* View panels — crossfade; state lives in the parent so only the
              active panel needs to stay mounted */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={view}
              role="tabpanel"
              id={`${uid}-panel-${view}`}
              aria-labelledby={`${uid}-tab-${view}`}
              tabIndex={0}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.2 }}
            >
              <div className="overflow-hidden rounded-3xl border border-border bg-parchment p-4 sm:p-6">
                {view === "cutaway" && (
                  <SceneSlot
                    slug={product.slug}
                    visuals={activeVisuals(product, selected)}
                    furnished={furnished}
                    variantId={variantId}
                  />
                )}
                {view === "floorplan" && (
                  <FloorPlanView
                    product={product}
                    selected={selected}
                    furnished={furnished}
                    variantId={variantId}
                  />
                )}
                {view === "photos" && (
                  <PhotosPanel product={product} activeOptions={activeOptions} />
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Active selection chips */}
          <div className="mt-4 flex min-h-[2rem] flex-wrap items-center gap-2" aria-hidden="true">
            <AnimatePresence>
              {chips.map((chip) => (
                <motion.span
                  key={chip.key}
                  layout={!reduce}
                  initial={reduce ? false : { opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-forest/25 bg-parchment px-3 py-1 text-xs font-medium text-forest"
                >
                  <Armchair className="h-3 w-3" aria-hidden="true" />
                  {chip.label}
                </motion.span>
              ))}
            </AnimatePresence>
            {chips.length === 0 && (
              <span className="text-xs text-stone">Base configuration — add options to see them appear.</span>
            )}
          </div>
        </div>

        {/* ------------------------------------------------ Controls column */}
        <div className="flex flex-col gap-8">
          {/* Variant picker */}
          {product.variants && product.variants.length > 0 && (
            <fieldset>
              <legend className="text-eyebrow mb-3 text-clay-dark">Choose your size</legend>
              <div role="group" aria-label="Model variant" className="grid gap-2">
                {product.variants.map((variant) => {
                  const active = variant.id === variantId;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => pickVariant(variant.id)}
                      className={cn(
                        "flex min-h-[44px] w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition-colors duration-200",
                        active
                          ? "border-forest bg-forest text-cream"
                          : "border-border bg-cream text-ink hover:border-stone/50",
                      )}
                    >
                      <span>
                        <span className="font-medium">{variant.name}</span>
                        <span className={cn("ml-2 text-sm", active ? "text-sage" : "text-stone")}>
                          {variant.size}
                        </span>
                      </span>
                      <span className={cn("text-sm font-medium tabular-nums", active ? "text-cream" : "text-ink")}>
                        {formatZAR(variant.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
              {activeVariant && (
                <p className="mt-2 text-sm leading-relaxed text-stone">{activeVariant.description}</p>
              )}
            </fieldset>
          )}

          {/* Option groups */}
          {grouped.map((group) => (
            <fieldset key={group.category}>
              <legend className="text-eyebrow mb-3 text-clay-dark">{CATEGORY_LABELS[group.category]}</legend>
              <div className="grid gap-2">
                {group.options.map((option) => {
                  const requirementMet = !option.requires || Boolean(selected[option.requires]);
                  return (
                    <OptionToggle
                      key={option.id}
                      option={option}
                      checked={Boolean(selected[option.id]) && requirementMet}
                      disabled={!requirementMet}
                      helper={
                        !requirementMet
                          ? `Add the ${product.options.find((o) => o.id === option.requires)?.label.toLowerCase() ?? "required option"} first`
                          : undefined
                      }
                      onToggle={() => toggleOption(option)}
                    />
                  );
                })}
              </div>
            </fieldset>
          ))}

          {/* Price panel */}
          <div className="rounded-3xl border border-border bg-parchment p-6">
            <h3 className="text-eyebrow text-clay-dark">Your configuration</h3>
            <p className="mt-3 flex items-baseline gap-2">
              <span className="text-display text-4xl text-ink sm:text-5xl">
                <AnimatedPrice value={total} />
              </span>
              <span className="text-sm font-medium text-stone">ex VAT</span>
            </p>
            <p className="mt-4 text-sm leading-relaxed text-stone">{site.deliveryNote}</p>
            <p className="mt-2 text-xs leading-relaxed text-stone">
              Optional extras carry provisional pricing and will be confirmed on your final quote.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <ButtonLink href={contactHref} variant="accent">
                Request this configuration
              </ButtonLink>
              <Button variant="ghost" onClick={reset}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scene slot — resolves the product's cutaway scene                   */
/* ------------------------------------------------------------------ */

function SceneSlot({
  slug,
  visuals,
  furnished,
  variantId,
}: {
  slug: string;
  visuals: Partial<Record<VisualKey, boolean>>;
  furnished: boolean;
  variantId?: string;
}) {
  // Component map lookup — falls back to the folding scene for unknown slugs.
  const Scene = scenes[slug] ?? FoldingHomesScene;
  return <Scene visuals={visuals} furnished={furnished} variantId={variantId} />;
}

/* ------------------------------------------------------------------ */
/* Skeleton                                                            */
/* ------------------------------------------------------------------ */

export function ConfiguratorSkeleton() {
  return (
    <div
      className="h-[32rem] w-full animate-pulse rounded-3xl border border-border bg-parchment"
      aria-hidden="true"
    />
  );
}
