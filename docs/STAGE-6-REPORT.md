# Stage 6 report: article pages

**Environment:** local Ghost **6.75.0** (development mode, SQLite) at `http://localhost:2368`. **The live himandme.my installation was not touched and nothing was published.**
**Branch:** `stage-6` (based on `stage-5`). No pull request opened yet; nothing merged.

## Results

| Check | Result |
|---|---|
| `npm test`: build + content-block guard (103 templates) + GScan 6.7.0 `--v6` | ✅ 0 errors, 0 warnings |
| Ghost Admin upload check | ✅ 0 errors, 0 warnings |
| `test/stage6/run.mjs`: article page | ✅ **15 / 15** |
| `test/stage5/run.mjs`: blog | ✅ **21 / 21** |
| `test/stage4/run.mjs`: ED page, offer, Notis Privasi, email | ✅ **39 / 39** |
| `test/stage3/run.mjs`: homepage | ✅ **12 / 12** |
| `test/stage2/run.mjs`: site chrome | ✅ **23 / 23** |
| `test/stage1/run.mjs`: routing and `#blok` safeguards | ✅ **32 passed, 0 failed** (3 informational) |
| Visual comparison with the Artikel and Artikel — mobile boards | ✅ Section by section, desktop and phone. Images: `docs/stage-6/compare-*.jpg` |

### What the Stage 6 tests prove
Tests that edit data restore it afterwards.
- **A1:** articles use `post.hbs`, in the board's order: header → 16:7 image → contents and share | text | consultation and guides → "Baca seterusnya". The Stage 1 test page is gone and the article URL is unchanged.
- **A2:** the header shows:
  - the category (linking to its topic page), title, and standfirst (the excerpt);
  - "Ditulis dan disemak oleh {doctor}", linking to the author page;
  - the date in Malay ("12 Ogos 2026") and the reading time;
  - the credentials and "Kemas kini terakhir …".
- **A3:** the feature image is responsive (up to 2400px), with alt text and caption, and loads first. An article without an image shows no image area.
- **A4:** Ghost editor blocks render: grey callout, alternate quote, white callout, toggle, image with caption, lists, and the "Rujukan" heading.
- **A5:** the red band and the side card link to the ED booking form and the configured WhatsApp number. The internal tag `#tanpa-cta` hides both; removing it brings them back.
- **A6:** the end of each article has the disclaimer, the **public** tags (internal `#` tags never show), and the author box (name, credentials, bio, "Semua artikel oleh …").
- **A7:** "Baca seterusnya" shows the 3 newest articles from the same category, never the current one. A category with no other articles falls back to the latest 3. It never shows a content block.
- **A8:** "Panduan berkaitan" shows up to 2 `panduan` articles, never the one being read.
- **A9:**
  - The WhatsApp share link carries the title and the article URL, and there is a copy-link button.
  - Ghost's SEO tags come from the post: og:title, og:image (the feature image), the published time and the canonical URL.
- **A10:**
  - No content block is linked.
  - The Stage 2 elements are intact: top bar, article header with progress bar, blog footer, phone bar.
  - There is no newsletter, and no "e-mel"/"email" word.
- **B1 (browser):**
  - "Dalam artikel ini" lists the 5 sections (not Rujukan) as a rail.
  - Rujukan moves below the red band.
  - "Poin utama" shows 3 points.
  - The red drop cap is 76px.
- **B2:**
  - The progress bar fills as you read (0% → 66% → 100%).
  - FAQ toggles open.
  - Contents links jump to their section.
  - Copy-link confirms "Pautan disalin".
- **B3:** the search icon in the article header opens the blog search (articles only), and Escape closes it.
- **B4 (phone):**
  - No overflow, and the image is full width.
  - The header is left-aligned with no breadcrumb.
  - The contents list is collapsed above the text.
  - The side rails are hidden, related articles are compact rows, and the slim sticky bar shows.
