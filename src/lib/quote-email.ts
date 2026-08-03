/**
 * Composes the two emails an instant quote sends:
 *
 *  1. The customer's copy of the quotation — the quote lives in their inbox
 *     rather than as a file they download, so the figures stay attached to the
 *     business that issued them.
 *  2. The delivery-quote notification to the office. The instant quote covers
 *     the units, their extras, VAT and shipping into South Africa — deliberately
 *     not the national road leg, which is priced per site and passed through at
 *     cost. This email is the hand-off that turns that gap into an action:
 *     everything needed to price a load is in the first screenful (who, where,
 *     what), and Reply-To is the customer, so answering the mail answers them.
 *
 * Server-only.
 */

import { site } from "@/lib/site";
import { formatZAR } from "@/lib/format";
import { optionPrice } from "@/data/products";
import { coastalBody, coastalHeadline, type CoastalRisk } from "@/lib/coastal";
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

export interface QuoteEmailInput {
  reference: string;
  contact: ContactValues;
  address: AddressValues;
  notes?: string;
  lines: QuoteLine[];
  date: Date;
  /** Coastal exposure of the delivery address. */
  coastal: CoastalRisk;
}

const esc = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Single-line destination, the way a transporter would read it. */
export function formatDeliveryLocation(address: AddressValues): string {
  return [
    address.street.trim(),
    address.suburb.trim(),
    address.city.trim(),
    address.province.trim(),
    address.postal.trim(),
  ]
    .filter(Boolean)
    .join(", ");
}

export function fullName(contact: ContactValues): string {
  return `${contact.firstName.trim()} ${contact.surname.trim()}`.trim();
}

/**
 * External dimensions, for sizing the load — but only where they are actually
 * true of the unit quoted. `Product.dims` is a single set per product, so on a
 * multi-variant line (an 18 m² expandable and a 74 m² one share one `dims`) it
 * would describe the wrong unit. Better a gap the office fills in than a
 * confident wrong number on a transporter's brief.
 */
function transportDims(line: QuoteLine): string | null {
  if (line.product.variants && line.product.variants.length > 0) return null;
  const { length, width, height } = line.product.dims;
  return `${length} m × ${width} m × ${height} m`;
}

export function quoteEmailSubject(input: QuoteEmailInput): string {
  const where = input.address.city.trim() || input.address.province.trim() || "site";
  return `Delivery quote request — ${fullName(input.contact)} — ${where} — ${input.reference}`;
}

/* ------------------------------------------------------------------- text */

export function quoteEmailText(input: QuoteEmailInput): string {
  const { contact, address, lines, reference, notes, date } = input;
  const totals = quoteTotals(lines);
  const out: string[] = [];

  out.push("DELIVERY QUOTE REQUEST");
  out.push(`Quote ${reference} · generated ${formatQuoteDate(date)} on tinyhomesa.com`);
  out.push("");
  if (input.coastal === "coastal") {
    out.push("*** COASTAL SITE — CORROSION SPECIFICATION REQUIRED ***");
    out.push("Confirm the corrosion-resistant exterior on every unit before quoting.");
    out.push("");
  } else if (input.coastal === "possibly-coastal") {
    out.push("!! CHECK COASTAL EXPOSURE — address is in a coastal province.");
    out.push("If the site is within ~30 km of the sea, the corrosion spec is required.");
    out.push("");
  }
  out.push(
    "The customer already has their instant product quote (units, extras, VAT and shipping",
  );
  out.push("into South Africa). They are waiting on a quote for ROAD DELIVERY to their site.");
  out.push("");

  out.push("CUSTOMER");
  out.push(`  Name:     ${contact.firstName.trim()}`);
  out.push(`  Surname:  ${contact.surname.trim()}`);
  out.push(`  Phone:    ${contact.phone.trim()}`);
  out.push(`  Email:    ${contact.email.trim()}`);
  out.push("");

  out.push("DELIVERY ADDRESS");
  out.push(`  ${address.street.trim()}`);
  out.push(`  ${address.suburb.trim()}`);
  out.push(`  ${address.city.trim()}`);
  out.push(`  ${address.province.trim()}, ${address.postal.trim()}`);
  out.push("");

  out.push(`PRODUCT TO BE DELIVERED (${totals.totalUnits} ${totals.totalUnits === 1 ? "unit" : "units"})`);
  lines.forEach((line, i) => {
    const size = line.variant ? ` — ${line.variant.size}` : "";
    out.push(`  ${i + 1}. ${line.quantity} × ${lineTitle(line)}${size}`);
    const d = transportDims(line);
    if (d) out.push(`     Transport size (each): ${d}`);
    for (const option of line.activeOptions) {
      out.push(`     + ${option.label}`);
    }
  });
  out.push("");

  out.push("PRODUCT QUOTE ISSUED (excludes road delivery)");
  if (totals.hasPricedTotal) {
    out.push(`  Subtotal ex VAT:  ${formatZAR(totals.subtotal)}`);
    out.push(`  VAT @ 15%:        ${formatZAR(totals.vat)}`);
    out.push(`  Total incl VAT:   ${formatZAR(totals.total)}`);
    if (totals.someOnRequest) {
      out.push("  (plus units priced after consultation)");
    }
  } else {
    out.push("  Priced after consultation — no fixed total issued.");
  }

  if (notes?.trim()) {
    out.push("");
    out.push("CUSTOMER NOTES");
    out.push(`  ${notes.trim()}`);
  }

  out.push("");
  out.push(`Reply to this email to send ${contact.firstName.trim()} their delivery quote.`);
  return out.join("\n");
}

