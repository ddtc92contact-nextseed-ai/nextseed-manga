import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";

import { Container } from "./Container";

type HeroProps = {
  kicker?: string;
  /** Main headline; rendered as the page's <h1>. */
  title: ReactNode;
  intro?: ReactNode;
  image: StaticImageData;
  alt: string;
  /** Caption credited in the corner of the artwork. */
  caption?: string;
  actions?: ReactNode;
};

/** Full-bleed hero with a featured artwork behind a bold headline. */
export function Hero({ kicker, title, intro, image, alt, caption, actions }: HeroProps) {
  return (
    <section className="relative isolate flex min-h-[calc(100svh-4rem)] items-end overflow-hidden border-b-4 border-accent">
      <Image
        src={image}
        alt={alt}
        fill
        preload
        sizes="100vw"
        placeholder="blur"
        className="-z-20 object-cover object-[70%_center]"
      />
      {/* Ink wash + screentone so the headline stays readable over any artwork. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-t from-ink-950 via-ink-950/70 to-ink-950/10 md:bg-linear-to-r md:from-ink-950 md:via-ink-950/60 md:to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-screentone opacity-60 [mask-image:linear-gradient(to_top,black,transparent_70%)]"
      />

      <Container className="pb-14 pt-32 md:pb-20 lg:pb-24">
        <div className="max-w-3xl">
          {kicker && (
            <p className="mb-5 inline-block bg-accent px-3 py-1 text-xs font-bold uppercase tracking-kicker text-ink-950">
              {kicker}
            </p>
          )}
          <h1 className="font-display text-display uppercase text-balance">{title}</h1>
          {intro && (
            <div className="mt-6 max-w-xl text-lg leading-relaxed text-paper-muted md:text-xl">
              {intro}
            </div>
          )}
          {actions && <div className="mt-10 flex flex-wrap gap-4">{actions}</div>}
        </div>
      </Container>

      {caption && (
        <p className="absolute bottom-4 right-gutter hidden text-xs uppercase tracking-widest text-paper-muted md:block lg:right-gutter-lg">
          {caption}
        </p>
      )}
    </section>
  );
}
