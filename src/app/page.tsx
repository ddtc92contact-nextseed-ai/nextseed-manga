import Image from "next/image";

import { Button } from "@/components/Button";
import { CreationCard } from "@/components/CreationCard";
import { Hero } from "@/components/Hero";
import { Section } from "@/components/Section";
import { getCreations, getFeaturedSeries } from "@/lib/content";
import { seriesLabels } from "@/lib/labels";

const process = [
  {
    step: "01",
    title: "Script & prompt",
    text: "Chaque page naît d’un temps fort du récit, puis devient un prompt ciselé.",
  },
  {
    step: "02",
    title: "Générer & trier",
    text: "Des dizaines de générations par case\u00a0: seules les plus fortes survivent.",
  },
  {
    step: "03",
    title: "Encrer & lettrer",
    text: "Les cases sont composées, retouchées et lettrées à la main jusqu’à la planche finale.",
  },
];

export default function Home() {
  const latestCreations = getCreations().slice(0, 6);
  const featured = getFeaturedSeries();
  const t = featured && seriesLabels(featured.language);
  const firstChapter = featured?.chapters[0];
  // A page of the featured series illustrates the "about" section.
  const showcasePage = firstChapter?.pages[0];

  return (
    <>
      {featured && t && (
        <Hero
          lang={featured.language}
          kicker={t.featured}
          title={featured.title}
          subtitle={featured.subtitle}
          intro={featured.synopsis}
          image={featured.cover}
          alt={featured.coverAlt}
          href={featured.href}
          actions={
            <>
              {firstChapter && (
                <Button href={firstChapter.href} size="lg">
                  {t.read(firstChapter.number)}
                </Button>
              )}
              <Button href={featured.href} variant="outline" size="lg">
                {t.discoverSeries}
              </Button>
            </>
          }
        />
      )}

      <Section
        id="latest"
        kicker="Chapitre 01"
        title="Dernières créations"
        intro="Tout juste sorties de l’encrier&nbsp;: les dernières planches et couvertures de l’atelier."
        action={
          <Button href="/gallery" variant="outline">
            Voir la galerie
          </Button>
        }
      >
        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 md:grid-cols-3 lg:gap-x-8 lg:gap-y-12">
          {latestCreations.map((creation, i) => (
            <li key={creation.href}>
              <CreationCard
                creation={creation}
                index={i + 1}
                sizes="(min-width: 1408px) 430px, (min-width: 768px) 31vw, 46vw"
              />
            </li>
          ))}
        </ul>
      </Section>

      <Section id="about" labelledBy="about-title" tone="raised" className="relative isolate overflow-hidden">
        <div aria-hidden="true" className="absolute inset-y-0 right-0 -z-10 w-1/2 bg-screentone opacity-50" />
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <figure className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="panel relative aspect-[4/5] overflow-hidden bg-ink-800">
              {showcasePage && (
                <Image
                  src={showcasePage.image}
                  alt={showcasePage.alt}
                  fill
                  sizes="(min-width: 1024px) 40vw, (min-width: 448px) 448px, 100vw"
                  placeholder="blur"
                  className="object-cover object-top"
                />
              )}
            </div>
            {featured && t && firstChapter && showcasePage && (
              <figcaption lang={featured.language} className="mt-5 text-xs uppercase tracking-widest text-paper-faint">
                {featured.title} · {t.chapter(firstChapter.number)}, page {showcasePage.number}
              </figcaption>
            )}
          </figure>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-kicker text-accent">
              L’artiste
            </p>
            <h2 id="about-title" className="font-display text-display-sm">
              Fait avec l’IA, <br className="hidden sm:block" />
              dirigé par un humain.
            </h2>
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-paper-muted">
              <p>
                NextSeed Manga est le terrain de jeu créatif de NextSeed-AI&nbsp;: un atelier qui explore
                comment l’IA générative peut raconter des histoires dans le langage visuel du manga.
              </p>
              <p>
                L’IA dessine&nbsp;; l’artiste écrit, choisit, compose et retouche. Chaque page est
                sélectionnée avec soin, jamais livrée brute.
              </p>
            </div>
            <ol className="mt-10 grid gap-6 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {process.map((item) => (
                <li key={item.step} className="border-l-4 border-accent pl-4">
                  <span className="font-display text-sm text-accent">{item.step}</span>
                  <h3 className="mt-1 font-display text-lg">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-paper-muted">{item.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Section>

      <Section id="follow" labelledBy="follow-title" tone="accent" className="relative isolate overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-screentone-accent [mask-image:linear-gradient(to_left,black,transparent_80%)]" />
        <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-kicker">À suivre…</p>
            <h2 id="follow-title" className="font-display text-display-sm uppercase">
              Le prochain chapitre est à l’encrage.
            </h2>
            <p className="mt-4 text-lg text-ink-900">
              De nouvelles planches arrivent régulièrement. Plongez dans la galerie et revenez pour le prochain volume.
            </p>
          </div>
          <Button href="/gallery" variant="ink" size="lg">
            Parcourir la galerie
          </Button>
        </div>
      </Section>
    </>
  );
}