/* ------------------------------------------------------------------- html */

const CELL = "padding:6px 0;vertical-align:top;font-size:15px;line-height:1.5;color:#1c1b17";
const KEY = `${CELL};width:110px;color:#67635a`;

function row(label: string, value: string): string {
  return `<tr><td style="${KEY}">${esc(label)}</td><td style="${CELL}"><strong>${esc(value)}</strong></td></tr>`;
}

export function quoteEmailHtml(input: QuoteEmailInput): string {
  const { contact, address, lines, reference, notes, date } = input;
  const totals = quoteTotals(lines);

  const unitsHtml = lines
    .map((line) => {
      const size = line.variant ? ` — ${esc(line.variant.size)}` : "";
      const d = transportDims(line);
      const dims = d
        ? `<div style="font-size:13px;color:#67635a;margin-top:2px">Transport size (each): ${esc(d)}</div>`
        : "";
      const extras =
        line.activeOptions.length > 0
          ? `<ul style="margin:6px 0 0;padding-left:18px;font-size:13px;color:#67635a">${line.activeOptions
              .map((o) => {
                const price = optionPrice(o, line.areaM2);
                return `<li>${esc(o.label)}${price > 0 ? ` (${esc(formatZAR(price))})` : ""}</li>`;
              })
              .join("")}</ul>`
          : "";
      return `<li style="margin-bottom:12px">
        <span style="font-size:15px;color:#1c1b17"><strong>${line.quantity} × ${esc(lineTitle(line))}</strong>${size}</span>
        ${dims}${extras}
      </li>`;
    })
    .join("");

  const totalsHtml = totals.hasPricedTotal
    ? `<table style="width:100%;border-collapse:collapse">
        ${row("Subtotal", `${formatZAR(totals.subtotal)} ex VAT`)}
        ${row("VAT @ 15%", formatZAR(totals.vat))}
        ${row("Total", `${formatZAR(totals.total)} incl VAT`)}
      </table>
      ${totals.someOnRequest ? `<p style="margin:8px 0 0;font-size:13px;color:#67635a">Plus units priced after consultation.</p>` : ""}`
    : `<p style="margin:0;font-size:15px;color:#1c1b17">Priced after consultation — no fixed total issued.</p>`;

  const notesHtml = notes?.trim()
    ? `<h2 style="margin:28px 0 8px;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#b4552d">Customer notes</h2>
       <p style="margin:0;font-size:15px;line-height:1.6;color:#1c1b17;white-space:pre-wrap">${esc(notes.trim())}</p>`
    : "";

  return `<!doctype html>
<html lang="en">
<body style="margin:0;padding:24px;background:#f4eee2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">
  <div style="max-width:640px;margin:0 auto;background:#faf6ef;border:1px solid #ddd3c1;border-radius:16px;padding:28px">

    <p style="margin:0 0 4px;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#b4552d">Delivery quote request</p>
    <h1 style="margin:0;font-size:24px;line-height:1.25;color:#1c1b17">${esc(fullName(contact))} — ${esc(address.city.trim() || address.province.trim())}</h1>
    <p style="margin:8px 0 0;font-size:14px;color:#67635a">Quote ${esc(reference)} · generated ${esc(formatQuoteDate(date))} on tinyhomesa.com</p>

    ${
      input.coastal === "coastal"
        ? `<div style="margin:20px 0;padding:14px 16px;background:#b4552d;border-radius:12px;font-size:15px;line-height:1.6;color:#ffffff">
             <strong>COASTAL SITE — corrosion specification required.</strong><br>
             Confirm the corrosion-resistant exterior on every unit before quoting. Standard
             cladding is not warranted against salt-air corrosion.
           </div>`
        : input.coastal === "possibly-coastal"
          ? `<div style="margin:20px 0;padding:14px 16px;background:#f4eee2;border:1px solid #b4552d;border-radius:12px;font-size:14px;line-height:1.6;color:#1c1b17">
               <strong>Check coastal exposure.</strong> The address is in a coastal province. If the
               site is within roughly 30 km of the sea, the corrosion specification is required.
             </div>`
          : ""
    }
    <div style="margin:20px 0;padding:14px 16px;background:#e9dfce;border-radius:12px;font-size:14px;line-height:1.6;color:#1c1b17">
      The customer already has their instant product quote — units, extras, VAT and shipping
      into South Africa. They are waiting on a <strong>quote for road delivery to their
      site</strong>.
    </div>

    <h2 style="margin:28px 0 8px;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#b4552d">Customer</h2>
    <table style="width:100%;border-collapse:collapse">
      ${row("Name", contact.firstName.trim())}
      ${row("Surname", contact.surname.trim())}
      <tr><td style="${KEY}">Phone</td><td style="${CELL}"><a href="tel:${esc(contact.phone.replace(/[^\d+]/g, ""))}" style="color:#9a4522;font-weight:600">${esc(contact.phone.trim())}</a></td></tr>
      <tr><td style="${KEY}">Email</td><td style="${CELL}"><a href="mailto:${esc(contact.email.trim())}" style="color:#9a4522;font-weight:600">${esc(contact.email.trim())}</a></td></tr>
    </table>

    <h2 style="margin:28px 0 8px;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#b4552d">Delivery address</h2>
    <p style="margin:0;font-size:16px;line-height:1.6;color:#1c1b17">
      ${esc(address.street.trim())}<br>
      ${esc(address.suburb.trim())}<br>
      ${esc(address.city.trim())}<br>
      ${esc(address.province.trim())}, ${esc(address.postal.trim())}
    </p>
    <p style="margin:10px 0 0;font-size:14px">
      <a href="https://www.google.com/maps/dir/${encodeURIComponent(
        `${site.address.streetAddress}, ${site.address.city}`,
      )}/${encodeURIComponent(formatDeliveryLocation(address))}" style="color:#9a4522">Route from the yard →</a>
    </p>

    <h2 style="margin:28px 0 8px;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#b4552d">Product to be delivered (${totals.totalUnits} ${totals.totalUnits === 1 ? "unit" : "units"})</h2>
    <ul style="margin:0;padding-left:18px">${unitsHtml}</ul>

    <h2 style="margin:28px 0 8px;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#b4552d">Product quote issued (excludes road delivery)</h2>
    ${totalsHtml}

    ${notesHtml}

    <p style="margin:28px 0 0;padding-top:20px;border-top:1px solid #ddd3c1;font-size:14px;line-height:1.6;color:#67635a">
      Reply to this email to send ${esc(contact.firstName.trim())} their delivery quote —
      it goes straight to their inbox.
    </p>
  </div>
</body>
</html>`;
}

