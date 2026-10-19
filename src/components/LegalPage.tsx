import type { ReactNode } from "react";

import { isPlaceholder, legal } from "@/config/legal";
import { formatDate } from "@/lib/format";

import { Container } from "./Container";

type LegalPageProps = {
  title: string;
  intro?: ReactNode;
  children: ReactNode;
};

/** Shared layout of the legal pages: kicker, title, last update and long-form text. */
export function LegalPage({ title, intro, children }: LegalPageProps) {
  return (
    <>
      <section aria-labelledby="legal-title" className="relative isolate overflow-hidden border-b-4 border-accent bg-ink-950">
        <div aria-hidden="true" className="absolute inset-y-0 right-0 -z-10 w-1/2 bg-screentone opacity-40" />
        <Container className="py-section">
          <p className="mb-5 inline-block bg-accent px-3 py-1 text-xs font-bold uppercase tracking-kicker text-ink-950">
            Informations légales
          </p>
          <h1 id="legal-title" className="font-display text-display-sm text-balance">
            {title}
          </h1>
          {intro && <div className="mt-6 max-w-3xl text-lg leading-relaxed text-paper-muted">{intro}</div>}
          <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-paper-faint">
            Dernière mise à jour&nbsp;: <time dateTime={legal.lastUpdated}>{formatDate(legal.lastUpdated)}</time>
          </p>
        </Container>
      </section>
      <Container className="pb-section pt-4 lg:pb-section-lg">
        <div className="legal-prose">{children}</div>
      </Container>
    </>
  );
}

/** Label/value pairs (publisher, host...) rendered as a compact definition list. */
export function LegalDetails({ items }: { items: [label: string, value: ReactNode][] }) {
  return (
    <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-[minmax(10rem,auto)_1fr]">
      {items.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="mt-2 sm:mt-0">{label}</dt>
          <dd className="break-words">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** mailto link, or the raw text while the address is still a placeholder. */
export function LegalEmail({ email }: { email: string }) {
  return isPlaceholder(email) ? <>{email}</> : <a href={`mailto:${email}`}>{email}</a>;
}
