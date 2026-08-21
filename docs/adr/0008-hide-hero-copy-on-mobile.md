# 0008 — Hero copy hidden on mobile

**Status:** Accepted, with a known cost · 2026-08-21

## Context

Below 40rem the hero copy block sits over the WebGL scene and was judged too
cluttered. The block contains the eyebrow, the page's only `h1`, the intro
paragraph and both calls to action.

## Decision

`display: none` on `.hero__content` below 40rem. The markup stays in the DOM.

## Cost

Google indexes mobile-first. The mobile viewport now renders no visible `h1`,
and screen reader users on phones lose both the heading and the two calls to
action. Navigation is not lost, since the header nav carries the same anchors.

This directly undercuts the structured data added in the same release.

## Remedies, if revisited

1. Keep only the `h1` on mobile and hide the rest. Cheapest, preserves the
   heading.
2. Move the copy below the pinned hero on mobile rather than hiding it. Needs a
   markup change.
3. Promote another section's heading to `h1` on mobile. Works, but splits the
   heading structure across breakpoints.

Option 1 is recommended.
