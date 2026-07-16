"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, type ReadonlyURLSearchParams } from "next/navigation";
import { Check, Loader2, Minus, Plus, Trash2 } from "lucide-react";
import {
  configuredPrice,
  getProduct,
  products,
  type CustomOption,
  type Product,
  type ProductVariant,
} from "@/data/products";
import { formatZAR } from "@/lib/format";
import { site } from "@/lib/site";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { TextField, inputClasses, labelClasses } from "./fields";
import { ProductPicker, VariantPicker } from "./product-picker";
import { ExtrasPicker } from "./extras-picker";
import { AddressFields } from "./address-fields";
import { SummaryCard } from "./summary-card";

/* ------------------------------------------------------------ types */

export type ContactField = "name" | "email" | "phone";
export type AddressField = "street" | "suburb" | "city" | "province" | "postal";
export type FieldName = ContactField | AddressField;

export interface AddressValues {
  street: string;
  suburb: string;
  city: string;
  province: string;
  postal: string;
}

const EMPTY_ADDRESS: AddressValues = {
  street: "",
  suburb: "",
  city: "",
  province: "",
  postal: "",
};

/** One configured unit in the order — the editable line-item model. */
interface LineItem {
  /** Stable local id, used for React keys and to target edits/removals. */
  id: string;
  /** Product slug — always set (items are only created once a product is chosen). */
  slug: string;
  variantId: string | undefined;
  selected: Partial<Record<string, boolean>>;
  /** 1–10 units of this exact configuration. */
  quantity: number;
}

/** A line resolved against the catalogue for pricing, summary and messages. */
export interface QuoteLine {
  id: string;
  product: Product;
  variant: ProductVariant | undefined;
  activeOptions: CustomOption[];
  quantity: number;
  /** Base (variant or startingPrice) + selected extras, for a single unit. */
  unitPrice: number;
  /** unitPrice × quantity. */
  lineTotal: number;
}

const QUANTITY_MIN = 1;
const QUANTITY_MAX = 10;

/* ------------------------------------------------------- deep links */

interface DeepLink {
  slug: string;
  variantId: string | undefined;
  selected: Partial<Record<string, boolean>>;
}

/** Parse ?product=&variant=&options= into a starting configuration; invalid
    values fall back gracefully (unknown product → no selection). */
function parseDeepLink(sp: ReadonlyURLSearchParams): DeepLink {
  const product = sp.get("product") ? getProduct(sp.get("product") as string) : undefined;
  if (!product) return { slug: "", variantId: undefined, selected: {} };

  const variantParam = sp.get("variant");
  const variantId =
    product.variants?.find((v) => v.id === variantParam)?.id ?? product.variants?.[0]?.id;

  const selected: Partial<Record<string, boolean>> = {};
  const optionsParam = sp.get("options");
  if (optionsParam) {
    for (const raw of optionsParam.split(",")) {
      const id = raw.trim();
      if (id && product.options.some((o) => o.id === id)) selected[id] = true;
    }
  }

  return { slug: product.slug, variantId, selected };
}

/* ------------------------------------------------------- validation */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(field: FieldName, value: string): string | null {
  const t = value.trim();
  switch (field) {
    case "name":
      return t ? null : "Please enter your name so we know who we're talking to.";
    case "email":
      if (!t) return "Please enter your email address so we can reply to you.";
      return EMAIL_RE.test(t)
        ? null
        : "That email doesn't look complete — check for a missing @ or domain, e.g. name@example.com.";
    case "phone": {
      if (!t) return "Please add a phone number — we need one to coordinate delivery.";
      const digits = t.replace(/\D/g, "");
      return digits.length < 9
        ? "That number looks too short — include the full code, e.g. 083 660 3743."
        : null;
    }
    case "street":
      return t ? null : "Please enter the street address for delivery.";
    case "suburb":
      return t ? null : "Please enter the suburb.";
    case "city":
      return t ? null : "Please enter the city or town.";
    case "province":
      return t ? null : "Please select a province.";
    case "postal":
      if (!t) return "Please enter a postal code.";
      return /^\d{4}$/.test(t) ? null : "A South African postal code is 4 digits, e.g. 0157.";
  }
}

