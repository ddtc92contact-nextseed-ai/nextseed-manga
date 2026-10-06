import Image from "next/image";

import { ArtworkCard } from "@/components/ArtworkCard";
import { Button } from "@/components/Button";
import { Hero } from "@/components/Hero";
import { Section } from "@/components/Section";
import { latestCreations } from "@/lib/creations";

import artistImage from "../../public/placeholder/artist.webp";
import heroImage from "../../public/placeholder/hero.webp";

const process = [
  {
    step: "01",
    title: "Script & prompt",
    text: "Every page starts as a story beat, then becomes a carefully written prompt.",
  },
  {
    step: "02",
    title: "Generate & select",
    text: "Dozens of AI generations per panel; only the strongest frames survive.",
  },
  {
    step: "03",
    title: "Ink & letter",
    text: "Panels are composed, retouched and lettered by hand into finished pages.",
  },
];

export default function Home() {
  return (
    <>
      <Hero
        kicker="Vol. 01 · AI manga showcase"
        title={
          <>
            Ink, dreamed <span className="text-accent">by machines.</span>
          </>
        }
        intro="Original manga artwork and stories, born from generative image AI and finished with an editor’s eye."
        image={heroImage}
        alt="Placeholder featured artwork: a cloaked figure raises a staff toward a giant glowing sun above a jagged ridge, with radiating speed lines."
        caption="Featured — placeholder artwork"
        actions={
          <>
            <Button href="#latest" size="lg">
              See the creations
            </Button>
            <Button href="#about" variant="outline" size="lg">
              How it’s made
            </Button>
          </>
        }
      />

      <Section
        id="latest"
        kicker="Chapter 01"
        title="Latest creations"
        intro="Fresh off the press: the most recent pages and covers from the studio."
      >
        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 md:grid-cols-3 lg:gap-x-8 lg:gap-y-12">
          {latestCreations.map((creation, i) => (
            <li key={creation.slug}>
              <ArtworkCard
                title={creation.title}
                subtitle={`${creation.series} · ${creation.year}`}
                image={creation.image}
                alt={creation.alt}
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
              <Image
                src={artistImage}
                alt="Placeholder artwork standing in for the artist’s portrait: a silhouette against a red sun."
                fill
                sizes="(min-width: 1024px) 40vw, (min-width: 448px) 448px, 100vw"
                placeholder="blur"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-5 text-xs uppercase tracking-widest text-paper-faint">
              Placeholder · artist portrait
            </figcaption>
          </figure>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-kicker text-accent">
              About the artist
            </p>
            <h2 id="about-title" className="font-display text-display-sm">
              Made with AI, <br className="hidden sm:block" />
              directed by a human.
            </h2>
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-paper-muted">
              <p>
                NextSeed Manga is the creative playground of NextSeed-AI: a studio exploring how
                generative image models can tell stories in the visual language of manga.
              </p>
              <p>
                The AI draws; the artist writes, selects, composes and edits. Every page here is
                curated, never a raw output.
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
            <p className="mb-3 text-xs font-bold uppercase tracking-kicker">To be continued…</p>
            <h2 id="follow-title" className="font-display text-display-sm uppercase">
              The next chapter is being inked.
            </h2>
            <p className="mt-4 text-lg text-ink-900">
              New pages land regularly. Dive into the gallery and come back for the next volume.
            </p>
          </div>
          <Button href="#latest" variant="ink" size="lg">
            Browse the gallery
          </Button>
        </div>
      </Section>
    </>
  );
}
