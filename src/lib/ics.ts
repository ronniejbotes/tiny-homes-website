/**
 * iCalendar (RFC 5545) generation for showroom viewings.
 *
 * One builder feeds two very different consumers, which is why it takes a
 * `method`:
 *
 *   - The CalDAV `PUT` that writes the viewing into the owner's iCloud
 *     calendar. A calendar object stored on a server must carry **no** METHOD
 *     property (RFC 4791 §4.1), so that call passes none.
 *   - The `.ics` attached to the confirmation emails. That one is METHOD:REQUEST,
 *     which is what makes Apple Mail show its "Add to Calendar" banner and
 *     Gmail show RSVP buttons instead of an anonymous file attachment.
 *
 * Times are written in UTC (`…Z`). That avoids shipping a VTIMEZONE block, and
 * every calendar client renders them back in the reader's own zone — which for
 * a Centurion showroom is very nearly always the zone we meant.
 */

import { sastToInstant, VIEWING_MINUTES, type DayKey } from "@/lib/viewing";

export interface CalendarPerson {
  name: string;
  email: string;
}

export interface CalendarEventInput {
  /** Stable across the event's life; the CalDAV filename is derived from it. */
  uid: string;
  day: DayKey;
  /** Minutes past South African midnight. */
  minutes: number;
  summary: string;
  description: string;
  location: string;
  /**
   * The exact pin. LOCATION is free text, so a client that wants to draw a map
   * has to geocode it — and "187 Gouws Ave, Raslouw AH" geocodes to the street,
   * not to the gate. GEO (RFC 5545 §3.8.1.6) hands the client the coordinates
   * instead, which is what makes tapping the event in a phone calendar open
   * the right point.
   */
  geo?: { latitude: number; longitude: number };
  organiser: CalendarPerson;
  attendee: CalendarPerson;
  url?: string;
  /** Set for email copies, omitted for the CalDAV write. */
  method?: "REQUEST" | "PUBLISH";
  /** Fixed at call time so a regenerated file is byte-identical in tests. */
  stamp?: Date;
}

/** `20260812T063000Z` — the RFC 5545 UTC form. */
function stampUtc(instant: Date): string {
  return `${instant.toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`;
}

/**
 * Escape a TEXT value: backslash first, or the escapes we add below would be
 * escaped again. Real newlines become the literal two characters `\n`.
 */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * Fold to 75 octets per RFC 5545 §3.1.
 *
 * The limit is octets, not characters, and the split must not land inside a
 * multi-byte sequence — an é cut in half makes the whole file unparseable in
 * some clients. Measuring each character's UTF-8 length as we go keeps that
 * from happening.
 */
function fold(line: string): string {
  const LIMIT = 75;
  const out: string[] = [];
  let current = "";
  let bytes = 0;

  for (const char of line) {
    const size = new TextEncoder().encode(char).length;
    // Continuation lines start with a space, which itself costs an octet.
    const budget = out.length === 0 ? LIMIT : LIMIT - 1;
    if (bytes + size > budget) {
      out.push(current);
      current = "";
      bytes = 0;
    }
    current += char;
    bytes += size;
  }
  out.push(current);

  return out.map((part, index) => (index === 0 ? part : ` ${part}`)).join("\r\n");
}

/**
 * A quoted parameter value. Commas, semicolons and colons are all legal inside
 * the quotes; a double quote is the one character that cannot be escaped at
 * all (RFC 5545 §3.1), so it is dropped rather than allowed to break the file.
 */
function quotedParam(value: string): string {
  return `"${value.replace(/"/g, "")}"`;
}

/**
 * The pin, twice.
 *
 * GEO is the standard property, and the one anything RFC-compliant reads.
 * X-APPLE-STRUCTURED-LOCATION is the one that does the work in practice:
 * Apple Calendar ignores a bare GEO, and this is what turns the event into a
 * map thumbnail with a Directions button on an iPhone. Every other client
 * ignores an X- property, so it costs nothing to carry both.
 */
function geoLines(
  geo: { latitude: number; longitude: number },
  title: string,
  address: string,
): string[] {
  return [
    `GEO:${geo.latitude};${geo.longitude}`,
    `X-APPLE-STRUCTURED-LOCATION;VALUE=URI;X-ADDRESS=${quotedParam(address)};` +
      `X-APPLE-RADIUS=72;X-TITLE=${quotedParam(title)}:geo:${geo.latitude},${geo.longitude}`,
  ];
}

/** A CAL-ADDRESS with its display name, shared by ORGANIZER and ATTENDEE. */
function person(property: string, params: string, who: CalendarPerson): string {
  return `${property};CN=${escapeText(who.name)}${params}:mailto:${who.email}`;
}

/**
 * Build the calendar object.
 *
 * PRODID is our own identifier; clients show it nowhere but it is required.
 * The two VALARMs are the point of the whole exercise for the owner: a viewing
 * booked three weeks out is worthless in a calendar that does not nudge them
 * the day before.
 */
export function viewingIcs(input: CalendarEventInput): string {
  const start = sastToInstant(input.day, input.minutes);
  const end = sastToInstant(input.day, input.minutes + VIEWING_MINUTES);
  const stamp = input.stamp ?? new Date();

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Tiny Homes SA//Showroom viewings//EN",
    "CALSCALE:GREGORIAN",
    ...(input.method ? [`METHOD:${input.method}`] : []),
    "BEGIN:VEVENT",
    `UID:${input.uid}`,
    `DTSTAMP:${stampUtc(stamp)}`,
    `DTSTART:${stampUtc(start)}`,
    `DTEND:${stampUtc(end)}`,
    `SUMMARY:${escapeText(input.summary)}`,
    `DESCRIPTION:${escapeText(input.description)}`,
    `LOCATION:${escapeText(input.location)}`,
    ...(input.geo ? geoLines(input.geo, input.summary, input.location) : []),
    ...(input.url ? [`URL:${input.url}`] : []),
    person("ORGANIZER", "", input.organiser),
    person(
      "ATTENDEE",
      ";ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;RSVP=FALSE",
      input.attendee,
    ),
    // Opaque: a viewing must make the owner look busy to the next visitor
    // asking for slots, which is exactly how the diary read works.
    "TRANSP:OPAQUE",
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "TRIGGER:-PT24H",
    `DESCRIPTION:${escapeText(`Tomorrow: ${input.summary}`)}`,
    "END:VALARM",
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "TRIGGER:-PT1H",
    `DESCRIPTION:${escapeText(`In an hour: ${input.summary}`)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  // CRLF throughout, and a trailing one: RFC 5545 wants every content line
  // terminated, and some Windows clients drop the last line without it.
  return `${lines.map(fold).join("\r\n")}\r\n`;
}
