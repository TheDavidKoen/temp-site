const FILES = import.meta.glob<string>('../assets/work/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
});

/* Each project has a mark and a wordmark cut from one lockup, so the two share a
   vertical range. */
export function workLogo(slug: string): { mark: string; word: string } {
  const mark = FILES[`../assets/work/${slug}-mark.svg`];
  const word = FILES[`../assets/work/${slug}-word.svg`];
  if (!mark || !word) throw new Error(`Missing logo files for ${slug}`);
  return { mark, word };
}
