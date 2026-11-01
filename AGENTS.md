# Personal website

Utku Birkan's personal website: a static, single-page CV built with Astro. The goal is a CV that looks good, nothing more — no blog, no client-side framework, no backend.

## Tooling

Bun only — Node is not a supported runtime (`engines` lists only `bun`). The scripts run Astro on Bun via `bunx --bun astro …`; always go through them or `bunx --bun`, never plain `npx`/`node`.

- `bun install` — install dependencies
- `bun run build` — production build to `dist/`; run it to verify changes
- `bun run preview` — serve the build locally

## Development

When starting the dev server, use background mode:

```
bunx --bun astro dev --background
```

Manage the background server with `bunx --bun astro dev stop`, `status`, and `logs`.

Restart the dev server after changing `src/content.config.ts`: it keeps serving content data from the old schema (new fields silently missing) while `bun run build` is correct.

## Content

All CV content lives in content collections defined in `src/content.config.ts`; components never hard-code CV text.

| Collection | Source | Notes |
|---|---|---|
| `profile` | `src/content/profile.yaml` | Single entry with id `main`: name, title, location, links, `citationName` (bolded in publications) |
| `experience` | `src/content/experience/*.md` | One file per role; bullets are the Markdown body |
| `education` | `src/content/education/*.md` | `honors`/`gpa` render as a second line under the institution, in the same style |
| `publications` | `src/content/publications.yaml` | |
| `skills` | `src/content/skills.yaml` | Groups sorted by `order`. Print only: hidden on screen (`printOnly` on `Section`), where every skill must instead appear in an experience or education bullet |

- Dates are `YYYY-MM` strings, formatted by `src/lib/date.ts` ("Sep 2022"). Omit `end` for a current role ("Present").
- Entries are sorted newest first in the section components.
- Each section has a component in `src/components/sections/` that queries its own collection; `src/pages/index.astro` only orders them.

### Writing CV bullets

- Focus on the technologies used and the impact. Don't name client-internal projects, services or systems.
- Mark each technology with `**…**` on its first mention within an entry. In entry bullets this renders as a neutral gray highlight (`--tint`), not bold, and only while the entry is hovered or focused (always on touch screens, which can't hover); it stays bold elsewhere (e.g. your name in publications).
- Only include numbers that are impressive (e.g. "70% reduction", "over 50,000 lines"); drop plain counts like "five services".
- Describe only shipped work, not unmerged branches.
- Keep the current role concise; it's newer, so fewer bullets than past roles.
- No phone number or other private contact details on the site.

## Styling

The design is a printed book, after [flora.alpacasoft.dev](https://flora.alpacasoft.dev/) ([source](https://github.com/wn-mitch/tikz-flora/tree/main/site)): warm paper and ink, a brick-red rubric for labels, EB Garamond throughout (IM Fell English was tried for headings and rejected), small-caps labels (title kicker, dates, skill labels), and dates hanging in the left margin. Take only the design system from it — no ornaments, fleurons, numerals or animations.

- Use Baseline CSS features (check MDN's Baseline banner; it can be more current than other trackers). Non-Baseline features are fine as progressive enhancements: the page must still look correct and work in browsers that ignore them (e.g. `text-wrap: pretty`). Never depend on a non-Baseline feature for layout or content.
- Plain scoped `<style>` in components plus the files in `src/styles/`; no CSS framework.
- Everything is in a cascade layer, declared in `src/styles/global.css` (the only stylesheet `BaseLayout` imports): `@layer reset, tokens, base, components, utilities;` — later layers win regardless of specificity.
  - `reset`: `reset.css`. `tokens`: `tokens.css` (colors, fonts, measure) and `fluid.css` (space scale). `base`: `base.css` (element defaults). `utilities`: `utilities.css` (`.small-caps`, `.rubric`, `.muted`).
  - Every component wraps its `<style>` contents in `@layer components { … }`. Never leave styles unlayered — unlayered rules beat every layer.
  - New global files get imported into the right layer from `global.css` with `@import './file.css' layer(name);`.
- `src/styles/reset.css` is Josh Comeau's reset verbatim — keep it as published, even though a few of its lines aren't Baseline; they're all progressive enhancements. It zeroes all margins, so don't re-add `margin: 0`.
- Text blocks use `text-box: trim-both cap alphabetic` (set in `base.css` for headings, `p`, `li`, `dt`, `dd`; components add it to their own grid/flex text items). Margins and gaps therefore measure the visible space between letterforms — set them by eye, and keep the gap between list items larger than the ~0.9em gap between lines.
- Spacing comes from the Utopia fluid space scale in `src/styles/fluid.css` (320px → 1240px, 16px → 18px base): `--space-*` and pairs like `--space-s-m` for margins, gaps and padding. Don't hard-code `rem`/`px` spacing; regenerate the file with the calculator link in its header if the scale changes. Font sizes are fixed `rem` values — a fluid type scale was tried and rejected. Use `em` only for values that belong to the text itself (letter-spacing, list indents, gaps between list items).
- Colors are oklch tokens in `tokens.css` (`--paper`, `--ink`, `--muted`, `--rubric`, `--rule`, `--tint`), redefined under `prefers-color-scheme: dark`. Use tokens, never raw colors, and check both themes after visual changes.
- Fonts are self-hosted through Astro's fonts API (`fonts` in `astro.config.mjs`, `<Font />` in `BaseLayout`) and used via `--font-body`. EB Garamond includes `latin-ext` for Turkish letters and loads weights 400/500/600: body and the hero name 400, section titles 500, entry titles and `<strong>` 600. Keep weight changes restrained; don't go above 600. Restart the dev server after changing the fonts config.
- Book layout: `main` is the `--measure` text column, centred — never add columns that push it off-centre. From `min-width: 74rem`, `TimelineItem`'s grid reaches left into the page margin (negative margin) so dates and location get a `--margin`-wide column `--gutter` from the text; below that they share one line under the institution. Rows use `align-items: baseline`: dates share the title's row and location the institution's, so their baselines match exactly — keep them in the same grid rows rather than positioning them by offset. The breakpoint must leave room for `--margin + --gutter` left of the column.
- Section titles are quiet labels, not big headings: 1.2rem all-small-caps rubric text followed by a neutral `--rule` hairline on its baseline running to the column edge (never a rule under the label), so the entry titles (1.45rem, 600) lead. The label sits in a `<span>` because `text-box` trim doesn't reach an anonymous flex item. Tried and rejected: large 2.2rem headings (with a rubric rule under, or in initial-capital small caps), and the label with a rubric rule under it.
- `ProfileHeader` is a hero: `min-height: min(66svh, 40rem)`, content vertically centred, name at 7rem / 5rem (≤48rem) / 3.25rem (≤32rem). The name must fit on one line at each step (it's ~4.7em wide in EB Garamond).
- Must work on phones down to 320px with no horizontal scroll. The mobile breakpoint is `max-width: 32rem`: headings shrink and skills collapse to one column. Check narrow widths after layout changes.

## Git

- Conventional Commits: `feat:`, `fix:`, `style:`, `refactor:`, `docs:`, `chore:`.
- Only commit when asked.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles](https://docs.astro.build/en/guides/styling/)
