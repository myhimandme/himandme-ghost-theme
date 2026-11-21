// G6 (Stage 7): READ-ONLY production smoke test (docs/STAGE-7-PLAN.md §1.4, §3.6 D2b, §7, §16.8).
//
// It only sends GET requests: no Admin login, no form posts, no edits. Allowed hosts: himandme.my,
// www.himandme.my, and localhost / 127.0.0.1 (for testing the script itself).
//
// Modes:
//   node test/prod/smoke.mjs --base https://himandme.my --expect-private [--urls old-urls.txt]
//        D2b: while private mode is on, every page, feed and sitemap redirects to /private/; robots.txt is
//        served directly with "Disallow: /"; http and www first redirect to https://himandme.my; no
//        cached copy (cf-cache-status HIT/STALE/UPDATING/REVALIDATED) is served.
//   node test/prod/smoke.mjs --base https://himandme.my [--cookie]
//        Phase F (with the private-site cookie in SMOKE_COOKIE, e.g. "ghost-private=…") and Phase H3
//        (anonymous): pages, #blok exclusion everywhere, every author archive, the O28 block-ownership
//        rule, G11 (.md and llms.txt), placeholders, security headers, robots.txt, http/www redirects.
// Options: --author dr (expected owner of every #blok post), --skip a,b (check groups to skip; reported).
import { readFileSync } from 'node:fs';
import { BLOCKS } from '../../seed/blocks.mjs';
import { scanText } from '../../scripts/check-placeholders.mjs';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const BASE = (opt('--base', 'https://himandme.my')).replace(/\/$/, '');
const HOST = new URL(BASE).hostname;
if (!['himandme.my', 'www.himandme.my', 'localhost', '127.0.0.1'].includes(HOST)) { console.error(`Refusing host ${HOST}.`); process.exit(2); }
const LOCAL = ['localhost', '127.0.0.1'].includes(HOST);
const AUTHOR = opt('--author', 'dr');
const SKIP = new Set((opt('--skip', '') || '').split(',').filter(Boolean));
const COOKIE = args.includes('--cookie') ? process.env.SMOKE_COOKIE || '' : '';
if (args.includes('--cookie') && !COOKIE) { console.error('--cookie needs SMOKE_COOKIE (the private-site cookie, e.g. "ghost-private=…").'); process.exit(2); }
const BLOCK_SLUGS = BLOCKS.map((b) => b.slug);
const BLOCK_TITLES = BLOCKS.map((b) => b.title).filter((t) => t && t.length > 12);

