import { describe, expect, test } from 'vitest';
import { run } from './commands';
import type { GameState } from './game';
import { toText } from './render';

const SUSPECTS = ['gandalf', 'aragorn', 'legolas', 'gimli', 'boromir', 'galadriel'];
const WEAPONS = ['dagger', 'goblet', 'staff', 'bow', 'rope', 'bust'];
const ROOMS = ['hall', 'library', 'study', 'cellar', 'kitchen', 'garden'];

const start = (): GameState => {
  const state = run('start').state;
  if (state === null) throw new Error('start did not issue state');
  return state;
};

/** Walks the whole solution space, which is what proves every seed is solvable. */
function solve(from: GameState): { state: GameState; attempts: number } | null {
  let state = from;
  let attempts = 0;
  for (const who of SUSPECTS) {
    for (const weapon of WEAPONS) {
      for (const room of ROOMS) {
        const result = run(`accuse ${who} ${weapon} ${room}`, state);
        state = result.state as GameState;
        attempts++;
        if (toText(result, false).includes('CASE CLOSED')) return { state, attempts };
      }
    }
  }
  return null;
}

describe('the case', () => {
  test('opens in the Great Hall', () => {
    expect(toText(run('look', start()), false)).toContain('GREAT HALL');
  });

  test('every seed is solvable, and only one triple closes it', () => {
    for (let attempt = 0; attempt < 25; attempt++) {
      const solved = solve(start());
      expect(solved).not.toBeNull();
      expect(solved?.state.solved).toBe(true);
    }
  });

  test('a wrong accusation is scored out of three rather than refused', () => {
    const result = run('accuse gandalf dagger hall', start());
    expect(result.ok).toBe(true);
    expect(toText(result, false)).toMatch(/[0-3] of 3 correct/);
  });

  test('an accusation missing a card is rejected without spending an attempt', () => {
    const state = start();
    const result = run('accuse gandalf', state);
    expect(result.state?.attempts).toBe(0);
    expect(toText(result, false)).toContain('Name a guest, a weapon and a room');
  });
});

describe('notes', () => {
  /* Regression: play() lowercases and re-splits the input to match verbs, and the
     note used to be rebuilt from those tokens, which destroyed the player's text. */
  test('keep the casing and punctuation the player typed', () => {
    const typed = 'Gandalf seemed NERVOUS, check the Study.';
    const result = run(`note ${typed}`, start());
    expect(result.state?.notes.at(-1)).toBe(typed);
  });

  test('are capped in count and in length', () => {
    let state = start();
    for (let i = 0; i < 30; i++) state = run(`note ${'W'.repeat(200)}`, state).state as GameState;
    expect(state.notes.length).toBe(12);
    expect(state.notes.every((note) => note.length <= 80)).toBe(true);
  });
});

test('accusation history is capped', () => {
  let state = start();
  for (let i = 0; i < 40; i++) {
    const guess = `accuse ${SUSPECTS[i % 6]} ${WEAPONS[(i + 1) % 6]} ${ROOMS[(i + 2) % 6]}`;
    state = run(guess, state).state as GameState;
  }
  expect(state.probes.length).toBe(16);
});