- **B5:**
  - No overflow at 390/768/1024/1440px on a rich article, a plain one and a guide.
  - **Without JavaScript**, the text, references (styled in place) and WhatsApp share still work. Copy-link and the contents list are hidden.

## What was built

| Part | Source | Notes |
|---|---|---|
| Header | Post title, excerpt, first tag, author, dates | One attribution, "Ditulis dan disemak oleh {name}", with your credentials and "Kemas kini terakhir" in the badge. This replaces the board's separate writer and reviewer, as you decided |
| Feature image | Feature image + alt + caption | 16:7 on desktop, full width on phones |
| Left rail | H2 headings (2 or more) + share | Sticky on desktop. On tablet and phone, a collapsible "Dalam artikel ini" above the text, as on the phone board |
| Text | Ghost editor content | Board typography, drop cap, and editor blocks mapped to the board's styles. The full mapping for writers is in the README ("Writing an article") |
| Right rail | Consultation card + `panduan` articles | Desktop only, as on the boards |
| After the text | Red band, Rujukan, disclaimer, tags, author box | Band and card hidden by `#tanpa-cta` |
| Baca seterusnya | Same category; latest as fallback | 3 cards on desktop, compact rows on phones |
| Header search | Shared blog search | The article header's search icon now works (it was inactive in Stage 2) |
| Reading progress | Script | Fills the 3px red bar from Stage 2 |

**Test data:** the lead demo article ("Disfungsi ereksi bukan sekadar soal usia…") carries the **Artikel board's own sample text**, built with Ghost's editor blocks. `test/stage6/prepare-demo.mjs` adds labelled test images ("GAMBAR UJIAN") and the pull-quote style. Ghost's JSON importer stores the alternate quote as a plain quote, so the script changes it the way the editor stores it. This is test data only; nothing here is published.

**Fixed while testing:**
- **Byline reading time:** it was missing from the byline.
- **Reference numbers:** references were numbered twice.
- **"Baca seterusnya" cards:** they showed link underlines.
- **Empty "Baca seterusnya":** when a category had no other articles, the list came out empty. It now falls back to the latest articles (test A7).
- **Test update:** the Stage 5 image test now restores an article's original image instead of removing it.

## Items for your decision (nothing below has been implemented)

| # | Item | Current behaviour | Options |
|---|---|---|---|
| 1 | **Article without a feature image.** The board shows a grey 16:7 placeholder. | No image area at all; the header runs straight into the text. Cards keep the patterned placeholder. | **A (recommended):** keep. A large empty grey box looks unfinished on a live article. **B:** show the placeholder, as on the board. |
| 2 | **Tag buttons on phones.** The phone board leaves them out. | Shown on phones too, following your Stage 3 rule of the same content everywhere. | Keep (recommended), or hide on phones. |
| 3 | **Wide and full-width images.** | On desktop they stay the width of the text column, because the two rails sit beside it. On phones, full-width images reach the screen edges. | Keep (recommended), or let wide images extend under the rails (needs a layout change). |
| 4 | **"Panduan berkaitan".** | The 2 newest `panduan` articles, whatever their topic. | Keep, or prefer guides from the same topic first. |
| 5 | **Article template text** (`docs/CLINICAL-REVIEW.md`, section E) | Disclaimer and consultation wording taken from the prototype. | Please confirm E1–E3 with the doctor. |

## Screenshots (`docs/stage-6/`)
- **Prototype vs Ghost theme:**
  - `compare-desktop-1-header` … `compare-desktop-5-related`
  - `compare-mobile-1-header` … `compare-mobile-4-related`
- **Full pages:** `full-article-desktop`, `-mobile`, `-768`, `-1024`
- **Article without an image:** `full-article-plain-desktop`, `-mobile`

## Safeguards preserved
- Every new post query excludes `#blok` (guard: 103 templates).
- Related lists and search never show a block (A7, A10, B3).
- Stage 1 still passes 32/0.
- No email address or "e-mel"/"email" word on article pages.
- Nothing touched production. No PRs merged.

**Launch preparation has not started and will not start until you approve Stage 6.**
