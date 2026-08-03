"use client";

import { useEffect, useRef } from "react";
import { Check, Mail, MessageCircle, Phone, RotateCcw, Truck } from "lucide-react";
import { optionPrice } from "@/data/products";
import { formatZAR } from "@/lib/format";
import { site } from "@/lib/site";
import { cn } from "@/lib/cn";
import {
  QUOTE_VALID_DAYS,
  VAT_RATE,
  addDays,
  formatQuoteDate,
  lineTitle,
  quoteTotals,
  type AddressValues,
  type ContactValues,
  type QuoteLine,
} from "@/lib/quote";
import { ButtonAnchor } from "@/components/ui/button";

export interface QuoteDocumentProps {
  reference: string;
  date: Date;
  contact: ContactValues;
  address: AddressValues;
  notes: string;
  lines: QuoteLine[];
  /** Whether the office actually received the shipping-quote request email. */
  delivered: boolean;
  /** Whether the customer's own copy of this quotation reached their inbox. */
  copySent: boolean;
  /** Fallback routes, used when the notification could not be delivered. */
  whatsappHref: string;
  mailtoHref: string;
  onStartOver: () => void;
}

/* ------------------------------------------------------------- money rows */

function AmountRow({
  label,
  amount,
  muted,
  indent,
}: {
  label: string;
  amount: string;
  muted?: boolean;
  indent?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-4 py-1",
        indent && "pl-4",
        muted ? "text-sm text-stone" : "text-sm text-ink",
      )}
    >
      <span className="min-w-0">{label}</span>
      {/* The dotted leader keeps the eye on the row across a wide column, the
          way a printed quotation does. */}
      <span className="mx-2 hidden flex-1 translate-y-[-0.2em] border-b border-dotted border-border sm:block" />
      <span className="shrink-0 tabular-nums nums-tabular">{amount}</span>
    </div>
  );
}

function LineBlock({ line, index }: { line: QuoteLine; index: number }) {
  const onRequest = line.product.priceOnRequest;
  const size = line.variant ? ` — ${line.variant.size}` : "";

  return (
    <li className="border-t border-border py-5 first:border-t-0 first:pt-0">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-display text-lg leading-snug text-ink">
          <span className="text-stone">{index + 1}.</span> {lineTitle(line)}
          <span className="font-sans text-base font-normal text-stone">{size}</span>
        </h3>
        <span className="shrink-0 text-right font-display text-lg text-ink tabular-nums nums-tabular">
          {onRequest ? (
            <span className="font-sans text-sm font-normal text-stone">On consultation</span>
          ) : (
            formatZAR(line.lineTotal)
          )}
        </span>
      </div>

      {onRequest ? (
        <p className="mt-2 text-sm leading-relaxed text-stone">
          Configured to your site and brief — we&apos;ll price this line after a short
          consultation and add it to your formal quotation.
        </p>
      ) : (
        <div className="mt-3">
          <AmountRow label="Base unit" amount={formatZAR(line.basePrice)} muted />
          {line.activeOptions.map((option) => {
            const price = optionPrice(option, line.areaM2);
            return (
              <AmountRow
                key={option.id}
                label={`+ ${option.label}`}
                amount={price > 0 ? formatZAR(price) : "priced on quotation"}
                muted
                indent
              />
            );
          })}
          {line.activeOptions.length > 0 && (
            <AmountRow label="Unit price ex VAT" amount={formatZAR(line.unitPrice)} />
          )}
          <AmountRow
            label={`Quantity — ${line.quantity} ${line.quantity === 1 ? "unit" : "units"}`}
            amount={formatZAR(line.lineTotal)}
          />
        </div>
      )}
    </li>
  );
}

/* ------------------------------------------------------------- the document */

