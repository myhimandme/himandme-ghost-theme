// Stage 1 verification suite: routing, canonical URLs and content-block (#blok) discoverability.
//
// Runs ONLY against a local development Ghost (localhost / 127.0.0.1). It refuses any other host,
// so it can never touch the live himandme.my installation.
//
//   GHOST_URL=http://localhost:2368 GHOST_ADMIN_EMAIL=… GHOST_ADMIN_PASSWORD=… npm run test:stage1
//
// Prerequisites on the local Ghost: theme uploaded + active, routes.yaml uploaded,
// fixtures imported (test/stage1/fixtures/seed-stage1.json). See test/stage1/README.md.
import { writeFileSync, mkdirSync } from 'node:fs';

const BASE = (process.env.GHOST_URL || 'http://localhost:2368').replace(/\/$/, '');
const host = new URL(BASE).hostname;
if (!['localhost', '127.0.0.1'].includes(host)) {
  console.error(`Refusing to run against ${host}: Stage 1 tests are for a local Ghost only.`);
  process.exit(2);
}
const EMAIL = process.env.GHOST_ADMIN_EMAIL;
const PASSWORD = process.env.GHOST_ADMIN_PASSWORD;
if (!EMAIL || !PASSWORD) { console.error('Set GHOST_ADMIN_EMAIL and GHOST_ADMIN_PASSWORD (local dev account).'); process.exit(2); }

