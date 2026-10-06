import type { ReactNode } from "react";

import { Container } from "./Container";

type Tone = "ink" | "raised" | "accent";

const tones: Record<Tone, string> = {
  ink: "bg-ink-950 text-paper",
  raised: "bg-ink-900 text-paper",
  // Focus rings switch to ink so they stay visible on the red background.
  accent: "bg-accent text-ink-950 [&_:focus-visible]:outline-ink-950",
};

type SectionProps = {
  id?: string;
  /** Small uppercase label above the title, e.g. "Chapter 01". */
  kicker?: string;
  title?: string;
  intro?: ReactNode;
  /** Optional element aligned to the right of the heading (e.g. a link). */
  action?: ReactNode;
  /** id of a heading rendered in `children`, when no `title` is passed. */
  labelledBy?: string;
  tone?: Tone;
  className?: string;
  children?: ReactNode;
};

/** Page section with an optional kicker / title / intro header block. */
export function Section({
  id,
  kicker,
  title,
  intro,
  action,
  labelledBy,
  tone = "ink",
  className = "",
  children,
}: SectionProps) {
  const headingId = id && title ? `${id}-title` : undefined;
  const labelId = headingId ?? labelledBy;
  const mutedText = tone === "accent" ? "text-ink-900" : "text-paper-muted";
  const kickerText = tone === "accent" ? "text-ink-950" : "text-accent";

  return (
    <section
      id={id}
      aria-labelledby={labelId}
      className={`py-section lg:py-section-lg ${tones[tone]} ${className}`}
    >
      <Container>
        {(kicker || title || intro || action) && (
          <header className="mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              {kicker && (
                <p
                  className={`mb-3 text-xs font-semibold uppercase tracking-kicker ${kickerText}`}
                >
                  {kicker}
                </p>
              )}
              {title && (
                <h2 id={headingId} className="font-display text-display-sm">
                  {title}
                </h2>
              )}
              {intro && (
                <div className={`mt-4 text-lg leading-relaxed ${mutedText}`}>
                  {intro}
                </div>
              )}
            </div>
            {action && <div className="shrink-0">{action}</div>}
          </header>
        )}
        {children}
      </Container>
    </section>
  );
}
