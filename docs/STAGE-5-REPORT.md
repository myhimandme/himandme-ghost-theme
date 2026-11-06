# Stage 5 report: blog home, topic pages, author page, blog search

**Environment:** local Ghost **6.75.0** (development mode, SQLite) at `http://localhost:2368`. **The live himandme.my installation was not touched and nothing was published.**
**Branch:** `stage-5` (based on `stage-4`; no pull request opened, nothing merged).

## Results

| Check | Result |
|---|---|
| `npm test`: build + content-block guard (92 templates) + GScan 6.7.0 `--v6` | ✅ 0 errors, 0 warnings |
| Ghost Admin upload check | ✅ 0 errors, 0 warnings |
| `test/stage5/run.mjs`: blog | ✅ **15 / 15** |
| `test/stage4/run.mjs`: ED page, offer, Notis Privasi, email | ✅ **39 / 39** |
| `test/stage3/run.mjs`: homepage | ✅ **12 / 12** |
| `test/stage2/run.mjs`: site chrome | ✅ **23 / 23** |
| `test/stage1/run.mjs`: routing and `#blok` safeguards | ✅ **32 passed, 0 failed** (3 informational) |
| Visual comparison with the Blog and Blog — mobile boards | ✅ Section by section, desktop and phone. The only differences are the approved ones (below). Images: `docs/stage-5/compare-*.jpg` |

### What the Stage 5 tests prove
Every test that edits data restores it afterwards.
- **T1:** `/blog/`, topic and author pages use their own templates; no Stage 1 scaffold is left.
- **T2:** blog home sections appear in the approved order. There is no newsletter, no "Langgan", no "e-mel"/"email" word, and no content block on any blog page.
- **T3:** the features are the 3 newest featured articles. With every article unfeatured, the latest articles fill all three slots.
- **T4:** "Paling dibaca" lists the `#popular` articles. With none tagged, it shows the latest 4.
- **T5:** the 4 topic tiles take their name, description and link from the tags. Editing a tag description in Admin changes the tile.
- **T6:** "Terkini" shows the 9 newest articles, and "Muatkan lagi artikel" links to `/blog/page/2/`. Page 2 shows only the list, the consultation box and a link back.
- **T7:** the Panduan band shows the 3 newest `panduan` articles, labelled "PANDUAN 0n · N MIN BACAAN". It disappears when no article is tagged.
- **T8:** the consultation box links to the ED booking form and the configured WhatsApp number; the WhatsApp button is hidden on phones. The lead byline reads "Ditulis dan disemak oleh {doctor}".
- **T9:** a topic page shows the tag name, description and article count, then the topic's featured articles, then only that topic's articles (paginated).
- **T10:** the author page shows the staff profile name, "Ditulis dan disemak oleh", the verified credentials setting and the bio once one is set.
- **T11:** one uploaded feature image becomes the lead image, with a responsive `srcset`, alt text and no lazy loading. Without an image, the patterned placeholder shows.
- **B1 (browser):** "Muatkan lagi" appends each next page in place (9 → 18 → 25), without duplicates, until every article is listed. Then it disappears; the URL doesn't change.
- **B2:** no horizontal overflow on the blog home, page 2, a topic page or the author page, at 390, 768, 1024 and 1440px.
- **B3:** search matches articles by title and excerpt and links only to `/blog/` articles. Enter opens the first result. A query that matches a content block in Ghost's raw search index (proven by the test) shows **0** results on the site.
- **B4:** on phones, the search icon opens a full-width panel with focus in the field. Results fit the screen and Escape closes it. "Paling dibaca" shows 3 on phones.

## What was built

| Page / part | Template | Notes |
|---|---|---|
| Blog home `/blog/` | `index.hbs` + `partials/blog/*` | Features + Paling dibaca → Teroka mengikut topik → Terkini + Muatkan lagi → Panduan lengkap → consultation box. Phones follow the mobile board: lead, 2 compact rows, sideways topic tiles, Paling dibaca (3), Terkini (2 large cards, then compact rows), Panduan (1 large, 2 links), consultation box with Buat Temu Janji only |
| Page 2+ | same | The article list only, with "Halaman n / N" and a link back |
| Topic page `/blog/topik/{slug}/` | `tag.hbs` | Breadcrumb, "TOPIK", tag name and description, article count, the topic's featured articles (lead + 2), then all its articles |
| Author page `/blog/penulis/{slug}/` | `author.hbs` | Photo, "Ditulis dan disemak oleh", name, verified credentials (shield badge), bio, then all articles |
| Blog search | `partials/site/header-blog.hbs` + `main.js` | Desktop: results drop down under the masthead field. Phones: the search icon opens a full-width panel |

