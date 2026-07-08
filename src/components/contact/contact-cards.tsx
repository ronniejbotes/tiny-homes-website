import { Phone, Mail, MapPin } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { site } from "@/lib/site";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

interface CardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
  href?: string;
  external?: boolean;
  delay?: number;
}

function ContactCard({ icon, label, value, detail, href, external, delay = 0 }: CardProps) {
  const body = (
    <>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest text-cream">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="text-eyebrow block text-clay">{label}</span>
        <span className="mt-1.5 block break-words text-lg font-medium text-ink">{value}</span>
        <span className="mt-1 block text-sm leading-relaxed text-stone">{detail}</span>
      </span>
    </>
  );

  const cardClasses =
    "flex items-start gap-4 rounded-2xl border border-border bg-parchment/60 p-5 sm:p-6";

  return (
    <Reveal delay={delay}>
      {href ? (
        <a
          href={href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className={`${cardClasses} transition-colors duration-200 hover:border-clay/50 hover:bg-parchment`}
        >
          {body}
        </a>
      ) : (
        <div className={cardClasses}>{body}</div>
      )}
    </Reveal>
  );
}

/** The four ways to reach Tiny Homes SA, as stacked cards. */
export function ContactCards() {
  return (
    <div className="space-y-4">
      <ContactCard
        icon={<Phone className="h-5 w-5" aria-hidden="true" />}
        label="Phone"
        value={site.phoneDisplay}
        detail="Ask for a quote, a delivery estimate or advice on your site."
        href={`tel:${site.phone.replace(/\s/g, "")}`}
      />
      <ContactCard
        icon={<WhatsAppIcon className="h-5 w-5" />}
        label="WhatsApp"
        value="Chat with our team"
        detail="The fastest way to reach us — send photos of your site and get answers quickly."
        href={site.whatsapp}
        external
        delay={0.08}
      />
      <ContactCard
        icon={<Mail className="h-5 w-5" aria-hidden="true" />}
        label="Email"
        value={site.email}
        detail="Best for detailed briefs, plans and documents."
        href={`mailto:${site.email}`}
        delay={0.16}
      />
      <ContactCard
        icon={<MapPin className="h-5 w-5" aria-hidden="true" />}
        label="Our base"
        value="Raslouw, Centurion, Gauteng"
        detail="Based in Raslouw, Centurion — we deliver nationwide."
        delay={0.24}
      />
      <Reveal delay={0.3}>
        <p className="px-1 pt-1 text-sm text-stone">
          Call or WhatsApp us — the fastest way to reach the team.
        </p>
      </Reveal>
    </div>
  );
}
