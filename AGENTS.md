# Personal website

Utku Birkan's personal website: a static, single-page CV built with Astro. The goal is a CV that looks good, nothing more — no blog, no client-side framework, no backend.

## Tooling

Bun only — Node is not a supported runtime (`engines` lists only `bun`). The scripts run Astro on Bun via `bunx --bun astro …`; always go through them or `bunx --bun`, never plain `npx`/`node`.

- `bun install` — install dependencies
- `bun run build` — production build to `dist/`; run it to verify changes. After Astro it runs `scripts/build-pdf.ts`, which prints the CV to `dist/utku-birkan-cv.pdf` with headless Chrome (A4, the site's own print styles). Without Chrome it skips the PDF with a warning; CI installs Chrome with `browser-actions/setup-chrome`, passes it as `CHROME_PATH` and sets `REQUIRE_PDF=1`, so a missing PDF fails the deploy. `bun run build:pdf` reruns just that step.
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
| `profile` | `src/content/profile.yaml` | Single entry with id `main`: name, title, location (used in the description and JSON-LD; not shown on the page), `address` (business address lines, shown in the footer), links, `citationName` (bolded in publications) |
| `experience` | `src/content/experience/*.md` | One file per role; bullets are the Markdown body |
| `education` | `src/content/education/*.md` | `honors`/`gpa` render as a second line under the institution, in the same style |
| `publications` | `src/content/publications.yaml` | |
| `skills` | `src/content/skills.yaml` | Groups sorted by `order`. Print only: hidden on screen (`printOnly` on `Section`), where every skill must instead appear in an experience or education bullet |

- Dates are `YYYY-MM` strings, formatted by `src/lib/date.ts` ("Sep 2022"). Omit `end` for a current role ("Present").
- Entries are sorted newest first in the section components.
- Each section has a component in `src/components/sections/` that queries its own collection; `src/pages/index.astro` only orders them.
- Pages: `index.astro` (the CV) and `404.astro`, which Cloudflare Pages serves with a 404 status for any unknown path (without it, every path returned the home page). Both use `src/components/Head.astro`, the shared `<head>` (layer order, viewport, icons, font, `global.css`), passing their own metadata into its slot; import it before any other component. The 404 page is `noindex` and gets no `Seo`.
- `src/components/Footer.astro` closes both pages with gray small print (0.9rem) in three columns: the copyright (2025 to the build year, so it moves on with each deploy); "Built with Astro" and "Source code", one per line; and the business address from `profile.address` in an `<address>`. All three are left-aligned; below 32rem they stack, centred. Its links are gray with a gray underline, without the rubric tint, and turn to `--ink` on hover. `main`'s bottom padding is a modest `--space-l-xl` so the footer isn't followed by a large empty band. The 404 page is one screen tall (`main` is a `100svb` flex column) with its message centred above the footer.
- `src/components/Seo.astro` renders the `<head>` metadata (title, description, Open Graph, theme colours, JSON-LD); `index.astro` builds the description and a schema.org `Person` from `profile`. It also emits the link preview image, `public/og.png` (1200×630: the hero's kicker, name and the domain in EB Garamond on the paper colour, rendered from the site's font files; regenerate it if the name, title or colours change). Canonical, `og:url`, `og:image` and the `Person` url come from `site` in `astro.config.mjs` (`https://utkubirkan.com`).

### Writing CV bullets

- Focus on the technologies used and the impact. Don't name client-internal projects, services or systems.
- Mark each technology with `**…**` on its first mention within an entry. In entry bullets this renders as a neutral gray highlight (`--tint`), not bold, and only while the entry is hovered or focused (always on touch screens, which can't hover); it stays bold elsewhere (e.g. your name in publications).
- Only include numbers that are impressive (e.g. "70% reduction", "over 50,000 lines"); drop plain counts like "five services".
- Describe only shipped work, not unmerged branches.
- Keep the current role concise; it's newer, so fewer bullets than past roles.
- No phone number or other private contact details on the site.

## Styling

The design is a printed book, after [flora.alpacasoft.dev](https://flora.alpacasoft.dev/) ([source](https://github.com/wn-mitch/tikz-flora/tree/main/site)): near-neutral paper and ink with only a trace of warmth (natural white, and charcoal in dark mode; the original cream was too yellow), a burgundy rubric for labels (moved from the original brick red, which leaned orange), EB Garamond throughout (IM Fell English was tried for headings and rejected), small-caps labels (title kicker, dates, skill labels), and dates hanging in the left margin. Take only the design system from it — no ornaments, fleurons, numerals or animations.

- Use Baseline CSS features (check MDN's Baseline banner; it can be more current than other trackers). Non-Baseline features are fine as progressive enhancements: the page must still look correct and work in browsers that ignore them (e.g. `text-wrap: pretty`). Never depend on a non-Baseline feature for layout or content.
- Plain scoped `<style>` in components plus the files in `src/styles/`; no CSS framework. The build inlines all CSS into the page (`build.inlineStylesheets: 'always'`), so the first paint doesn't wait for a stylesheet; fine while it's one page with a few KB of CSS — switch back if pages multiply or the CSS grows past ~14KB compressed.
- Everything is in a cascade layer: `@layer reset, tokens, base, components, utilities;` — later layers win regardless of specificity. The order statement is inlined at the top of `<head>` in `src/components/Head.astro` (and repeated in `src/styles/global.css`, which `Head` imports); keep the two identical. It must come before any stylesheet: layers are ordered by first appearance, and in dev Astro injects component styles in import order, so without it a component imported before `global.css` silently made `components` the weakest layer.
  - `reset`: `reset.css`. `tokens`: `tokens.css` (colors, fonts, measure) and `fluid.css` (space scale). `base`: `base.css` (element defaults, including the centred `main` column). `utilities`: `utilities.css` (`.small-caps`, `.rubric`, `.muted`).
  - Every component wraps its `<style>` contents in `@layer components { … }`. Never leave styles unlayered — unlayered rules beat every layer.
  - New global files get imported into the right layer from `global.css` with `@import './file.css' layer(name);`.
- `src/styles/reset.css` is Josh Comeau's reset verbatim — keep it as published, even though a few of its lines aren't Baseline; they're all progressive enhancements. It zeroes all margins, so don't re-add `margin: 0`.
- Text blocks use `text-box: trim-both cap alphabetic` (set in `base.css` for headings, `p`, `li`, `dt`, `dd`; components add it to their own grid/flex text items). Margins and gaps therefore measure the visible space between letterforms — set them by eye, and keep a clear hierarchy of gaps: lines within a bullet (~0.9em) < bullets (1.5em) < entry header to bullets (`--space-l`) < entries (`--space-xl-2xl`) < sections (`--space-2xl-3xl`). Bullets were once 1.1em apart and read as cramped, especially on mobile.
- Use logical properties and units (`margin-block-start`, `padding-inline`, `inline-size`, `inset-block-start`, `border-block-start`, `text-align: end`, `svb`/`vi`) rather than physical ones (`margin-top`, `width`, `top`, `vh`). Exceptions: width media queries, which have no logical form, and the verbatim reset.
- Spacing comes from the Utopia fluid space scale in `src/styles/fluid.css` (320px → 1240px, 16px → 18px base): `--space-*` and pairs like `--space-s-m` for margins, gaps and padding. Don't hard-code `rem`/`px` spacing; regenerate the file with the calculator link in its header if the scale changes. Font sizes are fixed `rem` values — a fluid type scale was tried and rejected. Use `em` only for values that belong to the text itself (letter-spacing, list indents, gaps between list items).
- Colors are oklch tokens in `tokens.css` (`--paper`, `--ink`, `--muted`, `--rubric`, `--tint`), redefined under `prefers-color-scheme: dark`. Use tokens, never raw colors, and check both themes after visual changes.
- Fonts are self-hosted through Astro's fonts API (`fonts` in `astro.config.mjs`, `<Font />` in `Head.astro`) and used via `--font-body`. EB Garamond includes `latin-ext` for Turkish letters, upright and italic (the publication title, and organisations and locations in print; without the italic files browsers fake it by slanting the roman), and only the upright Latin file is preloaded — it sets the name, the largest contentful paint; preloading every file pushed mobile LCP to 3.2s. It loads weights 400/500/600: body and the hero name 400, section titles 500, entry titles and `<strong>` 600. Keep weight changes restrained; don't go above 600. Restart the dev server after changing the fonts config.
- Book layout: `main` is the `--measure` text column, centred — never add columns that push it off-centre. From `min-width: 74rem`, `TimelineItem`'s grid reaches left into the page margin (negative margin) so dates and location get a `--margin`-wide column `--gutter` from the text; below that they share one line under the institution. Rows use `align-items: baseline`: dates share the title's row and location the institution's, so their baselines match exactly — keep them in the same grid rows rather than positioning them by offset. The breakpoint must leave room for `--margin + --gutter` left of the column.
- Section titles are quiet labels, not big headings: 1.2rem all-small-caps rubric text followed by a faint rubric hairline (rubric at 35% opacity; full-strength was too heavy) on its baseline running to the column edge (never a rule under the label), so the entry titles (1.45rem, 600) lead. The label sits in a `<span>` because `text-box` trim doesn't reach an anonymous flex item. Tried and rejected: large 2.2rem headings (with a rubric rule under, or in initial-capital small caps), and the label with a rubric rule under it.
- `ProfileHeader` is a hero that fills the first screen: its height (`--hero-h`) is `100svb` (the small viewport, so it holds still as mobile toolbars collapse; never `dvh`/`dvb`, which would resize the hero mid-scroll) less main's top padding, the section spacing, the first section label and a gap under it, so on every screen size the first label sits just above the bottom of the viewport and no entry shows (at least 20rem, for short landscape screens). Content is vertically centred; the font sizes are unitless rem variables on the header (`--name-size` etc.), with the name at 7rem / 5rem (≤48rem) / 3.25rem (≤32rem). The name must fit on one line at each step (it's ~4.7em wide in EB Garamond). As a progressive enhancement (`@supports (animation-timeline: scroll())`, screen only, no reduced motion) it stays in place while the content scrolls towards it, shrinking its type, rising towards the top (`--inset-end`) and drawing its lines together via CSS scroll-driven animations — no JavaScript, no header bar. The `<header>` keeps a fixed height and the `.hero` inside is `position: sticky`, so it's released (and scrolls away) when the first section reaches it at the normal section spacing. The shrink ends at that same scroll, so no extra space is left: `--range` ends at the release point, computed from the compact hero's height (`--hero-compact-h`: each line's trimmed height, EB Garamond's 0.65em cap height via the `--cap: 0.65rem` constant, plus the gaps); the sticky hero starts centred in the header using the same formula at full size (`--hero-full-h`). Update both formulas when the hero's sizes, gaps or lines change. The first link under the name, "CV" (screen only), downloads `/utku-birkan-cv.pdf`, the PDF the build prints. The links sit `--name-gap` (`space-xl`) below the name, so they read as a block apart from it, and take `--nav-rows` lines, `--nav-row-gap` (`space-xs`) apart: below 32rem "CV · email" and "LinkedIn · GitHub" share two lines (no dot hangs at a line end) — the dot between them becomes an invisible full-width row break as tall as the gap, with the nav's own row gap dropped (a flex row can't take a negative margin to cancel an extra gap) — and the formulas count the second row and its gap. Don't go back to `1cap` in `@property`-registered properties (Safari passed stale values of them to children), and don't size anything inside the animated elements in `em` (Safari resolves it against the wrong font size mid-animation) — the middle dot is enlarged with `scale` from its baseline instead, which also keeps the nav's height at the links' cap height. The kicker is set as capitals at 70% (`text-transform: uppercase`, sizes × 0.7) rather than `.small-caps`: the font has no small-cap glyphs, so browsers synthesise them, and Safari draws synthesised small caps at whole-pixel sizes, so they grew in visible steps while animating. The animated gaps are `padding-block-end` set only in the keyframes (`--gap` → `--gap-end`): Safari leaves a spacing property at its start value when a normal rule on the element also sets it. Animation longhands are used and `animation-timeline` goes through a custom property, because the minifier turns a nameless `animation` shorthand into `animation: none` and folds `animation-timeline` into the shorthand.
- Icons in `public/`: a "UB" monogram from EB Garamond's outlines (converted to SVG paths, since favicons can't load web fonts) in `--paper` on a rounded `--rubric` tile: `favicon.svg`, `favicon.ico` (16/32/48px fallback) and `apple-touch-icon.png` (180px, square, as iOS rounds it). Regenerate them if the paper or rubric colour changes.
- Print is a first-class target: it's a CV, so people print it or save it as a PDF. `@media print` rules (in `base.css`, `tokens.css`, `utilities.css` and each component) restyle the page after the original printed CV: any paper size (no `@page` size: the reader's A4 or US Letter decides, and the column fills it) with 12/14mm margins and body text at 11pt, the accessibility floor: nothing on paper is smaller than body text, and type is never shrunk to save a page (Safari sets text about 6% larger than Chrome, so it may take a third page; entries break cleanly), black on white whatever the screen theme, name, contact line and business address (one line, from `profile.address`; print only, as the footer shows it on screen) instead of the hero (links print as their addresses, and the CV link is left out), small-caps section headings over a full rule, entries with title and bold dates on one line and organisation and location in italic on the next, tight bullets with bold technologies, skills shown (print only), footer hidden. Text-box trim is off on paper (a trimmed box is shorter than its glyphs, so a block moved to the next page left a sliced ghost of its ascenders behind), so print spacing relies on the leading. Entries and the skills list are kept whole (`break-inside: avoid`), so pages break only between entries or before a section title. Width-based layouts (the margin dates, the phone breakpoints) are `@media screen and …`: Safari can match width queries against the window when printing, which hung the dates off the page. Aim for two pages but never by shrinking text; check with Chrome's `--headless --print-to-pdf` against `bun run preview`.
- Must work on phones down to 320px with no horizontal scroll. The mobile breakpoint is `max-width: 32rem`: headings shrink and skills collapse to one column. Check narrow widths after layout changes.

## Deployment

Cloudflare Pages project `utkubirkan-com`, deployed by direct upload from `.github/workflows/deploy.yml` on every branch push (or manually from the Actions tab):

- `main` deploys to production at https://utkubirkan.com (`main` is the project's production branch; GitHub environment `production`).
- Any other branch deploys a dev preview at `https://<branch>.utkubirkan-com.pages.dev`, with the branch name lowercased and other characters turned into hyphens (GitHub environment `dev`). Use a branch to try changes before merging to `main`.

`public/_headers` sets the security headers for every response (a strict Content Security Policy, frame blocking, HSTS without `includeSubDomains`/`preload`, Permissions-Policy and others) and caches Astro's content-hashed `/_astro/*` files for a year (Pages defaults to 4 hours). The CSP allows only same-origin styles, fonts and images plus inline styles and no scripts at all: anything new that loads from elsewhere, or any `<script>` beyond the JSON-LD data block, needs the policy updated first, and `public/robots.txt` exists because without it Pages answers `/robots.txt` with the home page; it points to `sitemap.xml`, built by `src/pages/sitemap.xml.ts` (the home page only). `_headers` also sends `X-Robots-Tag: noindex` on the `*.pages.dev` addresses so only utkubirkan.com is indexed. `public/.well-known/security.txt` gives the email as the security contact; its `Expires` date (2027-11-01) must be renewed before it passes.

It needs the repository secret `CLOUDFLARE_API_TOKEN` (a token with the Cloudflare Pages: Edit permission) and the repository variable `CLOUDFLARE_ACCOUNT_ID` (not secret).

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
