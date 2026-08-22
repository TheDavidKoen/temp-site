# temp-site

Personal site for **David Koen** — Digital Project Manager and Web Developer.

Live: **[davidkoen.is-a.dev](https://davidkoen.is-a.dev)**

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
| `pnpm budget` | Assert the performance budget against `dist/` |

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

## Continuous integration

Every pull request into `main` runs [`.github/workflows/ci.yml`](.github/workflows/ci.yml):

| Job | Does |
|---|---|
| `verify` | `astro check`, Biome, production build, performance budget |
| `lighthouse` | Audits the built output, three runs, desktop preset |

The budget step enforces [`docs/PERFORMANCE.md`](docs/PERFORMANCE.md) and
guards a regression that is otherwise invisible — a minifier folding
`animation-timeline` into the `animation` shorthand disables every
scroll-driven animation while the page still builds and renders.

## Deployment

Cloudflare Pages, built from `main` on every push. Pull requests get their own
preview URL.

| Setting | Value |
|---|---|
| Framework preset | Astro |
| Build command | `pnpm build` |
| Output directory | `dist` |
| Node version | `.node-version` (22.14.0) |

The Node version is pinned in `.node-version` because Astro 7 requires
`>=22.12.0` and Cloudflare's default build image ships an older release. The
package manager is detected from `pnpm-lock.yaml`.

The domain is a free `is-a.dev` subdomain, registered by pull request against
[is-a-dev/register](https://github.com/is-a-dev/register). Cloudflare Pages was
chosen over Workers Static Assets because Workers cannot serve a custom domain on
a zone this account does not own. See
[ADR 0002](docs/adr/0002-cloudflare-pages-over-workers.md).

**Attaching that domain cannot be done from the Cloudflare dashboard.** `is-a.dev`
is on the [Public Suffix List](https://publicsuffix.org/), so the dashboard treats
the subdomain as a registrable domain in its own right and demands a zone transfer
that is impossible — the zone belongs to is-a.dev. It has to be added through the
Pages API instead:

```sh
curl -X POST "https://api.cloudflare.com/client/v4/accounts/<account-id>/pages/projects/<project>/domains"   -H "Authorization: Bearer <token>"   -H "Content-Type: application/json"   -d '{"name":"davidkoen.is-a.dev"}'
```

The token needs only **Account → Cloudflare Pages → Edit**. is-a.dev also provide
a form at [cf-pages.is-a.dev](https://cf-pages.is-a.dev) that wraps the same call.

## Known issues

**The dev server binds IPv6 only.** It listens on `[::1]:4321`; requests to
`127.0.0.1:4321` are refused. Use `localhost`.

**The dev server is detached.** Astro 7 forks it as a background process, so the
terminal returns immediately and `Ctrl+C` does not stop it:

```sh
pnpm exec astro dev status
pnpm exec astro dev logs
pnpm exec astro dev stop
```

**TypeScript is pinned to 6.x.** TypeScript 7 dropped the programmatic API that
`astro check` depends on. See [ADR 0006](docs/adr/0006-pin-typescript-6.md).
