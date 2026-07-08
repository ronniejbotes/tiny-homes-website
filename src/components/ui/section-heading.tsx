import { cn } from "@/lib/cn";
import { Reveal } from "@/components/ui/reveal";

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  className,
  dark = false,
  id,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  align?: "left" | "center";
  className?: string;
  dark?: boolean;
  id?: string;
}) {
  return (
    <Reveal
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <p className={cn("text-eyebrow mb-4", dark ? "text-sage" : "text-clay-dark")}>{eyebrow}</p>
      )}
      <h2
        id={id}
        className={cn(
          "text-display text-4xl sm:text-5xl lg:text-6xl",
          dark ? "text-cream" : "text-ink",
        )}
      >
        {title}
      </h2>
      {intro && (
        <p className={cn("mt-5 text-lg leading-relaxed", dark ? "text-cream/75" : "text-stone")}>
          {intro}
        </p>
      )}
    </Reveal>
  );
}
