/**
 * Gates for work that only matters once it is on screen.
 */
const device = navigator as Navigator & { deviceMemory?: number };

/* Both scenes are hidden below 64rem. Without the width check the Three.js chunk
   would download for an element nobody can see. */
export const canRenderScene = (): boolean =>
  !matchMedia('(prefers-reduced-motion: reduce)').matches &&
  matchMedia('(width >= 64rem)').matches &&
  (device.deviceMemory ?? 8) >= 4 &&
  (device.hardwareConcurrency ?? 8) >= 4;

/** Runs `callback` once, the first time `target` intersects. */
export function onceVisible(
  target: Element,
  callback: () => void,
  options?: IntersectionObserverInit,
): void {
  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    observer.disconnect();
    callback();
  }, options);
  observer.observe(target);
}
