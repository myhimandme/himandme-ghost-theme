# Clinical and service content: doctor review checklist (before launch)

> **Review status, 5 Nov 2026:** reviewed by the doctor. Items marked ✅ are verified. Items marked ✏️ were changed to the doctor's wording (applied in `seed/blocks.mjs`, the theme fallbacks and theme text on branch `stage-4`). Items marked ❓ are still open; see "Open items" at the end.

Everything below is **copy from the approved prototype**. No claims, success rates, guarantees, contraindications, clinical evidence or credentials were added during development. Each statement still needs the doctor's review and verification before launch.

**How to use this list:** confirm, edit or delete each item where it lives. Ghost Admin items can be edited without a developer. "Theme text" items are in `locales/ms.json` and need a theme update.
Status legend: ☐ to review · **[Sahkan]** / **[Jawapan…]** = a placeholder that must be completed or removed.

## A. Disfungsi Ereksi page

### Hero (Ghost Admin → Pages → Disfungsi Ereksi)
| # | Statement | Field | Status |
|---|---|---|---|
| A1 | "Disfungsi ereksi boleh dinilai. Dan boleh dirawat." | Page title (H1) | ✅ Accepted |
| A2 | "Panduan jelas tentang disfungsi ereksi … pilihan rawatan yang tersedia di Him & Me." | Page excerpt | ✅ Accepted |

### 01 Apa itu ED (block `blok-ed-apa`)
| # | Statement | Field | Status |
|---|---|---|---|
| A3 | Definition: "kerap mengalami kesukaran untuk mendapatkan atau mengekalkan ereksi yang mencukupi…; Mengalaminya sekali-sekala adalah perkara biasa…" | Body, paragraph 1 | ✅ Accepted |
| A4 | "Ereksi bergantung kepada salur darah, saraf, hormon dan keadaan emosi… petunjuk tentang kesihatan keseluruhan" | Body, paragraph 2 | ✅ Accepted |
| A5 | Signs list (4 items) | Body, list | ✅ Accepted |
| A6 | "Bila perlu berjumpa doktor?" — "berulang kali selama beberapa minggu … kencing manis, darah tinggi atau sakit jantung" | Excerpt | ✅ Accepted |

### 02 Punca (block `blok-ed-punca` + theme text)
| # | Statement | Where | Status |
|---|---|---|---|
| A7 | "Faktor fizikal dan psikologi sering saling mempengaruhi…" | Block excerpt | ✅ Accepted |
| A8 | **"ED kadangkala muncul lebih awal daripada simptom masalah jantung atau salur darah…"** | Block body (charcoal callout) | ✅ Accepted |
| A9 | Six cause cards: vaskular, kencing manis, hormon, psikologi, gaya hidup, ubat-ubatan & pembedahan (desktop and shorter phone versions) | Theme text (`partials/ed/punca.hbs`) | ✅ Accepted |

### 03 Penilaian & konsultasi (block `blok-ed-penilaian` + settings + theme text)
| # | Statement | Where | Status |
|---|---|---|---|
| A10 | "Konsultasi pertama ialah perbualan sulit bersama doktor. Tiada pemeriksaan dilakukan tanpa penjelasan dan persetujuan anda." | Block excerpt | ✅ Accepted |
| A11 | Steps: sejarah perubatan · pemeriksaan fizikal (e.g. tekanan darah) · **ujian tambahan [Sahkan: cth. ujian darah…]** · perbincangan pilihan rawatan | Theme text (`partials/ed/penilaian.hbs`) | ✏️ Steps now: sejarah perubatan · pemeriksaan fizikal · perbincangan pilihan rawatan. "Ujian tambahan / ujian darah" removed |
| A12 | Consultation duration and fee | Theme settings `consultation_duration`, `consultation_fee` | ❓ Consultation is included in the first trial session. Fee/duration tiles: see Open items |

