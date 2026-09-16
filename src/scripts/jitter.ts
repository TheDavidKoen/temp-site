/** Deterministic noise between 0 and 1, so a scatter lands the same way on every build and every frame. */
export const jitter = (i: number, seed: number): number => {
  const n = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  return n - Math.floor(n);
};
