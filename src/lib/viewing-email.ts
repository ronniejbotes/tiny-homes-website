/**
 * Composes the two emails a confirmed showroom viewing sends:
 *
 *  1. The visitor's confirmation. This one carries the calendar invitation, so
 *     the appointment lands in their own calendar with a reminder the day
 *     before — which is the cheapest no-show insurance there is — and it
 *     repeats the address, the map link and a phone number, because the thing
 *     someone actually needs from this email is to find the place.
 *  2. The office copy. Same invitation, plus who is coming and what they came
 *     to see, with Reply-To set to the visitor so answering the mail answers
 *     them.
 *
 * Server-only.
 */

import { site } from "@/lib/site";
import { getProduct } from "@/data/products";
import { formatDayLong, formatSlot, formatSlotLong, VIEWING_MINUTES, type ViewingBooking } from "@/lib/viewing";

const esc = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export function viewingFullName(booking: ViewingBooking): string {
  return `${booking.firstName.trim()} ${booking.surname.trim()}`.trim();
}

/** The product they came to see, in words. */
export function viewingInterest(booking: ViewingBooking): string {
  const product = booking.interest ? getProduct(booking.interest) : undefined;
  return product ? product.name : "The range in general";
}

export function showroomAddress(): string {
  return `${site.address.streetAddress}, ${site.address.locality}, ${site.address.city}, ${site.address.region}`;
}

export function directionsUrl(): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${site.geo.latitude},${site.geo.longitude}`;
}

/** The window, as a person reads it: "08:30 – 09:00". */
export function slotWindow(booking: ViewingBooking): string {
  return `${formatSlot(booking.minutes)} – ${formatSlot(booking.minutes + VIEWING_MINUTES)}`;
}

/* ------------------------------------------------- the calendar description */

/** What the owner sees inside the event itself, where the detail is useful. */
export function eventDescription(booking: ViewingBooking): string {
  return [
    `Showroom viewing booked from tinyhomesa.com`,
    ``,
    `Name: ${viewingFullName(booking)}`,
    `Phone: ${booking.phone}`,
    `Email: ${booking.email}`,
    `Party: ${booking.partySize} ${booking.partySize === 1 ? "person" : "people"}`,
    `Interested in: ${viewingInterest(booking)}`,
    ...(booking.notes.trim() ? [``, `Notes: ${booking.notes.trim()}`] : []),
    ``,
    `Reference: ${booking.reference}`,
  ].join("\n");
}

/* ------------------------------------------------------ visitor's copy */

export function customerViewingSubject(booking: ViewingBooking): string {
  return `Your showroom viewing is confirmed — ${formatDayLong(booking.day)}, ${formatSlot(
    booking.minutes,
  )}`;
}

export function customerViewingText(booking: ViewingBooking): string {
  return [
    `Hi ${booking.firstName.trim()},`,
    ``,
    `Your viewing at the ${site.name} showroom is confirmed.`,
    ``,
    `WHEN   ${formatSlotLong(booking.day, booking.minutes)}`,
    `WHERE  ${showroomAddress()}`,
    `DIRECTIONS  ${directionsUrl()}`,
    ``,
    `Coming to see: ${viewingInterest(booking)}`,
    `Party size: ${booking.partySize} ${booking.partySize === 1 ? "person" : "people"}`,
    `Reference: ${booking.reference}`,
    ``,
    `A calendar invitation is attached to this email — open it to add the`,
    `viewing to your phone's calendar.`,
    ``,
    `Something come up? Call or WhatsApp ${site.phoneDisplay} and we will move it.`,
    `No charge, no awkwardness, we would just rather know than stand around waiting.`,
    ``,
    `See you then,`,
    `${site.name}`,
    `${site.phoneDisplay} · ${site.email}`,
    site.url,
  ].join("\n");
}

const PANEL =
  "background:#f4eee2;border:1px solid #ddd3c1;border-radius:12px;padding:18px 20px";