export function QuoteDocument({
  reference,
  date,
  contact,
  address,
  notes,
  lines,
  delivered,
  copySent,
  whatsappHref,
  mailtoHref,
  onStartOver,
}: QuoteDocumentProps) {
  const totals = quoteTotals(lines);
  const expires = addDays(date, QUOTE_VALID_DAYS);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Move focus to the confirmation so screen readers announce it — a live
  // region that mounts together with its content is often skipped by AT.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const fullName = `${contact.firstName} ${contact.surname}`.trim();

  return (
    <div className="mx-auto max-w-3xl">
      {/* ---------------------------------------------- confirmation banner */}
      <div className="rounded-3xl border border-border bg-parchment/60 p-6 sm:p-8 print:hidden">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-forest text-cream">
          <Check className="h-5 w-5" aria-hidden="true" />
        </span>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-display mt-5 text-2xl text-ink focus:outline-none sm:text-3xl"
        >
          Here&apos;s your quote, {contact.firstName}
        </h2>
        <p className="mt-3 leading-relaxed text-stone">
          {copySent ? (
            <>
              It&apos;s ready to read below, and your copy is on its way to{" "}
              <strong className="font-medium text-ink">{contact.email}</strong>
              {" — "}
              it should land within a minute or two. Have a look in your spam folder if it
              doesn&apos;t appear.
            </>
          ) : (
            <>
              It&apos;s ready to read below.{" "}
              <strong className="font-medium text-ink">
                We couldn&apos;t email your copy to {contact.email}
              </strong>
              {" — "}
              please check the address, or get in touch and we&apos;ll send it across.
            </>
          )}
        </p>
        <p className="mt-3 leading-relaxed text-stone">
          {delivered ? (
            <>
              We&apos;ve also sent your details to our team, who will come back to you by email
              with a separate quotation for delivery to your site.
            </>
          ) : (
            <>
              One thing:{" "}
              <strong className="font-medium text-ink">
                we couldn&apos;t reach our team automatically
              </strong>
              , so please send us your request using one of the buttons below and we&apos;ll get
              your delivery quote moving.
            </>
          )}
        </p>

        {(!delivered || !copySent) && (
          <div className="mt-5 flex flex-wrap gap-3">
            <ButtonAnchor
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              variant="accent"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Send on WhatsApp
            </ButtonAnchor>
            <ButtonAnchor href={mailtoHref} variant="outline">
              Email your request
            </ButtonAnchor>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------- the quote
          On screen only. The quotation is issued by email, not as a file, so
          the document is withheld from print — a browser Print/Save-as-PDF
          gets the note below instead. This is a deterrent, not a lock: any
          web page can still be screenshotted or copied. */}
      <article
        aria-label={`Quotation ${reference}`}
        className="mt-8 overflow-hidden rounded-3xl border border-border bg-cream print:hidden"
      >
        {/* Letterhead */}
        <header className="flex flex-col gap-6 border-b border-border bg-parchment/50 p-6 sm:flex-row sm:items-start sm:justify-between sm:p-8">
          <div>
            <p className="text-display text-2xl leading-none text-ink">{site.name}</p>
            <p className="mt-2 text-sm leading-relaxed text-stone">
              {site.legalName}
              <br />
              {site.address.streetAddress}, {site.address.locality}
              <br />
              {site.address.city}, {site.address.region}
              <br />
              {site.phoneDisplay} · {site.email}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-eyebrow text-clay-dark">Quotation</p>
            <p className="mt-1 font-display text-xl text-ink tabular-nums nums-tabular">
              {reference}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-stone">
              Issued {formatQuoteDate(date)}
              <br />
              Valid until {formatQuoteDate(expires)}
            </p>
          </div>
        </header>

        {/* Parties */}
        <div className="grid gap-6 border-b border-border p-6 sm:grid-cols-2 sm:p-8">
          <div>
            <p className="text-eyebrow text-clay-dark">Prepared for</p>
            <p className="mt-2 text-base font-medium text-ink">{fullName}</p>
            <p className="mt-1 text-sm leading-relaxed text-stone">
              {contact.email}
              <br />
              {contact.phone}
            </p>
          </div>
          <div>
            <p className="text-eyebrow text-clay-dark">Delivery address</p>
            <p className="mt-2 text-sm leading-relaxed text-stone">
              {address.street}
              <br />
              {address.suburb}
              <br />
              {address.city}
              <br />
              {address.province}, {address.postal}
            </p>
          </div>
        </div>

        {/* Line items */}
        <div className="p-6 sm:p-8">
          <div className="flex items-baseline justify-between gap-4 pb-4">
            <p className="text-eyebrow text-clay-dark">Description</p>
            <p className="text-eyebrow text-clay-dark">Amount (ex VAT)</p>
          </div>
          <ul className="border-t border-border pt-5">
            {lines.map((line, index) => (
              <LineBlock key={line.id} line={line} index={index} />
            ))}
          </ul>

          {/* Totals */}
          <div className="mt-2 border-t-2 border-ink/15 pt-5">
            {totals.hasPricedTotal ? (
              <dl className="ml-auto max-w-sm space-y-2">
                <div className="flex items-baseline justify-between gap-6">
                  <dt className="text-sm text-stone">Subtotal (excl. VAT)</dt>
                  <dd className="text-sm text-ink tabular-nums nums-tabular">
                    {formatZAR(totals.subtotal)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-6">
                  <dt className="text-sm text-stone">VAT @ {VAT_RATE * 100}%</dt>
                  <dd className="text-sm text-ink tabular-nums nums-tabular">
                    {formatZAR(totals.vat)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-6 border-t border-border pt-3">
                  <dt className="font-display text-lg text-ink">Total incl. VAT</dt>
                  <dd className="text-display text-2xl text-ink tabular-nums nums-tabular sm:text-3xl">
                    {formatZAR(totals.total)}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="ml-auto max-w-sm text-display text-xl text-ink">
                Priced after consultation
              </p>
            )}
            {totals.someOnRequest && totals.hasPricedTotal && (
              <p className="ml-auto mt-3 max-w-sm text-right text-xs leading-relaxed text-stone">
                Plus any units priced after consultation, quoted separately.
              </p>
            )}
          </div>
        </div>

        {/* Shipping — the deliberate gap in this quote, spelled out */}
        <div className="border-t border-border bg-parchment/50 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-clay/40 bg-cream text-clay-dark">
              <Truck className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h3 className="font-display text-lg text-ink">
                Delivery to your site is not included
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone">
                The total above covers your units, the extras you selected and VAT{" — "}
                and shipping into South Africa is already in that price. What it doesn&apos;t
                cover is the national leg: getting your unit here by road. That depends on where
                you are, so{" "}
                <strong className="font-medium text-ink">
                  we&apos;ll come back to you with a separate quote for delivery
                </strong>{" "}
                to {address.city || "your site"}, along with anything else the site needs.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-stone">
                You&apos;re also more than welcome to shop around and arrange your own truck.{" "}
                <strong className="font-medium text-ink">
                  We don&apos;t add any markup to delivery
                </strong>{" "}
                — whatever the transporter charges us is what we pass on to you — so use whichever
                option suits you best.
              </p>
            </div>
          </div>
        </div>

        {notes.trim() && (
          <div className="border-t border-border p-6 sm:p-8">
            <p className="text-eyebrow text-clay-dark">Your notes</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-stone">
              {notes.trim()}
            </p>
          </div>
        )}

        {/* Terms */}
        <footer className="border-t border-border p-6 text-xs leading-relaxed text-stone sm:p-8">
          <p className="text-eyebrow mb-3 text-clay-dark">Terms</p>
          <ul className="space-y-1.5">
            <li>
              This quotation is valid for {QUOTE_VALID_DAYS} days from the issue date and is
              subject to stock availability.
            </li>
            <li>
              All prices are in South African Rand. VAT is charged at {VAT_RATE * 100}% on the
              subtotal shown.
            </li>
            <li>
              Optional extras carry provisional pricing and are confirmed line by line on your
              formal quotation. Items shown as &ldquo;priced on quotation&rdquo; are quoted per
              site.
            </li>
            <li>
              Prices include shipping into South Africa. Road delivery to your site, offloading,
              craneage, foundations and site services are excluded and quoted separately.
            </li>
            <li>
              Typical lead time is {site.leadTimeDays} days from deposit. {site.guarantee}.{" "}
              {site.finance}.
            </li>
            <li>
              This is an automated estimate generated on tinyhomesa.com and is not a tax invoice.
            </li>
          </ul>
        </footer>
      </article>

      {/* Shown only on paper, in place of the withheld document. */}
      <p className="hidden print:block print:text-base print:leading-relaxed">
        Quotation {reference} was emailed to {contact.email} on {formatQuoteDate(date)}. Please
        refer to that email for the full quotation, or contact {site.name} on {site.phoneDisplay}.
      </p>

      {/* ------------------------------------------------------- next steps */}
      <div className="mt-8 print:hidden">
        <div className="rounded-2xl border border-border bg-parchment/60 p-5">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-5 w-5 shrink-0 text-clay-dark" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-stone">
              {copySent ? (
                <>
                  Your quotation has been emailed to{" "}
                  <strong className="font-medium text-ink">{contact.email}</strong>
                  {" — "}
                  that email is your copy to keep and refer back to. Quotes aren&apos;t available
                  as downloads.
                </>
              ) : (
                <>
                  Your quotation is issued by email rather than as a download. We couldn&apos;t
                  reach <strong className="font-medium text-ink">{contact.email}</strong> this
                  time — message or call us and we&apos;ll send your copy straight through.
                </>
              )}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonAnchor
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            variant="primary"
            size="lg"
          >
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
            Chat about this quote
          </ButtonAnchor>
          <ButtonAnchor
            href={`tel:${site.phone.replace(/\s/g, "")}`}
            variant="outline"
            size="lg"
          >
            <Phone className="h-5 w-5" aria-hidden="true" />
            {site.phoneDisplay}
          </ButtonAnchor>
        </div>

        <button
          type="button"
          onClick={onStartOver}
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-clay-dark underline underline-offset-4 transition-colors hover:text-clay focus:outline-none focus-visible:ring-2 focus-visible:ring-clay/30"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Build another quote
        </button>

        <p className="mt-6 text-sm leading-relaxed text-stone">
          Quote {reference}
          {" — "}
          keep this reference handy and we&apos;ll pick up exactly where you left off.
        </p>
      </div>
    </div>
  );
}
