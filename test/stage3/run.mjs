// Stage 3 checks: homepage (Utama). Every block-driven section reads its block, falls back to the
// approved copy when the block is unpublished, the "Dari blog" teaser lists only real articles,
// images/doctor card/links behave, plus basic accessibility. LOCAL Ghost only.
//
//   GHOST_ADMIN_EMAIL=… GHOST_ADMIN_PASSWORD=… node test/stage3/run.mjs
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
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
const home = async () => (await fetch(BASE + '/')).text();
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const results = [];
const check = (id, what, pass, detail = '') => { results.push({ id, pass }); console.log(`${pass ? 'PASS' : 'FAIL'}  ${id.padEnd(4)} ${what}${detail ? ` — ${detail}` : ''}`); };
const editPost = async (id, fields) => {
  const cur = (await admin(`/posts/${id}/`)).posts[0];
  return (await admin(`/posts/${id}/`, { method: 'PUT', json: { posts: [{ ...fields, updated_at: cur.updated_at }] } })).posts[0];
};

await admin('/session/', { method: 'POST', json: { username: EMAIL, password: PASSWORD } });
const posts = (await admin('/posts/?limit=all&filter=tag:hash-blok&formats=html')).posts;
const bySlug = Object.fromEntries(posts.map((p) => [p.slug, p]));

// H1 — every homepage block drives its section, and falls back when unpublished.
const homeBlocks = BLOCKS.filter((b) => b.slug.startsWith('blok-utama-'));
const cycle = [];
for (const b of homeBlocks) {
  const post = bySlug[b.slug]; if (!post) { cycle.push(`${b.slug}: missing`); continue; }
  const marker = `${post.title} (diedit)`;
  await editPost(post.id, { title: marker });
  const edited = await home();
  await editPost(post.id, { status: 'draft' });
  const fallback = await home();
  await editPost(post.id, { status: 'published', title: post.title });
  const usesBlock = edited.includes(esc(marker));
  const fellBack = !fallback.includes(esc(marker)) && fallback.includes(esc(b.title));
  if (!usesBlock || !fellBack) cycle.push(`${b.slug}: block ${usesBlock ? 'ok' : 'NOT used'}, fallback ${fellBack ? 'ok' : 'MISSING'}`);
}
check('H1', `All ${homeBlocks.length} homepage blocks drive their section and fall back to approved copy when unpublished`, cycle.length === 0, cycle.join('; ') || 'edit → visible; unpublish → approved copy; restored');

