import type { MetadataRoute } from "next";

import { creationDate, getArtworks, getCreations, getSeries, getTags } from "@/lib/content";
import { site } from "@/lib/site";

/** /sitemap.xml: every static page, tag page, series, chapter and artwork. */
export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => `${site.url}${path}`;
  const latest = getCreations()[0];
  const lastModified = latest ? creationDate(latest) : undefined;

  return [
    { url: url("/"), lastModified, changeFrequency: "weekly", priority: 1 },
    { url: url("/about"), changeFrequency: "monthly", priority: 0.5 },
    { url: url("/gallery"), lastModified, changeFrequency: "weekly", priority: 0.9 },
    ...getTags().map(({ tag }) => ({
      url: url(`/gallery/tags/${tag}`),
      changeFrequency: "weekly" as const,
      priority: 0.4,
    })),
    ...getSeries().flatMap((series) => [
      { url: url(series.href), lastModified: series.updated, priority: 0.8 },
      ...series.chapters.map((chapter) => ({
        url: url(chapter.href),
        lastModified: chapter.date,
        priority: 0.6,
      })),
    ]),
    ...getArtworks().map((artwork) => ({
      url: url(artwork.href),
      lastModified: artwork.date,
      priority: 0.7,
    })),
  ];
}
