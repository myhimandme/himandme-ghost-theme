// Content blocks (#blok) with the APPROVED PROTOTYPE COPY. Single source for:
//   • the launch seed file (Settings → Advanced → Import/Export → Universal import), and
//   • the local test fixtures (test/stage1/make-fixtures.mjs).
// Public website copy only — blocks are readable through Ghost's public Content API.
// Placeholders in [square brackets] must be replaced with verified facts before launch.
//
// Field mapping per block is documented in README.md ("Content blocks").

const toggle = (q, a) =>
  `<div class="kg-card kg-toggle-card" data-kg-toggle-state="close"><div class="kg-toggle-heading"><h4 class="kg-toggle-heading-text">${q}</h4></div><div class="kg-toggle-content"><p>${a}</p></div></div>`;

/** @type {{slug:string,title:string,excerpt?:string,html?:string,tags:string[]}[]} */
export const BLOCKS = [
  // ---- Site-wide (Stage 2) ----
  {
    slug: 'blok-maklumat-hubungan', tags: ['hash-blok'],
    title: 'Maklumat hubungan (footer)',
    excerpt: '[Alamat penuh]\n[Poskod, Bandar, Negeri]',
    html: '<p>[Isnin – Jumaat: 00:00 – 00:00]</p><p>[Sabtu: 00:00 – 00:00]</p><p>[Ahad &amp; cuti umum: Tutup]</p>',
  },
  {
    slug: 'blok-penafian', tags: ['hash-blok'],
    title: 'Penafian (footer)',
    excerpt: 'Kandungan blog ini adalah untuk pendidikan umum dan bukan pengganti nasihat perubatan. Artikel disemak sebelum diterbitkan.',
    html: '<p>Maklumat di laman web ini adalah untuk pendidikan umum dan bukan pengganti nasihat perubatan profesional. Kesesuaian sebarang rawatan ditentukan selepas penilaian oleh doktor.</p>',
  },

  // ---- Homepage (Stage 3) — 12 blocks ----
  {
    slug: 'blok-utama-hero', tags: ['hash-blok', 'hash-blok-utama'],
    title: 'Kesihatan lelaki, dibincang dengan tenang dan profesional.',
    excerpt: 'Penilaian dan rawatan disfungsi ereksi (erectile dysfunction) dalam suasana yang sulit dan selesa. Kami bermula dengan memahami keadaan anda — bukan dengan menjual rawatan.',
  },
  {
    slug: 'blok-utama-kenyataan', tags: ['hash-blok', 'hash-blok-utama'],
    title: 'Disfungsi ereksi ialah keadaan perubatan yang biasa —',
    excerpt: 'bukan kelemahan diri.',
    html: '<p>Ia sering berkait dengan kesihatan jantung, hormon, tekanan dan gaya hidup.</p>',
  },
  {
    slug: 'blok-utama-perkhidmatan', tags: ['hash-blok', 'hash-blok-utama'],
    title: 'Apa yang kami tawarkan',
    excerpt: 'Setiap pelan rawatan bermula dengan penilaian. Doktor akan menerangkan sama ada sesuatu rawatan sesuai untuk anda.',
  },
  {
    slug: 'blok-utama-servis-konsultasi', tags: ['hash-blok', 'hash-blok-utama'],
    title: 'Konsultasi & penilaian',
    excerpt: 'Perbincangan sulit tentang simptom, sejarah kesihatan dan faktor penyumbang — langkah pertama untuk setiap pesakit.',
  },
  {
    slug: 'blok-utama-servis-shockwave', tags: ['hash-blok', 'hash-blok-utama'],
    title: 'Shockwave therapy',
    excerpt: 'Terapi gelombang kejutan intensiti rendah (Li-ESWT) — rawatan tanpa pembedahan dan tanpa ubat untuk pesakit yang sesuai.',
  },
  {
    slug: 'blok-utama-servis-kegel-ems', tags: ['hash-blok', 'hash-blok-utama'],
    title: 'Kegel EMS',
    excerpt: 'Stimulasi otot lantai pelvis (pelvic floor) menggunakan teknologi EMS untuk membantu menguatkan otot yang menyokong fungsi seksual.',
  },
  {
    slug: 'blok-utama-proses', tags: ['hash-blok', 'hash-blok-utama'],
    title: 'Empat langkah, tanpa tekanan',
  },
  {
    slug: 'blok-utama-privasi', tags: ['hash-blok', 'hash-blok-utama'],
    title: 'Privasi anda bukan tambahan. Ia asas cara kami bekerja.',
    html: '<ul><li>Rekod perubatan dirahsiakan dan dilindungi di bawah Akta Perlindungan Data Peribadi 2010.</li><li>Konsultasi dalam bilik tertutup, berdua bersama doktor.</li><li>[Butiran tambahan — cth. bil/resit tanpa nama perkhidmatan, jika benar]</li></ul>',
  },
  {
    slug: 'blok-utama-pasukan', tags: ['hash-blok', 'hash-blok-utama'],
    title: 'Kenali doktor anda sebelum datang',
    excerpt: 'Mengetahui siapa yang akan anda temui menjadikan langkah pertama lebih mudah.',
  },
  {
    slug: 'blok-utama-blog', tags: ['hash-blok', 'hash-blok-utama'],
    title: 'Baca dahulu, bertanya kemudian',
  },
  {
    slug: 'blok-utama-faq', tags: ['hash-blok', 'hash-blok-utama'],
    title: 'Soalan yang ramai segan tanya',
    html: [
      toggle('Adakah konsultasi saya benar-benar sulit?', 'Ya. Perbincangan dan rekod perubatan anda hanya diakses oleh pasukan yang terlibat dalam penjagaan anda, selaras dengan PDPA 2010.'),
      toggle('Perlukah saya dirujuk oleh doktor lain dahulu?', '[Jawapan — akan disahkan]'),
      toggle('Berapakah kos konsultasi?', '[Jawapan — akan disahkan]'),
      toggle('Bolehkah saya bertanya melalui WhatsApp dahulu?', '[Jawapan — akan disahkan]'),
    ].join(''),
  },
  {
    slug: 'blok-utama-cta', tags: ['hash-blok', 'hash-blok-utama'],
    title: 'Sedia untuk berbincang?',
    excerpt: 'Tempah konsultasi, atau mesej kami dahulu jika anda ada soalan. Tiada komitmen untuk memulakan rawatan.',
  },
];

export const BLOCK_TAGS = {
  'hash-blok': '#blok',
  'hash-blok-utama': '#blok-utama',
  'hash-blok-ed': '#blok-ed',
};
