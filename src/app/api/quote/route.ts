/**
 * POST /api/quote — issues an instant quote. Two emails go out per request:
 * the customer's copy of the quotation, and the office's shipping-quote request
 * for that customer.
 *
 * Contract with the browser: the customer's quote is computed and rendered
 * client-side, so it appears the instant they submit and never depends on this
 * route succeeding. What this route owns is the *delivery*. It therefore answers
 * 200 with `delivered`/`copySent` flags rather than failing the request — the
 * form turns a false into a visible fallback ("send it to us on WhatsApp
 * instead") so a lead is never lost silently.
 *
 * Mailbox budget: two sends per quote against Hostinger's 100-per-24-hours cap
 * (see lib/mailer.ts) — roughly 50 quotes a day before sends start bouncing.
 */

import { NextResponse } from "next/server";
import { isMailConfigured, notifyAddress, sendMail } from "@/lib/mailer";
import {
  customerQuoteHtml,
  customerQuoteSubject,
  customerQuoteText,
  quoteEmailHtml,
  quoteEmailSubject,
  quoteEmailText,
  type QuoteEmailInput,
} from "@/lib/quote-email";
import {
  makeQuoteReference,
  resolveQuoteLine,
  QUOTE_REFERENCE_RE,
  type AddressValues,
  type ContactValues,
  type QuoteLine,
  type QuoteRequestBody,
} from "@/lib/quote";

// nodemailer needs a real TCP socket — this must not run on the Edge runtime.
export const runtime = "nodejs";

/* ------------------------------------------------------------ rate limiting */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 8;

/**
 * Per-IP throttle. In-memory is the right size for this: the site runs as a
 * single Node process on Hostinger, and the only thing being protected is a
 * mailbox with a 100-sends-per-day ceiling. It resets on deploy, which is fine.
 */
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);

  // Opportunistic sweep so the map cannot grow without bound.
  if (hits.size > 500) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
    }
  }
  return recent.length > MAX_PER_WINDOW;
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

