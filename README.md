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
| `npm test`      | Unit tests (Vitest): forms, adapters  |
| `npm run content` | Prepare the images in `content/` (runs automatically before `dev` and `build`) |

Set `SITE_URL` (e.g. `SITE_URL=https://manga.example.com npm run build`) when building for
production: it is used for canonical URLs, Open Graph tags, `sitemap.xml` and `robots.txt`
(defaults to `http://localhost:3000`).

## Project structure

```
content/          the creations: series, chapters, artworks (JSON + images), see content/README.md
src/
  app/            routes: /, /about, /gallery, /gallery/tags/[tag], /series/[slug],
                  /series/[slug]/[chapter], /artworks/[slug], opengraph-image routes,
                  sitemap.ts, robots.ts, 404
  app/actions/    server actions used by the contact & newsletter forms
  components/     design-system components (Header, Footer, Button, Section, ArtworkCard, Gallery...)
  config/         social.ts: social network URLs + public contact email (edit me)
  lib/content/    build-time data layer: zod schemas + loader for content/
  lib/            site config, SEO metadata helper, Open Graph renderer
  server/         server-only logic: contact (zod + SMTP), newsletter adapters, rate limiting
public/placeholder/   PLACEHOLDER hero / artist artwork (see below)
scripts/          sync-content-images.mjs (image pipeline), generate-placeholders.mjs
```

## How to add a creation

No code change is needed: drop files in `content/`, open a PR, and the new creation appears in
`/gallery`, on the landing page, in the sitemap and on its own page after the next build.
The full format is documented in [`content/README.md`](content/README.md).

**A standalone artwork**

1. Create `content/artworks/<slug>/` (lowercase kebab-case, it becomes `/artworks/<slug>`).
2. Put the image in it (e.g. `image.webp`, full resolution is fine).
3. Add `artwork.json`:
   ```json
   {
     "title": "My Artwork",
     "description": "One or two sentences.",
     "image": "image.webp",
     "alt": "What the image shows.",
     "date": "2026-10-06",
     "tags": ["fantasy"],
     "aiTools": ["Midjourney v7"]
   }
   ```

**A series / a new chapter**

1. Create `content/series/<slug>/` with `cover.webp` and `series.json` (title, synopsis, cover,
   coverAlt, tags, status, date; optional aiTools and readingMode).
2. For each chapter, create `content/series/<slug>/chapters/<NN>/` with a `chapter.json`
   (`{ "number": 1, "title": "…", "date": "YYYY-MM-DD" }`) and the pages named `01.webp`,
   `02.webp`… (read in file-name order).

**Check it**

```bash
npm run dev      # then open /gallery; after adding files while dev is running, run `npm run content`
npm run build    # fails with a message naming the file and field if a metadata file is invalid
```

## Images and SEO

- `scripts/sync-content-images.mjs` copies the content images to `public/content/` (git-ignored)
  with a content hash in the file name, scales down originals wider than 2000 px, and records
  their size and a tiny blur placeholder. Every image goes through `next/image` with a `sizes`
  attribute, a blur placeholder and AVIF/WebP output, so phones never download the original.
- Every page has its own title, description, canonical URL and Open Graph / Twitter card.
  Artworks and series get a 1200×630 card rendered at build time from their image
  (`opengraph-image.ts`); other pages use `public/og-default.jpg`.
- `/sitemap.xml` lists every page (gallery, tag pages, series, chapters, artworks);
  `/robots.txt` allows everything and points to it.

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
  - `SocialLinks` – icon links for every network filled in `src/config/social.ts` (`size`, `showLabels`).
  - `FormField` / `FormStatus` – labelled input/textarea with inline errors; live status message.
  - `ContactForm` (+ `ContactFallback`), `NewsletterSignup` (`variant` `compact | panel`), `Faq`.

`NewsletterSignup` is an async server component that renders nothing when no provider is configured;
wrap it in `<Suspense>`. Use `variant="panel"` for a framed call-to-action at the end of a chapter.

Don't hard-code colours or fonts in components; add a token instead.

## Placeholder artwork

Everything in `public/placeholder/`, `public/og-default.jpg` and the example creations in
`content/` are generated placeholder art (each image is stamped "PLACEHOLDER"). Regenerate
with `node scripts/generate-placeholders.mjs`. Replace the examples by adding real creations
to `content/` (and deleting the placeholder folders); the hero/about images are imported in
`src/app/page.tsx`.

## Social links

Edit `src/config/social.ts`: one URL per network (Instagram, X, TikTok, YouTube, Pixiv, Bluesky,
Threads, Discord, Patreon). An empty string hides that network in the footer and on `/about`.
`contactEmail` in the same file is shown when the contact form is unavailable.

## Environment variables

All optional. In production, set them in the server's `.env` next to the deployment variables
(`docker compose` passes the whole file to the container, see `.env.example`); for local development
put them in `.env.local`. They are read **at request time**, so changing them only needs a container
restart (`docker compose up -d`), not a rebuild.

| Variable        | Used for                                                        | When missing                         |
| --------------- | --------------------------------------------------------------- | ------------------------------------ |
| `SMTP_HOST`     | Contact form: SMTP server                                       | Form replaced by an email fallback   |
| `SMTP_PORT`     | SMTP port (`465` = TLS, otherwise STARTTLS)                     | `587`                                |
| `SMTP_USER`     | SMTP login                                                      | No authentication                    |
| `SMTP_PASS`     | SMTP password                                                   | —                                    |
| `SMTP_FROM`     | Sender address of contact emails                                | `SMTP_USER`, then `CONTACT_TO`       |
| `CONTACT_TO`    | Mailbox receiving contact messages                              | Form replaced by an email fallback   |
| `BREVO_API_KEY` | Newsletter: Brevo API key                                       | Newsletter signup hidden             |
| `BREVO_LIST_ID` | Newsletter: numeric id of the Brevo list to add subscribers to  | Newsletter signup hidden             |

Both forms validate on the server (zod), and are rate-limited to 5 submissions per IP per 15 minutes
(in memory, using `X-Forwarded-For` from the reverse proxy). The contact form also has a honeypot field.

To try the contact form locally without a real mailbox, run a catcher such as
[Mailpit](https://mailpit.axllent.org/) and set `SMTP_HOST=127.0.0.1`, `SMTP_PORT=1025`,
`CONTACT_TO=you@example.test`.

To swap newsletter providers, add an adapter implementing `NewsletterProvider`
(`src/server/newsletter/types.ts`) next to `brevo.ts` and select it in `getNewsletterProvider()`.

## Deployment

Production runs as a Docker container behind the VPS's existing Traefik (no host port).
`next.config.ts` uses `output: "standalone"`; `GET /api/health` is the container healthcheck.

- `Dockerfile` – multi-stage Node 22 image, non-root, listens on `PORT` (default 3000).
- `docker-compose.yml` + `.env.example` – external Traefik network and Traefik v2 labels, all env-driven.
- `.github/workflows/ci.yml` – lint, build, compose validation and `docker build` + smoke test on PRs and `main`.

Content and artwork are baked into the image: a new creation is merge to `main`, then pull + rebuild
on the server. Step-by-step guide (in French): [DEPLOY.md](DEPLOY.md).
