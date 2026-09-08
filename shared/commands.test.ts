import { describe, expect, test } from 'vitest';
import { run } from './commands';
import { toText } from './render';

const CV_COMMANDS = ['help', 'whoami', 'skills', 'experience', 'contact', 'links'] as const;

describe('command routing', () => {
  test.each(CV_COMMANDS)('%s answers with blocks', (command) => {
    const result = run(command);
    expect(result.ok).toBe(true);
    expect(result.blocks.length).toBeGreaterThan(0);
    expect(toText(result, false)).not.toBe('\n');
  });

  test('empty input falls back to help', () => {
    expect(run('').blocks).toEqual(run('help').blocks);
  });

  test('dispatch is case and whitespace insensitive', () => {
    expect(run('  WhoAmI  ').blocks).toEqual(run('whoami').blocks);
  });

  test('an unknown command is not found and lists the real ones', () => {
    const result = run('deploy');
    expect(result.ok).toBe(false);
    expect(toText(result, false)).toContain('command not found: deploy');
    expect(toText(result, false)).toContain('whoami');
  });
});

/* ADR 0010 states this in prose as the regression test for the allowlist. `in`
   would walk the prototype chain and dispatch on names never meant as commands;
   Object.hasOwn is what stops it. */
describe('ADR 0010: nothing outside the allowlist dispatches', () => {
  test.each(['constructor', 'toString', 'valueOf', '__proto__', 'hasOwnProperty', 'isPrototypeOf'])(
    '%s is an ordinary command not found',
    (name) => {
      const result = run(name);
      expect(result.ok).toBe(false);
      expect(toText(result, false)).toContain('command not found');
    },
  );
});

describe('game verbs without a case open', () => {
  test.each(['look', 'ask gandalf', 'accuse gimli rope cellar', 'n'])(
    '%s asks you to start one',
    (verb) => {
      const result = run(verb, null);
      expect(result.ok).toBe(false);
      expect(toText(result, false)).toContain('No case open');
    },
  );

  test('start issues fresh state, exit clears it', () => {
    const started = run('start');
    expect(started.state).not.toBeNull();
    expect(run('exit', started.state).state).toBeNull();
  });
});
