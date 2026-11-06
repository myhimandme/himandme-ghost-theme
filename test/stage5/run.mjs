// Stage 5 checks: blog home, topic pages, author page and the theme search. Every area must come from
// Ghost data and update when the data changes (featured, #popular, panduan, tags, author, images),
// never list a #blok content block, and work at phone, tablet and desktop widths. LOCAL Ghost only.
//
//   GHOST_ADMIN_EMAIL=… GHOST_ADMIN_PASSWORD=… node test/stage5/run.mjs
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { BLOCKS } from '../../seed/blocks.mjs';

const BASE = (process.env.GHOST_URL || 'http://localhost:2368').replace(/\/$/, '');
if (!['localhost', '127.0.0.1'].includes(new URL(BASE).hostname)) { console.error('Local Ghost only.'); process.exit(2); }
const { GHOST_ADMIN_EMAIL: EMAIL, GHOST_ADMIN_PASSWORD: PASSWORD } = process.env;
if (!EMAIL || !PASSWORD) { console.error('Set GHOST_ADMIN_EMAIL and GHOST_ADMIN_PASSWORD.'); process.exit(2); }

let cookie = '';
async function admin(path, { method = 'GET', json, form } = {}) {
  const headers = { Origin: BASE, ...(cookie ? { Cookie: cookie } : {}), ...(json ? { 'Content-Type': 'application/json' } : {}) };
  const r = await fetch(`${BASE}/ghost/api/admin${path}`, { method, headers, body: json ? JSON.stringify(json) : form });
  const sc = r.headers.get('set-cookie'); if (sc) cookie = sc.split(';')[0];
  const t = await r.text(); if (!r.ok) throw new Error(`${method} ${path} -> ${r.status} ${t.slice(0, 300)}`);
  try { return t ? JSON.parse(t) : {}; } catch { return {}; }
}
const page = async (p) => (await fetch(BASE + p)).text();
const results = [];
const check = (id, what, pass, detail = '') => { results.push({ id, pass }); console.log(`${pass ? 'PASS' : 'FAIL'}  ${id.padEnd(4)} ${what}${detail ? ` — ${detail}` : ''}`); };
const esc = (t) => String(t).replace(/&/g, '&amp;');
const sec = (html, cls) => { const i = html.indexOf(`class="${cls}`); if (i < 0) return ''; const tag = html.lastIndexOf('<', i); const name = html.slice(tag + 1).match(/^\w+/)[0]; let d = 0; const re = new RegExp(`<(/?)${name}\\b`, 'g'); re.lastIndex = tag; let m; while ((m = re.exec(html))) { d += m[1] ? -1 : 1; if (!d) return html.slice(tag, m.index); } return html.slice(tag); };
const hrefs = (html) => [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1].replace(BASE, ''));
const feedSlugs = (html) => [...html.matchAll(/data-slug="([^"]+)"/g)].map((m) => m[1]);

await admin('/session/', { method: 'POST', json: { username: EMAIL, password: PASSWORD } });
const allPosts = async (filter = '', order = 'published_at desc') => (await admin(`/posts/?limit=all&include=tags,authors&order=${encodeURIComponent(order)}&filter=${encodeURIComponent(`tag:-hash-blok${filter ? '+' + filter : ''}`)}`)).posts;
const editPost = async (p, fields) => { const cur = (await admin(`/posts/${p.id}/`)).posts[0]; return (await admin(`/posts/${p.id}/`, { method: 'PUT', json: { posts: [{ ...fields, updated_at: cur.updated_at }] } })).posts[0]; };
const setTags = (p, slugs) => editPost(p, { tags: slugs.map((slug) => ({ slug })) });
const blockSlugs = BLOCKS.map((b) => b.slug);

// T1 — templates
const blog = await page('/blog/');
const tmpl = (h) => (h.match(/data-template="([^"]+)"/) || [])[1];
const topicH = await page('/blog/topik/disfungsi-ereksi/'); const authorH = await page('/blog/penulis/dr/');
check('T1', 'Blog home, topic and author pages use index / tag / author templates (no Stage 1 scaffold left)',
  tmpl(blog) === 'index' && tmpl(topicH) === 'tag' && tmpl(authorH) === 'author' && ![blog, topicH, authorH].some((h) => h.includes('VERIFICATION SCAFFOLD') || h.includes('data-test="post-list"')));

