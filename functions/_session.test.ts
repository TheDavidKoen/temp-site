import { describe, expect, test } from 'vitest';
import { run } from '../shared/commands';
import type { GameState } from '../shared/game';
import { decode, encode } from './_session';

const SECRET = 'a-representative-secret-value';
const SUSPECTS = ['gandalf', 'aragorn', 'legolas', 'gimli', 'boromir', 'galadriel'];
const WEAPONS = ['dagger', 'goblet', 'staff', 'bow', 'rope', 'bust'];
const ROOMS = ['hall', 'library', 'study', 'cellar', 'kitchen', 'garden'];

const start = (): GameState => run('start').state as GameState;

describe('signing', () => {
  test('a token round-trips through its own secret', async () => {
    const state = start();
    const recovered = await decode(await encode(state, SECRET), SECRET);
    expect(recovered).toEqual(state);
  });

  test.each([
    ['a different secret', async (token: string) => decode(token, 'not-the-secret')],
    ['a tampered payload', async (token: string) => decode(`X${token.slice(1)}`, SECRET)],
    ['a tampered signature', async (token: string) => decode(`${token.slice(0, -1)}X`, SECRET)],
    ['no separator', async () => decode('garbage', SECRET)],
    ['an empty payload', async () => decode('.abc', SECRET)],
    ['a token over 4096 bytes', async () => decode('a'.repeat(5000), SECRET)],
    ['a non-string', async () => decode(null, SECRET)],
  ])('rejects %s', async (_label, attempt) => {
    expect(await attempt(await encode(start(), SECRET))).toBeNull();
  });
});

/* The whole state travels in a cookie, so the caps in game.ts have to keep the
   worst case under both this decoder's 4096-byte limit and the browser's own.
   Raising a cap without re-checking this silently loses the player's case. */
test('the largest state the engine allows still fits in a cookie', async () => {
  let state = start();
  for (let i = 0; i < 40; i++) {
    const guess = `accuse ${SUSPECTS[i % 6]} ${WEAPONS[(i + 1) % 6]} ${ROOMS[(i + 2) % 6]}`;
    state = run(guess, state).state as GameState;
  }
  for (let i = 0; i < 30; i++) {
    state = run(`note ${'W'.repeat(200)}`, state).state as GameState;
  }
  state = {
    ...state,
    cleared: [...SUSPECTS, ...WEAPONS, ...ROOMS],
    asked: Object.fromEntries(SUSPECTS.map((suspect) => [suspect, 3])),
  };

  const token = await encode(state, SECRET);
  const setCookie = `dk_cli=${token}; HttpOnly; Secure; SameSite=Lax; Path=/api/cli; Max-Age=21600`;

  expect(token.length).toBeLessThan(4096);
  expect(setCookie.length).toBeLessThan(4096);
  expect(await decode(token, SECRET)).not.toBeNull();
});
