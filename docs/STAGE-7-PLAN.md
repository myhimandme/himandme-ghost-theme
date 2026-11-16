# Stage 7 plan: production readiness and launch preparation

> **Status: PLAN ONLY. Awaiting the owner's approval (prepared 16 Nov 2026).**
> Nothing in this document has been carried out.
> - No pull request was merged, created or changed. No existing branch was modified.
> - The live VPS, Ghost, DNS and Cloudflare were not touched.
> - Nothing was imported, published or activated, and no test data was deleted.
>
> This file and `docs/STAGE-7-CHECKLIST.md` live on a new docs-only branch, `stage-7-plan`, based on `stage-6`.

**Status labels used in both files**

| Label | Meaning |
|---|---|
| ✅ **Ready** | Done and verified in the repository, or needs no further work |
| 🔍 **Requires verification** | Has to be checked on the server, in Ghost Admin or in Cloudflare (read-only commands are given) |
| ✋ **Requires my input** | Needs a decision, content or a fact from the owner. Nothing will be invented |
| ⛔ **Blocked** | Cannot proceed until a named dependency is resolved |

**Limit of this audit:** this work session cannot reach himandme.my, because its network proxy refuses the connection. So every production finding below is a *check to run*, not a result.
- The commands are read-only.
- None of them prints a password, key or token. Where a file holds secrets, the command filters them out.
- Please do not paste secrets into the chat. Only the outputs that are asked for are needed.

---

## 1. GitHub repository and branch report

### 1.1 What is on GitHub (`myhimandme/himandme-ghost-theme`)

| Branch | Head | Commits on top of the previous branch | Behind the previous branch |
|---|---|---|---|
| `main` | `a4525de` | n/a (initial) | n/a |
| `stage-0-1` | `afaed48` | 1 | 0 |
| `stage-2` | `e1c0b19` | 1 | 0 |
| `stage-3` | `d0cbdb4` | 1 | 0 |
| `stage-4` | `3fdf495` | 13 | 0 |
| `stage-5` | `04b1ea2` | 6 | 0 |
| `stage-6` | `967aee2` | 4 | 0 |
| `stage-7-plan` (new, docs only) | on top of `stage-6` | 1 (these two files) | 0 |

**Findings**
- The history is **one straight line**. Each stage branch starts exactly where the previous one ends. No branch has been merged into another, and none has diverged. **Merging cannot produce conflicts.**
- **`stage-6` contains all the approved work from Stages 0–6.** It is the only branch that needs to reach `main`. Every earlier branch is an ancestor of it.
- Duplicates: none. No commit appears on two branches with different hashes, and no stage re-applies another stage's change.

### 1.2 Open pull requests

| PR | Head → base | Covers | Note |
|---|---|---|---|
| #1 | `stage-0-1` → `main` | Stages 0–1 | Ready to merge into `main` |
| #2 | `stage-2` → `stage-0-1` | Stage 2 | **Stacked:** its base is `stage-0-1`, not `main` |
| #3 | `stage-3` → `stage-2` | Stage 3 | **Stacked** on `stage-2` |
| (none) | `stage-4` → `stage-3` | Stage 4 | **Missing PR.** No pull request exists for Stage 4 |
| #4 | `stage-5` → `stage-4` | Stage 5 | **Stacked** on `stage-4` |
| (none) | `stage-6` → `stage-5` | Stage 6 | **Missing PR.** Not opened yet, as instructed |

**Dependency:** #1 → #2 → #3 → (Stage 4) → #4 → (Stage 6). Each PR only makes sense once the one before it is merged.

**Risk with the stacked bases:** merging #2 as it stands would merge Stage 2 into `stage-0-1`, **not** into `main`. `main` would then still lack Stage 2, even though GitHub shows #2 as "merged". The same applies to #3 and #4.

### 1.3 Safest merge order (owner decides; nothing is done until approved)

**Option A (recommended): keep one reviewable PR per stage, merged in order into `main`.**
1. Merge #1 (`stage-0-1` → `main`) with a **merge commit**.
2. Change #2's base to `main`. The diff then shows only Stage 2. Merge with a merge commit.
3. Change #3's base to `main`. Merge.
4. Open a **new** PR `stage-4` → `main` (Stage 4 only). Merge.
5. Change #4's base to `main`. Merge.
6. Open a **new** PR `stage-6` → `main` (Stage 6), and later one for `stage-7-plan` and the Stage 7 release changes. Merge.

**Option B (fastest): a single release PR `stage-6` → `main`** holding everything, then close #1–#4 as included.
- **For:** one merge.
- **Against:** the per-stage review history is spread across closed PRs.

**Rules for either option**
- **Use merge commits, not squash or rebase.** Squashing #1 would give `main` a commit that `stage-2` doesn't have. Every later PR would then show Stage 1 again as a duplicate and could conflict.
- Do not delete the stage branches until `main` is tagged.
- After the last merge, `main` must equal `stage-6` (plus Stage 7) file for file. Check this with `git diff stage-6 main --stat`, which should print nothing.

