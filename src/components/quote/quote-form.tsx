"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { useSearchParams, type ReadonlyURLSearchParams } from "next/navigation";
import { Loader2, Minus, Plus, Trash2 } from "lucide-react";
import { getProduct, optionPrice, products, type CustomOption } from "@/data/products";
import { formatZAR } from "@/lib/format";
import { site } from "@/lib/site";
import { cn } from "@/lib/cn";
import {
  QUANTITY_MAX,
  QUANTITY_MIN,
  lineTitle,
  makeQuoteReference,
  quoteTotals,
  resolveQuoteLine,
  type AddressField,
  type AddressValues,
  type ContactField,
  type ContactValues,
  type QuoteLine,
  type QuoteUnit,
} from "@/lib/quote";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { TextField, inputClasses, labelClasses } from "./fields";
import { ProductPicker, VariantPicker } from "./product-picker";
import { ExtrasPicker } from "./extras-picker";
import { AddressFields } from "./address-fields";
import { SummaryCard } from "./summary-card";
import { QuoteDocument } from "./quote-document";

/* ------------------------------------------------------------ types */

export type FieldName = ContactField | AddressField;

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

/** The issued quote — set once, then rendered in place of the form. */
interface IssuedQuote {
  reference: string;
  date: Date;
  contact: ContactValues;
  address: AddressValues;
  notes: string;
  lines: QuoteLine[];
  /** Whether the shipping-quote request actually reached the office. */
  delivered: boolean;
  /** Whether the customer's own copy of the quotation reached their inbox. */
  copySent: boolean;
}

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
    case "firstName":
      return t ? null : "Please enter your first name so we know who we're talking to.";
    case "surname":
      return t ? null : "Please enter your surname — it goes on your quotation.";
    case "email":
      if (!t) return "Please enter your email address so we can send your quote and delivery quote.";
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

const CONTACT_FIELDS: ContactField[] = ["firstName", "surname", "email", "phone"];

const FOCUS_ORDER: FieldName[] = [
  ...CONTACT_FIELDS,
  "street",
  "suburb",
  "city",
  "province",
  "postal",
];

