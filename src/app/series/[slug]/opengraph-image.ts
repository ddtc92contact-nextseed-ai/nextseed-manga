import { notFound } from "next/navigation";

import { getSeries, getSeriesBySlug } from "@/lib/content";
import { ogSize, renderOgImage } from "@/lib/og-image";

export const size = ogSize;
export const contentType = "image/jpeg";
export const alt = "Couverture d’une série manga de NextSeed Manga";
export const dynamicParams = false;

export function generateStaticParams() {
  return getSeries().map(({ slug }) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const series = getSeriesBySlug((await params).slug);
  if (!series) notFound();
  return renderOgImage(series.cover);
}
