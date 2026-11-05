# Clinical and service content: doctor review checklist (before launch)

Everything below is **copy from the approved prototype**. No claims, success rates, guarantees, contraindications, clinical evidence or credentials were added during development. Each statement still needs the doctor's review and verification before launch.

**How to use this list:** confirm, edit or delete each item where it lives. Ghost Admin items can be edited without a developer. "Theme text" items are in `locales/ms.json` and need a theme update.
Status legend: ☐ to review · **[Sahkan]** / **[Jawapan…]** = a placeholder that must be completed or removed.

## A. Disfungsi Ereksi page

### Hero (Ghost Admin → Pages → Disfungsi Ereksi)
| # | Statement | Field | Status |
|---|---|---|---|
| A1 | "Disfungsi ereksi boleh dinilai. Dan boleh dirawat." | Page title (H1) | ☐ Treatment-outcome wording; confirm it is acceptable |
| A2 | "Panduan jelas tentang disfungsi ereksi … pilihan rawatan yang tersedia di Him & Me." | Page excerpt | ☐ |

### 01 Apa itu ED (block `blok-ed-apa`)
| # | Statement | Field | Status |
|---|---|---|---|
| A3 | Definition: "kerap mengalami kesukaran untuk mendapatkan atau mengekalkan ereksi yang mencukupi…; Mengalaminya sekali-sekala adalah perkara biasa…" | Body, paragraph 1 | ☐ |
| A4 | "Ereksi bergantung kepada salur darah, saraf, hormon dan keadaan emosi… petunjuk tentang kesihatan keseluruhan" | Body, paragraph 2 | ☐ |
| A5 | Signs list (4 items) | Body, list | ☐ |
| A6 | "Bila perlu berjumpa doktor?" — "berulang kali selama beberapa minggu … kencing manis, darah tinggi atau sakit jantung" | Excerpt | ☐ |

### 02 Punca (block `blok-ed-punca` + theme text)
| # | Statement | Where | Status |
|---|---|---|---|
| A7 | "Faktor fizikal dan psikologi sering saling mempengaruhi…" | Block excerpt | ☐ |
| A8 | **"ED kadangkala muncul lebih awal daripada simptom masalah jantung atau salur darah…"** | Block body (charcoal callout) | ☐ Cardiovascular association statement |
| A9 | Six cause cards: vaskular, kencing manis, hormon, psikologi, gaya hidup, ubat-ubatan & pembedahan (desktop and shorter phone versions) | Theme text (`partials/ed/punca.hbs`) | ☐ |

### 03 Penilaian & konsultasi (block `blok-ed-penilaian` + settings + theme text)
| # | Statement | Where | Status |
|---|---|---|---|
| A10 | "Konsultasi pertama ialah perbualan sulit bersama doktor. Tiada pemeriksaan dilakukan tanpa penjelasan dan persetujuan anda." | Block excerpt | ☐ Confirm the actual process |
| A11 | Steps: sejarah perubatan · pemeriksaan fizikal (e.g. tekanan darah) · **ujian tambahan [Sahkan: cth. ujian darah…]** · perbincangan pilihan rawatan | Theme text (`partials/ed/penilaian.hbs`) | ☐ **[Sahkan]** which tests, if any |
| A12 | Consultation duration and fee | Theme settings `consultation_duration`, `consultation_fee` | ☐ Placeholders |

### 04 Shockwave therapy (block `blok-ed-shockwave` + settings)
| # | Statement | Where | Status |
|---|---|---|---|
| A13 | "Terapi gelombang kejutan intensiti rendah (Low-Intensity Extracorporeal Shockwave Therapy, Li-ESWT)" | Block excerpt | ☐ Confirm terminology matches the device |
| A14 | **"Rawatan tanpa pembedahan dan tanpa ubat… gelombang akustik bertenaga rendah pada tisu zakar. Ia bertujuan menyokong aliran darah…"** | Block body, paragraph 1 | ☐ Mechanism statement |
| A15 | During the session: lies comfortably, gel · **"[Sahkan: sensasi yang dialami]"** · **"meneruskan aktiviti harian selepas sesi. [Sahkan]"** | Block body, list | ☐ **[Sahkan] ×2** |
| A16 | "Keputusan berbeza mengikut individu. Rawatan ini tidak sesuai untuk semua pesakit…" | Block body, last paragraph | ☐ |
| A17 | Tiles: session length, number of sessions, **PEMBEDAHAN: Tidak**, price | Settings + theme text | ☐ Placeholders; confirm "Tidak" |

