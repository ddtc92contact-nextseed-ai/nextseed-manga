import type { Metadata } from "next";

import { Button } from "@/components/Button";
import { Container } from "@/components/Container";

export const metadata: Metadata = {
  title: "Page introuvable",
};

export default function NotFound() {
  return (
    <section className="relative isolate overflow-hidden bg-ink-950 py-section lg:py-section-lg">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-speedlines" />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-screentone [mask-image:radial-gradient(circle_at_center,transparent_30%,black_75%)]"
      />
      <Container className="flex flex-col items-center text-center">
        <p className="text-xs font-semibold uppercase tracking-kicker text-accent">
          Erreur · Case manquante
        </p>
        <h1 className="mt-4 font-display text-[clamp(6rem,30vw,16rem)] leading-none text-paper [text-shadow:6px_6px_0_var(--color-accent)]">
          404
        </h1>
        <p className="mt-6 max-w-md text-lg text-paper-muted">
          Cette page s’est perdue entre deux chapitres. Elle a peut-être déménagé… ou n’a jamais été encrée.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button href="/" size="lg">
            Retour à la couverture
          </Button>
          <Button href="/#latest" variant="outline" size="lg">
            Dernières créations
          </Button>
        </div>
      </Container>
    </section>
  );
}
