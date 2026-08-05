/**
 * SMTP transport for transactional site mail: instant-quote copies and
 * showroom-viewing confirmations.
 *
 * Server-only; never import this from a "use client" module.
 *
 * Why SMTP and not a mail API: the business already owns
 * admin@tinyhomesa.com on Hostinger's Business Email plan, which the site is
 * deployed alongside. Sending as that mailbox means SPF/DKIM already pass with
 * no new DNS records and no third-party account. See docs/EMAIL-MIGRATION.md
 * §"Client configuration" for the host/port table.
 *
 * The one limit that matters: Hostinger's plan caps a mailbox at **100 sends
 * per 24 hours**. Both flows cost two sends apiece (the customer's copy and
 * the office's), so the ceiling is roughly 50 quotes and viewings a day
 * combined. It is comfortably clear today, but it is the number to watch as
 * volume grows; the fix is a dedicated sending mailbox or a relay, not a code
 * change here.
 */

import nodemailer, { type Transporter } from "nodemailer";

const DEFAULT_HOST = "smtp.hostinger.com";
const DEFAULT_PORT = 465;

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
  /** Set to the customer's address so a reply in the mail client reaches them. */
  replyTo?: string;
  /**
   * A calendar invitation to travel with the message.
   *
   * Sent two ways at once, because mail clients disagree about which they
   * honour. As a `text/calendar; method=REQUEST` alternative part it is what
   * makes Apple Mail show its "Add to Calendar" banner and Gmail show RSVP
   * buttons; as a plain `.ics` attachment it stays openable in the clients
   * that ignore the alternative part, and on a phone a tap hands it straight
   * to Apple Calendar. Nodemailer's `icalEvent` does the first, `attachments`
   * the second.
   */
  calendar?: {
    filename: string;
    content: string;
    method: "REQUEST" | "PUBLISH" | "CANCEL";
  };
}

/** Credentials are only present in the deployed environment / .env.local. */
export function isMailConfigured(): boolean {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

/** Where quote notifications land. */
export function notifyAddress(): string {
  return process.env.QUOTE_NOTIFY_EMAIL || "admin@tinyhomesa.com";
}

// Reused across requests: nodemailer pools the connection, and rebuilding the
// transport per request would re-handshake TLS on every submission.
let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) return transporter;

  const port = Number(process.env.SMTP_PORT) || DEFAULT_PORT;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || DEFAULT_HOST,
    port,
    // 465 is implicit TLS; 587 upgrades via STARTTLS. Plain-text ports are
    // never used: EMAIL-MIGRATION.md §4 is explicit about that.
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER as string,
      pass: process.env.SMTP_PASS as string,
    },
    pool: true,
    maxConnections: 1,
    // A hung SMTP dialogue must not hold the request open, the customer's
    // quote does not depend on this send completing.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  return transporter;
}

/**
 * Send a message. Throws on failure, callers decide whether that is fatal.
 *
 * `from` must stay the authenticated mailbox: putting the customer's address
 * there would fail SPF/DKIM and land the notification in spam. The customer
 * goes in Reply-To instead.
 */
export async function sendMail(message: MailMessage): Promise<void> {
  if (!isMailConfigured()) {
    throw new Error("SMTP is not configured (SMTP_USER / SMTP_PASS are unset)");
  }

  const user = process.env.SMTP_USER as string;
  await getTransporter().sendMail({
    from: process.env.SMTP_FROM || `"Tiny Homes SA website" <${user}>`,
    to: message.to,
    replyTo: message.replyTo,
    subject: message.subject,
    text: message.text,
    html: message.html,
    ...(message.calendar
      ? {
          icalEvent: {
            filename: message.calendar.filename,
            method: message.calendar.method,
            content: message.calendar.content,
          },
          attachments: [
            {
              filename: message.calendar.filename,
              content: message.calendar.content,
              contentType: "text/calendar; charset=utf-8",
            },
          ],
        }
      : {}),
  });
}