### 04 Shockwave therapy (block `blok-ed-shockwave` + settings)
| # | Statement | Where | Status |
|---|---|---|---|
| A13 | "Terapi gelombang kejutan intensiti rendah (Low-Intensity Extracorporeal Shockwave Therapy, Li-ESWT)" | Block excerpt | ✅ Accepted |
| A14 | **"Rawatan tanpa pembedahan dan tanpa ubat… gelombang akustik bertenaga rendah pada tisu zakar. Ia bertujuan menyokong aliran darah…"** | Block body, paragraph 1 | ✅ Accepted |
| A15 | During the session: lies comfortably, gel · **"[Sahkan: sensasi yang dialami]"** · **"meneruskan aktiviti harian selepas sesi. [Sahkan]"** | Block body, list | ✏️ "Peranti digerakkan perlahan pada beberapa titik; anda akan merasai getaran akustik." · "Anda boleh meneruskan aktiviti harian selepas sesi." |
| A16 | "Keputusan berbeza mengikut individu. Rawatan ini tidak sesuai untuk semua pesakit…" | Block body, last paragraph | ✅ Accepted |
| A17 | Tiles: session length, number of sessions, **PEMBEDAHAN: Tidak**, price | Settings + theme text | ✅ Accepted. Price set to RM450 / sesi |

### 05 Kegel EMS (block `blok-ed-kegel-ems` + settings)
| # | Statement | Where | Status |
|---|---|---|---|
| A18 | **"Otot lantai pelvis membantu mengawal aliran darah keluar dari zakar semasa ereksi."** | Block body, paragraph 1 | ✅ Accepted |
| A19 | "merangsang otot-otot ini untuk mengecut secara berulang — seperti senaman Kegel… untuk membantu menguatkannya" | Block body, paragraph 1 | ✏️ "Kegel EMS memberikan rangsangan otot dan kecutan yang lebih kuat dan konsisten berbanding senaman Kegel. Satu sesi bersamaan dengan 12,000 kontraksi senaman Kegel." |
| A20 | "Mungkin dipertimbangkan untuk": weak pelvic-floor muscles; as part of a combined plan | Block body, list | ✏️ Heading "Disyorkan" + "Dibuat sebagai sebahagian daripada sesi rawatan, untuk kesan yang lebih konsisten" (heading "Disyorkan" confirmed) |
| A21 | Tiles: session length, number of sessions, **BERPAKAIAN: [Sahkan]**, price | Settings + theme text | ✅ Accepted. Price set to RM350 / sesi. "BERPAKAIAN: Ya" confirmed |

### Comparison table (theme text, `partials/ed/comparison.hbs`)
| # | Statement | Status |
|---|---|---|
| A22 | Fokus (tisu & aliran darah zakar / otot lantai pelvis) · Kaedah · Pembedahan / ubat: Tidak / Tidak · **Kesesuaian: "…sesetengah pesakit mungkin dicadangkan gabungan, atau rujukan untuk pilihan lain."** | ✅ Accepted |

### FAQ (Ghost Admin → Pages → Disfungsi Ereksi → body toggle cards)
| # | Question | Status |
|---|---|---|
| A23 | "Adakah disfungsi ereksi perkara biasa?" — answer: "antara masalah kesihatan seksual yang paling kerap dialami lelaki…" | ✏️ "Ya. Ia biasa berlaku dalam kalangan lelaki, …" |
| A24 | "Adakah shockwave therapy menyakitkan?" | ✏️ "Anda mungkin merasai sedikit ketidakselesaan, tetapi tiada kesakitan." |
| A25 | "Berapa banyak sesi yang saya perlukan?" | ✏️ "Anggaran 7–10 sesi rawatan. Setiap sesi merangkumi Shockwave Therapy dan Kegel EMS, dengan cadangan rawatan disesuaikan mengikut penilaian individu." (combined programme; an estimate, not a guarantee. This is the only place a session count appears; the per-treatment "BILANGAN SESI" tiles are hidden) |
| A26 | "Bolehkah saya teruskan ubat yang sedang saya ambil?" | ✏️ "Boleh. Doktor akan menyemak semula ubat anda dan menasihati jika ada yang tidak sesuai." |
| A27 | "Bolehkah pasangan saya hadir bersama?" | ✏️ "Amat dialukan, untuk perbincangan yang lebih menyeluruh bersama pasangan — bergantung kepada keselesaan anda." |
| A28 | "Berapakah kos rawatan?" | ✏️ "Satu sesi Shockwave therapy berharga RM450 dan satu sesi Kegel EMS berharga RM350 (harga ala carte). Pakej yang lebih jimat akan dimaklumkan semasa konsultasi." |

