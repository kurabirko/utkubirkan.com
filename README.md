# utkubirkan.com

Utku Birkan's personal website: a static, single-page CV built with [Astro](https://astro.build) and run on [Bun](https://bun.sh).

| Command | Action |
| :--- | :--- |
| `bun install` | Install dependencies |
| `bun run dev` | Start the dev server at `localhost:4321` |
| `bun run build` | Build the site to `dist/`, including the CV as a PDF (needs Chrome) |
| `bun run preview` | Serve the build locally |

CV content lives in `src/content/`. Pushes to `main` deploy to production on Cloudflare Pages; other branches deploy previews. See [AGENTS.md](AGENTS.md) for the design, content and deployment conventions.
