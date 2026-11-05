// Generates test/stage1/fixtures/seed-stage1.json — a Ghost JSON import file used to
// (1) verify the Admin "Import content" path and (2) seed the routing / content-block tests.
// Test data only. The real launch seed (21 blocks with approved copy) is produced in a later stage.
import { writeFileSync, mkdirSync } from 'node:fs';
import { BLOCKS, PAGES } from '../../seed/blocks.mjs';

let n = 0;
const oid = () => (0x6a000000 + ++n).toString(16).padStart(8, '0') + '0000000000000000';
const now = new Date('2026-11-05T09:00:00.000Z');
const at = (minsAgo) => new Date(now.getTime() - minsAgo * 60000).toISOString();

const tags = {};
const tag = (slug, name, visibility = 'public', description = null) =>
  (tags[slug] = { id: oid(), name, slug, visibility, description });

tag('hash-blok', '#blok', 'internal');
tag('hash-blok-utama', '#blok-utama', 'internal');
tag('hash-blok-ed', '#blok-ed', 'internal');
tag('hash-popular', '#popular', 'internal');
tag('disfungsi-ereksi', 'Disfungsi Ereksi', 'public', 'Punca, penilaian dan pilihan.');
tag('gaya-hidup', 'Gaya Hidup', 'public', 'Tidur, tekanan, senaman dan pemakanan.');
tag('panduan', 'Panduan', 'public', 'Panduan panjang, disusun mengikut bab.');

const posts = [];
const postsTags = [];
const add = (p, tagSlugs = []) => {
  const id = oid();
  posts.push({
    id,
    uuid: crypto.randomUUID(),
    status: 'published',
    visibility: 'public',
    featured: false,
    type: 'post',
    created_at: p.published_at,
    updated_at: p.published_at,
    ...p,
  });
  tagSlugs.forEach((s, i) => postsTags.push({ post_id: id, tag_id: tags[s].id, sort_order: i }));
};

// Landing page (real public page with a custom template) + SEO data page for /blog/

// Pages (ED page with its FAQ body, jurnal route data, policy pages) from the seed.
PAGES.forEach((pg, i) => add({ type: 'page', slug: pg.slug, title: pg.title, custom_excerpt: pg.excerpt || null, meta_title: pg.meta_title || null, meta_description: pg.meta_description || null, custom_template: pg.custom_template || null, html: pg.html, published_at: at(500 - i) }));
// Content blocks: the real block definitions with approved copy (seed/blocks.mjs).
BLOCKS.forEach((b, i) => add({ slug: b.slug, title: b.title, custom_excerpt: b.excerpt || null, html: b.html || '', published_at: at(420 - i) }, b.tags));

// Test articles: 12 posts so /blog/ (9 per page) and the tag archive paginate.
for (let i = 1; i <= 12; i++) {
  const t = i % 6 === 0 ? ['gaya-hidup'] : ['disfungsi-ereksi']; // 10 posts → topic page paginates
  if (i <= 2) t.push('hash-popular');
  if (i === 5) t.push('panduan');
  add({ slug: `artikel-ujian-${String(i).padStart(2, '0')}`, title: `Artikel ujian ${i}`,
    custom_excerpt: `Ringkasan artikel ujian ${i}.`, featured: i <= 3,
    html: `<h2>Bahagian satu</h2><p>Kandungan artikel ujian ${i}.</p><h2>Bahagian dua</h2><p>Lagi.</p>`,
    published_at: at(300 - i) }, t);
}

const seed = {
  db: [{
    meta: { exported_on: now.getTime(), version: '6.75.0' },
    data: { posts, tags: Object.values(tags), posts_tags: postsTags },
  }],
};

mkdirSync(new URL('./fixtures/', import.meta.url), { recursive: true });
writeFileSync(new URL('./fixtures/seed-stage1.json', import.meta.url), JSON.stringify(seed, null, 2));
console.log(`fixtures: ${posts.length} posts/pages, ${Object.keys(tags).length} tags`);
