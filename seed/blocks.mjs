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
    html: '<p>[Hari operasi]: 10:00 pagi – 7:00 malam</p><p>Slot pesakit baharu: 11:00 pagi – 5:00 petang</p><p>Dengan temu janji sahaja — tiada walk-in, untuk menjaga privasi pesakit</p>',
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
    title: 'Disfungsi ereksi ialah keadaan perubatan yang biasa berlaku —',
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
    html: '<ul><li>Rekod perubatan dirahsiakan dan dilindungi di bawah Akta Perlindungan Data Peribadi 2010.</li><li>Konsultasi dalam bilik tertutup, berdua bersama doktor.</li><li>Tiada pesakit lain pada slot temu janji anda.</li></ul>',
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
      toggle('Adakah konsultasi saya benar-benar sulit?', 'Ya. Perbincangan dan rekod perubatan anda hanya diakses oleh doktor dan pembantu perubatan berlesen yang terlibat dalam rawatan anda, selaras dengan PDPA 2010.'),
      toggle('Perlukah saya dirujuk oleh doktor lain dahulu?', 'Tidak perlu. Anda boleh datang terus jika anda rasa ada tanda-tanda awal.'),
      toggle('Berapakah kos konsultasi?', 'RM150 untuk sesi konsultasi — percuma jika anda mengambil sesi First Trial.'),
      toggle('Bolehkah saya bertanya melalui WhatsApp dahulu?', 'Boleh, untuk pertanyaan ringkas. Namun doktor tidak dibenarkan membuat konsultasi dalam talian, jadi kami syorkan anda datang ke sesi First Trial untuk konsultasi penuh.'),
    ].join(''),
  },
  {
    slug: 'blok-utama-cta', tags: ['hash-blok', 'hash-blok-utama'],
    title: 'Sedia untuk berbincang?',
    excerpt: 'Tempah konsultasi, atau mesej kami dahulu jika anda ada soalan. Tiada komitmen untuk memulakan rawatan.',
  },
  // ---- Disfungsi Ereksi page (Stage 4) — 8 blocks, tag #blok + #blok-ed ----
  // CLINICAL REVIEW: every ED block below contains clinical or service statements copied from the
  // approved prototype. They must be reviewed and verified by the doctor before launch
  // (checklist: docs/CLINICAL-REVIEW.md).
  {
    slug: 'blok-ed-apa', tags: ['hash-blok', 'hash-blok-ed'], review: true,
    title: 'Kesukaran berterusan untuk mencapai atau mengekalkan ereksi.',
    excerpt: 'Jika masalah berlaku berulang kali selama beberapa minggu, atau jika anda juga mempunyai kencing manis, darah tinggi atau sakit jantung.',
    html: '<p>Disfungsi ereksi (ED) ialah keadaan apabila seorang lelaki kerap mengalami kesukaran untuk mendapatkan atau mengekalkan ereksi yang mencukupi untuk hubungan seksual. Mengalaminya sekali-sekala adalah perkara biasa. Apabila ia berlaku secara berulang, ia wajar dinilai oleh doktor.</p><p>ED bukan sahaja isu bilik tidur. Ereksi bergantung kepada salur darah, saraf, hormon dan keadaan emosi yang sihat — jadi perubahan pada fungsi ereksi kadangkala memberi petunjuk tentang kesihatan keseluruhan anda.</p><ul><li>Sukar mendapatkan ereksi</li><li>Ereksi tidak bertahan cukup lama</li><li>Ereksi kurang keras berbanding sebelum ini</li><li>Kebimbangan tentang prestasi yang menjejaskan keyakinan</li></ul>',
  },
  {
    slug: 'blok-ed-punca', tags: ['hash-blok', 'hash-blok-ed'], review: true,
    title: 'Selalunya lebih daripada satu faktor',
    excerpt: 'Faktor fizikal dan psikologi sering saling mempengaruhi. Penilaian membantu mengenal pasti yang mana berkaitan dengan anda.',
    html: '<p>ED kadangkala muncul lebih awal daripada simptom masalah jantung atau salur darah. Itulah sebabnya kami menilai kesihatan anda secara menyeluruh — bukan simptom sahaja.</p>',
  },
  {
    slug: 'blok-ed-penilaian', tags: ['hash-blok', 'hash-blok-ed'], review: true,
    title: 'Rawatan yang betul bermula dengan soalan yang betul.',
    excerpt: 'Konsultasi pertama ialah perbualan sulit bersama doktor. Tiada pemeriksaan dilakukan tanpa penjelasan dan persetujuan anda.',
  },
  {
    slug: 'blok-ed-shockwave', tags: ['hash-blok', 'hash-blok-ed'], review: true,
    title: 'Shockwave therapy',
    excerpt: 'Terapi gelombang kejutan intensiti rendah (Low-Intensity Extracorporeal Shockwave Therapy, Li-ESWT)',
    html: '<p>Rawatan tanpa pembedahan dan tanpa ubat yang menggunakan gelombang akustik bertenaga rendah pada tisu zakar. Ia bertujuan menyokong aliran darah dan disyorkan hanya selepas penilaian menunjukkan ia sesuai untuk anda.</p><h3>Semasa sesi</h3><ul><li>Anda berbaring dengan selesa; gel digunakan pada kawasan rawatan.</li><li>Peranti digerakkan perlahan pada beberapa titik; anda akan merasai getaran akustik.</li><li>Anda boleh meneruskan aktiviti harian selepas sesi.</li></ul><p>Keputusan berbeza mengikut individu. Rawatan ini tidak sesuai untuk semua pesakit; doktor akan menilai kesesuaian anda terlebih dahulu.</p>',
  },
  {
    slug: 'blok-ed-kegel-ems', tags: ['hash-blok', 'hash-blok-ed'], review: true,
    title: 'Kegel EMS',
    excerpt: 'Stimulasi otot lantai pelvis (pelvic floor muscle stimulation)',
    html: '<p>Otot lantai pelvis membantu mengawal aliran darah keluar dari zakar semasa ereksi. Kegel EMS memberikan rangsangan otot dan kecutan yang lebih kuat dan konsisten berbanding senaman Kegel. Satu sesi bersamaan dengan 12,000 kontraksi senaman Kegel.</p><h3>Disyorkan</h3><ul><li>Dibuat sebagai sebahagian daripada sesi rawatan, untuk kesan yang lebih konsisten</li></ul><p>Keputusan berbeza mengikut individu. Kesesuaian ditentukan selepas penilaian oleh doktor.</p>',
  },
  {
    slug: 'blok-ed-perbandingan', tags: ['hash-blok', 'hash-blok-ed'],
    title: 'Perbandingan ringkas',
  },
  {
    slug: 'blok-ed-faq', tags: ['hash-blok', 'hash-blok-ed'],
    title: 'Soalan lazim',
  },
  {
    slug: 'blok-ed-temujanji', tags: ['hash-blok', 'hash-blok-ed'],
    title: 'Tempah konsultasi sulit anda',
    excerpt: 'Isi borang dan pasukan kami akan menghubungi anda untuk mengesahkan masa. Lebih cepat? WhatsApp kami terus.',
  },
];

