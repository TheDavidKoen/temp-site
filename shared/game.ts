/**
 * The deduction game engine. Pure functions over GameState, imported by the
 * Worker only, so the solution is never derivable from anything the page ships.
 */
import type { Block } from './commands';

export interface GameState {
  readonly seed: string;
  readonly room: string;
  readonly asked: Record<string, number>;
  readonly cleared: readonly string[];
  readonly probes: readonly string[];
  readonly notes: readonly string[];
  readonly solved: boolean;
  readonly attempts: number;
}

const SUSPECTS = ['gandalf', 'aragorn', 'legolas', 'gimli', 'boromir', 'galadriel'] as const;
const WEAPONS = ['dagger', 'goblet', 'staff', 'bow', 'rope', 'bust'] as const;
const ROOMS = ['hall', 'library', 'study', 'cellar', 'kitchen', 'garden'] as const;

const EXITS: Record<string, Record<string, string>> = {
  hall: { west: 'library', east: 'study', south: 'kitchen' },
  library: { east: 'hall', south: 'cellar' },
  study: { west: 'hall', south: 'garden' },
  cellar: { north: 'library', east: 'kitchen' },
  kitchen: { north: 'hall', west: 'cellar', east: 'garden' },
  garden: { north: 'study', west: 'kitchen' },
};

const ROOM_NAMES: Record<string, string> = {
  hall: 'the Great Hall',
  library: 'the Library',
  study: 'the Study',
  cellar: 'the Cellar',
  kitchen: 'the Kitchen',
  garden: 'the Garden',
};

const ROOM_DESC: Record<string, string> = {
  hall: 'Long tables, half cleared. The feast ended badly and nobody has left.',
  library: 'Shelves to the ceiling. Something was searched for here, and quickly.',
  study: 'A desk, a cold lamp, and a chair pushed back in a hurry.',
  cellar: 'Colder than the lamp accounts for. Casks in rows, one moved.',
  kitchen: 'Still warm. A pot left boiling long past its purpose.',
  garden: 'Wet ground holds prints, though the rain has been unkind to them.',
};

const WEAPON_NAMES: Record<string, string> = {
  dagger: 'an elven dagger',
  goblet: 'an iron goblet',
  staff: 'an oaken staff',
  bow: 'a hunting bow',
  rope: 'a length of silver rope',
  bust: 'a heavy stone bust',
};

const WEAPON_DESC: Record<string, string> = {
  dagger: 'Keen, and cleaner than anything else at this feast.',
  goblet: 'Dented on one side. Wine, or something close to it, dried in the rim.',
  staff: 'Heavier than it looks. The base is scuffed raw.',
  bow: 'Unstrung. The string is missing entirely.',
  rope: 'Cut, not frayed. Someone was in a hurry.',
  bust: 'Chipped at the brow. It has been moved recently and put back wrong.',
};

const NAMES: Record<string, string> = {
  gandalf: 'Gandalf',
  aragorn: 'Aragorn',
  legolas: 'Legolas',
  gimli: 'Gimli',
  boromir: 'Boromir',
  galadriel: 'Galadriel',
};

const DIRECTIONS: Record<string, string> = {
  n: 'north',
  s: 'south',
  e: 'east',
  w: 'west',
  north: 'north',
  south: 'south',
  east: 'east',
  west: 'west',
};

function rng(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: readonly T[], next: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    const swap = copy[i];
    copy[i] = copy[j];
    copy[j] = swap;
  }
  return copy;
}

interface Case {
  culprit: string;
  weapon: string;
  scene: string;
  holder: Record<string, string>;
  whereSuspect: Record<string, string>;
  whereWeapon: Record<string, string>;
}

function buildCase(seed: string): Case {
  const next = rng(seed);

  const culprit = shuffle(SUSPECTS, next)[0];
  const weapon = shuffle(WEAPONS, next)[0];
  const scene = shuffle(ROOMS, next)[0];

  const spare = [
    ...SUSPECTS.filter((s) => s !== culprit),
    ...WEAPONS.filter((w) => w !== weapon),
    ...ROOMS.filter((r) => r !== scene),
  ];

  const holder: Record<string, string> = {};
  shuffle(spare, next).forEach((card, i) => {
    holder[card] = SUSPECTS[i % SUSPECTS.length];
  });

  const suspectRooms = shuffle(ROOMS, next);
  const weaponRooms = shuffle(ROOMS, next);
  const whereSuspect: Record<string, string> = {};
  const whereWeapon: Record<string, string> = {};
  SUSPECTS.forEach((s, i) => {
    whereSuspect[s] = suspectRooms[i];
  });
  WEAPONS.forEach((w, i) => {
    whereWeapon[w] = weaponRooms[i];
  });

  return { culprit, weapon, scene, holder, whereSuspect, whereWeapon };
}

const label = (card: string): string =>
  NAMES[card] ?? WEAPON_NAMES[card] ?? ROOM_NAMES[card] ?? card;

