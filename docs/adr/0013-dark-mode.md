# 0013. Dark mode as a swap of the two neutrals

**Status:** Accepted · 2026-09-14

## Context

The site shipped a light palette only. A switch in the bottom-left corner now
changes to a dark one, and three constraints shaped how:

- No flash of the light theme on load for a returning visitor who chose dark.
- Every text pair in dark mode has to clear the thresholds ADR 0005 holds the
  light palette to.
- The two Three.js scenes draw in colour too, and WebGL cannot read CSS.

The control says "dark mode" and "light mode" rather than night and day. Those are
the terms the operating systems, the browsers and `prefers-color-scheme` use.

## Decision

### The palette is a role swap

The dark ground is the light ink, and the dark ink is the light ground. The two
small-text reds trade places the same way. Each of these pairs was already
measured in ADR 0005, so dark mode inherits the measurement rather than repeating
it.

| Token | Light | Dark | Dark ratio |
|---|---|---|---|
| `--color-surface` | `#F5F5F5` | `#101A1C` | the ground |
| `--color-ink` | `#101A1C` | `#F5F5F5` | 16.23:1 on the ground |
| `--color-signal-text` | `#DC0000` | `#FF4D3D` | 5.38:1 on the ground |
| `--color-signal-on-ink` | `#FF4D3D` | `#DC0000` | 4.76:1 on an ink chip |
| `--color-signal` | `#FF0000` | `#FF0000` | 4.43:1, icons and borders only |

Only the in-between surfaces are new, and each was measured before any text went
on it:

| Token | Dark | Pair | Ratio |
|---|---|---|---|
| `--color-ink-muted` | `#A8BCC0` | on the ground | 8.95:1 |
| `--color-surface-raised` | `#17252A` | muted text on it | 7.96:1 |
| `--color-surface-raised` | `#17252A` | signal text on it | 4.78:1 |
| `--color-surface-tint` | `#13282A` | muted text on it | 7.78:1 |
| `--color-surface-tint` | `#13282A` | signal text on it | 4.68:1 |
| `--color-surface-muted` | `#2C4247` | on the ground | 1.67:1, rules only |

Chips painted in ink (the dock, tooltips, the Work note, solid buttons) invert with
the palette and turn light on the dark page, which is what keeps them visible.

### Two surfaces do not swap

The intro curtain and the terminal stay dark in both themes, by pinning the light
palette's values locally. A light curtain would flash before a dark page, and a
terminal is expected to read dark. The terminal's text mixes were measured against
exactly those values in ADR 0005, so pinning keeps that measurement true.

Modal scrims and the dock's hover shadow use a fixed `--color-scrim`. A scrim that
followed ink would brighten a dark page instead of dimming it.

### Applied before paint, light by default

An inline script in `<head>` sets `data-theme` before the first frame. The page
loads in light mode, the palette it was designed in, and only a choice the visitor
has saved overrides that. The system `prefers-color-scheme` setting is
deliberately not followed, so a first visit always sees the light theme.

### The switch dissolves in square cells

The viewport floods with the current ink in random 28px cells, the theme swaps
under full cover, then the cells clear in a fresh order. Because the palette is a
swap, the colour it covers with is the next theme's ground.

Browsers do not expose page pixels to script, so this is a dissolve over the page
rather than a resampling of it. Resampling would mean rasterising the DOM, which
is a dependency and still misses the WebGL canvases. Under reduced motion the
switch is instant.

### The scenes read the tokens

`theme.ts` resolves colour tokens at runtime and fires a `themechange` event after
each swap, and both scenes repaint on it. In dark mode the chase's pacman hunts a
ghost instead of a dot, and the figure that tracks the pointer becomes a pacman.

## Consequences

- The scenes no longer hold hex literals, so the palette has one source.
  `--color-signal` minifies to `red`, which Three.js parses as a named colour.
- A new surface needs a measured row here and in ADR 0005 before text goes on it.
- Lighthouse audits one theme at rest. Dark mode is checked by hand against the
  tables above.
- Every first visit loads in light mode, whatever the system setting. Following
  `prefers-color-scheme` instead is one line in the head script.