export function customerViewingHtml(booking: ViewingBooking): string {
  const notesHtml = booking.notes.trim()
    ? `<tr><td style="padding:18px 0 0"><p style="margin:0 0 4px;font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:#b4552d">Your notes</p>
       <p style="margin:0;font-size:14px;line-height:1.6;color:#67635a;white-space:pre-wrap">${esc(booking.notes.trim())}</p></td></tr>`
    : "";

  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(customerViewingSubject(booking))}</title></head>
<body style="margin:0;padding:24px 12px;background:#f4eee2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" style="border-collapse:collapse">
    <tr><td align="center">
      <table role="presentation" width="640" style="width:100%;max-width:640px;border-collapse:collapse;background:#faf6ef;border:1px solid #ddd3c1;border-radius:16px">

        <tr><td style="padding:28px 28px 22px;background:#f4eee2;border-bottom:1px solid #ddd3c1;border-radius:16px 16px 0 0">
          <table role="presentation" width="100%" style="border-collapse:collapse">
            <tr>
              <td style="font-size:21px;font-weight:700;color:#1c1b17;line-height:1.2">${esc(site.name)}</td>
              <td align="right" style="font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:#b4552d">Viewing confirmed</td>
            </tr>
          </table>
        </td></tr>

        <tr><td style="padding:28px">
          <p style="margin:0 0 6px;font-size:16px;color:#1c1b17">Hi ${esc(booking.firstName.trim())},</p>
          <p style="margin:0 0 22px;font-size:16px;line-height:1.6;color:#67635a">
            You&rsquo;re booked in. Here are the details — and there&rsquo;s a calendar
            invitation attached, so you can drop it straight into your phone.
          </p>

          <table role="presentation" width="100%" style="border-collapse:collapse">
            <tr><td style="${PANEL}">
              <p style="margin:0 0 4px;font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:#b4552d">When</p>
              <p style="margin:0 0 2px;font-size:19px;font-weight:700;color:#1c1b17">${esc(formatDayLong(booking.day))}</p>
              <p style="margin:0;font-size:19px;font-weight:700;color:#1c1b17">${esc(slotWindow(booking))} <span style="font-size:14px;font-weight:400;color:#67635a">(SAST)</span></p>
            </td></tr>

            <tr><td style="padding:12px 0 0"><table role="presentation" width="100%" style="border-collapse:collapse"><tr><td style="${PANEL}">
              <p style="margin:0 0 4px;font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:#b4552d">Where</p>
              <p style="margin:0 0 10px;font-size:16px;line-height:1.55;color:#1c1b17">${esc(showroomAddress())}</p>
              <a href="${esc(directionsUrl())}" style="display:inline-block;background:#b4552d;color:#faf6ef;text-decoration:none;font-size:15px;font-weight:600;padding:11px 22px;border-radius:999px">Get directions</a>
            </td></tr></table></td></tr>

            <tr><td style="padding:18px 0 0">
              <table role="presentation" width="100%" style="border-collapse:collapse">
                <tr>
                  <td style="padding:6px 0;font-size:15px;color:#67635a;width:130px">Coming to see</td>
                  <td style="padding:6px 0;font-size:15px;color:#1c1b17">${esc(viewingInterest(booking))}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:15px;color:#67635a">Party size</td>
                  <td style="padding:6px 0;font-size:15px;color:#1c1b17">${booking.partySize} ${booking.partySize === 1 ? "person" : "people"}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:15px;color:#67635a">Reference</td>
                  <td style="padding:6px 0;font-size:15px;color:#1c1b17">${esc(booking.reference)}</td>
                </tr>
              </table>
            </td></tr>
            ${notesHtml}
          </table>

          <p style="margin:24px 0 0;font-size:14px;line-height:1.65;color:#67635a">
            Something come up? Call or WhatsApp
            <a href="tel:${esc(site.phone.replace(/\s/g, ""))}" style="color:#8f4224;font-weight:600;text-decoration:none">${esc(site.phoneDisplay)}</a>
            and we&rsquo;ll move it. No charge and no awkwardness — we&rsquo;d just rather
            know than stand around waiting.
          </p>
        </td></tr>

        <tr><td style="padding:20px 28px 26px;background:#f4eee2;border-top:1px solid #ddd3c1;border-radius:0 0 16px 16px">
          <p style="margin:0;font-size:13px;line-height:1.6;color:#67635a">
            ${esc(site.name)} · ${esc(site.phoneDisplay)} ·
            <a href="mailto:${esc(site.email)}" style="color:#8f4224;text-decoration:none">${esc(site.email)}</a><br>
            <a href="${esc(site.url)}" style="color:#8f4224;text-decoration:none">${esc(site.url.replace("https://", ""))}</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/* --------------------------------------------------------- office copy */

