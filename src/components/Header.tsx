import { site } from "@/lib/site";

import { Container } from "./Container";
import { MobileNav } from "./MobileNav";
import { Wordmark } from "./Wordmark";

/** Sticky site header: wordmark + primary navigation. */
export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-700 bg-ink-950/85 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-6">
        <Wordmark />
        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-8">
            {site.nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="text-sm font-semibold uppercase tracking-widest text-paper-muted transition-colors hover:text-paper"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <MobileNav items={site.nav} />
      </Container>
    </header>
  );
}
