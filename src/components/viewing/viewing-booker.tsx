"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CalendarPlus,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Phone,
} from "lucide-react";
import { Button, ButtonAnchor } from "@/components/ui/button";
import { TextField, inputClasses, labelClasses } from "@/components/quote/fields";
import { products } from "@/data/products";
import { site, showroomDirectionsUrl } from "@/lib/site";
import { cn } from "@/lib/cn";
import {
  HOURS_LABEL,
  PARTY_MAX,
  VIEWING_MINUTES,
  formatDayLong,
  formatDayShort,
  formatSlot,
  type DayKey,
} from "@/lib/viewing";

/* --------------------------------------------------------------- the wire */

interface SlotsResponse {
  days: Record<string, number[]>;
  available: boolean;
  /** False when no diary is connected: these are published hours, not real gaps. */
  verified: boolean;
  reason?: "calendar-unreachable" | "fully-booked";
}

interface Confirmation {
  reference: string;
  day: DayKey;
  minutes: number;
  email: string;
  /** The invitation as sent, so the button below hands back the same event. */
  ics: string;
  copySent: boolean;
  /** A firm booking, versus a request the office still has to come back on. */
  confirmed: boolean;
}

type FieldName = "firstName" | "surname" | "email" | "phone";

const FIELD_LABELS: Record<FieldName, string> = {
  firstName: "First name",
  surname: "Surname",
  email: "Email address",
  phone: "Phone number",
};

/* ------------------------------------------------------------- validation */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(field: FieldName, value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return `${FIELD_LABELS[field]} is required.`;
  if (field === "email" && !EMAIL_RE.test(trimmed)) {
    return "Please enter a valid email address.";
  }
  if (field === "phone" && trimmed.replace(/\D/g, "").length < 9) {
    return "Please enter a contactable phone number.";
  }
  return null;
}

/* ---------------------------------------------------------- calendar links */

