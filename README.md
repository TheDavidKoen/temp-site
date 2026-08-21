# temp-site

Personal site for **David Koen** — Digital Project Manager and Web Developer.

Live: [davidkoen.is-a.dev](https://davidkoen.is-a.dev) *(not yet deployed)*

A hand-built static site, deliberately not a CMS. The repository is part of the
deliverable: the branch history, pull requests and decision records are meant to
be read alongside the rendered page.

## Stack

| Layer | Choice |
|---|---|
| Framework | Astro 7 (static output, islands) |
| Styling | Tailwind CSS v4 via `@tailwindcss/vite` |
| Language | TypeScript, `strict` |
| 3D | Three.js, lazy-loaded island |
| Motion | Native CSS scroll-driven animations |
| Lint + format | Biome |
| Fonts | Astro Fonts API, self-hosted |
| Host | Cloudflare Pages |

Every dependency and service is on a free tier. See [`docs/adr/`](docs/adr) for
why each was chosen.

## Getting started

```sh
pnpm install
pnpm dev
```

The dev server runs at **http://localhost:4321**.

> **Use `localhost`, not `127.0.0.1`.** Astro 7 binds the dev server to IPv6
> (`[::1]`) only. See [Known issues](#known-issues).

## Scripts

| Command | Does |
|---|---|
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build to `dist/` |
| `pnpm preview` | Serve the built output |
| `pnpm check` | Type and template diagnostics (`astro check`) |
| `pnpm lint` | Biome lint + format check |
| `pnpm lint:fix` | Apply Biome's safe fixes |
| `pnpm verify` | `check` then `lint` — run before opening a PR |

## Project structure

```text
src/
├── components/     UI components, one concern each
├── layouts/        BaseLayout: head, fonts, SEO, chrome
├── pages/          Routes (single page)
├── scripts/        Standalone modules loaded dynamically
├── styles/         global.css — design tokens in @theme
└── consts.ts       All site content and configuration
docs/
├── adr/            Architecture decision records
├── ARCHITECTURE.md How the pieces fit
└── PERFORMANCE.md  Budget and measurements
```

**Content lives in `src/consts.ts`, not in components.** Skills, marquee
phrases, the intro word field and the experience narrative are all typed
exports consumed as props. Adding a skill is a data edit.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for branch naming, commit format and the
pre-PR checklist.

## Known issues

**The dev server reports a false failure.** Astro 7 forks the dev server as a
detached daemon, then probes `127.0.0.1` to confirm it started. The server binds
`[::1]` only, so the probe times out and the CLI prints:

```
Dev server process exited before becoming ready.
[ELIFECYCLE] Command failed with exit code 1.
```

The server is running regardless. Confirm with `pnpm exec astro dev status`, and
open `localhost:4321` rather than `127.0.0.1:4321`.

Because the server is detached, `Ctrl+C` does not stop it:

```sh
pnpm exec astro dev status
pnpm exec astro dev logs
pnpm exec astro dev stop
```

**TypeScript is pinned to 6.x.** TypeScript 7 dropped the programmatic API that
`astro check` depends on. See [ADR 0006](docs/adr/0006-pin-typescript-6.md).
