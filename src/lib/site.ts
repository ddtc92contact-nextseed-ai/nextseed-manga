export const site = {
  name: "NextSeed Manga",
  tagline: "Du manga généré par IA, encré case après case.",
  description:
    "La vitrine des mangas et illustrations créés par NextSeed-AI avec l’IA générative.",
  /**
   * Public URL of the site, used for canonical URLs, Open Graph and the sitemap.
   * Set SITE_URL (e.g. https://manga.example.com) when building for production.
   */
  url: (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/+$/, ""),
  nav: [
    { label: "Galerie", href: "/gallery" },
    { label: "À propos", href: "/about" },
    { label: "Contact", href: "/about#contact" },
    { label: "Suivre", href: "/#follow" },
  ],
} as const;