Where each area's data comes from is documented in the README ("Blog (Stage 5)"), as approved in the plan: features from *Feature this post*, Paling dibaca from `#popular`, guides from `panduan`, topic tiles from 4 fixed tag slugs, and images from the feature image.

**Approved differences from the boards:**
- No newsletter and no "Langgan" button; the consultation box spans the full row on desktop.
- "[x] BAB" became reading time.
- The byline is the single attribution, "Ditulis dan disemak oleh Dr. …", on desktop and phone.
- The board's "FOTO · …" caption was a mock-up label, so it isn't built.

**Tooling changes:**
- **Content-block guard:** it now reads `{{#get}}` filters that contain `{{…}}` (such as `tag:{{tag.slug}}`). Before, it stopped at the first `}`. Probes confirm it still rejects unguarded queries.
- **Stage 1 R5:** the pagination test now works for any number of articles.
- **Stage 2 S3:** escapes the `&` in "Hormon & Testosteron".
- **Test data:** the local data has 13 demo articles using the board's titles and summaries. Their body text is neutral placeholder text. All seven categories are in the category bar. This is test data only; the launch seed has no articles.

## Items for your decision (nothing below has been implemented)

| # | Item | Current behaviour | Options |
|---|---|---|---|
| 1 | **Featured articles also appear in "Terkini".** Terkini is the paginated list of all articles, so the newest (often featured) articles show in both places. | Duplicates are possible on page 1, as in most magazine layouts. Pagination is exact. | **A (recommended):** keep. **B:** leave the 3 featured articles out of Terkini on page 1. That needs a separate query, and page 2 would then start with articles already skipped. |
| 2 | **Topic tile 04 name.** The board shows "Gaya Hidup & Minda", but the tag is called "Gaya Hidup" (and "Kesihatan Mental" is a separate category). | The tile shows the tag's name, "Gaya Hidup". | Rename the tag in Admin (this also changes the category bar and labels), or keep. No theme change either way. |
| 3 | **Topic and author pages have no board.** | Built only from the blog-home components (header type, cards, Terkini list, consultation box). | Please review `docs/stage-5/full-topic-*.jpg` and `full-author-*.jpg`. |
| 4 | **Search results panel has no board.** | Built from existing styles: white panel, charcoal border, serif titles, the Paling dibaca rule colour. Without JavaScript the field does nothing. | Please review `docs/stage-5/search-*.jpg`. |
| 5 | **"SEMUA ARTIKEL →" (blog home, beside Terkini).** There is no separate archive page. | Links to `/blog/page/2/`. It's hidden on phones, as on the board, and on topic and author pages. | Keep, or remove. |
| 6 | **Short category labels on phones.** The phone board shows "HORMON" and "PELVIS"; Ghost's secondary navigation has one label per item. | Phones show the full labels; the bar scrolls sideways. | Keep, or use shorter labels in Admin for all screen sizes. |

## Screenshots (`docs/stage-5/`)
- **Prototype vs Ghost theme, section by section:**
  - `compare-desktop-1-hero` … `compare-desktop-5-consult`
  - `compare-mobile-1-hero` … `compare-mobile-6-consult`
- **Full pages:**
  - `full-blog-home-desktop`, `-mobile`, `-768`, `-1024`
  - `full-blog-page-2-*`, `full-topic-*`, `full-author-*`
- **Search:** `search-desktop`, `search-desktop-none`, `search-mobile`

## Safeguards preserved
- Every new post query excludes `#blok`; the guard is part of `npm test`.
- Search drops every index entry without a public URL; B3 proves blocks never show.
- Stage 1 still passes 32/0: no block in listings, RSS, sitemaps, archives or search.
- No email address or "e-mel"/"email" word on any blog page (T2; Stage 4 H1/H4).
- Nothing touched production. No PRs merged.

**Stage 6 (article pages) has not been started and will not start until you approve Stage 5.**
