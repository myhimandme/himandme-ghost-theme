# Him & Me — Ghost theme

Custom Ghost 6.x theme for **himandme.my**. It has a clinical-inspired main site (Utama, Disfungsi Ereksi) and a separate editorial blog (/blog/). The approved HTML prototype is the master visual reference.

> **Status: Stage 5 (blog home, topic pages, author page, blog search), awaiting approval.** Site chrome, the homepage, the ED page and the blog listing pages match the approved prototype. Articles (`post.hbs`) are still *verification scaffolding* until Stage 6. Reports: [`docs/STAGE-1-REPORT.md`](docs/STAGE-1-REPORT.md) · [`STAGE-2`](docs/STAGE-2-REPORT.md) · [`STAGE-3`](docs/STAGE-3-REPORT.md) · [`STAGE-4`](docs/STAGE-4-REPORT.md) · [`STAGE-5`](docs/STAGE-5-REPORT.md). **Clinical content checklist: [`docs/CLINICAL-REVIEW.md`](docs/CLINICAL-REVIEW.md).**

## Requirements

| | Version |
|---|---|
| Ghost | 6.75.0 (theme declares `>=6.0.0`) |
| Node.js | 22 (Ghost 6.75.0 requires `^22.23.1` or `^24.20.0`) |
| GScan | 6.7.0, the same version Ghost 6.75.0 uses to validate uploaded themes |

## Scripts

| Command | What it does |
|---|---|
| `npm install` | Installs the build and validation tools (esbuild, GScan, bestzip) |
| `npm run build` | Builds `assets/css/screen.css` and `assets/js/main.js` into `assets/built/` (minified, with source maps) |
| `npm run dev` | Same build, rebuilding on every change |
| `npm test` | Build, then the **content-block guard** (every `{{#get "posts"}}` must exclude `#blok` or target one specific block), then GScan with the Ghost 6 ruleset. Must pass before any release. |
| `npm run zip` | Build, then package `dist/himandme-ghost-theme.zip` for upload (theme files only) |
| `npm run gscan:zip` | GScan the packaged zip (exactly what Ghost Admin will check) |
| `npm run test:stage1` | Routing and content-block verification suite against a **local** Ghost (see [`test/stage1/README.md`](test/stage1/README.md)) |
| `npm run test:stage2` | Site-chrome checks (headers, footers, menus, settings, block fallback) against a local Ghost |
| `npm run test:stage3` | Homepage checks (every block + fallback, article teaser, images, doctor card, accessibility basics) against a local Ghost |
| `npm run test:stage4` | Disfungsi Ereksi page checks (blocks + fallback, FAQ, settings, every CTA, WhatsApp form in a browser, overflow) against a local Ghost |
| `npm run test:stage5` | Blog checks (features, Paling dibaca, topic tiles, Terkini + "Muatkan lagi", Panduan band, topic/author pages, feature images, search, overflow) against a local Ghost. It edits and restores test data |
| `npm run visual` | Side-by-side screenshots of the approved prototype vs the local theme (`PROTOTYPE_HTML=…`) |

## Ghost Admin setup checklist (paths verified on Ghost 6.75.0)

Paths were checked in the Ghost 6.75.0 Admin interface. Screenshots are in [`docs/admin-paths/`](docs/admin-paths/). The settings sidebar is grouped **General settings · Site · Membership · Growth · Advanced**.

| # | Task | Ghost 6.75.0 Admin path |
|---|---|---|
| 1 | Upload the theme | **Settings → Site → Theme → Change theme → Upload theme** → choose `himandme-ghost-theme.zip` → "Upload successful" → **Activate theme** |
| 2 | Upload routes | **Settings → Advanced → Labs → Open → Beta features → Routes → Edit**. This opens a **text editor** (not a file picker): select all, paste the contents of `routes.yaml`, click **Save**. *Before pasting, replace `dr` in the author channel with the doctor's profile slug (step 6).* |
| 3 | Import seed content | **Settings → Advanced → Import/Export → Migration tools → Import → Universal import** → select the `.json` file. The import runs in the background ("Import in progress") and Ghost emails the owner when it finishes. |
| 4 | Homepage SEO title/description | **Settings → General settings → Meta data** |
| 5 | Turn off social web (required) | **Settings → Growth → Network** → switch **off**. Ghost 6 has it on by default; it would publish every post, including content blocks, to the fediverse. |
| 6 | Doctor profile, and slug for routes | **Settings → General settings → Staff** → your name → **Profile** tab: name (with "Dr."), photo, bio, **Slug** |
| 7 | Theme settings (WhatsApp, prices, credentials…) | **Settings → Site → Design & branding → Theme** tab → *Site wide* (13 fields) and *Post* (doctor credentials). The theme uses **14 of Ghost's 20** custom settings → **Save**. Ghost derives the field labels from the setting names (e.g. "Whatsapp number"). |
| 8 | Language and timezone | **Settings → General settings → Publication language** (`ms`) and **Timezone** (Asia/Kuala_Lumpur) |
| 9 | Menus | **Settings → Site → Navigation**: *Primary* = main menu (Utama `/`, Disfungsi Ereksi `/disfungsi-ereksi/`, Blog `/blog/`). *Secondary* = blog category bar (e.g. Disfungsi Ereksi `/blog/topik/disfungsi-ereksi/`). "Semua" is added by the theme. |

