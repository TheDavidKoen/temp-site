/**
 * The chase animation in the hero. Scroll position drives it; nothing is on a
 * timer, so it holds still when the page does.
 */
import {
  BufferAttribute,
  BufferGeometry,
  CircleGeometry,
  Color,
  CurvePath,
  DynamicDrawUsage,
  Group,
  InstancedMesh,
  LineBasicMaterial,
  LineCurve3,
  LineSegments,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  OrthographicCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';

const RADIUS = 0.85;
const DEPTH = 0.5;
const ARC_STEPS = 40;
const RIB_EVERY = 6;
const LOOP_PTS = ARC_STEPS + 2;
const RIBS = Math.floor(LOOP_PTS / RIB_EVERY) + 1;
const SEGMENTS = LOOP_PTS * 2 + RIBS;

const DOTS = 74;
const DOT_R = 0.055;
const BALL_R = 0.17;

const CHASE_END = 0.82;
const GAP = 2.3;
const TRAIL_GAP = 0.028;
const MARGIN = 1.4;

const INK = new Color(0x101a1c);
const SIGNAL = new Color(0xff0000);

const LEGS = 5;
const Y_TOP = 3.1;
const Y_BOTTOM = -3.1;
const X_MAX = 5.2;
const MIN_RUN = 2.2;
const START = new Vector3(-5.2, 3.1, 0);

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

const jitter = (i: number, seed: number): number => {
  const n = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  return n - Math.floor(n);
};

export function initHeroScene(canvas: HTMLCanvasElement, section: HTMLElement): void {
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
  camera.position.z = 10;

  const ROUTE = buildRoute();
  const LEAD_T = GAP / ROUTE.getLength();

  const bounds = { x: 0, y: 0 };
  for (const point of ROUTE.getPoints(120)) {
    bounds.x = Math.max(bounds.x, Math.abs(point.x));
    bounds.y = Math.max(bounds.y, Math.abs(point.y));
  }

  const wedge = new Float32Array(SEGMENTS * 2 * 3);
  const wedgeAttribute = new BufferAttribute(wedge, 3);
  wedgeAttribute.setUsage(DynamicDrawUsage);
  const wedgeGeometry = new BufferGeometry();
  wedgeGeometry.setAttribute('position', wedgeAttribute);

  const wedgeMaterial = new LineBasicMaterial({ color: INK, transparent: true });

  const chaser = new Group();
  const tilt = new Group();
  tilt.rotation.set(-0.3, 0.42, 0);
  tilt.add(new LineSegments(wedgeGeometry, wedgeMaterial));
  chaser.add(tilt);
  scene.add(chaser);

  const ballMaterial = new MeshBasicMaterial({ color: SIGNAL, transparent: true });
  const ball = new Mesh(new CircleGeometry(BALL_R, 28), ballMaterial);
  scene.add(ball);

  const dots = new InstancedMesh(
    new CircleGeometry(DOT_R, 10),
    new MeshBasicMaterial({ color: SIGNAL }),
    DOTS,
  );
  scene.add(dots);

  const dummy = new Object3D();
  const dotAt = Array.from({ length: DOTS }, (_, i) => ROUTE.getPointAt(i / (DOTS - 1)));

  const writeDots = (reached: number): void => {
    for (let i = 0; i < DOTS; i++) {
      const t = i / (DOTS - 1);
      const shown = t <= reached - TRAIL_GAP;
      dummy.position.copy(dotAt[i]);
      dummy.scale.setScalar(shown ? 1 : 0);
      dummy.updateMatrix();
      dots.setMatrixAt(i, dummy.matrix);
    }
    dots.instanceMatrix.needsUpdate = true;
  };

  const writeWedge = (mouth: number, burst: number): void => {
    const span = Math.PI * 2 - mouth * 2;
    const blast = burst * 5.5;

    const at = (i: number): [number, number] => {
      if (i === 0) return [0, 0];
      const angle = mouth + (span * (i - 1)) / ARC_STEPS;
      const reach = RADIUS + blast * (0.4 + jitter(i, 1) * 0.6);
      return [Math.cos(angle) * reach, Math.sin(angle) * reach];
    };

    let o = 0;
    const put = (x: number, y: number, z: number): void => {
      wedge[o++] = x;
      wedge[o++] = y;
      wedge[o++] = z;
    };

    for (const face of [1, -1]) {
      const z = (DEPTH / 2) * face * (1 + blast);
      for (let i = 0; i < LOOP_PTS; i++) {
        const [ax, ay] = at(i);
        const [bx, by] = at((i + 1) % LOOP_PTS);
        put(ax, ay, z);
        put(bx, by, z);
      }
    }

    for (let i = 0; i < LOOP_PTS; i += RIB_EVERY) {
      const [ax, ay] = at(i);
      put(ax, ay, (DEPTH / 2) * (1 + blast));
      put(ax, ay, (-DEPTH / 2) * (1 + blast));
    }

    wedgeAttribute.needsUpdate = true;
  };

  let pinTop = 0;
  let travel = 0;

  const measure = (): void => {
    pinTop = section.getBoundingClientRect().top + window.scrollY;
    travel = section.offsetHeight - window.innerHeight;
  };

  const progressOf = (): number =>
    travel <= 0 ? 0 : MathUtils.clamp((window.scrollY - pinTop) / travel, 0, 1);

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

  const tick = (now: number): void => {
    frame = requestAnimationFrame(tick);
    const progress = progressOf();

    const chase = Math.min(progress, CHASE_END) / CHASE_END;
    const burst = progress <= CHASE_END ? 0 : (progress - CHASE_END) / (1 - CHASE_END);

    const here = ROUTE.getPointAt(chase);
    const closing = 1 - MathUtils.smoothstep(chase, 0.86, 1);
    const ahead = ROUTE.getPointAt(Math.min(1, chase + LEAD_T * closing));

    chaser.position.set(here.x, here.y, 0);
    const tangent = ROUTE.getTangentAt(chase);
    chaser.rotation.z = Math.atan2(tangent.y, tangent.x);

    ball.position.set(ahead.x, ahead.y, 0);
    ball.scale.setScalar(Math.max(0, 1 - burst * 1.6));
    ballMaterial.opacity = Math.max(0, 1 - burst * 1.8);

    wedgeMaterial.opacity = Math.max(0, 1 - burst * 1.25);
    if (burst === 0) mouthHold = 0.06 + Math.abs(Math.sin(now / 130)) * 0.5;
    writeWedge(mouthHold, burst);
    writeDots(chase);

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

  new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) start();
    else stop();
  }).observe(section);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });

  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    stop();
  });
}
