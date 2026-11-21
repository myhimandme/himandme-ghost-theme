// Stage 7 check: the author archive (/blog/penulis/{slug}/) with a REAL, non-placeholder staff slug.
//
// Why: routes.yaml ships with the placeholder slug "dr", and the local test profile's slug is also "dr",
// so the earlier suites could never notice a slug mismatch. Ghost's author TAXONOMY ignores collection
// filters; only the filtered channel route keeps #blok content blocks out. This test proves, on a
// local Ghost 6.x, that:
//   P  routes.yaml rendered with the staff slug -> author page, every page of its pagination, its RSS,
//      the author sitemap and the article byline show genuine articles only (exact match with Ghost's
//      own list of the author's non-block posts), and no other archive route exposes a block;
//   N1 negative control: staff slug changed but routes.yaml NOT updated -> blocks ARE exposed
//      (proves the detector works and that replacing the slug is mandatory);
//   N2 a second staff user who authors a block, without a channel of their own -> exposed;
//      with a channel for that slug -> clean (decides the "who owns the blocks" rule for the import).
// Everything is restored afterwards (staff slug, routes.yaml, block author, temporary user).
//
// LOCAL GHOST ONLY. It refuses any other host and edits local data.
//   GHOST_ADMIN_EMAIL=… GHOST_ADMIN_PASSWORD=… [AUTHOR_SLUG=dr-slug-ujian] node test/stage7/author-archive.mjs
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const BASE = (process.env.GHOST_URL || 'http://localhost:2368').replace(/\/$/, '');
if (!['localhost', '127.0.0.1'].includes(new URL(BASE).hostname)) { console.error('Local Ghost only.'); process.exit(2); }
const EMAIL = process.env.GHOST_ADMIN_EMAIL, PASSWORD = process.env.GHOST_ADMIN_PASSWORD;
if (!EMAIL || !PASSWORD) { console.error('Set GHOST_ADMIN_EMAIL and GHOST_ADMIN_PASSWORD (local dev account).'); process.exit(2); }
// Stand-in for the doctor's real production slug (unknown until the owner supplies it). Any slug works.
const SLUG = process.env.AUTHOR_SLUG || 'dr-slug-ujian';
const DB = process.env.GHOST_DB || '/home/ghostdev/ghost-local/content/data/ghost-local.db';
const SQLITE = process.env.SQLITE_MODULE || '/home/ghostdev/ghost-local/current/node_modules/better-sqlite3';
const REPO_ROUTES = readFileSync(new URL('../../routes.yaml', import.meta.url), 'utf8');