// T2 — section order (approved plan), no newsletter, no blocks anywhere on the blog pages
const order = ['hm-bhero ', 'hm-topics"', 'hm-popular hm-popular--mobile', 'hm-feed-wrap', 'hm-guides"', 'hm-bcta"'].map((c) => blog.indexOf(`class="${c}`));
const blogPages = { '/blog/': blog, '/blog/page/2/': await page('/blog/page/2/'), topic: topicH, author: authorH };
const blockHits = Object.entries(blogPages).filter(([, h]) => blockSlugs.some((s) => h.includes(`/${s}/`) || h.includes(`data-slug="${s}"`))).map(([u]) => u);
check('T2', 'Blog home sections in the approved order: features + Paling dibaca → topics → (phone) Paling dibaca → Terkini → Panduan → consultation; no newsletter; no block linked anywhere',
  order.every((v, i) => v > 0 && (i === 0 || v > order[i - 1])) && !/Langgan|Surat berita|e-?mel|e-?mail/i.test(blog) && blockHits.length === 0,
  `positions ${order.join(' < ')}${blockHits.length ? '; blocks on ' + blockHits.join(', ') : ''}`);

// T3 — features: 3 newest featured, latest fill the gaps; unfeaturing updates the page
const leadHref = (h) => (sec(h, 'hm-bhero__lead').match(/href="([^"]+)"/) || [])[1]?.replace(BASE, '');
const secondHrefs = (h) => hrefs(sec(h, 'hm-bhero__second'));
const byFeat = await allPosts('', 'featured desc, published_at desc');
const want = byFeat.slice(0, 3).map((p) => new URL(p.url).pathname);
const featured = byFeat.filter((p) => p.featured);
const okFeat = leadHref(blog) === want[0] && JSON.stringify(secondHrefs(blog)) === JSON.stringify(want.slice(1));
for (const p of featured) await editPost(p, { featured: false });
const latest = await allPosts();
const noFeat = await page('/blog/');
const okFill = leadHref(noFeat) === new URL(latest[0].url).pathname && JSON.stringify(secondHrefs(noFeat)) === JSON.stringify(latest.slice(1, 3).map((p) => new URL(p.url).pathname));
for (const p of featured) await editPost(p, { featured: true });
check('T3', 'Features = the 3 newest "Feature this post" articles; with none featured, the latest articles fill all 3 slots; restored',
  okFeat && okFill && leadHref(await page('/blog/')) === want[0], `lead ${want[0]}; unfeatured lead ${leadHref(noFeat)}`);

// T4 — Paling dibaca: #popular (4 desktop, 3 shown on phones), latest as fallback
const popTitles = (h, cls) => [...sec(h, cls).matchAll(/hm-popular__title hm-serif">([^<]+)</g)].map((m) => m[1]);
const popular = await allPosts('tag:hash-popular');
const okPop = JSON.stringify(popTitles(blog, 'hm-popular hm-bhero__popular')) === JSON.stringify(popular.slice(0, 4).map((p) => esc(p.title)));
for (const p of popular) await setTags(p, p.tags.filter((t) => t.slug !== 'hash-popular').map((t) => t.slug));
const noPop = popTitles(await page('/blog/'), 'hm-popular hm-bhero__popular');
for (const p of popular) await setTags(p, p.tags.map((t) => t.slug));
check('T4', 'Paling dibaca lists the #popular articles; with none tagged it falls back to the latest 4; restored',
  okPop && JSON.stringify(noPop) === JSON.stringify(latest.slice(0, 4).map((p) => esc(p.title))) && popTitles(await page('/blog/'), 'hm-popular hm-bhero__popular').length === 4,
  popTitles(blog, 'hm-popular hm-bhero__popular').join(' | '));

// T5 — topic tiles: 4 fixed slugs, name/description/link from Ghost Admin → Tags
const TILE_SLUGS = ['disfungsi-ereksi', 'hormon-testosteron', 'kesihatan-pelvis', 'gaya-hidup'];
const tiles = [...sec(blog, 'hm-topics__grid').matchAll(/<a class="hm-topic-tile" href="([^"]+)">[\s\S]*?__name hm-serif">([^<]+)<\/span>(?:<span class="hm-topic-tile__desc">([^<]*)<\/span>)?/g)].map((m) => ({ href: m[1], name: m[2], desc: m[3] }));
const tagObj = (await admin('/tags/?limit=all')).tags;
const okTiles = tiles.length === 4 && TILE_SLUGS.every((s, i) => { const t = tagObj.find((x) => x.slug === s); return tiles[i].href.endsWith(`/blog/topik/${s}/`) && tiles[i].name === esc(t.name) && tiles[i].desc === esc(t.description); });
const ht = tagObj.find((t) => t.slug === 'hormon-testosteron');
await admin(`/tags/${ht.id}/`, { method: 'PUT', json: { tags: [{ description: 'Deskripsi ujian (diedit).', updated_at: ht.updated_at }] } });
const editedTiles = (await page('/blog/')).includes('<span class="hm-topic-tile__desc">Deskripsi ujian (diedit).</span>');
const ht2 = (await admin(`/tags/${ht.id}/`)).tags[0];
await admin(`/tags/${ht.id}/`, { method: 'PUT', json: { tags: [{ description: ht.description, updated_at: ht2.updated_at }] } });
check('T5', 'Topic tiles: 4 fixed topics in order, name + description + link from the tags; editing a tag description updates the tile; restored', okTiles && editedTiles, tiles.map((t) => t.name).join(' · '));