/** Hand the visitor the very same event that went into our diary. */
function downloadIcs(confirmation: Confirmation) {
  const blob = new Blob([confirmation.ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `tiny-homes-viewing-${confirmation.reference}.ics`;
  document.body.append(link);
  link.click();
  link.remove();
  // Revoked on the next tick: Safari has not finished with the URL synchronously.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** `20260812T063000Z`, the form Google's template URL expects. */
function googleStamp(day: DayKey, minutes: number): string {
  const [y, m, d] = day.split("-").map(Number);
  // Minutes are South African; Google wants UTC, and SAST is always +2.
  const utc = new Date(Date.UTC(y, m - 1, d, 0, minutes - 120));
  return `${utc.toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`;
}

function googleCalendarUrl(confirmation: Confirmation): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Showroom viewing — ${site.name}`,
    dates: `${googleStamp(confirmation.day, confirmation.minutes)}/${googleStamp(
      confirmation.day,
      confirmation.minutes + VIEWING_MINUTES,
    )}`,
    location: `${site.address.streetAddress}, ${site.address.locality}, ${site.address.city}`,
    details: `Your viewing at the ${site.name} showroom.\n\nReference: ${confirmation.reference}\nQuestions? Call ${site.phoneDisplay}.`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

const telHref = `tel:${site.phone.replace(/\s/g, "")}`;

/* ------------------------------------------------------------- the booker */

export function ViewingBooker() {
  const [slots, setSlots] = useState<SlotsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  /** Bumped to ask for a fresh grid, e.g. after losing a slot to someone else. */
  const [reloadToken, setReloadToken] = useState(0);

  const [pickedDay, setPickedDay] = useState<DayKey | null>(null);
  const [minutes, setMinutes] = useState<number | null>(null);

  const [values, setValues] = useState<Record<FieldName, string>>({
    firstName: "",
    surname: "",
    email: "",
    phone: "",
  });
  const [interest, setInterest] = useState("");
  const [partySize, setPartySize] = useState(2);
  const [notes, setNotes] = useState("");
  /** Honeypot: hidden from people, filled in by bots. */
  const [company, setCompany] = useState("");

  const [errors, setErrors] = useState<Partial<Record<FieldName, string | null>>>({});
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const detailsRef = useRef<HTMLDivElement>(null);

  // Reading the diary is a genuine external-system sync, so it belongs in an
  // effect. `cancelled` guards against a reload landing after unmount.
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch("/api/viewing/slots", { cache: "no-store" });
        const data = (await response.json()) as SlotsResponse;
        if (!cancelled) setSlots(data);
      } catch {
        if (!cancelled) {
          setSlots({ days: {}, available: false, verified: true, reason: "calendar-unreachable" });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const availableDays = useMemo(
    () => (slots ? Object.keys(slots.days).sort() : []),
    [slots],
  );

  // Derived rather than stored, so the first open day is selected without an
  // effect — and a day that vanishes from a refreshed grid falls back cleanly
  // instead of leaving the picker pointing at nothing.
  const day = pickedDay && availableDays.includes(pickedDay) ? pickedDay : (availableDays[0] ?? null);

  const daySlots = day ? (slots?.days[day] ?? []) : [];

  const chooseDay = (next: DayKey) => {
    setPickedDay(next);
    setMinutes(null);
    setSubmitError(null);
  };

  const chooseSlot = (next: number) => {
    setMinutes(next);
    setSubmitError(null);
    // Move them on without yanking the page: the form is directly below.
    requestAnimationFrame(() =>
      detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }),
    );
  };

  const setValue = (field: FieldName, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  /* -------- submit */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending || day === null || minutes === null) return;

    const nextErrors: Partial<Record<FieldName, string | null>> = {};
    for (const field of Object.keys(FIELD_LABELS) as FieldName[]) {
      nextErrors[field] = validate(field, values[field]);
    }
    setErrors(nextErrors);

    const firstBad = (Object.keys(FIELD_LABELS) as FieldName[]).find((f) => nextErrors[f]);
    if (firstBad) {
      document.getElementById(`viewing-${firstBad}`)?.focus();
      return;
    }

    setSending(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/viewing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, interest, partySize, notes, company, day, minutes }),
      });
      const data = (await response.json()) as {
        reference?: string;
        booked?: boolean;
        confirmed?: boolean;
        copySent?: boolean;
        ics?: string;
        error?: string;
        taken?: boolean;
      };

      if (response.ok && data.booked && data.reference) {
        setConfirmation({
          reference: data.reference,
          day,
          minutes,
          email: values.email.trim(),
          ics: data.ics ?? "",
          copySent: data.copySent === true,
          confirmed: data.confirmed === true,
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setSubmitError(
          data.error ?? "Something went wrong booking that slot. Please call or WhatsApp us.",
        );
        // Somebody else took it. Pull a fresh grid so the next pick is real.
        if (data.taken) {
          setMinutes(null);
          setLoading(true);
          setReloadToken((token) => token + 1);
        }
      }
    } catch {
      setSubmitError(
        "We could not reach the booking system. Please check your connection, or call us.",
      );
    } finally {
      setSending(false);
    }
  };

  /* ------------------------------------------------------------ confirmed */

  if (confirmation) {
    return (
      <div className="rounded-3xl border border-border bg-parchment p-6 sm:p-9">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-forest text-cream">
          <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
        </span>
        <h2 className="text-display mt-5 text-3xl text-ink sm:text-4xl">
          {confirmation.confirmed ? "You're booked in." : "Got it — we'll confirm shortly."}
        </h2>
        <p className="mt-3 text-lg leading-relaxed text-stone">
          {confirmation.confirmed
            ? "We'll see you at the showroom. Your slot is held in our diary — this is a confirmation, not a request."
            : "Your request is with us. We'll call or WhatsApp you to confirm this time, usually the same working day."}
        </p>

        <div className="mt-7 rounded-2xl border border-border bg-cream p-5 sm:p-6">
          <p className="text-eyebrow text-clay">
            {confirmation.confirmed ? "Your viewing" : "Your requested time"}
          </p>
          <p className="text-display mt-2 text-2xl text-ink sm:text-3xl">
            {formatDayLong(confirmation.day)}
          </p>
          <p className="text-display mt-1 text-2xl text-ink sm:text-3xl">
            {formatSlot(confirmation.minutes)} – {formatSlot(confirmation.minutes + VIEWING_MINUTES)}
          </p>
          <p className="mt-4 flex items-start gap-2.5 text-[0.9375rem] leading-relaxed text-stone">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-clay" aria-hidden="true" />
            <span>
              {site.address.streetAddress}, {site.address.locality}
              <br />
              {site.address.city}, {site.address.region}
            </span>
          </p>
          <p className="mt-4 text-sm text-stone">
            Reference <span className="font-medium text-ink">{confirmation.reference}</span>
          </p>
        </div>

        <p className="mt-6 text-[0.9375rem] leading-relaxed text-stone">
          {confirmation.copySent ? (
            <>
              {confirmation.confirmed ? "A confirmation" : "A copy of your request"} is on its way
              to <span className="font-medium text-ink">{confirmation.email}</span> with a calendar
              invitation attached.
            </>
          ) : (
            <>
              Your booking is confirmed, but we could not send the confirmation email. Add it to
              your calendar below, and call us if anything looks wrong.
            </>
          )}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          {confirmation.ics && (
            <Button type="button" variant="accent" size="lg" onClick={() => downloadIcs(confirmation)}>
              <CalendarPlus className="h-4 w-4" aria-hidden="true" />
              Add to my calendar
            </Button>
          )}
          <ButtonAnchor
            href={googleCalendarUrl(confirmation)}
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
            size="lg"
          >
            Google Calendar
          </ButtonAnchor>
          <ButtonAnchor
            href={showroomDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
            size="lg"
          >
            <MapPin className="h-4 w-4" aria-hidden="true" />
            Get directions
          </ButtonAnchor>
        </div>

        <p className="mt-7 border-t border-border pt-6 text-sm leading-relaxed text-stone">
          Need to move it? Call or WhatsApp{" "}
          <a
            href={telHref}
            className="font-medium text-clay-dark underline underline-offset-4 transition-colors hover:text-clay"
          >
            {site.phoneDisplay}
          </a>{" "}
          and we&apos;ll sort it out. No charge, no awkwardness.
        </p>
      </div>
    );
  }

  /* -------------------------------------------------------------- loading */

  if (loading) {
    return (
      <div className="rounded-3xl border border-border bg-parchment p-6 sm:p-9">
        <p className="flex items-center gap-3 text-stone">
          <Loader2 className="h-5 w-5 animate-spin text-clay" aria-hidden="true" />
          Checking which times are still open…
        </p>
        <div className="mt-6 space-y-3" aria-hidden="true">
          <div className="h-12 w-full animate-pulse rounded-xl bg-sand/70" />
          <div className="h-12 w-full animate-pulse rounded-xl bg-sand/50" />
        </div>
      </div>
    );
  }

  /* --------------------------------------------- nothing we can offer */

  if (!slots?.available || availableDays.length === 0) {
    const fullyBooked = slots?.reason === "fully-booked";
    return (
      <div className="rounded-3xl border border-border bg-parchment p-6 sm:p-9">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-clay/10 text-clay-dark">
          <AlertCircle className="h-5 w-5" aria-hidden="true" />
        </span>
        <h2 className="text-display mt-5 text-2xl text-ink sm:text-3xl">
          {fullyBooked ? "We're fully booked for the next few weeks" : "Let's book you in by phone"}
        </h2>
        <p className="mt-3 text-lg leading-relaxed text-stone">
          {fullyBooked
            ? "Every slot in the next four weeks is taken. Give us a call and we'll find you a time, including one further out."
            : "Our online diary isn't reachable right now, so we won't promise you a time we haven't checked. Call or WhatsApp us and we'll book you in properly, on the spot."}
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <ButtonAnchor href={telHref} variant="accent" size="lg">
            <Phone className="h-4 w-4" aria-hidden="true" />
            {site.phoneDisplay}
          </ButtonAnchor>
          <ButtonAnchor
            href={site.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
            size="lg"
          >
            WhatsApp us
          </ButtonAnchor>
        </div>
        <p className="mt-6 text-sm text-stone">Showroom hours: {HOURS_LABEL}.</p>
      </div>
    );
  }

  /* ---------------------------------------------------------- the picker */

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-border bg-parchment p-6 sm:p-9">
      {/* ---- step 1: the day */}
      {/* min-w-0 on every fieldset: browsers give <fieldset> a default
          `min-inline-size: min-content`, so the horizontally scrolling day row
          below refuses to shrink and drags the whole page wider than a phone
          screen instead of scrolling inside itself. */}
      <fieldset className="min-w-0">
        <legend className="text-display text-2xl text-ink sm:text-3xl">Pick a day</legend>
        <p className="mt-2 text-[0.9375rem] leading-relaxed text-stone">
          {HOURS_LABEL}.{" "}
          {slots.verified
            ? "These are the days we still have open — everything else is already taken."
            : "Pick a time that suits you and we'll confirm it with you."}
        </p>

        <div className="-mx-1 mt-5 flex snap-x gap-2.5 overflow-x-auto px-1 pb-2 sm:flex-wrap sm:overflow-visible">
          {availableDays.map((option) => {
            const selected = option === day;
            return (
              <button
                key={option}
                type="button"
                onClick={() => chooseDay(option)}
                aria-pressed={selected}
                className={cn(
                  "flex min-h-11 shrink-0 snap-start cursor-pointer flex-col items-start rounded-xl border px-4 py-2.5 text-left transition-all duration-200",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-clay/40",
                  selected
                    ? "border-clay bg-clay text-cream shadow-[var(--shadow-soft)]"
                    : "border-border bg-cream text-ink hover:border-clay/50",
                )}
              >
                <span className="text-[0.9375rem] font-medium">{formatDayShort(option)}</span>
                {/* The count is only meaningful when it came from the diary.
                    Unverified, every day would read "15 slots", which looks
                    like a claim about availability rather than a timetable. */}
                {slots.verified && (
                  <span className={cn("text-xs", selected ? "text-cream/75" : "text-stone")}>
                    {slots.days[option].length} {slots.days[option].length === 1 ? "slot" : "slots"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* ---- step 2: the time */}
      {/* The rule lives on the wrapper, not the fieldset: a <legend> is laid
          out inside its fieldset's top border, so a border there renders as a
          line struck through the heading. */}
      <div className="mt-9 border-t border-border pt-8">
      <fieldset className="min-w-0">
        <legend className="text-display text-2xl text-ink sm:text-3xl">Pick a time</legend>
        <p className="mt-2 text-[0.9375rem] leading-relaxed text-stone">
          {day ? formatDayLong(day) : "Choose a day first"} · {VIEWING_MINUTES} minutes, which is
          long enough to walk through two or three homes without rushing.
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2.5 sm:grid-cols-4">
          {daySlots.map((option) => {
            const selected = option === minutes;
            return (
              <button
                key={option}
                type="button"
                onClick={() => chooseSlot(option)}
                aria-pressed={selected}
                className={cn(
                  "nums-tabular min-h-11 cursor-pointer rounded-xl border px-2 py-2.5 text-[0.9375rem] font-medium transition-all duration-200",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-clay/40",
                  selected
                    ? "border-clay bg-clay text-cream shadow-[var(--shadow-soft)]"
                    : "border-border bg-cream text-ink hover:border-clay/50",
                )}
              >
                {formatSlot(option)}
              </button>
            );
          })}
        </div>
      </fieldset>
      </div>

      {/* ---- step 3: who's coming */}
      <div ref={detailsRef} className="mt-9 border-t border-border pt-8">
        <h3 className="text-display text-2xl text-ink sm:text-3xl">Your details</h3>
        <p className="mt-2 text-[0.9375rem] leading-relaxed text-stone" aria-live="polite">
          {day && minutes !== null ? (
            <>
              Booking{" "}
              <span className="font-medium text-ink">
                {formatDayLong(day)} at {formatSlot(minutes)}
              </span>
              {slots.verified
                ? ". Confirmed the moment you send this."
                : ". We'll come back to you to confirm it."}
            </>
          ) : (
            "Pick a time above, then tell us who to expect."
          )}
        </p>

        <div className="mt-6 grid gap-x-5 gap-y-1 sm:grid-cols-2">
          <TextField
            id="viewing-firstName"
            label={FIELD_LABELS.firstName}
            value={values.firstName}
            onValueChange={(v) => setValue("firstName", v)}
            onBlur={() => setErrors((p) => ({ ...p, firstName: validate("firstName", values.firstName) }))}
            error={errors.firstName}
            autoComplete="given-name"
            maxLength={80}
            required
          />
          <TextField
            id="viewing-surname"
            label={FIELD_LABELS.surname}
            value={values.surname}
            onValueChange={(v) => setValue("surname", v)}
            onBlur={() => setErrors((p) => ({ ...p, surname: validate("surname", values.surname) }))}
            error={errors.surname}
            autoComplete="family-name"
            maxLength={80}
            required
          />
          <TextField
            id="viewing-email"
            label={FIELD_LABELS.email}
            type="email"
            value={values.email}
            onValueChange={(v) => setValue("email", v)}
            onBlur={() => setErrors((p) => ({ ...p, email: validate("email", values.email) }))}
            error={errors.email}
            autoComplete="email"
            inputMode="email"
            maxLength={160}
            required
          />
          <TextField
            id="viewing-phone"
            label={FIELD_LABELS.phone}
            type="tel"
            value={values.phone}
            onValueChange={(v) => setValue("phone", v)}
            onBlur={() => setErrors((p) => ({ ...p, phone: validate("phone", values.phone) }))}
            error={errors.phone}
            autoComplete="tel"
            inputMode="tel"
            maxLength={40}
            required
          />

          <div>
            <label htmlFor="viewing-interest" className={labelClasses}>
              What would you like to see?
              <span className="font-normal text-stone"> (optional)</span>
            </label>
            <select
              id="viewing-interest"
              name="interest"
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              className={cn(inputClasses, "cursor-pointer")}
            >
              <option value="">Show me the range</option>
              {products.map((product) => (
                <option key={product.slug} value={product.slug}>
                  {product.name}
                </option>
              ))}
            </select>
            <p className="mt-1.5 min-h-0 text-sm" />
          </div>

          <div>
            <label htmlFor="viewing-party" className={labelClasses}>
              How many people?
            </label>
            <select
              id="viewing-party"
              name="partySize"
              value={partySize}
              onChange={(e) => setPartySize(Number(e.target.value))}
              className={cn(inputClasses, "cursor-pointer")}
            >
              {Array.from({ length: PARTY_MAX }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "person" : "people"}
                </option>
              ))}
            </select>
            <p className="mt-1.5 min-h-0 text-sm" />
          </div>
        </div>

        <div className="mt-2">
          <label htmlFor="viewing-notes" className={labelClasses}>
            Anything we should know?
            <span className="font-normal text-stone"> (optional)</span>
          </label>
          <textarea
            id="viewing-notes"
            name="notes"
            rows={3}
            maxLength={1000}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Where you're planning to put it, what you're weighing up, anything you want ready when you arrive."
            className={cn(inputClasses, "h-auto py-3")}
          />
        </div>

        {/* Honeypot. Off-screen rather than display:none, which some bots skip. */}
        <div aria-hidden="true" className="pointer-events-none absolute left-[-9999px] h-0 w-0 overflow-hidden">
          <label htmlFor="viewing-company">Company (leave blank)</label>
          <input
            id="viewing-company"
            name="company"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>

        {submitError && (
          <p
            role="alert"
            className="mt-6 flex items-start gap-2.5 rounded-xl border border-clay/40 bg-clay/5 p-4 text-[0.9375rem] leading-relaxed text-clay-dark"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {submitError}
          </p>
        )}

        <div className="mt-7 flex flex-wrap items-center gap-4">
          <Button
            type="submit"
            variant="accent"
            size="lg"
            disabled={sending || day === null || minutes === null}
            className={cn((sending || minutes === null) && "opacity-60")}
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Booking your slot…
              </>
            ) : (
              <>
                {slots.verified ? "Confirm my viewing" : "Request this viewing"}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </>
            )}
          </Button>
          <p className="flex items-center gap-2 text-sm text-stone">
            <Clock className="h-4 w-4 text-clay" aria-hidden="true" />
            {slots.verified
              ? "Confirmed instantly, not “we’ll get back to you”"
              : "We’ll confirm by phone or WhatsApp, usually same day"}
          </p>
        </div>

        <p className="mt-5 text-sm leading-relaxed text-stone">
          Would rather just phone?{" "}
          <a
            href={telHref}
            className="font-medium text-clay-dark underline underline-offset-4 transition-colors hover:text-clay"
          >
            {site.phoneDisplay}
          </a>{" "}
          gets you a person.
        </p>
      </div>
    </form>
  );
}