### Import notes (found in Stage 1)

- Ghost's importer **skips tags that are not attached to any post**. Category tags with no articles yet must be created by hand (**Tags → New tag**) or attached to a content block in the seed file.
- Every import adds an internal tag such as `#Import 2026-11-05 12:18` to the imported posts. It is harmless and can be deleted under **Tags → Internal tags**.

## Content blocks (`#blok`): rules for editors

Homepage and ED-page section headings and descriptions are **content blocks**: published posts tagged with the internal tag `#blok`. Stage 1 verified that they never appear as articles, in blog or archive listings, RSS, the sitemap or on-site search (see the report).

1. **Find them:** Posts → filter by tag `#blok`.
2. **Edit:** the title is the section heading, the excerpt is the description, and the body holds paragraphs and lists. Click **Update**.
3. **Never change a block's URL slug.** The theme finds each block by its slug.
4. **Never remove the `#blok` tag**, and never add a public tag to a block. Either one would turn the block into a public blog article.
5. **Publish only** (never "Publish and email").
6. If a block is unpublished or deleted, the approved prototype copy is shown instead. The section never goes blank.
7. **Public website copy only.** Blocks are readable through Ghost's public Content API, so never put confidential or private information in a block.

### Site-wide blocks (Stage 2)

| Block slug | Title | Excerpt | Body |
|---|---|---|---|
| `blok-maklumat-hubungan` | (internal label) | Full footer address. Press Enter for each new line. | Opening hours, one paragraph per line |
| `blok-penafian` | (internal label) | Blog and article footer disclaimer | Main-site footer disclaimer |

### Homepage blocks (Stage 3) — tag `#blok` + `#blok-utama`

| Block slug | Title | Excerpt | Body | Feature image |
|---|---|---|---|---|
| `blok-utama-hero` | H1 | Intro paragraph | — | Hero photo (set its alt text) |
| `blok-utama-kenyataan` | Statement (start) | Phrase shown in **red** | Supporting sentence | — |
| `blok-utama-perkhidmatan` | Services heading | Description (desktop) | — | — |
| `blok-utama-servis-konsultasi` / `-servis-shockwave` / `-servis-kegel-ems` | Card title | Card text | — | — |
| `blok-utama-proses` | Process heading | — | — | — |
| `blok-utama-privasi` | Privacy heading | — | Bullet list | Photo in the charcoal band |
| `blok-utama-pasukan` | Doctor-section heading | Text (desktop) | — | — |
| `blok-utama-blog` | Blog-teaser heading (desktop) | — | — | — |
| `blok-utama-faq` | FAQ heading | — | **Toggle cards**, one per question (first opens automatically) | — |
| `blok-utama-cta` | Closing band heading | Band text | — | — |

The hero label shows the theme setting **`city`** after "KESIHATAN LELAKI" (desktop). If `city` is empty the label shows no city at all, never a blank or placeholder.

The doctor card uses the staff profile named in theme setting **`doctor_author_slug`** (name, photo) and the **`doctor_credentials`** setting. The "Dari blog" cards are the three newest articles and never include blocks. Section labels ("/ PERKHIDMATAN"), the hero checklist, the trust strip and the four process steps are fixed theme text in `locales/ms.json`.

### Disfungsi Ereksi page (Stage 4)

**The page itself** (Pages → *Disfungsi Ereksi*, Template: *Disfungsi ereksi*): **title** = H1, **excerpt** = hero intro, **body** = the FAQ (one **toggle card** per question; the first opens automatically), **meta data** = SEO title and description.

**Blocks** (tag `#blok` + `#blok-ed`):

