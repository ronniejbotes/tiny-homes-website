import { ArrowRight } from "lucide-react";
import type { BlogBlock } from "@/data/blog";
import { ButtonLink } from "@/components/ui/button";
import { RichText } from "@/components/blog/rich-text";

/**
 * Renders a post's typed blocks.
 *
 * One renderer for the whole blog, so typography, spacing and heading levels
 * are decided in a single place rather than per post. Headings are h2/h3 only:
 * the post's title is the page's h1, and a data model that cannot express an
 * h1 in the body cannot accidentally ship two of them.
 *
 * The measure is capped at ~68 characters (`max-w-[68ch]`) on prose but NOT on
 * tables, which need the room. Long-form reading is the whole point of these
 * pages; a full-width line of body copy at this size is genuinely harder to
 * read and is the most common way a blog built on a marketing design system
 * goes wrong.
 */
export function BlogBody({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "h2":
            return (
              <h2
                key={i}
                className="text-display max-w-[68ch] pt-8 text-3xl text-ink sm:text-4xl"
              >
                {block.text}
              </h2>
            );

          case "h3":
            return (
              <h3 key={i} className="max-w-[68ch] pt-4 font-display text-xl text-ink sm:text-2xl">
                {block.text}
              </h3>
            );

          case "p":
            return (
              <p key={i} className="max-w-[68ch] text-lg leading-relaxed text-stone">
                <RichText text={block.text} />
              </p>
            );

          case "ul":
            return (
              <ul key={i} className="max-w-[68ch] space-y-3 pl-1">
                {block.items.map((item, j) => (
                  <li key={j} className="flex gap-3 text-lg leading-relaxed text-stone">
                    <span
                      aria-hidden="true"
                      className="mt-[0.7rem] h-1.5 w-1.5 shrink-0 rounded-full bg-clay"
                    />
                    <span>
                      <RichText text={item} />
                    </span>
                  </li>
                ))}
              </ul>
            );

          case "ol":
            return (
              <ol key={i} className="max-w-[68ch] space-y-3 pl-1">
                {block.items.map((item, j) => (
                  <li key={j} className="flex gap-3 text-lg leading-relaxed text-stone">
                    <span
                      aria-hidden="true"
                      className="nums-tabular mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sand text-sm font-medium text-ink"
                    >
                      {j + 1}
                    </span>
                    <span>
                      <RichText text={item} />
                    </span>
                  </li>
                ))}
              </ol>
            );

          case "callout":
            return (
              <aside
                key={i}
                className="my-4 max-w-[68ch] rounded-3xl border border-border bg-parchment p-7"
              >
                <p className="font-display text-xl text-ink">{block.title}</p>
                <p className="mt-3 leading-relaxed text-stone">
                  <RichText text={block.text} />
                </p>
              </aside>
            );

          case "table":
            return (
              <div
                key={i}
                className="my-6 overflow-x-auto rounded-3xl border border-border bg-parchment"
              >
                <table className="w-full min-w-[42rem] border-collapse text-left">
                  <caption className="sr-only">{block.caption}</caption>
                  <thead>
                    <tr className="border-b border-border">
                      {block.head.map((cell, j) => (
                        <th
                          key={j}
                          scope="col"
                          className="px-5 py-4 text-sm font-medium text-stone"
                        >
                          {cell}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {block.rows.map((row, j) => (
                      <tr key={j} className="align-top">
                        {row.map((cell, k) =>
                          // First column is the row's label, so it is a row
                          // header: that is what lets a screen reader announce
                          // "X-Fold, From, R 54 900" instead of a bare figure.
                          k === 0 ? (
                            <th
                              key={k}
                              scope="row"
                              className="px-5 py-4 font-display text-base font-normal text-ink"
                            >
                              {cell}
                            </th>
                          ) : (
                            <td key={k} className="px-5 py-4 text-[0.9375rem] text-stone">
                              {cell}
                            </td>
                          ),
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          case "cta":
            return (
              <div
                key={i}
                className="my-6 max-w-[68ch] rounded-3xl border border-border bg-forest px-7 py-8 text-cream"
              >
                {/* RichText styles bold as text-ink and links as clay, both of
                    which are near-invisible on forest. Re-point them here so a
                    future author can use the same markup in a CTA safely. */}
                <p className="text-lg leading-relaxed text-cream/85 [&_a]:text-sage [&_a]:decoration-sage/40 [&_strong]:text-cream">
                  <RichText text={block.text} />
                </p>
                <ButtonLink href={block.href} variant="accent" className="mt-6">
                  {block.label}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </ButtonLink>
              </div>
            );
        }
      })}
    </div>
  );
}