/* ------------------------------------------------- the customer's quotation */

export function customerQuoteSubject(input: QuoteEmailInput): string {
  return `Your Tiny Homes SA quotation — ${input.reference}`;
}

/** Plain-text alternative. Never the primary read, but it is what plain-text
    clients, spam filters and screen readers in text mode actually see. */
export function customerQuoteText(input: QuoteEmailInput): string {
  const { contact, address, lines, reference, notes, date } = input;
  const totals = quoteTotals(lines);
  const out: string[] = [];

  out.push(`TINY HOMES SA — QUOTATION ${reference}`);
  out.push(`Issued ${formatQuoteDate(date)} · valid until ${formatQuoteDate(addDays(date, QUOTE_VALID_DAYS))}`);
  out.push("");
  out.push(`Hi ${contact.firstName.trim()},`);
  out.push("");
  out.push("Thank you for building a quote with us. Here it is in full.");
  out.push("");

  out.push("PREPARED FOR");
  out.push(`  ${fullName(contact)}`);
  out.push(`  ${contact.email.trim()} · ${contact.phone.trim()}`);
  out.push("");
  out.push("DELIVERY ADDRESS");
  out.push(`  ${address.street.trim()}`);
  out.push(`  ${address.suburb.trim()}`);
  out.push(`  ${address.city.trim()}`);
  out.push(`  ${address.province.trim()}, ${address.postal.trim()}`);
  out.push("");

  out.push("YOUR UNITS");
  lines.forEach((line, i) => {
    const size = line.variant ? ` — ${line.variant.size}` : "";
    out.push(`  ${i + 1}. ${lineTitle(line)}${size}`);
    if (line.product.priceOnRequest) {
      out.push("     Priced after consultation");
      return;
    }
    out.push(`     Base unit                 ${formatZAR(line.basePrice)}`);
    for (const option of line.activeOptions) {
      const price = optionPrice(option, line.areaM2);
      out.push(`     + ${option.label}  ${price > 0 ? formatZAR(price) : "priced on quotation"}`);
    }
    if (line.activeOptions.length > 0) {
      out.push(`     Unit price ex VAT         ${formatZAR(line.unitPrice)}`);
    }
    out.push(
      `     Quantity — ${line.quantity} ${line.quantity === 1 ? "unit" : "units"}   ${formatZAR(line.lineTotal)}`,
    );
  });
  out.push("");

  if (totals.hasPricedTotal) {
    out.push(`  Subtotal (excl. VAT)   ${formatZAR(totals.subtotal)}`);
    out.push(`  VAT @ ${VAT_RATE * 100}%              ${formatZAR(totals.vat)}`);
    out.push(`  TOTAL INCL. VAT        ${formatZAR(totals.total)}`);
    if (totals.someOnRequest) out.push("  Plus any units priced after consultation.");
  } else {
    out.push("  Priced after consultation.");
  }
  out.push("");

  const coastalNote = coastalBody(input.coastal);
  if (coastalNote) {
    out.push((coastalHeadline(input.coastal) as string).toUpperCase());
    out.push(coastalNote);
    out.push("");
  }

  out.push("DELIVERY TO YOUR SITE IS NOT INCLUDED");
  out.push("The total above covers your units, the extras you selected and VAT, and");
  out.push("shipping into South Africa is already in that price. What it doesn't cover");
  out.push("is the national leg: getting your unit here by road. That depends on where");
  out.push(`you are, so we'll come back to you with a separate quote for delivery to`);
  out.push(`${address.city.trim() || "your site"}.`);
  out.push("");
  out.push("You're also more than welcome to shop around and arrange your own truck.");
  out.push("We don't add any markup to delivery — whatever the transporter charges us");
  out.push("is what we pass on to you — so use whichever option suits you.");

  if (notes?.trim()) {
    out.push("");
    out.push("YOUR NOTES");
    out.push(`  ${notes.trim()}`);
  }

  out.push("");
  out.push("TERMS");
  out.push(`  · Valid for ${QUOTE_VALID_DAYS} days from the issue date, subject to stock availability.`);
  out.push(`  · All prices in South African Rand. VAT charged at ${VAT_RATE * 100}% on the subtotal.`);
  out.push("  · Optional extras carry provisional pricing, confirmed line by line on your");
  out.push("    formal quotation. Items shown as \"priced on quotation\" are quoted per site.");
  out.push("  · Prices include shipping into South Africa. Road delivery to your site,");
  out.push("    offloading, craneage, foundations and site services are excluded and");
  out.push("    quoted separately.");
  out.push("  · Units delivered to coastal sites require the corrosion-resistant exterior");
  out.push("    specification. Standard cladding is not warranted against salt-air corrosion.");
  out.push(`  · Typical lead time is ${site.leadTimeDays} days from deposit. ${site.guarantee}.`);
  out.push(`    ${site.finance}.`);
  out.push("  · This is an automated estimate generated on tinyhomesa.com and is not a tax invoice.");
  out.push("");
  out.push(`Questions? Reply to this email, call ${site.phoneDisplay}, or message us on WhatsApp.`);
  out.push("");
  out.push(`${site.legalName} · ${site.address.streetAddress}, ${site.address.locality}, ${site.address.city}`);
  return out.join("\n");
}

