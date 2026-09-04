/**
 * The ghost that tracks the pointer in the contact section.
 */
import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  LineBasicMaterial,
  LineSegments,
  MathUtils,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three';

const HALF_W = 1;
const DOME_Y = 0.55;
const SKIRT_Y = -1.15;
const DEPTH = 0.6;
const ARC_STEPS = 44;
const SKIRT_WAVES = 4;
const SKIRT_STEPS = 56;
const SKIRT_AMP = 0.17;
const RIB_EVERY = 7;
const BOB = 0.07;

const TOP = DOME_Y + HALF_W;
const BOTTOM = SKIRT_Y - SKIRT_AMP;
const CENTRE_Y = (TOP + BOTTOM) / 2;
const HALF_H = (TOP - BOTTOM) / 2;

const REACH = Math.hypot(HALF_W + DEPTH / 2, HALF_H) + BOB + 0.18;

const INK = new Color(0x101a1c);
const SIGNAL = new Color(0xff0000);

type Point = [number, number];

function outline(): Point[] {
  const points: Point[] = [];

  for (let i = 0; i <= ARC_STEPS; i++) {
    const angle = Math.PI - (i / ARC_STEPS) * Math.PI;
    points.push([Math.cos(angle) * HALF_W, DOME_Y + Math.sin(angle) * HALF_W]);
  }

  points.push([HALF_W, SKIRT_Y]);

  for (let i = 1; i <= SKIRT_STEPS; i++) {
    const t = i / SKIRT_STEPS;
    points.push([
      HALF_W - t * HALF_W * 2,
      SKIRT_Y + Math.sin(t * Math.PI * SKIRT_WAVES) * SKIRT_AMP,
    ]);
  }

  return points;
}

function bodyGeometry(): BufferGeometry {
  const points = outline();
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

  const ghost = new Group();
  scene.add(ghost);

  const shape = new Group();
  shape.position.y = -CENTRE_Y;
  ghost.add(shape);

  shape.add(new LineSegments(bodyGeometry(), new LineBasicMaterial({ color: INK })));

  const eyes = new Group();
  eyes.position.z = DEPTH / 2 + 0.02;
  shape.add(eyes);

  for (const side of [-1, 1]) {
    const socket = new LineSegments(ringGeometry(0.24), new LineBasicMaterial({ color: INK }));
    socket.position.set(side * 0.36, 0.62, 0);
    eyes.add(socket);

    const pupil = new LineSegments(ringGeometry(0.09), new LineBasicMaterial({ color: SIGNAL }));
    pupil.position.set(side * 0.36, 0.62, 0.01);
    eyes.add(pupil);
  }

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

    ghost.position.y = Math.sin(clock * 1.4) * BOB;
    ghost.rotation.y = MathUtils.lerp(ghost.rotation.y, pointer.x * 0.55, 0.06);
    ghost.rotation.x = MathUtils.lerp(ghost.rotation.x, pointer.y * 0.32, 0.06);
    ghost.rotation.z = Math.sin(clock * 0.9) * 0.04;

    eyes.position.x = MathUtils.lerp(eyes.position.x, pointer.x * 0.08, 0.1);
    eyes.position.y = MathUtils.lerp(eyes.position.y, -pointer.y * 0.06, 0.1);

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
  window.addEventListener(
    'scroll',
    () => {
      rect = canvas.getBoundingClientRect();
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
