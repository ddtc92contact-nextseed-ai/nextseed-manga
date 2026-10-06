# NextSeed Manga

Showcase site for NextSeed-AI's manga creations made with generative image AI.
Built with Next.js (App Router), TypeScript and Tailwind CSS v4.

## Getting started

Requirements: Node.js 20.9+ and npm.

```bash
npm install
npm run dev            # http://localhost:3000
PORT=4000 npm run dev  # any port via the PORT env var
```

## Scripts

| Command         | What it does                         |
| --------------- | ------------------------------------ |
| `npm run dev`   | Dev server with hot reload (`PORT`)  |
| `npm run build` | Production build                     |
| `npm run start` | Serve the production build (`PORT`)  |
| `npm run lint`  | ESLint (Next.js core-web-vitals + TS) |

## Project structure

```
src/
  app/            routes: layout (metadata, fonts), landing page, 404, icon.svg
  components/     design-system components (Header, Footer, Button, Section, ArtworkCard, Hero...)
  lib/            site config (nav, copy) and creations data
public/placeholder/   PLACEHOLDER artwork (see below)
scripts/          generate-placeholders.mjs
```

## Design system

- **Tokens** live in the `@theme` block of `src/app/globals.css` (Tailwind v4 has no
  `tailwind.config` file): `ink-*` blacks, `paper` text colours, the hanko-red `accent`,
  `font-display` (Dela Gothic One) / `font-sans` (Inter, both via `next/font`),
  `gutter` / `section` spacing, `max-w-site` and the `text-display` headline scale.
- **Textures**: `bg-screentone`, `bg-screentone-accent`, `bg-speedlines` and the `panel` frame utility.
- **Components** (`src/components`), all used on the landing page:
  - `Button` – `variant` `primary | ink | outline | ghost`, `size` `md | lg`; renders a `Link` when `href` is set.
  - `Section` – page section with optional `kicker`, `title`, `intro`, `action`; `tone` `ink | raised | accent`.
  - `ArtworkCard` – 3:4 artwork panel (next/image) with title, subtitle and panel number.
  - `Hero` – full-bleed featured artwork with headline and actions.
  - `Header` (+ `MobileNav`), `Footer`, `Wordmark`, `Container`.

Don't hard-code colours or fonts in components; add a token instead.

## Placeholder artwork

Everything in `public/placeholder/` is generated placeholder art (each image is stamped
"PLACEHOLDER"). Regenerate with `node scripts/generate-placeholders.mjs`. Replace it with real
creations by editing `src/lib/creations.ts` and the hero/about imports in `src/app/page.tsx`.
