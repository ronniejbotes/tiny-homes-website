/**
 * Quote model shared by the browser form and the /api/quote route handler.
 *
 * The form posts only the *configuration* (product slug, variant, option ids,
 * quantity) — never prices. The server re-resolves every line against
 * products.ts with the same functions the client used, so the figures in the
 * admin email are the catalogue's, not whatever a crafted request claimed.
 */

import {
  configuredPrice,
  getProduct,
  isOptionAvailable,
  type CustomOption,
  type Product,
  type ProductVariant,
} from "@/data/products";

/**
 * South African VAT. Held at 15% since 1 April 2018 — the 2025 Budget increases
 * to 15.5% then 16% were both withdrawn before taking effect. Every price in
 * products.ts is stored EXCLUSIVE of VAT, so this is applied once, on the
 * subtotal, at the bottom of the quote.
 */
export const VAT_RATE = 0.15;

/** How long an instant quote holds its pricing, in days. */
export const QUOTE_VALID_DAYS = 30;

export const QUANTITY_MIN = 1;
export const QUANTITY_MAX = 10;

/* ------------------------------------------------------------------ types */

export interface AddressValues {
  street: string;
  suburb: string;
  city: string;
  province: string;
  postal: string;
}

export interface ContactValues {
  firstName: string;
  surname: string;
  email: string;
  phone: string;
}

export type AddressField = keyof AddressValues;
export type ContactField = keyof ContactValues;

/** One configured unit, as it travels over the wire. Prices are absent by design. */
export interface QuoteUnit {
  slug: string;
  variantId?: string;
  optionIds: string[];
  quantity: number;
}

/** The full POST body of /api/quote. */
export interface QuoteRequestBody {
  reference: string;
  contact: ContactValues;
  address: AddressValues;
  notes?: string;
  units: QuoteUnit[];
  /** Coastal exposure of the delivery address, as the browser classified it. */
  coastal?: string;
  /** Honeypot — a real person never fills this in. */
  company?: string;
}

/** A unit resolved against the catalogue, for pricing, summary and email. */
export interface QuoteLine {
  id: string;
  product: Product;
  variant: ProductVariant | undefined;
  activeOptions: CustomOption[];
  quantity: number;
  /** Variant (or product starting) price for one unit, before extras. */
  basePrice: number;
  /** Floor area of the chosen variant, m² — resolves per-m² extra pricing. */
  areaM2: number | undefined;
  /** Base + selected extras, for a single unit, ex VAT. */
  unitPrice: number;
  /** unitPrice × quantity, ex VAT. */
  lineTotal: number;
}

export interface QuoteTotals {
  totalUnits: number;
  /** True once at least one line carries a real catalogue price. */
  hasPricedTotal: boolean;
  /** True when any line is a consultation-priced product (safari tents). */
  someOnRequest: boolean;
  /** Sum of the priced lines, ex VAT. */
  subtotal: number;
  /** VAT on the subtotal, rounded to the rand. */
  vat: number;
  /** subtotal + vat — the figure the customer actually pays for the units. */
  total: number;
}

/* -------------------------------------------------------------- resolution */

export function clampQuantity(value: unknown): number {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n)) return QUANTITY_MIN;
  return Math.min(QUANTITY_MAX, Math.max(QUANTITY_MIN, n));
}

/**
 * Resolve one configured unit against the catalogue. Returns null for an
 * unknown slug so a stale deep link or a junk payload drops the line rather
 * than throwing.
 */
export function resolveQuoteLine(unit: QuoteUnit, id: string): QuoteLine | null {
  const product = getProduct(unit.slug);
  if (!product) return null;

  const variant = product.variants?.find((v) => v.id === unit.variantId);
  const selected: Partial<Record<string, boolean>> = {};
  for (const optionId of unit.optionIds) selected[optionId] = true;

  // Mirror configuredPrice()'s filter exactly — an extra that isn't offered on
  // the chosen size costs nothing, so it must not be listed either.
  const activeOptions = product.options.filter(
    (o) =>
      isOptionAvailable(o, unit.variantId) &&
      selected[o.id] &&
      (!o.requires || selected[o.requires]),
  );

  const quantity = clampQuantity(unit.quantity);
  const unitPrice = configuredPrice(product, selected, unit.variantId);

  return {
    id,
    product,
    variant,
    activeOptions,
    quantity,
    basePrice: variant ? variant.price : product.startingPrice,
    areaM2: variant?.areaM2,
    unitPrice,
    lineTotal: unitPrice * quantity,
  };
}

export function quoteTotals(lines: QuoteLine[]): QuoteTotals {
  const priced = lines.filter((l) => !l.product.priceOnRequest);
  const subtotal = priced.reduce((sum, l) => sum + l.lineTotal, 0);
  // Round VAT once, then derive the total from it, so the three printed figures
  // always add up exactly as shown — no cent-level drift on the document.
  const vat = Math.round(subtotal * VAT_RATE);

  return {
    totalUnits: lines.reduce((sum, l) => sum + l.quantity, 0),
    hasPricedTotal: priced.length > 0,
    someOnRequest: lines.some((l) => l.product.priceOnRequest),
    subtotal,
    vat,
    total: subtotal + vat,
  };
}

/** Human label for a line — the variant name when there is one, else the product. */
export function lineTitle(line: QuoteLine): string {
  return line.variant ? line.variant.name : line.product.name;
}

/* --------------------------------------------------------------- reference */

export const QUOTE_REFERENCE_RE = /^THS-\d{6}-\d{4}$/;

/**
 * Quote number, e.g. THS-260803-4821 — date-stamped so the office can age a
 * quote at a glance, with a random tail to keep same-day references distinct.
 * Generated in the browser at submit time (never during render, which would
 * break hydration) and echoed back by the server after validation.
 */
export function makeQuoteReference(now: Date = new Date()): string {
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const tail = Math.floor(1000 + Math.random() * 9000);
  return `THS-${yy}${mm}${dd}-${tail}`;
}

/* -------------------------------------------------------------------- dates */

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** "3 August 2026" — written out by hand so client and server never disagree. */
export function formatQuoteDate(date: Date): string {
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}