// ---------- helpers ----------
let cookie = '';
async function admin(path, opts = {}) {
  const r = await fetch(`${BASE}/ghost/api/admin${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Origin: BASE, ...(cookie ? { Cookie: cookie } : {}), ...(opts.headers || {}) },
  });
  const sc = r.headers.get('set-cookie'); if (sc) cookie = sc.split(';')[0];
  const t = await r.text();
  if (!r.ok) throw new Error(`${opts.method || 'GET'} ${path} -> ${r.status} ${t.slice(0, 200)}`);
  try { return t ? JSON.parse(t) : {}; } catch { return { text: t }; }
}
async function get(path) {
  const r = await fetch(BASE + path, { redirect: 'manual' });
  return { status: r.status, location: r.headers.get('location'), body: r.status === 200 ? await r.text() : '' };
}
const canonical = (html) => (html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
const template = (html) => (html.match(/data-template="([^"]+)"/) || [])[1];
const listed = (html) => [...html.matchAll(/data-slug="([^"]+)"/g)].map((m) => m[1]);

const results = [];
function check(id, area, what, pass, detail = '') {
  results.push({ id, area, what, pass, detail });
  console.log(`${pass === true ? 'PASS' : pass === false ? 'FAIL' : 'INFO'}  ${id.padEnd(4)} ${what}${detail ? ` — ${detail}` : ''}`);
}

// ---------- setup ----------
await admin('/session/', { method: 'POST', body: JSON.stringify({ username: EMAIL, password: PASSWORD }) });
const ints = await admin('/integrations/?include=api_keys');
let integ = ints.integrations.find((i) => i.name === 'Stage1 tests');
if (!integ) integ = (await admin('/integrations/?include=api_keys', { method: 'POST', body: JSON.stringify({ integrations: [{ name: 'Stage1 tests' }] }) })).integrations[0];
const KEY = integ.api_keys.find((k) => k.type === 'content').secret;
const content = async (path) => (await fetch(`${BASE}/ghost/api/content${path}${path.includes('?') ? '&' : '?'}key=${KEY}`)).json();

const blocks = (await admin('/posts/?limit=all&filter=tag:hash-blok&fields=id,uuid,slug,title,custom_excerpt,url,status')).posts;
const author = (await admin('/users/me/')).users[0];
const blockSlugs = blocks.map((b) => b.slug);
// Leak markers: each block's slug and UUID (the UUID appears in RSS <guid> and post links, never in rendered copy).
const blockMarkers = blocks.map((b) => b.uuid);
// Blocks rendered site-wide by design (footer address/hours + disclaimer). Their copy legitimately appears
// on every page, so their markers are excluded from text-leak checks; their slugs are still checked.
const SHARED_BLOCKS = ['blok-maklumat-hubungan', 'blok-penafian'];
const sharedMarkers = []; // UUID markers are never rendered, so no exclusions are needed
const leaks = (text) => [...blockSlugs, ...blockMarkers.filter((m) => !sharedMarkers.includes(m)), 'hash-blok'].filter((s) => text.includes(s));
// For HTML pages: a block "leaks" if it is listed or linked as an article, or its non-shared copy appears.
const htmlLeaks = (html) => [...new Set([
  ...listed(html).filter((s) => blockSlugs.includes(s)),
  ...[...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]).filter((h) => blockSlugs.some((b) => h.includes(`/${b}/`))),
  ...blockMarkers.filter((m) => !sharedMarkers.includes(m) && html.includes(m)),
])];
console.log(`Ghost ${BASE} · ${blocks.length} content blocks · author /${author.slug}/\n`);

// ---------- 1. Routes ----------
const home = await get('/');
check('R1', 'Routes', '/ renders home.hbs', home.status === 200 && template(home.body) === 'home', `HTTP ${home.status}, template ${template(home.body)}`);
const siteSet = (await admin('/settings/')).settings;
const metaTitle = siteSet.find((s) => s.key === 'meta_title')?.value;
const titleOf = (html) => (html.match(/<title>([^<]*)<\/title>/) || [])[1]?.replace(/&amp;/g, '&');
check('R2', 'Routes', 'Homepage <title> comes from Settings → General → Meta data', titleOf(home.body) === metaTitle, `<title> "${titleOf(home.body)}"`);
const ed = await get('/disfungsi-ereksi/');
check('R3', 'Routes', '/disfungsi-ereksi/ renders custom-disfungsi-ereksi.hbs', ed.status === 200 && template(ed.body) === 'custom-disfungsi-ereksi', `HTTP ${ed.status}, template ${template(ed.body)}`);
const blog = await get('/blog/');
check('R4', 'Routes', '/blog/ renders index.hbs with 9 posts', blog.status === 200 && template(blog.body) === 'index' && listed(blog.body).length === 9, `HTTP ${blog.status}, ${listed(blog.body).length} posts`);
const blog2 = await get('/blog/page/2/'); const blog3 = await get('/blog/page/3/');
const totalArticles = (await content('/posts/?limit=all&fields=slug&filter=tag:-hash-blok')).posts.length;
check('R5', 'Routes', 'Blog pagination /blog/page/2/ (and page 3 → 404)', blog2.status === 200 && listed(blog2.body).length === totalArticles - 9 && blog3.status === 404, `page 2: ${listed(blog2.body).length} posts; page 3: HTTP ${blog3.status}`);
const jurnal = (await admin('/pages/slug/jurnal/')).pages[0];
const r6 = await get('/jurnal/');
check('R6', 'Routes', '/blog/ <title> comes from page "jurnal"; /jurnal/ 301-redirects to /blog/', titleOf(blog.body) === jurnal.meta_title && r6.status === 301 && new URL(r6.location, BASE).pathname === '/blog/', `<title> "${titleOf(blog.body)}"; /jurnal/ HTTP ${r6.status} → ${r6.location}`);
const art = await get('/blog/artikel-ujian-01/');
check('R7', 'Routes', '/blog/{slug}/ renders post.hbs', art.status === 200 && template(art.body) === 'post', `HTTP ${art.status}`);
const tagp = await get('/blog/topik/disfungsi-ereksi/'); const tagp2 = await get('/blog/topik/disfungsi-ereksi/page/2/');
check('R8', 'Routes', '/blog/topik/{slug}/ renders tag.hbs, with pagination', tagp.status === 200 && template(tagp.body) === 'tag' && tagp2.status === 200, `HTTP ${tagp.status}; page 2 HTTP ${tagp2.status}`);
const auth = await get(`/blog/penulis/${author.slug}/`); const auth2 = await get(`/blog/penulis/${author.slug}/page/2/`);
check('R9', 'Routes', '/blog/penulis/{slug}/ renders author.hbs, with pagination', auth.status === 200 && template(auth.body) === 'author' && auth2.status === 200, `HTTP ${auth.status}; page 2 HTTP ${auth2.status}`);

const canon = [
  ['/', home], ['/disfungsi-ereksi/', ed], ['/blog/', blog], ['/blog/page/2/', blog2], ['/blog/artikel-ujian-01/', art],
  ['/blog/topik/disfungsi-ereksi/', tagp], ['/blog/topik/disfungsi-ereksi/page/2/', tagp2], [`/blog/penulis/${author.slug}/`, auth],
];
const badCanon = canon.filter(([p, r]) => canonical(r.body) !== BASE + p).map(([p, r]) => `${p} → ${canonical(r.body)}`);
check('R10', 'Routes', 'Canonical URL of every route points to itself', badCanon.length === 0, badCanon.join('; ') || `${canon.length} routes checked`);
const apiArticleUrl = (await content('/posts/slug/artikel-ujian-01/?fields=url')).posts[0].url;
check('R11', 'Routes', 'Article URL from the API is /blog/{slug}/', apiArticleUrl === `${BASE}/blog/artikel-ujian-01/`, apiArticleUrl);
const old = await Promise.all(['/tag/disfungsi-ereksi/', `/author/${author.slug}/`, '/artikel-ujian-01/', '/blog/topik/', '/blog/penulis/'].map(async (p) => [p, (await get(p)).status]));
check('R12', 'Routes', 'Default Ghost routes are gone; bare taxonomy bases 404', old.every(([, s]) => s === 404), old.map(([p, s]) => `${p} ${s}`).join(', '));
const hero = blocks.find((b) => b.slug === 'blok-utama-hero');
const esc = (t) => (t || '').replace(/&/g, '&amp;');
check('R13', 'Routes', 'Homepage H1 comes from block "blok-utama-hero"', home.body.includes(`id="hm-hero-title">${esc(hero?.title)}</h1>`), hero?.title || 'hero block missing');
const authorUrl = (await content(`/authors/slug/${author.slug}/?fields=url`)).authors?.[0]?.url;
check('R14', 'Routes', 'Author profile URL is /blog/penulis/{slug}/ (channel route owns it)', authorUrl === `${BASE}/blog/penulis/${author.slug}/`, authorUrl);

// ---------- 2. Content blocks must not be discoverable ----------
const direct = await Promise.all(blockSlugs.flatMap((s) => [`/blog/${s}/`, `/${s}/`]).map(async (p) => {
  const r = await fetch(BASE + p); const t = await r.text();
  return [p, r.status, new URL(r.url).pathname, template(t) === 'error-404' ? htmlLeaks(t).length : 1];
}));
check('B1', 'Blocks', 'Block article URLs end in the 404 page with no block content', direct.every(([, s, , l]) => s === 404 && l === 0),
  [...new Set(direct.map(([p, s, f]) => `${p.startsWith('/blog/') ? '/blog/{block}/' : '/{block}/'} → ${f} ${s}`))].join('; '));
const apiUrls = (await content(`/posts/?filter=tag:hash-blok&fields=slug,url`)).posts.map((p) => p.url);
check('B2', 'Blocks', 'Ghost assigns blocks no public URL (url = /404/)', apiUrls.every((u) => u.endsWith('/404/')), [...new Set(apiUrls.map((u) => new URL(u).pathname))].join(', '));
const prev = await Promise.all(blocks.map(async (b) => [b.slug, await get(`/p/${b.uuid}/`)]));
check('B3', 'Blocks', 'Preview links /p/{uuid}/ do not expose published blocks', prev.every(([, r]) => r.status !== 200 || leaks(r.body).length === 0),
  prev.map(([s, r]) => `${s}: HTTP ${r.status}${r.location ? ' → ' + r.location : ''}`).join('; '));

const listingPaths = ['/blog/', '/blog/page/2/', '/blog/topik/disfungsi-ereksi/', '/blog/topik/disfungsi-ereksi/page/2/', '/blog/topik/gaya-hidup/', `/blog/penulis/${author.slug}/`, `/blog/penulis/${author.slug}/page/2/`];
const listingLeaks = [];
for (const p of listingPaths) { const r = await get(p); const l = htmlLeaks(r.body); if (l.length) listingLeaks.push(`${p}: ${l.join(',')}`); }
check('B4', 'Blocks', 'Blocks absent from blog listing, topic and author archives', listingLeaks.length === 0, listingLeaks.join('; ') || `${listingPaths.length} listing pages checked`);

const rssPaths = ['/blog/rss/', '/blog/topik/disfungsi-ereksi/rss/', `/blog/penulis/${author.slug}/rss/`, '/rss/'];
const rss = await Promise.all(rssPaths.map(async (p) => [p, await get(p)]));
const rssLeaks = rss.filter(([, r]) => leaks(r.body).length).map(([p, r]) => `${p}: ${leaks(r.body).join(',')}`);
check('B5', 'Blocks', 'Blocks absent from all RSS feeds', rssLeaks.length === 0, rssLeaks.join('; ') || rss.map(([p, r]) => `${p} ${r.status}`).join(', '));

const smIndex = await get('/sitemap.xml');
const smChildren = [...smIndex.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
const smBodies = await Promise.all(smChildren.map(async (p) => [p, (await get(p)).body]));
const smLeaks = smBodies.filter(([, b]) => leaks(b).length).map(([p, b]) => `${p}: ${leaks(b).join(',')}`);
check('B6', 'Blocks', 'Blocks and #blok tags absent from the sitemap', smIndex.status === 200 && smLeaks.length === 0, smLeaks.join('; ') || `${smChildren.length} sitemap files: ${smChildren.join(', ')}`);
const pagesSm = smBodies.find(([p]) => p.includes('pages'))?.[1] || '';
const smUrls = smBodies.flatMap(([, b]) => [...b.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])).filter((u) => !u.includes('/content/images/'));
const smStatus = await Promise.all(smUrls.map(async (u) => [new URL(u).pathname, (await get(new URL(u).pathname)).status]));
const smBad = smStatus.filter(([p, s]) => s !== 200 && !(p === '/jurnal/' && s === 301));
const smKnown = smStatus.filter(([p, s]) => p === '/jurnal/' && s === 301);
check('B6b', 'Blocks', 'Every sitemap URL returns 200 (except the known /jurnal/ → /blog/ redirect)', smBad.length === 0,
  (smBad.map(([p, s]) => `${p} ${s}`).join(', ') || `${smUrls.length} URLs OK`) + (smKnown.length ? '; /jurnal/ is listed and 301s to /blog/ (Ghost behaviour for route-data pages)' : ''));

const ghostHeadSearch = /sodo-search/.test(home.body);
const idx = await content('/search-index/posts/');
const idxLeaks = (idx.posts || []).filter((p) => blockSlugs.includes(p.slug)).map((p) => p.slug);
check('B7', 'Blocks', 'Ghost native search (Sodo Search) does not offer blocks',
  !ghostHeadSearch || idxLeaks.length === 0,
  `native search script on pages: ${ghostHeadSearch ? 'yes' : 'no (theme excludes it)'}; search index contains ${idxLeaks.length} block(s)${idxLeaks.length ? ': ' + idxLeaks.join(', ') : ''}`);
const tagIdx = await content('/search-index/tags/');
check('B7b', 'Blocks', 'Internal #blok tags absent from the search index', !(tagIdx.tags || []).some((t) => t.slug.startsWith('hash-')), `${(tagIdx.tags || []).length} public tags indexed`);
const filtered = (idx.posts || []).filter((p) => !new URL(p.url).pathname.endsWith('/404/'));
check('B7c', 'Blocks', 'A theme search that drops url=/404/ entries hides all blocks', filtered.every((p) => !blockSlugs.includes(p.slug)), `${idx.posts?.length} indexed → ${filtered.length} after filter`);

const settings = (await admin('/settings/')).settings;
const sw = settings.find((s) => s.key === 'social_web_enabled')?.value;
check('B8', 'Blocks', 'Social web (Network) is off, so blocks are not federated', sw === false, `social_web_enabled = ${sw}`);
const rawApi = (await content('/posts/?filter=tag:hash-blok&fields=slug')).posts.length;
check('B9', 'Blocks', 'Raw Content API (needs the public key) can still read blocks', null, `${rawApi} blocks readable — expected and required for the theme; blocks hold public website copy only`);
const featuredLeak = ((await content('/posts/?filter=featured:true&limit=all')).posts || []).filter((p) => blockSlugs.includes(p.slug));
check('B10', 'Blocks', 'Theme queries must add "+tag:-hash-blok" (guard rule for Stage 2+)', null, `an unguarded {{#get "posts"}} can return blocks; ${featuredLeak.length} featured blocks today`);

// ---------- 3. Block lookup and editable content ----------
const titleOfBlock = (slug) => esc(blocks.find((b) => b.slug === slug)?.title);
check('C1', 'Lookup', 'Homepage section headings come from their blocks (services, process, FAQ, CTA)',
  [['hm-services-title', 'blok-utama-perkhidmatan'], ['hm-process-title', 'blok-utama-proses'], ['hm-faq-title', 'blok-utama-faq'], ['hm-cta-title', 'blok-utama-cta']]
    .every(([id, slug]) => home.body.includes(`id="${id}">${titleOfBlock(slug)}</h2>`)));
const homeBlocks = blocks.filter((b) => b.slug.startsWith('blok-utama-'));
check('C2', 'Lookup', 'All 12 homepage blocks exist and render', homeBlocks.length === 12, `${homeBlocks.length} homepage blocks`);
const cta = blocks.find((b) => b.slug === 'blok-utama-cta');
await admin(`/posts/${cta.id}/`, { method: 'PUT', body: JSON.stringify({ posts: [{ status: 'draft', updated_at: (await admin(`/posts/${cta.id}/`)).posts[0].updated_at }] }) });
const homeNoCta = (await get('/')).body;
await admin(`/posts/${cta.id}/`, { method: 'PUT', body: JSON.stringify({ posts: [{ status: 'published', updated_at: (await admin(`/posts/${cta.id}/`)).posts[0].updated_at }] }) });
check('C3', 'Lookup', 'Unpublished block falls back to the approved copy (tested with the CTA block, then restored)', homeNoCta.includes('id="hm-cta-title">Sedia untuk berbincang?</h2>') && homeNoCta.includes('hm-cta__intro'));
const swBlock = blocks.find((b) => b.slug === 'blok-ed-shockwave');
check('C4', 'Lookup', 'ED page: block lookup + FAQ toggle cards render', ed.body.includes(`id="hm-shockwave-title">${esc(swBlock?.title)}</h2>`) && /id="soalan"[\s\S]*kg-toggle-card/.test(ed.body), swBlock?.title);
check('C5', 'Lookup', 'Homepage FAQ toggle cards render from block "blok-utama-faq"', /data-hm-faq>[\s\S]*kg-toggle-card/.test(home.body), `${(home.body.match(/kg-toggle-card"/g) || []).length} questions`);
const cs = (await admin('/custom_theme_settings/')).custom_theme_settings;
check('C6', 'Settings', 'All 20 theme settings are registered in Ghost Admin (incl. city + offer_price; Ghost maximum)', cs.length === 20, `${cs.length} settings`);
const testVal = `60${Date.now().toString().slice(-9)}`;
await admin('/custom_theme_settings/', { method: 'PUT', body: JSON.stringify({ custom_theme_settings: cs.map((s) => ({ key: s.key, value: s.key === 'whatsapp_number' ? testVal : s.value })) }) });
const home2 = await get('/');
check('C7', 'Settings', 'A changed theme setting appears on the site immediately (WhatsApp number)', home2.body.includes(`https://wa.me/${testVal}?`), testVal);
await admin('/custom_theme_settings/', { method: 'PUT', body: JSON.stringify({ custom_theme_settings: cs }) });

const times = [];
for (let i = 0; i < 20; i++) { const t = performance.now(); await get('/'); times.push(performance.now() - t); }
times.sort((a, b) => a - b);
check('C8', 'Lookup', 'Homepage render time with block queries (20 requests)', null, `median ${times[10].toFixed(0)} ms, p95 ${times[18].toFixed(0)} ms (local, uncached)`);

// ---------- summary ----------
const fails = results.filter((r) => r.pass === false);
console.log(`\n${results.filter((r) => r.pass === true).length} passed, ${fails.length} failed, ${results.filter((r) => r.pass === null).length} info`);
mkdirSync(new URL('./.local/', import.meta.url), { recursive: true });
writeFileSync(new URL('./.local/results.json', import.meta.url), JSON.stringify({ base: BASE, ranAt: new Date().toISOString(), results }, null, 2));
process.exit(fails.length ? 1 : 0);
