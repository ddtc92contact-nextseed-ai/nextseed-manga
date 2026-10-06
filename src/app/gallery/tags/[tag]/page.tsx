import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Gallery } from "@/components/Gallery";
import { getTags } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return getTags().map(({ tag }) => ({ tag }));
}

export async function generateMetadata({ params }: PageProps<"/gallery/tags/[tag]">): Promise<Metadata> {
  const { tag } = await params;
  return pageMetadata({
    title: `#${tag} · Galerie`,
    description: `Illustrations et séries manga générées par IA avec le tag «\u00a0${tag}\u00a0» sur NextSeed Manga.`,
    path: `/gallery/tags/${tag}`,
  });
}

export default async function TagPage({ params }: PageProps<"/gallery/tags/[tag]">) {
  const { tag } = await params;
  if (!getTags().some((t) => t.tag === tag)) notFound();
  return <Gallery tag={tag} />;
}
