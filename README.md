# Him & Me — Ghost theme

Custom Ghost 6.x theme for **himandme.my**. It has a clinical-inspired main site (Utama, Disfungsi Ereksi) and a separate editorial blog (/blog/). The approved HTML prototype is the master visual reference.

> **Status: Stage 2 (site chrome).** Headers, footers, navigation, mobile menu, the mobile action bar, error pages, design tokens and self-hosted fonts match the approved prototype. Page bodies (homepage, ED page, blog, articles) are still *verification scaffolding* until Stages 3–6. Reports: [`docs/STAGE-1-REPORT.md`](docs/STAGE-1-REPORT.md), [`docs/STAGE-2-REPORT.md`](docs/STAGE-2-REPORT.md).

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
| 7 | Theme settings (WhatsApp, prices, credentials…) | **Settings → Site → Design & branding → Theme** tab → *Site wide* (17 fields) and *Post* (doctor credentials) → **Save**. Ghost derives the field labels from the setting names (e.g. "Whatsapp number"). |
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

## Repository layout (Stage 0–1)

```
package.json, routes.yaml       theme manifest (18 theme settings) and routing (source of truth)
*.hbs, partials/                Stage 1 verification scaffolding (replaced from Stage 2)
assets/css, assets/js           sources → assets/built/ (generated, not committed)
scripts/build.mjs, zip.mjs      build and packaging
test/stage1/                    routing / content-block verification suite (local Ghost only)
docs/                           Stage 1 report and verified Admin screenshots
```

The live production site is never touched by any script in this repo. The test scripts refuse any host other than `localhost` / `127.0.0.1`.
