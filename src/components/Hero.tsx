import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { Container } from "./Container";

type HeroProps = {
  kicker?: string;
  /** Main headline; rendered as the page's <h1>. */
  title: ReactNode;
  /** Line under the headline, e.g. a series subtitle. */
  subtitle?: ReactNode;
  intro?: ReactNode;
  /** Featured cover (portrait); shown whole, never cropped, so its title lettering stays visible. */
  image: StaticImageData;
  alt: string;
  /** Where the cover links to (e.g. the series page). */
  href?: string;
  /** Caption under the cover. */
  caption?: string;
  actions?: ReactNode;
  /** `lang` of the hero's text when it differs from the page (e.g. a French series). */
  lang?: string;
};

/** Featured creation: its cover framed as a manga panel next to a bold headline, over a blurred copy. */
export function Hero({ kicker, title, subtitle, intro, image, alt, href, caption, actions, lang }: HeroProps) {
  const cover = (
    <Image
      src={image}
      alt={alt}
      preload
      placeholder="blur"
      sizes="(min-width: 1408px) 480px, (min-width: 768px) 36vw, 72vw"
      className="h-auto w-full"
    />
  );

  return (
    <section
      lang={lang}
      className="relative isolate overflow-hidden border-b-4 border-accent md:flex md:min-h-[calc(100svh-4rem)] md:items-center"
    >
      {/* Blurred, darkened cover as the backdrop, with screentone so text stays readable. */}
      <Image
        src={image}
        alt=""
        fill
        sizes="20vw"
        className="-z-20 scale-110 object-cover opacity-50 blur-2xl"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-t from-ink-950 via-ink-950/70 to-ink-950/30 md:bg-linear-to-r md:from-ink-950 md:via-ink-950/70" />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-screentone opacity-60 [mask-image:linear-gradient(to_top,black,transparent_70%)]"
      />

      <Container className="grid items-center gap-10 py-12 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:gap-12 md:py-20 lg:gap-20">
        <figure className="mx-auto w-[72%] max-w-sm md:order-2 md:w-full md:max-w-[480px]">
          <div className="panel overflow-hidden bg-ink-800 shadow-[8px_8px_0_0_var(--color-accent)]">
            {href ? (
              <Link href={href} className="block">
                {cover}
              </Link>
            ) : (
              cover
            )}
          </div>
          {caption && (
            <figcaption className="mt-4 text-center text-xs uppercase tracking-widest text-paper-muted">
              {caption}
            </figcaption>
          )}
        </figure>

        <div className="max-w-3xl">
          {kicker && (
            <p className="mb-5 inline-block bg-accent px-3 py-1 text-xs font-bold uppercase tracking-kicker text-ink-950">
              {kicker}
            </p>
          )}
          <h1 className="font-display text-display uppercase text-balance">{title}</h1>
          {subtitle && <p className="mt-3 font-display text-2xl text-accent md:text-3xl">{subtitle}</p>}
          {intro && (
            <div className="mt-6 max-w-xl text-lg leading-relaxed text-paper-muted md:text-xl">
              {intro}
            </div>
          )}
          {actions && <div className="mt-10 flex flex-wrap gap-4">{actions}</div>}
        </div>
      </Container>
    </section>
  );
}
