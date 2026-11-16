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
tag('disfungsi-ereksi', 'Disfungsi Ereksi', 'public', 'Punca, penilaian dan pilihan rawatan.');
tag('hormon-testosteron', 'Hormon & Testosteron', 'public', 'Tenaga, keinginan dan perubahan dengan usia.');
tag('kesihatan-pelvis', 'Kesihatan Pelvis', 'public', 'Otot lantai pelvis, kawalan dan senaman.');
tag('seks-hubungan', 'Seks & Hubungan', 'public', 'Komunikasi dan keintiman bersama pasangan.');
tag('kesihatan-mental', 'Kesihatan Mental', 'public', 'Tekanan, kebimbangan dan kesejahteraan emosi.');
tag('gaya-hidup', 'Gaya Hidup & Minda', 'public', 'Tidur, tekanan, senaman dan pemakanan.');
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

// Test articles: 12 posts (plus the demo articles below) so /blog/ (9 per page) and the tag archive paginate.
for (let i = 1; i <= 12; i++) {
  const t = i % 6 === 0 ? ['gaya-hidup'] : ['disfungsi-ereksi']; // 10 posts → topic page paginates
  if (i <= 2) t.push('hash-popular');
  if (i === 5) t.push('panduan');
  add({ slug: `artikel-ujian-${String(i).padStart(2, '0')}`, title: `Artikel ujian ${i}`,
    custom_excerpt: `Ringkasan artikel ujian ${i}.`, featured: i <= 3,
    html: `<h2>Bahagian satu</h2><p>Kandungan artikel ujian ${i}.</p><h2>Bahagian dua</h2><p>Lagi.</p>`,
    published_at: at(300 - i) }, t);
}

