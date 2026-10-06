# content/

Every creation shown on the site lives here as plain files: no database, no admin panel.
Folder names become URLs, so they must be **lowercase kebab-case** (`a-z`, `0-9`, `-`).

```
content/
  artworks/                       standalone artworks → /artworks/<slug>
    my-artwork/
      artwork.json
      image.webp
  series/                         manga series → /series/<slug>
    ia-mi/
      series.json
      cover.webp
      chapters/                   one folder per chapter → /series/<slug>/<chapter>
        01/
          chapter.json
          001.webp                pages, read in file-name order (001, 002 … 012)
          002.webp
```

Images: `.webp` (preferred), `.avif`, `.png` or `.jpg`. Any size is accepted; originals wider
than 2000 px are scaled down at build time and next/image serves resized AVIF/WebP to each
device, so you can drop full-resolution exports. Convert PNG exports before committing them,
the repo stays light and the lettering sharp:

```bash
npm run to-webp -- content/series/ia-mi/chapters/02 ~/exports/chap2/*.png
```

## `artwork.json`

```json
{
  "title": "Violet Signal",
  "description": "One or two sentences shown on the artwork page and in link previews.",
  "image": "image.webp",
  "alt": "What the image shows, for screen readers.",
  "date": "2026-09-28",
  "tags": ["sci-fi", "portrait"],
  "aiTools": ["Midjourney v7", "Photoshop"]
}
```

| Field         | Required | Notes                                                      |
| ------------- | -------- | ---------------------------------------------------------- |
| `title`       | yes      |                                                            |
| `description` | yes      | Also used as the SEO / Open Graph description.             |
| `image`       | yes      | File name of the image, in the same folder.                |
| `alt`         | yes      | Alternative text.                                          |
| `date`        | yes      | `YYYY-MM-DD`; the gallery is sorted newest first.          |
| `tags`        | yes      | At least one, lowercase kebab-case (`dark-fantasy`).       |
| `aiTools`     | no       | Tools/models used, shown as "Made with".                   |

## `series.json`

```json
{
  "title": "IA-MI",
  "subtitle": "Le robot sans mémoire",
  "synopsis": "Shown on the series page, in the hero and in link previews.",
  "cover": "cover.webp",
  "coverAlt": "What the cover shows.",
  "tags": ["jeunesse", "aventure"],
  "status": "ongoing",
  "date": "2026-10-06",
  "aiTools": ["Qwen Image"],
  "readingMode": "manga",
  "readingDirection": "ltr",
  "language": "fr"
}
```

| Field         | Required | Notes                                                            |
| ------------- | -------- | ---------------------------------------------------------------- |
| `title`, `synopsis`, `cover`, `coverAlt`, `tags`, `date` | yes | `date` = first publication. |
| `status`      | yes      | `ongoing`, `completed` or `hiatus`.                              |
| `subtitle`    | no       | Tagline shown under the title.                                   |
| `aiTools`     | no       |                                                                  |
| `readingMode` | no       | Default reader: `webtoon` (vertical scroll, default) or `manga`. |
| `readingDirection` | no  | Page order in manga mode: `rtl` (Japanese, default) or `ltr` (Western/French lettering). |
| `language`    | no       | Language of the lettering: `fr` (default) or `en`. The series and chapter pages use labels in that language ("Chapitre 1", "Lire le chapitre 1"). |

## `chapter.json`

```json
{
  "number": 1,
  "title": "La rencontre",
  "date": "2026-10-06",
  "summary": "Optional one-liner.",
  "pageAlt": { "001.webp": "What happens on page 1.", "002.webp": "…" }
}
```

`number` sets the reading order (and must be unique within the series). Every image in the
chapter folder is a page, ordered by file name: name them `001.webp`, `002.webp`…
`pageAlt` (optional) gives each page its alternative text, keyed by file name; a page without
one gets "<series>, chapitre N, page N". A key that matches no image fails the build.

## Validation

All metadata is checked with zod (`src/lib/content/schema.ts`) when the site builds. Unknown
fields (typos), missing fields, wrong dates, bad tags or missing images make `npm run build`
fail with a message naming the file and the field, for example:

```
✖ content/artworks/broken/artwork.json
  → date: must be a date written YYYY-MM-DD
  → tags[0]: tags must be lowercase kebab-case (e.g. `dark-fantasy`)
```

## TODO(manager)

- `series/ia-mi/series.json` → `synopsis` is a **provisional** text: replace it with your own.
  (JSON has no comments, so the reminder lives here.)