// T6 — Terkini: the collection, 9 per page, "Muatkan lagi" → page 2; page 2 shows the list only
const page2 = blogPages['/blog/page/2/'];
const more = (h) => (h.match(/<a class="hm-more" href="([^"]+)" data-hm-more>/) || [])[1];
check('T6', 'Terkini = the 9 latest articles; "Muatkan lagi artikel" links to /blog/page/2/; page 2 shows only the list (+ consultation) with a link back',
  JSON.stringify(feedSlugs(blog)) === JSON.stringify(latest.slice(0, 9).map((p) => p.slug)) && more(blog).endsWith('/blog/page/2/')
  && JSON.stringify(feedSlugs(page2)) === JSON.stringify(latest.slice(9, 18).map((p) => p.slug)) && !page2.includes('class="hm-bhero') && !page2.includes('class="hm-topics"') && !page2.includes('class="hm-guides"') && page2.includes('hm-feed__prev') && page2.includes('class="hm-bcta"'),
  `page 1 ${feedSlugs(blog).length}, page 2 ${feedSlugs(page2).length} articles`);

// T7 — Panduan band: 3 newest "panduan", reading time instead of "[x] BAB", hidden when none
const guides = await allPosts('tag:panduan');
const gTitles = [...sec(blog, 'hm-guides"').matchAll(/hm-guide__title hm-serif">([^<]+)</g)].map((m) => m[1]);
const gMeta = [...sec(blog, 'hm-guides"').matchAll(/hm-guide__meta">([^<]+)</g)].map((m) => m[1]);
for (const p of guides) await setTags(p, p.tags.filter((t) => t.slug !== 'panduan').map((t) => t.slug));
const noGuides = await page('/blog/');
for (const p of guides) await setTags(p, p.tags.map((t) => t.slug));
check('T7', 'Panduan band: the 3 newest "panduan" articles, labelled "PANDUAN 0n · N MIN BACAAN"; hidden when no article is tagged; restored',
  JSON.stringify(gTitles) === JSON.stringify(guides.slice(0, 3).map((p) => esc(p.title))) && gMeta.every((m, i) => new RegExp(`^PANDUAN 0${i + 1} · \\d+ MIN BACAAN$`).test(m)) && !noGuides.includes('class="hm-guides"') && !gMeta.join('').includes('BAB'),
  gMeta.join(' | '));

// T8 — consultation prompt + single attribution
const cs = (await admin('/custom_theme_settings/')).custom_theme_settings; const wa = cs.find((s) => s.key === 'whatsapp_number').value;
const cta = sec(blog, 'hm-bcta"');
const author = latest[0].primary_author.name;
check('T8', 'Consultation prompt: "Buat Temu Janji" → ED booking form, WhatsApp → configured number (hidden on phones); lead byline "Ditulis dan disemak oleh {doctor}"',
  cta.includes('href="' + BASE + '/disfungsi-ereksi/#temujanji"') && cta.includes(`https://wa.me/${wa}?text=`) && /hm-btn--whatsapp hm-btn--md hm-hide-mobile/.test(cta)
  && sec(blog, 'hm-lead__meta').includes(`Ditulis dan disemak oleh ${esc(author)}`));

// T9 — topic page
const tagDE = tagObj.find((t) => t.slug === 'disfungsi-ereksi');
const deAll = await allPosts('tag:disfungsi-ereksi');
const deFeat = deAll.filter((p) => p.featured).slice(0, 3);
const topicFeed = feedSlugs(topicH);
check('T9', 'Topic page: H1/description from the tag, article count, the topic\'s featured articles first, then only that topic\'s articles (paginated)',
  topicH.includes(`hm-archive-head__title hm-serif">${esc(tagDE.name)}</h1>`) && topicH.includes(esc(tagDE.description)) && topicH.includes(`${deAll.length} artikel`)
  && leadHref(topicH) === (deFeat[0] ? new URL(deFeat[0].url).pathname : undefined) && topicFeed.length === 9 && topicFeed.every((s) => deAll.some((p) => p.slug === s))
  && (await fetch(BASE + '/blog/topik/disfungsi-ereksi/page/2/')).status === 200, `${deAll.length} articles, ${deFeat.length} featured`);

// T10 — author page: staff profile + credentials setting; bio appears when set
const users = (await admin('/users/?limit=all')).users; const dr = users.find((u) => u.slug === 'dr');
const cred = cs.find((s) => s.key === 'doctor_credentials').value;
await admin(`/users/${dr.id}/`, { method: 'PUT', json: { users: [{ bio: 'Biodata ujian doktor.' }] } });
const withBio = await page('/blog/penulis/dr/');
await admin(`/users/${dr.id}/`, { method: 'PUT', json: { users: [{ bio: dr.bio || null }] } });
check('T10', 'Author page: name (H1), "Ditulis dan disemak oleh", verified credentials (theme setting), bio from the staff profile, every article listed',
  withBio.includes(`hm-archive-head__title hm-serif">${esc(dr.name)}</h1>`) && withBio.includes('DITULIS DAN DISEMAK OLEH') && withBio.includes(esc(cred)) && withBio.includes('Biodata ujian doktor.') && feedSlugs(authorH).length === 9);

// T11 — feature image: one upload drives the card/lead image (responsive srcset, alt); placeholder without
const f = new FormData();
f.append('file', new Blob([readFileSync(new URL('../../assets/images/logo-mark.png', import.meta.url))], { type: 'image/png' }), 'ujian-gambar.png');
const img = (await admin('/images/upload/', { method: 'POST', form: f })).images[0].url;
const leadPost = byFeat[0];
await editPost(leadPost, { feature_image: img, feature_image_alt: 'Gambar ujian' });
const withImg = await page('/blog/');
await editPost(leadPost, { feature_image: null, feature_image_alt: null });
const leadImg = sec(withImg, 'hm-bhero__lead');
check('T11', 'Feature image: the lead shows the uploaded image with srcset + alt (eager); without one, the patterned placeholder',
  /<img class="hm-lead__img" src="[^"]*ujian-gambar[^"]*"\s+srcset="[^"]+320w[^"]+600w/.test(leadImg) && leadImg.includes('alt="Gambar ujian"') && !leadImg.includes('loading="lazy"') && sec(blog, 'hm-bhero__lead').includes('hm-lead__img hm-ph'));

// Browser checks
let chromium; try { ({ chromium } = createRequire(import.meta.url)('playwright')); } catch { console.log('SKIP  browser checks — Playwright not available'); }
if (chromium) {
  const b = await chromium.launch();
  // B1 — "Muatkan lagi" appends pages in place until every article is listed (no duplicates), then disappears
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(BASE + '/blog/');
  const counts = [await p.locator('[data-hm-feed] > *').count()];
  while (await p.locator('[data-hm-more]').count()) { await p.click('[data-hm-more]'); await p.waitForFunction((n) => document.querySelectorAll('[data-hm-feed] > *').length > n || !document.querySelector('[data-hm-more]'), counts[counts.length - 1]); counts.push(await p.locator('[data-hm-feed] > *').count()); if (counts.length > 10) break; }
  const slugsAll = await p.$$eval('[data-hm-feed] > [data-slug]', (els) => els.map((e) => e.dataset.slug));
  check('B1', '"Muatkan lagi artikel" appends the next page in place until all articles are listed, without duplicates, then disappears; URL unchanged',
    slugsAll.length === latest.length && new Set(slugsAll).size === slugsAll.length && p.url() === BASE + '/blog/', counts.join(' → '));

  // B2 — no horizontal overflow
  const over = [];
  for (const path of ['/blog/', '/blog/page/2/', '/blog/topik/disfungsi-ereksi/', '/blog/penulis/dr/']) for (const w of [390, 768, 1024, 1440]) {
    const q = await b.newPage({ viewport: { width: w, height: 900 } }); await q.goto(BASE + path);
    const sw = await q.evaluate(() => document.documentElement.scrollWidth); if (sw > w) over.push(`${path}@${w}: ${sw}`); await q.close();
  }
  check('B2', 'No horizontal overflow on blog home, page 2, topic and author pages at 390 / 768 / 1024 / 1440px', over.length === 0, over.join(', '));

  // B3 — search (desktop): articles only, never blocks; Enter opens the first result
  await p.goto(BASE + '/blog/');
  await p.fill('[data-hm-search-input]', 'testosteron'); await p.waitForSelector('[data-hm-search-list] a');
  const hits = await p.$$eval('[data-hm-search-list] a', (as) => as.map((a) => ({ href: a.getAttribute('href'), title: a.querySelector('.hm-search__title').textContent })));
  const status = await p.textContent('[data-hm-search-status]');
  // A query that DOES match content blocks in Ghost's raw index (so the check is meaningful), but no article.
  const idx = await (await fetch(`${BASE}/ghost/api/content/search-index/posts/?key=${(blog.match(/data-key="([a-f0-9]+)"/) || [])[1]}`)).json();
  const blockQuery = 'dibincang tenang profesional';
  const rawBlockMatches = idx.posts.filter((x) => blockQuery.split(' ').every((w) => `${x.title} ${x.excerpt}`.toLowerCase().includes(w)));
  const fresh = async (q) => { await p.fill('[data-hm-search-input]', ''); await p.waitForFunction(() => document.querySelector('#hm-search-results').hidden);
    await p.fill('[data-hm-search-input]', q); await p.waitForFunction(() => !document.querySelector('#hm-search-results').hidden && /ditemui/i.test(document.querySelector('[data-hm-search-status]').textContent)); };
  await fresh(blockQuery);
  const blockHits2 = await p.$$eval('[data-hm-search-list] a', (as) => as.map((a) => a.getAttribute('href')));
  await fresh('kencing manis');
  const firstHref = await p.getAttribute('[data-hm-search-list] a', 'href');
  await p.press('[data-hm-search-input]', 'Enter'); await p.waitForURL(firstHref);
  check('B3', 'Search: matches articles by title/excerpt (all words, accents ignored), /blog/ links only, never a content block (the index itself lists them), Enter opens the first result',
    hits.length > 0 && hits.every((h) => h.href.startsWith(BASE + '/blog/')) && hits.some((h) => /Testosteron rendah/.test(h.title)) && /artikel ditemui/.test(status)
    && rawBlockMatches.length > 0 && rawBlockMatches.every((x) => /\/404\/?$/.test(x.url)) && blockHits2.length === 0 && p.url() === firstHref,
    `"testosteron": ${hits.length} result(s); "${blockQuery}": raw index ${rawBlockMatches.length} block(s), site results ${blockHits2.length}`);

  // B4 — search on phones: icon opens the panel, Escape closes; Paling dibaca shows 3 on phones
  const m = await b.newPage({ viewport: { width: 390, height: 844 } });
  await m.goto(BASE + '/blog/');
  const hiddenBefore = await m.isHidden('[data-hm-search-input]');
  await m.click('[data-hm-search-open]'); const focused = await m.evaluate(() => document.activeElement.matches('[data-hm-search-input]'));
  await m.fill('[data-hm-search-input]', 'pelvis'); await m.waitForSelector('[data-hm-search-list] a');
  const mHits = await m.locator('[data-hm-search-list] a').count(); const mSw = await m.evaluate(() => document.documentElement.scrollWidth);
  await m.keyboard.press('Escape'); const closed = await m.isHidden('[data-hm-search-input]') && (await m.getAttribute('[data-hm-search-open]', 'aria-expanded')) === 'false';
  const popVisible = await m.$$eval('.hm-popular--mobile li', (els) => els.filter((e) => getComputedStyle(e).display !== 'none').length);
  check('B4', 'Phones: the search icon opens a full-width search panel (focus in the field), results fit the screen, Escape closes it; Paling dibaca shows 3',
    hiddenBefore && focused && mHits > 0 && mSw === 390 && closed && popVisible === 3, `${mHits} result(s) for "pelvis"`);
  await b.close();
}

const fails = results.filter((r) => !r.pass);
console.log(`\n${results.length - fails.length} passed, ${fails.length} failed`);
process.exit(fails.length ? 1 : 0);
