export const site = {
  name: "NextSeed Manga",
  tagline: "AI-generated manga, inked one panel at a time.",
  description:
    "A showcase of manga artwork and stories created with generative image AI by NextSeed-AI.",
  /**
   * Public URL of the site, used for canonical URLs, Open Graph and the sitemap.
   * Set SITE_URL (e.g. https://manga.example.com) when building for production.
   */
  url: (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/+$/, ""),
  nav: [
    { label: "Gallery", href: "/gallery" },
    { label: "About", href: "/#about" },
    { label: "Follow", href: "/#follow" },
  ],
} as const;
