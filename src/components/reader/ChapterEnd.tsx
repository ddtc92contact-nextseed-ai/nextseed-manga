import { Button } from "@/components/Button";
import { seriesLabels } from "@/lib/labels";

import type { ReaderData } from "./types";

/** End-of-chapter call to action: next chapter, or back to the series on the latest one. */
export function ChapterEnd({ series, chapter, next }: Pick<ReaderData, "series" | "chapter" | "next">) {
  const t = seriesLabels(series.language).reader;
  return (
    <section
      aria-labelledby="chapter-end-title"
      className="mx-auto flex max-w-xl flex-col items-center px-gutter text-center"
    >
      <p className="text-xs font-semibold uppercase tracking-kicker text-accent">
        {t.endOf(chapter.number)}
      </p>
      <h2 id="chapter-end-title" className="mt-3 font-display text-display-sm">
        {next ? t.upNext : t.caughtUp}
      </h2>
      <p className="mt-4 text-lg text-paper-muted">
        {next ? t.nextTitle(next.number, next.title) : t.latest(series.title)}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        {next ? (
          <>
            <Button href={next.href} size="lg">
              {seriesLabels(series.language).read(next.number)}
            </Button>
            <Button href={series.href} variant="ghost">
              {t.backToSeries}
            </Button>
          </>
        ) : (
          <Button href={series.href} size="lg">
            {t.backToSeries}
          </Button>
        )}
      </div>
    </section>
  );
}
