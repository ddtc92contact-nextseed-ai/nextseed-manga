import { Button } from "@/components/Button";

import type { ReaderData } from "./types";

/** End-of-chapter call to action: next chapter, or back to the series on the latest one. */
export function ChapterEnd({ series, chapter, next }: Pick<ReaderData, "series" | "chapter" | "next">) {
  return (
    <section
      aria-labelledby="chapter-end-title"
      className="mx-auto flex max-w-xl flex-col items-center px-gutter text-center"
    >
      <p className="text-xs font-semibold uppercase tracking-kicker text-accent">
        End of chapter {chapter.number}
      </p>
      <h2 id="chapter-end-title" className="mt-3 font-display text-display-sm">
        {next ? "Up next" : "All caught up"}
      </h2>
      <p className="mt-4 text-lg text-paper-muted">
        {next
          ? `Chapter ${next.number}: ${next.title}`
          : `That was the latest chapter of ${series.title}.`}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        {next ? (
          <>
            <Button href={next.href} size="lg">
              Read chapter {next.number}
            </Button>
            <Button href={series.href} variant="ghost">
              Back to series
            </Button>
          </>
        ) : (
          <Button href={series.href} size="lg">
            Back to series
          </Button>
        )}
      </div>
    </section>
  );
}
