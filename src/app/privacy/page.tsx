/**
 * General-purpose POPIA privacy policy describing how this site actually
 * behaves today (mailto/WhatsApp hand-off, GA4, self-hosted media). It is not
 * legal advice; have a legal professional review it before relying on it, and
 * update it whenever the data practices described here change.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { site } from "@/lib/site";
import images from "@/data/images.json";

const privacyDescription =
  "How Tiny Homes SA collects, uses and protects your personal information under POPIA: what our enquiry and quote forms collect, who it's shared with, how long we keep it and your rights.";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: privacyDescription,
  alternates: { canonical: "/privacy" },
  openGraph: {
    type: "website",
    locale: "en_ZA",
    siteName: site.name,
    title: "Privacy Policy | Tiny Homes SA",
    description: privacyDescription,
    url: `${site.url}/privacy`,
    images: [
      {
        url: images.products["nature-cabins"][0].src,
        width: images.products["nature-cabins"][0].width,
        height: images.products["nature-cabins"][0].height,
        alt: images.products["nature-cabins"][0].alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | Tiny Homes SA",
    description: privacyDescription,
    images: [images.products["nature-cabins"][0].src],
  },
};

/* This policy carries far more inline links than the terms page, so the shared
   link treatment lives in a constant rather than being repeated a dozen times. */
const linkClasses =
  "font-medium text-clay-dark underline underline-offset-4 transition-colors hover:text-clay";

