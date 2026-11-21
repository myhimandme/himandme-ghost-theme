// Re-uploads and activates dist/himandme-ghost-theme.zip on a LOCAL Ghost without touching content.
// Optional: --set key=value … updates theme settings (e.g. --set doctor_author_slug=dr).
//   npm run zip && GHOST_ADMIN_EMAIL=… GHOST_ADMIN_PASSWORD=… node test/upload-theme-local.mjs
import { readFileSync } from 'node:fs';
const BASE = (process.env.GHOST_URL || 'http://localhost:2368').replace(/\/$/, '');
if (!['localhost', '127.0.0.1'].includes(new URL(BASE).hostname)) { console.error('Local Ghost only.'); process.exit(2); }
let cookie = '';
async function admin(path, { method = 'GET', json, form } = {}) {
  const headers = { Origin: BASE, ...(cookie ? { Cookie: cookie } : {}), ...(json ? { 'Content-Type': 'application/json' } : {}) };
  const r = await fetch(`${BASE}/ghost/api/admin${path}`, { method, headers, body: json ? JSON.stringify(json) : form });
  const sc = r.headers.get('set-cookie'); if (sc) cookie = sc.split(';')[0];
  const t = await r.text(); if (!r.ok) throw new Error(`${method} ${path} -> ${r.status} ${t.slice(0, 400)}`);
  try { return t ? JSON.parse(t) : {}; } catch { return {}; }
}
await admin('/session/', { method: 'POST', json: { username: process.env.GHOST_ADMIN_EMAIL, password: process.env.GHOST_ADMIN_PASSWORD } });
const f = new FormData();
f.append('file', new Blob([readFileSync(new URL('../dist/himandme-ghost-theme.zip', import.meta.url))], { type: 'application/zip' }), 'himandme-ghost-theme.zip');
const up = await admin('/themes/upload/', { method: 'POST', form: f });
await admin('/themes/himandme-ghost-theme/activate/', { method: 'PUT' });
console.log(`✓ theme uploaded + activated (GScan: ${up.themes?.[0]?.errors?.length || 0} errors, ${up.themes?.[0]?.warnings?.length || 0} warnings)`);
const sets = process.argv.filter((a, i) => process.argv[i - 1] === '--set').map((kv) => kv.split('='));
if (sets.length) {
  const cs = (await admin('/custom_theme_settings/')).custom_theme_settings;
  await admin('/custom_theme_settings/', { method: 'PUT', json: { custom_theme_settings: cs.map((s) => { const hit = sets.find(([k]) => k === s.key); return hit ? { key: s.key, value: hit[1] } : { key: s.key, value: s.value }; }) } });
  console.log('✓ settings:', sets.map(([k, v]) => `${k}=${v}`).join(', '));
}
