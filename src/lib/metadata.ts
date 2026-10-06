import type { Metadata } from "next";

import { site } from "./site";

/** URL of the 1200×630 card rendered by a route's `opengraph-image.ts`. */
export const ogImageUrl = (routePath: string) => `${routePath}/opengraph-image`;

type PageMetadata = {
  title: string;
  description: string;
  /** Path of the page, e.g. `/gallery`; used as the canonical URL. */
  path: string;
  /** Open Graph / Twitter image (1200×630); defaults to the site card. */
  image?: { url: string; alt: string };
  type?: "website" | "article";
};

export const defaultOgImage = {
  url: "/og-default.jpg",
  width: 1200,
  height: 630,
  alt: `${site.name}: ${site.tagline}`,
};

/** Per-page title, description, canonical URL and Open Graph / Twitter cards. */
export function pageMetadata({
  title,
  description,
  path,
  image = defaultOgImage,
  type = "website",
}: PageMetadata): Metadata {
  const images = [{ width: 1200, height: 630, ...image }];
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: site.name,
      type,
      images,
    },
    twitter: { card: "summary_large_image", title, description, images },
  };
}