/** Money row on the emailed quotation. */
function moneyRow(label: string, amount: string, opts: { strong?: boolean; indent?: boolean } = {}) {
  const weight = opts.strong ? "600" : "400";
  const colour = opts.strong ? "#1c1b17" : "#67635a";
  const pad = opts.indent ? "padding-left:16px" : "";
  return `<tr>
    <td style="padding:5px 0;font-size:14px;line-height:1.5;color:${colour};font-weight:${weight};${pad}">${label}</td>
    <td align="right" style="padding:5px 0;font-size:14px;line-height:1.5;color:${colour};font-weight:${weight};white-space:nowrap">${amount}</td>
  </tr>`;
}

export function customerQuoteHtml(input: QuoteEmailInput): string {
  const { contact, address, lines, reference, notes, date } = input;
  const totals = quoteTotals(lines);
  const expires = addDays(date, QUOTE_VALID_DAYS);

  const linesHtml = lines
    .map((line, index) => {
      const size = line.variant ? ` <span style="font-weight:400;color:#67635a">— ${esc(line.variant.size)}</span>` : "";
      const head = `<tr>
        <td style="padding:14px 0 4px;font-size:16px;font-weight:600;color:#1c1b17">${index + 1}. ${esc(lineTitle(line))}${size}</td>
        <td align="right" style="padding:14px 0 4px;font-size:16px;font-weight:600;color:#1c1b17;white-space:nowrap">${
          line.product.priceOnRequest
            ? `<span style="font-size:13px;font-weight:400;color:#67635a">On consultation</span>`
            : esc(formatZAR(line.lineTotal))
        }</td>
      </tr>`;

      if (line.product.priceOnRequest) {
        return `${head}<tr><td colspan="2" style="padding:0 0 10px;font-size:13px;line-height:1.6;color:#67635a">Configured to your site and brief — we&rsquo;ll price this line after a short consultation.</td></tr>`;
      }

      const extras = line.activeOptions
        .map((option) => {
          const price = optionPrice(option, line.areaM2);
          return moneyRow(
            `+ ${esc(option.label)}`,
            price > 0 ? esc(formatZAR(price)) : "priced on quotation",
            { indent: true },
          );
        })
        .join("");

      return `${head}
        ${moneyRow("Base unit", esc(formatZAR(line.basePrice)))}
        ${extras}
        ${line.activeOptions.length > 0 ? moneyRow("Unit price ex VAT", esc(formatZAR(line.unitPrice)), { strong: true }) : ""}
        ${moneyRow(`Quantity — ${line.quantity} ${line.quantity === 1 ? "unit" : "units"}`, esc(formatZAR(line.lineTotal)), { strong: true })}
        <tr><td colspan="2" style="padding:6px 0 0;border-bottom:1px solid #ddd3c1;font-size:0;line-height:0">&nbsp;</td></tr>`;
    })
    .join("");

  const totalsHtml = totals.hasPricedTotal
    ? `<table role="presentation" width="100%" style="border-collapse:collapse;margin-top:14px">
        ${moneyRow("Subtotal (excl. VAT)", esc(formatZAR(totals.subtotal)))}
        ${moneyRow(`VAT @ ${VAT_RATE * 100}%`, esc(formatZAR(totals.vat)))}
        <tr>
          <td style="padding:12px 0 0;border-top:1px solid #ddd3c1;font-size:17px;font-weight:700;color:#1c1b17">Total incl. VAT</td>
          <td align="right" style="padding:12px 0 0;border-top:1px solid #ddd3c1;font-size:22px;font-weight:700;color:#1c1b17;white-space:nowrap">${esc(formatZAR(totals.total))}</td>
        </tr>
      </table>
      ${totals.someOnRequest ? `<p style="margin:10px 0 0;font-size:13px;color:#67635a">Plus any units priced after consultation, quoted separately.</p>` : ""}`
    : `<p style="margin:14px 0 0;font-size:18px;font-weight:600;color:#1c1b17">Priced after consultation</p>`;

  const notesHtml = notes?.trim()
    ? `<h2 style="margin:28px 0 8px;font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:#b4552d">Your notes</h2>
       <p style="margin:0;font-size:14px;line-height:1.6;color:#67635a;white-space:pre-wrap">${esc(notes.trim())}</p>`
    : "";

  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(customerQuoteSubject(input))}</title></head>
