/**
 * POST /api/viewing: books a showroom viewing and confirms it on the spot.
 *
 * Contract with the browser, and it is the opposite of /api/quote's. A quote is
 * computed in the browser and this server only delivers it, so that route
 * answers 200 even when the mail fails. A booking is a promise that someone
 * will be standing in Centurion at 10:00 on Thursday, and the only thing that
 * makes it true is the event landing in the owner's calendar. So the write to
 * iCloud is the request: if it fails, this fails, and the visitor is told to
 * phone rather than shown a confirmation nobody will honour.
 *
 * Email is the opposite again — the booking is already real once it is in the
 * diary, so a bounced confirmation is reported, not fatal.
 */

import { NextResponse } from "next/server";
import { createCalendarEvent, fetchBusyIntervals, isCalendarConfigured } from "@/lib/caldav";
import { isMailConfigured, notifyAddress, sendMail } from "@/lib/mailer";
import { viewingIcs } from "@/lib/ics";
import { clientIp, EMAIL_RE, rateLimited, str } from "@/lib/rate-limit";
import { site } from "@/lib/site";
import { getProduct } from "@/data/products";
import {
  PARTY_MAX,
  PARTY_MIN,
  VIEWING_MINUTES,
  freeSlotsFor,
  isBookableDay,
  makeViewingReference,
  sastToInstant,
  slotStarts,
  type ViewingBooking,
} from "@/lib/viewing";
import {
  customerViewingHtml,
  customerViewingSubject,
  customerViewingText,
  eventDescription,
  officeViewingHtml,
  officeViewingSubject,
  officeViewingText,
  showroomAddress,
  viewingFullName,
} from "@/lib/viewing-email";

export const runtime = "nodejs";

/* ------------------------------------------------------------ rate limiting */

/**
 * Applied *after* validation, not before, and the distinction matters.
 *
 * A malformed submission costs nothing — no diary read, no write, no email —
 * so charging it against the allowance only punishes the person mistyping
 * their email address on a phone. What deserves throttling is a well-formed
 * booking, because that is what fills the owner's week with fictional
 * visitors. Six per half hour from one address is far beyond anything a real
 * customer does, and leaves room for the shared connections a good deal of
 * South African mobile traffic sits behind.
 */
const WINDOW_MS = 30 * 60 * 1000;
const MAX_PER_WINDOW = 6;

/* ------------------------------------------------------------------ parsing */

interface ParsedBooking {
  day: string;
  minutes: number;
  details: Omit<ViewingBooking, "reference" | "day" | "minutes">;
}

function parseBooking(body: Record<string, unknown>): ParsedBooking | string {
  const firstName = str(body.firstName, 80);
  const surname = str(body.surname, 80);
  const email = str(body.email, 160);
  const phone = str(body.phone, 40);

  if (!firstName || !surname) return "Please give us your first name and surname.";
  if (!EMAIL_RE.test(email)) return "That email address does not look right.";
  if (phone.replace(/\D/g, "").length < 9) return "Please give us a contactable phone number.";

  const day = str(body.day, 10);
  if (!isBookableDay(day)) {
    return "That date is no longer available. Please pick another one.";
  }

  const minutes = Number(body.minutes);
  if (!Number.isInteger(minutes) || !slotStarts().includes(minutes)) {
    return "That time is not one we offer. Please pick a slot from the list.";
  }

  // An unknown slug is dropped rather than rejected: the product they came to
  // see is a nicety, and losing the booking over it would be absurd.
  const interestRaw = str(body.interest, 60);
  const interest = getProduct(interestRaw) ? interestRaw : "";

  const partyRaw = Number(body.partySize);
  const partySize = Number.isInteger(partyRaw)
    ? Math.min(PARTY_MAX, Math.max(PARTY_MIN, partyRaw))
    : 1;

  return {
    day,
    minutes,
    details: { firstName, surname, email, phone, interest, partySize, notes: str(body.notes, 1000) },
  };
}