/** DOM ids for each field — used to focus the first invalid field on submit. */
const FIELD_IDS: Record<FieldName, string> = {
  firstName: "quote-first-name",
  surname: "quote-surname",
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

function QuoteFormInner({ intro }: { intro?: React.ReactNode }) {
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

  const [contact, setContact] = useState<ContactValues>({
    firstName: "",
    surname: "",
    email: "",
    phone: "",
  });
  const [address, setAddress] = useState<AddressValues>(EMPTY_ADDRESS);
  const [notes, setNotes] = useState("");
  // Honeypot. Left empty by every human; form bots fill every field they find.
  const [company, setCompany] = useState("");

  const [errors, setErrors] = useState<Partial<Record<FieldName, string | null>>>({});
  const [productError, setProductError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [quote, setQuote] = useState<IssuedQuote | null>(null);

  const pickerRef = useRef<HTMLDivElement>(null);

  /* -------- editor state (derived from the item being edited) */
  const editingItem = items.find((i) => i.id === editingId);
  const slug = editingItem?.slug ?? "";
  const product = slug ? getProduct(slug) : undefined;
  const variantId = editingItem?.variantId;
  const selected = editingItem?.selected ?? {};

  /** The wire form of a line item — configuration only, never prices. */
  const toUnit = (item: LineItem): QuoteUnit => ({
    slug: item.slug,
    variantId: item.variantId,
    optionIds: Object.keys(item.selected).filter((id) => item.selected[id]),
    quantity: item.quantity,
  });

  const lines: QuoteLine[] = items
    .map((item) => resolveQuoteLine(toUnit(item), item.id))
    .filter((l): l is QuoteLine => l !== null);

  const totals = quoteTotals(lines);

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

  const handleContactChange = (field: ContactField, value: string) => {
    setContact((prev) => ({ ...prev, [field]: value }));
  };
  const handleContactBlur = (field: ContactField) => {
    setErrors((prev) => ({ ...prev, [field]: validate(field, contact[field]) }));
  };

  const handleAddressChange = (field: AddressField, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };
  const handleAddressBlur = (field: AddressField) => {
    setErrors((prev) => ({ ...prev, [field]: validate(field, address[field]) }));
  };

  /* -------- message composition (WhatsApp / email fallback routes) */
  const composeMessage = (reference?: string) => {
    const out: string[] = [
      reference
        ? `Shipping quote request — quote ${reference} (tinyhomesa.com)`
        : "New quote request via tinyhomesa.com",
      "",
    ];

    out.push(`Units (${totals.totalUnits} total):`);
    lines.forEach((l, idx) => {
      const size = l.variant ? ` (${l.variant.size})` : "";
      // Each line carries its own money so the rep can read the build-up:
      // base price on the unit, effective price on every extra.
      const base = l.product.priceOnRequest ? "" : ` (${formatZAR(l.basePrice)})`;
      out.push(`${idx + 1}. ${l.quantity} × ${lineTitle(l)}${size}${base}`);
      if (l.activeOptions.length > 0) {
        out.push("   Extras:");
        for (const o of l.activeOptions) {
          const price = optionPrice(o, l.areaM2);
          const rate = o.pricePerM2 != null ? ` · R${o.pricePerM2}/m²` : "";
          out.push(
            `   - ${o.label}${price > 0 ? ` (+${formatZAR(price)}${rate})` : " (priced on quotation)"}`,
          );
        }
      }
      out.push(
        l.product.priceOnRequest
          ? "   Line estimate: priced after consultation"
          : `   Line estimate (ex VAT): ${formatZAR(l.lineTotal)}`,
      );
    });

    if (totals.hasPricedTotal) {
      out.push("", `Subtotal (ex VAT): ${formatZAR(totals.subtotal)}`);
      out.push(`VAT @ 15%: ${formatZAR(totals.vat)}`);
      out.push(`Total (incl VAT): ${formatZAR(totals.total)}`);
      if (totals.someOnRequest) out.push("(plus units priced after consultation)");
    } else {
      out.push("", "Estimated total: priced after consultation");
    }

    out.push("", `Name: ${contact.firstName.trim()}`);
    out.push(`Surname: ${contact.surname.trim()}`);
    out.push(`Email: ${contact.email.trim()}`);
    out.push(`Phone: ${contact.phone.trim()}`);

    out.push("", "Delivery address:");
    out.push(address.street.trim());
    out.push(`${address.suburb.trim()}, ${address.city.trim()}`);
    out.push(`${address.province}, ${address.postal.trim()}`);

    if (notes.trim()) out.push("", `Notes: ${notes.trim()}`);
    out.push("", "Please send me a quote for road delivery to my site.");
    return out.join("\n");
  };

  const whatsappHref = (reference?: string) =>
    `${site.whatsapp}?text=${encodeURIComponent(composeMessage(reference))}`;

  const mailtoHref = (reference?: string) => {
    const label = lines.length === 1 ? lineTitle(lines[0]) : `${totals.totalUnits} units`;
    const subject = reference
      ? `Shipping quote request — ${reference}`
      : `Quote request — ${lines.length > 0 ? label : "Tiny Homes SA"}`;
    return `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      composeMessage(reference),
    )}`;
  };

  /* -------- submit */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;

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
        CONTACT_FIELDS.includes(field as ContactField)
          ? contact[field as ContactField]
          : address[field as AddressField],
      );
    }
    setErrors(nextErrors);

    const firstBad = FOCUS_ORDER.find((f) => nextErrors[f]);
    if (firstBad) {
      document.getElementById(FIELD_IDS[firstBad])?.focus();
      return;
    }

    // Minted here, not on the server, so the customer's document always carries
    // a reference — even if the request below never lands.
    const reference = makeQuoteReference();
    const date = new Date();
    setSending(true);

    let issuedReference = reference;
    let delivered = false;
    let copySent = false;
    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference,
          contact,
          address,
          notes,
          company,
          units: items.map(toUnit),
        }),
      });
      if (response.ok) {
        const data = (await response.json()) as {
          reference?: string;
          delivered?: boolean;
          copySent?: boolean;
        };
        delivered = data.delivered === true;
        copySent = data.copySent === true;
        if (typeof data.reference === "string") issuedReference = data.reference;
      }
    } catch {
      // Offline, or the server is down. The quote itself is computed here in
      // the browser, so it still renders — both flags stay false and the
      // document offers WhatsApp and email as the route to a delivery quote.
    }

    setSending(false);
    setQuote({
      reference: issuedReference,
      date,
      contact,
      address,
      notes,
      lines,
      delivered,
      copySent,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* -------- issued quote replaces the form (and the page's standfirst) */
  if (quote) {
    return (
      <div className="mt-14 sm:mt-16">
        <QuoteDocument
          reference={quote.reference}
          date={quote.date}
          contact={quote.contact}
          address={quote.address}
          notes={quote.notes}
          lines={quote.lines}
          delivered={quote.delivered}
          copySent={quote.copySent}
          whatsappHref={whatsappHref(quote.reference)}
          mailtoHref={mailtoHref(quote.reference)}
          onStartOver={() => setQuote(null)}
        />
      </div>
    );
  }

  const summary = <SummaryCard lines={lines} />;

  const editorHeading = editingItem ? "Configure this unit" : "Add a unit";

  return (
    <>
      {intro}
      <div className="mt-14 grid gap-12 sm:mt-16 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
        <form onSubmit={handleSubmit} noValidate className="space-y-14">
          {/* Step 1 — choose your homes */}
          <Step
            n={1}
            title="Choose your homes"
            description="Configure a unit, then add it to your order. Need more than one? Add another unit, or bump the quantity on any line — mix and match as many homes as you like."
          >
            <p className="text-eyebrow mb-3 text-clay-dark">{editorHeading}</p>
            <div ref={pickerRef} tabIndex={-1} className="scroll-mt-24 focus:outline-none">
              <ProductPicker
                products={products}
                selectedSlug={slug}
                onSelect={handleSelectProduct}
              />
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
                <ExtrasPicker
                  product={product}
                  variantId={variantId}
                  selected={selected}
                  onToggle={toggleOption}
                />
              </div>
            )}

            {product?.priceOnRequest && (
              <p className="mt-8 rounded-2xl border border-border bg-parchment/60 p-5 text-sm leading-relaxed text-stone">
                Safari tents are configured to your site and brief, so there&apos;s no fixed price
                or options list here — add it to your units and we&apos;ll arrange a consultation
                and an itemised quotation.
              </p>
            )}

            {/* Your units — the running order */}
            {lines.length > 0 && (
              <div className="mt-10 border-t border-border pt-8">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-display text-xl text-ink">Your units</h3>
                  <span className="text-sm text-stone">
                    {totals.totalUnits} {totals.totalUnits === 1 ? "unit" : "units"}
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
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField
                  id={FIELD_IDS.firstName}
                  label="First name"
                  value={contact.firstName}
                  onValueChange={(v) => handleContactChange("firstName", v)}
                  onBlur={() => handleContactBlur("firstName")}
                  error={errors.firstName}
                  required
                  autoComplete="given-name"
                  placeholder="Thandi"
                />
                <TextField
                  id={FIELD_IDS.surname}
                  label="Surname"
                  value={contact.surname}
                  onValueChange={(v) => handleContactChange("surname", v)}
                  onBlur={() => handleContactBlur("surname")}
                  error={errors.surname}
                  required
                  autoComplete="family-name"
                  placeholder="Nkosi"
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField
                  id={FIELD_IDS.email}
                  label="Email"
                  type="email"
                  value={contact.email}
                  onValueChange={(v) => handleContactChange("email", v)}
                  onBlur={() => handleContactBlur("email")}
                  error={errors.email}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                />
                <TextField
                  id={FIELD_IDS.phone}
                  label="Phone"
                  type="tel"
                  value={contact.phone}
                  onValueChange={(v) => handleContactChange("phone", v)}
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
            description="Where should the homes go? We use this to price your delivery quote, which follows separately by email."
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

          {/* Honeypot — off-screen rather than display:none, which some bots skip. */}
          <div aria-hidden="true" className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden">
            <label htmlFor="quote-company">Company (leave blank)</label>
            <input
              id="quote-company"
              name="company"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>

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
                  Preparing your quote…
                </>
              ) : (
                "Get my instant quote"
              )}
            </Button>
            <p className="mt-3 text-sm leading-relaxed text-stone">
              Your quote appears on screen straight away and lands in your inbox moments later,
              covering your units, extras and VAT, including shipping into South Africa. Road
              delivery to your site is quoted separately — we&apos;ll email that through once
              we&apos;ve priced the route.
            </p>
          </div>
        </form>

        {/* Desktop sticky summary */}
        <aside className="hidden lg:block" aria-label="Your estimate">
          <div className="lg:sticky lg:top-24">{summary}</div>
        </aside>
      </div>
    </>
  );
}

/* ---------------------------------------------------- suspense wrap */

function QuoteFormFallback() {
  return (
    <div
      className="mt-14 grid gap-12 sm:mt-16 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16"
      aria-hidden="true"
    >
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
 * Instant-quote form.
 *
 * `intro` is the page's standfirst, handed in so it can be dropped once a quote
 * has been issued — it is server-rendered by the page, not by this component.
 * useSearchParams() requires a Suspense boundary in the App Router, so the
 * inner form is wrapped here.
 */
export function QuoteForm({ intro }: { intro?: React.ReactNode }) {
  return (
    <Suspense fallback={<QuoteFormFallback />}>
      <QuoteFormInner intro={intro} />
    </Suspense>
  );
}
