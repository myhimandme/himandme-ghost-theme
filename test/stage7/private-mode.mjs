// Stage 7 check: what Ghost 6.x "private site" mode actually hides, measured on a LOCAL Ghost.
// Decides the migration protection (docs/STAGE-7-PLAN.md §3.6). It turns private mode on, requests
// every public surface anonymously (pages, archives, RSS, sitemaps, block URLs, Content API, search
// index, ActivityPub/webfinger), checks that a visitor with the private-site password sees the site,
// then restores the previous setting. LOCAL GHOST ONLY.
//   GHOST_ADMIN_EMAIL=… GHOST_ADMIN_PASSWORD=… node test/stage7/private-mode.mjs
import { randomBytes } from 'node:crypto';
const BASE = (process.env.GHOST_URL || 'http://localhost:2368').replace(/\/$/, '');
if (!['localhost', '127.0.0.1'].includes(new URL(BASE).hostname)) { console.error('Local Ghost only.'); process.exit(2); }
let cookie = '';
async function admin(path, { method = 'GET', json } = {}) {
  const r = await fetch(`${BASE}/ghost/api/admin${path}`, { method, headers: { Origin: BASE, 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) }, body: json ? JSON.stringify(json) : undefined });
  const sc = r.headers.get('set-cookie'); if (sc) cookie = sc.split(';')[0];
  const t = await r.text(); if (!r.ok) throw new Error(`${method} ${path} -> ${r.status} ${t.slice(0, 300)}`); try { return t ? JSON.parse(t) : {}; } catch { return {}; }
}
const get = async (p, headers = {}) => { const r = await fetch(BASE + p, { redirect: 'manual', headers }); return { status: r.status, location: r.headers.get('location') || '', type: r.headers.get('content-type') || '', cache: r.headers.get('cache-control') || '', robots: r.headers.get('x-robots-tag') || '', body: await r.text() }; };
const results = []; let failed = 0;
const check = (id, name, ok, detail) => { results.push({ id, ok }); if (!ok) failed++; console.log(`${ok ? '✓' : '✗'} ${id} ${name}${detail ? ` — ${detail}` : ''}`); };

await admin('/session/', { method: 'POST', json: { username: process.env.GHOST_ADMIN_EMAIL, password: process.env.GHOST_ADMIN_PASSWORD } });
const settings = (await admin('/settings/')).settings; const val = (k) => settings.find((s) => s.key === k)?.value;
const before = { is_private: val('is_private'), password: val('password') };
const key = ((await get('/blog/')).body.match(/data-key="([a-f0-9]{26})"/) || [])[1];
const blocks = (await admin('/posts/?filter=tag:hash-blok%2Bstatus:published&fields=slug,title&limit=100')).posts;
const article = (await admin('/posts/?filter=tag:-hash-blok%2Bstatus:published&fields=slug&limit=1')).posts[0].slug;
const authorSlug = (await admin('/users/me/')).users[0].slug;
const blockTitle = blocks.find((b) => b.slug === 'blok-utama-hero').title;
const capi = (p) => `/ghost/api/content/${p}${p.includes('?') ? '&' : '?'}key=${key}`;
const PAGES = ['/', '/blog/', '/blog/page/2/', '/disfungsi-ereksi/', '/notis-privasi/', `/blog/${article}/`, '/blog/topik/disfungsi-ereksi/', `/blog/penulis/${authorSlug}/`, '/jurnal/'];
const FEEDS = ['/rss/', '/blog/rss/', '/blog/topik/disfungsi-ereksi/rss/', `/blog/penulis/${authorSlug}/rss/`];
const MAPS = ['/sitemap.xml', '/sitemap-posts.xml', '/sitemap-pages.xml', '/sitemap-tags.xml', '/sitemap-authors.xml'];
const BLOCKURLS = ['/blog/blok-utama-hero/', '/blok-utama-hero/', '/p/blok-utama-hero/'];
console.log(`Local Ghost ${BASE} · private mode before: ${before.is_private} · ${blocks.length} blocks · Content API key found in page: ${!!key}\n`);

// Baseline (public): show what is exposed without protection
const base = { api: await get(capi('posts/?filter=tag:hash-blok&limit=all&fields=slug')), idx: await get(capi('search-index/posts/')) };
check('B0', 'Baseline, site public: the Content API returns blocks (by design: blocks are public copy only)', base.api.status === 200 && JSON.parse(base.api.body).posts.length === blocks.length, `${JSON.parse(base.api.body).posts?.length} blocks via API`);