### 05 Kegel EMS (block `blok-ed-kegel-ems` + settings)
| # | Statement | Where | Status |
|---|---|---|---|
| A18 | **"Otot lantai pelvis membantu mengawal aliran darah keluar dari zakar semasa ereksi."** | Block body, paragraph 1 | ☐ Physiology statement |
| A19 | "merangsang otot-otot ini untuk mengecut secara berulang — seperti senaman Kegel… untuk membantu menguatkannya" | Block body, paragraph 1 | ☐ Confirm it matches the actual device (EMS vs. electromagnetic) |
| A20 | "Mungkin dipertimbangkan untuk": weak pelvic-floor muscles; as part of a combined plan | Block body, list | ☐ Suitability statements |
| A21 | Tiles: session length, number of sessions, **BERPAKAIAN: [Sahkan]**, price | Settings + theme text | ☐ **[Sahkan]** whether clients stay clothed |

### Comparison table (theme text, `partials/ed/comparison.hbs`)
| # | Statement | Status |
|---|---|---|
| A22 | Fokus (tisu & aliran darah zakar / otot lantai pelvis) · Kaedah · Pembedahan / ubat: Tidak / Tidak · **Kesesuaian: "…sesetengah pesakit mungkin dicadangkan gabungan, atau rujukan untuk pilihan lain."** | ☐ |

### FAQ (Ghost Admin → Pages → Disfungsi Ereksi → body toggle cards)
| # | Question | Status |
|---|---|---|
| A23 | "Adakah disfungsi ereksi perkara biasa?" — answer: "antara masalah kesihatan seksual yang paling kerap dialami lelaki…" | ☐ Prevalence statement |
| A24 | "Adakah shockwave therapy menyakitkan?" | **[Jawapan — akan disahkan oleh doktor]** |
| A25 | "Berapa banyak sesi yang saya perlukan?" | **[Jawapan — akan disahkan oleh doktor]** |
| A26 | "Bolehkah saya teruskan ubat yang sedang saya ambil?" | **[Jawapan — akan disahkan oleh doktor]** |
| A27 | "Bolehkah pasangan saya hadir bersama?" | **[Jawapan — akan disahkan]** (operational) |
| A28 | "Berapakah kos rawatan?" | **[Jawapan — akan disahkan]** (operational) |

### Booking section
| # | Statement | Where | Status |
|---|---|---|---|
| A29 | "Malam [jika dibuka]" time option | Theme text | ☐ **[Sahkan]** evening opening |
| A30 | Consent: "…selaras dengan Notis Privasi (PDPA 2010)" — the Notis Privasi page content is still a placeholder | Theme text + Pages → Notis Privasi | ☐ Legal review |

## B. Homepage

| # | Statement | Where | Status |
|---|---|---|---|
| B1 | "Disfungsi ereksi ialah keadaan perubatan yang biasa — bukan kelemahan diri. Ia sering berkait dengan kesihatan jantung, hormon, tekanan dan gaya hidup." | Block `blok-utama-kenyataan` | ☐ |
| B2 | Service cards: Konsultasi & penilaian; **Shockwave "rawatan tanpa pembedahan dan tanpa ubat untuk pesakit yang sesuai"**; **Kegel EMS "membantu menguatkan otot yang menyokong fungsi seksual"** | Blocks `blok-utama-servis-*` | ☐ |
| B3 | Hero checklist: "Bilik konsultasi tertutup & peribadi", "Penilaian sebelum sebarang cadangan rawatan", "Penjelasan jelas tentang kos & pilihan" | Theme text | ☐ Operational promises |
| B4 | Trust strip: "Pilihan rawatan bukan invasif" | Theme text | ☐ |
| B5 | Process steps 1–4 (incl. "Doktor menilai simptom, sejarah kesihatan dan faktor risiko anda") | Theme text | ☐ |
| B6 | Privacy: "Rekod perubatan dirahsiakan… Akta Perlindungan Data Peribadi 2010", "Konsultasi dalam bilik tertutup, berdua bersama doktor", **"[Butiran tambahan…]"** | Block `blok-utama-privasi` | ☐ Legal and operational; **placeholder** |
| B7 | FAQ: "Ya. Perbincangan dan rekod perubatan anda hanya diakses oleh pasukan…" + 3 **[Jawapan — akan disahkan]** | Block `blok-utama-faq` | ☐ |
| B8 | Doctor card credentials | Theme setting `doctor_credentials` | ☐ Verified credentials only |

## C. Site-wide
| # | Statement | Where | Status |
|---|---|---|---|
| C1 | Footer disclaimer (main site and blog versions) | Block `blok-penafian` | ☐ |
| C2 | Utility bar: "Konsultasi sulit & peribadi bersama doktor" | Theme text | ☐ |

*Text added during development is limited to navigation and form mechanics, with no clinical content:* the WhatsApp prefilled messages ("Salam, saya ingin bertanya tentang …"), the subtle CTA questions ("Ingin tahu sama ada … sesuai untuk anda?"), the form's redirect notice, and the error/validation messages. These are listed here so the review is complete.
