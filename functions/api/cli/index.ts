/* cli/index.ts, not cli.ts: in Pages Functions the file path is the public URL.
   Both spellings serve /api/cli, but the directory form keeps the filename free
   to change without moving an endpoint that is published on a CV. */
import { run } from '../../../shared/commands';
import { toJson, toText } from '../../../shared/render';
import { decode, encode } from '../../_session';

interface Env {
  GAME_SECRET?: string;
}

const MAX_INPUT = 120;
const COOKIE = 'dk_cli';
const COOKIE_TTL = 6 * 60 * 60;

const WINDOW_MS = 10_000;
const MAX_HITS = 30;

/* Held in the isolate rather than a binding: Pages Functions cannot bind
   Cloudflare's rate limiter, and WAF rules are zone level — the is-a.dev zone
   is not ours. See ADR 0012.
   This is a speed bump, not a wall. Isolates are per-datacentre and recycled,
   so it stops one client hammering one colo and nothing more. Proportionate:
   the endpoint writes nothing, and exhausting the free tier only pauses this
   route while the static site keeps serving. */
const hits = new Map<string, { count: number; resets: number }>();

function overLimit(caller: string, now: number): boolean {
  const seen = hits.get(caller);

  if (!seen || now > seen.resets) {
    // Sweep on write so an idle isolate cannot accumulate stale keys.
    if (hits.size > 5_000) {
      for (const [key, value] of hits) if (now > value.resets) hits.delete(key);
    }
    hits.set(caller, { count: 1, resets: now + WINDOW_MS });
    return false;
  }

  seen.count += 1;
  return seen.count > MAX_HITS;
}

/* Terminal clients get ANSI text; everything else gets JSON. Kept to a short
   allowlist rather than sniffing broadly, so a browser never receives escape
   codes it will render as literal garbage. */
const TEXT_CLIENTS = /^(curl|wget|httpie|powershell)/i;

const BASE_HEADERS = {
  'cache-control': 'no-store',
  'x-content-type-options': 'nosniff',
};

function readCookie(header: string | null): string | null {
  if (!header) return null;
  for (const part of header.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === COOKIE) return rest.join('=');
  }
  return null;
}

/* HttpOnly so page scripts cannot read it, and scoped to this path so it is
   never sent with a request for the site itself. Carrying the session in a
   cookie is also what makes the game playable over curl -c jar -b jar. */
const setCookie = (token: string | null): string =>
  token === null
    ? `${COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/api/cli; Max-Age=0`
    : `${COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/api/cli; Max-Age=${COOKIE_TTL}`;

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  if (request.method !== 'GET' && request.method !== 'POST') {
    return new Response('method not allowed\n', { status: 405 });
  }

  const caller = request.headers.get('cf-connecting-ip') ?? 'unknown';
  if (overLimit(caller, Date.now())) {
    return new Response('slow down\n', {
      status: 429,
      headers: {
        ...BASE_HEADERS,
        'content-type': 'text/plain; charset=utf-8',
        'retry-after': '10',
      },
    });
  }

  const secret = env.GAME_SECRET;
  const url = new URL(request.url);
  const wantsJson = request.method === 'POST';

  let input = '';
  if (request.method === 'POST') {
    const body = (await request.json().catch(() => null)) as { command?: unknown } | null;
    input = typeof body?.command === 'string' ? body.command.slice(0, MAX_INPUT) : '';
  } else {
    input = url.searchParams.get('cmd')?.slice(0, MAX_INPUT) ?? '';
  }

  /* Only the game needs the secret — it signs the session. CV commands read
     from consts.ts and need nothing, so a deployment missing the secret loses
     the case rather than the whole endpoint.
     An unverifiable cookie is discarded rather than trusted, so a tampered
     token drops the caller back to a fresh terminal, not a forged game. */
  const state = secret ? await decode(readCookie(request.headers.get('cookie')), secret) : null;

  let result = run(input, state);
  let status = result.ok ? 200 : 404;

  if (!secret && result.state !== null) {
    result = {
      command: result.command,
      ok: false,
      blocks: [{ kind: 'text', value: 'The case is unavailable: this deployment has no key.' }],
      state: null,
    };
    status = 503;
  }

  const token = secret && result.state !== null ? await encode(result.state, secret) : null;

  const headers: Record<string, string> = {
    ...BASE_HEADERS,
    'set-cookie': setCookie(token),
  };

  if (wantsJson) {
    return new Response(
      JSON.stringify({ ok: result.ok, text: toText(result, false), playing: token !== null }),
      { status, headers: { ...headers, 'content-type': 'application/json; charset=utf-8' } },
    );
  }

  const agent = request.headers.get('user-agent') ?? '';
  const accept = request.headers.get('accept') ?? '';
  const wantsText = TEXT_CLIENTS.test(agent) && !accept.includes('application/json');

  return wantsText
    ? new Response(toText(result, true), {
        status,
        headers: { ...headers, 'content-type': 'text/plain; charset=utf-8' },
      })
    : new Response(JSON.stringify(toJson(result), null, 2), {
        status,
        headers: { ...headers, 'content-type': 'application/json; charset=utf-8' },
      });
};
