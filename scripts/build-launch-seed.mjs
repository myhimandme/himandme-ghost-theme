// G4 (Stage 7): builds the PRODUCTION launch import file from seed/blocks.mjs ONLY.
//
//   node scripts/build-launch-seed.mjs        → dist/launch-seed.json (+ printed counts and SHA-256)
//
// Rules (docs/STAGE-7-PLAN.md §3.3):
//   1. Reads only seed/blocks.mjs (BLOCKS and PAGES). Nothing from test/ is imported.
//   2. Allowlist: the slugs must be exactly the 23 approved #blok blocks + the 3 pages, or nothing is written.
//   3. Denylist: refuses if any slug, title or text contains test-data markers or local hosts.
//   4. No author records: Ghost assigns authorless imported posts to the Owner account, which is
//      Dr Imran (slug `dr`) on production (O28 rule: every #blok post belongs only to `dr`).
//   5. Deterministic output (fixed timestamps, UUIDs derived from slugs) so the checksum is reproducible.
// Category tags are NOT included: Ghost's importer skips tags without posts; they are created by hand (§3.2).
import { writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { BLOCKS, PAGES } from '../seed/blocks.mjs';

const ALLOWED_BLOCKS = [
  'blok-maklumat-hubungan', 'blok-penafian', 'blok-tawaran',
  'blok-utama-hero', 'blok-utama-kenyataan', 'blok-utama-perkhidmatan', 'blok-utama-servis-konsultasi',
  'blok-utama-servis-shockwave', 'blok-utama-servis-kegel-ems', 'blok-utama-proses', 'blok-utama-privasi',
  'blok-utama-pasukan', 'blok-utama-blog', 'blok-utama-faq', 'blok-utama-cta',
  'blok-ed-apa', 'blok-ed-punca', 'blok-ed-penilaian', 'blok-ed-shockwave', 'blok-ed-kegel-ems',
  'blok-ed-perbandingan', 'blok-ed-faq', 'blok-ed-temujanji',
];
const ALLOWED_PAGES = ['disfungsi-ereksi', 'jurnal', 'notis-privasi'];
const ALLOWED_TAGS = { 'hash-blok': '#blok', 'hash-blok-utama': '#blok-utama', 'hash-blok-ed': '#blok-ed' };
const DENY = [/artikel-ujian/i, /\bujian\b/i, /teks contoh/i, /gambar ujian/i, /dr\.?\s*ujian/i, /localhost/i, /himandme\.local/i, /127\.0\.0\.1/];
const FIXED_TIME = '2026-11-21T00:00:00.000Z';

const fail = (msg) => { console.error(`STOP: ${msg}\nlaunch-seed.json was NOT written.`); process.exit(1); };
const same = (a, b) => a.length === b.length && [...a].sort().join() === [...b].sort().join();

if (!same(BLOCKS.map((b) => b.slug), ALLOWED_BLOCKS)) fail(`block slugs differ from the approved 23: ${BLOCKS.map((b) => b.slug).join(', ')}`);
if (!same(PAGES.map((p) => p.slug), ALLOWED_PAGES)) fail(`page slugs differ from the approved 3: ${PAGES.map((p) => p.slug).join(', ')}`);
for (const item of [...BLOCKS, ...PAGES]) {
  const text = [item.slug, item.title, item.excerpt, item.html, item.meta_title, item.meta_description].filter(Boolean).join('\n');
  for (const re of DENY) if (re.test(text)) fail(`${item.slug} contains a denied pattern ${re}`);
  for (const t of item.tags || []) if (!ALLOWED_TAGS[t]) fail(`${item.slug} uses a tag outside the allowlist: ${t}`);
}

const hex = (s, n = 24) => createHash('sha256').update(s).digest('hex').slice(0, n);
const uuidFrom = (s) => { const h = hex(`uuid:${s}`, 32); return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`; };
const tags = Object.entries(ALLOWED_TAGS).map(([slug, name]) => ({ id: hex(`tag:${slug}`), name, slug, visibility: 'internal', description: null }));
const tagId = Object.fromEntries(tags.map((t) => [t.slug, t.id]));
const base = { status: 'published', visibility: 'public', featured: false, created_at: FIXED_TIME, updated_at: FIXED_TIME, published_at: FIXED_TIME };

const posts = [];
const postsTags = [];
for (const p of PAGES) {
  posts.push({ id: hex(`post:${p.slug}`), uuid: uuidFrom(p.slug), type: 'page', slug: p.slug, title: p.title,
    custom_excerpt: p.excerpt || null, meta_title: p.meta_title || null, meta_description: p.meta_description || null,
    custom_template: p.custom_template || null, html: p.html, ...base });
}
for (const b of BLOCKS) {
  const id = hex(`post:${b.slug}`);
  posts.push({ id, uuid: uuidFrom(b.slug), type: 'post', slug: b.slug, title: b.title,
    custom_excerpt: b.excerpt || null, html: b.html || '', ...base });
  b.tags.forEach((t, i) => postsTags.push({ post_id: id, tag_id: tagId[t], sort_order: i }));
}

const seed = { db: [{ meta: { exported_on: Date.parse(FIXED_TIME), version: '6.75.0' }, data: { posts, tags, posts_tags: postsTags } }] };
const json = `${JSON.stringify(seed, null, 2)}\n`;
// Final self-check on the serialised file: no author data, exact counts.
if (/"authors"|"users"|"author_id"/.test(json)) fail('author data found in the output');
const nBlocks = posts.filter((p) => p.type === 'post').length;
const nPages = posts.filter((p) => p.type === 'page').length;
if (nBlocks !== 23 || nPages !== 3) fail(`unexpected counts: ${nBlocks} blocks, ${nPages} pages`);

mkdirSync('dist', { recursive: true });
writeFileSync('dist/launch-seed.json', json);
console.log(`launch-seed.json: ${nBlocks} #blok blocks, ${nPages} pages, ${tags.length} internal tags, ${postsTags.length} tag links, no authors`);
console.log(`SHA-256 ${createHash('sha256').update(json).digest('hex')}  dist/launch-seed.json`);
