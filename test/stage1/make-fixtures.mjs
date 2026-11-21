// Generates test/stage1/fixtures/seed-stage1.json — a Ghost JSON import file used to
// (1) verify the Admin "Import content" path and (2) seed the routing / content-block tests.
// Test data only. The real launch seed (21 blocks with approved copy) is produced in a later stage.
import { writeFileSync, mkdirSync } from 'node:fs';

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
add({ type: 'page', slug: 'jurnal', title: 'Jurnal Kesihatan Lelaki', meta_title: 'Jurnal Kesihatan Lelaki — Him & Me', meta_description: 'Artikel pendidikan tentang kesihatan lelaki.', custom_excerpt: 'Blog Him & Me.', html: '<p>Route data for /blog/.</p>', published_at: at(499) });
add({ type: 'page', slug: 'notis-privasi', title: 'Notis Privasi', html: '<p>Kandungan ujian notis privasi.</p>', published_at: at(497) });
add({ type: 'page', slug: 'disfungsi-ereksi', title: 'Disfungsi ereksi boleh dinilai. Dan boleh dirawat.',
  custom_excerpt: 'Panduan jelas tentang disfungsi ereksi.', custom_template: 'custom-disfungsi-ereksi',
  html: '<div class="kg-card kg-toggle-card" data-kg-toggle-state="close"><div class="kg-toggle-heading"><h4 class="kg-toggle-heading-text">Adakah disfungsi ereksi perkara biasa?</h4></div><div class="kg-toggle-content"><p>Jawapan ujian FAQ ED.</p></div></div>',
  published_at: at(498) });

// Content blocks (must never be publicly discoverable). Marker "ZZBLOK" appears in each excerpt.
add({ slug: 'blok-utama-hero', title: 'Kesihatan lelaki, dibincang dengan tenang dan profesional.', custom_excerpt: 'Penilaian dan rawatan disfungsi ereksi dalam suasana yang sulit dan selesa. ZZBLOK-000', html: '<p>Hero ZZBLOK-000.</p>', published_at: at(402) }, ['hash-blok', 'hash-blok-utama']);
add({ slug: 'blok-utama-faq', title: 'Soalan yang ramai segan tanya', custom_excerpt: 'Soalan lazim utama ZZBLOK-004.',
  html: '<div class="kg-card kg-toggle-card" data-kg-toggle-state="close"><div class="kg-toggle-heading"><h4 class="kg-toggle-heading-text">Adakah konsultasi saya benar-benar sulit?</h4></div><div class="kg-toggle-content"><p>Ya. Jawapan ujian FAQ utama.</p></div></div>',
  published_at: at(401) }, ['hash-blok', 'hash-blok-utama']);
add({ slug: 'blok-maklumat-hubungan', title: 'Maklumat hubungan (footer)', custom_excerpt: 'No. 1, Jalan Contoh 1/2\n50000 Kuala Lumpur ZZBLOK-006', html: '<p>Isnin – Jumaat: 10:00 – 19:00</p><p>Sabtu: 10:00 – 14:00</p><p>Ahad &amp; cuti umum: Tutup</p>', published_at: at(405) }, ['hash-blok']);
add({ slug: 'blok-penafian', title: 'Penafian (footer)', custom_excerpt: 'Kandungan blog ini adalah untuk pendidikan umum dan bukan pengganti nasihat perubatan. Artikel disemak sebelum diterbitkan. ZZBLOK-007', html: '<p>Maklumat di laman web ini adalah untuk pendidikan umum dan bukan pengganti nasihat perubatan profesional. Kesesuaian sebarang rawatan ditentukan selepas penilaian oleh doktor. ZZBLOK-007</p>', published_at: at(404) }, ['hash-blok']);
add({ slug: 'blok-utama-perkhidmatan', title: 'Apa yang kami tawarkan', custom_excerpt: 'Ujian blok perkhidmatan ZZBLOK-001.', html: '<p>Kandungan blok ZZBLOK-001.</p>', published_at: at(400) }, ['hash-blok', 'hash-blok-utama']);
add({ slug: 'blok-utama-proses', title: 'Empat langkah, tanpa tekanan', custom_excerpt: 'Ujian blok proses ZZBLOK-002.', html: '<ul><li>Hubungi kami ZZBLOK-002</li><li>Konsultasi</li></ul>', published_at: at(399) }, ['hash-blok', 'hash-blok-utama']);
add({ slug: 'blok-ed-shockwave', title: 'Shockwave therapy (blok)', custom_excerpt: 'Ujian blok shockwave ZZBLOK-003.', html: '<p>Kandungan blok ZZBLOK-003.</p>', published_at: at(1) }, ['hash-blok', 'hash-blok-ed']);

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
