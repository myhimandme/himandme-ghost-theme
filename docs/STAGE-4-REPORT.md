# Stage 4 completion report: Disfungsi Ereksi page + RM288 First Trial offer

**Environment:** local Ghost **6.75.0** (development mode, SQLite) at `http://localhost:2368`. **The live himandme.my installation was not touched and nothing was published.**
**Branch:** `stage-4` (based on `stage-3`; PRs #1, #2 and #3 open and unmerged).

## Results (final run, with the First Trial offer in place)

| Check | Result |
|---|---|
| `npm test`: build + content-block guard (81 templates) + GScan 6.7.0 `--v6` | ✅ 0 errors, 0 warnings. **20 / 20 theme settings** (Ghost's maximum), all used. |
| `test/stage4/run.mjs`: ED page + offer | ✅ **32 passed, 0 failed** |
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
  - The separate per-treatment 7–10 estimates were removed: both `*_session_count` settings now default to empty, so their tiles are hidden.

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
  - D3–D4, the offer item descriptions and intro line (reworded from accepted statements).
  - Notis Privasi page content.
- **All earlier placeholders are resolved:** additional tests removed; Shockwave sensation and aftercare; Kegel EMS "Berpakaian: Ya"; "Malam" removed; all FAQ answers; the third privacy bullet.
- **No claims, success rates, guarantees, contraindications, evidence or credentials were added.** "Anggaran 7–10 sesi rawatan" is the doctor's estimate, worded as an estimate and not a guarantee. New non-clinical text: the form, CTA and First Trial WhatsApp wording.

## Items for your decision (nothing below has been implemented)

| # | Item | Current behaviour | Options |
|---|---|---|---|
| 1 | **Unused settings.** Five settings are now empty and their tiles hidden: `shockwave_session_count`, `kegel_ems_session_count` (replaced by the combined programme), and `consultation_duration`, `shockwave_session_duration`, `kegel_ems_session_duration` (durations not shown, as instructed). **The theme is at Ghost's 20 / 20 setting limit.** | Nothing is visible. The fields still appear in Admin, so the tiles can be switched back on by typing a value. | **A (recommended):** remove all five settings and their tiles, freeing 5 slots for Stage 5–6 needs. This is an architecture change: the Admin fields disappear. **B:** remove only the two session counts. **C:** leave as is. |
| 2 | **Combined programme in the comparison table.** Currently the combined wording appears only in FAQ A25. | No session row in the table. | **A:** add one full-width row "Bilangan sesi: Anggaran 7–10 sesi rawatan (gabungan)" (theme text). **B (current):** FAQ only. |
| 3 | **Phone content parity** (carried over from Stage 4). | The phone page shows all content (it's longer than the board). | A (recommended): keep. B: hide those elements on phones. |
| 5 | **Notis Privasi page design.** The content is in place, but the general page template (`page.hbs`) is still the unstyled Stage 1 scaffold: full-width text, no margins. The prototype has no board for legal pages. | Readable but unstyled. | **A (recommended):** style it in Stage 5 together with the article template, reusing the article reading column and typography (~720px, same headings/lists), with no new design elements. **B:** do it now as a small Stage 4 add-on. |
| 4 | **D3–D4 offer wording** (`docs/CLINICAL-REVIEW.md`, section D). | Reworded from accepted statements. | Confirm or edit in the block. No developer needed. |

**Applied after the report:**
- **Address:**
  - Footer: "Him & Me Mens Health Setiawangsa / 1-3, Eight Setiawangsa / Jalan Setiawangsa 13, Taman Setiawangsa / 54200 Kuala Lumpur".
  - Top bar: "Eight Setiawangsa, Kuala Lumpur".
- **Operating days and hours:** Isnin – Sabtu, 10:00 pagi – 6:00 petang (footer, top bar, menu, booking panel). New-patient slots stay 11:00 pagi – 5:00 petang.
- **WhatsApp number** 601157912606 confirmed. **Public email** myhimandme@gmail.com (footer).
- **Notis Privasi:** your BM and English text, verbatim, loaded as the page body. The BM version comes first, then a divider and the English "Privacy Notice", with an "English version ↓" link at the top. Source: `seed/pages/notis-privasi.txt`, converted by the seed. After launch, edit it in Ghost Admin → Pages → Notis Privasi.
- **Durations:** not shown. The three TEMPOH tiles (consultation, Shockwave, Kegel EMS) are hidden; their settings are empty.
- **Name spelling:** "Him & Me Mens Health" everywhere, including the copyright line.
- **Footer fix:** each address line is now rendered as its own element. A long line that wraps stays tight, and real line breaks keep the designed 10px gap.

**Still needed from you (content):**
- Dasar Editorial page content.

## Safeguards preserved
- `#blok` content is excluded from listings, archives, RSS, the sitemap and search. Stage 1 passes 32/0 with all 23 blocks present (incl. `blok-tawaran`).
- The content-block guard is part of `npm test`.
- Blocks hold public website copy only (`seed/blocks.mjs`).
- Nothing touched production. No PRs merged.

**Stage 5 has not been started and will not start until you approve Stage 4.**
