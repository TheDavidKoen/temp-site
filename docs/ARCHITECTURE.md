# Architecture

A single static page built by Astro, deployed to Cloudflare Pages. No server,
no database, no CMS.

## Rendering model

Everything renders to HTML at build time. The only JavaScript that ships is:

| Script | Size (gzip) | Loading |
|---|---|---|
| Intro scramble | 0.4 KB | Inline in `<body>` |
| Intro skip flag | ~0.2 KB | Inline in `<head>`, must run before first paint |
| Hero loader | 1.0 KB | Deferred module |
| `hero-scene` (Three.js) | 126.9 KB | Dynamic import behind an `IntersectionObserver` |

The Three.js chunk is never on the critical path. It is fetched only once the
hero is within 200px of the viewport, and not at all when the visitor prefers
reduced motion or the device reports fewer than 4 cores or 4 GB of memory.

## Content flow

`src/consts.ts` is the single source of content. Components receive it as typed
props and never hardcode copy.

```
consts.ts ──> index.astro ──> components
     └──────> Seo.astro (structured data derives from SKILL_GROUPS, SOCIAL_LINKS)
```

`SKILL_GROUPS` feeds both the visible skills grid and the `knowsAbout` array in
the JSON-LD. Editing one updates both.

## Design tokens

`src/styles/global.css` declares every token inside Tailwind's `@theme` block —
colours, the fluid type scale, spacing, container widths, breakpoints and easing
curves. Components consume them as `var(--token)` or as generated utilities.

Two token groups are shared across systems and cannot be changed in isolation:

- **Easing curves** are used by CSS transitions, the intro, and the Three.js
  camera. One definition, three consumers.
- **Colour tokens** are read by the WebGL scene as hex literals in
  `hero-scene.ts`. Changing the palette means changing both.

## Motion

All scroll effects are native CSS scroll-driven animations
(`animation-timeline`), not JavaScript. They run off the main thread and
degrade to static content in browsers without support, via `@supports`.

Two sections pin while their animation plays:

| Section | Height | Mechanism |
|---|---|---|
| Hero | 300vh (220vh mobile) | Sticky stage; Three.js reads `scrollY` |
| Experience | 380vh (300vh mobile) | Sticky stage; named `view-timeline: --exp` |

`PinnedText` declares `--exp`; `ScrollReveal` animates against it. The name is a
contract between the two components — renaming it in one silently disables the
other.

## Accessibility

- Decorative animation layers are `aria-hidden`, with `sr-only` copies carrying
  the real text once (intro field, marquee, scroll reveal).
- `prefers-reduced-motion` is handled twice: a global kill switch in
  `global.css` shortens durations, and each animated component additionally
  sets `animation: none`, because shortening an infinite or scroll-driven
  animation leaves it parked mid-cycle rather than stopping it.
- The intro is skipped entirely under reduced motion — the bundle never runs.

## The API

`functions/api/cli/index.ts` deploys as a Worker alongside the static output.
It is the only route where code executes; everything else is files off the CDN.

The handler is a pure function of its inputs. It reads a command and a signed
session cookie, resolves the command against a fixed map, and returns rendered
text plus a freshly signed cookie. Between requests it holds nothing.

```
browser / curl ──▶ index.ts ──▶ commands.ts ──▶ consts.ts   (CV)
                        │                └──▶ game.ts     (deduction)
                        ├──▶ _session.ts   sign / verify
                        └──▶ render.ts     text or JSON
```

`shared/` is imported by both the Astro build and the Worker, which is what lets
the page and the API render from the same data. `functions/` compiles under its
own tsconfig with Workers types and no DOM lib, and `astro check` skips it — so
CI runs `check:functions` separately. Without that step a broken endpoint passes
every other gate and fails only at the edge.

Game state lives in the client because the server keeps none. That is safe only
because the token is signed; see [ADR 0011](adr/0011-signed-session-tokens.md).
The solution itself is derived from a seed on each request by code that exists
only in `functions/`, so it is never in the token to begin with.

## Known trade-offs

- The hero copy block, including the page's only `h1`, is hidden below 40rem.
  Google indexes mobile-first. See [ADR 0008](adr/0008-hide-hero-copy-on-mobile.md).
- `ScrollReveal` emits one span per character — roughly 900 elements. Word-level
  granularity would cut that by 85% at a coarser visual grain.