const FOCUS_ORDER: FieldName[] = [
  "name",
  "email",
  "phone",
  "street",
  "suburb",
  "city",
  "province",
  "postal",
];

/** DOM ids for each field — used to focus the first invalid field on submit. */
const FIELD_IDS: Record<FieldName, string> = {
  name: "quote-name",
  email: "quote-email",
  phone: "quote-phone",
  street: "quote-street",
  suburb: "quote-suburb",
  city: "quote-city",
  province: "quote-province",
  postal: "quote-postal",
};

/* ------------------------------------------------------------- step */

function Step({
  n,
  title,
  description,
  delay,
  children,
}: {
  n: number;
  title: string;
  description?: string;
  delay?: number;
  children: React.ReactNode;
}) {
  return (
    <Reveal delay={delay}>
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-clay/40 text-sm font-semibold text-clay-dark">
          {n}
        </span>
        <h2 className="text-display text-2xl text-ink sm:text-3xl">{title}</h2>
      </div>
      {description && (
        <p className="ml-11 mt-2 text-sm leading-relaxed text-stone">{description}</p>
      )}
      <div className="ml-0 mt-6 sm:ml-11">{children}</div>
    </Reveal>
  );
}

/* -------------------------------------------------- quantity stepper */

function QuantityStepper({
  quantity,
  label,
  onChange,
}: {
  quantity: number;
  /** Human-readable unit name, for the accessible group/button labels. */
  label: string;
  onChange: (next: number) => void;
}) {
  const btn =
    "flex h-8 w-8 items-center justify-center text-stone transition-colors hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-clay/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-stone";
  return (
    <div
      role="group"
      aria-label={`Quantity for ${label}`}
      className="inline-flex items-center rounded-xl border border-border bg-cream"
    >
      <button
        type="button"
        aria-label={`Decrease quantity for ${label}`}
        disabled={quantity <= QUANTITY_MIN}
        onClick={() => onChange(quantity - 1)}
        className={cn(btn, "rounded-l-xl")}
      >
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>
      <span
        aria-live="polite"
        className="w-8 select-none text-center text-sm font-medium tabular-nums text-ink"
      >
        {quantity}
      </span>
      <button
        type="button"
        aria-label={`Increase quantity for ${label}`}
        disabled={quantity >= QUANTITY_MAX}
        onClick={() => onChange(quantity + 1)}
        className={cn(btn, "rounded-r-xl")}
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

/* -------------------------------------------------------- units list */

function UnitsList({
  lines,
  editingId,
  onEdit,
  onRemove,
  onQuantity,
}: {
  lines: QuoteLine[];
  editingId: string | null;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
  onQuantity: (id: string, next: number) => void;
}) {
  return (
    <ul className="space-y-3">
      {lines.map((line) => {
        const isEditing = line.id === editingId;
        const name = line.variant ? line.variant.name : line.product.shortName;
        const extras = line.activeOptions.length;
        return (
          <li
            key={line.id}
            className={cn(
              "rounded-2xl border p-4 transition-colors",
              isEditing ? "border-forest bg-parchment" : "border-border bg-cream",
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-display text-base text-ink">{line.product.name}</p>
                <p className="mt-0.5 text-sm text-stone">
                  {line.variant ? `${name} · ` : ""}
                  {extras === 0 ? "No extras" : `${extras} ${extras === 1 ? "extra" : "extras"}`}
                  {isEditing && (
                    <span className="ml-2 rounded-full border border-forest/40 bg-cream px-2 py-0.5 text-[0.6875rem] font-medium uppercase tracking-wide text-forest">
                      Editing
                    </span>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(line.id)}
                aria-label={`Remove ${name} from your units`}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-stone transition-colors hover:text-clay-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-clay/30"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between gap-4">
              <QuantityStepper
                quantity={line.quantity}
                label={name}
                onChange={(next) => onQuantity(line.id, next)}
              />
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium tabular-nums text-ink">
                  {line.product.priceOnRequest ? (
                    <span className="text-xs font-normal text-stone">on consultation</span>
                  ) : (
                    formatZAR(line.lineTotal)
                  )}
                </span>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => onEdit(line.id)}
                    className="text-sm font-medium text-clay-dark underline underline-offset-4 transition-colors hover:text-clay focus:outline-none focus-visible:ring-2 focus-visible:ring-clay/30"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/* -------------------------------------------------------- inner form */

function QuoteFormInner() {
  const searchParams = useSearchParams();
  const deep = useMemo(() => parseDeepLink(searchParams), [searchParams]);

  // Local id generation. The first item (from a deep link) claims "unit-0", so
  // the counter starts at 1 to avoid collisions. Deterministic across
  // SSR/hydration since it never uses randomness.
  const idCounter = useRef(1);
  const makeId = () => `unit-${idCounter.current++}`;

  const [items, setItems] = useState<LineItem[]>(() =>
    deep.slug
      ? [
          {
            id: "unit-0",
            slug: deep.slug,
            variantId: deep.variantId,
            selected: deep.selected,
            quantity: 1,
          },
        ]
      : [],
  );
  // Which line the editor is bound to. `null` means "adding a new unit" — the
  // editor is a blank draft until a product is picked (which creates the item).
  const [editingId, setEditingId] = useState<string | null>(deep.slug ? "unit-0" : null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState<AddressValues>(EMPTY_ADDRESS);
  const [notes, setNotes] = useState("");

  const [errors, setErrors] = useState<Partial<Record<FieldName, string | null>>>({});
  const [productError, setProductError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const pickerRef = useRef<HTMLDivElement>(null);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);

  // Focus the success heading when it appears so screen readers announce the
  // confirmation — a live region mounted together with its content is often
  // skipped by AT.
  useEffect(() => {
    if (sent) successHeadingRef.current?.focus();
  }, [sent]);

  /* -------- editor state (derived from the item being edited) */
  const editingItem = items.find((i) => i.id === editingId);
  const slug = editingItem?.slug ?? "";
  const product = slug ? getProduct(slug) : undefined;
  const variantId = editingItem?.variantId;
  const selected = editingItem?.selected ?? {};

  /** Resolve a raw line item against the catalogue for pricing/summary/message. */
  const resolveLine = (item: LineItem): QuoteLine | null => {
    const p = getProduct(item.slug);
    if (!p) return null;
    const v = p.variants?.find((x) => x.id === item.variantId);
    const activeOptions = p.options.filter(
      (o) => item.selected[o.id] && (!o.requires || item.selected[o.requires]),
    );
    const unitPrice = configuredPrice(p, item.selected, item.variantId);
    return {
      id: item.id,
      product: p,
      variant: v,
      activeOptions,
      quantity: item.quantity,
      unitPrice,
      lineTotal: unitPrice * item.quantity,
    };
  };

  const lines: QuoteLine[] = items
    .map(resolveLine)
    .filter((l): l is QuoteLine => l !== null);

  const pricedLines = lines.filter((l) => !l.product.priceOnRequest);
  const hasPricedTotal = pricedLines.length > 0;
  const someOnRequest = lines.some((l) => l.product.priceOnRequest);
  const grandTotal = pricedLines.reduce((sum, l) => sum + l.lineTotal, 0);
  const totalUnits = lines.reduce((sum, l) => sum + l.quantity, 0);

  /* -------- editor handlers (operate on the editing item) */
  const scrollToPicker = () => {
    pickerRef.current?.scrollIntoView({ block: "start" });
    pickerRef.current?.focus();
  };

  const handleSelectProduct = (nextSlug: string) => {
    const next = getProduct(nextSlug);
    if (editingItem) {
      if (nextSlug === editingItem.slug) return;
      // Change the product of the item being edited; reset its size/extras.
      setItems((prev) =>
        prev.map((i) =>
          i.id === editingId
            ? { ...i, slug: nextSlug, variantId: next?.variants?.[0]?.id, selected: {} }
            : i,
        ),
      );
    } else {
      // Adding a new unit — create the item and switch the editor to it.
      const id = makeId();
      setItems((prev) => [
        ...prev,
        { id, slug: nextSlug, variantId: next?.variants?.[0]?.id, selected: {}, quantity: 1 },
      ]);
      setEditingId(id);
    }
    setProductError(null);
  };

  const handleSelectVariant = (id: string) => {
    setItems((prev) => prev.map((i) => (i.id === editingId ? { ...i, variantId: id } : i)));
  };

  const toggleOption = (option: CustomOption) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== editingId || !product) return i;
        const turningOn = !i.selected[option.id];
        const nextSel: Partial<Record<string, boolean>> = {
          ...i.selected,
          [option.id]: turningOn,
        };
        // Deselecting a prerequisite unchecks anything that depends on it.
        if (!turningOn) {
          for (const opt of product.options) {
            if (opt.requires === option.id) nextSel[opt.id] = false;
          }
        }
        return { ...i, selected: nextSel };
      }),
    );
  };

  /* -------- units-list handlers (operate by id) */
  const handleQuantity = (id: string, next: number) => {
    const clamped = Math.min(QUANTITY_MAX, Math.max(QUANTITY_MIN, next));
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: clamped } : i)));
  };

  const handleRemove = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    // If the edited unit was removed, drop back into "add a new unit" mode.
    if (editingId === id) setEditingId(null);
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    scrollToPicker();
  };

  const handleAddAnother = () => {
    setEditingId(null);
    setProductError(null);
    scrollToPicker();
  };

  const contactValue = (field: ContactField) =>
    field === "name" ? name : field === "email" ? email : phone;

  const handleContactBlur = (field: ContactField) => {
    setErrors((prev) => ({ ...prev, [field]: validate(field, contactValue(field)) }));
  };

  const handleAddressChange = (field: AddressField, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };
  const handleAddressBlur = (field: AddressField) => {
    setErrors((prev) => ({ ...prev, [field]: validate(field, address[field]) }));
  };

  /* -------- message composition */
  const composeMessage = () => {
    const out: string[] = ["New quote request via tinyhomesa.com", ""];

    out.push(`Units (${totalUnits} total):`);
    lines.forEach((l, idx) => {
      const title = l.variant ? l.variant.name : l.product.name;
      const size = l.variant ? ` (${l.variant.size})` : "";
      out.push(`${idx + 1}. ${l.quantity} × ${title}${size}`);
      if (l.activeOptions.length > 0) {
        out.push("   Extras:");
        for (const o of l.activeOptions) {
          out.push(
            `   - ${o.label}${o.price > 0 ? ` (+${formatZAR(o.price)})` : " (priced on quotation)"}`,
          );
        }
      }
      out.push(
        l.product.priceOnRequest
          ? "   Line estimate: priced after consultation"
          : `   Line estimate (ex VAT): ${formatZAR(l.lineTotal)}`,
      );
    });

    if (hasPricedTotal) {
      out.push("", `Estimated total (ex VAT): ${formatZAR(grandTotal)}`);
      if (someOnRequest) out.push("(plus units priced after consultation)");
    } else {
      out.push("", "Estimated total: priced after consultation");
    }

    out.push("", `Name: ${name.trim()}`);
    out.push(`Email: ${email.trim()}`);
    out.push(`Phone: ${phone.trim()}`);

    out.push("", "Delivery address:");
    out.push(address.street.trim());
    out.push(`${address.suburb.trim()}, ${address.city.trim()}`);
    out.push(`${address.province}, ${address.postal.trim()}`);

    if (notes.trim()) out.push("", `Notes: ${notes.trim()}`);
    return out.join("\n");
  };

  const mailtoHref = () => {
    const label =
      lines.length === 1
        ? (lines[0].variant?.name ?? lines[0].product.name)
        : `${totalUnits} units`;
    const subject = `Quote request — ${lines.length > 0 ? label : "Tiny Homes SA"}`;
    return `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      composeMessage(),
    )}`;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (lines.length === 0) {
      setProductError("Please add at least one unit to your quote before sending your request.");
      pickerRef.current?.scrollIntoView({ block: "center" });
      // Move keyboard focus into the picker so the error is actionable, not
      // just audible — mirrors the focus-first-error behaviour of the fields.
      pickerRef.current?.focus();
      return;
    }

    const nextErrors: Partial<Record<FieldName, string | null>> = {};
    for (const field of FOCUS_ORDER) {
      nextErrors[field] = validate(
        field,
        field === "name" || field === "email" || field === "phone"
          ? contactValue(field)
          : address[field],
      );
    }
    setErrors(nextErrors);

    const firstBad = FOCUS_ORDER.find((f) => nextErrors[f]);
    if (firstBad) {
      document.getElementById(FIELD_IDS[firstBad])?.focus();
      return;
    }

    // Open synchronously inside the submit handler so popup blockers allow it.
    const text = composeMessage();
    window.open(`${site.whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 700);
  };

  /* -------- success state */
  if (sent) {
    return (
      <div className="rounded-3xl border border-border bg-parchment/60 p-8 sm:p-10">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-forest text-cream">
          <Check className="h-6 w-6" aria-hidden="true" />
        </span>
        <h3
          ref={successHeadingRef}
          tabIndex={-1}
          className="text-display mt-6 text-2xl text-ink focus:outline-none sm:text-3xl"
        >
          Your quote request is on its way
        </h3>
        <p className="mt-4 leading-relaxed text-stone">
          WhatsApp should have opened in a new tab with your units and delivery address pre-filled —
          just press send there and we&apos;ll come back with a formal quotation, including delivery
          to your site.
        </p>
        <p className="mt-4 leading-relaxed text-stone">
          Didn&apos;t open, or prefer email?{" "}
          <a
            href={mailtoHref()}
            className="font-medium text-clay-dark underline underline-offset-4 transition-colors hover:text-clay"
          >
            Send the same request by email
          </a>{" "}
          or call us on{" "}
          <a
            href={`tel:${site.phone.replace(/\s/g, "")}`}
            className="font-medium text-clay-dark underline underline-offset-4 transition-colors hover:text-clay"
          >
            {site.phoneDisplay}
          </a>
          .
        </p>
      </div>
    );
  }

  const summary = <SummaryCard lines={lines} />;

  const editorHeading = editingItem ? "Configure this unit" : "Add a unit";

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
      <form onSubmit={handleSubmit} noValidate className="space-y-14">
        {/* Step 1 — choose your homes */}
        <Step
          n={1}
          title="Choose your homes"
          description="Configure a unit, then add it to your order. Need more than one? Add another unit, or bump the quantity on any line — mix and match as many homes as you like."
        >
          <p className="text-eyebrow mb-3 text-clay-dark">{editorHeading}</p>
          <div ref={pickerRef} tabIndex={-1} className="scroll-mt-24 focus:outline-none">
            <ProductPicker products={products} selectedSlug={slug} onSelect={handleSelectProduct} />
            {productError && (
              <p role="alert" className="mt-3 text-sm text-clay-dark">
                {productError}
              </p>
            )}
          </div>

          {product?.variants && product.variants.length > 0 && (
            <div className="mt-8">
              <p className="text-eyebrow mb-3 text-clay-dark">Choose your size</p>
              <VariantPicker
                product={product}
                variantId={variantId}
                onSelect={handleSelectVariant}
              />
            </div>
          )}

          {product && product.options.length > 0 && (
            <div className="mt-8">
              <p className="text-eyebrow mb-3 text-clay-dark">Add extras</p>
              <p className="mb-4 text-sm leading-relaxed text-stone">
                Every extra is provisional and confirmed line by line on your formal quotation.
                Items shown as &ldquo;priced on quotation&rdquo; are quoted per site.
              </p>
              <ExtrasPicker product={product} selected={selected} onToggle={toggleOption} />
            </div>
          )}

          {product?.priceOnRequest && (
            <p className="mt-8 rounded-2xl border border-border bg-parchment/60 p-5 text-sm leading-relaxed text-stone">
              Safari tents are configured to your site and brief, so there&apos;s no fixed price or
              options list here — add it to your units and we&apos;ll arrange a consultation and an
              itemised quotation.
            </p>
          )}

          {/* Your units — the running order */}
          {lines.length > 0 && (
            <div className="mt-10 border-t border-border pt-8">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-display text-xl text-ink">Your units</h3>
                <span className="text-sm text-stone">
                  {totalUnits} {totalUnits === 1 ? "unit" : "units"}
                </span>
              </div>
              <p className="mb-4 mt-1 text-sm leading-relaxed text-stone">
                Adjust the quantity, edit a configuration or remove a unit at any time.
              </p>
              <UnitsList
                lines={lines}
                editingId={editingId}
                onEdit={handleEdit}
                onRemove={handleRemove}
                onQuantity={handleQuantity}
              />
              <button
                type="button"
                onClick={handleAddAnother}
                className={cn(
                  "mt-4 inline-flex items-center gap-2 rounded-xl border border-dashed border-clay/50 px-4 py-3 text-sm font-medium text-clay-dark transition-colors hover:border-clay hover:bg-parchment/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-clay/30",
                  editingId === null && "border-forest/50 bg-parchment/60 text-forest",
                )}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add another unit
              </button>
            </div>
          )}
        </Step>

        {/* Step 2 — your details */}
        <Step n={2} title="Your details" delay={0.05}>
          <div className="space-y-5">
            <TextField
              id="quote-name"
              label="Full name"
              value={name}
              onValueChange={setName}
              onBlur={() => handleContactBlur("name")}
              error={errors.name}
              required
              autoComplete="name"
              placeholder="Thandi Nkosi"
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                id="quote-email"
                label="Email"
                type="email"
                value={email}
                onValueChange={setEmail}
                onBlur={() => handleContactBlur("email")}
                error={errors.email}
                required
                autoComplete="email"
                placeholder="you@example.com"
              />
              <TextField
                id="quote-phone"
                label="Phone"
                type="tel"
                value={phone}
                onValueChange={setPhone}
                onBlur={() => handleContactBlur("phone")}
                error={errors.phone}
                required
                autoComplete="tel"
                inputMode="tel"
                placeholder="083 660 3743"
              />
            </div>
          </div>
        </Step>

        {/* Step 3 — delivery address */}
        <Step
          n={3}
          title="Delivery address"
          description="Where should the homes go? We use this to calculate an accurate delivery and shipping quote to the site."
          delay={0.05}
        >
          <AddressFields
            values={address}
            errors={errors}
            onChange={handleAddressChange}
            onBlur={handleAddressBlur}
          />
        </Step>

        {/* Step 4 — notes */}
        <Step n={4} title="Anything else?" delay={0.05}>
          <label htmlFor="quote-notes" className={labelClasses}>
            Notes <span className="font-normal text-stone">(optional)</span>
          </label>
          <textarea
            id="quote-notes"
            name="quote-notes"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Tell us about your site, access, timeline or any questions — e.g. slab already poured, delivery needed before December."
            className={cn(inputClasses, "h-auto min-h-28 resize-y py-3.5")}
          />
        </Step>

        {/* Mobile summary — keeps the estimate in view above the submit button */}
        <div className="lg:hidden">{summary}</div>

        {/* Submit */}
        <div className="pt-1">
          <Button
            type="submit"
            variant="accent"
            size="lg"
            disabled={sending}
            className={cn("w-full sm:w-auto", sending && "cursor-wait opacity-80")}
          >
            {sending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                Opening WhatsApp…
              </>
            ) : (
              "Send quote request via WhatsApp"
            )}
          </Button>
          <p className="mt-3 text-sm leading-relaxed text-stone">
            This opens WhatsApp with your quote request pre-filled — nothing is stored on our site.
            Prefer email?{" "}
            <a
              href={mailtoHref()}
              className="font-medium text-clay-dark underline underline-offset-4 transition-colors hover:text-clay"
            >
              Write to {site.email}
            </a>
            .
          </p>
        </div>
      </form>

      {/* Desktop sticky summary */}
      <aside className="hidden lg:block" aria-label="Your estimate">
        <div className="lg:sticky lg:top-24">{summary}</div>
      </aside>
    </div>
  );
}

/* ---------------------------------------------------- suspense wrap */

function QuoteFormFallback() {
  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16" aria-hidden="true">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-56 rounded-3xl border border-border bg-parchment/60" />
          ))}
        </div>
        <div className="h-12 rounded-xl border border-border bg-parchment/60" />
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="h-12 rounded-xl border border-border bg-parchment/60" />
          <div className="h-12 rounded-xl border border-border bg-parchment/60" />
        </div>
      </div>
      <div className="hidden h-80 rounded-3xl border border-border bg-parchment/60 lg:block" />
    </div>
  );
}

/**
 * Instant-quote form. useSearchParams() requires a Suspense boundary in the
 * App Router, so the inner form is wrapped here.
 */
export function QuoteForm() {
  return (
    <Suspense fallback={<QuoteFormFallback />}>
      <QuoteFormInner />
    </Suspense>
  );
}