### Booking section
| # | Statement | Where | Status |
|---|---|---|---|
| A29 | "Malam [jika dibuka]" time option | Theme text | ✏️ No evening slot. "Malam" option removed |
| A30 | Consent: "…selaras dengan Notis Privasi (PDPA 2010)" — the Notis Privasi page content is still a placeholder | Theme text + Pages → Notis Privasi | ✅ Accepted. ❓ Notis Privasi page content still to be supplied |

## B. Homepage

| # | Statement | Where | Status |
|---|---|---|---|
| B1 | "Disfungsi ereksi ialah keadaan perubatan yang biasa — bukan kelemahan diri. Ia sering berkait dengan kesihatan jantung, hormon, tekanan dan gaya hidup." | Block `blok-utama-kenyataan` | ✏️ "…keadaan perubatan yang biasa berlaku — bukan kelemahan diri." |
| B2 | Service cards: Konsultasi & penilaian; **Shockwave "rawatan tanpa pembedahan dan tanpa ubat untuk pesakit yang sesuai"**; **Kegel EMS "membantu menguatkan otot yang menyokong fungsi seksual"** | Blocks `blok-utama-servis-*` | ✅ Accepted |
| B3 | Hero checklist: "Bilik konsultasi tertutup & peribadi", "Penilaian sebelum sebarang cadangan rawatan", "Penjelasan jelas tentang kos & pilihan" | Theme text | ✏️ First item now "Slot rawatan khas untuk setiap pesakit — tiada pesakit lain pada waktu yang sama" (other two unchanged) |
| B4 | Trust strip: "Pilihan rawatan bukan invasif" | Theme text | ✅ Accepted |
| B5 | Process steps 1–4 (incl. "Doktor menilai simptom, sejarah kesihatan dan faktor risiko anda") | Theme text | ✅ Accepted |
| B6 | Privacy: "Rekod perubatan dirahsiakan… Akta Perlindungan Data Peribadi 2010", "Konsultasi dalam bilik tertutup, berdua bersama doktor", **"[Butiran tambahan…]"** | Block `blok-utama-privasi` | ✏️ Third bullet: "Tiada pesakit lain pada slot temu janji anda." |
| B7 | FAQ: "Ya. Perbincangan dan rekod perubatan anda hanya diakses oleh pasukan…" + 3 **[Jawapan — akan disahkan]** | Block `blok-utama-faq` | ✏️ Q1: "…hanya diakses oleh doktor dan pembantu perubatan berlesen yang terlibat dalam rawatan anda…". Q2–Q4 ✏️ answered (no referral needed; RM150, free with First Trial; WhatsApp for brief questions only, no online consultation) |
| B8 | Doctor card credentials | Theme setting `doctor_credentials` | ✏️ Credentials line set to "Doktor yang sah" |