| Block slug | Title | Excerpt | Body | Feature image |
|---|---|---|---|---|
| `blok-ed-apa` | 01 heading | "Bila perlu berjumpa doktor?" text | Paragraphs (left column), then **one bulleted list** (the signs, shown in the right-hand card) | — |
| `blok-ed-punca` | 02 heading | Description | Charcoal callout text | — |
| `blok-ed-penilaian` | 03 heading | Intro text | — | — |
| `blok-ed-shockwave` / `blok-ed-kegel-ems` | 04 / 05 heading | Subtitle | **First paragraph** (shown above the tiles), then a **heading + bulleted list**, then a **closing note paragraph** (shown below the tiles) | Section photo (set alt text) |
| `blok-ed-perbandingan` | Comparison heading | — | — | — |
| `blok-ed-faq` | FAQ heading | — | — | — |
| `blok-ed-temujanji` | Booking heading | Booking intro | — | — |

*Write the body in that order. The theme shows the paragraphs and the list in their designed places automatically, so no special formatting is needed.*

**Theme settings used:** `offer_price` (First Trial), `consultation_fee`, `shockwave_price`, `kegel_ems_price`, **`show_prices`** (hides the fee and price tiles when off), WhatsApp number and messages, address, hours and phone (booking panel). Durations and per-treatment session counts are not shown, so those settings were removed.
**Fixed theme text** (`locales/ms.json`): section labels and tabs, the six cause cards, the four consultation steps, tile labels ("PEMBEDAHAN: Tidak", "BERPAKAIAN: [Sahkan]"), the comparison table rows, form labels and the WhatsApp message format.

**Session counts:** the treatment programme is a *combined* programme: "Anggaran 7–10 sesi rawatan. Setiap sesi merangkumi Shockwave Therapy dan Kegel EMS…" (an estimate, not a guarantee). It appears once, in the FAQ answer on the page body.

**Booking form:** builds a WhatsApp message from the visitor's input (name, phone, service, date, time, message) and opens WhatsApp. **Nothing is sent to or stored on the website.** The treatment CTAs ("Buat Temu Janji" under Shockwave / Kegel EMS) preselect that service.

### First Trial offer (Stage 4 follow-up)

One block, one setting. **The price lives only in the theme setting `offer_price`** (Settings → Site → Design & branding → Theme → *Offer price*, e.g. `RM288`). Every place the offer shows reads it: the homepage card, the ED hero bar, the ED section "Apa yang termasuk dalam First Trial", the "First Trial" tab, the booking-form option, and every "Tempah First Trial" WhatsApp message ("Salam Him & Me, saya berminat untuk menempah First Trial RM288."). **Leave `offer_price` empty to hide the offer everywhere.**

| Block slug | Title | Excerpt | Body |
|---|---|---|---|
| `blok-tawaran` (tag `#blok`) | Package name (e.g. "First Trial"); also used in the WhatsApp message and the form option | Button label ("Tempah First Trial") | **First paragraph** = short description. **One bulleted list**: each item is **bold item name** followed by its description (the theme adds the icons, or the 01/02/03 numbers on the ED page). **Last paragraph** = slot note. **Never type the price in the block.** |

If the block is unpublished, the approved copy is shown, still using `offer_price`.

### Email address (anti-harvesting)

The email address is **never in the site HTML as text**: there's no email in the footer (desktop or mobile), and no `mailto:` link. On the Notis Privasi page it appears as an image, `assets/images/hubungi-himandme.png` (theme asset, transparent PNG, 3 KB). The image is used in both the BM and English contact sections, inside an **HTML card**, with no "E-mel"/"Email" label. Its alt text is "Hubungi Him & Me untuk pertanyaan privasi" / "Contact Him & Me for privacy enquiries".

The words "e-mel" and "email" are kept out of everything the site serves: the image file name, CSS class (`hm-contact-img`) and alt text avoid them. The notice's data list says "Alamat mel elektronik" / "Electronic mail address" instead (owner's wording). This deters simple harvesters; it is not proof against OCR.

To change the address, edit `ADDRESS` in `scripts/make-contact-image.mjs` and run `node scripts/make-contact-image.mjs`. Then compress the PNG to a palette image (the committed file was reduced from 12 KB to 3 KB with Pillow `quantize(48)`), rebuild and upload the theme. Don't type the address into a page, block or setting.

### Legal pages

`seed/pages/notis-privasi.txt` holds the owner's Notis Privasi text (BM, then English). `seed/blocks.mjs` converts it to the page body: `## ` heading, `### ` subheading, `* ` / `1. ` lists, `---` divider, `# ` second-language title. Once imported, edit it in Ghost Admin → Pages → Notis Privasi.

Plain pages use `page.hbs`, styled like a blog article. Each **H2 heading** becomes an entry in the "Dalam halaman ini" contents list (shown when there are at least 3). Use H3 for subsections. The page keeps the main-site header and the compact footer with the Notis Privasi link.

### Blog (Stage 5): what drives each area

Everything on the blog pages comes from Ghost Admin and updates when you publish, schedule, update or unpublish. Content blocks (`#blok`) never appear.

