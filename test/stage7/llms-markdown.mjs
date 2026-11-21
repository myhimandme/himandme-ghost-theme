// G11 (Stage 7): Ghost 6.75's LLM features must not expose #blok content blocks as Markdown.
//
// Proves on a LOCAL Ghost (finding F11, decision O30):
//   C1  control: with the LLM setting ON, a block is readable at /blog/{slug}.md (the leak exists, so the test can see it);
//   L1  with the setting OFF, every one of the 23 block .md addresses ends in 404;
//   L2  /llms.txt and /llms-full.txt are no longer served (they redirect to the homepage);
//   L3  an article's .md address redirects to its normal HTML page;
//   L4  the homepage no longer advertises llms.txt (no Link / X-Llms-Txt header).
// The original setting is restored afterwards. LOCAL GHOST ONLY: it refuses any other host and edits a local setting.
//   GHOST_ADMIN_EMAIL=… GHOST_ADMIN_PASSWORD=… node test/stage7/llms-markdown.mjs
import { BLOCKS } from '../../seed/blocks.mjs';

const BASE = (process.env.GHOST_URL || 'http://localhost:2368').replace(/\/$/, '');
if (!['localhost', '127.0.0.1'].includes(new URL(BASE).hostname)) { console.error('Local Ghost only.'); process.exit(2); }
let cookie = '';
async function admin(path, { method = 'GET', json } = {}) {
  const r = await fetch(`${BASE}/ghost/api/admin${path}`, { method, headers: { Origin: BASE, 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) }, body: json ? JSON.stringify(json) : undefined });
  const sc = r.headers.get('set-cookie'); if (sc) cookie = sc.split(';')[0];
  const t = await r.text(); if (!r.ok) throw new Error(`${method} ${path} -> ${r.status} ${t.slice(0, 200)}`);
  try { return t ? JSON.parse(t) : {}; } catch { return {}; }
}
const setLlms = async (v) => { await admin('/settings/', { method: 'PUT', json: { settings: [{ key: 'llms_enabled', value: v }] } }); await new Promise((r) => setTimeout(r, 800)); };
const final = async (p) => { const r = await fetch(BASE + p); return { status: r.status, type: r.headers.get('content-type') || '', url: r.url.replace(BASE, '') }; };
const first = async (p) => { const r = await fetch(BASE + p, { redirect: 'manual' }); return { status: r.status, location: (r.headers.get('location') || '').replace(BASE, ''), link: r.headers.get('link') || '', xllms: r.headers.get('x-llms-txt') || '' }; };
let failed = 0; const check = (id, name, ok, detail) => { if (!ok) failed++; console.log(`${ok ? '✓' : '✗'} ${id} ${name}${detail ? ` — ${detail}` : ''}`); };

await admin('/session/', { method: 'POST', json: { username: process.env.GHOST_ADMIN_EMAIL, password: process.env.GHOST_ADMIN_PASSWORD } });
const before = (await admin('/settings/')).settings.find((s) => s.key === 'llms_enabled').value;
const article = (await admin('/posts/?filter=tag:-hash-blok%2Bstatus:published&fields=slug&limit=1')).posts[0].slug;
const slugs = BLOCKS.map((b) => b.slug);
try {
  await setLlms(true);
  const c = await final(`/blog/${slugs[0]}.md`);
  check('C1', 'Control: with the LLM setting ON, a block is readable as Markdown (the leak the setting must close)', c.status === 200 && c.type.startsWith('text/markdown'), `${slugs[0]}.md → ${c.status} ${c.type}`);

  await setLlms(false);
  const res = await Promise.all(slugs.map(async (s) => [s, await final(`/blog/${s}.md`)]));
  const bad = res.filter(([, r]) => r.status !== 404);
  check('L1', `With the setting OFF, all ${slugs.length} block .md addresses end in 404`, bad.length === 0 && res.length === 23, bad.length ? bad.slice(0, 3).map(([s, r]) => `${s} ${r.status}`).join(', ') : '23/23 → 404');
  const l = await Promise.all(['/llms.txt', '/llms-full.txt'].map(async (p) => [p, await first(p)]));
  check('L2', '/llms.txt and /llms-full.txt are not served (redirect to the homepage)', l.every(([, r]) => r.status === 302 && r.location === '/'), l.map(([p, r]) => `${p} ${r.status} → ${r.location}`).join(', '));
  const a = await first(`/blog/${article}.md`);
  check('L3', "An article's .md address redirects to its HTML page", a.status === 302 && a.location === `/blog/${article}/`, `${a.status} → ${a.location}`);
  const h = await first('/');
  check('L4', 'The homepage does not advertise llms.txt', !/llms/i.test(h.link) && !h.xllms, `Link "${h.link}", X-Llms-Txt "${h.xllms}"`);
} finally {
  await setLlms(before);
  const now = (await admin('/settings/')).settings.find((s) => s.key === 'llms_enabled').value;
  console.log(`${now === before ? '✓' : '✗'} restored llms_enabled = ${before}`); if (now !== before) failed++;
}
console.log(`\n${failed ? `${failed} failed` : 'all passed'}`);
process.exit(failed ? 1 : 0);
