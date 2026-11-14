import { site } from "@/lib/site";

/**
 * The email enquiries the site offers.
 *
 * 1. Business and volume enquiries, owner-instructed 29 October 2026: "Our
 *    main target for tiny homes now is to deal with larger companies that will
 *    buy multiple units." Every "Business enquiry" button on the site goes to
 *    /contact#business, where this template is offered.
 * 2. Viewings are walk-in since 13 November 2026 (owner: "allow walk in visits
 *    from 9 am to 4 pm, no email necessary"), Monday to Friday at the
 *    Sunderland Ridge showroom. That replaced the 29 October rule that a
 *    viewing had to be asked for by email first. Every viewing link goes to
 *    /contact#viewing, which gives the times and the directions. The viewing
 *    email below is optional, for anyone who wants someone to walk them round.
 *
 * Both are plain mailto links to `site.email` with a subject and a body that
 * carries the questions, so nothing is collected by the site itself (the
 * privacy page's "the contact page collects nothing" stays true). The address
 * is always printed beside the button too, for anyone whose device has no
 * email app set up.
 */

/** Where a "Business enquiry" button goes. */
export const BUSINESS_ENQUIRY_HREF = "/contact#business";
/** Where a "how to view a unit" link goes: walk-in times and directions. */
export const VIEWING_HREF = "/contact#viewing";

/** The four things a business enquiry asks for, in the order the email lists them. */
export const BUSINESS_QUESTIONS = [
  "Your company name",
  "What the units will be used for",
  "Where they will go",
  "How many units you're looking at, and which range if you know",
] as const;

/** RFC 6068: line breaks in a mailto body are CRLF, percent-encoded. */
function mailto(subject: string, lines: string[]): string {
  return `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
    lines.join("\r\n"),
  )}`;
}

/** Prefilled business enquiry: subject plus a line to fill in per question. */
export const businessEnquiryMailto = mailto("Business enquiry", [
  "Company name:",
  "",
  "What the units will be used for:",
  "",
  "Where they will go (town and province):",
  "",
  "How many units:",
  "",
  "Which range, if you know:",
  "",
  "Your name and phone number:",
  "",
]);

/**
 * Optional email before a walk-in visit (viewings need no email since
 * 13 November 2026). For anyone who wants someone to walk them round.
 */
export const viewingMailto = mailto("Visiting the showroom", [
  "The day and time I'd like to come:",
  "",
  "What the units will be used for:",
  "",
  "How many units I'm looking at:",
  "",
  "My name and phone number:",
  "",
]);