export function officeViewingSubject(booking: ViewingBooking): string {
  return `Viewing booked: ${viewingFullName(booking)} — ${formatDayLong(booking.day)}, ${formatSlot(
    booking.minutes,
  )}`;
}

export function officeViewingText(booking: ViewingBooking): string {
  return [
    `A showroom viewing has been booked on the website and written into the calendar.`,
    ``,
    `WHEN   ${formatSlotLong(booking.day, booking.minutes)}`,
    ``,
    `Name    ${viewingFullName(booking)}`,
    `Phone   ${booking.phone}`,
    `Email   ${booking.email}`,
    `Party   ${booking.partySize} ${booking.partySize === 1 ? "person" : "people"}`,
    `Wants to see  ${viewingInterest(booking)}`,
    ...(booking.notes.trim() ? [``, `Notes: ${booking.notes.trim()}`] : []),
    ``,
    `Reference: ${booking.reference}`,
    ``,
    `Reply to this email to reach them directly.`,
  ].join("\n");
}

export function officeViewingHtml(booking: ViewingBooking): string {
  const row = (label: string, value: string) =>
    `<tr>
      <td style="padding:7px 0;font-size:15px;line-height:1.5;color:#67635a;width:120px;vertical-align:top">${esc(label)}</td>
      <td style="padding:7px 0;font-size:15px;line-height:1.5;color:#1c1b17;vertical-align:top">${value}</td>
    </tr>`;

  const notesHtml = booking.notes.trim()
    ? `<h2 style="margin:24px 0 8px;font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:#b4552d">Notes</h2>
       <p style="margin:0;font-size:14px;line-height:1.6;color:#67635a;white-space:pre-wrap">${esc(booking.notes.trim())}</p>`
    : "";

  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(officeViewingSubject(booking))}</title></head>
<body style="margin:0;padding:24px 12px;background:#f4eee2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" style="border-collapse:collapse">
    <tr><td align="center">
      <table role="presentation" width="640" style="width:100%;max-width:640px;border-collapse:collapse;background:#faf6ef;border:1px solid #ddd3c1;border-radius:16px">

        <tr><td style="padding:26px 28px 20px;background:#f4eee2;border-bottom:1px solid #ddd3c1;border-radius:16px 16px 0 0">
          <p style="margin:0 0 4px;font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:#b4552d">Showroom viewing booked</p>
          <p style="margin:0;font-size:21px;font-weight:700;color:#1c1b17;line-height:1.25">${esc(formatDayLong(booking.day))}, ${esc(slotWindow(booking))}</p>
        </td></tr>

        <tr><td style="padding:24px 28px 28px">
          <table role="presentation" width="100%" style="border-collapse:collapse">
            ${row("Name", esc(viewingFullName(booking)))}
            ${row("Phone", `<a href="tel:${esc(booking.phone.replace(/\s/g, ""))}" style="color:#8f4224;font-weight:600;text-decoration:none">${esc(booking.phone)}</a>`)}
            ${row("Email", `<a href="mailto:${esc(booking.email)}" style="color:#8f4224;text-decoration:none">${esc(booking.email)}</a>`)}
            ${row("Party", `${booking.partySize} ${booking.partySize === 1 ? "person" : "people"}`)}
            ${row("Wants to see", esc(viewingInterest(booking)))}
            ${row("Reference", esc(booking.reference))}
          </table>
          ${notesHtml}
          <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#67635a">
            It is already in the calendar — the invitation attached is just a copy.
            Reply to this email to reach them directly.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
