import { ArrowRight } from "lucide-react";
import type { BlogBlock } from "@/data/blog";
import { ButtonLink } from "@/components/ui/button";
import { PhoneLabel } from "@/components/ui/phone-label";
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
              // Phones first: under `sm` each row is a card, its first cell
              // the title and every other cell under its column heading
              // (PhoneLabel), so no column is cut off at the screen edge
              // (15 October 2026 mobile review). From `sm` up it is the full
              // table, scrolling sideways when it is wider than the column.
              <div
                key={i}
                className="my-6 rounded-3xl border border-border bg-parchment sm:overflow-x-auto"
              >
                <table className="block w-full border-collapse text-left sm:table sm:min-w-[42rem]">
                  <caption className="sr-only">{block.caption}</caption>
                  <thead className="sr-only sm:not-sr-only sm:table-header-group">
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
                  <tbody className="block divide-y divide-border sm:table-row-group">
                    {block.rows.map((row, j) => (
                      <tr key={j} className="block px-5 py-4 align-top sm:table-row sm:p-0">
                        {row.map((cell, k) =>
                          // First column is the row's label, so it is a row
                          // header: that is what lets a screen reader announce
                          // "X-Fold, From, R 54 900" instead of a bare figure.
                          k === 0 ? (
                            <th
                              key={k}
                              scope="row"
                              className="block font-display text-base font-normal text-ink sm:table-cell sm:px-5 sm:py-4"
                            >
                              {cell}
                            </th>
                          ) : (
                            <td
                              key={k}
                              className="mt-2.5 block text-[0.9375rem] text-stone sm:mt-0 sm:table-cell sm:px-5 sm:py-4"
                            >
                              {block.head[k] ? <PhoneLabel>{block.head[k]}</PhoneLabel> : null}
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
