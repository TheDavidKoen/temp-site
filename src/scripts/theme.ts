/**
 * Light and dark mode. The choice is applied before first paint by the inline
 * script in BaseLayout; this module changes it afterwards and tells the WebGL
 * scenes, which cannot read CSS on their own.
 */
export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';
const CHANGE_EVENT = 'themechange';

const CELL = 28;
const COVER_MS = 340;
const REVEAL_MS = 380;

export const currentTheme = (): Theme =>
  document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';

/** A colour token as the active theme resolves it. */
export const token = (name: string): string =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/** Runs after every change, once the new palette is in place. */
export function onThemeChange(listener: (theme: Theme) => void): void {
  document.addEventListener(CHANGE_EVENT, () => listener(currentTheme()));
}

function apply(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', token('--color-surface'));
  document.dispatchEvent(new Event(CHANGE_EVENT));
}

function shuffled(count: number): Uint32Array {
  const order = new Uint32Array(count);
  for (let i = 0; i < count; i++) order[i] = i;
  for (let i = count - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

/* Floods the viewport with the current ink in random square cells, swaps the
   theme under full cover, then clears the cells in a fresh order. Dark mode
   swaps the two neutrals, so the ink it covers with is the next theme's ground.
   Browsers do not expose page pixels to script, so this dissolves over the page
   rather than resampling it. */
function dissolve(swap: () => void): Promise<void> {
  return new Promise((resolve) => {
    const width = document.documentElement.clientWidth;
    const height = window.innerHeight;
    const ratio = Math.min(window.devicePixelRatio, 2);

    const canvas = document.createElement('canvas');
    canvas.className = 'pixel-dissolve';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.width = Math.ceil(width * ratio);
    canvas.height = Math.ceil(height * ratio);

    const context = canvas.getContext('2d');
    if (!context) {
      swap();
      resolve();
      return;
    }

    document.body.append(canvas);
    context.scale(ratio, ratio);
    context.fillStyle = token('--color-ink');

    const columns = Math.ceil(width / CELL);
    const total = columns * Math.ceil(height / CELL);

    // One pixel of overlap per cell, so a fractional pixel ratio leaves no seams.
    const sweep = (
      order: Uint32Array,
      duration: number,
      draw: (x: number, y: number) => void,
      done: () => void,
    ): void => {
      let drawn = 0;
      let startedAt = 0;

      const step = (now: number): void => {
        if (!startedAt) startedAt = now;
        const due = Math.floor(total * Math.min(1, (now - startedAt) / duration));

        for (; drawn < due; drawn++) {
          const cell = order[drawn];
          draw((cell % columns) * CELL, Math.floor(cell / columns) * CELL);
        }

        if (drawn < total) requestAnimationFrame(step);
        else done();
      };

      requestAnimationFrame(step);
    };

    sweep(
      shuffled(total),
      COVER_MS,
      (x, y) => context.fillRect(x, y, CELL + 1, CELL + 1),
      () => {
        context.fillRect(0, 0, width, height);
        swap();
        sweep(
          shuffled(total),
          REVEAL_MS,
          (x, y) => context.clearRect(x, y, CELL + 1, CELL + 1),
          () => {
            canvas.remove();
            resolve();
          },
        );
      },
    );
  });
}

/** Switches theme, remembers the choice, and dissolves between the palettes. */
export function setTheme(theme: Theme): Promise<void> {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Private browsing can refuse storage; the switch still applies to this visit.
  }

  if (theme === currentTheme()) return Promise.resolve();

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    apply(theme);
    return Promise.resolve();
  }

  return dissolve(() => apply(theme));
}
