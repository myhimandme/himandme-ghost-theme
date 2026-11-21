// Stage 6 checks: the article page (post.hbs) against the approved Artikel boards. Every part must come from
// the Ghost post (title, standfirst, image, caption, tags, author, dates, editor cards), update when the post
// changes, never show a #blok block, keep its URL, and work at phone, tablet and desktop widths. LOCAL Ghost only.
// Runs test/stage6/prepare-demo.mjs first (idempotent) so the demo article has every editor block.
//
//   GHOST_ADMIN_EMAIL=… GHOST_ADMIN_PASSWORD=… node test/stage6/run.mjs
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { BLOCKS } from '../../seed/blocks.mjs';

const BASE = (process.env.GHOST_URL || 'http://localhost:2368').replace(/\/$/, '');
if (!['localhost', '127.0.0.1'].includes(new URL(BASE).hostname)) { console.error('Local Ghost only.'); process.exit(2); }
const { GHOST_ADMIN_EMAIL: EMAIL, GHOST_ADMIN_PASSWORD: PASSWORD } = process.env;
if (!EMAIL || !PASSWORD) { console.error('Set GHOST_ADMIN_EMAIL and GHOST_ADMIN_PASSWORD.'); process.exit(2); }
execFileSync(process.execPath, [fileURLToPath(new URL('./prepare-demo.mjs', import.meta.url))], { stdio: 'inherit', env: process.env });

