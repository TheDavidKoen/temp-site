# 0009 — Disable CSS minification

**Status:** Accepted · 2026-08-21

## Context

On the first Cloudflare deployment, two features were dead in production while
working locally: the experience scroll reveal never animated, and the hero's
scroll cue never faded. Both are scroll-driven CSS animations. Every
time-based animation on the page still worked.

## Cause

Lightning CSS, which Vite uses to minify CSS, folded the `animation-timeline`
longhand into the `animation` shorthand:

```css
/* source */
animation: char-fly linear both;
animation-timeline: --exp;

/* minified */
animation: linear both char-fly --exp;
```

`animation-timeline` is not a component of the `animation` shorthand, and the
shorthand **resets it to `auto`**. Both animations therefore ran against the
document timeline — which for a scroll-driven animation means never advancing.

The dev server serves unminified CSS, so the bug was invisible until deployment.

## Decision

`build: { cssMinify: false }` in the Vite config.

## Cost

CSS grows from 19 KB to 25 KB raw, **5.0 KB to 5.6 KB gzipped**. 0.6 KB against
a 50 KB critical-path budget.

## Alternatives rejected

- Restructuring the source to avoid the `animation` shorthand. The minifier
  folds longhands into shorthands too, so this only moves the problem.
- Keeping minification and accepting the breakage. Not viable — it disables two
  of the site's three headline interactions.

## Consequences

- Removing this line silently breaks every scroll-driven animation in
  production only. The config carries a comment pointing here.
- Revisit when Lightning CSS stops folding `animation-timeline` into the
  shorthand.
- This class of bug cannot be caught locally. It is the strongest argument for
  reviewing pull requests on their Cloudflare preview URL rather than a dev
  server.