/* ------------------------------------------------------------------ handler */

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Malformed request body." }, { status: 400 });
  }

  // Honeypot: hidden from people, irresistible to form bots. Answer as though
  // it worked so there is nothing to tune against, but book and send nothing.
  if (str(body.company)) {
    return NextResponse.json({ reference: makeViewingReference(), confirmed: true, copySent: true });
  }

  const parsed = parseBooking(body);
  if (typeof parsed === "string") {
    return NextResponse.json({ error: parsed }, { status: 400 });
  }

  const { day, minutes, details } = parsed;

  if (rateLimited("viewing", clientIp(request), { windowMs: WINDOW_MS, max: MAX_PER_WINDOW })) {
    return NextResponse.json(
      { error: "Too many bookings from this connection. Please call or WhatsApp us instead." },
      { status: 429 },
    );
  }

  const booking: ViewingBooking = { ...details, day, minutes, reference: makeViewingReference() };

  const uid = `viewing-${booking.reference.toLowerCase()}@tinyhomesa.com`;
  const summary = `Showroom viewing — ${viewingFullName(booking)}`;
  const organiser = { name: site.name, email: site.email };
  const attendee = { name: viewingFullName(booking), email: booking.email };
  const location = showroomAddress();
  const description = eventDescription(booking);

  /*
   * With no calendar connected the booking still goes through — it is just a
   * request rather than a confirmation, and every message says so.
   *
   * Turning the visitor away here would be the worse failure. Nothing is
   * syncing, so there is no diary to clash with; the office works from the
   * email, exactly as it does for a phone call, and the invitation attached to
   * it drops the slot into the owner's calendar with one tap. Connecting
   * iCloud upgrades this path to a real availability check and an automatic
   * write, with no code change.
   */
  const confirmed = isCalendarConfigured();

  if (confirmed) {
    /* ------------------------------------------- last look at the diary */

    // Re-checked against iCloud rather than trusted from the grid the visitor
    // was shown, which may be minutes old. Querying only this slot's own window
    // keeps it cheap and, because it is a different cache key from the grid
    // read, it is always a fresh answer.
    //
    // Two people submitting the same slot within the same second could still
    // both pass this check: it is a read followed by a write, not one atomic
    // operation. At a few viewings a week that is a phone call, not a system,
    // and the alternative is a locking scheme this business does not need.
    const slotStart = sastToInstant(day, minutes);
    const slotEnd = sastToInstant(day, minutes + VIEWING_MINUTES);

    try {
      const busy = await fetchBusyIntervals(slotStart, slotEnd);
      if (!freeSlotsFor(day, busy).includes(minutes)) {
        return NextResponse.json(
          {
            error:
              "Sorry — that slot was taken while you were filling this in. Please pick another.",
            taken: true,
          },
          { status: 409 },
        );
      }
    } catch (error) {
      console.error("[viewing] could not re-check the diary before booking:", error);
      return NextResponse.json(
        {
          error:
            "We could not reach our calendar to confirm that time. Please call or WhatsApp us and we will book you in.",
        },
        { status: 503 },
      );
    }

    /* ---------------------------------------------------- write it in */

    try {
      await createCalendarEvent(
        uid,
        // No METHOD: a calendar object stored on a CalDAV server must not carry one.
        viewingIcs({
          uid,
          day,
          minutes,
          summary,
          description,
          location,
          geo: site.geo,
          organiser,
          attendee,
        }),
      );
    } catch (error) {
      console.error("[viewing] iCloud rejected the booking:", error);
      return NextResponse.json(
        {
          error:
            "We could not write that booking into our calendar. Please call or WhatsApp us so we can confirm your time properly.",
        },
        { status: 503 },
      );
    }
  } else {
    console.warn(
      `[viewing] no calendar connected: ${booking.reference} taken as a request, email only.`,
    );
  }

  /* ------------------------------------------------------------ tell them */

  // METHOD:REQUEST is what turns the attachment into an "Add to Calendar"
  // banner in Apple Mail rather than an anonymous file.
  const invite = viewingIcs({
    uid,
    day,
    minutes,
    summary,
    description,
    location,
    geo: site.geo,
    organiser,
    attendee,
    url: `${site.url}/book-a-viewing`,
    method: "REQUEST",
  });

  const calendar = { filename: "viewing.ics", content: invite, method: "REQUEST" as const };

  if (!isMailConfigured()) {
    console.error(
      `[viewing] SMTP not configured: ${booking.reference} was ${
        confirmed ? "written to the calendar" : "taken"
      } but nobody was told.`,
    );
    // With no calendar AND no mail there is nothing left holding the booking,
    // so this is a failure rather than something to show a tick for.
    if (!confirmed) {
      return NextResponse.json(
        {
          error:
            "We could not record that booking. Please call or WhatsApp us and we will set a time.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json({
      reference: booking.reference,
      booked: true,
      confirmed,
      copySent: false,
      ics: invite,
    });
  }

  const [copy, notification] = await Promise.allSettled([
    sendMail({
      to: booking.email,
      subject: customerViewingSubject(booking, confirmed),
      text: customerViewingText(booking, confirmed),
      html: customerViewingHtml(booking, confirmed),
      calendar,
    }),
    sendMail({
      to: notifyAddress(),
      replyTo: booking.email,
      subject: officeViewingSubject(booking, confirmed),
      text: officeViewingText(booking, confirmed),
      html: officeViewingHtml(booking, confirmed),
      calendar,
    }),
  ]);

  if (copy.status === "rejected") {
    console.error("[viewing] confirmation to the visitor failed to send:", copy.reason);
  }
  if (notification.status === "rejected") {
    console.error("[viewing] office notification failed to send:", notification.reason);
  }

  // Without a calendar the office email IS the booking. If it did not send,
  // nothing anywhere records that this person is coming, so say so rather than
  // show them a tick.
  if (!confirmed && notification.status === "rejected") {
    return NextResponse.json(
      {
        error:
          "We could not get that booking through to the office. Please call or WhatsApp us and we will set a time.",
      },
      { status: 503 },
    );
  }

  return NextResponse.json({
    reference: booking.reference,
    booked: true,
    confirmed,
    copySent: copy.status === "fulfilled",
    // Handed back so the confirmation screen's "Add to my calendar" button
    // offers the identical event, rather than a second one rebuilt in the
    // browser that could drift from what we actually diarised.
    ics: invite,
  });
}