### 1.4 Updates needed before release (Stage 7 implementation, on a release branch, after approval)

| # | Change | Why | Status |
|---|---|---|---|
| G1 | Bump `package.json` `version` from `0.1.0` to `1.0.0`, and tag `v1.0.0` on `main` | Ghost Admin shows the theme version. A tag gives a fixed rollback point | ✋ Approve the version number |
| G2 | **Image file permissions.** `assets/images/logo-him-and-me.png` and `logo-mark.png` are stored as owner-read-only (`0600`), and the zip keeps that mode. Make them `0644` like the other files | Some servers extract the theme as a different user from the one that serves it. Ghost could then fail to serve the logo | ✅ Ready (found in this audit; trivial fix) |
| G3 | `routes.yaml`: replace the placeholder author slug `dr` (3 places) with the doctor's real staff slug | Otherwise `/blog/penulis/{slug}/` uses the unfiltered taxonomy, which could list `#blok` content blocks | ⛔ Blocked on O4 (the real slug) |
| G4 | Add `scripts/build-launch-seed.mjs` to generate the production import file from `seed/blocks.mjs` **only** (section 3) | There is no launch seed generator yet. The existing `test/stage1/make-fixtures.mjs` mixes in test articles and must never be used for production | ✅ Ready to build |
| G5 | Add `scripts/check-placeholders.mjs` (section 3.4) | Enforces the owner's rule that no test content or placeholder reaches production | ✅ Ready to build |
| G6 | Add `test/prod/smoke.mjs`: a **read-only** production check (GET requests only, no login, no edits) | Phase F and H verification | ✅ Ready to build |
| G7 | README: a "Production launch" section that points to this plan | Single entry point | ✅ Ready |

---

## 2. Production infrastructure audit (read-only)

Environment as stated by the owner:
- Ubuntu 24.04.5 LTS on a Tencent Cloud Singapore VPS
- Ghost 6.75.0
- Nginx
- MySQL 8.0
- Node.js 22
- Domain himandme.my, with DNS on Cloudflare

**None of this has been verified from here.** Every row is 🔍 until you run the command and the result matches "Expected". The commands assume Ghost-CLI's standard layout (`/var/www/<site>`, run as your normal sudo user, **not** root). Replace `/var/www/himandme` with your real install directory if it differs.

> ⚠️ **Never run `cat config.production.json`. It prints the database password.** Use the filtered command in row I3, which deletes the secret fields before printing.