let cookie = '';
async function admin(path, { method = 'GET', json } = {}) {
  const r = await fetch(`${BASE}/ghost/api/admin${path}`, { method, headers: { Origin: BASE, 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) }, body: json ? JSON.stringify(json) : undefined });
  const sc = r.headers.get('set-cookie'); if (sc) cookie = sc.split(';')[0];
  const t = await r.text(); if (!r.ok) throw new Error(`${method} ${path} -> ${r.status} ${t.slice(0, 300)}`);
  try { return t ? JSON.parse(t) : {}; } catch { return {}; }
}
const page = async (p) => (await fetch(BASE + p)).text();
const results = [];
const check = (id, what, pass, detail = '') => { results.push({ id, pass }); console.log(`${pass ? 'PASS' : 'FAIL'}  ${id.padEnd(4)} ${what}${detail ? ` — ${detail}` : ''}`); };
const esc = (t) => String(t).replace(/&/g, '&amp;');
const sec = (html, cls) => { const i = html.indexOf(`class="${cls}`); if (i < 0) return ''; const tag = html.lastIndexOf('<', i); const name = html.slice(tag + 1).match(/^\w+/)[0]; let d = 0; const re = new RegExp(`<(/?)${name}\\b`, 'g'); re.lastIndex = tag; let m; while ((m = re.exec(html))) { d += m[1] ? -1 : 1; if (!d) return html.slice(tag, m.index); } return html.slice(tag); };
const editPost = async (p, fields) => { const cur = (await admin(`/posts/${p.id}/`)).posts[0]; return (await admin(`/posts/${p.id}/`, { method: 'PUT', json: { posts: [{ ...fields, updated_at: cur.updated_at }] } })).posts[0]; };
const MONTHS = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];
const malayDate = (iso) => { const d = new Date(new Date(iso).toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' })); return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`; };

await admin('/session/', { method: 'POST', json: { username: EMAIL, password: PASSWORD } });
const SLUG = 'disfungsi-ereksi-bukan-sekadar-soal-usia';
const PATH = `/blog/${SLUG}/`;
const post = (await admin(`/posts/slug/${SLUG}/?include=tags,authors`)).posts[0];
const cs = (await admin('/custom_theme_settings/')).custom_theme_settings; const wa = cs.find((s) => s.key === 'whatsapp_number').value; const cred = cs.find((s) => s.key === 'doctor_credentials').value;
const h = await page(PATH);
const author = post.primary_author; const tag = post.primary_tag;

// A1 — template and order
const order = ['hm-art__head', 'hm-art__hero', 'hm-art__rail', 'hm-art__main', 'hm-art__aside', 'hm-related'].map((c) => h.indexOf(`class="${c}`));
check('A1', 'Article uses post.hbs with the board order: header → 16:7 image → contents/share | text | consultation/guides → Baca seterusnya; Stage 1 scaffold gone; URL unchanged',
  /data-template="post"/.test(h) && order.every((v, i) => v > 0 && (i === 0 || v > order[i - 1])) && !h.includes('VERIFICATION SCAFFOLD') && !h.includes('data-test="attribution"') && post.url === `${BASE}${PATH}`, order.join(' < '));

// A2 — header fields from the post
const head = sec(h, 'hm-art__head');
check('A2', 'Header: category (primary tag → topic page), title (H1), standfirst (excerpt), "Ditulis dan disemak oleh {doctor}" → author page, Malay date + reading time, credentials + "Kemas kini terakhir"',
  new RegExp(`href="(${BASE})?/blog/topik/${tag.slug}/">${esc(tag.name)}</a>`).test(head) && head.includes(`hm-art__title hm-serif">${esc(post.title)}</h1>`) && head.includes(esc(post.custom_excerpt))
  && head.includes(`Ditulis dan disemak oleh <strong>${esc(author.name)}</strong>`) && head.includes(`href="${BASE}/blog/penulis/${author.slug}/"`)
  && head.includes(`>${malayDate(post.published_at)}</time> · `) && /\d+ min bacaan/.test(head) && head.includes(esc(cred)) && head.includes(`Kemas kini terakhir <time datetime="`)
  && (h.match(/<h1/g) || []).length === 1, `${malayDate(post.published_at)}; ${esc(cred)}`);

// A3 — feature image: responsive 16:7 with alt + caption; no image → no hero
const hero = sec(h, 'hm-art__hero');
const plain = await page('/blog/artikel-ujian-02/');
check('A3', 'Feature image: responsive (srcset up to 2400w), alt text and caption from Ghost, loaded first (not lazy); an article without an image shows no hero',
  /srcset="[^"]+600w[^"]+1000w[^"]+1600w[^"]+2400w"/.test(hero) && hero.includes(`alt="${esc(post.feature_image_alt)}"`) && hero.includes('hm-art__caption') && hero.includes('fetchpriority="high"') && !hero.includes('loading="lazy"')
  && !plain.includes('class="hm-art__hero'), 'demo: test image; artikel-ujian-02: none');

// A4 — Ghost editor blocks keep Ghost's own markup (styled by the theme)
const content = sec(h, 'hm-art__content');
check('A4', 'Editor blocks render from Ghost: grey callout (Poin utama), alternate quote (pull quote), white callout ("Bila perlu…"), toggle (FAQ), image card + caption, lists; "Rujukan" heading present',
  ['kg-callout-card-grey', 'kg-blockquote-alt', 'kg-callout-card-white', 'kg-toggle-card', 'kg-image-card', '<figcaption', '<ul>', 'id="rujukan"'].every((k) => content.includes(k)));

// A5 — consultation band + card: booking and WhatsApp; #tanpa-cta hides both
const band = sec(h, 'hm-art__band'); const card = sec(h, 'hm-art__card');
await editPost(post, { tags: [...post.tags.map((t) => ({ id: t.id })), { name: '#tanpa-cta' }] });
const noCta = await page(PATH);
await editPost(post, { tags: post.tags.map((t) => ({ id: t.id })) });
const restored = await page(PATH);
check('A5', 'Consultation: in-article band (→ ED booking form) and side card (booking + WhatsApp to the configured number); internal tag #tanpa-cta hides both; removing it brings them back',
  band.includes(`href="${BASE}/disfungsi-ereksi/#temujanji"`) && card.includes(`href="${BASE}/disfungsi-ereksi/#temujanji"`) && card.includes(`https://wa.me/${wa}?text=`)
  && !noCta.includes('class="hm-art__band"') && !noCta.includes('class="hm-art__card"') && restored.includes('class="hm-art__band"') && restored.includes('class="hm-art__card"'));

// A6 — tags, disclaimer, author box
const tagsRow = sec(h, 'hm-art__tags'); const box = sec(h, 'hm-art__authorbox');
const publicTags = post.tags.filter((t) => t.visibility === 'public');
check('A6', 'End of article: medical disclaimer; public tags only (→ topic pages, internal #tags never shown); author box with name, credentials, bio and "Semua artikel oleh …" link',
  h.includes('Artikel ini adalah untuk pendidikan umum dan bukan pengganti nasihat perubatan.') && publicTags.every((t) => tagsRow.includes(`/blog/topik/${t.slug}/">${esc(t.name)}</a>`)) && !/#|hash-/.test(tagsRow.replace(/href="[^"]*"/g, ''))
  && box.includes(`>${esc(author.name)}</strong>`) && box.includes(esc(cred)) && (!author.bio || box.includes(esc(author.bio).slice(0, 40))) && box.includes(`Semua artikel oleh ${esc(author.name)}`),
  publicTags.map((t) => t.name).join(', '));

// A7 — Baca seterusnya: same category, excluding this article; fallback to latest; never a block
const relSlugs = (html) => [...sec(html, 'hm-related__grid').matchAll(/href="[^"]*\/blog\/([^/"]+)\/"/g)].map((m) => m[1]);
const sameCat = (await admin(`/posts/?limit=all&filter=${encodeURIComponent(`tag:${tag.slug}+id:-${post.id}+tag:-hash-blok`)}`)).posts.map((p) => p.slug).slice(0, 3);
const lonely = (await admin('/posts/slug/perbualan-ed-dengan-pasangan/?include=tags')).posts[0];
const lonelyCatCount = (await admin(`/posts/?limit=all&filter=${encodeURIComponent(`tag:${lonely.primary_tag.slug}+tag:-hash-blok`)}`)).posts.length;
const lonelyRel = relSlugs(await page('/blog/perbualan-ed-dengan-pasangan/'));
const blockSlugs = BLOCKS.map((b) => b.slug);
check('A7', '"Baca seterusnya": 3 newest from the same category, never this article; a category with no other articles falls back to the latest 3; never a content block',
  JSON.stringify(relSlugs(h)) === JSON.stringify(sameCat) && !relSlugs(h).includes(SLUG) && lonelyCatCount === 1 && lonelyRel.length === 3 && !lonelyRel.includes('perbualan-ed-dengan-pasangan')
  && ![...relSlugs(h), ...lonelyRel].some((s) => blockSlugs.includes(s)), `${relSlugs(h).join(', ')} | fallback: ${lonelyRel.join(', ')}`);

// A8 — Panduan berkaitan (approved refinement): same-topic "panduan" first, then the newest from other topics;
// 2 shown; never the current article; never a block. Checked on a normal article, a guide, and a "Panduan"-topic article.
const guidesOf = (html) => [...sec(html, 'hm-art__guides').matchAll(/href="[^"]*\/blog\/([^/"]+)\/"/g)].map((m) => m[1]).slice(0, 2);
const expectGuides = async (slug) => {
  const p = (await admin(`/posts/slug/${slug}/?include=tags`)).posts[0];
  const all = (await admin('/posts/?limit=all&include=tags&order=published_at%20desc&filter=tag:panduan%2Btag:-hash-blok')).posts.filter((x) => x.id !== p.id);
  const same = all.filter((x) => x.tags.some((t) => t.slug === p.primary_tag.slug)); const other = all.filter((x) => !same.includes(x));
  return [...same, ...other].slice(0, 2).map((x) => x.slug);
};
const g = {};
for (const s of [SLUG, 'panduan-lengkap-disfungsi-ereksi', 'konsultasi-kesihatan-lelaki-pertama']) g[s] = { got: guidesOf(await page(`/blog/${s}/`)), want: await expectGuides(s) };
check('A8', '"Panduan berkaitan": same-topic panduan first, then the newest from other topics (2 shown); never the article being read, never a block',
  Object.entries(g).every(([s, v]) => v.got.length === 2 && JSON.stringify(v.got) === JSON.stringify(v.want) && !v.got.includes(s) && !v.got.some((x) => BLOCKS.some((b) => b.slug === x)))
  && g[SLUG].got[0] === 'panduan-lengkap-disfungsi-ereksi', Object.entries(g).map(([s, v]) => `${s.slice(0, 18)}…: ${v.got.join(' + ')}`).join(' | '));

// A11 — approved article statements (CLINICAL-REVIEW E1–E3), word for word
check('A11', 'Approved wording (E1–E3) exactly as written: disclaimer at the end, side-card heading + text, red band heading + text',
  h.includes('Artikel ini adalah untuk pendidikan umum dan bukan pengganti nasihat perubatan. Sila berjumpa doktor untuk penilaian peribadi.')
  && card.includes('Ada soalan tentang artikel ini?') && card.includes('Bincang secara sulit dengan doktor kami.')
  && band.includes('Bincang secara sulit dengan doktor<') && band.includes('Konsultasi &amp; penilaian di Him &amp; Me.'));

// A9 — share + SEO from Ghost
const share = sec(h, 'hm-art__share');
const og = (prop) => (h.match(new RegExp(`<meta property="${prop}" content="([^"]+)"`)) || [])[1] || '';
check('A9', 'Share: WhatsApp link carries the title + article URL, copy-link button; Ghost SEO tags use the post (og:title, og:image = feature image, article:published_time, canonical)',
  share.includes(`https://wa.me/?text=${encodeURIComponent(`${post.title} ${post.url}`)}`) && share.includes('data-hm-copy-link')
  && og('og:title') && og('og:image').includes('gambar-ujian-utama') && /article:published_time/.test(h) && h.includes(`<link rel="canonical" href="${post.url}"`), og('og:image').split('/').pop());

// A10 — no block anywhere on the article; Stage 2 chrome intact
check('A10', 'No content block is linked from the article; Stage 2 chrome kept (top bar, article header with progress bar, blog footer, phone bar); no newsletter, no "e-mel"/"email"',
  !blockSlugs.some((s) => h.includes(`/${s}/`)) && ['hm-topbar', 'hm-aheader', 'hm-progress', 'hm-bfooter', 'hm-mbar--article'].every((c) => h.includes(c)) && !/Langgan|e-?mel|e-?mail/i.test(h.replace(/<script[\s\S]*?<\/script>/g, '')));

// Browser checks
let chromium; try { ({ chromium } = createRequire(import.meta.url)('playwright')); } catch { console.log('SKIP  browser checks — Playwright not available'); }
if (chromium) {
  const b = await chromium.launch();
  const d = await b.newPage({ viewport: { width: 1440, height: 900 } }); await d.goto(BASE + PATH, { waitUntil: 'networkidle' });
  // B1 — contents list, references moved, Poin utama lines
  const ui = await d.evaluate(() => ({
    toc: [...document.querySelectorAll('.hm-art__toc .hm-doc__toc-list a')].map((a) => a.textContent.trim()), open: document.querySelector('.hm-art__toc').open,
    refsIn: !!document.querySelector('[data-hm-refs] #rujukan') && !document.querySelector('.hm-art__content #rujukan'), refsAfterBand: (() => { const band = document.querySelector('.hm-art__band'); const refs = document.querySelector('[data-hm-refs]'); return !!(band && refs && (band.compareDocumentPosition(refs) & Node.DOCUMENT_POSITION_FOLLOWING)); })(),
    points: document.querySelectorAll('.kg-callout-card-grey .hm-points li').length, label: getComputedStyle(document.querySelector('.kg-callout-card-grey'), '::before').content,
    dropcap: getComputedStyle(document.querySelector('.hm-art__content > p'), '::first-letter').fontSize,
    guidesShown: [...document.querySelectorAll('.hm-art__guides a')].filter((a) => getComputedStyle(a).display !== 'none').length,
  }));
  check('B1', 'Desktop: "Dalam artikel ini" lists the 5 H2 sections (not Rujukan), open as a rail; Rujukan moved below the consultation band; "Poin utama" box with 3 points; red drop cap; exactly 2 guides visible',
    ui.toc.length === 5 && !ui.toc.some((t) => /rujukan/i.test(t)) && ui.open && ui.refsIn && ui.refsAfterBand && ui.points === 3 && /POIN UTAMA/.test(ui.label) && ui.dropcap === '76px' && ui.guidesShown === 2, `${ui.toc.length} sections; drop cap ${ui.dropcap}; ${ui.guidesShown} guides shown`);
  // B2 — reading progress, FAQ toggle, contents link, copy link
  const p0 = await d.evaluate(() => parseFloat(document.querySelector('[data-hm-progress]').style.width) || 0);
  await d.evaluate(() => window.scrollTo(0, document.querySelector('.hm-art__main').offsetTop + document.querySelector('.hm-art__main').offsetHeight / 2)); await d.waitForTimeout(250);
  const p1 = await d.evaluate(() => parseFloat(document.querySelector('[data-hm-progress]').style.width));
  await d.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await d.waitForTimeout(250);
  const p2 = await d.evaluate(() => parseFloat(document.querySelector('[data-hm-progress]').style.width));
  await d.click('.kg-toggle-heading'); await d.waitForTimeout(200);
  const toggled = await d.getAttribute('.kg-toggle-card', 'data-kg-toggle-state');
  await d.click('.hm-art__toc .hm-doc__toc-list a >> nth=3'); await d.waitForTimeout(700);
  const hash = await d.evaluate(() => location.hash);
  await d.click('[data-hm-copy-link]'); await d.waitForTimeout(200);
  const copied = await d.textContent('[data-hm-copied]');
  check('B2', 'Reading-progress bar fills as you read (0% → part → 100%); FAQ toggle opens; contents links jump to their section; copy-link confirms "Pautan disalin"',
    p0 < 5 && p1 > 20 && p1 < 90 && p2 === 100 && toggled === 'open' && hash === '#bila-perlu-berjumpa-doktor' && /Pautan disalin/.test(copied), `progress ${p0}% → ${p1}% → ${p2}%`);
  // B3 — search from the article header (desktop)
  await d.click('.hm-aheader__search'); await d.fill('[data-hm-search-input]', 'testosteron'); await d.waitForSelector('[data-hm-search-list] a');
  const hits = await d.locator('[data-hm-search-list] a').count(); await d.keyboard.press('Escape');
  check('B3', 'Article header search icon opens the blog search (articles only); Escape closes it', hits > 0 && await d.isHidden('#hm-search-results'), `${hits} result(s)`);
  await d.close();
  // B4 — phone layout (Artikel — mobile)
  const m = await b.newPage({ viewport: { width: 390, height: 844 } }); await m.goto(BASE + PATH, { waitUntil: 'networkidle' });
  const mob = await m.evaluate(() => ({ sw: document.documentElement.scrollWidth, tocOpen: document.querySelector('.hm-art__toc').open, tocAboveText: document.querySelector('.hm-art__toc').getBoundingClientRect().top < document.querySelector('.hm-art__content').getBoundingClientRect().top,
    aside: getComputedStyle(document.querySelector('.hm-art__aside')).display, share: getComputedStyle(document.querySelector('.hm-art__share')).display, crumbs: getComputedStyle(document.querySelector('.hm-art__crumbs')).display,
    left: getComputedStyle(document.querySelector('.hm-art__head')).textAlign, heroW: Math.round(document.querySelector('.hm-art__hero-img').getBoundingClientRect().width), mbar: getComputedStyle(document.querySelector('.hm-mbar--article')).display,
    related: [...document.querySelectorAll('.hm-card--related')].map((c) => getComputedStyle(c).flexDirection),
    tagsOk: (() => { const t = document.querySelector('.hm-art__tags'); return !!t && getComputedStyle(t).flexWrap === 'wrap' && [...t.children].every((a) => a.getBoundingClientRect().right <= 390 - 15); })() }));
  check('B4', 'Phone: no overflow; full-width image; tag buttons visible and wrapping inside the screen; left-aligned header without breadcrumb; contents collapsed above the text; side rails hidden; related as compact rows; slim sticky bar',
    mob.sw === 390 && mob.heroW === 390 && mob.left === 'left' && mob.crumbs === 'none' && !mob.tocOpen && mob.tocAboveText && mob.aside === 'none' && mob.share === 'none' && mob.related.every((f) => f === 'row-reverse') && mob.mbar === 'flex' && mob.tagsOk, JSON.stringify(mob));
  await m.close();
  // B5 — no overflow at four widths, two articles; no-JS still readable
  const over = [];
  for (const path of [PATH, '/blog/artikel-ujian-02/', '/blog/panduan-lengkap-disfungsi-ereksi/']) for (const w of [390, 768, 1024, 1440]) {
    const q = await b.newPage({ viewport: { width: w, height: 900 } }); await q.goto(BASE + path); const sw = await q.evaluate(() => document.documentElement.scrollWidth); if (sw > w) over.push(`${path}@${w}: ${sw}`); await q.close();
  }
  const nj = await b.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } }); const n = await nj.newPage(); await n.goto(BASE + PATH);
  const noJs = await n.evaluate(() => ({ refsInText: !!document.querySelector('.hm-art__content #rujukan'), refsSize: getComputedStyle(document.querySelector('.hm-art__content #rujukan')).fontSize, copy: getComputedStyle(document.querySelector('[data-hm-copy-link]')).display, toc: document.querySelector('[data-hm-toc]').hidden }));
  await nj.close();
  check('B5', 'No horizontal overflow at 390/768/1024/1440 (rich, plain and guide articles); without JavaScript the text, references (styled in place) and WhatsApp share still work, copy-link and contents are hidden',
    over.length === 0 && noJs.refsInText && noJs.refsSize === '12px' && noJs.copy === 'none' && noJs.toc, over.join(', ') || 'none');
  await b.close();
}

const fails = results.filter((r) => !r.pass);
console.log(`\n${results.length - fails.length} passed, ${fails.length} failed`);
process.exit(fails.length ? 1 : 0);
