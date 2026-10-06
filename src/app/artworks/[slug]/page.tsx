import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Container } from "@/components/Container";
import { DetailList } from "@/components/DetailList";
import { PrevNext } from "@/components/PrevNext";
import { TagList } from "@/components/TagList";
import { getAdjacentArtworks, getArtwork, getArtworks } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { ogImageUrl, pageMetadata } from "@/lib/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return getArtworks().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/artworks/[slug]">): Promise<Metadata> {
  const artwork = getArtwork((await params).slug);
  if (!artwork) return {};
  return pageMetadata({
    title: artwork.title,
    description: artwork.description,
    path: artwork.href,
    image: { url: ogImageUrl(artwork.href), alt: artwork.alt },
    type: "article",
  });
}

export default async function ArtworkPage({ params }: PageProps<"/artworks/[slug]">) {
  const artwork = getArtwork((await params).slug);
  if (!artwork) notFound();
  const { previous, next } = getAdjacentArtworks(artwork.slug);

  return (
    <article className="py-12 lg:py-16">
      <Container>
        <Breadcrumbs
          items={[{ label: "Galerie", href: "/gallery" }, { label: "Illustrations" }, { label: artwork.title }]}
        />
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
          <figure className="flex justify-center bg-ink-900 p-2 sm:p-4">
            <Image
              src={artwork.image}
              alt={artwork.alt}
              preload
              placeholder="blur"
              sizes="(min-width: 1408px) 920px, (min-width: 1024px) calc(100vw - 30rem), calc(100vw - 3rem)"
              className="h-auto max-h-[85svh] w-auto max-w-full object-contain"
            />
          </figure>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-xs font-semibold uppercase tracking-kicker text-accent">Illustration</p>
            <h1 className="mt-3 font-display text-display-sm hyphens-auto [overflow-wrap:anywhere] lg:text-[2.75rem]">{artwork.title}</h1>
            <p className="mt-6 text-lg leading-relaxed text-paper-muted">{artwork.description}</p>
            <div className="mt-8">
              <DetailList
                items={[
                  {
                    label: "Publiée le",
                    value: <time dateTime={artwork.date}>{formatDate(artwork.date)}</time>,
                  },
                  ...(artwork.aiTools.length > 0
                    ? [{ label: "Réalisée avec", value: artwork.aiTools.join(", ") }]
                    : []),
                ]}
              />
            </div>
            <TagList tags={artwork.tags} className="mt-6" />
          </div>
        </div>

        <PrevNext
          label="Autres illustrations"
          previous={
            previous && { href: previous.href, title: previous.title, image: previous.image, label: "← Plus récente" }
          }
          next={next && { href: next.href, title: next.title, image: next.image, label: "Plus ancienne →" }}
        />
      </Container>
    </article>
  );
}