/* ----------------------------------------------------------------- parsing */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Trim, collapse whitespace and cap length — payloads are never trusted. */
function str(value: unknown, max = 200): string {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

function parseContact(raw: unknown): ContactValues | null {
  const c = raw as Partial<ContactValues> | undefined;
  const contact: ContactValues = {
    firstName: str(c?.firstName, 80),
    surname: str(c?.surname, 80),
    email: str(c?.email, 160),
    phone: str(c?.phone, 40),
  };
  if (!contact.firstName || !contact.surname) return null;
  if (!EMAIL_RE.test(contact.email)) return null;
  if (contact.phone.replace(/\D/g, "").length < 9) return null;
  return contact;
}

function parseAddress(raw: unknown): AddressValues | null {
  const a = raw as Partial<AddressValues> | undefined;
  const address: AddressValues = {
    street: str(a?.street, 160),
    suburb: str(a?.suburb, 100),
    city: str(a?.city, 100),
    province: str(a?.province, 60),
    postal: str(a?.postal, 10),
  };
  if (Object.values(address).some((v) => !v)) return null;
  return address;
}

function parseLines(raw: unknown): QuoteLine[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .slice(0, 20)
    .map((unit, index) => {
      const u = unit as Partial<QuoteRequestBody["units"][number]>;
      return resolveQuoteLine(
        {
          slug: str(u?.slug, 60),
          variantId: u?.variantId ? str(u.variantId, 60) : undefined,
          optionIds: Array.isArray(u?.optionIds)
            ? u.optionIds.slice(0, 40).map((id) => str(id, 60))
            : [],
          quantity: Number(u?.quantity),
        },
        `unit-${index}`,
      );
    })
    .filter((line): line is QuoteLine => line !== null);
}

/* ------------------------------------------------------------------ handler */

export async function POST(request: Request) {
  if (rateLimited(clientIp(request))) {
    return NextResponse.json(
      { error: "Too many quote requests from this connection. Please try again shortly." },
      { status: 429 },
    );
  }

  let body: Partial<QuoteRequestBody>;
  try {
    body = (await request.json()) as Partial<QuoteRequestBody>;
  } catch {
    return NextResponse.json({ error: "Malformed request body." }, { status: 400 });
  }

  // Honeypot: a field hidden from people and irresistible to form bots. Answer
  // 200 so the bot has nothing to tune against, but send no mail.
  if (str(body.company)) {
    return NextResponse.json({ reference: makeQuoteReference(), delivered: true, copySent: true });
  }

  const contact = parseContact(body.contact);
  const address = parseAddress(body.address);
  const lines = parseLines(body.units);

  if (!contact || !address || lines.length === 0) {
    return NextResponse.json(
      { error: "That quote request is missing some details. Please check the form and resend." },
      { status: 400 },
    );
  }

  // The reference is minted in the browser so the customer's document has one
  // even if this call never lands — but it is only honoured if it looks like
  // ours, so it can't be used to inject text into the subject line.
  const reference =
    typeof body.reference === "string" && QUOTE_REFERENCE_RE.test(body.reference)
      ? body.reference
      : makeQuoteReference();

  const input: QuoteEmailInput = {
    reference,
    contact,
    address,
    notes: str(body.notes, 2000),
    lines,
    date: new Date(),
  };

  if (!isMailConfigured()) {
    // Local development without SMTP credentials: print what would have gone
    // out so the flow is testable end-to-end, and tell the browser plainly that
    // nothing was actually sent.
    console.warn(
      `[quote] SMTP not configured — no email sent. Would have sent to ${contact.email} and ${notifyAddress()}:\n\n` +
        `Subject: ${quoteEmailSubject(input)}\n\n${quoteEmailText(input)}\n`,
    );
    return NextResponse.json({
      reference,
      delivered: false,
      copySent: false,
      reason: "not-configured",
    });
  }

  // Sent independently: the customer getting their quotation and the office
  // getting the shipping brief are separate promises to separate people, and one
  // failing must not swallow the other. allSettled, not all, for that reason.
  const [copy, notification] = await Promise.allSettled([
    sendMail({
      to: contact.email,
      subject: customerQuoteSubject(input),
      text: customerQuoteText(input),
      html: customerQuoteHtml(input),
    }),
    sendMail({
      to: notifyAddress(),
      replyTo: contact.email,
      subject: quoteEmailSubject(input),
      text: quoteEmailText(input),
      html: quoteEmailHtml(input),
    }),
  ]);

  if (copy.status === "rejected") {
    console.error("[quote] customer copy failed to send:", copy.reason);
  }
  if (notification.status === "rejected") {
    console.error("[quote] shipping notification failed to send:", notification.reason);
  }

  return NextResponse.json({
    reference,
    delivered: notification.status === "fulfilled",
    copySent: copy.status === "fulfilled",
  });
}

/* ------------------------------------------------------------------ preview */

/**
 * GET /api/quote — renders the customer's quotation email against sample data,
 * so the template can be proof-read in a browser without sending anything.
 *
 * Development only: in production this 404s, exactly as if the handler did not
 * exist. Nothing here reads the request, so no real customer data is involved.
 */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not found", { status: 404 });
  }

  const lines = parseLines([
    {
      slug: "expandable-homes",
      variantId: "b20",
      optionIds: ["pu-wall-insulation", "glass-front-wall"],
      quantity: 2,
    },
    { slug: "folding-homes", optionIds: [], quantity: 1 },
  ]);

  const input: QuoteEmailInput = {
    reference: "THS-000000-0000",
    contact: {
      firstName: "Thandi",
      surname: "Nkosi",
      email: "thandi@example.com",
      phone: "083 660 3743",
    },
    address: {
      street: "12 Acacia Road",
      suburb: "Raslouw",
      city: "Centurion",
      province: "Gauteng",
      postal: "0157",
    },
    notes: "Slab already poured. Access via a gravel farm road.",
    lines,
    date: new Date(),
  };

  return new NextResponse(customerQuoteHtml(input), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