## D. RM288 First Trial offer (homepage, ED page, booking form)
| # | Statement | Where | Status |
|---|---|---|---|
| D1 | Package: "First Trial" / "Sesi percubaan pertama" = **1 × Konsultasi doktor, 1 × Shockwave Therapy, 1 × Kegel EMS** | Block `blok-tawaran` (title, body list) | ✅ As instructed |
| D2 | Price **RM288** | Theme setting `offer_price` only | ✅ As instructed. No "nilai biasa" or "Biasa RM…" comparison is shown |
| D3 | Item descriptions: consultation "Sejarah perubatan, pemeriksaan fizikal dan perbincangan pilihan rawatan"; Shockwave "terapi gelombang kejutan intensiti rendah, tanpa pembedahan dan tanpa ubat"; Kegel EMS "rangsangan otot lantai pelvis, dalam keadaan berpakaian" | Block `blok-tawaran` body | ☐ Reworded from statements already accepted (A11, A13–A14, A21). Please confirm |
| D4 | "Sesi percubaan pertama — untuk memahami keadaan anda dan merasai kedua-dua rawatan." | Block `blok-tawaran`, first paragraph | ☐ Please confirm |
| D5 | "Slot pesakit baharu 11:00 pagi – 5:00 petang · Dengan temu janji sahaja, tiada walk-in." | Block `blok-tawaran`, last paragraph | ✅ Verified hours |
| D6 | WhatsApp message: "Salam Him & Me, saya berminat untuk menempah First Trial RM288." | Theme text + block title + `offer_price` | ✅ As instructed |

## C. Site-wide
| # | Statement | Where | Status |
|---|---|---|---|
| C1 | Footer disclaimer (main site and blog versions) | Block `blok-penafian` | ✅ Accepted |
| C2 | Utility bar: "Konsultasi sulit & peribadi bersama doktor" | Theme text | ✅ Accepted |

*Text added during development is limited to navigation and form mechanics, with no clinical content:* the WhatsApp prefilled messages ("Salam, saya ingin bertanya tentang …"), the subtle CTA questions ("Ingin tahu sama ada … sesuai untuk anda?"), the form's redirect notice, and the error/validation messages. These are listed here so the review is complete.

## Verified business details (applied as theme-setting defaults and on the local test site)
| Setting | Value |
|---|---|
| `city` | Setiawangsa |
| `phone_display` | 011-5791 2606 |
| `whatsapp_number` | 601157912606 (❓ confirm this number is also your WhatsApp number) |
| `shockwave_price` | RM450 / sesi (normal price) |
| `kegel_ems_price` | RM350 / sesi (normal price) |
| `doctor_credentials` | Doktor yang sah |
| `offer_price` | RM288 |
| `address_short` | Eight Setiawangsa, Kuala Lumpur |
| `opening_hours_short` | Isnin – Sabtu, 10 pagi – 7 malam · dengan temu janji sahaja |
| Full address (block `blok-maklumat-hubungan` excerpt) | Him & Me Mens Health Setiawangsa · 1-3, Eight Setiawangsa · Jalan Setiawangsa 13, Taman Setiawangsa · 54200 Kuala Lumpur |
| Operating days (same block, body) | Isnin – Sabtu: 10:00 pagi – 7:00 malam |
| `consultation_fee` | RM150 (percuma dengan First Trial) |

First Trial **RM288** (1 consultation + 1 Shockwave Therapy + 1 Kegel EMS): implemented, see section D. Set in theme setting `offer_price`.

## Open items
1. **A12: consultation tiles.** ✏️ Fee set to "RM150 (percuma dengan First Trial)". **TEMPOH** (consultation length) is still unknown: give it, or leave the setting empty to hide the tile.
2. **RM288 First Trial offer:** ✅ implemented (section D). D3–D4 wording still to confirm.
3. **Session length** for Shockwave and Kegel EMS is still unknown: give it, or leave the settings empty to hide those tiles. **Number of sessions:** now the combined programme "Anggaran 7–10 sesi rawatan" (A25). The separate per-treatment estimates were removed.
4. **Operating days:** ✅ Isnin – Sabtu.
5. **Notis Privasi** and **Dasar Editorial** page content. (Address ✅ applied. `contact_email` is still "[E-mel]": give the address, or leave it empty to hide it.)
6. **Advertising check:** keep the source for "12,000 kontraksi" and the published prices on file. (No "nilai biasa" comparison is shown with the offer.)
