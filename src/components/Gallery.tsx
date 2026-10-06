import Link from "next/link";

import { getCreations, getTags } from "@/lib/content";

import { CreationCard } from "./CreationCard";
import { Section } from "./Section";

type GalleryProps = {
  /** Only show creations with this tag; `undefined` shows everything. */
  tag?: string;
};

const chip =
  "inline-flex min-h-11 items-center gap-2 border-2 px-4 text-sm font-semibold uppercase tracking-wider transition-colors";

/** Tag filter + masonry grid of every artwork and series cover. */
export function Gallery({ tag }: GalleryProps) {
  const creations = getCreations().filter((c) => !tag || c.tags.includes(tag));
  const tags = getTags();
  const filters = [{ tag: undefined, count: getCreations().length }, ...tags];

  return (
    <Section
      kicker={tag ? "Gallery · filtered" : "The archive"}
      title={tag ? `#${tag}` : "Gallery"}
      intro={
        tag
          ? `${creations.length} creation${creations.length === 1 ? "" : "s"} tagged “${tag}”.`
          : "Every standalone artwork and manga series, newest first."
      }
      id="gallery"
      headingLevel="h1"
    >
      <nav aria-label="Filter by tag" className="mb-10 md:mb-14">
        <ul className="flex flex-wrap gap-2 sm:gap-3">
          {filters.map((filter) => {
            const active = filter.tag === tag;
            return (
              <li key={filter.tag ?? "all"}>
                <Link
                  href={filter.tag ? `/gallery/tags/${filter.tag}` : "/gallery"}
                  aria-current={active ? "page" : undefined}
                  className={`${chip} ${
                    active
                      ? "border-accent bg-accent text-ink-950"
                      : "border-ink-600 text-paper-muted hover:border-paper hover:text-paper"
                  }`}
                >
                  {filter.tag ? `#${filter.tag}` : "All"}
                  <span className={active ? "text-ink-900" : "text-paper-faint"}>{filter.count}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <h2 className="sr-only">Creations</h2>
      <ul className="columns-2 gap-4 sm:gap-6 md:columns-3 lg:gap-8 xl:columns-4">
        {creations.map((creation, i) => (
          <li key={creation.href} className="mb-8 break-inside-avoid lg:mb-12">
            <CreationCard
              creation={creation}
              naturalRatio
              preload={i < 2}
              sizes="(min-width: 1408px) 320px, (min-width: 1280px) 23vw, (min-width: 768px) 31vw, 46vw"
            />
          </li>
        ))}
      </ul>
    </Section>
  );
}
