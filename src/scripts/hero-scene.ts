import {
  BoxGeometry,
  Color,
  DirectionalLight,
  HemisphereLight,
  InstancedMesh,
  MathUtils,
  MeshLambertMaterial,
  Object3D,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three';

const BEAM = 0.12;
const SEG = 0.45;
const GAP = 0.12;
const DEPTH = 0.45;
const GLYPH_H = 4.5;

const INK = new Color(0x101a1c);
const MUTED = new Color(0x3d5457);
const SIGNAL = new Color(0xff0000);

type Vec3 = [number, number, number];
type Stroke = [number, number, number, number];

interface Member {
  pos: Vec3;
  rot: Vec3;
  length: number;
  accent: boolean;
}

interface Instance extends Member {
  from: Vec3;
  spin: Vec3;
  begin: number;
  end: number;
}

/* Letterforms as straight strokes in local space, origin bottom-left. Each
   stroke is subdivided into fixed-length pins at build time, so changing SEG
   changes pin density without touching these coordinates. */
const D_STROKES: Stroke[] = [
  [0, 0, 0, GLYPH_H],
  [0, GLYPH_H, 1.9, GLYPH_H],
  [1.9, GLYPH_H, 2.9, GLYPH_H - 1],
  [2.9, GLYPH_H - 1, 2.9, 1],
  [2.9, 1, 1.9, 0],
  [1.9, 0, 0, 0],
];

const K_STROKES: Stroke[] = [
  [0, 0, 0, GLYPH_H],
  [0, 2.15, 2.5, GLYPH_H],
  [0, 2.15, 2.5, 0],
];

type Placement = [strokes: Stroke[], ox: number, oy: number];

/* Side by side reads badly on a portrait screen: fitting the width of a wide,
   short monogram leaves the vertical space empty. Portrait stacks instead. */
const LANDSCAPE: Placement[] = [
  [D_STROKES, -3.25, -GLYPH_H / 2],
  [K_STROKES, 0.75, -GLYPH_H / 2],
];

const PORTRAIT: Placement[] = [
  [D_STROKES, -1.45, 0.9],
  [K_STROKES, -1.25, -GLYPH_H - 0.9],
];

function addStroke(stroke: Stroke, ox: number, oy: number, z: number, out: Member[]): void {
  const [ax, ay, bx, by] = stroke;
  const x1 = ax + ox;
  const y1 = ay + oy;
  const dx = bx - ax;
  const dy = by - ay;
  const span = Math.hypot(dx, dy);
  const steps = Math.max(1, Math.round(span / SEG));
  const angle = Math.atan2(dy, dx);

  for (let i = 0; i < steps; i++) {
    const t = (i + 0.5) / steps;
    out.push({
      pos: [x1 + dx * t, y1 + dy * t, z],
      rot: [0, 0, angle],
      length: span / steps - GAP,
      accent: false,
    });
  }
}

function buildLetters(portrait: boolean): Member[] {
  const members: Member[] = [];
  const letters = portrait ? PORTRAIT : LANDSCAPE;

  for (const z of [-DEPTH, DEPTH]) {
    for (const [strokes, ox, oy] of letters) {
      for (const stroke of strokes) addStroke(stroke, ox, oy, z, members);
    }
  }

  const seen = new Set<string>();
  for (const [strokes, ox, oy] of letters) {
    for (const [ax, ay, bx, by] of strokes) {
      for (const [x, y] of [
        [ax, ay],
        [bx, by],
      ]) {
        const key = `${x}:${y}:${ox}`;
        if (seen.has(key)) continue;
        seen.add(key);
        members.push({
          pos: [x + ox, y + oy, 0],
          rot: [0, Math.PI / 2, 0],
          length: DEPTH * 2,
          accent: false,
        });
      }
    }
  }

  return members.map((member, i) => ({ ...member, accent: i % 7 === 3 }));
}

export function initHeroScene(canvas: HTMLCanvasElement, section: HTMLElement): void {
  const portrait = canvas.clientHeight > canvas.clientWidth;
  const members = buildLetters(portrait).sort((a, b) =>
    portrait ? b.pos[1] - a.pos[1] : a.pos[0] - b.pos[0],
  );
  const count = members.length;

  let extentX = 0;
  let extentY = 0;
  for (const member of members) {
    const reach = member.length / 2;
    extentX = Math.max(extentX, Math.abs(member.pos[0]) + reach);
    extentY = Math.max(extentY, Math.abs(member.pos[1]) + reach);
  }

  const instances: Instance[] = members.map((member, i) => {
    const begin = (i / count) * 0.78;
    return {
      ...member,
      from: [(Math.random() - 0.5) * 13, (Math.random() - 0.5) * 9, (Math.random() - 0.5) * 11],
      spin: [Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2],
      begin,
      end: begin + 0.22,
    };
  });

  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'low-power',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.1, 100);

  scene.add(new HemisphereLight(0xffffff, 0xbbd5da, 2.2));
  const key = new DirectionalLight(0xffffff, 1.8);
  key.position.set(5, 7, 6);
  scene.add(key);

  const mesh = new InstancedMesh(new BoxGeometry(1, BEAM, BEAM), new MeshLambertMaterial(), count);
  scene.add(mesh);

  instances.forEach((member, i) => {
    mesh.setColorAt(i, member.accent ? SIGNAL : i % 3 === 0 ? MUTED : INK);
  });
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

  const dummy = new Object3D();

  const layout = (progress: number): void => {
    for (let i = 0; i < count; i++) {
      const m = instances[i];
      const t = MathUtils.smoothstep(progress, m.begin, m.end);

      dummy.position.set(
        MathUtils.lerp(m.from[0], m.pos[0], t),
        MathUtils.lerp(m.from[1], m.pos[1], t),
        MathUtils.lerp(m.from[2], m.pos[2], t),
      );
      dummy.rotation.set(
        MathUtils.lerp(m.spin[0], m.rot[0], t),
        MathUtils.lerp(m.spin[1], m.rot[1], t),
        MathUtils.lerp(m.spin[2], m.rot[2], t),
      );
      const scale = MathUtils.lerp(0.15, 1, t);
      dummy.scale.set(m.length * scale, scale, scale);

      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  };

  const frameCamera = (progress: number): void => {
    const aspect = camera.aspect || 1;
    const half = Math.tan(MathUtils.degToRad(camera.fov) / 2);
    const distance = MathUtils.clamp(
      Math.max((extentX + 0.5) / (half * aspect), (extentY + 0.5) / half),
      5,
      40,
    );
    const yaw = MathUtils.lerp(-0.55, 0.06, progress);

    camera.position.set(
      Math.sin(yaw) * distance,
      MathUtils.lerp(3.2, 0.2, progress),
      Math.cos(yaw) * distance,
    );
    camera.lookAt(0, 0, 0);
  };

  let pinTop = 0;
  let travel = 0;

  /* Measured on resize only. Reading getBoundingClientRect inside the render
     loop forces a synchronous layout every frame. */
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
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    measure();
  };

  let frame = 0;
  let running = false;

  const tick = (): void => {
    frame = requestAnimationFrame(tick);
    const progress = progressOf();
    layout(progress);
    frameCamera(progress);
    renderer.render(scene, camera);
  };

  const start = (): void => {
    if (running) return;
    running = true;
    tick();
  };

  const stop = (): void => {
    if (!running) return;
    running = false;
    cancelAnimationFrame(frame);
  };

  resize();
  new ResizeObserver(resize).observe(canvas);

  // The loop only runs while the hero is on screen and the tab is focused —
  // scrolling past it or switching tabs stops GPU work entirely.
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
