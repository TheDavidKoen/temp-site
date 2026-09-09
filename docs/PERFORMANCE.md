# Performance budget

Measured on the production build. The measurement tables below are printed by the
budget script, so they are copied rather than remembered:

```sh
pnpm build && pnpm run budget -- --markdown
```

## Budget

| Metric | Budget | Notes |
|---|---|---|
| LCP (mobile, 4G) | <= 2.0 s | The `h1` must never be gated behind an animation |
| INP | <= 200 ms | No scroll hijacking, and no scroll listener that writes more than once per frame |
| CLS | <= 0.05 | Fonts preloaded and self-hosted; media carries dimensions |
| Critical-path JS | <= 50 KB gzip | Excludes the deferred WebGL chunks |
| Deferred WebGL | <= 180 KB gzip | Must stay off the critical path |
| Lighthouse Performance | >= 95 desktop / >= 90 mobile | |

## Current measurements

| Asset | Raw | Gzip |
|---|---|---|
| HTML | 209 KB | **21.2 KB** |
| CSS | 45 KB | **8.6 KB** |
| Page scripts | 5 KB | **2.8 KB** |
| `ghost-scene` (deferred) | 3 KB | **1.2 KB** |
| `chase-scene` (deferred) | 3 KB | **1.7 KB** |
| `three` (deferred) | 521 KB | **129.4 KB** |
| Fonts | 7 x woff2 | self-hosted |
| Total `dist/` | 1069 KB | |

**Critical path: 32.6 KB gzip** against a 50 KB budget.
**Deferred WebGL: 132.3 KB gzip** against a 180 KB budget.

The HTML is large for a single page because two effects are rendered as elements:
the hero glyph field is 1400 spans and `ScrollReveal` emits one span per character.
It gzips to a fifth of its raw size because that markup is almost entirely
repetition.

The Three.js figure depends on the library being imported by name.
`import * as THREE` would defeat tree-shaking and roughly double it.

## Rules that keep the budget

1. **The `h1` is never animated in.** Opacity-zero or transformed text does not
   register as a contentful paint. Overlays animate *out* over content that is
   already painted.
2. **Three.js loads lazily, or not at all.** Both scenes sit behind an
   `IntersectionObserver`, and both are skipped for reduced-motion and low-end
   devices. The ghost is skipped again below 64rem and on coarse pointers.
3. **Render loops stop when off screen.** `IntersectionObserver` plus
   `visibilitychange`. Nothing runs behind a background tab.
4. **No `getBoundingClientRect` in a render loop.** It forces a synchronous
   layout every frame. Geometry is cached on resize; the hero loop reads
   `scrollY`.
5. **Scroll listeners coalesce into `requestAnimationFrame`.** Two exist, both
   passive: the hero's glyph scramble and the ghost's rect cache. Neither writes
   or measures more than once per frame, so scroll cannot outrun paint.
6. **Device pixel ratio is capped at 2.** Uncapped DPR is punishing on retina
   mobile.
7. **No `will-change` on bulk-animated elements.** Promoting ~900 glyphs to
   their own compositor layers costs more than it saves.
8. **Scroll effects are CSS, not JavaScript.** Scroll-driven animations run off
   the main thread and cost no INP. The two listeners above drive decoration,
   never layout or position.

## Known warning

The build prints a Vite warning that the Three.js chunk exceeds 500 KB. That
measures raw size and its suggested remedy, dynamic import, is already in place.
The chunk is separate *because* it is dynamically imported. Safe to ignore, or
silence with `build.chunkSizeWarningLimit`.

## Enforcement

Every pull request runs `pnpm run budget`, which fails the build if the critical
path or the deferred WebGL chunks exceed the figures above. It also asserts that
`animation-timeline` survives as a longhand, see
[ADR 0009](adr/0009-disable-css-minification.md) for why that particular
regression is invisible without a check.

Lighthouse runs on the production build in the same workflow. SEO, accessibility
and best-practices are hard failures; performance and LCP are warnings, because
scores on CI hardware are noisier than the thresholds they would gate.

Lighthouse audits the page at rest, so it never opens the terminal or the stack
sheet. Contrast inside those dialogs is checked by hand against the ceilings in
[ADR 0005](adr/0005-colour-system.md), not by CI.

Run either locally:

```sh
pnpm build && pnpm run budget
pnpm exec lhci autorun
```
