import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const DIST = 'dist';

/* Mirrors docs/PERFORMANCE.md. Changing a number here means changing it there. */
const BUDGET = {
  criticalPathKb: 50,
  deferredWebglKb: 180,
};

const walk = (dir) =>
  readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

const gzipKb = (path) => gzipSync(readFileSync(path)).length / 1024;

const files = walk(DIST);
const failures = [];
const report = [];

const css = files.filter((f) => f.endsWith('.css'));
const js = files.filter((f) => f.endsWith('.js'));
const html = files.filter((f) => f.endsWith('.html'));

const isThree = (f) => /three|hero-scene|ghost-scene/.test(f);

const criticalKb = [...html, ...css, ...js.filter((f) => !isThree(f))].reduce(
  (total, f) => total + gzipKb(f),
  0,
);
const webglKb = js.filter(isThree).reduce((total, f) => total + gzipKb(f), 0);

report.push(`critical path  ${criticalKb.toFixed(1)} KB gzip  (budget ${BUDGET.criticalPathKb})`);
report.push(`deferred webgl ${webglKb.toFixed(1)} KB gzip  (budget ${BUDGET.deferredWebglKb})`);

if (criticalKb > BUDGET.criticalPathKb) {
  failures.push(`critical path ${criticalKb.toFixed(1)} KB exceeds ${BUDGET.criticalPathKb} KB`);
}
if (webglKb > BUDGET.deferredWebglKb) {
  failures.push(`deferred WebGL ${webglKb.toFixed(1)} KB exceeds ${BUDGET.deferredWebglKb} KB`);
}

/* Regression guard for ADR 0009. A minifier that folds animation-timeline into
   the animation shorthand silently disables every scroll-driven animation, and
   the page still builds and renders — only the motion stops. */
const styles = css.map((f) => readFileSync(f, 'utf8')).join('\n');

if (!styles.includes('animation-timeline:')) {
  failures.push('no animation-timeline longhand in the built CSS — scroll animations are dead');
}

const folded = styles.match(/animation:[^;}]*(scroll\(|view\(|--exp)[^;}]*/g);
if (folded) {
  failures.push(`animation-timeline folded into the shorthand: ${folded[0].slice(0, 60)}`);
}

report.push(`scroll timelines ${failures.length ? 'BROKEN' : 'intact'}`);

console.log(report.map((line) => `  ${line}`).join('\n'));

if (failures.length) {
  console.error('\nBudget check failed:');
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log('\nBudget check passed.');
