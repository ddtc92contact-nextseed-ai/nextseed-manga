import { site } from "@/lib/site";

import { Container } from "./Container";
import { Wordmark } from "./Wordmark";

/** Site footer: wordmark, tagline, secondary navigation and credits. */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t-4 border-accent bg-ink-900">
      <Container className="grid gap-10 py-14 md:grid-cols-[2fr_1fr] md:items-start">
        <div className="max-w-md">
          <Wordmark />
          <p className="mt-4 text-paper-muted">{site.tagline}</p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-8 gap-y-3 md:justify-end">
            {site.nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="text-sm font-semibold uppercase tracking-widest text-paper-muted hover:text-paper"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
      <div className="border-t border-ink-700">
        <Container className="flex flex-col gap-2 py-6 text-xs text-paper-faint sm:flex-row sm:justify-between">
          <p>© {year} NextSeed-AI. All artwork generated with AI and curated by hand.</p>
          <p>Artwork currently shown is placeholder content.</p>
        </Container>
      </div>
    </footer>
  );
}