const results = [];
const check = (group, id, name, ok, detail = '') => { results.push({ group, ok }); console.log(`${ok ? '✓' : '✗'} [${group}] ${id} ${name}${detail ? ` — ${detail}` : ''}`); };
const skipped = (group) => { if (SKIP.has(group)) { console.log(`- [${group}] SKIPPED (--skip)`); return true; } return false; };
async function get(url, { follow = false } = {}) {
  const u = url.startsWith('http') ? url : BASE + url;
  const r = await fetch(u, { method: 'GET', redirect: follow ? 'follow' : 'manual', headers: COOKIE ? { Cookie: COOKIE } : {} });
  const body = r.status === 200 ? await r.text() : '';
  return { status: r.status, url: r.url, location: r.headers.get('location') || '', type: r.headers.get('content-type') || '', cf: r.headers.get('cf-cache-status') || '', headers: r.headers, body };
}
const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const pathOf = (u) => new URL(u).pathname;
const leaks = (html) => { const out = []; for (const s of BLOCK_SLUGS) if (html.includes(`/${s}/`) || html.includes(`data-slug="${s}"`)) out.push(s); if (/href="[^"]*\/404\/"/.test(html)) out.push('link to /404/'); return out; };

async function expectPrivate() {
  const list = ['/', '/rss/', '/sitemap.xml', '/sitemap-posts.xml', '/blog/', '/disfungsi-ereksi/'];
  const file = opt('--urls');
  if (file) list.push(...readFileSync(file, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean).map(pathOf));
  const uniq = [...new Set(list)];
  const bad = [];
  for (const p of uniq) {
    const r = await get(p);
    const okRedirect = r.status === 302 && r.location.replace(BASE, '').startsWith('/private/');
    const cached = /^(HIT|STALE|UPDATING|REVALIDATED)$/i.test(r.cf);
    if (!okRedirect || cached) bad.push(`${p} ${r.status} → ${r.location || '-'}${r.cf ? ` cf=${r.cf}` : ''}`);
  }
  check('private', 'P1', `Every listed URL (${uniq.length}) redirects to /private/ and none is served from cache`, bad.length === 0, bad.slice(0, 5).join('; '));
  const rb = await get('/robots.txt');
  check('private', 'P2', 'robots.txt is served directly (200) and contains "Disallow: /"', rb.status === 200 && /^Disallow:\s*\/\s*$/m.test(rb.body), `HTTP ${rb.status}`);
  if (!LOCAL) await variants(true);
}

async function variants(privateMode) {
  if (skipped('redirects')) return;
  for (const u of ['http://himandme.my/', 'https://www.himandme.my/', 'http://www.himandme.my/']) {
    const r = await fetch(u, { redirect: 'manual' });
    const loc = r.headers.get('location') || '';
    check('redirects', 'V1', `${u} first redirects to https://himandme.my/`, [301, 308].includes(r.status) && loc.startsWith('https://himandme.my/'), `${r.status} → ${loc}`);
  }
  if (privateMode) return;
  const w = await fetch('https://www.himandme.my/blog/', { redirect: 'manual' });
  check('redirects', 'V2', 'www keeps the path (https://www.himandme.my/blog/ → https://himandme.my/blog/)', w.headers.get('location') === 'https://himandme.my/blog/', w.headers.get('location') || '');
}

async function publicChecks() {
  // Pages
  if (!skipped('pages')) {
    const core = await Promise.all(['/', '/disfungsi-ereksi/', '/notis-privasi/', '/blog/'].map(async (p) => [p, (await get(p)).status]));
    check('pages', 'G1', 'Core pages return 200', core.every(([, s]) => s === 200), core.map(([p, s]) => `${p} ${s}`).join(', '));
    const j = await get('/jurnal/');
    check('pages', 'G2', '/jurnal/ redirects (301) to /blog/', j.status === 301 && j.location.replace(BASE, '') === '/blog/', `${j.status} → ${j.location}`);
    const n = await get('/smoke-test-does-not-exist/');
    check('pages', 'G3', 'An unknown address returns 404', n.status === 404, `${n.status}`);
  }
  // Sitemaps and #blok exclusion
  const sp = await get('/sitemap-posts.xml'); const sa = await get('/sitemap-authors.xml'); const st = await get('/sitemap-tags.xml');
  const authorUrls = locs(sa.body); const tagUrls = locs(st.body); const postUrls = locs(sp.body);
  if (!skipped('blok')) {
    check('blok', 'B1', 'sitemap-posts.xml lists no block', sp.status === 200 && !/blok-/.test(sp.body), `${postUrls.length} posts`);
    for (const f of ['/rss/', '/blog/rss/']) {
      const r = await get(f); const hit = BLOCK_SLUGS.filter((s) => r.body.includes(s)).concat(BLOCK_TITLES.filter((t) => r.body.includes(`<![CDATA[${t}]]>`)));
      // /rss/ has no collection at the site root (the blog lives under /blog/), so a 404 there is correct.
      // While private mode is on, Ghost turns RSS off entirely (404), even with the private-site cookie.
      const okStatus = r.status === 200 || (r.status === 404 && (f === '/rss/' || COOKIE));
      check('blok', 'B2', `${f} contains no block`, okStatus && hit.length === 0, hit.slice(0, 3).join(', ') || `HTTP ${r.status}`);
    }
    // Ghost answers some excluded posts with a 301 to /404/, so the final status (after redirects) is checked.
    const urls = await Promise.all(BLOCK_SLUGS.map(async (s) => [s, (await get(`/blog/${s}/`, { follow: true })).status]));
    const open = urls.filter(([, st2]) => st2 !== 404);
    check('blok', 'B3', 'All 23 block addresses /blog/{slug}/ end in 404', open.length === 0, open.map(([s, x]) => `${s} ${x}`).slice(0, 3).join(', ') || '23/23 → 404');
    const it = await get('/blog/topik/hash-blok/');
    check('blok', 'B4', 'The internal tag has no public archive (/blog/topik/hash-blok/ → 404)', it.status === 404, `${it.status}`);
    for (const t of tagUrls) {
      const r = await get(pathOf(t)); const l = leaks(r.body);
      check('blok', 'B5', `Topic archive ${pathOf(t)} shows no block`, r.status === 200 && l.length === 0, l.slice(0, 3).join(', ') || `HTTP ${r.status}`);
    }
  }
  // Every author archive (all pages + RSS), §16.8
  if (!skipped('authors')) {
    check('authors', 'A0', `sitemap-authors.xml lists /blog/penulis/${AUTHOR}/`, authorUrls.some((u) => pathOf(u) === `/blog/penulis/${AUTHOR}/`), authorUrls.map(pathOf).join(', '));
    for (const a of authorUrls) {
      const base = pathOf(a); const found = []; let pages = 0;
      for (let n = 1; n <= 30; n++) {
        const r = await get(n === 1 ? base : `${base}page/${n}/`); if (r.status !== 200) break;
        pages++; found.push(...leaks(r.body));
      }
      const rss = await get(`${base}rss/`); found.push(...BLOCK_SLUGS.filter((s) => rss.body.includes(s)));
      check('authors', 'A1', `Author archive ${base} (${pages} page(s) + RSS) shows no block`, pages > 0 && found.length === 0, found.slice(0, 3).join(', '));
    }
  }
  // O28: every #blok post has exactly one author, AUTHOR (public Content API; fails even if a containment route hides a block)
  if (!skipped('ownership')) {
    const home = await get('/');
    const key = (home.body.match(/data-key="([a-f0-9]{26})"/) || [])[1];
    const api = ((home.body.match(/data-api="([^"]+)"/) || [])[1] || `${BASE}/ghost/api/content/`).replace(/\/?$/, '/');
    if (!key) check('ownership', 'O1', 'Content API key found on the homepage', false, 'no data-key attribute');
    else {
      const r = await fetch(`${api}posts/?key=${key}&filter=${encodeURIComponent('tag:hash-blok')}&include=authors&fields=slug&limit=all`);
      const posts = r.ok ? (await r.json()).posts : [];
      const wrong = posts.filter((p) => !(p.authors && p.authors.length === 1 && p.authors[0].slug === AUTHOR));
      check('ownership', 'O1', `Every #blok post has exactly one author, "${AUTHOR}" (O28)`, r.ok && posts.length === 23 && wrong.length === 0,
        `${posts.length} blocks; ${wrong.length ? `not owned only by ${AUTHOR}: ${wrong.slice(0, 3).map((p) => `${p.slug} (${(p.authors || []).map((x) => x.slug).join('+')})`).join(', ')}` : 'all correct'}`);
    }
  }
  // G11: hidden blocks are not readable as Markdown; llms.txt is not served
  if (!skipped('llms')) {
    const md = await Promise.all(BLOCK_SLUGS.map(async (s) => [s, (await get(`/blog/${s}.md`, { follow: true })).status]));
    const open = md.filter(([, x]) => x !== 404);
    check('llms', 'L1', 'All 23 block .md addresses end in 404 (G11)', open.length === 0, open.map(([s, x]) => `${s} ${x}`).slice(0, 3).join(', ') || '23/23 → 404');
    const l = await get('/llms.txt');
    check('llms', 'L2', '/llms.txt is not served', !(l.status === 200 && l.type.startsWith('text/plain')), `${l.status} ${l.location}`);
  }
  // Placeholders and test content on rendered pages (§3.4)
  if (!skipped('placeholders')) {
    const pages = ['/', '/disfungsi-ereksi/', '/notis-privasi/', '/blog/', ...tagUrls.map(pathOf), ...authorUrls.map(pathOf), ...postUrls.slice(0, 25).map(pathOf)];
    const hits = [];
    // On a local Ghost the site URL itself is localhost:2368, so local-host hits are expected there only.
    for (const p of [...new Set(pages)]) { const r = await get(p); hits.push(...scanText(r.body, p).filter((h) => !(LOCAL && h.id === 'local-host'))); }
    check('placeholders', 'T1', `No placeholder or test content on ${new Set(pages).size} rendered pages`, hits.length === 0, hits.slice(0, 4).map((h) => `${h.where} [${h.id}] ${JSON.stringify(h.match)}`).join('; '));
  }
  // Security headers and robots.txt
  if (!skipped('headers')) {
    for (const p of ['/', '/ghost/']) {
      const r = await get(p, { follow: false }); const h = r.headers;
      const need = { 'strict-transport-security': /max-age=\d+/, 'referrer-policy': /strict-origin-when-cross-origin/, 'permissions-policy': /camera=\(\)/, 'x-frame-options': /^SAMEORIGIN$/i, 'x-content-type-options': /^nosniff$/ };
      const miss = Object.entries(need).filter(([k, re]) => !re.test(h.get(k) || ''));
      check('headers', 'H1', `Security headers present once on ${p}`, miss.length === 0, miss.map(([k]) => k).join(', ') || `HSTS "${h.get('strict-transport-security')}"`);
    }
    const rb = await get('/robots.txt');
    check('headers', 'H2', 'robots.txt is the public version (Sitemap line, no "Disallow: /")', rb.status === 200 && /Sitemap:/.test(rb.body) && !/^Disallow:\s*\/\s*$/m.test(rb.body), `HTTP ${rb.status}`);
  }
  if (!LOCAL) await variants(false);
}

console.log(`Smoke test (GET only) · ${BASE} · mode ${args.includes('--expect-private') ? 'expect-private' : COOKIE ? 'private cookie' : 'anonymous'} · author ${AUTHOR}${SKIP.size ? ` · skip ${[...SKIP].join(',')}` : ''}\n`);
if (args.includes('--expect-private')) await expectPrivate(); else await publicChecks();
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed} passed, ${failed} failed${SKIP.size ? `, skipped: ${[...SKIP].join(', ')}` : ''}`);
process.exit(failed ? 1 : 0);
