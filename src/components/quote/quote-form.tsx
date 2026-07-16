"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, type ReadonlyURLSearchParams } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import {
  configuredPrice,
  getProduct,
  products,
  type CustomOption,
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

/* -------------------------------------------------------- inner form */

function QuoteFormInner() {
  const searchParams = useSearchParams();
  const deep = useMemo(() => parseDeepLink(searchParams), [searchParams]);

  const [slug, setSlug] = useState(deep.slug);
  const [variantId, setVariantId] = useState<string | undefined>(deep.variantId);
  const [selected, setSelected] = useState<Partial<Record<string, boolean>>>(deep.selected);

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

  /* -------- derived configuration */
  const product = slug ? getProduct(slug) : undefined;
  const variant = product?.variants?.find((v) => v.id === variantId);
  const activeOptions: CustomOption[] = product
    ? product.options.filter((o) => selected[o.id] && (!o.requires || selected[o.requires]))
    : [];
  const total = product ? configuredPrice(product, selected, variantId) : 0;

  /* -------- handlers */
  const handleSelectProduct = (nextSlug: string) => {
    if (nextSlug === slug) return;
    const next = getProduct(nextSlug);
    setSlug(nextSlug);
    setVariantId(next?.variants?.[0]?.id);
    setSelected({});
    setProductError(null);
  };

  const toggleOption = (option: CustomOption) => {
    setSelected((prev) => {
      const turningOn = !prev[option.id];
      const next: Partial<Record<string, boolean>> = { ...prev, [option.id]: turningOn };
      // Deselecting a prerequisite unchecks anything that depends on it.
      if (!turningOn && product) {
        for (const opt of product.options) {
          if (opt.requires === option.id) next[opt.id] = false;
        }
      }
      return next;
    });
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
    const lines: string[] = ["New quote request via tinyhomesa.com", ""];
    lines.push(`Name: ${name.trim()}`);
    lines.push(`Email: ${email.trim()}`);
    lines.push(`Phone: ${phone.trim()}`);

    lines.push("", "Delivery address:");
    lines.push(address.street.trim());
    lines.push(`${address.suburb.trim()}, ${address.city.trim()}`);
    lines.push(`${address.province}, ${address.postal.trim()}`);

    if (product) {
      lines.push("", `Home: ${product.name}`);
      if (variant) lines.push(`Size: ${variant.name} (${variant.size})`);
      if (activeOptions.length > 0) {
        lines.push("Extras:");
        for (const o of activeOptions) {
          lines.push(
            `- ${o.label}${o.price > 0 ? ` (+${formatZAR(o.price)})` : " (priced on quotation)"}`,
          );
        }
      }
      lines.push(
        product.priceOnRequest
          ? "Estimated total: priced after consultation"
          : `Estimated total (ex VAT): ${formatZAR(total)}`,
      );
    }

    if (notes.trim()) lines.push("", `Notes: ${notes.trim()}`);
    return lines.join("\n");
  };

  const mailtoHref = () => {
    const subject = `Quote request — ${product?.name ?? "Tiny Homes SA"}`;
    return `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      composeMessage(),
    )}`;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!slug) {
      setProductError("Please choose a home to quote before sending your request.");
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
          WhatsApp should have opened in a new tab with your configuration and delivery address
          pre-filled — just press send there and we&apos;ll come back with a formal quotation,
          including delivery to your site.
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

  const summary = (
    <SummaryCard product={product} variant={variant} activeOptions={activeOptions} total={total} />
  );

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
      <form onSubmit={handleSubmit} noValidate className="space-y-14">
        {/* Step 1 — choose your home */}
        <Step
          n={1}
          title="Choose your home"
          description="Pick the home you'd like quoted. Select a size and any extras, and we'll estimate the total as you go."
        >
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
              <VariantPicker product={product} variantId={variantId} onSelect={setVariantId} />
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
              options list here — send your details below and we&apos;ll arrange a consultation and
              an itemised quotation.
            </p>
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
          description="Where should the home go? We use this to calculate an accurate delivery and shipping quote to the site."
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