let cookie = '';
async function admin(path, { method = 'GET', json, form } = {}) {
  const headers = { Origin: BASE, ...(cookie ? { Cookie: cookie } : {}), ...(json ? { 'Content-Type': 'application/json' } : {}) };
  const r = await fetch(`${BASE}/ghost/api/admin${path}`, { method, headers, body: json ? JSON.stringify(json) : form });
  const sc = r.headers.get('set-cookie'); if (sc) cookie = sc.split(';')[0];
  const t = await r.text(); if (!r.ok) throw new Error(`${method} ${path} -> ${r.status} ${t.slice(0, 300)}`);
  try { return t ? JSON.parse(t) : {}; } catch { return { text: t }; }
}
async function get(path) {
  const r = await fetch(BASE + path, { redirect: 'manual' });
  return { status: r.status, location: r.headers.get('location'), body: r.status === 200 ? await r.text() : '' };
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = []; let failed = 0;
function check(id, name, ok, detail) { results.push({ id, name, ok, detail }); if (!ok) failed++; console.log(`${ok ? '✓' : '✗'} ${id} ${name}${detail ? ` — ${detail}` : ''}`); }

// The substitution the release will apply: exactly 3 occurrences of the placeholder in the author channel.
export function renderRoutes(src, slug) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`Not a Ghost slug: ${slug}`);
  const hits = [/^  \/blog\/penulis\/dr\/:$/m, /authors:dr\+tag:-hash-blok/, /data: author\.dr$/m];
  if (!hits.every((re) => re.test(src))) throw new Error('routes.yaml: placeholder lines not found (already replaced?)');
  const out = src.replace(/^  \/blog\/penulis\/dr\/:$/m, `  /blog/penulis/${slug}/:`)
    .replace('authors:dr+tag:-hash-blok', `authors:${slug}+tag:-hash-blok`).replace(/data: author\.dr$/m, `data: author.${slug}`);
  const n = (out.match(new RegExp(`\\b${slug.replace(/-/g, '\\-')}\\b`, 'g')) || []).length;
  if (n < 3) throw new Error(`routes.yaml: expected 3 replacements, got ${n}`);
  return out;
}
async function uploadRoutes(text) {
  const f = new FormData(); f.append('routes', new Blob([text], { type: 'application/x-yaml' }), 'routes.yaml');
  await admin('/settings/routes/yaml/', { method: 'POST', form: f }); await sleep(1500);
}
async function downloadRoutes() {
  const r = await fetch(`${BASE}/ghost/api/admin/settings/routes/yaml/`, { headers: { Origin: BASE, Cookie: cookie } });
  if (!r.ok) throw new Error(`routes download ${r.status}`); return r.text();
}
async function allPosts(filter) {
  const out = []; let page = 1;
  for (;;) {
    const r = await admin(`/posts/?filter=${encodeURIComponent(filter)}&fields=id,slug,title&limit=100&page=${page}`);
    out.push(...r.posts); if (!r.meta.pagination.next) return out; page = r.meta.pagination.next;
  }
}

// Read-only archive inspector (the same logic is reused by the production smoke test, GET only).
export async function inspectAuthor(getFn, slug, blocks) {
  const blockSlugs = new Set(blocks.map((b) => b.slug)), blockTitles = new Set(blocks.map((b) => b.title));
  const listed = [], leaks = [], pages = [];
  for (let n = 1; n <= 30; n++) {
    const path = n === 1 ? `/blog/penulis/${slug}/` : `/blog/penulis/${slug}/page/${n}/`;
    const r = await getFn(path); pages.push([path, r.status]);
    if (r.status !== 200) break;
    const s = [...r.body.matchAll(/data-slug="([^"]+)"/g)].map((m) => m[1]); listed.push(...s);
    for (const x of s) if (blockSlugs.has(x)) leaks.push(`${path}: card ${x}`);
    if (/href="[^"]*\/404\/"/.test(r.body)) leaks.push(`${path}: a link to /404/ (a block card)`);
    for (const b of blockSlugs) if (r.body.includes(b)) leaks.push(`${path}: block slug ${b} in HTML`);
  }
  const rss = await getFn(`/blog/penulis/${slug}/rss/`);
  const rssTitles = [...rss.body.matchAll(/<item>[\s\S]*?<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/g)].map((m) => m[1]);
  for (const t of rssTitles) if (blockTitles.has(t)) leaks.push(`RSS item "${t}"`);
  for (const b of blockSlugs) if (rss.body.includes(`/${b}/`)) leaks.push(`RSS link to ${b}`);
  return { listed, leaks, pages, rss: { status: rss.status, items: rssTitles.length } };
}

const sqlite = (sql, ...args) => {
  // run through a child node process (CommonJS require of better-sqlite3); local dev DB only
  return JSON.parse(execFileSync(process.execPath, ['-e', `const D=require(${JSON.stringify(SQLITE)});const d=new D(${JSON.stringify(DB)});const s=d.prepare(${JSON.stringify(sql)});const a=${JSON.stringify(args)};console.log(JSON.stringify(s.reader?s.all(...a):s.run(...a)))`]).toString());
};