export const BLOCK_TAGS = {
  'hash-blok': '#blok',
  'hash-blok-utama': '#blok-utama',
  'hash-blok-ed': '#blok-ed',
};

// Ghost pages created by the seed. The ED page's BODY holds its FAQ (toggle cards).
export const PAGES = [
  {
    slug: 'disfungsi-ereksi', custom_template: 'custom-disfungsi-ereksi', review: true,
    title: 'Disfungsi ereksi boleh dinilai. Dan boleh dirawat.',
    excerpt: 'Panduan jelas tentang disfungsi ereksi (erectile dysfunction, ED) — puncanya, cara ia dinilai, dan pilihan rawatan yang tersedia di Him & Me.',
    meta_title: 'Disfungsi Ereksi — Him & Me',
    html: [
      toggle('Adakah disfungsi ereksi perkara biasa?', 'Ya. Ia biasa berlaku dalam kalangan lelaki, terutamanya apabila usia meningkat atau dengan keadaan seperti kencing manis dan darah tinggi. Ia boleh dibincangkan dan dinilai seperti masalah kesihatan lain.'),
      toggle('Adakah shockwave therapy menyakitkan?', 'Anda mungkin merasai sedikit ketidakselesaan, tetapi tiada kesakitan.'),
      toggle('Berapa banyak sesi yang saya perlukan?', 'Ia bergantung kepada tahap disfungsi ereksi (mati pucuk) anda. Doktor akan menilai keadaan anda dan mencadangkan bilangan sesi mengikut kesesuaian setiap pesakit.'),
      toggle('Bolehkah saya teruskan ubat yang sedang saya ambil?', 'Boleh. Doktor akan menyemak semula ubat anda dan menasihati jika ada yang tidak sesuai.'),
      toggle('Bolehkah pasangan saya hadir bersama?', 'Amat dialukan, untuk perbincangan yang lebih menyeluruh bersama pasangan — bergantung kepada keselesaan anda.'),
      toggle('Berapakah kos rawatan?', 'Satu sesi Shockwave therapy berharga RM450 dan satu sesi Kegel EMS berharga RM350 (harga ala carte). Pakej yang lebih jimat akan dimaklumkan semasa konsultasi.'),
    ].join(''),
  },
  { slug: 'jurnal', title: 'Jurnal Kesihatan Lelaki', meta_title: 'Jurnal Kesihatan Lelaki — Him & Me', meta_description: 'Artikel pendidikan tentang kesihatan lelaki.', excerpt: 'Route data for /blog/ (SEO title, description and social image).', html: '<p>Halaman data untuk /blog/. Jangan nyahterbit.</p>' },
  { slug: 'notis-privasi', title: 'Notis Privasi', html: '<p>[Kandungan Notis Privasi (PDPA 2010) — akan dibekalkan]</p>' },
  { slug: 'dasar-editorial', title: 'Dasar Editorial', html: '<p>[Kandungan Dasar Editorial — akan dibekalkan]</p>' },
];
