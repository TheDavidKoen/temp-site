# 0008 — Hero copy moved out of the pinned stage

**Status:** Superseded by this record's own revision · 2026-08-21

## Original decision

`display: none` on `.hero__content` below 40rem, to stop the copy block sitting
over the WebGL scene on narrow viewports. The markup stayed in the DOM.

That carried a known cost: Google indexes mobile-first, so the mobile viewport
rendered no visible `h1`, and screen reader users on phones lost the heading and
both calls to action.

## What replaced it

The copy block was removed from the pinned hero entirely, at every viewport, and
now renders as an ordinary section immediately below it.

## Why

The visual goal was a clean 3D hero with nothing overlaying the scene. Hiding
the block achieved that only on mobile, and did so by suppressing the page's
only `h1`.

Moving it achieves the same visual result at every width, and the `h1` stays in
the rendered document — so the SEO and accessibility cost disappears rather than
being accepted.

## Consequences

- `Hero.astro` no longer takes a slot; it renders the canvas and the scroll cue.
  It imports nothing.
- The page opens on the scene, then reveals the headline as you scroll past it.
- The breakpoint-specific `display: none` is gone, so there is no longer a
  viewport at which content is present but unrendered.