const pw = randomBytes(9).toString('base64url');
try {
  await admin('/settings/', { method: 'PUT', json: { settings: [{ key: 'is_private', value: true }, { key: 'password', value: pw }] } });
  await new Promise((r) => setTimeout(r, 800));
  const pages = await Promise.all(PAGES.map(async (p) => [p, await get(p)]));
  check('P1', 'Every page and archive redirects anonymous visitors to the password page (/private/)', pages.every(([, r]) => r.status === 302 && r.location.includes('/private/')), pages.map(([p, r]) => `${p} ${r.status}`).join(', '));
  const feeds = await Promise.all(FEEDS.map(async (p) => [p, await get(p)]));
  check('P2', 'RSS feeds: 302 to /private/; nothing given to anonymous visitors (no item, no block title)', feeds.every(([, r]) => r.status === 302 && r.location.includes('/private/') && !/<item>/.test(r.body) && !r.body.includes(blockTitle)), feeds.map(([p, r]) => `${p} ${r.status}`).join(', '));
  const maps = await Promise.all(MAPS.map(async (p) => [p, await get(p)]));
  check('P3', 'Sitemaps: 302 to /private/; nothing given (no <loc>, no blok- URL)', maps.every(([, r]) => r.status === 302 && r.location.includes('/private/') && !/<loc>/.test(r.body) && !r.body.includes('blok-')), maps.map(([p, r]) => `${p} ${r.status}`).join(', '));
  const robots = await get('/robots.txt');
  check('P4', 'robots.txt is served directly (HTTP 200, NOT redirected to /private/) and disallows everything while private',
    robots.status === 200 && !robots.location && /^text\/plain/.test(robots.type) && /Disallow:\s*\/\s*$/m.test(robots.body),
    `HTTP ${robots.status}; ${robots.type}; cache-control "${robots.cache}"; body "${robots.body.replace(/\s+/g, ' ').trim().slice(0, 80)}"`);
  const bl = await Promise.all(BLOCKURLS.map(async (p) => [p, await get(p)]));
  check('P5', 'Block URLs give nothing (redirect to /private/ or 404, never the block)', bl.every(([, r]) => !r.body.includes(blockTitle)), bl.map(([p, r]) => `${p} ${r.status}`).join(', '));
  const api = await get(capi('posts/?filter=tag:hash-blok&limit=all&fields=slug,title'));
  const apiN = api.status === 200 ? JSON.parse(api.body).posts.length : 0;
  check('P6', 'MEASURED: does private mode close the Content API? (needs the 26-character key, which only the page source reveals)', true, `HTTP ${api.status}; ${apiN} blocks returned → ${apiN ? 'NOT closed: the key must not be obtainable during the window' : 'closed'}`);
  const idx = await get(capi('search-index/posts/'));
  check('P7', 'MEASURED: search index while private', true, `HTTP ${idx.status}${idx.status === 200 ? `; ${JSON.parse(idx.body).posts?.length} entries` : ''}`);
  const keyLeak = pages.some(([, r]) => key && r.body.includes(key));
  check('P8', 'The private password page does not reveal the Content API key (so it cannot be learned during the window)', !keyLeak);
  const wf = await get('/.well-known/webfinger?resource=acct:index@localhost'), ap = await get('/.ghost/activitypub/users/index');
  check('P9', 'MEASURED: ActivityPub endpoints while private (Network must be OFF regardless)', true, `webfinger ${wf.status}, actor ${ap.status}`);
  // Owner can still review: log in with the private password
  const form = new URLSearchParams({ password: pw });
  const login = await fetch(`${BASE}/private/?r=%2F`, { method: 'POST', body: form, redirect: 'manual', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
  const pcookie = (login.headers.get('set-cookie') || '').split(';')[0];
  const home = await get('/', { Cookie: pcookie }), blog = await get('/blog/', { Cookie: pcookie });
  check('P10', 'With the private-site password the owner can review the whole new site (homepage and blog render)', home.status === 200 && /data-template="home"/.test(home.body) && blog.status === 200, `login ${login.status}; / ${home.status}; /blog/ ${blog.status}`);
  check('P11', 'Private pages are sent as non-cacheable (safe behind Cloudflare); robots.txt already disallows all (P4)', /private|no-cache|no-store/.test(home.cache), `cache-control "${home.cache}"; x-robots-tag "${home.robots}"`);
} finally {
  await admin('/settings/', { method: 'PUT', json: { settings: [{ key: 'is_private', value: before.is_private }, ...(before.password ? [{ key: 'password', value: before.password }] : [])] } });
  const after = (await admin('/settings/')).settings.find((s) => s.key === 'is_private').value;
  const pub = await get('/');
  const ok = after === before.is_private && pub.status === 200;
  console.log(`\n${ok ? '✓' : '✗'} restored: private mode ${after}; / HTTP ${pub.status}`); if (!ok) failed++;
}
console.log(`\n${results.filter((r) => r.ok).length} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
