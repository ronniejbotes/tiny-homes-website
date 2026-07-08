import { ArrowRight, Plus, Sparkles } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";

/* Chip labels mirror the standard customisation options in products.ts. */
const optionChips = [
  "Wet room unit",
  "Kitchen unit",
  "Premium insulation",
  "Upgraded flooring",
  "Timber wall cladding",
  "Overhead cupboards",
];

export function CustomiseTeaser() {
  return (
    <section aria-label="Customise your home" className="bg-forest bg-grain text-cream">
      <Container className="py-24 sm:py-32">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <p className="text-eyebrow text-sage">Online configurator</p>
            <h2 className="text-display mt-4 text-4xl text-cream sm:text-5xl lg:text-6xl">
              Design it your way
            </h2>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-cream/75">
              Every home in the range can be customised online. Choose your finishes,
              add a wet room or fitted kitchen, see the space furnished — and watch the
              price update live as you build your spec.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <ButtonLink href="/folding-homes#configure" variant="accent" size="lg">
                Start configuring
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="#homes" variant="outline-dark" size="lg">
                Browse the range
              </ButtonLink>
            </div>
          </Reveal>

          <div>
            <Reveal delay={0.1} className="mx-auto max-w-md lg:max-w-none">
              <HouseCutaway className="w-full text-sage" />
            </Reveal>
            <Stagger className="mt-8 flex flex-wrap justify-center gap-3">
              {optionChips.map((chip) => (
                <StaggerItem key={chip}>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-cream/20 px-4 py-2 text-sm text-cream/85">
                    <Plus className="h-3.5 w-3.5 text-sage" aria-hidden="true" />
                    {chip}
                  </span>
                </StaggerItem>
              ))}
              <StaggerItem>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-clay px-4 py-2 text-sm font-medium text-cream">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  Live price as you build
                </span>
              </StaggerItem>
            </Stagger>
          </div>
        </div>
      </Container>
    </section>
  );
}

/** Decorative line-art cutaway of a tiny home interior. */
function HouseCutaway({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 340 230"
      fill="none"
      className={className}
      aria-hidden="true"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Roof */}
      <path d="M22 100 L170 24 L318 100" />
      {/* Walls, open on top to read as a cutaway */}
      <path d="M44 100 V206 H296 V100" />
      {/* Floor */}
      <path d="M30 206 H310" />
      {/* Round gable window */}
      <circle cx="170" cy="72" r="14" />
      {/* Interior partition */}
      <path d="M186 118 V206" strokeDasharray="5 7" />
      {/* Bed */}
      <rect x="62" y="166" width="76" height="40" rx="6" />
      <path d="M62 182 H138" />
      <rect x="70" y="172" width="22" height="8" rx="3" />
      {/* Kitchen counter with sink and overhead cupboard */}
      <rect x="204" y="160" width="74" height="46" rx="6" />
      <circle cx="240" cy="176" r="7" />
      <rect x="204" y="122" width="74" height="20" rx="5" />
      {/* Doorway */}
      <path d="M154 206 V150 a14 14 0 0 1 14 -14" />
    </svg>
  );
}