<body style="margin:0;padding:24px 12px;background:#f4eee2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" style="border-collapse:collapse">
    <tr><td align="center">
      <table role="presentation" width="640" style="width:100%;max-width:640px;border-collapse:collapse;background:#faf6ef;border:1px solid #ddd3c1;border-radius:16px">

        <!-- Letterhead -->
        <tr><td style="padding:28px 28px 22px;background:#f4eee2;border-bottom:1px solid #ddd3c1;border-radius:16px 16px 0 0">
          <table role="presentation" width="100%" style="border-collapse:collapse">
            <tr>
              <td style="font-size:21px;font-weight:700;color:#1c1b17;line-height:1.2">${esc(site.name)}</td>
              <td align="right" style="font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:#b4552d">Quotation</td>
            </tr>
            <tr>
              <td style="padding-top:8px;font-size:13px;line-height:1.6;color:#67635a">
                ${esc(site.legalName)}<br>
                ${esc(site.address.streetAddress)}, ${esc(site.address.locality)}<br>
                ${esc(site.address.city)}, ${esc(site.address.region)}<br>
                ${esc(site.phoneDisplay)} · ${esc(site.email)}
              </td>
              <td align="right" valign="top" style="padding-top:4px;font-size:13px;line-height:1.6;color:#67635a">
                <span style="font-size:18px;font-weight:700;color:#1c1b17">${esc(reference)}</span><br>
                Issued ${esc(formatQuoteDate(date))}<br>
                Valid until ${esc(formatQuoteDate(expires))}
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Greeting -->
        <tr><td style="padding:26px 28px 0">
          <p style="margin:0;font-size:16px;line-height:1.6;color:#1c1b17">Hi ${esc(contact.firstName.trim())},</p>
          <p style="margin:10px 0 0;font-size:15px;line-height:1.65;color:#67635a">
            Thank you for building a quote with us — here it is in full. Keep this email as your copy;
            there&rsquo;s nothing to download.
          </p>
        </td></tr>

        <!-- Parties -->
        <tr><td style="padding:24px 28px 0">
          <table role="presentation" width="100%" style="border-collapse:collapse">
            <tr>
              <td width="50%" valign="top" style="padding-right:12px">
                <p style="margin:0 0 6px;font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:#b4552d">Prepared for</p>
                <p style="margin:0;font-size:15px;font-weight:600;color:#1c1b17">${esc(fullName(contact))}</p>
                <p style="margin:4px 0 0;font-size:13px;line-height:1.6;color:#67635a">${esc(contact.email.trim())}<br>${esc(contact.phone.trim())}</p>
              </td>
              <td width="50%" valign="top">
                <p style="margin:0 0 6px;font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:#b4552d">Delivery address</p>
                <p style="margin:0;font-size:13px;line-height:1.6;color:#67635a">
                  ${esc(address.street.trim())}<br>
                  ${esc(address.suburb.trim())}<br>
                  ${esc(address.city.trim())}<br>
                  ${esc(address.province.trim())}, ${esc(address.postal.trim())}
                </p>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Line items -->
        <tr><td style="padding:24px 28px 0">
          <table role="presentation" width="100%" style="border-collapse:collapse;border-top:1px solid #ddd3c1">
            <tr>
              <td style="padding-top:12px;font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:#b4552d">Description</td>
              <td align="right" style="padding-top:12px;font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:#b4552d">Amount (ex VAT)</td>
            </tr>
            ${linesHtml}
          </table>
          ${totalsHtml}
        </td></tr>

        <!-- Coastal specification -->
        ${
          coastalHeadline(input.coastal)
            ? `<tr><td style="padding:26px 28px 0">
                <table role="presentation" width="100%" style="border-collapse:collapse;background:${
                  input.coastal === "coastal" ? "#f7ece6" : "#f4eee2"
                };border:1px solid ${
                  input.coastal === "coastal" ? "#b4552d" : "#ddd3c1"
                };border-radius:12px">
                  <tr><td style="padding:18px 20px">
                    <p style="margin:0;font-size:16px;font-weight:700;color:${
                      input.coastal === "coastal" ? "#9a4522" : "#1c1b17"
                    }">${esc(coastalHeadline(input.coastal) as string)}</p>
                    <p style="margin:10px 0 0;font-size:14px;line-height:1.65;color:#67635a">${esc(
                      coastalBody(input.coastal) as string,
                    )}</p>
                  </td></tr>
                </table>
              </td></tr>`
            : ""
        }

        <!-- Delivery -->
        <tr><td style="padding:26px 28px 0">
          <table role="presentation" width="100%" style="border-collapse:collapse;background:#f4eee2;border-radius:12px">
            <tr><td style="padding:18px 20px">
              <p style="margin:0;font-size:16px;font-weight:700;color:#1c1b17">Delivery to your site is not included</p>
              <p style="margin:10px 0 0;font-size:14px;line-height:1.65;color:#67635a">
                The total above covers your units, the extras you selected and VAT — and shipping into
                South Africa is already in that price. What it doesn&rsquo;t cover is the national leg:
                getting your unit here by road. That depends on where you are, so
                <strong style="color:#1c1b17">we&rsquo;ll come back to you with a separate quote for
                delivery</strong> to ${esc(address.city.trim() || "your site")}, along with anything else
                the site needs.
              </p>
              <p style="margin:12px 0 0;font-size:14px;line-height:1.65;color:#67635a">
                You&rsquo;re also more than welcome to shop around and arrange your own truck.
                <strong style="color:#1c1b17">We don&rsquo;t add any markup to delivery</strong> — whatever the
                transporter charges us is what we pass on to you — so use whichever option suits you best.
              </p>
            </td></tr>
          </table>
        </td></tr>

        ${notesHtml ? `<tr><td style="padding:0 28px">${notesHtml}</td></tr>` : ""}

        <!-- Terms -->
        <tr><td style="padding:26px 28px">
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:#b4552d">Terms</p>
          <ul style="margin:0;padding-left:18px;font-size:12px;line-height:1.7;color:#67635a">
            <li>This quotation is valid for ${QUOTE_VALID_DAYS} days from the issue date and is subject to stock availability.</li>
            <li>All prices are in South African Rand. VAT is charged at ${VAT_RATE * 100}% on the subtotal shown.</li>
            <li>Optional extras carry provisional pricing and are confirmed line by line on your formal quotation. Items shown as &ldquo;priced on quotation&rdquo; are quoted per site.</li>
            <li>Prices include shipping into South Africa. Road delivery to your site, offloading, craneage, foundations and site services are excluded and quoted separately.</li>
            <li>Units delivered to coastal sites require the corrosion-resistant exterior specification. Standard cladding is not warranted against salt-air corrosion.</li>
            <li>Typical lead time is ${site.leadTimeDays} days from deposit. ${esc(site.guarantee)}. ${esc(site.finance)}.</li>
            <li>This is an automated estimate generated on tinyhomesa.com and is not a tax invoice.</li>
          </ul>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 28px 26px;border-top:1px solid #ddd3c1">
          <p style="margin:0;font-size:14px;line-height:1.65;color:#67635a">
            Questions about anything here? Just reply to this email, call
            <a href="tel:${esc(site.phone.replace(/\s/g, ""))}" style="color:#9a4522;font-weight:600;text-decoration:none">${esc(site.phoneDisplay)}</a>
            or <a href="${esc(site.whatsapp)}" style="color:#9a4522;font-weight:600;text-decoration:none">message us on WhatsApp</a>.
          </p>
          <p style="margin:14px 0 0;font-size:12px;line-height:1.6;color:#67635a">
            ${esc(site.legalName)} · ${esc(site.address.streetAddress)}, ${esc(site.address.locality)}, ${esc(site.address.city)}<br>
            <a href="${esc(site.url)}" style="color:#9a4522;text-decoration:none">tinyhomesa.com</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
