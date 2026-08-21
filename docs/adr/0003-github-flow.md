# 0003 — GitHub Flow, branches deleted after merge

**Status:** Accepted · 2026-08-21

## Context

Solo project, continuously deployed, no release trains.

## Decision

GitHub Flow: `main` always deployable, short-lived `feat/`, `fix/`, `chore/` and
`docs/` branches merged via pull request. Branches are deleted once merged.

## Rationale

The `develop` and `release` layers of heavier models exist to coordinate
versioned releases across teams. Adopting them here would be cargo cult.
Choosing the simpler process for a stated reason is a stronger signal than
choosing the elaborate one.

Merged branches are deleted because a branch is a workspace, not storage. The
commits remain reachable from `main`, and GitHub retains merged pull requests
and their diffs permanently. Stale branches invite work from an outdated base.

## Consequences

- Every change is reviewable as a self-contained diff.
- The pull request trail is the durable record, not the branch list.
- A branch that has already been merged is spent: further work starts a new one,
  because GitHub will not reopen a merged PR for new commits.
