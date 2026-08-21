# 0005 — Light palette with a single signal colour

**Status:** Accepted · 2026-08-21

## Context

A four-value palette was chosen: `#F5F5F5`, `#DFF1F1`, `#BBD5DA`, `#FF0000`.
It contains no dark neutral and one highly saturated accent.

## Decision

Use it as a surface palette, deriving two text inks in the same cool hue, and
constrain the red by contrast.

## Measured contrast

| Pair | Ratio | Permitted use |
|---|---|---|
| `#101A1C` on `#F5F5F5` | 16.2:1 | All text |
| `#3D5457` on `#F5F5F5` | 7.4:1 | Secondary text |
| `#DC0000` on `#F5F5F5` | 4.76:1 | Red text below 24px |
| `#FF0000` on `#F5F5F5` | 3.67:1 | Large text, icons, borders only |
| `#BBD5DA` on `#F5F5F5` | 1.41:1 | Decorative rules only |

## Consequences

- `--color-signal` fails AA for body text. `--color-signal-text` exists for
  anything under 24px, and the constraint is commented at the token.
- `#BBD5DA` must never carry a meaningful UI boundary; those need 3:1.
- `#FFFFFF` is available above the page ground, so raised surfaces lift by
  getting brighter rather than by casting shadows.
