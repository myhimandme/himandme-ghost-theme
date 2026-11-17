# Stage 7 plan: production readiness and launch preparation

> **Status: PLAN ONLY. Revision 3 (17 Nov 2026), the final corrections for review. Phase A has NOT started and waits for the owner's explicit approval.**
> Nothing in this document has been carried out.
> - No pull request was merged, created or changed. No existing branch was modified.
> - The live VPS, Ghost, DNS and Cloudflare were not touched.
> - Nothing was imported, published or activated, and no test data was deleted.
>
> This file and `docs/STAGE-7-CHECKLIST.md` live on a new docs-only branch, `stage-7-plan`, based on `stage-6`.
>
> **Revision 2: what changed after the owner's review**
>
> | # | Review point | Result | Where |
> |---|---|---|---|
> | 1 | Block count (22 or 23?) | **23**, from the source: 12 homepage, 8 ED, **3** shared. The third shared block, `blok-tawaran`, was added on 5 Nov 2026 for the approved RM288 offer. Nothing was added or removed | §3.2 |
> | 2 | Protection during migration | **Private mode is mandatory** from before the import until the final launch approval. Measured on local Ghost 6.75.0: it protects the **website** (every page, archive, RSS feed, sitemap and block URL). It does **not** protect the **Content API**, which still returns the published blocks to anyone holding the public key (see revision 3) | §3.6, §4, §9 |
> | 3 | Author archive | **Tested** with a non-placeholder slug: 15/15 checks. Two dangers were proven, and the plan now prevents both: (a) `routes.yaml` not updated, giving 46 block leaks; (b) a second staff account that authors blocks. Ghost's importer gives imported posts to the **Owner** account | §3.7, R4, R21 |
> | 4 | Backup and rollback | **Rehearsed** on MySQL 8.0.46 (the Ubuntu 24.04 package) with Ghost 6.75.0. One command fix found: `--no-tablespaces`. The database restore and the independent theme and routes rollback were both shown to work. `ghost backup` checked against the Ghost-CLI 1.34.1 source: it needs a staff access token and does **not** contain the database | §8 |
> | 5 | Open assumptions and decisions | Listed in one place | §12 |
>
> **Revision 3: final corrections (17 Nov 2026)**
>
> | # | Correction | Where |
> |---|---|---|
> | 1 | Content API wording corrected. The API **can** list published posts as a collection, so someone holding the public key can retrieve all published blocks during the migration. Private mode protects the website, not the API. O27 rewritten | §3.6, R22, §12 |
> | 2 | Restore-test command corrected: the disposable database is created first and named as an argument (no `<…>` placeholders that the shell would read as redirects) | §8.2 C8, §8.4 level 3, C4 |
> | 3 | Structured data: `LocalBusiness` recommended; `MedicalBusiness` and its subtypes are **not** assumed and need the owner's evidence | §6 S7, O21 |
> | 4 | After private mode is enabled and the Cloudflare cache purged: **mandatory anonymous checks through the real domain**, covering every URL that was public before (saved in C10), with `cf-cache-status` inspected. The import may not start until they pass | §3.6 D1–D2b, C10, R26 |
> | 5 | Consistency review of both documents (section 13 of this plan) | §13 |
>
> New automated checks (local Ghost only; they refuse any other host): `test/stage7/author-archive.mjs` (15 checks) and `test/stage7/private-mode.mjs` (12 checks), run with `npm run test:stage7`. Stage 1 was re-run afterwards: 32 passed, 0 failed.

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
| G6 | Add `test/prod/smoke.mjs`: a **read-only** production check (GET requests only, no Admin login, no edits). Modes: `--expect-private` (D2b: every URL must redirect to `/private/`, with `cf-cache-status` checked), with the private-site cookie (F), and anonymous (H3) | D2b, Phase F and H verification | ✅ Ready to build |
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
| I2 | Ghost and Ghost-CLI | `cd /var/www/himandme && ghost version && ghost ls` | Ghost 6.75.0; **Ghost-CLI version noted** (the backup procedure was checked against 1.34.1); the site shows `running (production)` | 🔍 |
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
| I24 | Cloudflare edge (view only) | SSL/TLS → Edge Certificates; Speed; Caching → Cache Rules | "Always Use HTTPS" on; **Rocket Loader off** (it rewrites the theme's scripts); no "Cache Everything" rule or edge-TTL override covering HTML, `/ghost/*`, `/members/*` or `/p/*` (previews); **Always Online off**; note whether Cache Reserve is on. Otherwise cached old pages could still be served during private mode (R26) | 🔍 |
| I25 | Cloudflare security (view only) | Security → WAF / Bots | No rule that blocks Ghost Admin's API (`/ghost/api/admin/*`) or theme uploads | 🔍 |
| I26 | Ghost mail | Ghost Admin → Settings → (staff invite, password reset) | A working mail transport (needed for staff password resets). Members and newsletters are **not** used (section 5) | 🔍 |
| I27 | Current live content | Ghost Admin → Posts / Pages / Tags / Staff; Settings → Design (active theme name and version); Labs → Routes (download); Labs → Redirects (download) | An **inventory** of what is live now (section 3.1). Nothing changed | 🔍 |
| I28 | Network (ActivityPub) | Settings → Growth → Network | Note on or off. It **must be off before any import** (R2) | 🔍 |
| I29 | Membership | Settings → Membership → Access | Note the current value. Planned: "Nobody" (section 5) | 🔍 |
| I30 | MySQL backup access (no secrets) | `sudo mysql -e "SELECT user, plugin FROM mysql.user WHERE user='root'; SELECT @@character_set_server, @@collation_server; SELECT table_schema, ROUND(SUM(data_length+index_length)/1024/1024,1) AS mb FROM information_schema.tables GROUP BY table_schema;"` | root uses `auth_socket` (so `sudo mysqldump` needs no password); `utf8mb4`; database size noted | 🔍 |
| I31 | Staff accounts and Owner | Admin → Settings → Staff (look only) | Which account has the **Owner** role; every staff slug; no test or unknown accounts (§3.7) | 🔍 |

**How to send the results:** paste the outputs, or say "matches" or "differs" per row. If anything shows a password, key or token, remove it before pasting.

---

## 3. Content migration and test-data exclusion

### 3.1 Principle
**Production gets only content that was written for production.** The local development database (SQLite, 25 test articles, test staff account, "GAMBAR UJIAN" images) is **never exported, copied or imported**. No local Ghost export file is ever uploaded to himandme.my.

Before anything moves, record what is live now (I27): posts, pages, tags, staff users, theme, routes and redirects. Then decide, per item, **keep / replace / unpublish**. That decision is the owner's (✋ O19, see the checklist). Nothing is deleted in Stage 7 without a separate explicit approval.

### 3.2 What goes where

| Item | Method | Source | Status |
|---|---|---|---|
| 23 `#blok` content blocks: homepage 12, ED 8, shared 3 (table below) | **Import**, using the launch seed JSON generated from `seed/blocks.mjs` (G4) | Approved prototype copy plus the doctor's reviewed wording (`docs/CLINICAL-REVIEW.md`, no open ❓ items) | ✅ Content ready; generator to be built |
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

**The 23 content blocks, exactly as in `seed/blocks.mjs` (`BLOCKS`, counted from the file on 17 Nov 2026):**

| # | Slug | Category | Tags | Used on |
|---|---|---|---|---|
| 1 | `blok-maklumat-hubungan` | Shared (site-wide) | `#blok` | Contact details in the footers and contact areas |
| 2 | `blok-penafian` | Shared (site-wide) | `#blok` | Medical disclaimer |
| 3 | `blok-tawaran` | Shared (offer) | `#blok` | First Trial offer card and bar (homepage, ED page, booking form). Price comes from `offer_price`, never from the block |
| 4 | `blok-utama-hero` | Homepage | `#blok`, `#blok-utama` | Hero |
| 5 | `blok-utama-kenyataan` | Homepage | `#blok`, `#blok-utama` | Statement band |
| 6 | `blok-utama-perkhidmatan` | Homepage | `#blok`, `#blok-utama` | Services heading |
| 7 | `blok-utama-servis-konsultasi` | Homepage | `#blok`, `#blok-utama` | Service tile: consultation |
| 8 | `blok-utama-servis-shockwave` | Homepage | `#blok`, `#blok-utama` | Service tile: shockwave |
| 9 | `blok-utama-servis-kegel-ems` | Homepage | `#blok`, `#blok-utama` | Service tile: Kegel EMS |
| 10 | `blok-utama-proses` | Homepage | `#blok`, `#blok-utama` | Process steps |
| 11 | `blok-utama-privasi` | Homepage | `#blok`, `#blok-utama` | Privacy section |
| 12 | `blok-utama-pasukan` | Homepage | `#blok`, `#blok-utama` | Team heading |
| 13 | `blok-utama-blog` | Homepage | `#blok`, `#blok-utama` | Blog teaser heading |
| 14 | `blok-utama-faq` | Homepage | `#blok`, `#blok-utama` | FAQ |
| 15 | `blok-utama-cta` | Homepage | `#blok`, `#blok-utama` | Closing call to action |
| 16 | `blok-ed-apa` | ED page | `#blok`, `#blok-ed` | What ED is |
| 17 | `blok-ed-punca` | ED page | `#blok`, `#blok-ed` | Causes |
| 18 | `blok-ed-penilaian` | ED page | `#blok`, `#blok-ed` | Assessment |
| 19 | `blok-ed-shockwave` | ED page | `#blok`, `#blok-ed` | Shockwave |
| 20 | `blok-ed-kegel-ems` | ED page | `#blok`, `#blok-ed` | Kegel EMS |
| 21 | `blok-ed-perbandingan` | ED page | `#blok`, `#blok-ed` | Comparison |
| 22 | `blok-ed-faq` | ED page | `#blok`, `#blok-ed` | FAQ |
| 23 | `blok-ed-temujanji` | ED page | `#blok`, `#blok-ed` | Booking |

Plus 3 **pages** (not blocks): `disfungsi-ereksi`, `jurnal`, `notis-privasi`.

**Reconciliation with the earlier figure of 22 (12 + 8 + 2):** that count predates Stage 4.
- The approved RM288 First Trial offer added a third shared block, `blok-tawaran`, in commit `f884fb2` (5 Nov 2026, "Stage 4: RM288 First Trial offer").
- The Stage 4 report recorded it ("now 23 blocks, incl. `blok-tawaran`"), and its wording was accepted in `docs/CLINICAL-REVIEW.md` D1–D5.
- Since then, Stage 1 has run against all 23 (32/0).
- **The architecture record should read 23 = 12 + 8 + 3.** Nothing was added or removed to make the numbers match.

### 3.3 The production seed builder (G4): how test data is kept out
1. It reads **only** `seed/blocks.mjs` (BLOCKS and PAGES). It does not import anything from `test/`.
2. **Allowlist:** it refuses to write the file unless the slugs are exactly the 23 known `blok-*` slugs plus `disfungsi-ereksi`, `jurnal` and `notis-privasi`.
3. **Denylist:** it refuses if any slug, title or body matches `artikel-ujian`, `ujian`, `Teks contoh`, `GAMBAR UJIAN`, `Dr. Ujian`, `localhost`, `himandme.local`, or an author email that isn't a placeholder for the production owner.
4. It writes no author records, so no local staff account can be created. **Verified in the Ghost 6.75.0 importer source** (`importers/data/base.js`): a post without an author is given to the account with the **Owner** role, not to the person who clicks Import. See §3.7 for why that matters.
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

### 3.6 Content protection during migration: private mode is MANDATORY

**Rule:** the site is in Ghost's private mode (Settings → General settings → **Make this site private**) **before** the first block is imported. It stays private until the owner's written launch approval (G-gate). No alternative is offered: the only other approach considered (import the blocks as drafts and publish them after the new theme and routes are live) was **not tested**, so it is not proposed.

**Measured on local Ghost 6.75.0** (`test/stage7/private-mode.mjs`, 12/12; private mode switched on, anonymous requests, then restored):

| Surface (anonymous visitor) | While private | Check |
|---|---|---|
| Every page and archive: `/`, `/blog/`, `/blog/page/2/`, the ED page, Notis Privasi, an article, topic and author archives, `/jurnal/` | 302 to the password page `/private/` | P1 |
| RSS: `/rss/`, `/blog/rss/`, topic and author RSS | 302; no item, no block title | P2 |
| Sitemaps: `sitemap.xml` and all 4 sub-sitemaps | 302; no `<loc>`, no `blok-` URL | P3 |
| `robots.txt` | `Disallow: /` | P4 |
| Block URLs (`/blog/blok-…/`, `/blok-…/`, `/p/blok-…/`) | 302; never the block | P5 |
| ActivityPub (webfinger, actor) | 302 (Network must still be **off**) | P9 |
| The private password page | Does **not** reveal the Content API key | P8 |
| Caching | `Cache-Control: no-cache, private, no-store`, so Cloudflare does not cache it | P11 |
| Owner with the private-site password | Sees the whole new site: homepage and blog render | P10 |
| **Content API** (`/ghost/api/content/…?key=…`) and its search index | **Not protected.** Still answers (200) for anyone holding the 26-character public key. One request listed **all 23 published blocks** as a collection; the search index returned every published post | P6, P7 |

**Website protection versus API access: two different things.**
- **What private mode protects:** the **website**, meaning what Ghost renders for browsers and crawlers: pages, archives, RSS feeds, sitemaps and post URLs (rows P1–P5 above). Nothing there shows a block while the site is private.
- **What private mode does not protect:** Ghost's **Content API**. It is a separate, read-only interface. It returns **collections** of published posts and pages (filterable, paginated, `limit=all`) plus a search index, to anyone who sends the site's public Content API key.
  - Measured locally with private mode on: one request returned all 23 published blocks, and their full text was available.
  - After the import, the same applies to the 3 imported pages and to any article published during the window.
- **Who can do this:** anyone holding the key. Private mode does not show the key (P8), but the key is not secret.
  - It is the same key the old live theme may already show in its page source (Ghost's search script normally does; AS5).
  - Anyone who saw it before D1 can still use it.
  - Search engines do not crawl the API, and it does not appear in sitemaps or RSS.
- **What could be retrieved during the migration:** every **published** post and page: the 23 blocks, the 3 pages, and any article already published.
  - Drafts are never returned. Test content is never imported.
  - The blocks are approved public copy that the API serves the same way after launch (Stage 1 design: "content blocks are public copy only").
- **Ghost has no Admin setting** to switch the Content API off, and private mode does not change it.

**Owner decision O27:** during the migration, someone with the public Content API key can retrieve the published blocks (and the 3 pages) through the API, even though the website is private.
- **Recommended: accept this.** The residual exposure is limited to approved public copy that becomes public at launch anyway.
- **Or:** state a stricter requirement before Phase D. For example, no article may be published until H1.

Private mode is **not** described anywhere in this plan as hiding the blocks completely.

**Exact cut-over sequence (Phase D–H).** Each step's check must pass before the next. Times are for one window of about 60–90 minutes.

| Step | Action (owner, in Ghost Admin or the Cloudflare dashboard) | State of the public site | Check before going on |
|---|---|---|---|
| D0 | (Before the window, already done in C) Backups C1–C10, including the **list of every currently public URL** (C10). Theme zip **uploaded, not activated** (harmless: an inactive theme is never served) | Old site, public | Upload validation shows 0 errors; `old-urls.txt` saved |
| D1 | **Turn private mode ON.** Set a long private-site password; keep it with the owner only | **Private** at the origin from here | — (checked at D2b, after the purge) |
| D2 | Purge the Cloudflare cache (Caching → Configuration → **Purge Everything**) | Private | Wait about 30 seconds |
| D2b | **Mandatory anonymous checks through the real public domain** (below) | Private | **All pass.** Otherwise purge again and repeat. If they still fail, **stop: nothing is imported** |
| D3 | Settings → Growth → **Network OFF** (I28) | Private | The toggle shows off |
| D4 | Staff: confirm which account is **Owner**, and the doctor's final staff slug (§3.7) | Private | Owner account noted |
| D5 | **Import** `launch-seed.json` (23 blocks + 3 pages) | Private | Posts filtered by `#blok`: exactly 23 |
| D6 | Tags (7), staff profile (photo, bio, slug), navigation | Private | — |
| D7 | **Activate the new theme** | Private | Owner (logged in with the private password) sees the homepage |
| D8 | Theme settings (E8), including `doctor_author_slug` = the staff slug | Private | Homepage team card shows the doctor, not "[Nama Penuh]" |
| D9 | **Upload `routes.yaml`**, rendered with the real slug (and an extra channel if §3.7 case B applies) | Private | Labs → Routes download matches the release file |
| D10 | Redirects (if O20 lists any) | Private | — |
| E | Remaining production configuration (§5) | Private | — |
| F | Review and testing **while still private**: the smoke test and the §7 checks run with the private-site cookie (on the owner's computer, or here if the network allows); visual review by the owner | Private | F-gate |
| G | Go/no-go | Private | **G-gate: written "launch approved"** |
| H1 | **Turn private mode OFF** | **Public from here** | — |
| H2 | Purge the Cloudflare cache (Purge Everything) | Public | Wait about 30 seconds |
| H3 | Anonymous checks **through https://himandme.my**: smoke test, `#blok` exclusion (§7.2), placeholder scan; every C10 URL either serves the new site or redirects (O20); no `/private/` redirects remain | Public | If anything fails: **turn private mode back on at once** (rollback level 2), then investigate |

**D2b: anonymous checks through the public domain (mandatory, after the purge, before D3).**

Run these on a computer that is **not** logged into Ghost Admin and has **not** entered the private-site password. Use `curl` (it sends no cookies), plus a fresh private/incognito browser window. They go through `https://himandme.my`, so through Cloudflare, not to the server directly.
1. **Every URL that was public before the window** (the C10 list):
   ```bash
   while read -r u; do curl -s -o /dev/null -w '%{http_code} cf=%header{cf-cache-status} -> %{redirect_url}  %{url}\n' "$u"; done < ~/backup/old-urls.txt > ~/backup/private-check.txt; grep -vc ' -> https://himandme.my/private/' ~/backup/private-check.txt
   ```
   `%header{}` needs curl 7.84 or later; Ubuntu 24.04 has 8.5.
2. **Fixed list, including host and protocol variants:**
   - `https://himandme.my/`, `/rss/`, `/sitemap.xml`, `/sitemap-posts.xml`, `/robots.txt`
   - `http://himandme.my/`, `https://www.himandme.my/`
   - one old article URL with a query string added (`?v=1`)

**Pass criteria:**

| Check | Pass |
|---|---|
| Every C10 URL and every fixed-list page/feed/sitemap | `302` to `https://himandme.my/private/…`. The count printed by command 1 is **0** |
| Any `200`, `304`, or a body with the old content | **Fail.** A cached or still-public page |
| `cf-cache-status` | Never `HIT`, `STALE`, `UPDATING` or `REVALIDATED` (expected: `DYNAMIC`, `BYPASS`, `MISS` or `EXPIRED`) |
| `robots.txt` | Contains `Disallow: /` |
| `http://` and `www` | Redirect to `https://himandme.my/…`, which then redirects to `/private/` |
| Incognito browser: `/`, an old article, `/blog/` (or the old blog index) | Shows the password page, never old content |

**If anything fails:**
- Purge again and re-run.
- If a URL still serves content, check the Cloudflare settings that keep copies at the edge (I24: Cache Rules with an edge TTL, "Cache Everything", **Always Online**, Cache Reserve).
- Do not import until every line passes.

The same anonymous, public-domain checks are repeated at H3 after private mode is turned off. There, the pass criterion is the **new** site with no stale private redirects.

If the window has to stop between D1 and H1, the site **stays private** (or goes back to the previous state via rollback level 1 or 3). It is never made public half-migrated.

### 3.7 Author archive: verified, and two rules that follow from it

**What `routes.yaml` does:**
- It gives the doctor's archive `/blog/penulis/{slug}/` a **filtered channel**: `authors:{slug}+tag:-hash-blok`.
- It keeps the author **taxonomy** only so that author links point to `/blog/penulis/…`.
- **Ghost's taxonomy archives ignore collection filters** (found in Stage 1), so any author page *not* covered by a channel lists everything that author wrote, blocks included.

**Why the earlier tests were not enough:** the local test profile's slug is `dr`, the same as the placeholder in `routes.yaml`. A wrong slug could not have shown up.

**New test `test/stage7/author-archive.mjs`, run on local Ghost 6.75.0: 15 passed, 0 failed.**
- **Setup:** it changes the staff slug to a non-placeholder one (`dr-slug-ujian`, standing in for the real one, which is owner input O4). It renders `routes.yaml` with that slug, the same substitution the release will use, and uploads it.
- **Teardown:** it restores everything afterwards.

| ID | Proven | Result |
|---|---|---|
| A0 | The test profile authors the 23 blocks, so a leak would be possible and visible | ✓ |
| A1–A2 | The slug replaces exactly the 3 placeholders; Ghost 6.75.0 accepts the file | ✓ |
| A3–A4 | The archive renders and, across **all 3 pages of pagination**, lists **exactly** the author's 25 genuine articles: none missing, no duplicate, no block. It is compared against Ghost's own list | ✓ |
| A5 | No block on any page (cards, `/404/` links, slugs) or in the author RSS (15 items) | ✓ |
| A6 | Page 4 (after the last) returns 404 | ✓ |
| A7 | Other archive routes: `/author/{slug}/` and its RSS return 404; the old `/blog/penulis/dr/` returns 404; `/page/99/` returns 404; the bare `/blog/penulis/` returns 404; `/page/1/` returns 301 to the archive | ✓ |
| A8 | `sitemap-authors.xml` lists `/blog/penulis/{slug}/` and nothing under `/author/` | ✓ |
| A9 | Article byline and author box link to the new archive URL | ✓ |
| A10 | If the theme setting `doctor_author_slug` doesn't match the staff slug, the homepage shows "[Nama Penuh]". The setting must change together with `routes.yaml` | ✓ |
| **N1** | **Negative control:** staff slug changed but `routes.yaml` left with `dr`. The archive falls back to the taxonomy and **exposes the blocks: 46 leaks** (e.g. `blok-ed-temujanji` on page 3) | ✓ detected |
| **N2a** | A **second staff account** that authors a block has its own taxonomy archive, which **exposes the block** | ✓ detected |
| N2b | The doctor's channel stays clean meanwhile | ✓ |
| N2c | Adding a filtered channel for that second slug makes it clean | ✓ |

**Rules for production (derived from N1 and N2):**
1. **The slug must match in four places:** the staff profile, `routes.yaml` (3 places, via the release render step that fails if any `dr` remains), and the theme setting `doctor_author_slug`. Release check G3 and production check §7.2.
2. **Who owns the blocks.** The importer gives the blocks to the **Owner** account.
   - **Case A:** the doctor's account is the Owner. Nothing extra is needed. This is the simplest option.
   - **Case B:** the Owner is a different account (for example a business or admin login). Before launch, **either** add a second filtered channel for the Owner's slug to `routes.yaml` (the N2c pattern, tested), **or** change the author of all 23 blocks to the doctor in Admin.
   - Owner decision **O28**, after I27/D4. The production smoke test checks **every** author listed in `sitemap-authors.xml`, not only the doctor's.
3. On production, the smoke test (G6) re-uses the same read-only inspector (`inspectAuthor`, GET requests only) with the real slug, in Phase F (private cookie) and Phase H (anonymous).

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

**Cut-over (part of the launch window):** follow the exact sequence in §3.6, steps D1–D10, then H1–H3. **Private mode stays on from D1 until the G-gate.** The theme is activated at D7 and `routes.yaml` is uploaded at D9, both while private. Public access returns only at H1. The Cloudflare cache is purged at D2 and H2.

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
| S7 | Structured data | Ghost outputs JSON-LD (Article, WebSite, Person/author) | Optional business markup, **only** with owner-confirmed facts. Recommended type: **`LocalBusiness`**, not `MedicalBusiness` (see §6.1). Not added without your approval | ✋ Decision O21 |
| S8 | Author signals | Byline "Ditulis dan disemak oleh {name}", credentials, author page and bio | Real profile (O1–O4); optional social and website links on the profile | ✋ |
| S9 | Internal links | Navigation, topic bar, tiles, "Baca seterusnya", "Panduan berkaitan", CTAs to the ED page | Verify there are no 404s (smoke test G6 follows every internal link) | 🔍 |
| S10 | Redirects from the old site | Unknown: depends on what is live now (I27) | Map every old URL that is indexed or linked to its new URL in `redirects.yaml`. Check Search Console or the old sitemap | ✋ O20 |
| S11 | Search Console | n/a | Domain property verified by a **DNS TXT record in Cloudflare** (a DNS change: owner action, Phase H). Submit `sitemap.xml` | ✋ approval |
| S12 | Analytics | None in the theme | Choose: none / Cloudflare Web Analytics (cookieless) / GA4. Any choice that sets cookies or tracks people must be described in the Notis Privasi first | ✋ O22 |
| S13 | Performance | Built CSS/JS minified; responsive images; fonts preloaded | Lighthouse run in Phase F (mobile) | 🔍 |
| S14 | Private mode | n/a | If private mode is used during the cut-over (R1), **turn it off** at launch, or Google sees noindex | 🔍 |

---

### 6.1 Structured data: which Schema.org type

- **Principle:** the business type must describe what the business is **registered and licensed as**, and only facts the owner has verified may be used. The site does not describe the business as a clinic, and the markup must not either.

| Option | Schema.org meaning | When it would be accurate | Recommendation |
|---|---|---|---|
| **`LocalBusiness`** | A physical business serving customers at an address | Any operating business at the verified address. It makes no medical-facility claim | **Recommended** (if business markup is wanted at all) |
| `HealthAndBeautyBusiness` (a LocalBusiness subtype) | Spas, salons, beauty and wellness businesses | Only if the owner considers this an accurate description; it implies beauty or spa services | Not recommended without the owner's confirmation |
| `MedicalBusiness` and its subtypes (`MedicalClinic`, `Physician`, …) | A medical facility or practice | **Only** if the premises is registered or licensed as a private healthcare facility (for example under Malaysia's Private Healthcare Facilities and Services Act 1998), with evidence the owner supplies | **Do not use** unless that registration is confirmed. It would contradict "not a clinic" |
| None | Ghost's own Article, WebSite and Person markup only | Always valid | Acceptable default; no SEO penalty |

**If `LocalBusiness` is chosen:**
- **Properties:** only verified properties, each matching what the page visibly shows:
  - `name` "Him & Me";
  - `url`;
  - `logo`;
  - `telephone` (as shown);
  - `address` (the full verified postal address, not only "Eight Setiawangsa, Kuala Lumpur");
  - `openingHoursSpecification` (verified days and hours);
  - optionally `legalName`, but only if the owner confirms the registered name (the Notis Privasi names "Him & Me Wellness PLT") and that it is registered and active.
- **Status:** the business must be operating at that address at launch.
- **Leave out:**
  - prices and `priceRange`, unless confirmed;
  - ratings or reviews (none exist);
  - `medicalSpecialty`;
  - any health claim.

The doctor stays as Ghost's `Person` author markup. They are **not** marked up as `Physician` (a MedicalBusiness subtype) unless the owner confirms that is accurate.

This is decision **O21** (none / `LocalBusiness` / another type with evidence). The registration evidence stays with the owner. Only the conclusion is recorded.

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
| Content API with the public key | **Returns the published blocks: expected, by design** (O27). Not a failure; listed so no one mistakes it for a leak |
| Author page `/blog/penulis/{slug}/` and **all its pages** | Exactly the doctor's published articles, nothing else (same inspector as A4–A6) |
| **Every** author in `sitemap-authors.xml` | No block on any page or RSS (§3.7, R21) |
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

## 8. Backup and rollback plan (rehearsed)

### 8.1 What was verified, and how
- **Rehearsal:**
  - A throw-away local Ghost **6.75.0** running on **MySQL 8.0.46**, from the same Ubuntu 24.04 package your server uses. It was built only for this test and deleted afterwards.
  - Test content was imported and the result treated as the "previous" site: theme `source` and default routes.
  - The launch changes were then applied (this theme activated, this `routes.yaml`, a title change), followed by a bad second import.
- **Ghost-CLI:** the `ghost backup` code was read in Ghost-CLI **1.34.1** (the version installed locally). The production Ghost-CLI version is still to be confirmed (I2). Running `ghost backup` itself needs a real Ghost-CLI install and was not rehearsed here. It is run and checked on the server in C3.

| Finding | Result | Consequence for the plan |
|---|---|---|
| `mysqldump` run as Ghost's own database user, without `--no-tablespaces` | Prints *"Access denied; you need … the PROCESS privilege"* **but still exits 0** | Easy to miss. **Always add `--no-tablespaces`**, and check the error output is empty |
| `mysqldump` with `--single-transaction --no-tablespaces --default-character-set=utf8mb4`, as root over the local socket (`sudo`, **no password typed**) | Clean dump, "Dump completed" | **Recommended form (C4).** Ubuntu's MySQL root normally uses socket authentication, so no database password is needed or shown (to verify: I30) |
| Restore with Ghost **running** | Posts restored, but the site **kept showing the changed title** (Ghost caches settings in memory) | **Always `ghost stop` before a restore and `ghost start` after** |
| Restore with Ghost stopped (drop → create → load the dump → start) | Back exactly to the previous state: 49 posts (the bad import removed), original title, no errors in the log | Rollback level 3 works |
| Theme and routes rollback **without** touching the database (re-activate the previous theme, re-upload the downloaded `routes.yaml`) | Previous theme served; routes byte-identical to the backup | Rollback level 1 works on its own. It does **not** undo content (the title stayed changed), so content needs level 3 |
| A database restore does **not** change `routes.yaml` or theme files | `routes.yaml` and the theme folder live in `content/`, not in the database | Theme, routes and database recover **independently**. A full rollback needs both C4 (database) and C5/C6 (files) |
| `ghost backup` (Ghost-CLI 1.34.1 source) | For Ghost ≥ 5.129 it requires a **Staff access token** (Admin → your profile → *Staff access token*), typed at its prompt or set as `GHOST_CLI_STAFF_AUTH_TOKEN` in your own shell. It writes `backup-from-v6.75.0-on-<date>.zip` in the current folder, containing the content JSON export, a members CSV, `files/`, `images/`, `media/`, `settings/` (routes and redirects) and `themes/` | Useful, but it **contains no database dump**. It is an extra copy, not a replacement for C4. The token is a credential: never paste it into chat or a file in the repository |

### 8.2 Phase C backups (owner runs them; nothing is shared in chat)

| # | Backup | Command or path | Restores |
|---|---|---|---|
| C1 | **VPS snapshot** | Tencent Cloud console → instance → Snapshots → create `pre-launch-YYYYMMDD` | The whole server: the fastest full rollback |
| C2 | Ghost content export | Admin → Settings → Advanced → Import/Export → **Export** | Posts, pages, tags, settings (JSON) |
| C3 | Ghost-CLI backup | `cd /var/www/himandme && ghost backup` (asks for your staff access token) | Content JSON + images, files, media, themes, routes, redirects |
| C4 | **MySQL dump** | First set the name once: `DB=ghost_prod` (replace `ghost_prod` with `database.connection.database` from the filtered I3 output; it is a name, not a secret). Then: `mkdir -p ~/backup && sudo mysqldump --single-transaction --no-tablespaces --default-character-set=utf8mb4 "$DB" > ~/backup/ghost-pre-launch.sql 2> ~/backup/dump.err; echo "exit $?"; cat ~/backup/dump.err; tail -1 ~/backup/ghost-pre-launch.sql` | The exact database. **Pass:** exit 0, `dump.err` empty, last line "Dump completed". The dump holds the tables only (no `CREATE DATABASE`), so a restore always names the target database |
| C5 | Files | `sudo tar czf ~/backup/content-pre-launch.tgz -C /var/www/himandme content` and `sudo cp /etc/nginx/sites-available/himandme* ~/backup/` | Images, themes, `settings/routes.yaml`, `data/redirects.*` |
| C6 | Current theme, routes and redirects | Admin: Design → active theme → **Download**; Labs → Routes → **Download**; Labs → Redirects → **Download** | Level-1 rollback, independent of the database |
| C7 | Copies off the server | Download C2–C6 to your computer (e.g. `scp`) | Survives loss of the VPS |
| C8 | **Restore test** | On your computer or a throw-away machine with MySQL 8.0, **never on production**. Create the disposable database, load the dump into it by name, count, then remove it: (1) `sudo mysql -e "CREATE DATABASE ghost_restore_test CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;"` (2) `sudo mysql ghost_restore_test < ghost-pre-launch.sql` (3) `sudo mysql -e "SELECT COUNT(*) AS posts FROM ghost_restore_test.posts; SELECT COUNT(*) AS tables_restored FROM information_schema.tables WHERE table_schema='ghost_restore_test';"` (4) `sudo mysql -e "DROP DATABASE ghost_restore_test;"`. Also open the C2 JSON and list the archive: `tar tzf content-pre-launch.tgz \| head` | **Pass:** step 2 prints no error; the `posts` count (posts, pages and drafts together) is consistent with Admin; the table count is about 100 (Ghost 6.75.0 created 103 in the rehearsal). Proves the dump restores |
| C9 | Rollback rule | Always `ghost stop` before a database restore and `ghost start` after | Rehearsed (V4) |
| C10 | **List of every currently public URL** (needed for D2b) | Before D1, while the old site is still public: `for s in posts pages tags authors; do curl -s "https://himandme.my/sitemap-$s.xml"; done \| grep -o '<loc>[^<]*' \| sed 's/<loc>//' > ~/backup/old-urls.txt; printf '%s\n' https://himandme.my/ https://himandme.my/rss/ https://himandme.my/sitemap.xml >> ~/backup/old-urls.txt; wc -l ~/backup/old-urls.txt` | Shows that no previously public page stays reachable during private mode; also the input for the redirect map (O20) |

### 8.3 Rollback triggers (any one)
- the site is down for more than 5 minutes;
- a `#blok` block is publicly visible;
- test content or a placeholder is visible;
- Admin is inaccessible;
- a wrong price or contact number is shown.

### 8.4 Rollback levels

| Level | What | Restores | Time |
|---|---|---|---|
| 1 | Re-activate the previous theme; upload the C6 `routes.yaml` and redirects; purge the cache | Theme and routes only (rehearsed) | Minutes |
| 2 | **Private mode back ON**, then investigate. Unpublish (not delete) a problem item if needed | The website shows nothing while you decide (the Content API still answers for published posts, O27) | 1 minute |
| 3 | `DB=ghost_prod` (the same name as in C4) → `cd /var/www/himandme && ghost stop` → `sudo mysql -e "DROP DATABASE \`$DB\`; CREATE DATABASE \`$DB\` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;"` → `sudo mysql "$DB" < ~/backup/ghost-pre-launch.sql` → restore `content/` from C5 if files changed → `sudo chown -R ghost:ghost /var/www/himandme/content` → `ghost start` | Database and files (rehearsed) | ~30 min |
| 4 | Restore the VPS snapshot (C1) | Everything; anything after the snapshot is lost | ~30–60 min |

**Level 3 notes:**
- Before running it, check the character set and collation in the dump against I30. If the server's database uses a different collation (I30), use that one in `CREATE DATABASE`.
- Use the real database name in `DB=`. Placeholders like `<db>` must never be typed literally: the shell reads `<` as a file redirect.
- The `GRANT` for Ghost's database user survives a drop and re-create (privileges are stored per database name). This was confirmed in the rehearsal.

**Fallbacks:** if the blocks are missing, the theme still renders its built-in fallback copy (tested in Stages 2–4). The site never goes blank.

---

## 9. Launch sequence (phases A–H)

🛑 = **owner approval checkpoint**. Nothing passes a checkpoint without your written "approved".

| Phase | Work | Depends on | Who | Checkpoint |
|---|---|---|---|---|
| **A. Preparation and audit** | Run I1–I31 (read-only) and send the results. Inventory the live site (I27). Supply the inputs in the checklist, section 4 (O1–O29). Decide the merge option (1.3), analytics and the old-site plan | This plan approved | Owner (server checks); me (review results, update the risk register) | 🛑 **A-gate:** infrastructure audit accepted; owner inputs complete or explicitly deferred |
| **B. GitHub merge and release preparation** | Merge PRs per the chosen option. Open the missing Stage 4 and 6 PRs only if Option A. Release branch: G1–G7. Full local test run. Build the zip and the launch seed. Placeholder scan on both | A-gate | Me (code and PRs only after approval); owner (merges, or approves each merge) | 🛑 **B-gate:** `main` = approved Stage 6 plus release changes; tests green; zip and seed checksums recorded |
| **C. Production backup** | C1–C10 | B-gate | Owner | 🛑 **C-gate:** backups exist, are copied off the server, the restore has been tested (C8), and the public URL list is saved (C10) |
| **D. Theme and content deployment** | In a pre-announced window, **in mandatory private mode**: §3.6 steps D1–D10 (private ON → cache purge → **anonymous public-domain checks D2b** → Network off → Owner/slug check → import → tags/staff/nav → activate theme → settings → routes → redirects) | C-gate | Owner in Admin, following the step list; me guiding live | 🛑 **D-gate:** each step's check passes before the next |
| **E. Production configuration** | E1–E11, theme settings, meta, icon, OG image | D | Owner | (part of the D/E window) |
| **F. Staging and functional testing** | **While still private**: smoke test G6 with the private-site cookie (checks every author in `sitemap-authors.xml`), §7 checklists, placeholder scan, phone checks | E | Me (read-only test, if I can reach the site; otherwise the owner runs it); owner (visual review) | 🛑 **F-gate:** every check is green; screenshots reviewed |
| **G. Final launch approval** | Go/no-go review: risk register, open items, rollback ready | F-gate | Owner | 🛑 **G-gate: written "launch approved"** |
| **H. Public launch and post-launch verification** | §3.6 H1–H3: **private mode OFF** → purge the cache → anonymous smoke test **through https://himandme.my** (on failure: private mode back ON) → Lighthouse → Search Console (TXT record, owner) and submit the sitemap → watch logs for 48 h → re-check at 7 days | G-gate | Owner (dashboard actions); me (read-only checks) | 🛑 **H-gate:** sign-off at 48 h; Stage 7 closed |

**Critical path:** O4 (doctor's slug) + O28 (block ownership) → G3 (routes) → B-gate → C → D → E → F → G → H. Articles (O7) are **not** on the critical path. The site can launch with zero articles: the blog pages show their empty states. But the blog navigation then leads to empty pages, so it is your choice (O23) whether to launch with a minimum number of articles.

---

## 10. Risk register

| ID | Risk | Severity | Mitigation | Status |
|---|---|---|---|---|
| R1 | Blocks imported while the **old theme** is still active become public posts (old listings, RSS, sitemap) | **High** | **Private mode mandatory** from D1 (before the import) until the G-gate, verified through the public domain at D2b; measured to hide every page, archive, RSS feed, sitemap and block URL (§3.6, P1–P5) | ✅ Planned and tested; ✋ window date (O25) |
| R2 | Ghost Network on: imported or published blocks federate to the fediverse and **can't be recalled** | **High** | Network off and verified (I28) before any import or publish | 🔍 |
| R3 | Test content or placeholders reach production | **High** | Seed allowlist and denylist (3.3); placeholder scanner (3.4); a local export is never used; post-count check (3.5) | ✅ Planned |
| R4 | Wrong author slug in `routes.yaml`: the author page lists blocks (**measured: 46 leaks**, N1) | **High** | Render step refuses to leave any `dr`; slug must match in 4 places; the read-only `inspectAuthor` check in F and H | ⛔ O4 |
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
| R21 | Blocks owned by a **non-doctor Owner account** (the importer's default): that account's taxonomy archive exposes them (**measured**, N2a) | **High** | Case A (doctor = Owner) or Case B (extra filtered channel, tested N2c, or reassign the 23 blocks); smoke test checks every author archive | ✋ O28 |
| R22 | Private mode does not protect the **Content API**: anyone with the public key can list and retrieve every published post during the migration (the 23 blocks, the 3 pages, any published article) | Low–Medium | The blocks and pages are approved public copy, served the same way after launch. Drafts are never exposed; test content is never imported. The key is not shown while private (P8) but may already be known. Optional: publish no article before H1 | ✋ O27 |
| R26 | Cloudflare keeps serving **cached copies of old public pages** after private mode is on | **High** | Purge Everything at D2; **mandatory anonymous public-domain checks of every C10 URL** (D2b) with `cf-cache-status`; I24 (no Cache Everything or edge TTL on HTML, Always Online off); no import until they pass | ✅ Planned |
| R23 | Restoring the database while Ghost runs shows stale settings | Medium | `ghost stop` before and `ghost start` after (rehearsed) | ✅ |
| R24 | `mysqldump` PROCESS-privilege error goes unnoticed (exit code 0) | Medium | `--no-tablespaces`, run with `sudo`, and check `dump.err` is empty (C4) | ✅ |
| R25 | Staff access token for `ghost backup` exposed | Medium | Typed only at the prompt on the server; never in chat, files or the repository | ✅ Rule |

---

## 11. Execution sequence and dependencies (summary)

```
Plan approved
  └─ A: infra checks I1–I31 + live inventory I27 + owner inputs O1–O29
       └─ A-gate
            └─ B: merges (1.3) → release branch G1–G7 → local tests → zip + seed + scans
                 └─ B-gate
                      └─ C: snapshot + exports + dump + files + public URL list → restore test
                           └─ C-gate
                                └─ D1 PRIVATE ON → purge → D2b anonymous public-domain checks (gate) → Network off
                                │   → Owner/slug check → import seed
                                │   → tags/staff/nav → activate theme → settings → routes → redirects
                                └─ E: remaining config (still private)
                                └─ F: smoke (private cookie) + #blok + every author archive + placeholders
                                     └─ F-gate → G: go/no-go (G-gate)
                                          └─ H1 PRIVATE OFF → purge → anonymous re-verify
                                               → Search Console → 48 h / 7 d
```

**Not started. Waiting for your approval of this plan.** Once it is approved, I will begin Phase A only: preparing the inputs, and reviewing the infrastructure results you send. Every later phase starts only after its own 🛑 approval.

---

## 12. Remaining assumptions and decisions requiring the owner's input

**Assumptions (each becomes a fact only when verified in Phase A):**

| # | Assumption | Verified by |
|---|---|---|
| AS1 | The server matches the stated stack (Ubuntu 24.04.5, Ghost 6.75.0, MySQL 8.0, Node 22, Nginx) and a standard Ghost-CLI layout under `/var/www/<site>` | I1–I6, I14 |
| AS2 | Ghost-CLI on the server behaves like 1.34.1 for `ghost backup` (staff token, zip content) | I2, C3 |
| AS3 | MySQL root uses socket authentication, so backups need no password | I30 |
| AS4 | Ghost Admin is reachable and the owner has an Owner or Administrator login | Phase A |
| AS5 | The live site's Content API key may already be public (the old theme). It is never secret in any case | I27 (view page source) |
| AS6 | Ghost 6.75.0 behaviour measured locally (private mode, author archives, importer Owner rule) is the same in production. Same version; production mode instead of development; MySQL instead of SQLite | Phase F checks repeat the key measurements read-only |
| AS7 | This session still cannot reach himandme.my, so production checks are run by the owner (or here if network access is granted later) | — |
| AS8 | Cloudflare purge plus the response headers (`no-store`, `private`) are enough to stop edge copies; D2b proves it on the real domain | D2b |

**Decisions needed (full list in the checklist, section 4):**
- **O1–O29** are all listed in the checklist (section 4): content, profile, business details, analytics, redirects, window, merge option. The ones added or changed since revision 1:
- **O27 (rewritten):** private mode protects the website but **not** the Content API. During the migration, anyone with the public key can retrieve the published blocks and pages. Accept this residual exposure of approved public copy (recommended), or state a stricter requirement (§3.6, R22).
- **O21 (clarified):** structured data. None, or `LocalBusiness` (recommended), or `MedicalBusiness`/a subtype **only** with confirmed healthcare-facility registration (§6.1).
- **New, O28:** block ownership, Case A (the doctor's account is the Owner) or Case B (an extra channel, or reassign the 23 blocks), after I31.
- **New, O29:** confirm the architecture record is corrected to **23 blocks (12 + 8 + 3)**.

---

## 13. Consistency review (revision 3)

Both documents were re-read after the revision 3 edits. Checked and aligned:

| Topic | Plan | Checklist |
|---|---|---|
| Blocks | 23 = 12 + 8 + 3, unchanged (§3.2) | V1, section 5, O29 |
| Private mode | Mandatory D1 → G-gate; D2b public-domain checks gate the import; website only, not the API (§3.6, R1, R22, R26, §9, §11) | Section 5, section 10 (phases D and H), V2 |
| Content API | Protects nothing in private mode; returns published blocks; O27 rewritten (§3.6, §7.2, R22, §12) | O27, V2 |
| Author archive | Slug in 4 places; Owner rule; every author checked (§3.7, R4, R21, §7.2) | G3, G10, O4, O28, section 8 |
| Backups | C1–C10, valid restore syntax, `ghost stop` rule (§8) | Section 9 (C1–C10) |
| Structured data | `LocalBusiness` recommended; no `MedicalBusiness` without evidence (§6, §6.1) | O21, S7 |
| Cloudflare | I24 adds Always Online and edge-TTL checks; R26 | I24 |
| Phase order | A → B → C (incl. C10) → D (D1, D2, D2b, …) → E → F → G → H (H1–H3) | Section 10 |
| Status | Phase A not started; nothing deployed | Header, section 10 |

No contradiction remains. Two older notes were removed because they no longer applied:
- the phrase "the API is not a listing";
- "optionally in private mode", from revision 1.