| ID | Area | Read-only check | Expected | Status |
|---|---|---|---|---|
| I1 | OS | `lsb_release -d; uname -r; uptime` | Ubuntu 24.04.5 LTS. Note the uptime and any pending reboot (`ls /var/run/reboot-required`) | 🔍 |
| I2 | Ghost | `cd /var/www/himandme && ghost version && ghost ls` | Ghost 6.75.0; CLI current; the site shows `running (production)` | 🔍 |
| I3 | Ghost config (filtered) | `sudo jq 'del(.database.connection.password, .database.connection.user, .mail.options.auth, .mail.options.apiKey) ' /var/www/himandme/config.production.json` | `url` is `https://himandme.my` (no trailing path; decide www vs apex); `server.host` is `127.0.0.1`; `database.client` is `mysql`; `paths.contentPath` is set; `mail.transport` is noted; `admin.url` is noted if set | 🔍 |
| I4 | Ghost health | `ghost doctor` (read-only checks) | All checks pass. Note any warnings about Node, folder permissions or systemd | 🔍 |
| I5 | Node | `node -v; which node` | v22.x LTS, the same binary that systemd runs | 🔍 |
| I6 | systemd | `systemctl status ghost_himandme-my --no-pager; systemctl is-enabled ghost_himandme-my` | `active (running)`, `enabled`, `User=ghost` (see `systemctl cat ghost_himandme-my`) | 🔍 |
| I7 | Recent errors | `sudo journalctl -u ghost_himandme-my --since "7 days ago" -p err --no-pager \| tail -50` | No repeated errors | 🔍 |
| I8 | Ownership and permissions | `ls -ld /var/www/himandme /var/www/himandme/content; sudo find /var/www/himandme/content ! -user ghost \| head` | Install directory owned by your user with `775`; `content/` and everything under it owned by `ghost:ghost`; the find prints nothing | 🔍 |
| I9 | Nginx config | `sudo nginx -t; ls -l /etc/nginx/sites-enabled/` | Syntax OK; himandme.my and himandme.my-ssl confs present (Ghost-CLI names) | 🔍 |
| I10 | Nginx proxy | `sudo grep -nE 'proxy_pass\|server_name\|client_max_body_size\|real_ip\|add_header' /etc/nginx/sites-available/himandme*` | `proxy_pass http://127.0.0.1:2368`; `client_max_body_size` ≥ 50m (image and theme uploads); note whether Cloudflare real-IP and security headers are set | 🔍 |
| I11 | TLS certificate | `sudo ls /etc/letsencrypt/himandme.my/ 2>/dev/null; echo \| openssl s_client -connect himandme.my:443 -servername himandme.my 2>/dev/null \| openssl x509 -noout -issuer -dates -subject` | A valid certificate for himandme.my (and www if used), not expiring within 30 days. Note whether it is Let's Encrypt (via Ghost-CLI's acme.sh) or a **Cloudflare Origin certificate** | 🔍 |
| I12 | Certificate renewal | `sudo crontab -l -u root \| grep -i acme` | An acme.sh renewal job exists if Let's Encrypt is used. **Renewal can fail behind the Cloudflare proxy** (risk R9) | 🔍 |
| I13 | HTTPS and redirects | `curl -sI http://himandme.my; curl -sI https://himandme.my; curl -sI https://www.himandme.my` | HTTP returns 301 to `https://himandme.my/`; www returns 301 to the apex (or the reverse, matching the Ghost `url`); one canonical host only | 🔍 |
| I14 | MySQL | `systemctl status mysql --no-pager; mysql --version` | Running, 8.0.x | 🔍 |
| I15 | DB connectivity | `ghost doctor` (above), plus the Admin loading without errors | Ghost connects. **Don't print the database credentials** | 🔍 |
| I16 | DB size and backup space | `df -h /var/www /var/lib/mysql; sudo du -sh /var/www/himandme/content` | Free disk ≥ 3× (database dump + content folder), for backups during the launch | 🔍 |
| I17 | Memory | `free -h` | ≥ 1 GB free or swap configured (Ghost plus MySQL on a small VPS) | 🔍 |
| I18 | Firewall | `sudo ufw status verbose` (and the Tencent Cloud security-group rules in the console) | Only 22 (or your SSH port), 80 and 443 open. 3306 and 2368 **not** open to the internet | 🔍 |
| I19 | Ports | `sudo ss -tlnp \| grep -E ':(80\|443\|2368\|3306)\b'` | 2368 and 3306 bound to `127.0.0.1` only | 🔍 |
| I20 | SSH | `sudo sshd -T \| grep -Ei '^(permitrootlogin\|passwordauthentication\|pubkeyauthentication)'` | `permitrootlogin no` (or `prohibit-password`), `passwordauthentication no`, `pubkeyauthentication yes` | 🔍 |
| I21 | Updates | `sudo unattended-upgrades --dry-run 2>/dev/null \| tail -3; apt list --upgradable 2>/dev/null \| wc -l` | Security updates applied or scheduled | 🔍 |
| I22 | DNS (Cloudflare dashboard, view only) | DNS → Records | `A himandme.my` → the VPS IP; `www` as CNAME or A; proxy status (orange or grey) noted; no stray old records | 🔍 |
| I23 | Cloudflare SSL (view only) | SSL/TLS → Overview | Mode **Full (strict)**. Never "Flexible", which causes redirect loops with Ghost | 🔍 |
| I24 | Cloudflare edge (view only) | SSL/TLS → Edge Certificates; Speed; Caching → Cache Rules | "Always Use HTTPS" on; **Rocket Loader off** (it rewrites the theme's scripts); no "Cache Everything" rule covering `/ghost/*`, `/members/*` or `/p/*` (previews) | 🔍 |
| I25 | Cloudflare security (view only) | Security → WAF / Bots | No rule that blocks Ghost Admin's API (`/ghost/api/admin/*`) or theme uploads | 🔍 |
| I26 | Ghost mail | Ghost Admin → Settings → (staff invite, password reset) | A working mail transport (needed for staff password resets). Members and newsletters are **not** used (section 5) | 🔍 |
| I27 | Current live content | Ghost Admin → Posts / Pages / Tags / Staff; Settings → Design (active theme name and version); Labs → Routes (download); Labs → Redirects (download) | An **inventory** of what is live now (section 3.1). Nothing changed | 🔍 |
| I28 | Network (ActivityPub) | Settings → Growth → Network | Note on or off. It **must be off before any import** (R2) | 🔍 |
| I29 | Membership | Settings → Membership → Access | Note the current value. Planned: "Nobody" (section 5) | 🔍 |

**How to send the results:** paste the outputs, or say "matches" or "differs" per row. If anything shows a password, key or token, remove it before pasting.

---

## 3. Content migration and test-data exclusion

### 3.1 Principle
**Production gets only content that was written for production.** The local development database (SQLite, 25 test articles, test staff account, "GAMBAR UJIAN" images) is **never exported, copied or imported**. No local Ghost export file is ever uploaded to himandme.my.

Before anything moves, record what is live now (I27): posts, pages, tags, staff users, theme, routes and redirects. Then decide, per item, **keep / replace / unpublish**. That decision is the owner's (✋ O19, see the checklist). Nothing is deleted in Stage 7 without a separate explicit approval.

### 3.2 What goes where

| Item | Method | Source | Status |
|---|---|---|---|
| 23 `#blok` content blocks (homepage 12, ED 8, shared 3) | **Import**, using the launch seed JSON generated from `seed/blocks.mjs` (G4) | Approved prototype copy plus the doctor's reviewed wording (`docs/CLINICAL-REVIEW.md`, no open ❓ items) | ✅ Content ready; generator to be built |
| Page **Disfungsi Ereksi** (`/disfungsi-ereksi/`, template `custom-disfungsi-ereksi`) | Import (same seed) | `seed/blocks.mjs` | ✅ |
| Page **jurnal** (route data for `/blog/` SEO) | Import (same seed) | `seed/blocks.mjs` | ✅ |
| Page **Notis Privasi** | Import (same seed) | Owner's text, `seed/pages/notis-privasi.txt` | ✅ Text supplied; ✋ final confirmation it's current (O14) |
| Dasar Editorial | **Not transferred.** No page and no links (owner decision) | n/a | ✅ Removed by decision |
| 7 category tags (incl. "Gaya Hidup & Minda", slug `gaya-hidup`) | **Manual** in Admin → Tags. The importer skips tags with no posts | README "Before launch: blog data" | ✋ Tag descriptions (O16) |
| Internal tags `#blok`, `#blok-utama`, `#blok-ed` | Created by the import | Seed | ✅ |
| `#popular`, `#tanpa-cta` | Manual, per article, when articles exist | Owner | ✋ |
| Primary and secondary navigation | **Manual** (Settings → Navigation) | README table | ✅ Defined |
| Theme settings (14) | **Manual** (Design → Theme) | Section 5, table E | ✋ Confirm values (O9–O13) |
| `routes.yaml` | **Manual** paste (Labs → Routes) | Repo, after G3 | ⛔ G3 |
| Doctor staff profile (name, photo, bio, slug) | **Manual** on the doctor's **production** staff account | Owner | ✋ O1–O4 |
| Articles | **Written directly in production Ghost Admin as drafts**, reviewed, then published (recommended). This avoids importer quirks such as the alternate quote style being lost | Owner | ✋ O7 |
| Feature and inline images | Uploaded with each article in Admin | Owner | ✋ O6 |
| Site meta, OG image, icon, language, timezone | Manual (Settings) | Section 6 | ✋ O15, O17 |

**Never transferred:** the local SQLite database; any local Ghost export; `test/**` fixtures; the "Artikel ujian 1–12" and 13 demo articles; "GAMBAR UJIAN" images; the local "Dr. Ujian Tempatan" account and the local doctor test profile; `#Import …` tags; and anything under `test/**/.local/`.

### 3.3 The production seed builder (G4): how test data is kept out
1. It reads **only** `seed/blocks.mjs` (BLOCKS and PAGES). It does not import anything from `test/`.
2. **Allowlist:** it refuses to write the file unless the slugs are exactly the 23 known `blok-*` slugs plus `disfungsi-ereksi`, `jurnal` and `notis-privasi`.
3. **Denylist:** it refuses if any slug, title or body matches `artikel-ujian`, `ujian`, `Teks contoh`, `GAMBAR UJIAN`, `Dr. Ujian`, `localhost`, `himandme.local`, or an author email that isn't a placeholder for the production owner.
4. It sets no authors. Ghost assigns imported posts to the importing user (the owner), so no local staff account is ever created.
5. It writes `dist/launch-seed.json` (git-ignored), and prints counts plus a checksum to record in the checklist.

### 3.4 Placeholder scanner (G5)
Runs on the theme files, the launch seed and, read-only, on the **rendered production pages** in Phase F/H. It fails on:

| Pattern | Exception |
|---|---|
| Any `[…]` square-bracket placeholder | Only `[Akta 709]` / `[Act 709]` (the legal citation in the Notis Privasi) |
| `ujian`, `Teks contoh`, `GAMBAR UJIAN`, `Dr. Ujian` | None |
| `[Nama Penuh]`, `[Peranan]` | None. This is the homepage team-card fallback, shown only when `doctor_author_slug` is empty or wrong |
| `Doktor yang sah` | None. This is the default `doctor_credentials`; it must become the verified value |
| `localhost`, `himandme.local`, `2368` | None |
| Any email address, or the words "e-mel"/"email" | None, on every public page (owner requirement) |

### 3.5 Separation proof (run in Phase F and again in H)
- Smoke test G6 crawls `sitemap.xml`, `/rss/`, `/blog/`, every topic page and the author page. **0 hits** from the scanner is required.
- Production post count = the number of articles the owner published + 23 blocks. Anything else is investigated before launch.

---

## 4. Theme deployment procedure (Phase D; not run now)

**Before**
1. On the release branch (after G1–G7): `npm ci && npm test` must pass the build, the `#blok` guard and GScan `--v6` with **0 errors and 0 warnings**.
2. Run `npm run test:stage1` … `test:stage6` against **local** Ghost. All must pass (previous run: 32/23/12/39/21/16, with 0 failures).
3. `npm run zip && npm run gscan:zip` must report 0 errors and 0 warnings on the zip itself.
4. Check that the zip holds no `test/`, `docs/`, `seed/`, `scripts/`, `node_modules/` or source maps, and that every file mode is ≥ `0644` (G2).
5. Record the zip's SHA-256 in the checklist.

**Upload and check (production, approval required)**

6. In Admin → Settings → Design → **Change theme → Upload theme**, choose `himandme-ghost-theme.zip`. **Do not activate in the same step.** Ghost's upload validation must show no errors. If a theme of the same name exists, stop and confirm before overwriting.
7. The **previous theme stays installed**. It is the immediate rollback.

**Cut-over (part of the launch window, section 9)**

8. Order (dependencies):
   - **Network off** (R2)
   - seed import
   - tags, navigation, theme settings and staff profile
   - **activate the theme**
   - **routes.yaml**
   - redirects (if any)
9. Purge the Cloudflare cache (owner, from the dashboard).

**Theme rollback (≤ 2 minutes):** re-activate the previous theme, then re-upload the previous `routes.yaml` and `redirects` downloaded in Phase C. Purge the cache.

---

## 5. Production configuration (Phase E; manual, in Ghost Admin)

| # | Setting | Value | Status |
|---|---|---|---|
| E1 | Settings → Growth → **Network** | **Off**, before any import | 🔍 I28 |
| E2 | Membership → Access ("Who should be able to subscribe") | **Nobody**. The site has no sign-up, Portal or member content | ✋ Confirm (O18) |
| E3 | Portal button, comments, newsletters, tips/donations, recommendations | **Off / none** | ✋ O18 |
| E4 | Publication language / timezone | `ms` / `Asia/Kuala_Lumpur` | ✅ |
| E5 | Title, description, meta | Site title "Him & Me"; homepage meta title and description | ✋ O15 |
| E6 | Site icon (favicon), social images | Owner's files; the theme has no favicon of its own | ✋ O17 |
| E7 | Navigation | Primary: Utama `/`, Disfungsi Ereksi `/disfungsi-ereksi/`, Blog `/blog/`. Secondary: 7 categories in the README order | ✅ |
| E8 | Theme settings | As below | ✋ |
| E9 | Routes | `routes.yaml` after G3 | ⛔ G3 |
| E10 | Integrations | Remove unused custom integrations, without exposing keys | 🔍 |
| E11 | Staff | Only real people. Owner role on the doctor's or the business account. 2FA/"staff device verification" on | 🔍 |

**Theme settings (E8).** Repository defaults are shown. Every value needs your confirmation; none is assumed correct.

| Setting | Repo default | Launch value |
|---|---|---|
| `city` | Setiawangsa | ✋ confirm |
| `whatsapp_number` | 601157912606 | ✋ confirm |
| `whatsapp_default_message` | Salam, saya ingin bertanya tentang perkhidmatan Him & Me. | ✋ confirm |
| `phone_display` | 011-5791 2606 | ✋ confirm |
| `address_short` | Eight Setiawangsa, Kuala Lumpur | ✋ confirm |
| `google_maps_url` | (empty) | ✋ supply, or leave empty |
| `opening_hours_short` | Isnin – Sabtu, 10 pagi – 6 petang · dengan temu janji sahaja | ✋ confirm (verified 5 Nov) |
| `offer_price` | RM288 | ✋ confirm still running at launch |
| `consultation_fee` | RM150 (percuma dengan First Trial) | ✋ confirm |
| `shockwave_price` | RM450 / sesi | ✋ confirm |
| `kegel_ems_price` | RM350 / sesi | ✋ confirm |
| `show_prices` | true | ✋ confirm |
| `doctor_author_slug` | (empty) | ⛔ the real staff slug (O4). If empty, the homepage shows "[Nama Penuh]" |
| `doctor_credentials` | Doktor yang sah | ✋ "MD (UKM)" as you stated. Please confirm the exact text |

---

## 6. SEO audit

| ID | Item | Current state (theme, verified locally) | Action | Status |
|---|---|---|---|---|
| S1 | `sitemap.xml` | Ghost generates it. `#blok` blocks are excluded (Stage 1) | After launch: check it lists `/`, `/disfungsi-ereksi/`, `/notis-privasi/`, `/blog/`, articles, topics and author | 🔍 (Phase H) |
| S2 | `/jurnal/` in `sitemap-pages.xml` | The data page for `/blog/` is a published page, so Ghost lists it. It 301-redirects to `/blog/` | Acceptable (Search Console will report "page with redirect"). Optional: noindex it via its meta | ✅ Known, low |
| S3 | `robots.txt` | Ghost default (disallows `/ghost/`, `/p/`, `/email/`, `/r/`), with a sitemap line | Verify it is **not** "Disallow: /", and that the site is not left in private mode | 🔍 |
| S4 | Canonical URLs | `{{ghost_head}}` emits a canonical on every page; pagination is handled | Verify the host is the canonical one (I13) | 🔍 |
| S5 | Meta title and description | Home: Settings meta. `/blog/`: the `jurnal` page meta. Pages and articles: their own meta fields. Topics and author: tag and profile descriptions | ✋ O15, O16; each article's meta when written | ✋ |
| S6 | Open Graph and X images | Articles use their feature image. A site default is needed for the home and pages | ✋ O17 (default 1200×630 image) | ✋ |
| S7 | Structured data | Ghost outputs JSON-LD (Article, WebSite, Person/author) | Optional later: a `MedicalBusiness`/`LocalBusiness` block using only owner-confirmed facts (address, hours, phone). Not added without your approval | ✋ Decision O21 |
| S8 | Author signals | Byline "Ditulis dan disemak oleh {name}", credentials, author page and bio | Real profile (O1–O4); optional social and website links on the profile | ✋ |
| S9 | Internal links | Navigation, topic bar, tiles, "Baca seterusnya", "Panduan berkaitan", CTAs to the ED page | Verify there are no 404s (smoke test G6 follows every internal link) | 🔍 |
| S10 | Redirects from the old site | Unknown: depends on what is live now (I27) | Map every old URL that is indexed or linked to its new URL in `redirects.yaml`. Check Search Console or the old sitemap | ✋ O20 |
| S11 | Search Console | n/a | Domain property verified by a **DNS TXT record in Cloudflare** (a DNS change: owner action, Phase H). Submit `sitemap.xml` | ✋ approval |
| S12 | Analytics | None in the theme | Choose: none / Cloudflare Web Analytics (cookieless) / GA4. Any choice that sets cookies or tracks people must be described in the Notis Privasi first | ✋ O22 |
| S13 | Performance | Built CSS/JS minified; responsive images; fonts preloaded | Lighthouse run in Phase F (mobile) | 🔍 |
| S14 | Private mode | n/a | If private mode is used during the cut-over (R1), **turn it off** at launch, or Google sees noindex | 🔍 |

---

## 7. Functional and security tests

**Local (before release):** the full Stage 1–6 suites, GScan, the guard and the visual comparison. These are the only tests that edit data, and they **refuse any host other than localhost.**

**Never** run `test:stage1`–`test:stage6` against production. Production only gets the read-only smoke test (G6) and manual checks.

### 7.1 Production functional checklist (Phase F, then again in H)
- **Pages:**
  - `/`, `/disfungsi-ereksi/`, `/blog/`, `/blog/topik/{each of 7}/`, `/blog/penulis/{slug}/`, `/notis-privasi/` and one article each return 200, with no placeholder hits (3.4).
  - `/jurnal/` returns 301 to `/blog/`.
  - An unknown URL returns 404 with the theme's error page.
- **Homepage:**
  - Every block section shows the real copy, not the fallback.
  - The team card shows the real doctor (not "[Nama Penuh]").
  - The offer card shows the confirmed price.
- **ED page:** FAQ toggles open; the WhatsApp booking form opens WhatsApp with the confirmed number and message.
- **Blog:** features, Paling dibaca, tiles, "Muatkan lagi" and search work. **Search results contain articles only.**
- **Article:** byline, credentials, contents, progress bar, copy link, WhatsApp share, related lists, `#tanpa-cta`.
- **Phone (390px):** no horizontal scroll; the sticky booking bar works.
- **Without JavaScript:** content is readable.

### 7.2 `#blok` exclusion: re-confirmed on production

| Check | Expected |
|---|---|
| `/blog/`, `/rss/`, `/blog/rss/`, topic pages, author page | No block title or slug |
| `sitemap-posts.xml` | No `blok-` URL |
| `/blog/blok-utama-hero/` (and every block slug) | 404 |
| `/blog/topik/hash-blok/` | 404 (internal tags have no archive) |
| Public search index, as filtered by the theme | No result for a block title (for example the hero heading) |
| Author page | Only articles (this is why G3 is required) |
| Network | Off, so blocks are never federated |

### 7.3 Security checks
- HTTPS everywhere (I11–I13, I23).
- Response headers, ideally:
  - `Strict-Transport-Security`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy`
  - `X-Frame-Options: SAMEORIGIN`

  Do **not** apply a strict CSP to `/ghost/`. It breaks Admin.
- `config.production.json`, `.git`, `content/data` and `content/logs` are not reachable over HTTP (expect 404).
- Members endpoints and sign-up are unused; Portal is not loaded.
- Firewall and SSH (I18–I20). Staff 2FA and strong passwords (E11).
- No email address or the words "e-mel"/"email" in any public HTML (owner rule).
- The Content API key in the page source is **public by design** (it is read-only). No Admin API key is ever placed in the theme.

---

## 8. Backup and rollback plan

**Phase C backups (owner runs them; output stays on the server or the owner's computer and is never shared in chat):**

| # | Backup | How | Restores |
|---|---|---|---|
| C1 | **VPS snapshot** | Tencent Cloud console → instance → Snapshots → create (name it `pre-launch-YYYYMMDD`) | The whole server: fastest full rollback |
| C2 | Ghost content export | Admin → Settings → Advanced → Import/Export → **Export** (JSON) | Posts, pages, tags and settings |
| C3 | Ghost-CLI backup | `cd /var/www/himandme && ghost backup` | Content, images, themes, routes and settings (zip in the install folder) |
| C4 | MySQL dump | `mysqldump --single-transaction --routines <db_name> > ~/backup/ghost-pre-launch.sql`. Credentials are entered by you at the prompt (`-p`) or come from `~/.my.cnf`, and are **never typed into a shared document** | The exact database |
| C5 | Files | `sudo tar czf ~/backup/content-pre-launch.tgz -C /var/www/himandme content`, plus a copy of `/etc/nginx/sites-available/himandme*` | Images, themes and config |
| C6 | Current theme, routes and redirects | Admin: Design → download the active theme; Labs → download routes and redirects | Theme-level rollback |
| C7 | Copy off-server | Download C2–C6 to your own computer | Survives loss of the VPS |
| C8 | **Test the restore** | Restore C2 into a throw-away local Ghost and check that it opens. Never restore into production as a "test" | Proves the backup works |

**Rollback triggers (any one):**
- the site is down for more than 5 minutes;
- a `#blok` block is publicly visible;
- test content or a placeholder is visible;
- Admin is inaccessible;
- an incorrect price or contact number is shown.

**Rollback levels**

| Level | What | Time |
|---|---|---|
| 1 | Re-activate the previous theme and re-upload the old routes and redirects (C6), then purge the cache | Minutes |
| 2 | Unpublish (not delete) the imported blocks and pages, or turn on private mode, while investigating | Minutes |
| 3 | Restore the database (C4) and `content/` (C5), then `ghost restart` | ~30 min |
| 4 | Restore the VPS snapshot (C1) | ~30–60 min; loses anything after the snapshot |

**Fallbacks:** if the blocks are missing, the theme still renders its built-in fallback copy (tested in Stages 2–4). The site never goes blank.

---

## 9. Launch sequence (phases A–H)

🛑 = **owner approval checkpoint**. Nothing passes a checkpoint without your written "approved".

| Phase | Work | Depends on | Who | Checkpoint |
|---|---|---|---|---|
| **A. Preparation and audit** | Run I1–I29 (read-only) and send the results. Inventory the live site (I27). Supply the inputs in the checklist, section 4 (O1–O26). Decide the merge option (1.3), analytics and the old-site plan | This plan approved | Owner (server checks); me (review results, update the risk register) | 🛑 **A-gate:** infrastructure audit accepted; owner inputs complete or explicitly deferred |
| **B. GitHub merge and release preparation** | Merge PRs per the chosen option. Open the missing Stage 4 and 6 PRs only if Option A. Release branch: G1–G7. Full local test run. Build the zip and the launch seed. Placeholder scan on both | A-gate | Me (code and PRs only after approval); owner (merges, or approves each merge) | 🛑 **B-gate:** `main` = approved Stage 6 plus release changes; tests green; zip and seed checksums recorded |
| **C. Production backup** | C1–C8 | B-gate | Owner | 🛑 **C-gate:** backups exist, are copied off the server, and the restore has been tested |
| **D. Theme and content deployment** | In a pre-announced window, optionally in private mode: Network off → upload the theme (no activation) → import the launch seed → tags, navigation, staff profile → activate the theme → routes → redirects | C-gate | Owner in Admin, following the step list; me guiding live | 🛑 **D-gate:** each step's check passes before the next |
| **E. Production configuration** | E1–E11, theme settings, meta, icon, OG image | D | Owner | (part of the D/E window) |
| **F. Staging and functional testing** | Private-mode verification on production (or a local rehearsal first, see R1): smoke test G6, section 7 checklists, placeholder scan, Lighthouse, phone checks | E | Me (read-only test); owner (visual review) | 🛑 **F-gate:** every check is green; screenshots reviewed |
| **G. Final launch approval** | Go/no-go review: risk register, open items, rollback ready | F-gate | Owner | 🛑 **G-gate: written "launch approved"** |
| **H. Public launch and post-launch verification** | Turn private mode off (if used) → purge the cache → run the smoke test again → Search Console (TXT record, owner) and submit the sitemap → watch logs and errors for 48 h → re-check at 7 days | G-gate | Owner (dashboard actions); me (read-only checks) | 🛑 **H-gate:** sign-off at 48 h; Stage 7 closed |

**Critical path:** O4 (doctor's slug) → G3 (routes) → B-gate → C → D → E → F → G → H. Articles (O7) are **not** on the critical path. The site can launch with zero articles: the blog pages show their empty states. But the blog navigation then leads to empty pages, so it is your choice (O23) whether to launch with a minimum number of articles.

---

## 10. Risk register

| ID | Risk | Severity | Mitigation | Status |
|---|---|---|---|---|
| R1 | Blocks imported while the **old theme** is still active become public posts (old listings, RSS, sitemap) | **High** | Import only inside the cut-over window, with private mode on or with the theme activated first. The theme falls back gracefully; `/blog/` needs the `jurnal` page, so the order is import → activate → routes within minutes, in private mode | ✋ Approve private mode during the window |
| R2 | Ghost Network on: imported or published blocks federate to the fediverse and **can't be recalled** | **High** | Network off and verified (I28) before any import or publish | 🔍 |
| R3 | Test content or placeholders reach production | **High** | Seed allowlist and denylist (3.3); placeholder scanner (3.4); a local export is never used; post-count check (3.5) | ✅ Planned |
| R4 | Wrong author slug in `routes.yaml`: the author page lists blocks, or returns 404 | **High** | G3 blocked until O4; F-gate check 7.2 | ⛔ O4 |
| R5 | `doctor_author_slug` empty or wrong: "[Nama Penuh]" on the homepage | Medium | Set in E8; scanner catches it | ✋ |
| R6 | Stacked PRs merged as they are: `main` misses stages | Medium | 1.3 order, merge commits, `git diff stage-6 main` check | ✅ Planned |
| R7 | Cloudflare "Flexible" SSL or Rocket Loader: redirect loops or broken scripts | Medium | I23–I24 | 🔍 |
| R8 | Cloudflare caches `/ghost/` or previews: stale Admin or private previews leaked | Medium | I24; a bypass rule if needed | 🔍 |
| R9 | Let's Encrypt renewal fails behind the Cloudflare proxy, and the certificate expires | Medium | Prefer a Cloudflare Origin certificate with Full (strict), or confirm acme.sh renewal works (I11–I12) | 🔍 |
| R10 | Old URLs 404 after launch: lost rankings and links | Medium | Redirect map (S10) | ✋ O20 |
| R11 | Running destructive tests against production | **High** | The suites refuse non-localhost hosts (already enforced); production uses the GET-only smoke test | ✅ |
| R12 | Credentials exposed during the audit or backup | **High** | Filtered config command; never `cat` the config; secrets never in chat or the repo | ✅ Planned |
| R13 | Importer side-effects: `#Import` tag; tags without posts skipped; alternate quote lost | Low | Tags created by hand; articles written in Admin; `#Import` tag removed after checks (with approval) | ✅ Known |
| R14 | Mail not configured: no staff password reset | Low | I26 | 🔍 |
| R15 | Disk full during backups | Medium | I16 | 🔍 |
| R16 | Analytics added without a privacy-notice update (PDPA) | Medium | O22 decided before launch; Notis Privasi updated by the owner first | ✋ |
| R17 | Prices, offer or hours out of date at launch | Medium | Confirm E8 in Phase A and again at the G-gate | ✋ |
| R18 | Logo files are owner-read-only in the zip | Low | G2 | ✅ Fix ready |
| R19 | Launching with no articles: empty blog sections | Low | Owner decision O23 | ✋ |
| R20 | `/jurnal/` listed in the sitemap as a redirect | Low | Accept, or noindex (S2) | ✅ Known |

---

## 11. Execution sequence and dependencies (summary)

```
Plan approved
  └─ A: infra checks I1–I29 + live inventory I27 + owner inputs O1–O26
       └─ A-gate
            └─ B: merges (1.3) → release branch G1–G7 → local tests → zip + seed + scans
                 └─ B-gate
                      └─ C: snapshot + exports + dump + files → restore test
                           └─ C-gate
                                └─ D/E window: Network off → upload theme → import seed → tags/nav/staff
                                │              → settings → activate theme → routes → redirects
                                └─ F: smoke + #blok + placeholder + manual + phone + Lighthouse
                                     └─ F-gate → G: go/no-go (G-gate)
                                          └─ H: public → cache purge → re-verify → Search Console → 48 h / 7 d
```

**Not started. Waiting for your approval of this plan.** Once it is approved, I will begin Phase A only: preparing the inputs, and reviewing the infrastructure results you send. Every later phase starts only after its own 🛑 approval.
