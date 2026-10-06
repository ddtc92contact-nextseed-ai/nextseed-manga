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

## Project structure

```
src/
  app/            routes: layout (metadata, fonts), landing page, 404, icon.svg
  components/     design-system components (Header, Footer, Button, Section, ArtworkCard, Hero...)
  lib/            site config (nav, copy) and creations data
  config/         social.ts: social network URLs + public contact email (edit me)
  server/         server-only logic: contact (zod + SMTP), newsletter adapters, rate limiting
  app/actions/    server actions used by the contact & newsletter forms
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
  - `SocialLinks` – icon links for every network filled in `src/config/social.ts` (`size`, `showLabels`).
  - `FormField` / `FormStatus` – labelled input/textarea with inline errors; live status message.
  - `ContactForm` (+ `ContactFallback`), `NewsletterSignup` (`variant` `compact | panel`), `Faq`.

`NewsletterSignup` is an async server component that renders nothing when no provider is configured;
wrap it in `<Suspense>`. Use `variant="panel"` for a framed call-to-action at the end of a chapter.

Don't hard-code colours or fonts in components; add a token instead.

## Placeholder artwork

Everything in `public/placeholder/` is generated placeholder art (each image is stamped
"PLACEHOLDER"). Regenerate with `node scripts/generate-placeholders.mjs`. Replace it with real
creations by editing `src/lib/creations.ts` and the hero/about imports in `src/app/page.tsx`.

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
