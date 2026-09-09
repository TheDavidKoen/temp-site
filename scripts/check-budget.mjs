import { readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, join } from 'node:path';
import { gzipSync } from 'node:zlib';

const DIST = 'dist';

/* Mirrors docs/performance.md. Changing a number here means changing it there.
   `pnpm run budget -- --markdown` prints that document's tables, so the figures
   are copied from the build rather than remembered. */
const BUDGET = {
  criticalPathKb: 50,
  deferredWebglKb: 180,
};

const walk = (dir) =>
  readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

const rawKb = (path) => statSync(path).size / 1024;
const gzipKb = (path) => gzipSync(readFileSync(path)).length / 1024;

const files = walk(DIST);
const failures = [];

const css = files.filter((f) => f.endsWith('.css'));
const js = files.filter((f) => f.endsWith('.js'));
const html = files.filter((f) => f.endsWith('.html'));
const fonts = files.filter((f) => f.endsWith('.woff2'));

/* Anchored to the chunk names the build actually emits, so an unrelated file that
   merely contains "three" cannot exempt itself from the critical path. */
const DEFERRED = /^(three\.module|chase-scene|ghost-scene)\./;
const isDeferred = (f) => DEFERRED.test(basename(f));

const sum = (paths, measure) => paths.reduce((total, f) => total + measure(f), 0);

const criticalFiles = [...html, ...css, ...js.filter((f) => !isDeferred(f))];
const deferredFiles = js.filter(isDeferred);

const criticalKb = sum(criticalFiles, gzipKb);
const webglKb = sum(deferredFiles, gzipKb);

if (criticalKb > BUDGET.criticalPathKb) {
  failures.push(`critical path ${criticalKb.toFixed(1)} KB exceeds ${BUDGET.criticalPathKb} KB`);
}
if (webglKb > BUDGET.deferredWebglKb) {
  failures.push(`deferred WebGL ${webglKb.toFixed(1)} KB exceeds ${BUDGET.deferredWebglKb} KB`);
}

/* Regression guard for ADR 0009. A minifier that folds animation-timeline into
   the animation shorthand silently disables every scroll-driven animation, and
   the page still builds and renders, only the motion stops. */
const styles = css.map((f) => readFileSync(f, 'utf8')).join('\n');

if (!styles.includes('animation-timeline:')) {
  failures.push('no animation-timeline longhand in the built CSS, scroll animations are dead');
}

const folded = styles.match(/animation:[^;}]*(scroll\(|view\(|--exp)[^;}]*/g);
if (folded) {
  failures.push(`animation-timeline folded into the shorthand: ${folded[0].slice(0, 60)}`);
}

if (process.argv.includes('--markdown')) {
  const row = (label, paths) =>
    `| ${label} | ${sum(paths, rawKb).toFixed(0)} KB | **${sum(paths, gzipKb).toFixed(1)} KB** |`;

  console.log('| Asset | Raw | Gzip |');
  console.log('|---|---|---|');
  console.log(row('HTML', html));
  console.log(row('CSS', css));
  console.log(
    row(
      'Page scripts',
      js.filter((f) => !isDeferred(f)),
    ),
  );
  for (const file of deferredFiles.sort()) {
    console.log(row(`\`${basename(file).split('.')[0]}\` (deferred)`, [file]));
  }
  console.log(`| Fonts | ${fonts.length} x woff2 | self-hosted |`);
  console.log(`| Total \`dist/\` | ${sum(files, rawKb).toFixed(0)} KB | |`);
  console.log('');
  console.log(
    `**Critical path: ${criticalKb.toFixed(1)} KB gzip** against a ${BUDGET.criticalPathKb} KB budget.`,
  );
  console.log(
    `**Deferred WebGL: ${webglKb.toFixed(1)} KB gzip** against a ${BUDGET.deferredWebglKb} KB budget.`,
  );
} else {
  console.log(
    [
      `  critical path  ${criticalKb.toFixed(1)} KB gzip  (budget ${BUDGET.criticalPathKb})`,
      `  deferred webgl ${webglKb.toFixed(1)} KB gzip  (budget ${BUDGET.deferredWebglKb})`,
      `  scroll timelines ${failures.length ? 'BROKEN' : 'intact'}`,
    ].join('\n'),
  );
}

if (failures.length) {
  console.error('\nBudget check failed:');
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

if (!process.argv.includes('--markdown')) console.log('\nBudget check passed.');