export function newGame(): GameState {
  return {
    seed: Math.random().toString(36).slice(2, 10),
    room: 'hall',
    asked: {},
    cleared: [],
    probes: [],
    notes: [],
    solved: false,
    attempts: 0,
  };
}

export function opening(): Block[] {
  return [
    { kind: 'text', value: 'THE MATTER OF RADAGAST' },
    { kind: 'blank' },
    { kind: 'text', value: 'Radagast is dead. The feast is over and nobody has left.' },
    { kind: 'text', value: 'You are Detective Slow Roasted. One guest, one weapon, one room.' },
    { kind: 'blank' },
    { kind: 'text', value: 'Name all three and you have it. Six guests, six weapons, six rooms.' },
    { kind: 'blank' },
    {
      kind: 'pair',
      label: 'accuse',
      value: 'scored out of 3. Which three are right is for you to work out',
    },
    { kind: 'pair', label: 'ask', value: 'a guest rules one thing out for certain' },
    {
      kind: 'pair',
      label: 'notes',
      value: 'every accusation, its score, and what is still possible',
    },
    { kind: 'blank' },
    {
      kind: 'text',
      value: 'Nothing is ever a wasted guess. You are in the Great Hall. Type LOOK.',
    },
  ];
}

function describe(state: GameState, file: Case): Block[] {
  const here = state.room;
  const people = SUSPECTS.filter((s) => file.whereSuspect[s] === here);
  const things = WEAPONS.filter((w) => file.whereWeapon[w] === here);
  const ways = Object.keys(EXITS[here]);

  const blocks: Block[] = [
    { kind: 'text', value: ROOM_NAMES[here].toUpperCase() },
    { kind: 'text', value: ROOM_DESC[here] },
    { kind: 'blank' },
  ];

  blocks.push(
    people.length
      ? { kind: 'list', title: 'Here with you', items: people.map((p) => NAMES[p]) }
      : { kind: 'text', value: 'Nobody here.' },
  );
  if (things.length) {
    blocks.push({ kind: 'text', value: 'You can see' });
    for (const weapon of things) {
      blocks.push({ kind: 'pair', label: weapon, value: WEAPON_NAMES[weapon] });
    }
  } else {
    blocks.push({ kind: 'text', value: 'Nothing worth examining.' });
  }
  blocks.push({ kind: 'pair', label: 'exits', value: ways.join(', ') });

  return blocks;
}

function remaining(state: GameState): Block[] {
  const left = (items: readonly string[]) => items.filter((i) => !state.cleared.includes(i));
  return [
    { kind: 'list', title: 'Still possible: who', items: left(SUSPECTS).map((s) => NAMES[s]) },
    {
      kind: 'list',
      title: 'Still possible: what',
      items: left(WEAPONS).map((w) => WEAPON_NAMES[w]),
    },
    {
      kind: 'list',
      title: 'Still possible: where',
      items: left(ROOMS).map((r) => ROOM_NAMES[r]),
    },
    ...(state.probes.length
      ? ([{ kind: 'list', title: 'Accusations so far', items: state.probes }] as Block[])
      : []),
    ...(state.notes.length
      ? ([{ kind: 'list', title: 'Your notes', items: state.notes }] as Block[])
      : []),
  ];
}

function findIn(words: readonly string[], pool: readonly string[]): string | null {
  return words.find((word) => pool.includes(word)) ?? null;
}

const ALL_CARDS: readonly string[] = [...SUSPECTS, ...WEAPONS, ...ROOMS];

