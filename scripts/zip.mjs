// Packages the theme for upload in Ghost Admin (Settings → Theme → Change theme → Upload theme).
// Only theme files are included; dev tooling, tests, docs, seed data and node_modules are left out.
//
// Stage 7 (G2) hardening:
//   - files are copied into a staging folder with normalised permissions (files 0644, folders 0755),
//     so the zip never depends on the permissions of the local checkout;
//   - source maps (*.map) are never included (the release build does not create them either);
//   - every entry gets the same timestamp (the time of the last commit that changed a packaged file, or
//     SOURCE_DATE_EPOCH if set), so the same theme files always produce the same zip checksum. Info-ZIP `zip -X` (no extra attributes, sorted
//     file list) is used when available; otherwise bestzip (not byte-reproducible).
import { mkdirSync, existsSync, rmSync, readdirSync, statSync, copyFileSync, chmodSync, utimesSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import bestzip from 'bestzip';

const out = resolve('dist/himandme-ghost-theme.zip');
const stage = resolve('dist/.zip-stage');
mkdirSync('dist', { recursive: true });
if (existsSync(out)) rmSync(out);
rmSync(stage, { recursive: true, force: true });

let epoch = Number(process.env.SOURCE_DATE_EPOCH);
// The time of the last commit that changed a packaged file, so docs-only commits do not change the zip.
const THEME_PATHS = ['package.json', 'routes.yaml', '*.hbs', 'partials', 'assets', 'locales'];
if (!epoch) { try { epoch = Number(execFileSync('git', ['log', '-1', '--format=%ct', '--', ...THEME_PATHS]).toString().trim()); } catch { epoch = 0; } }
if (!epoch) epoch = Date.parse('2026-11-21T00:00:00Z') / 1000;
const when = new Date(epoch * 1000);

// Directories are added whole; top-level files are listed explicitly.
const include = [
  'package.json',
  'routes.yaml',
  ...readdirSync('.').filter((f) => f.endsWith('.hbs')),
  ...['partials', 'assets/built', 'assets/fonts', 'assets/images', 'locales'].filter((d) => existsSync(d)),
];

const files = [];
const walk = (p) => (statSync(p).isDirectory() ? readdirSync(p).sort().forEach((f) => walk(join(p, f))) : files.push(p));
include.forEach(walk);
const dirs = new Set();
for (const f of files.filter((f) => !f.endsWith('.map'))) {
  const dest = join(stage, f);
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(f, dest);
  chmodSync(dest, 0o644);
  utimesSync(dest, when, when);
  for (let d = dirname(f); d && d !== '.'; d = dirname(d)) dirs.add(d);
}
for (const d of [...dirs].sort((a, b) => b.length - a.length)) { chmodSync(join(stage, d), 0o755); utimesSync(join(stage, d), when, when); }

const list = files.filter((f) => !f.endsWith('.map')).sort();
let tool = 'zip -X';
try {
  execFileSync('zip', ['-X', '-q', '-D', out, '-@'], { cwd: stage, input: `${list.join('\n')}\n` });
} catch (e) {
  if (e.code !== 'ENOENT') throw e;
  tool = 'bestzip (fallback; not byte-reproducible)';
  await bestzip({ source: [...new Set(list.map((f) => f.split('/')[0]))], destination: out, cwd: stage });
}
rmSync(stage, { recursive: true, force: true });
console.log(`Created dist/himandme-ghost-theme.zip (${list.length} files, timestamp ${when.toISOString()}, ${tool})`);
