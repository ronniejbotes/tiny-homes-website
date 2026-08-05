# Showroom bookings — connecting the site to Apple Calendar

**Goal: `/book-a-viewing` shows the half-hour slots that are genuinely free in the
owner's Apple Calendar, and writes each confirmed viewing straight back into it.**

**The page works with or without that connection**, and says which it is:

| | Slots shown | On submit | Wording used |
|---|---|---|---|
| **Calendar connected** (§2) | Real gaps in the diary | Written into Apple Calendar | "Confirmed" |
| **No calendar** | The published timetable | Emailed to the office with the invite attached | "Requested — we'll confirm" |

So the page never sits dead, and it never claims a slot is confirmed when nobody has
looked at the diary. Connecting iCloud upgrades it with no code change.

The one case that does *not* degrade is a calendar that is connected but unreachable —
see §6.

---

## 1. How it works

```
visitor opens /book-a-viewing
   └─ GET /api/viewing/slots
        └─ CalDAV read  ──▶  iCloud  ──▶  busy times for the next 4 weeks
             └─ weekdays 08:00–15:30, minus anything busy  ──▶  the slot grid

visitor picks a slot and submits
   └─ POST /api/viewing
        ├─ re-reads that one slot from iCloud (the grid may be a minute old)
        ├─ CalDAV write ──▶  the viewing appears in Apple Calendar
        └─ two emails, each with the same invitation attached
             ├─ the visitor  (confirmation + .ics)
             └─ the office   (who's coming + .ics, Reply-To the visitor)
```

The event carries two alarms, 24 hours and 1 hour before, so it nudges rather than just
sits there.

| Rule | Value | Where it lives |
|---|---|---|
| Days | Monday–Friday only | `src/lib/viewing.ts` |
| Hours | 08:00 – 15:30 SAST | `OPEN_MINUTES` / `CLOSE_MINUTES` |
| Slot length | 30 minutes | `SLOT_MINUTES` |
| Earliest booking | the next working day | `MIN_LEAD_DAYS` |
| Latest booking | 28 days out | `BOOKING_WINDOW_DAYS` |

Change them in that one file: the page copy, the slot grid, the server-side validation
and the `openingHours` structured data all read from those constants, so they cannot
drift apart.

---

## 2. Setting it up

### 2.1 Generate an app-specific password

Do this on the Apple ID that owns the calendar.

1. Go to **appleid.apple.com** and sign in.
2. **Sign-In and Security** → **App-Specific Passwords**.
3. **Generate an app-specific password**, name it something like `Tiny Homes website`.
4. Copy the password Apple shows. It looks like `abcd-efgh-ijkl-mnop`. **It is shown
   once.**

This is *not* the Apple ID password. It grants access only through this integration and
can be revoked from the same screen at any time without changing anything else, which is
exactly why it is the right credential to hand a web server.

Two-factor authentication must be on for the option to appear. It normally already is.

### 2.2 Set the environment variables

Hostinger → the Node.js app → **Environment variables** (and `.env.local` for local
work):

```
ICLOUD_APPLE_ID=the.owner@icloud.com
ICLOUD_APP_PASSWORD=abcd-efgh-ijkl-mnop
```

Optionally pick which calendar to use, by its name in Apple Calendar:

```
ICLOUD_CALENDAR_NAME=Work
```

Left unset, the site uses the account's **first event calendar**, which is usually
"Home". Set it explicitly if viewings should live somewhere else.

Restart the app. The slot grid should fill in on the next page load.

### 2.3 Check it worked

- Open `/book-a-viewing`. Days with commitments should show fewer than 15 slots.
- Put a test event in the calendar for tomorrow at 10:00, reload, and confirm 10:00 has
  disappeared.
- Book a slot as a visitor would. Within a few seconds it should appear in Apple
  Calendar on the phone, and two emails should arrive.

---

## 3. What blocks a slot, and what does not

The availability check reads **one calendar** — the one named in
`ICLOUD_CALENDAR_NAME`, or the first event calendar otherwise.

| In the calendar | Blocks the slot? |
|---|---|
| An ordinary timed event | **Yes** |
| A recurring event (weekly meeting, standing commitment) | **Yes** |
| An all-day event | **Yes**, the whole day |
| An event marked **Show As: Free** | No |
| A cancelled event | No |
| Anything on a *different* calendar | **No** |

