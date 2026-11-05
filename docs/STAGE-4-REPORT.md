# Stage 4 completion report: Disfungsi Ereksi page + RM288 First Trial offer

**Environment:** local Ghost **6.75.0** (development mode, SQLite) at `http://localhost:2368`. **The live himandme.my installation was not touched and nothing was published.**
**Branch:** `stage-4` (based on `stage-3`; PRs #1, #2 and #3 open and unmerged).

## Results (final run, with the First Trial offer in place)

| Check | Result |
|---|---|
| `npm test`: build + content-block guard (81 templates) + GScan 6.7.0 `--v6` | ✅ 0 errors, 0 warnings. **14 theme settings** (of Ghost's 20), all used. |
| `test/stage4/run.mjs`: ED page + offer + Notis Privasi + email | ✅ **37 passed, 0 failed** |
| `test/stage3/run.mjs`: homepage | ✅ **12 / 12** |
| `test/stage2/run.mjs`: site chrome | ✅ **23 / 23** |
| `test/stage1/run.mjs`: routing and `#blok` safeguards (now **23** blocks, incl. `blok-tawaran`) | ✅ **32 passed, 0 failed** (3 informational) |
| Visual comparison with the prototype and the approved First Trial proposal (1440px and 390px) | ✅ Matches. Images: `docs/stage-4/` (see Screenshots). |

### What the Stage 4 tests prove
- **E1:** the sections appear in the prototype order: 01 Apa → 02 Punca → 03 Penilaian → 04 Shockwave → 05 Kegel EMS → comparison → 06 FAQ → booking.
- **E2–E3:** the H1 and intro come from the Ghost page, and editing the page title in Admin changes the H1.
- **E4:** each of the 8 ED blocks drives its section. The test edits it (change visible), unpublishes it (approved copy shown) and restores it.
- **E5:** the FAQ questions are the toggle cards in the page body (6).
- **E6–E7:** the tiles show the theme settings, and `show_prices` off hides only the fee and price tiles.
- **E8:** the city setting appears in the hero label when set. When empty there is no city, blank or placeholder.
- **E9–E13:**
  - All 7 WhatsApp links use the configured number.
  - The treatment CTAs prefill a service-specific message.
  - Every in-page link points at an existing section.
  - The booking buttons reach `#temujanji`.
  - Without JavaScript, the form still opens WhatsApp.
- **E14:** one `<h1>`; all 9 form controls are labelled; table headers have `scope`.
- **E15:** no horizontal overflow at 390, 768, 1024 or 1440px.
- **E16:** one block body appears in two places. Paragraphs go left and the list goes into the card; the description sits above the tiles, and the list and note below.
- **E17:** the sticky tab bar marks the section in view.
- **E18–E19 (real browser):**
  - An empty submit shows an error and opens nothing.
  - "Buat Temu Janji" under Kegel EMS preselects that service.
  - A completed form opens `wa.me/<number>` with the name, phone, service, date (dd/mm/yyyy), time and message.
  - Past dates are blocked.
- **E20:** the first FAQ question is open on load.

### What the First Trial tests prove (F1–F11)
- **F1:** placement. Homepage card directly after the hero. ED: slim bar inside the hero, the "Apa yang termasuk dalam First Trial" section after the comparison table, a "First Trial" tab, and the First Trial option in the booking form.
- **F2:** every "Tempah First Trial" button opens `wa.me/<number>` with exactly "Salam Him & Me, saya berminat untuk menempah First Trial RM288."
- **F3:** the price is not typed in the block (`blok-tawaran`), only in `offer_price`.
- **F4:** no "Nilai biasa", "Biasa RM…" or "RM950" anywhere on either page.
- **F5:** the package is exactly 1 × Konsultasi doktor, 1 × Shockwave Therapy and 1 × Kegel EMS.
- **F6:** **changing `offer_price` to RM299 updates every location**: the homepage card, ED bar, ED section, form option and all WhatsApp messages. No "RM288" remains anywhere.
- **F7:** an empty `offer_price` hides the offer everywhere: cards, bar, tab and form option.
- **F8:** editing the block changes the offer (name in the heading, button and WhatsApp message). Unpublishing it shows the approved copy, still with the setting's price.
- **F9:** the combined programme "7–10" appears once (ED FAQ) and never on the homepage. The per-treatment session-count tiles are hidden.
- **F10:** 20 theme settings (within Ghost's limit).
- **F11 (real browser, 1440px and 390px):** the form opens with First Trial preselected, and the WhatsApp message names "First Trial RM288". There is no horizontal overflow at 390px, and the phone offer card is compact (485px).

## Implementation notes
- **Template.** `custom-disfungsi-ereksi.hbs` (selected in the page's Template setting) composes 9 partials in `partials/ed/`. The header, compact footer and mobile bar are reused from Stage 2.
- **Content model** (no change from the approved plan):
  - The page supplies the H1, intro, FAQ and SEO fields.
  - The 8 `#blok-ed` blocks supply each section's heading and text.
  - Theme settings supply the prices and session details.
  - Fixed theme text supplies the labels, cause cards, steps and comparison table.
- **"One body, two places" (CSS only, no JavaScript).** Where a block's body belongs in two places, it's rendered twice and CSS shows only the relevant element types in each: paragraphs vs. list, or the first paragraph vs. the rest. Editors just write in order; this is documented in the README.
- **Fallbacks.** Every block falls back to the approved prototype copy (`partials/ed/fallback/`).
- **Approved additions:**
  - The subtle CTA row after Shockwave and after Kegel EMS: a question, a small WhatsApp button with a prefilled service message, and a "Buat Temu Janji" link that preselects the service. It uses existing button and link styles only.
  - The WhatsApp form: the button reads "Hantar melalui WhatsApp", with the notice "Anda akan dibawa ke WhatsApp… Maklumat anda tidak disimpan di laman web ini." This replaces the prototype's "[tempoh]" line, as approved.
- **City setting** (approved): `city` was added as the 19th theme setting. The hero label reads "/ KESIHATAN LELAKI · {city}" on desktop. When the setting is empty, the separator and city are omitted entirely.
- **A bug found and fixed while testing:** a phone-only flex rule made the dark callout's text 1,333px wide. The new overflow check (E15) now guards against this.

## First Trial offer: implementation
- **One block + one setting (as approved).**
  - `blok-tawaran` supplies the name (title), button label (excerpt), description, items and slot note (body).
  - `offer_price` is the **single price source**. When it's empty, the offer is hidden everywhere.
  - Partials are in `partials/offer/`, styles in `assets/css/pages/offer.css`. The WhatsApp message is built in one place (`partials/offer/wa-href.hbs`).
- **Homepage:** a premium introductory card directly after the hero: a charcoal price panel and a white "Termasuk dalam sesi anda" list with icon tiles. It's a stacked compact card on phones. It's styled as a package, not a discount advert.
- **ED page:**
  - A slim offer bar at the foot of the hero (stacked on phones).
  - The detailed section "Apa yang termasuk dalam First Trial" after the comparison table, with numbered items and "Lihat butiran →" links to sections 03–05.
  - A "First Trial" tab.
  - The booking form's service list starts with "First Trial RM288", selected by default.
- **Mobile sticky bar unchanged:** WhatsApp + "Buat Temu Janji", as instructed.
- **Copy changes as instructed:**
  - "Nilai biasa RM950" and every "Biasa RM…" comparison removed.
  - The combined programme "Anggaran 7–10 sesi rawatan. Setiap sesi merangkumi Shockwave Therapy dan Kegel EMS, …" is used in the ED FAQ (A25), the only place session counts are discussed.
  - The separate per-treatment 7–10 estimates were removed, along with their settings and tiles.

## Screenshots (`docs/stage-4/`)
- **Approved proposal vs. Ghost theme:**
  - `offer-home-desktop.jpg`, `offer-home-mobile.jpg`
  - `offer-ed-bar-desktop.jpg`, `offer-ed-bar-mobile.jpg`
  - `offer-ed-section-desktop.jpg`, `offer-ed-section-mobile.jpg`

  The only differences are the instructed ones: no RM950 or "Biasa RM…" lines, "1 ×" quantities, and Buat Temu Janji in the sticky bar.
- **Full pages:**
  - `full-home-desktop.jpg`, `full-home-mobile.jpg`
  - `full-ed-desktop.jpg`, `full-ed-mobile.jpg`
- **Earlier prototype comparisons:**
  - `compare-desktop-0*.jpg`, `compare-mobile-0*.jpg`

## Clinical content requiring your review
**`docs/CLINICAL-REVIEW.md`** lists every clinical or service statement: ED page (A1–A30), homepage (B1–B8), First Trial offer (D1–D6) and site-wide (C1–C2), each with where to edit it. The doctor's review answers have been applied; ✅ / ✏️ mark verified or reworded items.
- **Still open:**
  - Notis Privasi page content.
- **All earlier placeholders are resolved:** additional tests removed; Shockwave sensation and aftercare; Kegel EMS "Berpakaian: Ya"; "Malam" removed; all FAQ answers; the third privacy bullet.
- **No claims, success rates, guarantees, contraindications, evidence or credentials were added.** "Anggaran 7–10 sesi rawatan" is the doctor's estimate, worded as an estimate and not a guarantee. New non-clinical text: the form, CTA and First Trial WhatsApp wording.

## Items for your decision (nothing below has been implemented)

| # | Item | Current behaviour | Options |
|---|---|---|---|
| — | ~~Unused settings~~ | ✅ Removed (your decision): the 3 duration and 2 session-count settings and their tiles, plus `contact_email` (email removed from the footer). **14 / 20 settings.** | |
| — | ~~Combined programme in the comparison table~~ | ✅ Your decision: FAQ only (unchanged). | |
| — | ~~Phone content parity~~ | ✅ Your decision: keep all content on phones for now. | |
| — | ~~Notis Privasi page design~~ | ✅ Done, see "Notis Privasi page" below. | |
| — | ~~D3–D4 offer wording~~ | ✅ Accepted. | |

**Applied after the report:**
- **Address:**
  - Footer: "Him & Me Mens Health Setiawangsa / 1-3, Eight Setiawangsa / Jalan Setiawangsa 13, Taman Setiawangsa / 54200 Kuala Lumpur".
  - Top bar: "Eight Setiawangsa, Kuala Lumpur".
- **Operating days and hours:** Isnin – Sabtu, 10:00 pagi – 6:00 petang (footer, top bar, menu, booking panel). New-patient slots stay 11:00 pagi – 5:00 petang.
- **WhatsApp number** 601157912606 confirmed.
- **Notis Privasi:** your BM and English text, verbatim, loaded as the page body. The BM version comes first, then a divider and the English "Privacy Notice", with an "English version ↓" link at the top. Source: `seed/pages/notis-privasi.txt`, converted by the seed. After launch, edit it in Ghost Admin → Pages → Notis Privasi.
- **Durations:** not shown. The three TEMPOH tiles (consultation, Shockwave, Kegel EMS) and their settings were removed.
- **Name spelling:** "Him & Me Mens Health" everywhere, including the copyright line.
- **Footer fix:** each address line is now rendered as its own element. A long line that wraps stays tight, and real line breaks keep the designed 10px gap.

**Still needed from you (content):**
- Dasar Editorial page content.

## Notis Privasi page (styled, as approved)
- **Template:** `page.hbs` now styles every plain page (Notis Privasi, and later Dasar Editorial) like the prototype's blog article: warm-white background, breadcrumb "Utama / …", centred serif title, a 680px reading column with the article's paragraph, heading and red-slash list styles.
- **Contents:** "Dalam halaman ini" is built automatically from the section headings (14 links: 13 BM sections + "Privacy Notice"). It's a sticky rail on wide screens and a collapsible box on tablets and phones (as on the Artikel mobile board). The section in view is marked.
- **Navigation:** main-site header (Utama · Disfungsi Ereksi · Blog), and the compact main-site footer, which keeps the **Notis Privasi** link. Notis Privasi is not added to the header menu.
- **Not used here:** the article's feature image, author/reviewer line, share buttons, CTA sidebar, references, tags and "Baca seterusnya". They don't apply to a legal page.
- **Derived, as the prototype has none:** the H3 size (A–D subsections) uses the article's 25px serif card-title size, and numbered lists use the article list layout with a red number in place of the slash.
- **Tests:** G1 (template, header, footer link, BM + English content, no placeholders) and G2 (browser: 14 working contents links, open rail at 1440px, collapsed at 390px, no overflow).
- **Screenshots:** `docs/stage-4/notis-privasi-desktop.jpg`, `-mobile.jpg`, `full-notis-privasi-desktop.jpg`, `full-notis-privasi-mobile.jpg`.

## Email display (anti-harvesting)
- **Footer (desktop + mobile):** email removed completely. No text, no link and no image. The phone, WhatsApp, address, hours and layout are unchanged. The `contact_email` setting was removed with it, because GScan rejects unused settings.
- **Notis Privasi:** both contact sections (BM + English) show `myhimandme@gmail.com` as **one local image asset** (`assets/images/email-himandme.png`):
  - The image is a 3 KB transparent PNG, typeset in Manrope in the article text colour.
  - It is rendered at 3× and displayed at 231×28 px (219×27 on phones). It scales with the text (em-based width, `height: auto`), so it never distorts.
  - Alt text: "E-mel Him & Me untuk pertanyaan privasi" / "Email Him & Me for privacy enquiries".
  - The address and phone stay normal text.
- **No JavaScript obfuscation**, contact form, CAPTCHA or backend.
- **Accessibility note:** the alt text names the purpose, not the address, as you specified. So screen-reader users hear "Email Him & Me for privacy enquiries" but not the address itself; they can use the WhatsApp/telephone line. This is the trade-off of hiding the address from machines.
- **Tests:**
  - H1: no email text or `mailto:` on `/`, `/disfungsi-ereksi/`, `/notis-privasi/` or `/blog/`, and no email line in any footer.
  - H2: one image asset for both languages, alt texts, address and phone as text.
  - H3 (browser): the image loads (693×84), stays in proportion and is at least 200px wide at 1440px and 390px.
- **Screenshots:**
  - `docs/stage-4/email-footer-desktop.jpg`, `email-footer-mobile.jpg`
  - `email-privasi-bm-desktop.jpg`, `email-privasi-bm-mobile.jpg`
  - `email-privasi-en-desktop.jpg`, `email-privasi-en-mobile.jpg`
- **Limitation:** an image deters simple harvesters but not OCR-based scraping.

## Safeguards preserved
- `#blok` content is excluded from listings, archives, RSS, the sitemap and search. Stage 1 passes 32/0 with all 23 blocks present (incl. `blok-tawaran`).
- The content-block guard is part of `npm test`.
- Blocks hold public website copy only (`seed/blocks.mjs`).
- Nothing touched production. No PRs merged.

**Stage 5 has not been started and will not start until you approve Stage 4.**