await admin('/session/', { method: 'POST', json: { username: EMAIL, password: PASSWORD } });
const originalRoutes = await downloadRoutes();
const me = (await admin('/users/me/')).users[0];
const originalSlug = me.slug;
const blocks = await allPosts('tag:hash-blok+status:published');
const T2 = { id: 'aaaaaaaaaaaaaaaaaaaaaaa7', slug: 'staf-kedua-ujian' };
let movedBlock = null;
console.log(`Local Ghost ${BASE} · staff "${me.name}" slug "${originalSlug}" · ${blocks.length} published #blok blocks · test slug "${SLUG}"\n`);
check('A0', 'Precondition: the test profile authors #blok blocks (so a leak is possible and detectable)',
  (await allPosts(`authors:${originalSlug}+tag:hash-blok+status:published`)).length > 0);

try {
  // ---------- P: production-like: staff slug = SLUG, routes rendered with SLUG ----------
  await admin(`/users/${me.id}/`, { method: 'PUT', json: { users: [{ slug: SLUG }] } });
  const rendered = renderRoutes(REPO_ROUTES, SLUG);
  check('A1', 'routes.yaml renders with the real slug in exactly the 3 placeholder places; no "dr" left in the channel',
    !/penulis\/dr\/|authors:dr\+|author\.dr$/m.test(rendered) && rendered.includes(`/blog/penulis/${SLUG}/:`) && rendered.includes(`authors:${SLUG}+tag:-hash-blok`) && rendered.includes(`data: author.${SLUG}`));
  await uploadRoutes(rendered);
  check('A2', 'Ghost 6 accepts the rendered routes.yaml (stored copy equals what was uploaded)', (await downloadRoutes()).trim() === rendered.trim());

  const expected = (await allPosts(`authors:${SLUG}+tag:-hash-blok+status:published`)).map((p) => p.slug);
  const first = await get(`/blog/penulis/${SLUG}/`);
  check('A3', 'Author page renders author.hbs with the profile', first.status === 200 && /data-template="author"/.test(first.body) && first.body.includes(me.name), `HTTP ${first.status}`);
  const P = await inspectAuthor(get, SLUG, blocks);
  const same = P.listed.length === expected.length && [...P.listed].sort().join() === [...expected].sort().join();
  check('A4', 'Every page of the archive lists exactly the author\'s genuine articles (no block, none missing, no duplicate)', same && new Set(P.listed).size === P.listed.length,
    `${P.listed.length} listed over ${P.pages.filter(([, s]) => s === 200).length} pages; Ghost says ${expected.length}`);
  check('A5', 'No block on any page (cards, /404/ links, slugs) or in the author RSS', P.leaks.length === 0 && P.rss.status === 200, P.leaks.slice(0, 5).join('; ') || `RSS ${P.rss.items} items`);
  const last = P.pages[P.pages.length - 1];
  check('A6', 'Pagination ends cleanly: the page after the last returns 404', last[1] === 404, P.pages.map(([p, s]) => `${p.replace(`/blog/penulis/${SLUG}`, '')} ${s}`).join(', '));
  const others = await Promise.all([`/author/${SLUG}/`, `/blog/penulis/${SLUG}/page/1/`, '/blog/penulis/dr/', `/blog/penulis/${SLUG}/page/99/`, '/blog/penulis/', `/author/${SLUG}/rss/`].map(async (p) => [p, (await get(p)).status]));
  check('A7', 'Other archive routes: default /author/ URLs, the old placeholder /blog/penulis/dr/, out-of-range pages and the bare base do not serve a listing',
    others.every(([p, s]) => (p.endsWith('/page/1/') ? s === 301 : s === 404)), others.map(([p, s]) => `${p} ${s}`).join(', '));
  const sm = await get('/sitemap-authors.xml');
  check('A8', 'Author sitemap lists /blog/penulis/{slug}/ and nothing under /author/', sm.body.includes(`/blog/penulis/${SLUG}/`) && !sm.body.includes('/author/'));
  const art = await get(`/blog/${expected[0]}/`);
  check('A9', 'Article byline and author box link to the new archive URL', (art.body.match(new RegExp(`href="[^"]*/blog/penulis/${SLUG}/"`, 'g')) || []).length >= 2);
  const home = await get('/');
  check('A10', 'Homepage team card: when the theme setting doctor_author_slug no longer matches the staff slug, the placeholder "[Nama Penuh]" shows (so the setting must be updated together with routes.yaml)', home.body.includes('[Nama Penuh]') || !home.body.includes(me.name), home.body.includes('[Nama Penuh]') ? 'placeholder shown, as expected while the setting is unset' : 'setting points elsewhere');

  // ---------- N1: negative control: slug changed, routes.yaml left with "dr" ----------
  await uploadRoutes(REPO_ROUTES);
  const N1 = await inspectAuthor(get, SLUG, blocks);
  check('N1', 'Control: with routes.yaml NOT updated, the taxonomy page EXPOSES blocks (the detector catches it; replacing the slug is mandatory)',
    N1.leaks.length > 0, `${N1.leaks.length} leaks, e.g. ${N1.leaks[0] || 'none'}`);

  // ---------- N2: a second staff user authoring a block ----------
  await uploadRoutes(rendered);
  const role = sqlite("select r.id from roles r where r.name='Editor'")[0].id;
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
  sqlite(`insert into users (id,name,slug,password,email,status,visibility,created_at) values (?,?,?,?,?,?,?,?)`, T2.id, 'Staf Kedua Ujian', T2.slug, 'x', 'staf-kedua@himandme.local', 'active', 'public', now);
  sqlite('insert into roles_users (id,role_id,user_id) values (?,?,?)', 'aaaaaaaaaaaaaaaaaaaaaaa8', role, T2.id);
  const blk = (await admin(`/posts/${blocks[0].id}/?fields=id,updated_at`)).posts[0];
  await admin(`/posts/${blk.id}/`, { method: 'PUT', json: { posts: [{ updated_at: blk.updated_at, authors: [{ id: T2.id }, { id: me.id }] }] } });
  movedBlock = blk.id; await sleep(800);
  const N2a = await inspectAuthor(get, T2.slug, blocks);
  check('N2a', 'A second staff user who authors a block, with no channel of their own: their taxonomy page EXPOSES the block', N2a.leaks.length > 0, `${N2a.leaks.length} leaks`);
  const P2 = await inspectAuthor(get, SLUG, blocks);
  check('N2b', 'The doctor\'s channel stays clean while the block has a second author', P2.leaks.length === 0);
  const two = rendered.replace('\ncollections:', `  /blog/penulis/${T2.slug}/:\n    controller: channel\n    filter: authors:${T2.slug}+tag:-hash-blok\n    template: author\n    data: author.${T2.slug}\n\ncollections:`);
  await uploadRoutes(two);
  const N2c = await inspectAuthor(get, T2.slug, blocks);
  check('N2c', 'With a filtered channel for that staff slug too, their archive is clean', N2c.leaks.length === 0, `${N2c.listed.length} articles listed`);
} finally {
  // ---------- restore ----------
  if (movedBlock) { const b = (await admin(`/posts/${movedBlock}/?fields=id,updated_at`)).posts[0]; await admin(`/posts/${movedBlock}/`, { method: 'PUT', json: { posts: [{ updated_at: b.updated_at, authors: [{ id: me.id }] }] } }); }
  try { sqlite('delete from roles_users where user_id=?', T2.id); sqlite('delete from posts_authors where author_id=?', T2.id); sqlite('delete from users where id=?', T2.id); } catch (e) { console.error('cleanup user:', e.message); }
  await admin(`/users/${me.id}/`, { method: 'PUT', json: { users: [{ slug: originalSlug }] } });
  await uploadRoutes(originalRoutes);
  const ok = (await get(`/blog/penulis/${originalSlug}/`)).status === 200 && (await downloadRoutes()).trim() === originalRoutes.trim();
  console.log(`\n${ok ? '✓' : '✗'} restored: staff slug "${originalSlug}", original routes.yaml, block author, temporary user removed`);
  if (!ok) failed++;
}
console.log(`\n${results.length - results.filter((r) => !r.ok).length} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