| Area | Comes from | To change it |
|---|---|---|
| Lead + 2 secondary features (blog home) | The 3 newest posts with **Feature this post** on; the latest posts fill any empty slot | Post settings → *Feature this post* |
| Paling dibaca (4; 3 on phones) | Posts with the internal tag **`#popular`**; the latest posts if none | Add/remove the `#popular` tag. Ghost has no view counts, so this list is hand-picked |
| Teroka mengikut topik (4 tiles) | The tags `disfungsi-ereksi`, `hormon-testosteron`, `kesihatan-pelvis`, `gaya-hidup` (named "Gaya Hidup & Minda"): name and description | Tags → edit the name/description. The 4 slugs are fixed in `partials/blog/topics.hbs` |
| Terkini (9 per page) + "Muatkan lagi artikel" | The `/blog/` collection, newest first; the button loads the next page in place (a normal link without JavaScript) | Publish posts. Page 2+ shows the list only |
| Panduan lengkap (3) | The 3 newest posts tagged **`panduan`**, with their reading time; the band is hidden when there are none | Add/remove the `panduan` tag |
| Consultation prompt | Fixed theme text; buttons go to the ED booking form and WhatsApp | — |
| Category label on cards | The post's **first public tag** | Post settings → Tags (put the category first) |
| Byline | "Ditulis dan disemak oleh {author}" from the post's author (the doctor's staff profile) | Settings → Staff |
| Card / lead / guide images | The post's **feature image** and its alt text; a patterned placeholder when there is none | Post settings → Feature image |
| Topic page `/blog/topik/{slug}/` | The tag's name and description, its featured posts first, then all its posts | Tags; *Feature this post* |
| Author page `/blog/penulis/{slug}/` | Staff profile (name, photo, bio) + theme setting `doctor_credentials` | Settings → Staff; Design → Theme |

**Category bar labels:** desktop shows each Secondary navigation label in full. On phones the theme shows the approved short labels instead, matched by the topic URL: DISFUNGSI, HORMON, PELVIS, SEKS, GAYA HIDUP (for `gaya-hidup`, "Gaya Hidup & Minda") and MINDA (for `kesihatan-mental`). The full name stays in the link for screen readers. Tag names and slugs are not affected. Change the mapping in `partials/site/cat-label.hbs`.

**Search** (blog masthead; the search icon on phones): searches published **articles** by title and excerpt. It reads Ghost's public search index once, in the visitor's browser. It drops every entry without a public URL (content blocks resolve to `/404/`) and anything outside `/blog/`. Ghost's own search pop-up stays disabled, because its index lists content blocks. Nothing is stored. **Without JavaScript** the field and the phone search icon are hidden, and a short note ("Carian memerlukan JavaScript. Lihat topik") takes their place. If the index can't be loaded, the panel says search is temporarily unavailable. Keyboard: ↓/↑ move between the field and the results, Enter opens the first result, Escape closes.

### Before launch: blog data (production Admin, not the theme)

1. **Tags (Ghost Admin → Tags):** create the 7 categories with these slugs: `disfungsi-ereksi`, `hormon-testosteron`, `kesihatan-pelvis`, `seks-hubungan`, `gaya-hidup`, `kesihatan-mental`, `panduan`. Give `gaya-hidup` the **name "Gaya Hidup & Minda"** (approved Stage 5). Keep the slug `gaya-hidup`; the theme's topic tiles and short labels use the slug. Add descriptions; they appear on the topic tiles and topic pages.
2. **Secondary navigation (Settings → Site → Navigation):** one item per category, in the order above, with the full name as the label (e.g. "Gaya Hidup & Minda" → `/blog/topik/gaya-hidup/`).
3. **Doctor profile (Settings → Staff → your profile):** your real name (with "Dr."), photo, biography and slug. Then the theme setting **`doctor_credentials`** (verified credentials) and the slug in `routes.yaml` (3 places). Open `/blog/penulis/{slug}/` and check that no test data appears. The local test profile ("Dr. Ujian Tempatan") exists only on the development install and is never imported.

## Repository layout (Stage 0–1)

```
package.json, routes.yaml       theme manifest (20 theme settings, Ghost's maximum) and routing (source of truth)
*.hbs, partials/                Stage 1 verification scaffolding (replaced from Stage 2)
assets/css, assets/js           sources → assets/built/ (generated, not committed)
scripts/build.mjs, zip.mjs      build and packaging
test/stage1/                    routing / content-block verification suite (local Ghost only)
docs/                           Stage 1 report and verified Admin screenshots
```

The live production site is never touched by any script in this repo. The test scripts refuse any host other than `localhost` / `127.0.0.1`.
