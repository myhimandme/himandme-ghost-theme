# Stage 0–1 report: foundation and routing verification

**Environment:** local Ghost **6.75.0** (Ghost-CLI 1.34.1, SQLite, Node 22.23.4) at `http://localhost:2368`, in an isolated development sandbox. **The live himandme.my installation was not touched.**
**Theme:** `himandme-ghost-theme` 0.1.0 (verification scaffolding only, no visual design yet).
**Result:** **32 passed · 0 failed · 3 informational** (`npm run test:stage1`), after the fixes below.

## Stage 0: done

- Repository `myhimandme/himandme-ghost-theme` connected and scaffolded.
- Local Ghost 6.75.0 installed and running.
- Build: esbuild 0.28.2 → `assets/built/screen.css` and `main.js` (minified, source maps). `npm run dev` watches for changes.
- Packaging: `npm run zip` → `dist/himandme-ghost-theme.zip` (theme files only).
- **GScan 6.7.0**, the same version bundled with Ghost 6.75.0, run with `--v6`. Both the folder and the zip pass with **0 errors, 0 warnings, 0 recommendations**. Ghost Admin's own check on upload also reported 0 errors and 0 warnings.
- GScan rules met in the scaffold: theme-setting descriptions of 100 characters or fewer, settings groups limited to `post` / `homepage`, every setting used, `--gh-font-heading` / `--gh-font-body` supported (brand fonts stay the defaults), `@page.show_title_and_feature_image` supported, `.kg-width-wide` / `.kg-width-full` present.

## Stage 1: test results

