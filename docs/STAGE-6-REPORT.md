# Stage 6 completion report: article pages

> **Status: Stage 6 visual review approved by the owner (16 Nov 2026).** Decisions:
> - Reading-progress bar stays in its current position (not sticky), and the article header is not pinned.
> - The sticky phone booking bar is kept.
> - The current desktop and phone article layouts and the topic-first related-article selection are kept.
> - No further visual redesign.
>
> PRs #1–#4 stay unmerged, no Stage 6 PR is opened yet, and Stage 7 has not started. Waiting for the owner's next instruction.
>
> **Pre-launch requirement (owner):** every piece of test content and placeholder must be replaced before production. None of it is production-ready. See the README, "Before launch: replace all test content".

**Environment:** local Ghost **6.75.0** (development mode, SQLite) at `http://localhost:2368`. **The live himandme.my installation was not touched and nothing was published.**
**Branch:** `stage-6` (based on `stage-5`). No pull request opened (as instructed); nothing merged.

## Results

| Check | Result |
|---|---|
| `npm test`: build + content-block guard (103 templates) + GScan 6.7.0 `--v6` | ✅ 0 errors, 0 warnings |
| Ghost Admin upload check | ✅ 0 errors, 0 warnings |
| `test/stage6/run.mjs`: article page, incl. the approved refinements | ✅ **16 / 16** |
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
- **A8:** "Panduan berkaitan" shows `panduan` articles **from the same topic first**, then the newest from other topics; 2 are shown, never the one being read, never a block. It's checked on three kinds of article: a normal one, a guide, and one whose topic is Panduan. The expected list is computed independently from Ghost.
- **A11:** the approved wording E1–E3 appears exactly as written: the disclaimer, the side-card heading and text, and the red-band heading and text.
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
  - Exactly 2 guides are visible.
- **B2:**
  - The progress bar fills as you read (0% → 66% → 100%).
  - FAQ toggles open.
  - Contents links jump to their section.
  - Copy-link confirms "Pautan disalin".
- **B3:** the search icon in the article header opens the blog search (articles only), and Escape closes it.
- **B4 (phone):**
  - No overflow, and the image is full width.
  - **Tag buttons are visible and wrap inside the screen.**
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

## Your Stage 6 decisions (16 Nov 2026): implemented

| # | Decision | What was done |
|---|---|---|
| 1 | Articles without a feature image: Option A | Unchanged: no image area on the article; the header flows into the text. Cards keep the patterned placeholder (A3; screenshot `full-article-plain-*`) |
| 2 | Tag buttons on phones: keep | Unchanged, and now tested: the buttons wrap inside the screen (B4). A very long tag name breaks onto two lines instead of overflowing |
| 3 | Wide/full-width images: keep | Unchanged. Desktop: within the text column, never under the rails. Phones: full-width images use the screen width |
| 4 | Panduan berkaitan: topic first | **Changed.** `panduan` articles from the article's topic come first (newest first). If fewer than 2, the newest from other topics fill in. Never the current article, never a `#blok` block (guard: 103 templates). Two queries, because Ghost can't nest them with the article's context; the box is hidden when there are no guides (A8, B1) |
| 5 | Clinical text E1–E3 approved | Recorded as approved in `docs/CLINICAL-REVIEW.md`. The wording is unchanged and tested word for word (A11) |
| 6 | Workflow | `stage-6` only; local Ghost only; single attribution "Ditulis dan disemak oleh {name}" kept; editor blocks and article content untouched; no PR, no merge, Stage 7 not started |

## Outstanding items (none blocks your Stage 6 decision)
- **Content from you:** the real articles (text and photos), your profile photo, and a check of each article's wording against the clinical checklist. The writer's guide is in the README ("Writing an article").
- **Pull-quote style when importing:** articles written in Ghost's editor keep the alternate quote style. Only a bulk JSON import loses it (Ghost turns it into a plain quote), so any import would need the same fix-up that `prepare-demo.mjs` applies.
- **Pull requests:**
  - **Stage 4:** still has no PR of its own.
  - **Stage 6:** no PR yet (you asked me not to open one).
  - **Merging:** PRs #1–#4 stay unmerged until you say otherwise.
- **Launch preparation (Stage 7, the only stage that touches himandme.my):**
  - turn off Network;
  - set up tags (with "Gaya Hidup & Minda") and the navigation;
  - your real staff profile and credentials setting, and the routes slug;
  - the content import and theme upload;
  - final checks.

## Screenshots (`docs/stage-6/`)
- **Prototype vs Ghost theme:**
  - `compare-desktop-1-header` … `compare-desktop-5-related`
  - `compare-mobile-1-header` … `compare-mobile-4-related`
- **Full pages:**
  - Desktop: `full-article-desktop`
  - Tablet: `full-article-1024`, `full-article-768`
  - Phone: `full-article-mobile`
- **Article without an image:** `full-article-plain-desktop`, `-mobile`

## Safeguards preserved
- Every new post query excludes `#blok` (guard: 103 templates).
- Related lists and search never show a block (A7, A10, B3).
- Stage 1 still passes 32/0.
- No email address or "e-mel"/"email" word on article pages.
- Nothing touched production. No PRs merged.

**Stage 7 (launch preparation) has not started and will not start until you approve Stage 6.**