Two consequences worth knowing:

- **A subscribed holidays or birthdays calendar will not block anything.** That is
  usually what you want. But it also means a commitment kept on a shared family calendar
  is invisible to the site, and someone can book over it. Real commitments belong on the
  calendar named above.
- **Set an all-day "Leave" event to block a whole day.** If you want a day-long marker
  that does *not* block bookings — a birthday, say — set its **Show As** to **Free** in
  Apple Calendar and the site will ignore it.

---

## 4. Timezone

Everything is South African Standard Time, and the code treats it as a fixed UTC+2. That
is exact, not an approximation: South Africa has observed no daylight saving since 1944.

Calendar entries stamped in *other* zones are still read correctly, daylight saving and
all, so an event added while travelling blocks the right South African hours.

---

## 5. Volume and limits

- **Emails.** Two per booking, against Hostinger's cap of 100 sends per mailbox per 24
  hours — shared with the quote flow, which also costs two. Roughly 50 quotes and
  bookings a day combined before sends start bouncing. See `src/lib/mailer.ts`.
- **iCloud reads.** Cached for 60 seconds, so a busy day is a handful of requests, not
  one per visitor.
- **Rate limit.** Six *valid* bookings per IP per 30 minutes. Rejected submissions are
  not counted, so someone mistyping their email address is never locked out.

---

## 6. When things break

The failure modes are deliberate. Nothing here ever offers a slot it has not verified.

| Symptom | What the visitor sees | Cause |
|---|---|---|
| No `ICLOUD_*` variables set | The full timetable, "we'll confirm by phone or WhatsApp" | Not connected — bookings arrive as emails |
| iCloud unreachable or password revoked | "Let's book you in by phone" + phone and WhatsApp | `[viewing] could not read the iCloud diary` in the logs |
| Every slot taken for four weeks | "We're fully booked for the next few weeks" | Genuinely full |
| Booking fails at the last step | "Please call or WhatsApp us so we can confirm your time properly" | The CalDAV write failed; **no email is sent and nothing is confirmed** |
| Slot taken mid-form | "That slot was taken while you were filling this in" | Someone else booked it; the grid refreshes |
| No calendar *and* no SMTP | "We could not record that booking" | Nothing would hold the booking, so it fails rather than fake a tick |

Two rules the site keeps in every one of those cases:

1. **It never shows a confirmation for a viewing nothing is holding.** With a calendar
   connected, the write to iCloud *is* the booking. Without one, the office email is —
   and if that email fails to send, the visitor is told it failed.
2. **It never guesses at a diary it is supposed to be able to read.** "Not connected"
   degrades to the published timetable. "Connected but unreachable" does not, because
   that is how someone gets booked into a slot the owner is already out on a job for.

**Why the row above says "not connected" is safe to degrade:** nothing is syncing, so
there is no diary to clash with. The office is working from the emails exactly as it
would for a phone call, and the invitation attached drops the slot into the owner's
calendar with one tap. The office email in that mode carries a red panel saying **"This
is NOT in your calendar"**, and the subject line starts `ACTION:`, so it cannot be
mistaken for a confirmed booking.

### Revoking access

appleid.apple.com → **Sign-In and Security** → **App-Specific Passwords** → revoke.
The site falls back to the phone message on the next request. Nothing else is affected.

---

## 7. Where the code lives

| File | Job |
|---|---|
| `src/lib/viewing.ts` | Hours, slot maths, the SAST clock. Safe to import in the browser. |
| `src/lib/ical-parse.ts` | Pure iCalendar parsing: turning calendar entries into busy spans. |
| `src/lib/caldav.ts` | iCloud connection, the diary read, the event write. Server-only. |
| `src/lib/ics.ts` | Builds the event, for both the calendar write and the email invites. |
| `src/lib/viewing-email.ts` | The two emails. |
| `src/app/api/viewing/slots/route.ts` | `GET` the availability grid. |
| `src/app/api/viewing/route.ts` | `POST` a booking. |
| `src/components/viewing/viewing-booker.tsx` | The picker and the confirmation screen. |
| `src/components/home/showroom-invite.tsx` | The "Think this is a scam?" section on the homepage. |
