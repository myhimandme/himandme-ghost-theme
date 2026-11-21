// Visual comparison against the approved prototype (master reference).
// Renders each prototype board and the matching LOCAL Ghost page at the same width, captures the
// same region, and writes side-by-side images to test/visual/.local/ for review.
//
//   PROTOTYPE_HTML=/path/to/Him__Me_Website_Design_2.html npm run visual [-- --only=home-head,blog-foot]
//
// Needs Playwright with Chromium available (require('playwright')). Local Ghost only.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const BASE = (process.env.GHOST_URL || 'http://localhost:2368').replace(/\/$/, '');
if (!['localhost', '127.0.0.1'].includes(new URL(BASE).hostname)) { console.error('Local Ghost only.'); process.exit(2); }
const SRC = process.env.PROTOTYPE_HTML;
if (!SRC) { console.error('Set PROTOTYPE_HTML to the exported prototype HTML file.'); process.exit(2); }
const OUT = new URL('./.local/', import.meta.url).pathname;
mkdirSync(OUT + 'boards/', { recursive: true });

// 1. Unpack the exported canvas: each board is a self-contained page in the bundle manifest.
const html = readFileSync(SRC, 'utf8');
const manifest = JSON.parse(html.match(/<script type="__bundler\/manifest">\s*([\s\S]*?)\s*<\/script>/)[1]);
const boards = {};
for (const [id, v] of Object.entries(manifest)) {
  if (v.mime !== 'text/html') continue;
  let d = Buffer.from(v.data, 'base64'); if (v.compressed) d = gunzipSync(d);
  const t = d.toString('utf8'); const title = (t.slice(0, 30000).match(/<title>([^<]*)<\/title>/) || [])[1] || id;
  writeFileSync(`${OUT}boards/${id}.html`, d); boards[title.replace(/&amp;/g, '&').replace(/&#39;/g, "'")] = `${OUT}boards/${id}.html`;
}
const board = (prefix) => boards[Object.keys(boards).find((k) => k.startsWith(prefix))];

// 2. What to compare: [name, prototype board title prefix, width, Ghost path, region, height]
const SHOTS = [
  ['home-head', 'Utama — Him', 1440, '/', 'head', 260], ['home-foot', 'Utama — Him', 1440, '/', 'foot', 520],
  ['homeM-head', 'Utama — mobile', 390, '/', 'head', 140], ['homeM-foot', 'Utama — mobile', 390, '/', 'foot', 560],
  ['ed-head', 'Disfungsi Ereksi — Him', 1440, '/disfungsi-ereksi/', 'head', 120], ['ed-foot', 'Disfungsi Ereksi — Him', 1440, '/disfungsi-ereksi/', 'foot', 220],
  ['edM-foot', 'Disfungsi Ereksi — mobile', 390, '/disfungsi-ereksi/', 'foot', 320],
  ['blog-head', 'Blog — Jurnal', 1440, '/blog/', 'head', 240], ['blog-foot', 'Blog — Jurnal', 1440, '/blog/', 'foot', 200],
  ['blogM-head', 'Blog — mobile', 390, '/blog/', 'head', 190], ['blogM-foot', 'Blog — mobile', 390, '/blog/', 'foot', 200],
  ['art-head', 'Artikel — Jurnal', 1440, '/blog/artikel-ujian-01/', 'head', 130], ['art-foot', 'Artikel — Jurnal', 1440, '/blog/artikel-ujian-01/', 'foot', 200],
  ['artM-head', 'Artikel — mobile', 390, '/blog/artikel-ujian-01/', 'head', 70],
];
const only = (process.argv.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);

const browser = await chromium.launch();
async function capture(url, w, part, h, wait) {
  const p = await browser.newPage({ viewport: { width: w, height: 900 } });
  await p.goto(url); await p.waitForTimeout(wait);
  const y = part === 'head' ? 0 : await p.evaluate(() => {
    const f = [...document.querySelectorAll('footer')].filter((e) => e.offsetHeight > 0 && getComputedStyle(e).display !== 'none').pop();
    return f ? f.getBoundingClientRect().top + window.scrollY : document.documentElement.scrollHeight - 400;
  });
  const buf = await p.screenshot({ clip: { x: 0, y, width: w, height: h }, fullPage: true });
  await p.close(); return buf.toString('base64');
}
for (const [name, title, w, path, part, h] of SHOTS) {
  if (only.length && !only.includes(name)) continue;
  const file = board(title); if (!file) { console.log(`skip ${name}: board "${title}" not found`); continue; }
  const a = await capture('file://' + file, w, part, h, 3500);
  const b = await capture(BASE + path, w, part, h, 1200);
  const side = w <= 400;
  const page = await browser.newPage({ viewport: { width: side ? w * 2 + 28 : w, height: 200 } });
  await page.setContent(`<body style="margin:0;font:12px system-ui;color:#C52626;background:#fff">
    <div style="display:${side ? 'flex' : 'block'};gap:28px">
      <div><div style="padding:4px">PROTOTYPE</div><img src="data:image/png;base64,${a}" style="display:block"></div>
      <div><div style="padding:4px">GHOST THEME</div><img src="data:image/png;base64,${b}" style="display:block"></div>
    </div></body>`);
  await page.screenshot({ path: `${OUT}${name}.png`, fullPage: true }); await page.close();
  console.log(`✓ ${name}`);
}
await browser.close();
console.log(`Side-by-side images: ${OUT}`);
