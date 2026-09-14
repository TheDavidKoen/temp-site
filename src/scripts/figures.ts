/**
 * Geometry shared by the two Three.js scenes: the wireframe pacman both of them
 * draw, and the ghost outline both of them trace.
 */
import {
  BufferAttribute,
  BufferGeometry,
  DynamicDrawUsage,
  LineBasicMaterial,
  LineSegments,
} from 'three';

const ARC_STEPS = 40;
const RIB_EVERY = 6;
const LOOP_POINTS = ARC_STEPS + 2;
const RIBS = Math.floor(LOOP_POINTS / RIB_EVERY) + 1;
const SEGMENTS = LOOP_POINTS * 2 + RIBS;

export type Point = [number, number];

/** Deterministic noise between 0 and 1, so a burst scatters the same way every time. */
export const jitter = (i: number, seed: number): number => {
  const n = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  return n - Math.floor(n);
};

export interface Pacman {
  readonly lines: LineSegments;
  readonly material: LineBasicMaterial;
  /** mouth is the half-angle of the gap in radians; blast pushes the outline apart. */
  draw(mouth: number, blast?: number): void;
}

/* Two outlines a depth apart, joined by ribs, rewritten in place on each draw
   rather than rebuilt, so animating the mouth allocates nothing. */
export function createPacman(radius: number, depth: number): Pacman {
  const positions = new Float32Array(SEGMENTS * 2 * 3);
  const attribute = new BufferAttribute(positions, 3);
  attribute.setUsage(DynamicDrawUsage);

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', attribute);

  const material = new LineBasicMaterial({ transparent: true });
  const lines = new LineSegments(geometry, material);

  const draw = (mouth: number, blast = 0): void => {
    const span = Math.PI * 2 - mouth * 2;

    const at = (i: number): Point => {
      if (i === 0) return [0, 0];
      const angle = mouth + (span * (i - 1)) / ARC_STEPS;
      const reach = radius + blast * (0.4 + jitter(i, 1) * 0.6);
      return [Math.cos(angle) * reach, Math.sin(angle) * reach];
    };

    let o = 0;
    const put = (x: number, y: number, z: number): void => {
      positions[o++] = x;
      positions[o++] = y;
      positions[o++] = z;
    };

    for (const face of [1, -1]) {
      const z = (depth / 2) * face * (1 + blast);
      for (let i = 0; i < LOOP_POINTS; i++) {
        const [ax, ay] = at(i);
        const [bx, by] = at((i + 1) % LOOP_POINTS);
        put(ax, ay, z);
        put(bx, by, z);
      }
    }

    for (let i = 0; i < LOOP_POINTS; i += RIB_EVERY) {
      const [ax, ay] = at(i);
      put(ax, ay, (depth / 2) * (1 + blast));
      put(ax, ay, (-depth / 2) * (1 + blast));
    }

    attribute.needsUpdate = true;
  };

  draw(0.3);
  return { lines, material, draw };
}

export interface GhostOutline {
  readonly halfWidth: number;
  readonly domeY: number;
  readonly skirtY: number;
  readonly waves: number;
  readonly amplitude: number;
  readonly arcSteps: number;
  readonly skirtSteps: number;
}

/* A dome over straight sides, closed by a wavy skirt, traced as one loop from
   the left of the dome. Stroked by the pointer scene and filled by the chase. */
export function ghostOutline(ghost: GhostOutline): Point[] {
  const points: Point[] = [];

  for (let i = 0; i <= ghost.arcSteps; i++) {
    const angle = Math.PI - (i / ghost.arcSteps) * Math.PI;
    points.push([
      Math.cos(angle) * ghost.halfWidth,
      ghost.domeY + Math.sin(angle) * ghost.halfWidth,
    ]);
  }

  points.push([ghost.halfWidth, ghost.skirtY]);

  for (let i = 1; i <= ghost.skirtSteps; i++) {
    const t = i / ghost.skirtSteps;
    points.push([
      ghost.halfWidth - t * ghost.halfWidth * 2,
      ghost.skirtY + Math.sin(t * Math.PI * ghost.waves) * ghost.amplitude,
    ]);
  }

  return points;
}
