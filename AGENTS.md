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
| `education` | `src/content/education/*.md` | `honors`/`gpa` render beside the degree title |
| `publications` | `src/content/publications.yaml` | |
| `skills` | `src/content/skills.yaml` | Groups sorted by `order` |

- Dates are `YYYY-MM` strings, formatted by `src/lib/date.ts` ("Sep 2022"). Omit `end` for a current role ("Present").
- Entries are sorted newest first in the section components.
- Each section has a component in `src/components/sections/` that queries its own collection; `src/pages/index.astro` only orders them.

### Writing CV bullets

- Focus on the technologies used and the impact. Don't name client-internal projects, services or systems.
- Bold each technology with `**…**` on its first mention within an entry, matching the PDF CV.
- Only include numbers that are impressive (e.g. "70% reduction", "over 50,000 lines"); drop plain counts like "five services".
- Describe only shipped work, not unmerged branches.
- Keep the current role concise; it's newer, so fewer bullets than past roles.
- No phone number or other private contact details on the site.

## Styling

- Plain scoped `<style>` in components plus `src/styles/global.css`; no CSS framework.
- Colors are tokens on `:root` (`--bg`, `--text`, `--muted`, `--border`, `--accent`), redefined under `prefers-color-scheme: dark`. Use tokens, never raw colors.
- Must work on phones down to 320px with no horizontal scroll. The mobile breakpoint is `max-width: 32rem`: `TimelineItem` stacks title / organization / dates + location, and skills collapse to one column. Check narrow widths after layout changes.

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
