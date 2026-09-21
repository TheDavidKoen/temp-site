# Security

## Reporting a vulnerability

Report privately through GitHub: the repository's **Security** tab, then **Report a
vulnerability**. Please do not open a public issue.

Only the version deployed from `main` is supported.

## What the application can do

The site is static HTML served from Cloudflare's CDN. The only code that runs on a server is
`/api/cli`, the terminal endpoint, which reads CV content and plays a text game. There are no
accounts, no database and no write operations.

## Protections

| Layer | Protection | Where |
|---|---|---|
| Transport | 30 requests per 10 seconds per client address, per isolate | `functions/api/cli/index.ts` |
| Transport | GET and POST only; input capped at 120 characters | `functions/api/cli/index.ts` |
| Input | Commands resolve against a fixed map; nothing a caller sends is evaluated | `shared/commands.ts` |
| Session | Game state signed with HMAC-SHA256, in an `HttpOnly`, `Secure`, `SameSite=Lax` cookie scoped to `/api/cli`, expiring after six hours | `functions/_session.ts` |
| Responses | `no-store` and `nosniff` on every API response | `functions/api/cli/index.ts` |
| Browser | Content Security Policy that allows inline scripts by hash only, rebuilt on every deploy | `integrations/security-headers.ts` |
| Browser | HSTS, frame denial, strict referrer policy, permissions policy, cross-origin opener isolation | `integrations/security-headers.ts` |
| Secrets | `GAME_SECRET` lives in Cloudflare, with separate values for production and preview | Cloudflare Pages settings |

## Privacy

No analytics, no tracking and no third-party requests: fonts are self-hosted and every asset
comes from this origin. The only cookie is the game session, set once a case is started. The
theme choice is kept in the browser's local storage and never leaves it. The rate limiter holds
a client address in memory for ten seconds and never writes it anywhere.

## Supply chain

- CI installs with `--frozen-lockfile`, runs with a read-only token, does not persist checkout credentials, and fails on high or critical advisories in production dependencies
- Dependency build scripts run only when allowed by name in `pnpm-workspace.yaml`
- GitHub Actions are pinned to commit SHAs, and Dependabot keeps them and the npm dependencies current
- No deploy credential exists in this repository: Cloudflare Pages deploys through its own GitHub integration
