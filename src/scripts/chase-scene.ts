/**
 * The chase beside the introduction. Scroll position drives it; nothing is on a
 * timer, so it holds still when the page does. The pacman chases a dot in light
 * mode and a ghost in dark mode.
 */
import {
  CircleGeometry,
  CurvePath,
  Group,
  InstancedMesh,
  LineCurve3,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  OrthographicCamera,
  Scene,
  Shape,
  ShapeGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { createPacman, ghostOutline } from './figures';
import { currentTheme, onThemeChange, token } from './theme';

const RADIUS = 0.62;
const DEPTH = 0.5;

const BALL_R = 0.13;

/* Sized so the ghost still clears the mouth at the tightest point: the route
   keeps pacman and quarry at least 1.33 apart, and the two together span about
   0.92. */
const QUARRY = {
  halfWidth: 0.22,
  domeY: 0.05,
  skirtY: -0.22,
  waves: 3,
  amplitude: 0.05,
  arcSteps: 18,
  skirtSteps: 18,
} as const;
const EYE_X = 0.09;
const EYE_Y = 0.04;
const LOOK = 0.025;

const DOTS = 64;
const DOT_R = 0.04;
const TRAIL_GAP = 0.028;

const CHASE_END = 0.82;

/* FOLLOW is how fast the chase catches up with the scroll; MAX_RATE is the most
   of the route it may cover per second. Reading scrollY directly moved the
   pacman up to 123px in a single frame on one wheel notch. Together these turn
   that into a glide of about 11px a frame, settling 2.2s after scrolling stops. */
const FOLLOW = 4;
const MAX_RATE = 0.35;
const GAP = 1.9;
const MARGIN = 2.0;

/* BLAST and FADE are a pair. The pieces must be invisible by the time they
   reach the frustum edge, or the canvas clips the burst into a box. At these
   values they are gone at burst 0.56, having travelled 1.73 of the 2.0
   available. Raising BLAST without lowering FADE brings the box back. */
const BLAST = 2.0;
const FADE = 1.8;

const LEGS = 6;
const Y_TOP = 4.5;
const Y_BOTTOM = -4.5;
const X_MAX = 3.2;
const MIN_RUN = 1.3;
const START = new Vector3(-X_MAX, Y_TOP, 0);

/* Rebuilt per load so the chase is never the same shape twice, always from the
   same corner. Runs are axis aligned, so every turn is a right angle.
   The drop is uniform on purpose: an uneven one produces verticals shorter than
   GAP, and the dot then cuts the corner of a narrow turn straight into the
   mouth. Keeping every segment long makes the plain arc length lead safe. */
function buildRoute(): CurvePath<Vector3> {
  const drop = (Y_TOP - Y_BOTTOM) / LEGS;
  const corners = [START.clone()];
  let x = START.x;
  let y = START.y;

  for (let leg = 0; leg < LEGS; leg++) {
    const side = x <= 0 ? 1 : -1;
    x = side * (MIN_RUN + Math.random() * (X_MAX - MIN_RUN));
    corners.push(new Vector3(x, y, 0));

    y -= drop;
    corners.push(new Vector3(x, y, 0));
  }

  const route = new CurvePath<Vector3>();
  for (let i = 1; i < corners.length; i++) {
    route.add(new LineCurve3(corners[i - 1], corners[i]));
  }
  return route;
}

/* Filled rather than wireframe, since an outline this small reads as noise. The
   pupils are kept separate so they can look along the route. */
function createQuarry() {
  const shape = new Shape(ghostOutline(QUARRY).map(([x, y]) => new Vector2(x, y)));
  const body = new MeshBasicMaterial({ transparent: true });
  const eyes = new MeshBasicMaterial({ transparent: true });
  const pupils = new MeshBasicMaterial({ transparent: true });

  const group = new Group();
  group.add(new Mesh(new ShapeGeometry(shape), body));

  const pupilMeshes: Mesh[] = [];
  for (const side of [-1, 1]) {
    const eye = new Mesh(new CircleGeometry(0.065, 16), eyes);
    eye.position.set(side * EYE_X, EYE_Y, 0.01);
    group.add(eye);

    const pupil = new Mesh(new CircleGeometry(0.032, 12), pupils);
    pupil.position.set(side * EYE_X, EYE_Y, 0.02);
    group.add(pupil);
    pupilMeshes.push(pupil);
  }

  return { group, body, eyes, pupils, pupilMeshes };
}

export function initChaseScene(canvas: HTMLCanvasElement, stage: HTMLElement): void {
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
  camera.position.z = 10;

  const route = buildRoute();
  const leadT = GAP / route.getLength();

  const bounds = { x: 0, y: 0 };
  for (const point of route.getPoints(120)) {
    bounds.x = Math.max(bounds.x, Math.abs(point.x));
    bounds.y = Math.max(bounds.y, Math.abs(point.y));
  }

  const pacman = createPacman(RADIUS, DEPTH);

  /* Outer group carries the travel angle, inner group a fixed tilt so the
     front and back loops separate instead of overlapping under an
     axis-aligned orthographic camera. */
  const chaser = new Group();
  const tilt = new Group();
  tilt.rotation.set(-0.3, 0.42, 0);
  tilt.add(pacman.lines);
  chaser.add(tilt);
  scene.add(chaser);

  const ballMaterial = new MeshBasicMaterial({ transparent: true });
  const ball = new Mesh(new CircleGeometry(BALL_R, 28), ballMaterial);
  scene.add(ball);

  const quarry = createQuarry();
  const quarryMaterials = [quarry.body, quarry.eyes, quarry.pupils];
  scene.add(quarry.group);

  const dotMaterial = new MeshBasicMaterial();
  const dots = new InstancedMesh(new CircleGeometry(DOT_R, 10), dotMaterial, DOTS);
  scene.add(dots);

  /* Colours come from the tokens and are read again on every theme change,
     so the scene can never drift from the palette. */
  const paint = (): void => {
    const ink = token('--color-ink');
    const signal = token('--color-signal');

    pacman.material.color.set(ink);
    ballMaterial.color.set(signal);
    dotMaterial.color.set(signal);
    quarry.body.color.set(signal);
    quarry.eyes.color.set(ink);
    quarry.pupils.color.set(token('--color-surface'));

    const dark = currentTheme() === 'dark';
    ball.visible = !dark;
    quarry.group.visible = dark;
  };

  paint();
  onThemeChange(paint);

  const dummy = new Object3D();
  const dotAt = Array.from({ length: DOTS }, (_, i) => route.getPointAt(i / (DOTS - 1)));

  /* Scaled to nothing rather than removed, so the count stays fixed and the
     instance matrix is written once per frame either way. */
  const writeDots = (reached: number): void => {
    for (let i = 0; i < DOTS; i++) {
      const t = i / (DOTS - 1);
      dummy.position.copy(dotAt[i]);
      dummy.scale.setScalar(t <= reached - TRAIL_GAP ? 1 : 0);
      dummy.updateMatrix();
      dots.setMatrixAt(i, dummy.matrix);
    }
    dots.instanceMatrix.needsUpdate = true;
  };

  let stageTop = 0;
  let stageHeight = 0;

  const measure = (): void => {
    const rect = stage.getBoundingClientRect();
    stageTop = rect.top + window.scrollY;
    stageHeight = rect.height;
  };

  /* Progress across the panel's whole pass through the viewport, not across a
     pinned stage: this element is shorter than the screen, so the pinned model
     produces negative travel and the chase never starts.
     Measured on resize and read from scrollY per frame, so the loop never
     forces a layout. */
  const progressOf = (): number => {
    const span = window.innerHeight + stageHeight;
    return span <= 0
      ? 0
      : MathUtils.clamp((window.scrollY + window.innerHeight - stageTop) / span, 0, 1);
  };

  const resize = (): void => {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    renderer.setSize(w, h, false);

    const aspect = w / h;
    const half = Math.max((bounds.x + MARGIN) / aspect, bounds.y + MARGIN);
    camera.top = half;
    camera.bottom = -half;
    camera.left = -half * aspect;
    camera.right = half * aspect;
    camera.updateProjectionMatrix();
    measure();
  };

  let frame = 0;
  let running = false;
  let mouthHold = 0.06;
  let shown = 0;
  let lastFrame = 0;

  const tick = (now: number): void => {
    frame = requestAnimationFrame(tick);

    // Clamped so a frame after a tab switch cannot fling the chase forward.
    const dt = lastFrame ? Math.min(0.05, (now - lastFrame) / 1000) : 0;
    lastFrame = now;

    const step = (progressOf() - shown) * (1 - Math.exp(-dt * FOLLOW));
    shown += Math.sign(step) * Math.min(Math.abs(step), MAX_RATE * dt);
    const progress = shown;

    const chase = Math.min(progress, CHASE_END) / CHASE_END;
    const burst = progress <= CHASE_END ? 0 : (progress - CHASE_END) / (1 - CHASE_END);

    const here = route.getPointAt(chase);
    const closing = 1 - MathUtils.smoothstep(chase, 0.86, 1);
    const lead = Math.min(1, chase + leadT * closing);
    const ahead = route.getPointAt(lead);

    chaser.position.set(here.x, here.y, 0);
    const tangent = route.getTangentAt(chase);
    chaser.rotation.z = Math.atan2(tangent.y, tangent.x);

    const shrink = Math.max(0, 1 - burst * 1.6);
    const fade = Math.max(0, 1 - burst * FADE);

    ball.position.set(ahead.x, ahead.y, 0);
    ball.scale.setScalar(shrink);
    ballMaterial.opacity = fade;

    quarry.group.position.set(ahead.x, ahead.y, 0);
    quarry.group.scale.setScalar(shrink);
    for (const material of quarryMaterials) material.opacity = fade;

    // The ghost looks the way it is fleeing.
    if (quarry.group.visible) {
      const heading = route.getTangentAt(lead);
      for (let i = 0; i < quarry.pupilMeshes.length; i++) {
        quarry.pupilMeshes[i].position.set(
          (i === 0 ? -1 : 1) * EYE_X + heading.x * LOOK,
          EYE_Y + heading.y * LOOK,
          0.02,
        );
      }
    }

    pacman.material.opacity = fade;
    if (burst === 0) mouthHold = 0.06 + Math.abs(Math.sin(now / 130)) * 0.5;
    pacman.draw(mouthHold, burst * BLAST);
    writeDots(chase);

    renderer.render(scene, camera);
  };

  const start = (): void => {
    if (running) return;
    running = true;
    // Lands where the page already is, rather than replaying from the start
    // after a reload partway down.
    shown = progressOf();
    lastFrame = 0;
    frame = requestAnimationFrame(tick);
  };

  const stop = (): void => {
    if (!running) return;
    running = false;
    cancelAnimationFrame(frame);
  };

  resize();
  new ResizeObserver(resize).observe(canvas);

  new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) start();
    else stop();
  }).observe(stage);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });

  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    stop();
  });
}