// H2 — "Dari blog": the 3 newest real articles, never a block (even a newly re-dated block).
const articles = (await admin('/posts/?limit=all&filter=status:published%2Btag:-hash-blok&order=published_at%20desc&fields=slug,title')).posts;
const teaserSlugs = (h) => [...h.matchAll(/<a class="hm-tcard" href="[^"]*\/blog\/([^/]+)\/"/g)].map((m) => m[1]);
let h = await home();
check('H2', '"Dari blog" shows the 3 newest articles', JSON.stringify(teaserSlugs(h)) === JSON.stringify(articles.slice(0, 3).map((a) => a.slug)), teaserSlugs(h).join(', '));
const blk = bySlug['blok-utama-proses'];
const oldDate = blk.published_at;
await editPost(blk.id, { published_at: new Date().toISOString() });
const art = (await admin('/posts/', { method: 'POST', json: { posts: [{ title: 'Artikel ujian Stage 3', status: 'published', tags: [{ name: 'Disfungsi Ereksi' }], custom_excerpt: 'Ringkasan.' }] } })).posts[0];
h = await home();
const t = teaserSlugs(h);
check('H3', 'A newly published article appears first; a re-dated block never appears', t[0] === art.slug && !t.some((s) => s.startsWith('blok-')), t.join(', '));
await admin(`/posts/${art.id}/`, { method: 'DELETE' });
await editPost(blk.id, { published_at: oldDate });
h = await home();
check('H4', 'Deleting the article removes it from the teaser', !teaserSlugs(h).includes(art.slug));

// H5 — images: hero photo from the block's feature image (responsive + preloaded), placeholder otherwise.
check('H5', 'Without a feature image the hero shows the prototype placeholder', /class="hm-hero__img hm-cut hm-ph"/.test(h));
const f = new FormData(); f.append('file', new Blob([readFileSync(new URL('./fixtures/test-hero.jpg', import.meta.url))], { type: 'image/jpeg' }), 'test-hero.jpg');
const img = (await admin('/images/upload/', { method: 'POST', form: f })).images[0].url;
const hero = bySlug['blok-utama-hero'];
await editPost(hero.id, { feature_image: img, feature_image_alt: 'Doktor dan pesakit di bilik konsultasi' });
h = await home();
const heroImg = (h.match(/<img class="hm-hero__img hm-cut"[^>]*>/) || [''])[0];
check('H6', 'Hero photo: responsive srcset, alt text, not lazy, preloaded in <head>',
  /srcset="[^"]*size\/w600[^"]* 600w/.test(heroImg) && heroImg.includes('alt="Doktor dan pesakit di bilik konsultasi"') && !heroImg.includes('loading="lazy"') && /<link rel="preload" as="image" href="[^"]*test-hero/.test(h));
await editPost(hero.id, { feature_image: null, feature_image_alt: null });
const priv = bySlug['blok-utama-privasi'];
await editPost(priv.id, { feature_image: img, feature_image_alt: 'Ruang menunggu' });
h = await home();
const privImg = (h.match(/<img class="hm-privacy__img"[^>]*>/) || [''])[0];
check('H6b', 'Privacy band photo from its block: responsive, alt text, lazy-loaded below the fold', privImg.includes('alt="Ruang menunggu"') && privImg.includes('loading="lazy"') && privImg.includes(' 1000w'));
await editPost(priv.id, { feature_image: null, feature_image_alt: null });

// H7 — doctor card from the single staff profile + credentials setting.
const cs = (await admin('/custom_theme_settings/')).custom_theme_settings;
const setCS = (vals) => admin('/custom_theme_settings/', { method: 'PUT', json: { custom_theme_settings: cs.map((s) => ({ key: s.key, value: s.key in vals ? vals[s.key] : s.value })) } });
const me = (await admin('/users/me/')).users[0];
await setCS({ doctor_author_slug: '', doctor_credentials: '' });
const noSlug = await home();
await setCS({ doctor_author_slug: me.slug, doctor_credentials: '[Kelayakan yang disahkan]' });
const withSlug = await home();
check('H7', 'Doctor card: placeholder without a slug; profile name + credentials + archive link with it',
  noSlug.includes('[Nama Penuh]') && withSlug.includes(`hm-doctor__name">${esc(me.name)}<`) && withSlug.includes('[Kelayakan yang disahkan]') && withSlug.includes(`href="/blog/penulis/${me.slug}/"`));
await admin('/custom_theme_settings/', { method: 'PUT', json: { custom_theme_settings: cs.map((s) => ({ key: s.key, value: s.value })) } });

// H8 — links.
h = await home();
check('H8', 'Service cards link to the ED page sections (#penilaian, #shockwave, #ems)', ['penilaian', 'shockwave', 'ems'].every((a) => h.includes(`/disfungsi-ereksi/#${a}"`)));
check('H9', 'CTA band keeps id="temujanji"; booking buttons go to the ED booking form', h.includes('id="temujanji"') && (h.match(/\/disfungsi-ereksi\/#temujanji/g) || []).length >= 4);

// H10 — accessibility basics.
const h1s = (h.match(/<h1[\s>]/g) || []).length;
const imgsNoAlt = [...h.matchAll(/<img\b[^>]*>/g)].filter((m) => !/\salt=/.test(m[0])).length;
const sections = [...h.matchAll(/<section[^>]*aria-labelledby="([^"]+)"/g)].map((m) => m[1]);
const missingIds = sections.filter((id) => !h.includes(`id="${id}"`));
check('H10', 'One <h1>; every <img> has alt; every labelled section points at a real heading', h1s === 1 && imgsNoAlt === 0 && missingIds.length === 0, `${h1s} h1, ${imgsNoAlt} img without alt, ${sections.length} labelled sections`);

// H11 — FAQ behaviour in a real browser (skipped if Playwright is unavailable).
try {
  const { chromium } = createRequire(import.meta.url)('playwright');
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto(BASE + '/'); await p.waitForTimeout(800);
  const s0 = await p.$$eval('[data-hm-faq] .kg-toggle-card', (els) => els.map((e) => [e.dataset.kgToggleState, e.querySelector('.kg-toggle-card-icon')?.getAttribute('aria-expanded')]));
  await p.click('[data-hm-faq] .kg-toggle-card:nth-of-type(2) .kg-toggle-heading'); await p.waitForTimeout(300);
  const s1 = await p.$$eval('[data-hm-faq] .kg-toggle-card', (els) => els.map((e) => e.dataset.kgToggleState));
  await b.close();
  check('H11', 'FAQ: first question open on load, others closed; clicking opens a question; aria-expanded kept in sync',
    s0[0][0] === 'open' && s0[0][1] === 'true' && s0.slice(1).every(([st, ae]) => st === 'close' && ae === 'false') && s1[1] === 'open', JSON.stringify(s0.map((x) => x[0])));
} catch (e) { console.log('SKIP  H11  FAQ browser test —', e.message.split('\n')[0]); }

const fails = results.filter((r) => !r.pass);
console.log(`\n${results.length - fails.length} passed, ${fails.length} failed`);
process.exit(fails.length ? 1 : 0);
