// Stage 7 (O20): checks the approved redirects.yaml on a LOCAL Ghost, then restores the previous redirects.
// LOCAL GHOST ONLY. It refuses any other host.
//   GHOST_ADMIN_EMAIL=… GHOST_ADMIN_PASSWORD=… node test/stage7/redirects.mjs
import { readFileSync } from 'node:fs';

const BASE = (process.env.GHOST_URL || 'http://localhost:2368').replace(/\/$/, '');
if (!['localhost', '127.0.0.1'].includes(new URL(BASE).hostname)) { console.error('Local Ghost only.'); process.exit(2); }
let cookie = '';
async function admin(path, { method = 'GET', json, form, raw } = {}) {
  const r = await fetch(`${BASE}/ghost/api/admin${path}`, { method, headers: { Origin: BASE, ...(cookie ? { Cookie: cookie } : {}), ...(json ? { 'Content-Type': 'application/json' } : {}) }, body: json ? JSON.stringify(json) : form });
  const sc = r.headers.get('set-cookie'); if (sc) cookie = sc.split(';')[0];
  const t = await r.text(); if (!r.ok) throw new Error(`${method} ${path} -> ${r.status} ${t.slice(0, 200)}`);
  if (raw) return t;
  try { return t ? JSON.parse(t) : {}; } catch { return {}; }
}
const upload = async (text) => { const f = new FormData(); f.append('redirects', new Blob([text], { type: 'application/x-yaml' }), 'redirects.yaml'); await admin('/redirects/upload/', { method: 'POST', form: f }); await new Promise((r) => setTimeout(r, 800)); };
const get = async (p) => { const r = await fetch(BASE + p, { redirect: 'manual' }); return { status: r.status, location: (r.headers.get('location') || '').replace(BASE, '') }; };
let failed = 0; const check = (id, name, ok, detail) => { if (!ok) failed++; console.log(`${ok ? '✓' : '✗'} ${id} ${name}${detail ? ` — ${detail}` : ''}`); };

await admin('/session/', { method: 'POST', json: { username: process.env.GHOST_ADMIN_EMAIL, password: process.env.GHOST_ADMIN_PASSWORD } });
const before = await admin('/redirects/download/', { raw: true });
try {
  await upload(readFileSync(new URL('../../redirects.yaml', import.meta.url), 'utf8'));
  const expect = [['/about/', '/'], ['/coming-soon/', '/'], ['/tag/news/', '/blog/'], ['/author/dr/', '/blog/penulis/dr/']];
  for (const [i, [from, to]] of expect.entries()) {
    const r = await get(from);
    check(`R${i + 1}`, `${from} → ${to} (301)`, r.status === 301 && r.location === to, `${r.status} → ${r.location}`);
  }
  const home = await get('/'); const blog = await get('/blog/');
  check('R5', 'Unrelated addresses are not redirected (/ and /blog/ return 200)', home.status === 200 && blog.status === 200, `/ ${home.status}, /blog/ ${blog.status}`);
} finally {
  await upload(before);
  const back = await admin('/redirects/download/', { raw: true });
  const ok = back.trim() === before.trim();
  console.log(`${ok ? '✓' : '✗'} restored the previous redirects`); if (!ok) failed++;
}
console.log(`\n${failed ? `${failed} failed` : 'all passed'}`);
process.exit(failed ? 1 : 0);
