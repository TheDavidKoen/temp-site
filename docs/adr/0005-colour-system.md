# 0005. Light palette with a single signal colour

**Status:** Accepted, amended for the ink surface · 2026-08-21

## Context

A four-value palette was chosen: `#F5F5F5`, `#DFF1F1`, `#BBD5DA`, `#FF0000`.
It contains no dark neutral and one highly saturated accent.

## Decision

Use it as a surface palette, deriving two text inks in the same cool hue, and
constrain the red by contrast.

## Measured contrast, on the page ground

| Pair | Ratio | Permitted use |
|---|---|---|
| `#101A1C` on `#F5F5F5` | 16.2:1 | All text |
| `#3D5457` on `#F5F5F5` | 7.4:1 | Secondary text |
| `#DC0000` on `#F5F5F5` | 4.76:1 | Red text below 24px |
| `#FF0000` on `#F5F5F5` | 3.67:1 | Large text, icons, borders only |
| `#BBD5DA` on `#F5F5F5` | 1.41:1 | Decorative rules only |

## Amendment, 2026-09-08: the ink surface

The table above measures against `#F5F5F5` only, and the rule it produced was
stated as if it were universal. It is not. The terminal and the launcher dock
are painted on `#101A1C`, and there the rule inverts: the token prescribed as
the fix for small text is worse than the one it was meant to correct.

| Pair | Ratio | Verdict |
|---|---|---|
| `#FF0000` on `#101A1C` | 4.43:1 | Fails AA under 24px |
| `#DC0000` on `#101A1C` | 3.41:1 | Worse. Never use it here |
| `#FF4D3D` on `#101A1C` | 5.38:1 | Passes. This is `--color-signal-on-ink` |

`--color-signal-on-ink` is 3.02:1 on the page ground, so the three accents are
not interchangeable. Each belongs to exactly one surface, and using one on the
other surface is always wrong.

Text mixed from `--color-surface` over ink needs 50% or more to clear 4.5:1:

| Mix | Resolves to | Ratio |
|---|---|---|
| 35% | `#606768` | 3.07:1 |
| 38% | `#676D6E` | 3.36:1 |
| 50% | `#838889` | 4.93:1 |
| 55% | `#8E9293` | 5.63:1 |

The terminal's note and its input placeholder shipped at 38% and 35% before this
amendment. Both are now 50%.

Lighthouse audits the page at rest and never opens a dialog, so nothing in CI
catches a regression here. Contrast on the ink surface has to be measured by
hand when it changes.

## Consequences

- `--color-signal` fails AA for body text. `--color-signal-text` exists for
  anything under 24px on the page ground, `--color-signal-on-ink` for anything
  on the ink surface, and all three constraints are commented at the tokens.
- A new surface colour means a new row in this table before any text is put on
  it, not after.
- `#BBD5DA` must never carry a meaningful UI boundary; those need 3:1.
- `#FFFFFF` is available above the page ground, so raised surfaces lift by
  getting brighter rather than by casting shadows.
