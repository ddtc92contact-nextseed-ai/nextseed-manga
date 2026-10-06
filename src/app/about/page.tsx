import Image from "next/image";
import { connection } from "next/server";
import { Suspense } from "react";

import { ContactFallback } from "@/components/ContactFallback";
import { ContactForm } from "@/components/ContactForm";
import { Container } from "@/components/Container";
import { Faq } from "@/components/Faq";
import { Section } from "@/components/Section";
import { SocialLinks } from "@/components/SocialLinks";
import { getSocialLinks } from "@/config/social";
import { pageMetadata } from "@/lib/metadata";
import { getSmtpConfig } from "@/server/contact";

import artistImage from "../../../public/placeholder/artist.webp";

export const metadata = pageMetadata({
  title: "À propos & contact",
  description:
    "Rencontrez l’artiste derrière NextSeed Manga, découvrez comment naissent ses mangas générés par IA, et prenez contact.",
  path: "/about",
});

// TODO(manager): every text block on this page is placeholder copy — replace it with your own.
const process = [
  {
    step: "01",
    title: "L’histoire d’abord",
    text: "TODO(manager): Chaque chapitre commence par un script\u00a0: les personnages, les temps forts, l’ambiance de chaque page. L’IA ne décide jamais de ce qui arrive.",
  },
  {
    step: "02",
    title: "Prompts & génération",
    text: "TODO(manager): Chaque case est décrite dans un prompt détaillé puis générée avec des modèles d’image, souvent des dizaines de fois, jusqu’à ce qu’une image tombe juste.",
  },
  {
    step: "03",
    title: "Direction & sélection",
    text: "TODO(manager): Comme un directeur artistique, je ne garde que les images les plus fortes et je pousse le style vers une vraie cohérence sur tout le livre.",
  },
  {
    step: "04",
    title: "Composition & lettrage",
    text: "TODO(manager): Les cases sont recadrées, retouchées, mises en page et lettrées à la main jusqu’à la planche finale.",
  },
];

const faq = [
  {
    question: "Tout est fait par l’IA\u00a0?",
    answer:
      "TODO(manager): Les images sont générées par IA\u00a0; les histoires, la direction, la sélection, la mise en page et le lettrage sont un travail humain. Chaque page est choisie avec soin, jamais livrée brute.",
  },
  {
    question: "Quels outils utilisez-vous\u00a0?",
    answer:
      "TODO(manager): Un mélange de modèles d’image génératifs et de logiciels de retouche classiques. Indiquez ici vos vrais outils.",
  },
  {
    question: "Puis-je utiliser ou partager vos illustrations\u00a0?",
    answer:
      "TODO(manager): Le partage est bienvenu, avec crédit et lien vers le site. Pour tout autre usage (tirages, projets commerciaux), contactez-moi d’abord.",
  },
  {
    question: "Acceptez-vous les commandes ou les collaborations\u00a0?",
    answer:
      "TODO(manager): Précisez si vous acceptez commandes et collaborations, et comment en faire la demande — le formulaire de contact ci-dessous est un bon début.",
  },
] as const;

export default function AboutPage() {
  return (
    <>
      <section
        aria-labelledby="about-title"
        className="relative isolate overflow-hidden border-b-4 border-accent bg-ink-950"
      >
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-speedlines opacity-60" />
        <Container className="grid items-center gap-12 py-section lg:grid-cols-[1.1fr_1fr] lg:gap-20 lg:py-section-lg">
          <div>
            <p className="mb-5 inline-block bg-accent px-3 py-1 text-xs font-bold uppercase tracking-kicker text-ink-950">
              L’artiste
            </p>
            <h1 id="about-title" className="font-display text-display uppercase text-balance">
              La main <span className="text-accent">derrière la machine.</span>
            </h1>
            <div className="mt-8 max-w-xl space-y-4 text-lg leading-relaxed text-paper-muted">
              {/* TODO(manager): replace with your own presentation. */}
              <p>
                TODO(manager): NextSeed Manga est l’atelier créatif de NextSeed-AI. J’écris des
                histoires de manga et je leur donne vie avec l’IA générative, en dirigeant chaque
                case comme le ferait un éditeur.
              </p>
              <p>
                TODO(manager): Quelques mots sur vous&nbsp;: votre parcours, ce qui vous attire dans le
                manga, les univers que vous aimez construire.
              </p>
            </div>
            <SocialLinks size="lg" className="mt-10" />
          </div>

          <figure className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="panel relative aspect-[4/5] overflow-hidden bg-ink-800">
              {/* TODO(manager): swap for your portrait or a signature visual. */}
              <Image
                src={artistImage}
                alt="Illustration provisoire en attendant le portrait de l’artiste : une silhouette devant un soleil rouge."
                fill
                preload
                sizes="(min-width: 1408px) 600px, (min-width: 1024px) 42vw, (min-width: 448px) 448px, 100vw"
                placeholder="blur"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-5 text-xs uppercase tracking-widest text-paper-faint">
              Provisoire · portrait de l’artiste
            </figcaption>
          </figure>
        </Container>
      </section>

      <Section
        id="process"
        kicker="Les coulisses"
        title="IA générative, direction humaine"
        intro="TODO(manager): Une courte intro à votre façon de travailler. L’IA est le pinceau&nbsp;; l’histoire, le goût et la planche finale sont à vous."
        tone="raised"
        className="relative isolate overflow-hidden"
      >
        <div aria-hidden="true" className="absolute inset-y-0 right-0 -z-10 w-1/2 bg-screentone opacity-40" />
        <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {process.map((item) => (
            <li key={item.step} className="border-l-4 border-accent pl-5">
              <span className="font-display text-3xl text-accent">{item.step}</span>
              <h3 className="mt-2 font-display text-xl">{item.title}</h3>
              <p className="mt-3 leading-relaxed text-paper-muted">{item.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="faq" kicker="FAQ" title="Vos questions, nos réponses">
        <Faq items={faq} />
      </Section>

      <Section
        id="contact"
        kicker="Contact"
        title="Parlons-en"
        intro={"Une question, une collab, ou juste envie de dire bonjour\u00a0? Envoyez un message, je vous réponds vite."}
        tone="raised"
      >
        <div className="grid gap-12 lg:grid-cols-[2fr_1fr] lg:gap-20">
          <Suspense>
            <ContactBlock />
          </Suspense>
          {getSocialLinks().length > 0 && (
            <div>
              <h3 className="font-display text-xl">Suivre l’atelier</h3>
              <p className="mt-3 mb-6 text-paper-muted">Les nouvelles planches sont publiées ici en premier.</p>
              <SocialLinks size="lg" showLabels className="flex-col items-start" />
            </div>
          )}
        </div>
      </Section>
    </>
  );
}

/** Contact form when SMTP is configured (checked at request time), email fallback otherwise. */
async function ContactBlock() {
  await connection();
  return getSmtpConfig() ? <ContactForm /> : <ContactFallback />;
}