export function play(state: GameState, input: string): { blocks: Block[]; state: GameState } {
  const file = buildCase(state.seed);
  const words = input.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const verb = words[0] ?? '';
  const here = state.room;

  if (DIRECTIONS[verb]) {
    const way = DIRECTIONS[verb];
    const target = EXITS[here][way];
    if (!target) {
      return { state, blocks: [{ kind: 'text', value: `You cannot go ${way} from here.` }] };
    }
    const moved = { ...state, room: target };
    return { state: moved, blocks: describe(moved, file) };
  }

  switch (verb) {
    case 'l':
    case 'look':
      return { state, blocks: describe(state, file) };

    case 'x':
    case 'examine': {
      const what = findIn(words.slice(1), WEAPONS);
      if (what === null) {
        return {
          state,
          blocks: [{ kind: 'text', value: 'Examine what? Name a weapon listed in this room.' }],
        };
      }
      if (file.whereWeapon[what] !== here) {
        return { state, blocks: [{ kind: 'text', value: `There is no ${what} in this room.` }] };
      }
      return {
        state,
        blocks: [
          { kind: 'text', value: WEAPON_NAMES[what].toUpperCase() },
          { kind: 'text', value: WEAPON_DESC[what] },
        ],
      };
    }

    case 'ask': {
      const at = words.indexOf('about');
      const before = at > -1 ? words.slice(1, at) : words.slice(1);
      const after = at > -1 ? words.slice(at + 1) : [];

      const who = findIn(before, SUSPECTS);
      if (who === null) {
        return {
          state,
          blocks: [{ kind: 'text', value: 'Ask who? Try ASK GANDALF ABOUT DAGGER.' }],
        };
      }
      if (file.whereSuspect[who] !== here) {
        return { state, blocks: [{ kind: 'text', value: `${NAMES[who]} is not in this room.` }] };
      }

      if (after.length === 0) {
        const hand = Object.keys(file.holder).filter((card) => file.holder[card] === who);
        const seen = state.asked[who] ?? 0;

        if (seen >= hand.length) {
          return {
            state,
            blocks: [
              { kind: 'text', value: `${NAMES[who]} spreads their hands.` },
              { kind: 'text', value: '"I have told you everything I can account for."' },
            ],
          };
        }

        const card = hand[seen];
        return {
          state: {
            ...state,
            asked: { ...state.asked, [who]: seen + 1 },
            cleared: state.cleared.includes(card) ? state.cleared : [...state.cleared, card],
          },
          blocks: [
            { kind: 'text', value: `${NAMES[who]} thinks, then answers.` },
            {
              kind: 'text',
              value: `"I can account for ${card === who ? 'myself' : label(card)}. Rule it out."`,
            },
            {
              kind: 'text',
              value:
                seen + 1 < hand.length ? '(noted, they know more)' : '(noted, that is all of it)',
            },
          ],
        };
      }

      const topic = findIn(after, ALL_CARDS);
      if (topic === null) {
        return {
          state,
          blocks: [{ kind: 'text', value: 'Ask about a guest, a weapon or a room.' }],
        };
      }

      if (file.holder[topic] !== who) {
        return {
          state,
          blocks: [
            { kind: 'text', value: `${NAMES[who]} shakes their head.` },
            { kind: 'text', value: `"I can tell you nothing about ${label(topic)}."` },
          ],
        };
      }

      const already = state.cleared.includes(topic);
      return {
        state: already ? state : { ...state, cleared: [...state.cleared, topic] },
        blocks: [
          { kind: 'text', value: `${NAMES[who]} answers without hesitating.` },
          {
            kind: 'text',
            value: `"I can account for ${topic === who ? 'myself' : label(topic)}. Rule it out."`,
          },
          ...(already ? [] : ([{ kind: 'text', value: '(noted)' }] as Block[])),
        ],
      };
    }

    case 'notes':
    case 'notebook':
      return { state, blocks: remaining(state) };

    case 'note': {
      const line = words.slice(1).join(' ').slice(0, 100);
      if (!line) return { state, blocks: [{ kind: 'text', value: 'Note what?' }] };
      return {
        state: { ...state, notes: [...state.notes, line].slice(-20) },
        blocks: [{ kind: 'text', value: 'Written down.' }],
      };
    }

    case 'accuse': {
      const rest = words.slice(1);
      const who = findIn(rest, SUSPECTS);
      const weapon = findIn(rest, WEAPONS);
      const room = findIn(rest, ROOMS);

      if (!who || !weapon || !room) {
        return {
          state,
          blocks: [
            { kind: 'text', value: 'Name a guest, a weapon and a room. ACCUSE GIMLI ROPE CELLAR.' },
          ],
        };
      }

      const attempts = state.attempts + 1;

      const hits =
        (who === file.culprit ? 1 : 0) +
        (weapon === file.weapon ? 1 : 0) +
        (room === file.scene ? 1 : 0);

      const record = `${who} · ${weapon} · ${room} · ${hits}/3`;
      const probes = [...state.probes, record].slice(-24);

      if (hits < 3) {
        return {
          state: { ...state, attempts, probes },
          blocks: [
            { kind: 'text', value: 'The room goes quiet. Then it goes back to talking.' },
            { kind: 'blank' },
            { kind: 'text', value: `${hits} of 3 correct.` },
          ],
        };
      }

      return {
        state: { ...state, attempts, probes, solved: true },
        blocks: [
          { kind: 'text', value: 'CASE CLOSED' },
          { kind: 'blank' },
          {
            kind: 'text',
            value: `${NAMES[file.culprit]}, with ${WEAPON_NAMES[file.weapon]}, in ${ROOM_NAMES[file.scene]}.`,
          },
          { kind: 'text', value: `Solved in ${attempts} accusation${attempts === 1 ? '' : 's'}.` },
          { kind: 'blank' },
          { kind: 'text', value: 'Type RESTART for a fresh case.' },
        ],
      };
    }

    default:
      return {
        state,
        blocks: [{ kind: 'text', value: `You cannot do that here: ${verb}` }],
      };
  }
}

export const GAME_VERBS = [
  'look',
  'l',
  'x',
  'examine',
  'ask',
  'notes',
  'notebook',
  'note',
  'accuse',
  'n',
  's',
  'e',
  'w',
  'north',
  'south',
  'east',
  'west',
] as const;
