# Stage 3 report: homepage (Utama)

**Environment:** local Ghost **6.75.0** (development mode, SQLite) at `http://localhost:2368`. **The live himandme.my installation was not touched and nothing was published.**
**Branch:** `stage-3` (based on `stage-2`; PRs #1 and #2 open and unmerged).

## Results

| Check | Result |
|---|---|
| `npm test`: build + content-block guard + GScan 6.7.0 `--v6` | ✅ 0 errors, 0 warnings; every post query in every template passes the guard |
| Ghost Admin upload check | ✅ 0 errors, 0 warnings |
| `test/stage3/run.mjs`: homepage | ✅ **12 / 12** |
| `test/stage2/run.mjs`: site chrome | ✅ **23 / 23** |
| `test/stage1/run.mjs`: routing and `#blok` safeguards (now with all 15 real blocks) | ✅ **32 passed, 0 failed** (3 informational) |
| Visual comparison with the prototype, full page at 1440px and 390px | ✅ Desktop matches section for section. Phone layout and styling match, except for the copy-length differences in item 1 below. Images: `docs/stage-3/`. |

### What the Stage 3 tests prove
- **H1:** each of the 12 homepage blocks drives its section. The test edits each block's title and sees the change on the page, unpublishes the block and sees the approved copy instead, then restores it.
- **H2–H4:** "Dari blog" always shows the 3 newest *articles*. A newly published article appears first; a block re-dated to "now" never appears; a deleted article disappears.
- **H5–H6b:**
  - With no image, the prototype placeholder is shown.
  - With an image, the photo is responsive (`srcset` 320–1600px) and carries its alt text.
  - The hero photo loads immediately and is preloaded in `<head>`; the privacy-band photo is lazy-loaded.
- **H7:** the doctor card shows a placeholder when no slug is set. With the slug set it shows the profile name, the credentials setting and a link to `/blog/penulis/{slug}/`.
- **H8–H9:** the service cards link to `#penilaian`, `#shockwave` and `#ems`, and every booking button goes to the ED booking form.
- **H10:** exactly one `<h1>`, every `<img>` has alt text, and every labelled section points to its heading.
- **H11 (real browser):** the first FAQ question is open on load and clicking opens another. `aria-expanded` and the Malay button labels stay in sync.

## How the homepage is built
- **`home.hbs`** composes 10 section partials (`partials/home/`) between the Stage 2 header, footer and mobile bar.
- **Each section** looks up its own block by slug (`{{#get "posts" filter="slug:blok-utama-…"}}`). If the block is missing, `{{#foreach}}…{{else}}` shows the approved prototype copy.
- **"Dari blog"** uses `{{#get "posts" filter="tag:-hash-blok" limit="3"}}`.
- **Calibration to the prototype's content-box sizes:**
  - Hero card: 300px content plus 22px padding each side, so 344px wide.
  - Service cards: 300px content plus 36px padding top and bottom, so a 372px minimum height.
- **Phone variants exactly as on the board:**
  - The hero buttons give way to the sticky bar.
  - The trust strip uses shorter labels, the board's order and the plain shield icon.
  - The process steps sit in one card.
  - Blog cards scroll sideways.
  - The CTA band has a single button.
- **FAQ:** Ghost's toggle cards are restyled to the design-system accordion. Ghost's built-in English button label is replaced in Malay.

## Proposals and items for your decision (nothing below has been implemented)

| # | Item | Current behaviour | Options |
|---|---|---|---|
| 1 | **Shortened phone copy.** The phone board used shorter versions of five block texts: hero intro, the three service-card texts, the privacy bullets, the FAQ questions and answers, and the CTA text. | The theme shows the **same editable block text on every screen**, so the phone page is ~150px longer than the board. Fixed microcopy (trust labels, process steps, teaser heading) already uses the board's phone versions exactly. | **A (recommended):** keep one text per block, edited in one place. **B:** add optional phone-only texts. That's a **content-structure change** (extra fields or blocks), so it needs your approval. |
| 2 | **City in the hero label** ("/ KESIHATAN LELAKI · [BANDAR]"). | Fixed theme text in `locales/ms.json`; updating it needs a theme change. | **A:** keep as theme text and set the city before launch. **B (small structure change):** add a theme setting `city` (one of the 2 spare setting slots) so it's editable in Admin. |
| 3 | **Homepage block count.** | 12 blocks: the plan's 11, plus `blok-utama-hero` from your approved change #3 (the hero moved from a page to a block). Planned total is now **22** blocks (12 homepage + 8 ED + 2 site-wide). | For information |
| 4 | **Statement block fields.** | Title = statement, excerpt = the red phrase, body = supporting sentence. This is how the red highlight stays editable without HTML. | For information |
| 5 | **Render time.** | ~17 small queries per homepage request. Median ~180 ms locally, in Ghost's slower development mode on SQLite. | Stage 7: measure in production mode on MySQL. If it's still too slow, options include server micro-caching (a production configuration change, which would come to you for approval) or fewer queries (an architectural change). Neither is implemented. |
| 6 | **Ghost's Portal script** (membership pop-up) still loads by default. | With membership set to "Nobody" at launch it should not load. | I'll verify in Stage 7 that it doesn't. |
| 7 | **Placeholder copy still to supply:** | `[BANDAR]`, the 3 unanswered FAQ answers (`[Jawapan — akan disahkan]`), the third privacy bullet, address, hours, phone, email, WhatsApp number, your profile photo and credentials line. | Needed before launch |

## Safeguards preserved
- `#blok` content remains excluded from listings, archives, RSS, the sitemap and search. Stage 1 suite: 32/0 with all 15 real blocks present.
- The content-block guard runs in `npm test`.
- Blocks contain public website copy only (`seed/blocks.mjs`, approved prototype copy).
