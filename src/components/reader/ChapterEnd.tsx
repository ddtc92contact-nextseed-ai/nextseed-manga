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
        Fin du chapitre {chapter.number}
      </p>
      <h2 id="chapter-end-title" className="mt-3 font-display text-display-sm">
        {next ? "À suivre" : "Vous êtes à jour"}
      </h2>
      <p className="mt-4 text-lg text-paper-muted">
        {next
          ? `Chapitre ${next.number}\u00a0: ${next.title}`
          : `C’était le dernier chapitre paru de ${series.title}.`}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        {next ? (
          <>
            <Button href={next.href} size="lg">
              Lire le chapitre {next.number}
            </Button>
            <Button href={series.href} variant="ghost">
              Retour à la série
            </Button>
          </>
        ) : (
          <Button href={series.href} size="lg">
            Retour à la série
          </Button>
        )}
      </div>
    </section>
  );
}
