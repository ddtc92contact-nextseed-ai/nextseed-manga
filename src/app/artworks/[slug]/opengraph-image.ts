import { notFound } from "next/navigation";

import { getArtwork, getArtworks } from "@/lib/content";
import { ogSize, renderOgImage } from "@/lib/og-image";

export const size = ogSize;
export const contentType = "image/jpeg";
export const alt = "Artwork from NextSeed Manga";
export const dynamicParams = false;

export function generateStaticParams() {
  return getArtworks().map(({ slug }) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const artwork = getArtwork((await params).slug);
  if (!artwork) notFound();
  return renderOgImage(artwork.image);
}
