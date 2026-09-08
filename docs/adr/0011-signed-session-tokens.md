# 0011. Signed session tokens

**Status:** Accepted · 2026-08-25

## Context

The terminal game needs state across requests: the seed, the room, what has
been ruled out, and how many accusations have been made. The endpoint is a
Pages Function with no database and no server memory.

State therefore lives in the browser and travels with each request. Anything
the browser holds, the browser can edit: attempts could be reset, eliminations
invented, a solved flag set.

## Decision

The state is issued as an opaque token, `payload.signature`, signed with
HMAC-SHA256 using a server-only secret from `env.GAME_SECRET`. Every request
verifies before trusting. A token that fails verification is discarded, not
repaired, and the caller drops back to a fresh terminal.

The envelope carries an issued-at timestamp and expires after six hours.

## Rationale

**Stateless, but not credulous.** Keeping the server memoryless is what makes
the endpoint free to scale and cheap to run. Signing is what makes that safe.
The pattern is the useful half of a JWT without adopting a specification the
use case does not need.

**Verification uses `crypto.subtle.verify`**, not a string comparison. It runs
in constant time, so a forged token cannot be refined by measuring how long
rejection took.

**The solution was never in the token anyway.** It is derived from the seed
server-side on each request, per the engine's design. Signing protects
progress, not the answer.

## Consequences

- `GAME_SECRET` must be set in the Cloudflare project. Without it, game
  commands return a 503 stating the misconfiguration rather than silently
  falling back to unsigned state. The CV commands carry on, because they read
  from `content.ts` and need no key.
- Local development reads it from `.dev.vars`, which is gitignored.
- Rotating the secret invalidates every session in flight. Acceptable: players
  lose a case, not an account.
- Tokens grow with the number of accusations and notes recorded, and the decoder
  rejects anything over 4096 bytes. The caps in `game.ts` were originally set
  without checking that bound: 24 accusations plus 20 notes of 100 characters
  encoded to 4110 bytes, which this decoder refused, silently ending the case.
  They are now 16, 12 and 80, and `_session.test.ts` asserts that the largest
  permitted state encodes under both this limit and the browser cookie limit.
  Raising a cap without that test passing reintroduces the bug.