// Stage 5 demo articles: titles and summaries from the approved Blog board, so every blog section has
// realistic data. Bodies are neutral placeholder text (test data only, no medical content).
const filler = (n) => Array.from({ length: n }, (_, k) => `<p>Teks contoh untuk ujian susun atur tema, perenggan ${k + 1}. Kandungan sebenar ditulis dan disemak oleh doktor sebelum diterbitkan.</p>`).join('');
const DEMO = [
  ['disfungsi-ereksi-bukan-sekadar-soal-usia', 'Disfungsi ereksi bukan sekadar soal usia: memahami punca sebenar', 'Salur darah, hormon, tidur dan tekanan — mengapa fungsi ereksi sering menjadi cerminan kesihatan keseluruhan lelaki.', ['disfungsi-ereksi'], { featured: true }, 60],
  ['konsultasi-kesihatan-lelaki-pertama', 'Apa yang berlaku semasa konsultasi kesihatan lelaki pertama anda', 'Langkah demi langkah, dari pendaftaran hingga perbincangan pilihan rawatan.', ['panduan'], { featured: true }, 42],
  ['otot-lantai-pelvis-lelaki', 'Otot lantai pelvis: kenapa lelaki juga perlu ambil peduli', 'Peranan otot yang jarang dibincangkan dalam kesihatan seksual lelaki.', ['kesihatan-pelvis'], { featured: true }, 50],
  ['tidur-tekanan-prestasi', 'Tidur, tekanan dan prestasi: hubungan yang jarang dibincangkan', 'Kurang tidur menjejaskan lebih daripada mood anda.', ['gaya-hidup'], {}, 52],
  ['testosteron-rendah-tanda', 'Testosteron rendah: tanda-tanda yang perlu anda tahu', 'Bila keletihan dan keinginan rendah wajar diperiksa.', ['hormon-testosteron', 'hash-popular'], {}, 70],
  ['terapi-gelombang-kejutan-apa-dijangka', 'Terapi gelombang kejutan: apa yang perlu dijangka', 'Penerangan langkah demi langkah tentang sesi Li-ESWT.', ['disfungsi-ereksi'], {}, 44],
  ['perbualan-ed-dengan-pasangan', 'Cara memulakan perbualan tentang ED dengan pasangan', 'Ayat mudah untuk perbualan yang sukar.', ['seks-hubungan', 'hash-popular'], {}, 36],
  ['kencing-manis-kesihatan-seksual', 'Kencing manis dan kesihatan seksual lelaki', 'Mengapa kawalan gula darah penting untuk ereksi.', ['disfungsi-ereksi', 'hash-popular'], {}, 62],
  ['kebimbangan-prestasi', 'Kebimbangan prestasi: bila fikiran menghalang badan', 'Kitaran tekanan dan cara memutuskannya.', ['kesihatan-mental'], {}, 52],
  ['merokok-salur-darah-ereksi', 'Merokok dan salur darah: kesannya terhadap ereksi', 'Apa yang berlaku pada salur darah, dan apa yang berubah selepas berhenti.', ['gaya-hidup', 'hash-popular'], {}, 46],
  ['panduan-lengkap-disfungsi-ereksi', 'Panduan lengkap disfungsi ereksi', 'Dari punca hingga pilihan rawatan, dalam satu panduan.', ['disfungsi-ereksi', 'panduan'], {}, 150],
  ['memahami-testosteron-hormon-lelaki', 'Memahami testosteron & hormon lelaki', 'Apa yang dilakukan hormon, dan bila paras rendah perlu dinilai.', ['hormon-testosteron', 'panduan'], {}, 120],
  ['kesihatan-lantai-pelvis-lelaki', 'Kesihatan lantai pelvis untuk lelaki', 'Mengenali, menguatkan dan menjaga otot lantai pelvis.', ['kesihatan-pelvis', 'panduan'], {}, 110],
];
// Stage 6: the lead demo article carries the approved Artikel board's SAMPLE text, built from Ghost's own
// editor blocks (grey callout = "Poin utama", alternate quote = pull quote, white callout = "Bila perlu…" box,
// toggle = FAQ, "Rujukan" heading + list = references), so every article style can be built and tested.
// Test data only: never imported to the live site; references are the board's placeholders.
const RICH = [
  '<div class="kg-card kg-callout-card kg-callout-card-grey"><div class="kg-callout-emoji">💡</div><div class="kg-callout-text">Risiko disfungsi ereksi meningkat dengan usia, tetapi usia jarang menjadi satu-satunya punca.<br>Kesihatan salur darah, hormon, tidur dan emosi semuanya memainkan peranan.<br>Masalah yang berulang wajar dinilai oleh doktor, bukan diabaikan.</div></div>',
  '<p>Ramai lelaki menganggap kesukaran ereksi sebagai sebahagian daripada proses menua yang tidak dapat dielakkan. Walaupun usia memang memainkan peranan, gambaran sebenar biasanya lebih kompleks — dan lebih banyak yang boleh dilakukan daripada yang disangka.</p>',
  '<h2>Usia memainkan peranan, tetapi bukan satu-satunya</h2>',
  '<p>Ereksi ialah proses yang melibatkan otak, saraf, hormon, otot dan salur darah. Apabila mana-mana bahagian ini terganggu, fungsi ereksi boleh terjejas. Itulah sebabnya lelaki yang lebih muda juga boleh mengalaminya, dan sebabnya ramai lelaki yang lebih berusia tidak mengalaminya langsung.</p>',
  '<h2>Salur darah: penghubung yang sering terlepas pandang</h2>',
  '<p>Ereksi bergantung kepada aliran darah yang baik ke zakar. Keadaan yang menjejaskan salur darah — seperti darah tinggi, kolesterol tinggi, kencing manis dan merokok — juga boleh menjejaskan ereksi.</p>',
  '<blockquote class="kg-blockquote-alt">“Perubahan pada fungsi ereksi kadangkala merupakan petunjuk awal tentang kesihatan jantung dan salur darah.”</blockquote>',
  '<p>Kerana itu, penilaian yang baik tidak hanya memberi tumpuan kepada simptom, tetapi juga kepada kesihatan anda secara keseluruhan.</p>',
  '<h2>Hormon, tidur dan tekanan</h2>',
  '<p>Faktor-faktor lain yang sering dikaitkan dengan disfungsi ereksi termasuk:</p>',
  '<ul><li><strong>Paras testosteron yang rendah</strong>, yang boleh menjejaskan keinginan dan tenaga.</li><li><strong>Kurang tidur</strong> atau gangguan tidur yang berpanjangan.</li><li><strong>Tekanan dan kebimbangan prestasi</strong>, yang boleh mewujudkan kitaran sukar diputuskan.</li></ul>',
  '<h2>Bila perlu berjumpa doktor</h2>',
  '<div class="kg-card kg-callout-card kg-callout-card-white"><div class="kg-callout-emoji">ℹ️</div><div class="kg-callout-text"><strong>Pertimbangkan konsultasi jika:</strong> masalah berlaku berulang kali selama beberapa minggu; ia menjejaskan keyakinan atau hubungan anda; atau anda juga mempunyai kencing manis, darah tinggi atau penyakit jantung.</div></div>',
  '<div class="kg-card kg-toggle-card" data-kg-toggle-state="close"><div class="kg-toggle-heading"><h4 class="kg-toggle-heading-text">Adakah ini perkara biasa?</h4></div><div class="kg-toggle-content"><p>[Contoh soalan lazim dalam artikel. Jawapan ditulis dan disemak oleh doktor.]</p></div></div>',
  '<h2>Langkah seterusnya</h2>',
  '<p>Langkah pertama yang paling berguna ialah perbualan yang jujur dengan doktor. Penilaian membantu mengenal pasti faktor yang berkaitan dengan anda, sebelum sebarang pilihan rawatan dibincangkan.</p>',
  '<h2>Rujukan</h2>',
  '<ol><li>[Rujukan — sumber perubatan yang disahkan, cth. garis panduan klinikal]</li><li>[Rujukan]</li></ol>',
].join('');
// Newest first: the first entry is the newest post. All are newer than the Stage 1 test articles.
DEMO.forEach(([slug, title, excerpt, t, extra, paras], i) => add({ slug, title, custom_excerpt: excerpt,
  html: i === 0 ? RICH : `<h2>Bahagian satu</h2>${filler(Math.ceil(paras / 2))}<h2>Bahagian dua</h2>${filler(Math.floor(paras / 2))}`,
  published_at: at(60 - i * 3), ...extra }, i === 0 ? [...t, 'gaya-hidup'] : t));

const seed = {
  db: [{
    meta: { exported_on: now.getTime(), version: '6.75.0' },
    data: { posts, tags: Object.values(tags), posts_tags: postsTags },
  }],
};

mkdirSync(new URL('./fixtures/', import.meta.url), { recursive: true });
writeFileSync(new URL('./fixtures/seed-stage1.json', import.meta.url), JSON.stringify(seed, null, 2));
console.log(`fixtures: ${posts.length} posts/pages, ${Object.keys(tags).length} tags`);
