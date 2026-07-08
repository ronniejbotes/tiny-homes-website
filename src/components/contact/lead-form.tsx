"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";
import { products, getProduct } from "@/data/products";
import { cn } from "@/lib/cn";

/* ---------------------------------------------------------------- helpers */

function humanize(id: string): string {
  const words = id.replace(/-/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

interface Config {
  variantLabel?: string;
  optionLabels: string[];
  furnishedLabel?: string;
}

function parseConfig(
  productSlug: string | null,
  variantId: string | null,
  optionsParam: string | null,
  furnished: string | null,
): Config | null {
  if (!variantId && !optionsParam && !furnished) return null;

  const product = productSlug ? getProduct(productSlug) : undefined;

  let variantLabel: string | undefined;
  if (variantId) {
    const variant = product?.variants?.find((v) => v.id === variantId);
    variantLabel = variant ? `${variant.name} (${variant.size})` : humanize(variantId);
  }

  const optionLabels = (optionsParam ? optionsParam.split(",") : [])
    .map((id) => id.trim())
    .filter(Boolean)
    .map((id) => {
      const match = product?.options.find((o) => o.id === id);
      return match ? match.label : humanize(id);
    });

  let furnishedLabel: string | undefined;
  if (furnished) {
    const value = furnished.toLowerCase();
    if (["yes", "true", "1"].includes(value)) furnishedLabel = "Fully furnished";
    else if (["no", "false", "0"].includes(value)) furnishedLabel = "Unfurnished";
    else furnishedLabel = `Furnished: ${humanize(furnished)}`;
  }

  return { variantLabel, optionLabels, furnishedLabel };
}

/* ------------------------------------------------------------- validation */

type FieldName = "name" | "email" | "phone";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateField(field: FieldName, value: string): string | null {
  const trimmed = value.trim();
  switch (field) {
    case "name":
      if (!trimmed) return "Please enter your name so we know who we're talking to.";
      return null;
    case "email":
      if (!trimmed) return "Please enter your email address so we can reply to you.";
      if (!EMAIL_RE.test(trimmed))
        return "That email doesn't look complete — check for a missing @ or domain, e.g. name@example.com.";
      return null;
    case "phone": {
      if (!trimmed) return null; // optional
      const digits = trimmed.replace(/[^\d+]/g, "");
      if (digits.replace(/\D/g, "").length < 9)
        return "That number looks too short — include the full code, e.g. 083 660 3743.";
      return null;
    }
  }
}

/* ----------------------------------------------------------------- styles */

const inputClasses =
  "h-12 w-full rounded-xl border border-border bg-cream px-4 text-base text-ink placeholder:text-stone transition-colors duration-200 focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/20";

const labelClasses = "mb-2 block text-sm font-medium text-ink";

function RequiredMark() {
  return (
    <span className="text-clay-dark" aria-hidden="true">
      {" "}
      *
    </span>
  );
}

function FieldError({ id, message }: { id: string; message: string | null | undefined }) {
  return (
    <p id={id} role="alert" aria-live="polite" className="mt-1.5 min-h-0 text-sm text-clay-dark">
      {message}
    </p>
  );
}

/* ------------------------------------------------------------------- form */

function LeadFormInner() {
  const searchParams = useSearchParams();
  const productParam = searchParams.get("product");
  const variantParam = searchParams.get("variant");
  const optionsParam = searchParams.get("options");
  const furnishedParam = searchParams.get("furnished");

  const preselected = products.some((p) => p.slug === productParam) ? productParam! : "";
  const config = useMemo(
    () => parseConfig(productParam, variantParam, optionsParam, furnishedParam),
    [productParam, variantParam, optionsParam, furnishedParam],
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [product, setProduct] = useState(preselected);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Partial<Record<FieldName, string | null>>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // The imported configuration belongs to the product it was built for. Once
  // the user switches the select away from that product we discard it
  // permanently (re-selecting the original does NOT restore it), so a stale
  // variant/options/furnished set can never be paired with a different home.
  const [configDismissed, setConfigDismissed] = useState(false);
  const configApplies = !configDismissed && product === preselected;

  const handleProductChange = (next: string) => {
    if (next !== preselected) setConfigDismissed(true);
    setProduct(next);
  };

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  const handleBlur = (field: FieldName, value: string) => {
    setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
  };

  const configLines = useMemo(() => {
    if (!config) return [];
    const lines: string[] = [];
    if (config.variantLabel) lines.push(`Variant: ${config.variantLabel}`);
    if (config.optionLabels.length > 0) lines.push(`Options: ${config.optionLabels.join(", ")}`);
    if (config.furnishedLabel) lines.push(config.furnishedLabel);
    return lines;
  }, [config]);

  const composeMessage = () => {
    const productName = products.find((p) => p.slug === product)?.name;
    const parts = [
      "New enquiry via tinyhomesa.com",
      "",
      `Name: ${name.trim()}`,
      `Email: ${email.trim()}`,
    ];
    if (phone.trim()) parts.push(`Phone: ${phone.trim()}`);
    parts.push(`Interested in: ${productName ?? "Not sure yet"}`);
    if (configApplies && configLines.length > 0) {
      parts.push("Configuration:");
      configLines.forEach((line) => parts.push(`- ${line}`));
    }
    if (message.trim()) {
      parts.push("", message.trim());
    }
    return parts.join("\n");
  };

  const mailtoHref = () => {
    const subject = `Website enquiry — ${products.find((p) => p.slug === product)?.name ?? "Tiny Homes SA"}`;
    return `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(composeMessage())}`;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Partial<Record<FieldName, string | null>> = {
      name: validateField("name", name),
      email: validateField("email", email),
      phone: validateField("phone", phone),
    };
    setErrors(nextErrors);

    if (nextErrors.name) return nameRef.current?.focus();
    if (nextErrors.email) return emailRef.current?.focus();
    if (nextErrors.phone) return phoneRef.current?.focus();

    // Must open synchronously inside the click/submit handler so popup
    // blockers allow it.
    const text = composeMessage();
    window.open(`${site.whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 700);
  };

  if (sent) {
    return (
      <div
        aria-live="polite"
        className="rounded-3xl border border-border bg-parchment/60 p-8 sm:p-10"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-forest text-cream">
          <Check className="h-6 w-6" aria-hidden="true" />
        </span>
        <h3 className="text-display mt-6 text-2xl text-ink sm:text-3xl">
          Your message is on its way
        </h3>
        <p className="mt-4 leading-relaxed text-stone">
          WhatsApp should have opened in a new tab with your enquiry pre-filled — just press send
          there and we&apos;ll get back to you as soon as possible.
        </p>
        <p className="mt-4 leading-relaxed text-stone">
          Didn&apos;t open, or prefer email?{" "}
          <a
            href={mailtoHref()}
            className="font-medium text-clay-dark underline underline-offset-4 transition-colors hover:text-clay"
          >
            Send the same message by email
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

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {configApplies && config && configLines.length > 0 && (
        <div className="rounded-2xl border border-border bg-parchment/60 p-5">
          <p className="text-eyebrow text-clay">Your configuration</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {config.variantLabel && (
              <li className="rounded-full border border-border bg-sand/60 px-3.5 py-1.5 text-sm text-ink">
                {config.variantLabel}
              </li>
            )}
            {config.optionLabels.map((label) => (
              <li
                key={label}
                className="rounded-full border border-border bg-sand/60 px-3.5 py-1.5 text-sm text-ink"
              >
                {label}
              </li>
            ))}
            {config.furnishedLabel && (
              <li className="rounded-full border border-border bg-sand/60 px-3.5 py-1.5 text-sm text-ink">
                {config.furnishedLabel}
              </li>
            )}
          </ul>
          <p className="mt-3 text-sm text-stone">
            We&apos;ll include this configuration in your enquiry automatically.
          </p>
        </div>
      )}

      <div>
        <label htmlFor="lead-name" className={labelClasses}>
          Full name
          <RequiredMark />
        </label>
        <input
          ref={nameRef}
          id="lead-name"
          name="name"
          type="text"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={(e) => handleBlur("name", e.target.value)}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? "lead-name-error" : undefined}
          placeholder="Thandi Nkosi"
          className={cn(inputClasses, errors.name && "border-clay-dark")}
        />
        <FieldError id="lead-name-error" message={errors.name} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="lead-email" className={labelClasses}>
            Email
            <RequiredMark />
          </label>
          <input
            ref={emailRef}
            id="lead-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={(e) => handleBlur("email", e.target.value)}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "lead-email-error" : undefined}
            placeholder="you@example.com"
            className={cn(inputClasses, errors.email && "border-clay-dark")}
          />
          <FieldError id="lead-email-error" message={errors.email} />
        </div>

        <div>
          <label htmlFor="lead-phone" className={labelClasses}>
            Phone <span className="font-normal text-stone">(optional)</span>
          </label>
          <input
            ref={phoneRef}
            id="lead-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onBlur={(e) => handleBlur("phone", e.target.value)}
            aria-invalid={errors.phone ? true : undefined}
            aria-describedby={errors.phone ? "lead-phone-error" : undefined}
            placeholder="083 660 3743"
            className={cn(inputClasses, errors.phone && "border-clay-dark")}
          />
          <FieldError id="lead-phone-error" message={errors.phone} />
        </div>
      </div>

      <div>
        <label htmlFor="lead-product" className={labelClasses}>
          Which home interests you?
        </label>
        <div className="relative">
          <select
            id="lead-product"
            name="product"
            value={product}
            onChange={(e) => handleProductChange(e.target.value)}
            className={cn(inputClasses, "appearance-none pr-12")}
          >
            <option value="">Not sure yet</option>
            {products.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone"
            aria-hidden="true"
          />
        </div>
      </div>

      <div>
        <label htmlFor="lead-message" className={labelClasses}>
          Your message <span className="font-normal text-stone">(optional)</span>
        </label>
        <textarea
          id="lead-message"
          name="message"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us about your site, timeline or any questions — e.g. where the home is going and when you'd like it delivered."
          className={cn(inputClasses, "h-auto min-h-32 resize-y py-3.5")}
        />
      </div>

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
            "Send via WhatsApp"
          )}
        </Button>
        <p className="mt-3 text-sm leading-relaxed text-stone">
          This form opens WhatsApp with your enquiry pre-filled — nothing is stored on our site.
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
  );
}

/* A minimal placeholder so layout doesn't jump while search params resolve. */
function FormFallback() {
  return (
    <div className="space-y-5" aria-hidden="true">
      <div className="h-12 rounded-xl border border-border bg-parchment/60" />
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="h-12 rounded-xl border border-border bg-parchment/60" />
        <div className="h-12 rounded-xl border border-border bg-parchment/60" />
      </div>
      <div className="h-12 rounded-xl border border-border bg-parchment/60" />
      <div className="h-32 rounded-xl border border-border bg-parchment/60" />
      <div className="h-13 w-52 rounded-full bg-parchment/60" />
    </div>
  );
}

/**
 * Lead enquiry form. useSearchParams() requires a Suspense boundary in the
 * App Router, so the inner form is wrapped here.
 */
export function LeadForm() {
  return (
    <Suspense fallback={<FormFallback />}>
      <LeadFormInner />
    </Suspense>
  );
}
