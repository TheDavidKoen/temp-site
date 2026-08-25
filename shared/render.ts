import type { Block, CommandResult } from './commands';

const ANSI = {
  reset: '\u001b[0m',
  bold: '\u001b[1m',
  dim: '\u001b[2m',
  red: '\u001b[31m',
} as const;

const paint = (code: string, value: string, colour: boolean): string =>
  colour ? `${code}${value}${ANSI.reset}` : value;

function renderBlock(block: Block, colour: boolean): string[] {
  switch (block.kind) {
    case 'blank':
      return [''];
    case 'text':
      return [block.value];
    case 'pair':
      return [`  ${paint(ANSI.red, block.label.padEnd(12), colour)}${block.value}`];
    case 'list':
      return [
        paint(ANSI.bold, block.title, colour),
        ...block.items.map((item) => `  ${paint(ANSI.dim, '·', colour)} ${item}`),
        '',
      ];
  }
}

export function toText(result: CommandResult, colour: boolean): string {
  const body = result.blocks.flatMap((block) => renderBlock(block, colour));
  return `${body.join('\n')}\n`;
}

export function toJson(result: CommandResult): CommandResult {
  return result;
}
