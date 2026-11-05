# Stage 2 report: foundation (site chrome)

**Environment:** local Ghost **6.75.0** at `http://localhost:2368`. **The live himandme.my installation was not touched.**
**Branch:** `stage-2` (based on `stage-0-1`, PR #1 not merged).

## Results

| Check | Result |
|---|---|
| `npm test`: build + content-block guard + GScan 6.7.0 `--v6` | ✅ 0 errors, 0 warnings. The guard checked every template. |
| Ghost Admin upload check (same GScan) | ✅ 0 errors, 0 warnings |
| `test/stage2/run.mjs`: site chrome | ✅ **23 / 23** |
| `test/stage1/run.mjs`: routing and content-block safeguards, re-run on the Stage 2 theme | ✅ **32 passed, 0 failed** (3 informational) |
| Visual comparison with the prototype at 1440px and 390px (`npm run visual`) | ✅ Header and footer positions, sizes, type and colours match. Images are in `docs/stage-2/`. |

## What Stage 2 delivers

- **Design tokens** (`assets/css/tokens.css`), copied 1:1 from the prototype: brand reds, warm white, charcoal, greys, radii, containers, the single shadow and the 32° slash skew.
- **Self-hosted fonts:** Manrope (weight axis) and Newsreader (weight and optical-size axes, as the prototype used), with OFL licences included. Manrope is preloaded; Newsreader only on blog pages.
- **Shell (`default.hbs`):** `lang` from the publication language, a skip link, `{{ghost_head exclude="search"}}`, one CSS file and one deferred script.
- **Headers:**
  - Main site: utility bar, header with the skewed active underline, WhatsApp outline button and red Temu Janji button.
  - Blog: top bar, serif masthead, search field, category bar.
  - Article: logo, title and search on desktop; back, logo and share on phones; reading-progress bar (filled in Stage 6).
- **Footers:** full main footer (Utama), compact footer (ED page, plain pages, errors), blog footer with links, and article footer. Each has its phone layout from the mobile boards.
- **Navigation from Ghost Admin.** The primary menu drives the header, footer and mobile menu. The secondary menu drives the blog category bar, with "Semua" added by the theme. The active page is marked visually and with `aria-current`.
- **Mobile menu:** a full-screen panel with focus trap, Escape to close and focus return. It closes automatically when the window widens past 900px.
- **Mobile action bar (≤599px):** WhatsApp + Buat Temu Janji on Utama and the ED page; "Ada soalan?" + Temu Janji on articles. It respects the iPhone safe area.
- **Error pages:** 404 and general errors, using existing label, heading and button styles.
- **Theme settings in use:** WhatsApp number and default message (all WhatsApp links), short address, hours, phone, email and Maps link.
- **Content-block guard** (`npm test`): fails the build if any post query lacks `tag:-hash-blok` and isn't a specific block lookup.

## Calibrations made while matching the prototype

1. **Container width.** The prototype's boxes were content-box, so its 1240px (main) and 1280px (blog) containers exclude the 24px gutters. The theme reproduces this, so positions match to the pixel.
2. **Base line height.** The prototype never set one (browser "normal"), so the theme doesn't either.
3. **The blog top bar** is hidden below 600px, because it isn't on the blog or article phone boards.

## Items for your awareness (no architectural change)

| # | Item | What I did | Your call? |
|---|---|---|---|
| 1 | **Footer disclaimer wording.** In the prototype, the ED page's footer disclaimer is worded slightly differently from the homepage's ("…Keputusan rawatan berbeza mengikut individu…"). The approved plan uses one editable block, `blok-penafian`. | The ED footer shows the same main-site disclaimer as the homepage. | Keep one shared text (recommended, one place to edit), or add a separate ED disclaimer (one more block). |
| 2 | **"Notis Privasi" link in the compact footer on phones.** The ED phone board omits it. | Kept it on phones too, because the enquiry form's PDPA consent refers to the Notice. | Keep (recommended) or hide on phones. |
| 3 | **Fields of the two site-wide blocks.** | `blok-maklumat-hubungan`: excerpt = address (one line per Enter), body = hours. `blok-penafian`: body = main-site disclaimer, excerpt = blog disclaimer. Both fall back to the approved copy. | For information |
| 4 | **Search.** The blog search field and the mobile search icon are in place visually. | Search behaviour arrives in Stage 5, as approved. | For information |
| 5 | **Mobile menu.** It isn't drawn in the prototype. | Built only from existing header, navigation and button styles, as agreed in the plan. Screenshot: `docs/stage-2/mobile-menu-blog.png`. | Please review the screenshot |
| 6 | **Performance.** The footer makes two specific block lookups per page. | Homepage renders in a median of ~90 ms locally (uncached SQLite). Production MySQL plus caching will be faster. | For information |
| 7 | **Technical note for Stage 5.** Because `/blog/` takes its data from the `jurnal` page, Ghost reports that route's context as a page. | Blog templates use their own markers instead of `{{#is "index"}}`. | For information |

## Still to do (later stages)

Page bodies (homepage Stage 3, ED page Stage 4, blog and topic Stage 5, article Stage 6), search, the contents list, the progress-bar behaviour, the WhatsApp enquiry form and the launch seed with the 21 blocks of approved copy.