/** One numbered policy section. */
function Clause({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`clause-${n}`} className="border-t border-border pt-10">
      <div className="flex items-baseline gap-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-parchment text-sm font-semibold text-clay-dark">
          {n}
        </span>
        <h2 id={`clause-${n}`} className="text-display text-2xl text-ink sm:text-3xl">
          {title}
        </h2>
      </div>
      <div className="mt-5 space-y-4 leading-relaxed text-stone sm:pl-12">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  const telHref = `tel:${site.phone.replace(/\s/g, "")}`;

  return (
    <div className="py-20 sm:py-28">
      <Container className="max-w-3xl">
        <p className="text-eyebrow text-clay">Your information, plainly explained</p>
        <h1 className="text-display mt-4 text-4xl text-ink sm:text-5xl">Privacy Policy</h1>
        <p className="mt-6 text-lg leading-relaxed text-stone">
          This policy explains what personal information Tiny Homes SA collects, why we need it,
          who it reaches and what you can ask us to do with it. The short version: this website
          keeps no database of visitors. Everything you type into a form stays in your browser
          until you press send, and then it travels to us by WhatsApp or email, the same way a
          message from your phone would.
        </p>
        <p className="mt-4 text-sm text-stone">Last updated: 26 July 2026</p>

        <div className="mt-14 space-y-12">
          <Clause n={1} title="Who we are">
            <p>
              Tiny Homes SA is the trading name of {site.legalName}. For the purposes of the
              Protection of Personal Information Act 4 of 2013 (POPIA), we are the{" "}
              <strong className="font-semibold text-ink">responsible party</strong> for the personal
              information described in this policy: we decide why and how it is processed.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                {site.address.streetAddress}, {site.address.locality}, {site.address.city},{" "}
                {site.address.region}, {site.address.country}
              </li>
              <li>
                Phone:{" "}
                <a href={telHref} className={linkClasses}>
                  {site.phoneDisplay}
                </a>{" "}
                ({site.phone})
              </li>
              <li>
                Email:{" "}
                <a href={`mailto:${site.email}`} className={linkClasses}>
                  {site.email}
                </a>
              </li>
              <li>
                WhatsApp:{" "}
                <a href={site.whatsapp} className={linkClasses}>
                  {site.phoneDisplay}
                </a>
              </li>
            </ul>
            <p>
              Under POPIA the head of a private body is automatically its Information Officer.
              Anything raised under this policy, whether a request, a correction or a complaint, should be
              emailed to the address above and marked for the attention of the Information Officer.
            </p>
          </Clause>

          <Clause n={2} title="What personal information we collect">
            <p>
              Only what you choose to give us, plus a small amount of technical information that
              every website receives.
            </p>
            <p>
              <strong className="font-semibold text-ink">Our enquiry form</strong> (on the{" "}
              <Link href="/contact" className={linkClasses}>
                contact page
              </Link>
              ) asks for your full name and email address, and optionally your phone number, which
              home interests you and a message.
            </p>
            <p>
              <strong className="font-semibold text-ink">Our quote form</strong> (on the{" "}
              <Link href="/quote" className={linkClasses}>
                quote page
              </Link>
              ) asks for your full name, email address and phone number, and the delivery address
              for your unit: street, suburb, city, province and postal code. We need the address
              to price transport and to check that a truck can reach the spot. It also carries the
              units, sizes, extras and quantities you configured, and any notes you add.
            </p>
            <p>
              <strong className="font-semibold text-ink">If you contact us directly</strong>, by
              phone, WhatsApp, email or social media, we receive whatever you send us in that
              message, including your phone number or WhatsApp profile name.
            </p>
            <p>
              <strong className="font-semibold text-ink">Automatically</strong>, our hosting
              provider keeps ordinary web-server logs (IP address, browser and device type, the
              pages requested and when), and we use analytics as described in section 8.
            </p>
            <p>
              We do not ask for ID numbers, banking details or any of POPIA&apos;s special personal
              information on this website, and we do not knowingly collect information from
              children. If you apply for finance or lay-bye, that application is handled by the
              finance provider under its own terms; it does not run through this site.
            </p>
          </Clause>

          <Clause n={3} title="How your information reaches us: nothing is stored on this website">
            <p>
              This is worth spelling out, because it is unusual. Neither form posts anything to a
              server or database that we control. There is no account, no login, and no saved
              submission on tinyhomesa.com.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                When you press send, your browser opens WhatsApp with the message already written
                out, addressed to our business number. Nothing is delivered until{" "}
                <em>you</em>{" "}
                press send inside WhatsApp, and at that point the message travels
                through WhatsApp&apos;s servers, like any other WhatsApp message.
              </li>
              <li>
                If you use the email link instead, your browser opens your own email program with
                the same message pre-filled and addressed to us. Your email provider sends it.
              </li>
              <li>
                Until you send it, what you have typed exists only in your browser tab. Close the
                tab and it is gone; we never see it.
              </li>
            </ul>
            <p>
              Once your enquiry arrives, it lives in our WhatsApp Business account and our email
              mailbox. That is the record we work from, and it is what sections 6 to 11 below are
              about.
            </p>
          </Clause>

          <Clause n={4} title="Why we collect it, and on what lawful basis">
            <p>We use your personal information to:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>reply to your enquiry and answer your questions;</li>
              <li>prepare and send you a formal quotation;</li>
              <li>
                price delivery to your site, confirm access, and arrange transport and installation
                if you order;
              </li>
              <li>keep a record of what was quoted, agreed, delivered and invoiced; and</li>
              <li>meet our legal, tax and accounting obligations.</li>
            </ul>
            <p>
              Our lawful bases under section 11 of POPIA are your consent (you choose to send us
              the message), the necessity of processing to conclude or carry out a contract with
              you, our legitimate interest in responding to people who ask us for a quote, and
              compliance with the law.
            </p>
            <p>
              We do not sell, rent or trade personal information, we do not use it for automated
              decision-making or profiling, and we do not add quote requests to a marketing list.
              If we ever start sending marketing, it will be something you opt into and can opt out
              of at any time.
            </p>
          </Clause>

          <Clause n={5} title="Giving us your information is voluntary">
            <p>
              You are under no legal obligation to give us anything. Practically, though, we cannot
              reply without a name and a way to reach you, and we cannot quote delivery without an
              address, so leaving those out simply means we will have to come back and ask. Fields
              marked optional are genuinely optional.
            </p>
            <p>
              If you would rather not use a form at all, phone us on{" "}
              <a href={telHref} className={linkClasses}>
                {site.phoneDisplay}
              </a>{" "}
              and tell us only what you are comfortable sharing.
            </p>
          </Clause>

          <Clause n={6} title="Who your information is shared with">
            <p>
              We keep the circle as small as the job allows. Depending on how you contact us and
              whether you order, your information may be handled by:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="font-semibold text-ink">Meta Platforms (WhatsApp)</strong>:
                carries and stores any enquiry you send us over WhatsApp, under its own privacy
                terms;
              </li>
              <li>
                <strong className="font-semibold text-ink">email providers</strong>: yours and
                ours, which transmit and store emailed enquiries;
              </li>
              <li>
                <strong className="font-semibold text-ink">Google</strong>: usage statistics
                only, as described in section 8;
              </li>
              <li>
                <strong className="font-semibold text-ink">our hosting provider</strong>: which
                serves the site and keeps standard server logs;
              </li>
              <li>
                <strong className="font-semibold text-ink">
                  transport, crane and installation contractors
                </strong>{" "}
                who receive your delivery address and a contact number, and only once you have ordered;
              </li>
              <li>
                <strong className="font-semibold text-ink">finance providers</strong>: only if you
                ask us to refer you, and only with what you agree to share;
              </li>
              <li>
                <strong className="font-semibold text-ink">
                  our accountants, auditors or attorneys
                </strong>
                , and any authority we are legally required to give information to (SARS, a court,
                or the Information Regulator).
              </li>
            </ul>
            <p>
              Where a third party handles personal information on our behalf, POPIA treats it as an
              operator and requires it to keep that information confidential and secure.
            </p>
          </Clause>

          <Clause n={7} title="Information sent outside South Africa">
            <p>
              WhatsApp, Google and the email and hosting services we rely on are operated by
              international companies with servers outside South Africa, including in the European
              Union and the United States. Sending us an enquiry through those channels therefore
              involves a transfer of your personal information across the border, as contemplated
              by section 72 of POPIA.
            </p>
            <p>
              We rely on your consent when you choose to use WhatsApp or email, and on the fact
              that these providers are bound by data-protection laws and contractual transfer terms
              that give protection substantially similar to POPIA. If you would prefer your
              information not to leave South Africa, phone us instead of using the forms.
            </p>
          </Clause>

          <Clause n={8} title="Cookies, analytics and content loaded from elsewhere">
            <p>
              We use <strong className="font-semibold text-ink">Google Analytics 4</strong> to
              understand how the site is used: how many people visit, which homes they look at,
              roughly where they are and which pages need work. It sets cookies in your browser and
              sends Google your IP address (which Google shortens before storing), your device and
              browser details, and the pages you view. We look at it in aggregate; we do not use it
              to identify individual visitors, and we have not enabled Google&apos;s advertising or
              remarketing features.
            </p>
            <p>
              You can opt out at any time by blocking or deleting cookies in your browser settings,
              by browsing in private mode with tracking protection on, or by installing Google&apos;s{" "}
              <a
                href="https://tools.google.com/dlpage/gaoptout"
                className={linkClasses}
                rel="noopener noreferrer"
                target="_blank"
              >
                Analytics opt-out browser add-on
              </a>
              . Blocking analytics does not affect how this site works.
            </p>
            <p>
              Everything else on the site is served from our own domain. The videos are our own
              files played by your browser; there is no YouTube or Vimeo player, so watching one
              does not hand you over to a third party. The interactive 3D viewer runs entirely in
              your browser using assets hosted here, and our fonts are bundled into the site at
              build time rather than fetched from Google as you browse.
            </p>
            <p>
              Apart from analytics, this site sets no cookies of its own: no advertising pixels, no
              cross-site tracking, no profiling. The floating WhatsApp button and the social links
              in the footer are ordinary links; they only pass your details to those services once
              you click them.
            </p>
          </Clause>

          <Clause n={9} title="How long we keep your information">
            <p>
              We keep enquiries and quote requests in WhatsApp and email for as long as we are
              dealing with you and for a reasonable period afterwards, in case you come back to us,
              generally no more than three years after our last contact, unless you ask us to
              delete it sooner or the law requires us to keep it longer.
            </p>
            <p>
              If you buy a unit, we keep the order, delivery and invoice records for as long as
              South African tax and company law requires: currently five years from the end of the
              relevant tax period. Analytics data is retained by Google for the period configured
              on our property (a maximum of 14 months at event level), and server logs are kept by
              our host for short operational periods. When information is no longer needed, we
              delete it.
            </p>
          </Clause>

          <Clause n={10} title="How we protect your information">
            <p>
              The strongest protection here is structural: this website holds no customer database,
              so there is nothing on it to breach. Beyond that, the site is served over HTTPS,
              access to our WhatsApp and email accounts is limited to the people who need it, and
              those accounts are protected with strong passwords and two-factor authentication
              where the provider supports it.
            </p>
            <p>
              No method of transmitting or storing information is completely secure, and we cannot
              guarantee absolute security. If a compromise affecting your personal information does
              occur, section 22 of POPIA requires us to notify you and the Information Regulator as
              soon as reasonably possible, and we will.
            </p>
          </Clause>

          <Clause n={11} title="Your rights under POPIA">
            <p>As a data subject you have the right to:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="font-semibold text-ink">access</strong>: ask whether we hold
                personal information about you and be given a record of it (section 23; we may
                charge the prescribed fee for a copy);
              </li>
              <li>
                <strong className="font-semibold text-ink">correction or deletion</strong>: ask us
                to correct or delete information that is inaccurate, irrelevant, excessive, out of
                date, incomplete, misleading or unlawfully obtained, and to destroy a record we are
                no longer authorised to keep (section 24);
              </li>
              <li>
                <strong className="font-semibold text-ink">object</strong>: object, on reasonable
                grounds, to us processing your information (section 11(3));
              </li>
              <li>
                <strong className="font-semibold text-ink">withdraw consent</strong>: at any time,
                without affecting processing that was lawful before you withdrew it (section
                11(2)(b));
              </li>
              <li>
                <strong className="font-semibold text-ink">refuse direct marketing</strong>: and to
                opt out of any electronic marketing we send (section 69).
              </li>
            </ul>
            <p>
              To exercise any of these, email{" "}
              <a href={`mailto:${site.email}`} className={linkClasses}>
                {site.email}
              </a>{" "}
              or call{" "}
              <a href={telHref} className={linkClasses}>
                {site.phoneDisplay}
              </a>
              . Tell us what you would like us to do and enough for us to find your enquiry. We
              will respond as soon as reasonably possible, and normally within 30 days. The
              Information Regulator publishes formal request forms if you would like to use them,
              but a plain email is enough for us.
            </p>
            <p>
              One practical limit worth knowing: a message you sent us on WhatsApp also exists in
              your own chat history and in Meta&apos;s systems. Deleting our copy does not delete
              theirs. For that you would need to use WhatsApp&apos;s own tools and Meta&apos;s
              privacy terms.
            </p>
          </Clause>

          <Clause n={12} title="Complaining to the Information Regulator">
            <p>
              If you are unhappy with how we have handled your personal information, please tell us
              first; we would far rather fix it. You are also entitled, at any time, to lodge a
              complaint with the Information Regulator (South Africa):
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Woodmead North Office Park, 54 Maxwell Drive, Woodmead, Johannesburg, 2191 (postal:
                P.O. Box 31533, Braamfontein, Johannesburg, 2017)
              </li>
              <li>
                Telephone:{" "}
                <a href="tel:+27100235200" className={linkClasses}>
                  010 023 5200
                </a>{" "}
                · Toll-free:{" "}
                <a href="tel:+27800017160" className={linkClasses}>
                  0800 017 160
                </a>
              </li>
              <li>
                POPIA complaints:{" "}
                <a href="mailto:POPIAComplaints@inforegulator.org.za" className={linkClasses}>
                  POPIAComplaints@inforegulator.org.za
                </a>
              </li>
              <li>
                General enquiries:{" "}
                <a href="mailto:enquiries@inforegulator.org.za" className={linkClasses}>
                  enquiries@inforegulator.org.za
                </a>
              </li>
              <li>
                Website:{" "}
                <a
                  href="https://inforegulator.org.za"
                  className={linkClasses}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  inforegulator.org.za
                </a>
              </li>
            </ul>
          </Clause>

          <Clause n={13} title="Changes to this policy">
            <p>
              We will update this policy whenever our practices change, for example if we add a
              form that stores submissions, or start using a new service. The date at the top of
              the page always reflects the current version, and we will flag anything material
              here rather than changing it quietly.
            </p>
            <p>
              Questions about this policy, or about our{" "}
              <Link href="/terms" className={linkClasses}>
                terms and conditions
              </Link>
              ? Email{" "}
              <a href={`mailto:${site.email}`} className={linkClasses}>
                {site.email}
              </a>{" "}
              or{" "}
              <Link href="/contact" className={linkClasses}>
                get in touch
              </Link>
              . A real person reads it.
            </p>
          </Clause>
        </div>
      </Container>
    </div>
  );
}
