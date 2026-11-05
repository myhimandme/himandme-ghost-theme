# Stage 4 report: Disfungsi Ereksi page

**Environment:** local Ghost **6.75.0** (development mode, SQLite) at `http://localhost:2368`. **The live himandme.my installation was not touched and nothing was published.**
**Branch:** `stage-4` (based on `stage-3`; PRs #1, #2 and #3 open and unmerged).

## Results

| Check | Result |
|---|---|
| `npm test`: build + content-block guard + GScan 6.7.0 `--v6` | ✅ 0 errors, 0 warnings. The guard passes on every post query in every template. **All 19 theme settings are now used in place**, so the Stage 1 settings scaffold has been removed. |
| Ghost Admin upload check | ✅ 0 errors, 0 warnings |
| `test/stage4/run.mjs`: ED page | ✅ **20 / 20** |
| `test/stage3/run.mjs`: homepage (incl. the new `city` setting) | ✅ **12 / 12** |
| `test/stage2/run.mjs`: site chrome | ✅ **23 / 23** |
| `test/stage1/run.mjs`: routing and `#blok` safeguards (now with all **22** blocks) | ✅ **32 passed, 0 failed** (3 informational) |
| Visual comparison with the prototype (full page at 1440px and 390px) | ✅ Desktop matches section for section. Phone: layout and styling match; differences are listed below. Images: `docs/stage-4/`. |

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

## Clinical content requiring your review
**`docs/CLINICAL-REVIEW.md`** lists **every clinical or service statement** on the ED page (30 items), the homepage (8) and site-wide (2), each with where to edit it. Highlights:
- **Clinical statements to verify:** the H1 wording ("…boleh dirawat"); the cardiovascular association callout; the Shockwave mechanism ("bertujuan menyokong aliran darah"); the pelvic-floor physiology; Kegel EMS suitability; the comparison-table "Kesesuaian" row; the ED prevalence FAQ answer.
- **Placeholders still to complete:**
  - ED page: `[Sahkan]` for additional tests, Shockwave sensation and aftercare, whether clients stay clothed for Kegel EMS, and evening opening.
  - ED FAQ: **5 answers** (3 marked "akan disahkan oleh doktor").
  - Homepage: 3 FAQ answers and the third privacy bullet.
  - Settings: all prices and session details.
  - The Notis Privasi page content.
- **No claims, success rates, guarantees, contraindications, evidence or credentials were added.** The only new text is non-clinical form and CTA wording, listed at the end of the checklist.

## Items for your decision (nothing below has been implemented)

| # | Item | Current behaviour | Options |
|---|---|---|---|
| 1 | **Phone board omissions.** The ED phone board leaves out a few theme-controlled elements: the comparison table, the "Semasa sesi" / "Mungkin dipertimbangkan untuk" lists, two of the four Kegel EMS tiles, the time and message fields, the booking intro and the contact list. | Following your Stage 3 decision (one text everywhere), the phone page shows **all** content in the phone layout. The comparison table scrolls inside its own box, and the form keeps all fields. The phone page is therefore longer than the board (~8,900px vs ~6,400px). | **A (recommended):** keep content parity, so phone visitors see prices, the time choice and the message field. **B:** hide those elements on phones to match the board exactly. That's a CSS-only change, but it removes content from phone visitors. |
| 2 | **"BERPAKAIAN: [Sahkan]" tile** (Kegel EMS). | Fixed theme text until you confirm. | Confirm the wording, or remove the tile. Both are theme-text changes, not structure changes. |
| 3 | **"Malam [jika dibuka]"** time option. | Fixed theme text. | Confirm evening hours, or remove the option. |

## Safeguards preserved
- `#blok` content is excluded from listings, archives, RSS, the sitemap and search. Stage 1 passes 32/0 with all 22 blocks present.
- The content-block guard is part of `npm test`.
- Blocks hold public website copy only (`seed/blocks.mjs`).
- Nothing touched production.
