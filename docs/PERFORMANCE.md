# Performance budget

Measured on the production build. Update these figures when they move.

## Budget

| Metric | Budget | Notes |
|---|---|---|
| LCP (mobile, 4G) | ≤ 2.0 s | The `h1` must never be gated behind an animation |
| INP | ≤ 200 ms | No scroll hijacking, no main-thread scroll listeners |
| CLS | ≤ 0.05 | Fonts preloaded and self-hosted; media carries dimensions |
| Critical-path JS | ≤ 50 KB gzip | Excludes the deferred WebGL chunk |
| Deferred WebGL | ≤ 180 KB gzip | Must stay off the critical path |
| Lighthouse Performance | ≥ 95 desktop / ≥ 90 mobile | |

## Current measurements

| Asset | Raw | Gzip |
|---|---|---|
| HTML | 144 KB | **17.0 KB** |
| CSS | 25 KB | **5.6 KB** |
| Hero loader JS | 2 KB | **1.0 KB** |
| `hero-scene` (Three.js) | 512 KB | **126.9 KB** |
| Fonts | 5 × woff2 | self-hosted |
| Total `dist/` | 892 KB | |

**Critical path: ~24 KB gzip** (HTML + CSS + loader). Within the 50 KB budget
with room to spare.

**Deferred WebGL: 126.9 KB gzip** against a 180 KB budget. That figure depends
on Three.js being imported by name — `import * as THREE` would defeat
tree-shaking and roughly double it.

## Rules that keep the budget

1. **The `h1` is never animated in.** Opacity-zero or transformed text does not
   register as a contentful paint. Overlays animate *out* over content that is
   already painted.
2. **Three.js loads lazily, or not at all.** Behind an `IntersectionObserver`,
   skipped entirely for reduced-motion and low-end devices.
3. **The render loop stops when off screen.** `IntersectionObserver` plus
   `visibilitychange`. Nothing runs behind a background tab.
4. **No `getBoundingClientRect` in a render loop.** It forces a synchronous
   layout every frame. Geometry is cached on resize; the loop reads `scrollY`.
5. **Device pixel ratio is capped at 2.** Uncapped DPR is punishing on retina
   mobile.
6. **No `will-change` on bulk-animated elements.** Promoting ~900 glyphs to
   their own compositor layers costs more than it saves.
7. **Scroll effects are CSS, not JavaScript.** Scroll-driven animations run off
   the main thread and cost no INP.

## Known warning

The build prints a Vite warning that `hero-scene` exceeds 500 KB. That measures
raw size and its suggested remedy — dynamic import — is already in place. The
chunk is separate *because* it is dynamically imported. Safe to ignore, or
silence with `build.chunkSizeWarningLimit`.

## Enforcement

Every pull request runs `pnpm run budget`, which fails the build if the
critical path or the deferred WebGL chunk exceeds the figures above. It also
asserts that `animation-timeline` survives as a longhand — see
[ADR 0009](adr/0009-disable-css-minification.md) for why that particular
regression is invisible without a check.

Lighthouse runs on the production build in the same workflow. SEO,
accessibility and best-practices are hard failures; performance and LCP are
warnings, because scores on CI hardware are noisier than the thresholds they
would gate.

Run either locally:

```sh
pnpm build && pnpm run budget
pnpm exec lhci autorun
```
