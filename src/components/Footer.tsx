import { Suspense } from "react";

import { site } from "@/lib/site";

import { Container } from "./Container";
import { NewsletterSignup } from "./NewsletterSignup";
import { SocialLinks } from "./SocialLinks";
import { Wordmark } from "./Wordmark";

/** Site footer: wordmark, tagline, socials, newsletter (when configured), navigation and credits. */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t-4 border-accent bg-ink-900">
      <Container className="grid gap-10 py-14 md:grid-cols-2 md:items-start lg:grid-cols-[1fr_1.2fr_auto] lg:gap-16">
        <div className="max-w-md">
          <Wordmark />
          <p className="mt-4 text-paper-muted">{site.tagline}</p>
          <SocialLinks className="mt-6" />
        </div>
        <Suspense>
          <NewsletterSignup className="max-w-md" />
        </Suspense>
        <nav aria-label="Pied de page" className="md:col-span-2 lg:col-span-1">
          <ul className="flex flex-wrap gap-x-8 gap-y-3 lg:flex-col lg:items-end">
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
          <p>© {year} NextSeed-AI. Illustrations générées par IA, sélectionnées à la main.</p>
          <p>Les illustrations affichées sont, pour l’instant, provisoires.</p>
        </Container>
      </div>
    </footer>
  );
}
