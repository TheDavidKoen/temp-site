# Contributing

## Branching

`main` is always deployable. Work happens on short-lived branches merged via
pull request. Pull requests are squash merged, so the pull request title becomes the commit
subject and must follow the commit format below.

| Prefix | For |
|---|---|
| `feat/` | New behaviour or content |
| `fix/` | Correcting broken behaviour |
| `chore/` | Tooling, dependencies, config |
| `docs/` | Documentation only |
| `content/` | Copy and CV content in `shared/content.ts` |
| `refactor/` | Restructuring with no behaviour change |

Branches are deleted once merged, see
[ADR 0003](docs/adr/0003-github-flow.md). A merged branch is spent: GitHub will
not reopen its pull request for new commits, so further work starts a fresh
branch off `main`.

Always pull after switching:

```sh
git checkout main
git pull
git checkout -b feat/thing
```

## Commits

[Conventional Commits](https://www.conventionalcommits.org/). One short subject in the
imperative, under about 70 characters, naming the kind of change rather than listing every edit.
Authorship is visible on GitHub, so no author or co-author lines.

```
feat: add a project to the work section
docs: update the documentation
```

## Before opening a pull request

```sh
pnpm verify
```

That runs the type checks, Biome, the production build and the performance budget. All must be
clean. CI runs the same steps, then a dependency audit and Lighthouse, so a red check means one
of them failed. Reproduce it locally rather than pushing again to see.

Then check, by eye:

- The page at a narrow width, a laptop width, and something ultrawide
- Both pinned sections scrolling smoothly
- Anything animated with reduced motion enabled in OS settings

## Code conventions

**Content goes in `shared/content.ts`,** not in components. Components import
it, so adding a skill, a phrase or a project is a data edit, and the terminal
picks it up for free because it reads the same module.

**`shared/` imports nothing from `src/` or `functions/`.** It is the leaf both
sides depend on. Reversing that arrow drags Astro types into a Workers compile.

**Design tokens go in `@theme`** in `src/styles/global.css`. No raw hex values
or magic numbers in components.

**Comments mark traps, not intentions.** Write one only where a developer could
break something without it: a cross-file contract, a load-bearing value, a
non-obvious constraint. Rationale belongs in an ADR. Prefer expressive naming
over a comment.

Good:

```css
/* Clip lives on the sticky element itself, never an ancestor. Overflow on an
   ancestor would cancel the stickiness. */
```

Not worth writing:

```css
/* Palette derived from the CV so both documents read as one identity. */
```

**Animated components handle `prefers-reduced-motion` themselves.** The global
kill switch only shortens durations, which parks an infinite or scroll-driven
animation mid-cycle instead of stopping it.

**Contrast on a new surface gets measured before text goes on it.** The ratios
live in [ADR 0005](docs/adr/0005-colour-system.md). Lighthouse only ever sees the
page at rest, so it cannot catch a regression inside a dialog.

## Recording a decision

Anything a future reader would otherwise reverse by accident gets an ADR in
`docs/adr/`, numbered in sequence, following the existing format. Superseded
records stay in place with their status changed.
