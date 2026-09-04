/**
 * Routes terminal input to either a CV handler or a game verb. Imported by both
 * the Astro build and the Worker, which is what keeps the page and the API in step.
 */
import {
  CONTACT_EMAIL,
  EXPERIENCE_NARRATIVE,
  SITE,
  SKILL_GROUPS,
  SOCIAL_LINKS,
} from '../src/consts';
import { GAME_VERBS, type GameState, newGame, opening, play } from './game';

export type Block =
  | { readonly kind: 'text'; readonly value: string }
  | { readonly kind: 'pair'; readonly label: string; readonly value: string }
  | { readonly kind: 'list'; readonly title: string; readonly items: readonly string[] }
  | { readonly kind: 'blank' };

export interface CommandResult {
  readonly command: string;
  readonly ok: boolean;
  readonly blocks: readonly Block[];
  readonly state: GameState | null;
}

const HANDLERS = {
  help: (): Block[] => [
    { kind: 'text', value: 'About me:' },
    { kind: 'pair', label: 'whoami', value: 'who I am and what I do' },
    { kind: 'pair', label: 'skills', value: 'what I work with' },
    { kind: 'pair', label: 'experience', value: 'how I got here' },
    { kind: 'pair', label: 'contact', value: 'how to reach me' },
    { kind: 'pair', label: 'links', value: 'where else to find me' },
    { kind: 'blank' },
    { kind: 'text', value: 'Or solve a murder:' },
    { kind: 'pair', label: 'start', value: 'open the case of Radagast' },
    { kind: 'pair', label: 'clear', value: 'clear the screen' },
  ],

  whoami: (): Block[] => [
    { kind: 'pair', label: 'name', value: SITE.name },
    { kind: 'pair', label: 'role', value: 'Digital Project Manager & Web Developer' },
    { kind: 'pair', label: 'based', value: SITE.location },
    { kind: 'blank' },
    { kind: 'text', value: SITE.description },
  ],

  skills: (): Block[] =>
    SKILL_GROUPS.map((group) => ({
      kind: 'list' as const,
      title: group.title,
      items: group.items,
    })),

  experience: (): Block[] =>
    EXPERIENCE_NARRATIVE.flatMap((paragraph, i) =>
      i === 0
        ? [{ kind: 'text' as const, value: paragraph }]
        : [{ kind: 'blank' as const }, { kind: 'text' as const, value: paragraph }],
    ),

  contact: (): Block[] => [
    { kind: 'pair', label: 'email', value: CONTACT_EMAIL },
    { kind: 'blank' },
    { kind: 'text', value: 'Open to Digital Project Manager roles.' },
  ],

  links: (): Block[] =>
    SOCIAL_LINKS.map((link) => ({
      kind: 'pair' as const,
      label: link.label.toLowerCase(),
      value: link.href,
    })),
} satisfies Record<string, () => Block[]>;

const COMMANDS = Object.keys(HANDLERS);

const isGameVerb = (verb: string): boolean => (GAME_VERBS as readonly string[]).includes(verb);

export function run(input: string, state: GameState | null = null): CommandResult {
  const trimmed = input.trim();
  const verb = trimmed.toLowerCase().split(/\s+/)[0] ?? '';

  if (verb === '') {
    return { command: '', ok: true, blocks: HANDLERS.help(), state };
  }

  if (verb === 'start' || verb === 'restart') {
    return { command: verb, ok: true, blocks: opening(), state: newGame() };
  }

  if (verb === 'exit' || verb === 'quit') {
    return {
      command: verb,
      ok: true,
      blocks:
        state === null
          ? [{ kind: 'text', value: 'No case open.' }]
          : [
              { kind: 'text', value: 'You close the file and leave the hall.' },
              { kind: 'blank' },
              ...HANDLERS.help(),
            ],
      state: null,
    };
  }

  if (isGameVerb(verb)) {
    if (state === null) {
      return {
        command: verb,
        ok: false,
        blocks: [{ kind: 'text', value: 'No case open. Type start to begin one.' }],
        state,
      };
    }
    const result = play(state, trimmed);
    return { command: verb, ok: true, blocks: result.blocks, state: result.state };
  }

  if (!Object.hasOwn(HANDLERS, verb)) {
    return {
      command: verb,
      ok: false,
      blocks: [
        { kind: 'text', value: `command not found: ${verb}` },
        { kind: 'text', value: `try: ${COMMANDS.join(', ')}, start` },
      ],
      state,
    };
  }

  return {
    command: verb,
    ok: true,
    blocks: HANDLERS[verb as keyof typeof HANDLERS](),
    state,
  };
}
