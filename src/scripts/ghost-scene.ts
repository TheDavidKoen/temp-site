/**
 * The figure that tracks the pointer in the contact section: a ghost in light
 * mode and a pacman in dark mode.
 */
import {
  BufferGeometry,
  Float32BufferAttribute,
  Group,
  LineBasicMaterial,
  LineSegments,
  MathUtils,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three';
import { createPacman, ghostOutline } from './figures';
import { currentTheme, onThemeChange, token } from './theme';

const GHOST = {
  halfWidth: 1,
  domeY: 0.55,
  skirtY: -1.15,
  waves: 4,
  amplitude: 0.17,
  arcSteps: 44,
  skirtSteps: 56,
} as const;

const DEPTH = 0.6;
const RIB_EVERY = 7;
const BOB = 0.07;
const PACMAN_RADIUS = 1.3;

const TOP = GHOST.domeY + GHOST.halfWidth;
const BOTTOM = GHOST.skirtY - GHOST.amplitude;
const CENTRE_Y = (TOP + BOTTOM) / 2;
const HALF_H = (TOP - BOTTOM) / 2;

/* Fitted to the ghost, the larger of the two figures, so switching theme never
   changes the framing. */
const REACH = Math.hypot(GHOST.halfWidth + DEPTH / 2, HALF_H) + BOB + 0.18;

function bodyGeometry(): BufferGeometry {
  const points = ghostOutline(GHOST);
  const front = DEPTH / 2;
  const back = -DEPTH / 2;
  const positions: number[] = [];

  for (let i = 0; i < points.length; i++) {
    const [ax, ay] = points[i];
    const [bx, by] = points[(i + 1) % points.length];

    positions.push(ax, ay, front, bx, by, front);
    positions.push(ax, ay, back, bx, by, back);
    if (i % RIB_EVERY === 0) positions.push(ax, ay, front, ax, ay, back);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  return geometry;
}

function ringGeometry(radius: number, steps = 28): BufferGeometry {
  const positions: number[] = [];

  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const b = ((i + 1) / steps) * Math.PI * 2;
    positions.push(Math.cos(a) * radius, Math.sin(a) * radius, 0);
    positions.push(Math.cos(b) * radius, Math.sin(b) * radius, 0);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  return geometry;
}

export function initGhostScene(canvas: HTMLCanvasElement): void {
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new Scene();
  const camera = new PerspectiveCamera(38, 1, 0.1, 100);

  // Both figures hang off one group, so they share the bob and the pointer tilt.
  const figure = new Group();
  scene.add(figure);

  const inkLines = new LineBasicMaterial();
  const signalLines = new LineBasicMaterial();

  const ghost = new Group();
  ghost.position.y = -CENTRE_Y;
  ghost.add(new LineSegments(bodyGeometry(), inkLines));
  figure.add(ghost);

  const eyes = new Group();
  eyes.position.z = DEPTH / 2 + 0.02;
  ghost.add(eyes);

  for (const side of [-1, 1]) {
    const socket = new LineSegments(ringGeometry(0.24), inkLines);
    socket.position.set(side * 0.36, 0.62, 0);
    eyes.add(socket);

    const pupil = new LineSegments(ringGeometry(0.09), signalLines);
    pupil.position.set(side * 0.36, 0.62, 0.01);
    eyes.add(pupil);
  }

  const pacman = createPacman(PACMAN_RADIUS, DEPTH);
  const hunter = new Group();
  hunter.add(pacman.lines);

  const pacmanEye = new LineSegments(ringGeometry(0.13), signalLines);
  pacmanEye.position.set(0.2, 0.7, DEPTH / 2 + 0.02);
  hunter.add(pacmanEye);
  figure.add(hunter);

  /* Colours come from the tokens and are read again on every theme change,
     so the scene can never drift from the palette. */
  const paint = (): void => {
    const ink = token('--color-ink');
    inkLines.color.set(ink);
    pacman.material.color.set(ink);
    signalLines.color.set(token('--color-signal'));

    const dark = currentTheme() === 'dark';
    ghost.visible = !dark;
    hunter.visible = dark;
  };

  paint();
  onThemeChange(paint);

  let rect = canvas.getBoundingClientRect();
  const pointer = { x: 0, y: 0 };

  const resize = (): void => {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const halfFov = Math.tan(MathUtils.degToRad(camera.fov) / 2);
    camera.position.z = REACH / Math.min(halfFov, halfFov * camera.aspect);
    camera.updateProjectionMatrix();
    rect = canvas.getBoundingClientRect();
  };

  const onPointerMove = (event: PointerEvent): void => {
    pointer.x = MathUtils.clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -2, 2);
    pointer.y = MathUtils.clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -2, 2);
  };

  let frame = 0;
  let running = false;
  let clock = 0;

  const tick = (now: number): void => {
    frame = requestAnimationFrame(tick);
    clock = now / 1000;

    figure.position.y = Math.sin(clock * 1.4) * BOB;
    figure.rotation.y = MathUtils.lerp(figure.rotation.y, pointer.x * 0.55, 0.06);
    figure.rotation.x = MathUtils.lerp(figure.rotation.x, pointer.y * 0.32, 0.06);
    figure.rotation.z = Math.sin(clock * 0.9) * 0.04;

    if (hunter.visible) {
      pacman.draw(0.08 + Math.abs(Math.sin(clock * 7)) * 0.5);
    } else {
      eyes.position.x = MathUtils.lerp(eyes.position.x, pointer.x * 0.08, 0.1);
      eyes.position.y = MathUtils.lerp(eyes.position.y, -pointer.y * 0.06, 0.1);
    }

    renderer.render(scene, camera);
  };

  const start = (): void => {
    if (running) return;
    running = true;
    frame = requestAnimationFrame(tick);
  };

  const stop = (): void => {
    if (!running) return;
    running = false;
    cancelAnimationFrame(frame);
  };

  resize();
  new ResizeObserver(resize).observe(canvas);
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  /* Coalesced to one read per frame: scroll can fire several times a frame and
     getBoundingClientRect forces a synchronous layout on every call. */
  let rectPending = false;
  window.addEventListener(
    'scroll',
    () => {
      if (rectPending) return;
      rectPending = true;
      requestAnimationFrame(() => {
        rect = canvas.getBoundingClientRect();
        rectPending = false;
      });
    },
    { passive: true },
  );

  new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) start();
    else stop();
  }).observe(canvas);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });

  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    stop();
  });
}
