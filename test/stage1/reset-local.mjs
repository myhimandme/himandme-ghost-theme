// Resets a LOCAL development Ghost to a known Stage 1 test state:
// deletes all content, uploads + activates the theme zip, uploads routes.yaml,
// imports test/stage1/fixtures/seed-stage1.json and sets homepage meta data.
// Refuses any host other than localhost / 127.0.0.1.
//
//   npm run zip && node test/stage1/make-fixtures.mjs
//   GHOST_ADMIN_EMAIL=… GHOST_ADMIN_PASSWORD=… node test/stage1/reset-local.mjs
import { readFileSync } from 'node:fs';

const BASE = (process.env.GHOST_URL || 'http://localhost:2368').replace(/\/$/, '');
if (!['localhost', '127.0.0.1'].includes(new URL(BASE).hostname)) { console.error('Local Ghost only.'); process.exit(2); }
const { GHOST_ADMIN_EMAIL: EMAIL, GHOST_ADMIN_PASSWORD: PASSWORD } = process.env;
if (!EMAIL || !PASSWORD) { console.error('Set GHOST_ADMIN_EMAIL and GHOST_ADMIN_PASSWORD.'); process.exit(2); }

let cookie = '';
async function admin(path, { method = 'GET', json, form } = {}) {
  const headers = { Origin: BASE, ...(cookie ? { Cookie: cookie } : {}) };
  if (json) headers['Content-Type'] = 'application/json';
  const r = await fetch(`${BASE}/ghost/api/admin${path}`, { method, headers, body: json ? JSON.stringify(json) : form });
  const sc = r.headers.get('set-cookie'); if (sc) cookie = sc.split(';')[0];
  const t = await r.text();
  if (!r.ok) throw new Error(`${method} ${path} -> ${r.status} ${t.slice(0, 300)}`);
  try { return t ? JSON.parse(t) : {}; } catch { return { text: t }; }
}
const file = (path, type) => new Blob([readFileSync(path)], { type });
const root = new URL('../../', import.meta.url).pathname;

await admin('/session/', { method: 'POST', json: { username: EMAIL, password: PASSWORD } });

await admin('/db/', { method: 'DELETE' });
console.log('✓ all content deleted');

let f = new FormData(); f.append('file', file(`${root}dist/himandme-ghost-theme.zip`, 'application/zip'), 'himandme-ghost-theme.zip');
const up = await admin('/themes/upload/', { method: 'POST', form: f });
const warnings = up.themes?.[0]?.warnings?.length || 0; const errors = up.themes?.[0]?.errors?.length || 0;
await admin('/themes/himandme-ghost-theme/activate/', { method: 'PUT' });
console.log(`✓ theme uploaded + activated (Ghost's GScan: ${errors} errors, ${warnings} warnings)`);

f = new FormData(); f.append('routes', file(`${root}routes.yaml`, 'application/x-yaml'), 'routes.yaml');
await admin('/settings/routes/yaml/', { method: 'POST', form: f });
console.log('✓ routes.yaml uploaded');

f = new FormData(); f.append('importfile', file(`${root}test/stage1/fixtures/seed-stage1.json`, 'application/json'), 'seed-stage1.json');
await admin('/db/', { method: 'POST', form: f });
for (let i = 0; i < 30; i++) {
  const n = (await admin('/posts/?limit=all&fields=id&filter=status:published')).posts.length;
  if (n >= 16) break; await new Promise((r) => setTimeout(r, 1000));
}
console.log('✓ fixtures imported');

await admin('/settings/', { method: 'PUT', json: { settings: [
  { key: 'meta_title', value: 'Him & Me — Kesihatan Lelaki' },
  { key: 'meta_description', value: 'Penilaian dan rawatan disfungsi ereksi dalam suasana yang sulit.' },
  // Settings → Growth → Network. Greyed out on localhost in the UI, so set through the API here.
  { key: 'social_web', value: false },
  { key: 'locale', value: 'ms' },
  { key: 'title', value: 'Him & Me' },
  // Settings → Site → Navigation (primary = main menu; secondary = blog categories)
  { key: 'navigation', value: JSON.stringify([
    { label: 'Utama', url: '/' }, { label: 'Disfungsi Ereksi', url: '/disfungsi-ereksi/' }, { label: 'Blog', url: '/blog/' }]) },
  { key: 'secondary_navigation', value: JSON.stringify([
    { label: 'Disfungsi Ereksi', url: '/blog/topik/disfungsi-ereksi/' }, { label: 'Gaya Hidup', url: '/blog/topik/gaya-hidup/' },
    { label: 'Panduan', url: '/blog/topik/panduan/' }]) },
] } });
console.log('✓ meta data, locale ms, navigation set; social web (Network) off');
