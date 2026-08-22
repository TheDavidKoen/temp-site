import {
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  Float32BufferAttribute,
  Group,
  Line,
  LineBasicMaterial,
  LineSegments,
  MathUtils,
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

const TRAIL_PTS = 90;
const TRAIL_SPAN = 0.22;
const LEAD = 0.075;
const MARGIN = 1.4;

const INK = new Color(0x101a1c);
const SIGNAL = new Color(0xff0000);

/* Top-left to bottom-centre, wandering wide enough to use the full stage. */
const ROUTE = new CatmullRomCurve3([
  new Vector3(-5.2, 3.1, 0),
  new Vector3(-1.6, 2.3, 0),
  new Vector3(3.9, 0.9, 0),
  new Vector3(0.4, -0.6, 0),
  new Vector3(-3.1, -1.9, 0),
  new Vector3(0, -3.1, 0),
]);

function ring(radius: number, steps = 30): BufferGeometry {
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

export function initHeroScene(canvas: HTMLCanvasElement, section: HTMLElement): void {
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
  camera.position.z = 10;

  const bounds = { x: 0, y: 0 };
  for (const point of ROUTE.getPoints(120)) {
    bounds.x = Math.max(bounds.x, Math.abs(point.x));
    bounds.y = Math.max(bounds.y, Math.abs(point.y));
  }

  /* Rebuilt in place each frame so the mouth can open and close without
     allocating a new buffer sixty times a second. */
  const wedge = new Float32Array(SEGMENTS * 2 * 3);
  const wedgeGeometry = new BufferGeometry();
  wedgeGeometry.setAttribute('position', new Float32BufferAttribute(wedge, 3));

  const chaser = new Group();
  chaser.add(new LineSegments(wedgeGeometry, new LineBasicMaterial({ color: INK })));
  scene.add(chaser);

  const target = new LineSegments(ring(0.2, 20), new LineBasicMaterial({ color: SIGNAL }));
  scene.add(target);

  const trail = new Float32Array(TRAIL_PTS * 3);
  const trailGeometry = new BufferGeometry();
  trailGeometry.setAttribute('position', new Float32BufferAttribute(trail, 3));
  scene.add(new Line(trailGeometry, new LineBasicMaterial({ color: SIGNAL })));

  const writeWedge = (mouth: number): void => {
    const span = Math.PI * 2 - mouth * 2;
    const front = DEPTH / 2;
    const back = -DEPTH / 2;

    const at = (i: number): [number, number] => {
      if (i === 0) return [0, 0];
      const angle = mouth + (span * (i - 1)) / ARC_STEPS;
      return [Math.cos(angle) * RADIUS, Math.sin(angle) * RADIUS];
    };

    let o = 0;
    const put = (x: number, y: number, z: number): void => {
      wedge[o++] = x;
      wedge[o++] = y;
      wedge[o++] = z;
    };

    for (const z of [front, back]) {
      for (let i = 0; i < LOOP_PTS; i++) {
        const [ax, ay] = at(i);
        const [bx, by] = at((i + 1) % LOOP_PTS);
        put(ax, ay, z);
        put(bx, by, z);
      }
    }

    for (let i = 0; i < LOOP_PTS; i += RIB_EVERY) {
      const [ax, ay] = at(i);
      put(ax, ay, front);
      put(ax, ay, back);
    }

    wedgeGeometry.attributes.position.needsUpdate = true;
  };

  const writeTrail = (progress: number): void => {
    const start = Math.max(0, progress - TRAIL_SPAN);
    for (let i = 0; i < TRAIL_PTS; i++) {
      const t = MathUtils.lerp(start, progress, i / (TRAIL_PTS - 1));
      const point = ROUTE.getPointAt(MathUtils.clamp(t, 0, 1));
      trail[i * 3] = point.x;
      trail[i * 3 + 1] = point.y;
      trail[i * 3 + 2] = 0;
    }
    trailGeometry.attributes.position.needsUpdate = true;
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

  const tick = (now: number): void => {
    frame = requestAnimationFrame(tick);
    const progress = progressOf();

    const here = ROUTE.getPointAt(progress);
    const ahead = ROUTE.getPointAt(Math.min(1, progress + LEAD));

    chaser.position.set(here.x, here.y, 0);
    chaser.rotation.z = Math.atan2(ahead.y - here.y, ahead.x - here.x);
    target.position.set(ahead.x, ahead.y, 0);

    writeWedge(0.06 + Math.abs(Math.sin(now / 130)) * 0.5);
    writeTrail(progress);

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
