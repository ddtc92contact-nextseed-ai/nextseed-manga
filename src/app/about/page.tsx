import type { Metadata } from "next";
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
import { getFeaturedSeries } from "@/lib/content";
import { getSmtpConfig } from "@/server/contact";

export const metadata: Metadata = {
  title: "About & contact",
  description:
    "Meet the artist behind NextSeed Manga, learn how the AI-generated manga is made, and get in touch.",
};

// TODO(manager): every text block on this page is placeholder copy — replace it with your own.
const process = [
  {
    step: "01",
    title: "The story comes first",
    text: "TODO(manager): Each chapter starts as a script: characters, beats, the mood of every page. The AI never decides what happens.",
  },
  {
    step: "02",
    title: "Prompting & generation",
    text: "TODO(manager): Panels are described in detailed prompts and generated with image models, often dozens of times, until a frame truly fits.",
  },
  {
    step: "03",
    title: "Direction & selection",
    text: "TODO(manager): Like an art director, I keep only the strongest frames and push the style towards consistency across the whole book.",
  },
  {
    step: "04",
    title: "Composition & lettering",
    text: "TODO(manager): Panels are cropped, retouched, laid out and lettered by hand into finished manga pages.",
  },
];

const faq = [
  {
    question: "Is all of this made by AI?",
    answer:
      "TODO(manager): The images are generated with AI; the stories, direction, selection, layout and lettering are human work. Every page is curated, never a raw output.",
  },
  {
    question: "Which tools do you use?",
    answer:
      "TODO(manager): A mix of generative image models and classic editing software. List your actual toolchain here.",
  },
  {
    question: "Can I use or share your artwork?",
    answer:
      "TODO(manager): Sharing with credit and a link back is welcome. For any other use (prints, commercial projects), please get in touch first.",
  },
  {
    question: "Do you take commissions or collaborations?",
    answer:
      "TODO(manager): Describe whether you accept commissions or collaborations, and how to ask — the contact form below is a good start.",
  },
] as const;

export default function AboutPage() {
  const featured = getFeaturedSeries();
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
              About the artist
            </p>
            <h1 id="about-title" className="font-display text-display uppercase text-balance">
              The hand <span className="text-accent">behind the machine.</span>
            </h1>
            <div className="mt-8 max-w-xl space-y-4 text-lg leading-relaxed text-paper-muted">
              {/* TODO(manager): replace with your own presentation. */}
              <p>
                TODO(manager): NextSeed Manga is the creative studio of NextSeed-AI. I write manga
                stories and bring them to life with generative image AI, directing every panel the
                way an editor would.
              </p>
              <p>
                TODO(manager): Say a few words about yourself: your background, what draws you to
                manga, the worlds you like to build.
              </p>
            </div>
            <SocialLinks size="lg" className="mt-10" />
          </div>

          <figure className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="panel relative aspect-[4/5] overflow-hidden bg-ink-800">
              {/* TODO(manager): swap for your portrait or a signature visual (currently the latest series cover). */}
              {featured && (
                <Image
                  src={featured.cover}
                  alt={featured.coverAlt}
                  fill
                  preload
                  sizes="(min-width: 1408px) 600px, (min-width: 1024px) 42vw, (min-width: 448px) 448px, 100vw"
                  placeholder="blur"
                  className="object-cover object-top"
                />
              )}
            </div>
            {featured && (
              <figcaption lang={featured.language} className="mt-5 text-xs uppercase tracking-widest text-paper-faint">
                {featured.subtitle ? `${featured.title} — ${featured.subtitle}` : featured.title}
              </figcaption>
            )}
          </figure>
        </Container>
      </section>

      <Section
        id="process"
        kicker="How it’s made"
        title="Generative AI, human direction"
        intro="TODO(manager): A short intro to your process. The AI is the brush; the story, the taste and the final page are yours."
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

      <Section id="faq" kicker="FAQ" title="Questions, answered">
        <Faq items={faq} />
      </Section>

      <Section
        id="contact"
        kicker="Contact"
        title="Let’s talk"
        intro="Questions, collaborations, or just want to say hi? Send a message and I’ll get back to you."
        tone="raised"
      >
        <div className="grid gap-12 lg:grid-cols-[2fr_1fr] lg:gap-20">
          <Suspense>
            <ContactBlock />
          </Suspense>
          {getSocialLinks().length > 0 && (
            <div>
              <h3 className="font-display text-xl">Follow the studio</h3>
              <p className="mt-3 mb-6 text-paper-muted">New pages are posted on these networks first.</p>
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