| ID | Area | Check | Result | Detail |
|---|---|---|---|---|
| R1 | Routes | / renders home.hbs | ✅ Pass | HTTP 200, template home |
| R2 | Routes | Homepage <title> comes from Settings → General → Meta data | ✅ Pass | <title> "Him & Me — Kesihatan Lelaki" |
| R3 | Routes | /disfungsi-ereksi/ renders custom-disfungsi-ereksi.hbs | ✅ Pass | HTTP 200, template custom-disfungsi-ereksi |
| R4 | Routes | /blog/ renders index.hbs with 9 posts | ✅ Pass | HTTP 200, 9 posts |
| R5 | Routes | Blog pagination /blog/page/2/ (and page 3 → 404) | ✅ Pass | page 2: 3 posts; page 3: HTTP 404 |
| R6 | Routes | /blog/ <title> comes from page "jurnal"; /jurnal/ 301-redirects to /blog/ | ✅ Pass | <title> "Jurnal Kesihatan Lelaki — Him & Me"; /jurnal/ HTTP 301 → /blog/ |
| R7 | Routes | /blog/{slug}/ renders post.hbs | ✅ Pass | HTTP 200 |
| R8 | Routes | /blog/topik/{slug}/ renders tag.hbs, with pagination | ✅ Pass | HTTP 200; page 2 HTTP 200 |
| R9 | Routes | /blog/penulis/{slug}/ renders author.hbs, with pagination | ✅ Pass | HTTP 200; page 2 HTTP 200 |
| R10 | Routes | Canonical URL of every route points to itself | ✅ Pass | 8 routes checked |
| R11 | Routes | Article URL from the API is /blog/{slug}/ | ✅ Pass | http://localhost:2368/blog/artikel-ujian-01/ |
| R12 | Routes | Default Ghost routes are gone; bare taxonomy bases 404 | ✅ Pass | /tag/disfungsi-ereksi/ 404, /author/dr/ 404, /artikel-ujian-01/ 404, /blog/topik/ 404, /blog/penulis/ 404 |
| R13 | Routes | Homepage H1 comes from block "blok-utama-hero" | ✅ Pass | Kesihatan lelaki, dibincang dengan tenang dan profesional. |
| R14 | Routes | Author profile URL is /blog/penulis/{slug}/ (channel route owns it) | ✅ Pass | http://localhost:2368/blog/penulis/dr/ |
| B1 | Blocks | Block article URLs end in 404 with no block content | ✅ Pass | /blog/{block}/ → /404/ 404; /{block}/ → /blok-ed-shockwave/ 404; /{block}/ → /blok-utama-proses/ 404; /{block}/ → /blok-utama-perkhidmatan/ 404; /{block}/ → /blok-utama-faq/ 404; /{block}/ → /blok-utama-hero/ 404 |
| B2 | Blocks | Ghost assigns blocks no public URL (url = /404/) | ✅ Pass | /404/ |
| B3 | Blocks | Preview links /p/{uuid}/ do not expose published blocks | ✅ Pass | blok-ed-shockwave: HTTP 301 → /404/; blok-utama-proses: HTTP 301 → /404/; blok-utama-perkhidmatan: HTTP 301 → /404/; blok-utama-faq: HTTP 301 → /404/; blok-utama-hero: HTTP 301 → /404/ |
| B4 | Blocks | Blocks absent from blog listing, topic and author archives | ✅ Pass | 7 listing pages checked |
| B5 | Blocks | Blocks absent from all RSS feeds | ✅ Pass | /blog/rss/ 200, /blog/topik/disfungsi-ereksi/rss/ 200, /blog/penulis/dr/rss/ 200, /rss/ 404 |
| B6 | Blocks | Blocks and #blok tags absent from the sitemap | ✅ Pass | 4 sitemap files: /sitemap-pages.xml, /sitemap-posts.xml, /sitemap-authors.xml, /sitemap-tags.xml |
| B6b | Blocks | Every sitemap URL returns 200 (except the known /jurnal/ → /blog/ redirect) | ✅ Pass | 21 URLs OK; /jurnal/ is listed and 301s to /blog/ (Ghost behaviour for route-data pages) |
| B7 | Blocks | Ghost native search (Sodo Search) does not offer blocks | ✅ Pass | native search script on pages: no (theme excludes it); search index contains 5 block(s): blok-ed-shockwave, blok-utama-proses, blok-utama-perkhidmatan, blok-utama-faq, blok-utama-hero |
| B7b | Blocks | Internal #blok tags absent from the search index | ✅ Pass | 3 public tags indexed |
| B7c | Blocks | A theme search that drops url=/404/ entries hides all blocks | ✅ Pass | 17 indexed → 12 after filter |
| B8 | Blocks | Social web (Network) is off, so blocks are not federated | ✅ Pass | social_web_enabled = false |
| B9 | Blocks | Raw Content API (needs the public key) can still read blocks | ℹ️ Info | 5 blocks readable — expected and required for the theme; blocks hold public website copy only |
| B10 | Blocks | Theme queries must add "+tag:-hash-blok" (guard rule for Stage 2+) | ℹ️ Info | an unguarded {{#get "posts"}} can return blocks; 0 featured blocks today |
| C1 | Lookup | Method A: one query, block picked by slug | ✅ Pass | Apa yang kami tawarkan |
| C2 | Lookup | Method B: one query per section | ✅ Pass |  |
| C3 | Lookup | Missing block falls back to the approved copy | ✅ Pass |  |
| C4 | Lookup | ED page: block lookup + FAQ toggle card renders | ✅ Pass | toggle card present |
| C5 | Lookup | Homepage FAQ toggle card renders from block "blok-utama-faq" | ✅ Pass |  |
| C6 | Settings | All 18 theme settings are registered in Ghost Admin | ✅ Pass | 18 settings |
| C7 | Settings | A changed theme setting appears on the site immediately | ✅ Pass | 60881327326 |
| C8 | Lookup | Homepage render time with block queries (20 requests) | ℹ️ Info | median 52 ms, p95 73 ms (local, uncached) |

The tests in group B also covered pagination archives, preview links (`/p/{uuid}/`) and every sitemap file.

## Issues found and how they were resolved

| # | Issue found in testing | Resolution in this branch | Needs your approval? |
|---|---|---|---|
| 1 | **Ghost's native search lists every published post**, including blocks. The public endpoint `/ghost/api/content/search-index/posts/` has no URL or collection filter (confirmed in Ghost 6.75.0 source). | The theme uses `{{ghost_head exclude="search"}}`, so the native search pop-up (and its Cmd/Ctrl+K shortcut) is not loaded. Stage 5 adds a theme search for the blog's search field that drops every entry whose URL is `/404/`; B7c shows this removes all blocks. | **Yes** (alternative to native search) |
| 2 | **Author archives ignore the collection filter**, so blocks appeared on `/blog/penulis/{slug}/` and in its RSS feed. | A filtered `channel` route at `/blog/penulis/{slug}/` (`authors:{slug}+tag:-hash-blok`) takes precedence. The author taxonomy is kept so the author URL stays correct (R14). The doctor's slug must be written into `routes.yaml` (3 places). | **Yes** (slug written into `routes.yaml`) |
| 3 | Pages used as route `data` (`utama`, `jurnal`) stay listed in Ghost's sitemap even though they 301-redirect. | **Homepage:** the H1, intro and FAQ come from content blocks (`blok-utama-hero`, `blok-utama-faq`), and homepage SEO from **Settings → General settings → Meta data**. There is no `utama` page any more. **Blog:** `data: page.jurnal` is kept, because route data is read through the public API and internal tags can't be used. `/jurnal/` therefore stays in the sitemap as a redirect to `/blog/`: harmless, and noted. | **Yes** (homepage hero via block; `/jurnal/` in the sitemap) |
| 4 | **Social web (Network) is on by default in Ghost 6.** It federates every published post, blocks included, through `post.published` webhooks. It can't be exercised locally (it needs a real domain). | Turned off locally; B8 passes. **On production:** Settings → Growth → Network → off. | Production action, to be done with you at launch |
| 5 | `{{else}}` on `{{#get}}` does not run when there are no results (Ghost 6.75). | Fallback uses `{{#foreach posts}}…{{else}}<approved copy>{{/foreach}}` (C3). | No |
| 6 | Ghost's importer skips tags that have no posts. It also adds a `#Import <date>` tag to imported posts. | Launch seed: category tags are created by hand or attached to a block. The import tag is harmless and can be deleted. | No |
| 7 | If a route's `data` page is deleted or unpublished, that route returns 404. | Applies to `jurnal` only. The README warns editors not to unpublish it. | No |
| 8 | Block URLs (`/blog/{block}/`) answer 301 → `/404/` (then 404) rather than a direct 404. | No content is exposed (B1, B3); this is Ghost's normal handling of posts without a URL. | No |

**Informational, by design.** Anyone holding the site's public Content API key (which every Ghost site exposes in its pages) can read blocks through the raw API (B9). The theme needs this to render them, and blocks hold public website copy only. Rule for every later stage (B10): every `{{#get "posts"}}` that lists articles must include `+tag:-hash-blok`.

## Admin paths verified on Ghost 6.75.0

See the README's *Setup checklist* and `docs/admin-paths/` (10 screenshots). Changes from older Ghost documentation:

- **Routes:** Settings → Advanced → Labs → Open → Beta features → Routes → **Edit** opens a **YAML text editor with Save**. It is not an upload button. Tested: pasted text was saved to Ghost's active `routes.yaml`.
- **Import:** now at **Settings → Advanced → Import/Export → Migration tools → Import → Universal import** (accepts `.json` or `.zip`). It runs in the background and emails the owner when complete. Tested with the Stage 1 fixture file: all posts, pages, tags, excerpts, meta titles and the ED page's custom template were imported.
- **Theme:** Settings → Site → Theme → Change theme → Upload theme → Activate theme. Tested.
- **Theme settings:** Settings → Site → Design & branding → Theme tab. All 18 fields confirmed with their descriptions.
