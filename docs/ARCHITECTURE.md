# Architecture

A single static page built by Astro, deployed to Cloudflare Pages. No server,
no database, no CMS.

## Layout

```
shared/      content and logic imported by both the page and the Worker
src/         the Astro site
functions/   the Cloudflare Pages Function behind /api/cli
scripts/     build-time checks
docs/        this, plus the decision records
```

`shared/` is the leaf. It imports nothing from `src/` or `functions/`, which is
what lets the page and the API render from the same data without dragging Astro
types into a Workers compile.

## Rendering model

Everything renders to HTML at build time. Nine scripts ship, and only the first
two run before paint:

| Script | Size (gzip) | Loading |
|---|---|---|
| Intro skip flag | ~0.2 KB | Inline in `<head>`, must run before first paint |
| Intro scramble | ~0.9 KB | Inline in `<body>` |
| Header nav | ~0.3 KB | Inline module |
| Cursor trail | ~0.6 KB | Inline module |
| Dock | ~0.4 KB | Inline module |
| Chase loader | 0.7 KB | Deferred module |
| Ghost loader | 0.5 KB | Deferred module |
| Terminal | 0.7 KB | Deferred module |
| Stack sheet | 0.2 KB | Deferred module |
| `dialog` + preload helper | 1.0 KB | Deferred, shared by the two dialogs |
| `chase-scene` (Three.js) | 1.7 KB | Dynamic import behind an `IntersectionObserver` |
| `ghost-scene` (Three.js) | 1.2 KB | Dynamic import behind an `IntersectionObserver` |
| `three` | 129.4 KB | Dynamic, shared by both scenes |

The Three.js chunk is never on the critical path. It is fetched only once a scene
is near the viewport, and not at all when the visitor prefers reduced motion or
the device reports fewer than 4 cores or 4 GB of memory. Both scenes share the
one chunk, so the second costs 1.2 KB rather than another 129 KB.

Figures move with the build. `pnpm run budget -- --markdown` prints the current
ones; see [performance.md](performance.md).

## Content flow

`shared/content.ts` is the single source of content. Components receive it as
typed props and never hardcode copy.

```
shared/content.ts ──> index.astro ──> components
        │        └──> Seo.astro (structured data derives from SKILL_GROUPS, SOCIAL_LINKS)
        └────────────> shared/commands.ts ──> functions/api/cli  (terminal, curl)
```

`SKILL_GROUPS` feeds the visible skills grid, the `knowsAbout` array in the
JSON-LD, and the terminal's `skills` command. Editing one updates all three.

`REPO_URL` is the only place the repository is named. The stack sheet builds its
ADR links from it.

## Design tokens

`src/styles/global.css` declares every token inside Tailwind's `@theme` block:
colours, the fluid type scale, spacing, container widths, breakpoints and easing
curves. Components consume them as `var(--token)` or as generated utilities.

Three token groups are shared across systems and cannot be changed in isolation:

- **Easing curves** are used by CSS transitions, the intro, and the Three.js
  camera. One definition, three consumers.
- **Colour tokens** are read by the WebGL scenes as hex literals in
  `chase-scene.ts` and `ghost-scene.ts`. Changing the palette means changing all
  three files.
- **Accent tokens** are split by the surface they sit on. `--color-signal` and
  `--color-signal-text` are measured against the page ground;
  `--color-signal-on-ink` exists because neither clears AA on `--color-ink`. The
  ratios are in [ADR 0005](adr/0005-colour-system.md) and commented at the token.

## Motion

All scroll effects are native CSS scroll-driven animations
(`animation-timeline`), not JavaScript. They run off the main thread and degrade
to static content in browsers without support, via `@supports`.

Two sections pin while their animation plays:

| Section | Height | Mechanism |
|---|---|---|
| Hero | 300vh (hidden below 40rem) | Sticky stage; named `view-timeline: --hero` |
| Experience | 380vh (300vh mobile) | Sticky stage; named `view-timeline: --exp` |

The one exception is the chase beside the introduction. That panel is shorter
than the viewport, so it reads `scrollY` directly and derives progress from its
own pass across the screen rather than from a pinned stage.

`PinnedText` declares `--exp`; `ScrollReveal` animates against it. `Hero`
declares `--hero`; the header reveal in `Header` animates against it. Both names
are contracts between two components. Renaming one silently disables the other.

## Accessibility

- Decorative animation layers are `aria-hidden`, with `sr-only` copies carrying
  the real text once (intro field, marquee, scroll reveal).
- `prefers-reduced-motion` is handled twice: a global kill switch in
  `global.css` shortens durations, and each animated component additionally
  sets `animation: none`, because shortening an infinite or scroll-driven
  animation leaves it parked mid-cycle rather than stopping it.
- The intro is skipped entirely under reduced motion; the bundle never runs.
- Lighthouse only ever sees the page at rest, so the two dialogs are checked by
  hand against the contrast ceilings in ADR 0005.

## The API

`functions/api/cli/index.ts` deploys as a Worker alongside the static output.
It is the only route where code executes; everything else is files off the CDN.

The handler is a pure function of its inputs. It reads a command and a signed
session cookie, resolves the command against a fixed map, and returns rendered
text plus a freshly signed cookie. Between requests it holds nothing.

```
browser / curl ──▶ index.ts ──▶ commands.ts ──▶ content.ts  (CV)
                        │                └──▶ game.ts     (deduction)
                        ├──▶ _session.ts   sign / verify
                        └──▶ render.ts     text
```

`functions/` compiles under its own tsconfig with Workers types and no DOM lib,
and `astro check` skips it, so CI runs `check:functions` separately. Without that
step a broken endpoint passes every other gate and fails only at the edge.

Game state lives in the client because the server keeps none. That is safe only
because the token is signed; see [ADR 0011](adr/0011-signed-session-tokens.md).
The solution itself is derived from a seed on each request by code that exists
only in `game.ts`, so it is never in the token to begin with.

The whole state travels in a cookie, so the retention caps in `game.ts` are load
bearing. At 16 accusations and 12 notes of 80 characters the worst case encodes
to 2615 bytes, inside the decoder's 4096-byte limit. Raising a cap past that
silently loses the player's case.

## Known trade-offs

- `ScrollReveal` emits one span per character, roughly 900 elements. Word-level
  granularity would cut that by 85% at a coarser visual grain.
- The hero is `display: none` below 40rem. It carries no text, so nothing is
  hidden from a crawler or a screen reader; the `h1` sits in the section below it
  at every width. See [ADR 0008](adr/0008-hide-hero-copy-on-mobile.md).
