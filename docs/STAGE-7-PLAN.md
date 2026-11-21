# Stage 7 plan: production readiness and launch preparation

> **Status: Revision 6 is the approved planning baseline** (approved and committed 17 Nov 2026, `16be29c`). **Update 6.1 (18 Nov 2026)** adds §15, a record of the server maintenance the owner carried out: **M1–M3 complete; M4 N1–N5 complete; M4 N6 (HSTS) pending observation.** Revision 6's decisions are unchanged. **Phases B–H are NOT authorised.** No further server changes are authorised. **Next authorised action: read-only only (§15.9).**
> **Update 6.2 (19 Nov 2026)** adds §16: the remaining read-only Phase A checks and a consolidated report. **Phase A stays open** (I34 is unresolved, and the findings await the owner's review). **No production change was made.**
> **Update 6.3 (19 Nov 2026)** adds §16.7: **I34 resolved.** All eight password logins are the owner's own, and no unexpected account, key, cron task or public listener was found. **Phase A stays open** for the owner's review and the A-gate. **No production change was made.**
> **Update 6.4 (19 Nov 2026)** adds §16.8: the **O28 block-ownership rule** (every `#blok` post belongs only to `dr`), safeguards **G6** (extended) and **G12**, and multi-author attribution as future enhancement **FE1**. Single-author attribution is unchanged. Documentation only.
> **Update 6.5 (19 Nov 2026)** adds §16.9: the **owner's Phase A decision register**. The owner accepts the §16 findings. **The A-gate is ready for sign-off once this update is approved.** Recorded decisions are **not** executed automatically. **Phases B–H remain unauthorised** until the owner approves Phase B in writing.
> **Update 6.6 (19 Nov 2026)** adds §16.10: **O30 executed** (LLM setting off; verification step 1 passed) and **Phase A signed off by the owner**. **Phases B–H remain unauthorised** until the owner approves Phase B in writing.
> **Update 6.7 (21 Nov 2026)** adds §16.11: **M6** (security-only automatic updates, MySQL excluded) and **M5** (TLS 1.2/1.3 only) **executed and verified**; monthly maintenance runbook in [`stage-7/MONTHLY-MAINTENANCE.md`](stage-7/MONTHLY-MAINTENANCE.md). N6 stays pending (around 25 Nov; HSTS `max-age=300`). **Phases B–H remain unauthorised.**
> Phase A documents: [`PHASE-A-FINDINGS.md`](stage-7/PHASE-A-FINDINGS.md), [`PHASE-A-SERVER-INVESTIGATION.md`](stage-7/PHASE-A-SERVER-INVESTIGATION.md).
> **Historical note:** Revisions 1–6 (16–17 Nov 2026) and the 17 Nov Phase A audit were **read-only**. While they were prepared:
> - no pull request was merged, created or changed, and no existing branch was modified;
> - the live VPS, Ghost, DNS and Cloudflare were not touched **by the audit**;
> - *correction (Update 6.3): the owner separately did their own Ghost service troubleshooting and configuration on the VPS on 17 Nov 2026, outside the read-only audit scripts (§16.7);*
> - nothing was imported, published or activated, and no test data was deleted.
>
> **Since then:** the owner separately carried out server maintenance M1–M3 and M4 N1–N5 on the production VPS on **18 Nov 2026** (§15). That changed SMTP, SSH, packages and Nginx. **No release phase (B–H) has been carried out**: no theme deployed, no content imported or published, no PR merged.
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
> **Revision 4: D2b robots.txt correction (17 Nov 2026)**
>
> - **Measured on local Ghost 6.75.0 in private mode** (`test/stage7/private-mode.mjs` P4, now asserting the status):
>   - `/robots.txt` is **not** redirected. It returns **HTTP 200**, `text/plain`, body `User-agent: *` / `Disallow: /`, and `Cache-Control: public, max-age=3600`.
>   - Pages, articles, RSS feeds and all sitemaps return **302 to `/private/`** (P1–P3, now asserting the status and target).
> - **D2b pass criteria corrected** accordingly. The http/www criteria now verify the canonical redirect first and then the private-mode response.
> - **New launch risk found (R27):** robots.txt is cacheable for an hour. A copy of the private `Disallow: /` could survive the switch back to public, so H3 now requires the public robots.txt.
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
| G6 | Add `test/prod/smoke.mjs`: a **read-only** production check (GET requests only, no Admin login, no edits). Modes: `--expect-private` (D2b: pages, feeds and sitemaps must 302 to `/private/`; robots.txt must be 200 with `Disallow: /`; http/www first hop then final; `cf-cache-status` checked), with the private-site cookie (F), and anonymous (H3). **Update 6.4:** also checks that every `#blok` post has exactly one author, `dr` (Content API), and **fails if any block has any other author, even when a containment route hides it**; inspects **every** author archive in `sitemap-authors.xml`; re-run after any staff change (§16.8) | D2b, Phase F and H verification; O28 rule | ✅ Ready to build |
| G7 | README: a "Production launch" section that points to this plan | Single entry point | ✅ Ready |
| G12 | Add a local test: an additional author (Author role) with only real articles. Their archive, pagination and RSS list only their articles, never a block; `dr` unchanged (§16.8) | Proves the O28 rule's multi-author case, which has not been tested directly | ✅ Ready to build (Phase B) |
| G11 | Add to `test:stage7` and the smoke test: every block's `.md` URL is 404, and `llms.txt`/`llms-full.txt` list no block (Phase A finding F11) | Ghost 6.75 serves blocks as Markdown while its LLM setting is on | ✅ Ready to build (Phase B) |

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
| I1 | OS | `lsb_release -d; uname -r; uptime` | Ubuntu 24.04.5 LTS. Note the uptime and any pending reboot (`ls /var/run/reboot-required`) | ✅ resolved 18 Nov (M3: kernel 6.8.0-149 after reboot) |
| I2 | Ghost and Ghost-CLI | `cd /var/www/himandme && ghost version && ghost ls` | Ghost 6.75.0; **Ghost-CLI version noted** (the backup procedure was checked against 1.34.1); the site shows `running (production)` | ✅ (§14.1) |
| I3 | Ghost config (filtered) | `sudo jq 'del(.database.connection.password, .database.connection.user, .mail.options.auth, .mail.options.apiKey) ' /var/www/himandme/config.production.json` | `url` is `https://himandme.my` (no trailing path; decide www vs apex); `server.host` is `127.0.0.1`; `database.client` is `mysql`; `paths.contentPath` is set; `mail.transport` is noted; `admin.url` is noted if set | ⚠️ R34 (§14.1) |
| I4 | Ghost health | `ghost doctor` (read-only checks) | All checks pass. Note any warnings about Node, folder permissions or systemd | ✅ (§14.1) |
| I5 | Node | `node -v; which node` | v22.x LTS, the same binary that systemd runs | ✅ (§14.1) |
| I6 | systemd | `systemctl status ghost_himandme-my --no-pager; systemctl is-enabled ghost_himandme-my` | `active (running)`, `enabled`, `User=ghost` (see `systemctl cat ghost_himandme-my`) | ✅ (§14.1) |
| I7 | Recent errors | `sudo journalctl -u ghost_himandme-my --since "7 days ago" -p err --no-pager \| tail -50` | No repeated errors | ✅ 0 errors (§14.1) |
| I8 | Ownership and permissions | `ls -ld /var/www/himandme /var/www/himandme/content; sudo find /var/www/himandme/content ! -user ghost \| head` | Install directory owned by your user with `775`; `content/` and everything under it owned by `ghost:ghost`; the find prints nothing | ✅ (§14.1) |
| I9 | Nginx config | `sudo nginx -t; ls -l /etc/nginx/sites-enabled/` | Syntax OK; himandme.my and himandme.my-ssl confs present (Ghost-CLI names) | ✅ resolved 18 Nov (M4 N4) |
| I10 | Nginx proxy | `sudo grep -nE 'proxy_pass\|server_name\|client_max_body_size\|real_ip\|add_header' /etc/nginx/sites-available/himandme*` | `proxy_pass http://127.0.0.1:2368`; `client_max_body_size` ≥ 50m (image and theme uploads); note whether Cloudflare real-IP and security headers are set | ◐ N5 done 18 Nov; N6 pending |
| I11 | TLS certificate | `sudo ls /etc/letsencrypt/himandme.my/ 2>/dev/null; echo \| openssl s_client -connect himandme.my:443 -servername himandme.my 2>/dev/null \| openssl x509 -noout -issuer -dates -subject` | A valid certificate for himandme.my (and www if used), not expiring within 30 days. Note whether it is Let's Encrypt (via Ghost-CLI's acme.sh) or a **Cloudflare Origin certificate** | ✅ www certificate added 18 Nov (M4 N2); apex unchanged |
| I12 | Certificate renewal | `sudo crontab -l -u root \| grep -i acme` | An acme.sh renewal job exists if Let's Encrypt is used. **Renewal can fail behind the Cloudflare proxy** (risk R9) | ✅ (§14.1) |
| I13 | HTTPS and redirects | `curl -sI http://himandme.my; curl -sI https://himandme.my; curl -sI https://www.himandme.my` | HTTP returns 301 to `https://himandme.my/`; www returns 301 to the apex (or the reverse, matching the Ghost `url`); one canonical host only | ✅ resolved 18 Nov (www 301 over HTTP and HTTPS) |
| I14 | MySQL | `systemctl status mysql --no-pager; mysql --version` | Running, 8.0.x | ✅ (§14.1) |
| I15 | DB connectivity | `ghost doctor` (above), plus the Admin loading without errors | Ghost connects. **Don't print the database credentials** | ✅ (§14.1) |
| I16 | DB size and backup space | `df -h /var/www /var/lib/mysql; sudo du -sh /var/www/himandme/content` | Free disk ≥ 3× (database dump + content folder), for backups during the launch | ✅ (§14.1) |
| I17 | Memory | `free -h` | ≥ 1 GB free or swap configured (Ghost plus MySQL on a small VPS) | ✅ (§14.1) |
| I18 | Firewall | `sudo ufw status verbose` (and the Tencent Cloud security-group rules in the console) | Only 22 (or your SSH port), 80 and 443 open. 3306 and 2368 **not** open to the internet | ✅ Tencent firewall: 443/22/80 TCP + ICMP allowed (IPv4); no 3306/2368 (§16.1) |
| I19 | Ports | `sudo ss -tlnp \| grep -E ':(80\|443\|2368\|3306)\b'` | 2368 and 3306 bound to `127.0.0.1` only | ✅ (§14.1) |
| I20 | SSH | `sudo sshd -T \| grep -Ei '^(permitrootlogin\|passwordauthentication\|pubkeyauthentication)'` | `permitrootlogin no` (or `prohibit-password`), `passwordauthentication no`, `pubkeyauthentication yes` | ✅ resolved 18 Nov (M2) |
| I21 | Updates | `sudo unattended-upgrades --dry-run 2>/dev/null \| tail -3; apt list --upgradable 2>/dev/null \| wc -l` | Security updates applied or scheduled | ✅ updates applied 18 Nov (M3); auto-security (O35) open |
| I22 | DNS (Cloudflare dashboard, view only) | DNS → Records | `A himandme.my` → the VPS IP; `www` as CNAME or A; proxy status (orange or grey) noted; no stray old records | ✅ DNS-only (§14.1) |
| I23 | Cloudflare SSL (view only) | SSL/TLS → Overview | Mode **Full (strict)**. Never "Flexible", which causes redirect loops with Ghost | ✅ n/a (proxy off) |
| I24 | Cloudflare edge (view only) | SSL/TLS → Edge Certificates; Speed; Caching → Cache Rules | "Always Use HTTPS" on; **Rocket Loader off** (it rewrites the theme's scripts); no "Cache Everything" rule or edge-TTL override covering HTML, `/ghost/*`, `/members/*` or `/p/*` (previews); **Always Online off**; note whether Cache Reserve is on. Otherwise cached old pages could still be served during private mode (R26) | ✅ n/a (proxy off) |
| I25 | Cloudflare security (view only) | Security → WAF / Bots | No rule that blocks Ghost Admin's API (`/ghost/api/admin/*`) or theme uploads | ✅ n/a (proxy off) |
| I26 | Ghost mail | Ghost Admin → Settings → (staff invite, password reset) | A working mail transport (needed for staff password resets). Members and newsletters are **not** used (section 5) | ✅ resolved 18 Nov (M1, interim Gmail SMTP) |
| I27 | Current live content | Ghost Admin → Posts / Pages / Tags / Staff; Settings → Design (active theme name and version); Labs → Routes (download); Labs → Redirects (download) | An **inventory** of what is live now (section 3.1). Nothing changed | ✅ 0 drafts/scheduled; default routes; empty redirects (§16.1) |
| I28 | Network (ActivityPub) | Settings → Growth → Network | Note on or off. It **must be off before any import** (R2) | ✅ OFF (§16.1); re-check at D3 |
| I29 | Membership | Settings → Membership → Access | Note the current value. Planned: "Nobody" (section 5) | ✅ 0 members; subscriptions Nobody (§16.1) |
| I30 | MySQL backup access (no secrets) | `sudo mysql -e "SELECT user, plugin FROM mysql.user WHERE user='root'; SELECT @@character_set_server, @@collation_server; SELECT table_schema, ROUND(SUM(data_length+index_length)/1024/1024,1) AS mb FROM information_schema.tables GROUP BY table_schema;"` | root uses `auth_socket` (so `sudo mysqldump` needs no password); `utf8mb4`; database size noted | ✅ (§14.1) |
| I32 | fail2ban (read-only) | `sudo fail2ban-client status; sudo fail2ban-client status sshd` | `sshd` jail active; current bans noted | ✅ active, 1 jail; 262 failed total, 6 banned total (§16.1) |
| I33 | Nginx TLS snippet (no secrets) | `sudo cat /etc/nginx/snippets/ssl-params.conf` | Note any `add_header` lines (ignored inside locations that set their own headers) | ⚠️ TLS 1.0/1.1 + legacy ciphers → R40 (§16.1) |
| I34 | Owner's own SSH logins | `sudo journalctl -u ssh --since "7 days ago" --no-pager \| grep "Accepted password"` | The owner recognises all 5 accepted logins (times, source addresses) | ✅ **Resolved** (19 Nov, §16.7): all 8 logins are the owner's own |
| I31 | Staff accounts and Owner | Admin → Settings → Staff (look only) | Which account has the **Owner** role; every staff slug; no test or unknown accounts (§3.7) | ✅ Dr Imran only, Owner, slug `dr` (§16.1) |

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
| `robots.txt` | **HTTP 200, served directly (not redirected)**, `text/plain`, body `User-agent: *` / `Disallow: /`; `Cache-Control: public, max-age=3600` | P4 |
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
| D9 | **Upload `routes.yaml`**, rendered with the real slug (an extra filtered channel only as **temporary containment**, §16.8, if a block's ownership is still being corrected) | Private | Labs → Routes download matches the release file |
| D10 | Redirects (if O20 lists any) | Private | — |
| E | Remaining production configuration (§5) | Private | — |
| F | Review and testing **while still private**: the smoke test and the §7 checks run with the private-site cookie (on the owner's computer, or here if the network allows); visual review by the owner | Private | F-gate |
| G | Go/no-go | Private | **G-gate: written "launch approved"** |
| H1 | **Turn private mode OFF** | **Public from here** | — |
| H2 | Purge the Cloudflare cache (Purge Everything) | Public | Wait about 30 seconds |
| H3 | Anonymous checks **through https://himandme.my**: smoke test, `#blok` exclusion (§7.2), placeholder scan; every C10 URL either serves the new site or redirects (O20); no `/private/` redirects remain; **robots.txt is the public version** (no `Disallow: /`) | Public | If anything fails: **turn private mode back on at once** (rollback level 2), then investigate |

**D2b: anonymous checks through the public domain (mandatory, after the purge, before D3).**

> **Phase A facts that affect D2b:**
> - **Cloudflare:** its proxy is off (DNS-only, I22). The D2/H2 purges are harmless no-ops, and a missing `cf-cache-status` header counts as a pass.
> - **www:** the `www` rows can only pass once **M4** (N1–N3) is done, or if O31 removes the `www` record. **M4 or that O31 decision is a prerequisite of Phase D.**

Run these on a computer that is **not** logged into Ghost Admin and has **not** entered the private-site password. Use `curl` (it sends no cookies), plus a fresh private/incognito browser window. They go through `https://himandme.my`, so through Cloudflare, not to the server directly.
1. **Every URL that was public before the window** (the C10 list):
   ```bash
   while read -r u; do curl -s -o /dev/null -w '%{http_code} cf=%header{cf-cache-status} -> %{redirect_url}  %{url}\n' "$u"; done < ~/backup/old-urls.txt > ~/backup/private-check.txt; grep -vc ' -> https://himandme.my/private/' ~/backup/private-check.txt
   ```
   `%header{}` needs curl 7.84 or later; Ubuntu 24.04 has 8.5.
2. **Fixed list, pages, feeds and sitemaps:** `https://himandme.my/`, `/rss/`, `/sitemap.xml`, `/sitemap-posts.xml`, and one old article URL with a query string added (`?v=1`). Same command as 1.
3. **robots.txt (checked separately; it is not redirected):**
   ```bash
   curl -s -D - https://himandme.my/robots.txt
   ```
4. **Host and protocol variants.** First the canonical redirect (first hop only), then the whole chain:
   ```bash
   for u in http://himandme.my/ https://www.himandme.my/ http://www.himandme.my/ http://himandme.my/robots.txt; do curl -s -o /dev/null -w "first hop: %{http_code} -> %{redirect_url}  ($u)\n" "$u"; curl -s -o /dev/null -L -w "  final: %{http_code} %{url_effective} after %{num_redirects} redirects\n" "$u"; done
   ```
   Which www direction counts as canonical depends on I13; the plan assumes `https://himandme.my` (apex). If I13 shows the opposite, swap the expected hosts.

**Pass criteria:**

| Check | Pass |
|---|---|
| Every C10 URL, and every fixed-list page, article, feed and sitemap (commands 1–2) | **`302` to `https://himandme.my/private/…`**. The count printed by command 1 is **0** |
| Any of those returning `200`, `304`, or a body with old content | **Fail.** A cached or still-public page |
| `cf-cache-status` on those URLs | Never `HIT`, `STALE`, `UPDATING` or `REVALIDATED` (expected: `DYNAMIC`, `BYPASS`, `MISS` or `EXPIRED`) |
| **`robots.txt`** (command 3) | **HTTP `200`, not a redirect** (this is Ghost's normal private-mode behaviour, measured in P4). The body **must contain `Disallow: /`** (a line with only `/`). A `302` is **not** required. **Fail** if the body is the old public robots.txt (it has a `Sitemap:` line and no `Disallow: /`): that is a cached old copy, so purge again. `cf-cache-status: HIT` is acceptable for robots.txt **only** when the body is the private `Disallow: /` version |
| **`http://` and `www` variants** (command 4) | **First hop:** `301` or `308` to `https://himandme.my/` with the same path. **Final:** `https://himandme.my/private/?r=…` with HTTP `200` (the password page) for the pages. For `http://himandme.my/robots.txt`, the final step is `https://himandme.my/robots.txt` with `200` and `Disallow: /`. A first hop straight to `/private/` on the wrong host, or a redirect loop, **fails** (check I13 and I23) |
| **Cloudflare: no cached old public content** | None of the above shows any old page body. No page, feed or sitemap has a `HIT`/`STALE` status. A fresh incognito browser shows the password page for `/`, an old article and the old blog index, never old content |

**If anything fails:**
- Purge again and re-run.
- If a URL still serves content, check the Cloudflare settings that keep copies at the edge (I24: Cache Rules with an edge TTL, "Cache Everything", **Always Online**, Cache Reserve).
- Do not import until every line passes.

The same anonymous, public-domain checks are repeated at H3 after private mode is turned off. There the pass criteria are reversed:
- **Pages:** the **new** site, with no stale `/private/` redirect.
- **`robots.txt`:** HTTP `200` with the **public** content (a `Sitemap: https://himandme.my/sitemap.xml` line and **no** `Disallow: /` line). Ghost sends robots.txt with `Cache-Control: public, max-age=3600`, so a copy of the private version could otherwise stay at the edge or in crawlers for up to an hour, or longer under an edge-TTL rule. **If the private version is still served: purge again (H2) and re-check. Never leave it in place** (R27).

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
   - **Case B:** the Owner is a different account (for example a business or admin login). Before launch, **change the author of all 23 blocks to `dr` as their only author** in Admin. This is required by the O28 rule (§16.8). A second filtered channel for the Owner's slug (the N2c pattern, tested) may be added **only as temporary containment** while ownership is being corrected; it hides the blocks but does **not** satisfy O28.
   - Owner decision **O28**, after I27/D4. The production smoke test checks **every** author listed in `sitemap-authors.xml`, not only the doctor's.
   - **Update 6.4 (19 Nov 2026):** O28 is decided as a general **ownership rule**: every `#blok` post has `dr` as its only author. That makes additional authors of any role safe without changing routes or the theme. Safeguards: G6 (extended) and G12 (§16.8).
   - **Update 6.5 (19 Nov 2026):** the owner confirmed this rule; all Phase A decisions are recorded in the register in **§16.9**.
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
| E10 | Integrations | Remove unused custom integrations, without exposing keys | ✅ No custom integrations (§16.1) |
| E11 | Staff | Only real people. Owner role on the doctor's or the business account. 2FA/"staff device verification" on, which **depends on working mail (M1, R34)** | 🔍 |
| E12 | Settings → General settings → Meta data → **"Enable structured data for LLMs and AI search engines"** | **Off** before H1 (F11: otherwise every block is readable at `/blog/{slug}.md`; tested locally, off gives 404). Private mode covers it until then | ✅ **Done 19 Nov** (owner); step 1 verified; step 2 after import (§16.10) |

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
| S3 | `robots.txt` | Ghost default (disallows `/ghost/`, `/email/`, `/r/` and a few API paths), with a `Sitemap:` line. Cached for 1 hour (`max-age=3600`) | At H3 and again at +24 h: verify it is the public version, **not** `Disallow: /`, and that the site is not left in private mode (R27) | 🔍 |
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
| `/blog/{block-slug}.md` for all 23 blocks, `/llms.txt`, `/llms-full.txt` | Every block `.md` → 404; no block in the llms files (or the files are off). F11, E12 |
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
| C4 | **MySQL dump** | First set the name once: `DB=himandme` (the database name confirmed in Phase A, I3/I30). Then: `mkdir -p ~/backup && sudo mysqldump --single-transaction --no-tablespaces --default-character-set=utf8mb4 "$DB" > ~/backup/ghost-pre-launch.sql 2> ~/backup/dump.err; echo "exit $?"; cat ~/backup/dump.err; tail -1 ~/backup/ghost-pre-launch.sql` | The exact database. **Pass:** exit 0, `dump.err` empty, last line "Dump completed". The dump holds the tables only (no `CREATE DATABASE`), so a restore always names the target database |
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
| 3 | `DB=himandme` (the same name as in C4) → `cd /var/www/himandme && ghost stop` → `sudo mysql -e "DROP DATABASE \`$DB\`; CREATE DATABASE \`$DB\` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;"` → `sudo mysql "$DB" < ~/backup/ghost-pre-launch.sql` → restore `content/` from C5 if files changed → `sudo chown -R ghost:ghost /var/www/himandme/content` → `ghost start` | Database and files (rehearsed) | ~30 min |
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
| **A. Preparation and audit** (✅ **signed off by the owner 19 Nov 2026**, §16.10; was in progress since 17 Nov 2026; findings in `docs/stage-7/PHASE-A-FINDINGS.md`; server script `docs/stage-7/phase-a-server-checks.sh`) | Run I1–I31 (read-only) and send the results. Inventory the live site (I27). Supply the inputs in the checklist, section 4 (O1–O29). Decide the merge option (1.3), analytics and the old-site plan | This plan approved | Owner (server checks); me (review results, update the risk register) | 🛑 **A-gate:** infrastructure audit accepted; owner inputs complete or explicitly deferred |
| **B. GitHub merge and release preparation** | Merge PRs per the chosen option. Open the missing Stage 4 and 6 PRs only if Option A. Release branch: G1–G7. Full local test run. Build the zip and the launch seed. Placeholder scan on both | A-gate | Me (code and PRs only after approval); owner (merges, or approves each merge) | 🛑 **B-gate:** `main` = approved Stage 6 plus release changes; tests green; zip and seed checksums recorded |
| **C. Production backup** | C1–C10 | B-gate | Owner | 🛑 **C-gate:** backups exist, are copied off the server, the restore has been tested (C8), and the public URL list is saved (C10) |
| **D. Theme and content deployment** | In a pre-announced window, **in mandatory private mode**: §3.6 steps D1–D10 (private ON → cache purge → **anonymous public-domain checks D2b** → Network off → Owner/slug check → import → tags/staff/nav → activate theme → settings → routes → redirects) | C-gate | Owner in Admin, following the step list; me guiding live | 🛑 **D-gate:** each step's check passes before the next |
| **E. Production configuration** | E1–E11, theme settings, meta, icon, OG image | D | Owner | (part of the D/E window) |
| **F. Staging and functional testing** | **While still private**: smoke test G6 with the private-site cookie (checks every author in `sitemap-authors.xml`), §7 checklists, placeholder scan, phone checks | E | Me (read-only test, if I can reach the site; otherwise the owner runs it); owner (visual review) | 🛑 **F-gate:** every check is green; screenshots reviewed |
| **G. Final launch approval** | Go/no-go review: risk register, open items, rollback ready | F-gate | Owner | 🛑 **G-gate: written "launch approved"** |
| **H. Public launch and post-launch verification** | §3.6 H1–H3: **private mode OFF** → purge the cache → anonymous smoke test **through https://himandme.my** (on failure: private mode back ON) → Lighthouse → Search Console (TXT record, owner) and submit the sitemap → watch logs for 48 h → re-check at 7 days | G-gate | Owner (dashboard actions); me (read-only checks) | 🛑 **H-gate:** sign-off at 48 h; Stage 7 closed |

**Server maintenance (separate track, §14.2):** M1 (mail) and M4 (www) must be done before Phase D; M2 and M3 are recommended before Phase C. Each M step has its own approval and is never bundled with a release phase.

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
| R7 | Cloudflare "Flexible" SSL or Rocket Loader: redirect loops or broken scripts | n/a | **Cloudflare proxy is off** (Phase A, I22: both names resolve to the server itself). Re-assess only if the proxy is ever turned on | ✅ n/a |
| R8 | Cloudflare caches `/ghost/` or previews | n/a | Proxy off (I22) | ✅ n/a |
| R9 | Let's Encrypt renewal fails (acme.sh, HTTP-01 on port 80) and the certificate expires | Low | Proxy off (I22); acme.sh cron 4×/day, next renewal 5 Jan 2027 (I12). **Constraint for M4:** keep the apex port-80 block and its ACME location unchanged | ✅ |
| R10 | Old URLs 404 after launch: lost rankings and links | Medium | Redirect map (S10) | ✋ O20 |
| R11 | Running destructive tests against production | **High** | The suites refuse non-localhost hosts (already enforced); production uses the GET-only smoke test | ✅ |
| R12 | Credentials exposed during the audit or backup | **High** | Filtered config command; never `cat` the config; secrets never in chat or the repo | ✅ Planned |
| R13 | Importer side-effects: `#Import` tag; tags without posts skipped; alternate quote lost | Low | Tags created by hand; articles written in Admin; `#Import` tag removed after checks (with approval) | ✅ Known |
| R14 | Mail not configured | — | **Superseded by R34** (Phase A: Direct mail cannot leave the server; device verification depends on it) | → R34 |
| R15 | Disk full during backups | Low | 49 GB free; database 4.3 MB, content 18 MB (I16) | ✅ |
| R16 | Analytics added without a privacy-notice update (PDPA) | Medium | O22 decided before launch; Notis Privasi updated by the owner first | ✋ |
| R17 | Prices, offer or hours out of date at launch | Medium | Confirm E8 in Phase A and again at the G-gate | ✋ |
| R18 | Logo files are owner-read-only in the zip | Low | G2 | ✅ Fix ready |
| R19 | Launching with no articles: empty blog sections | Low | Owner decision O23 | ✋ |
| R20 | `/jurnal/` listed in the sitemap as a redirect | Low | Accept, or noindex (S2) | ✅ Known |
| R21 | Blocks owned by a **non-doctor Owner account** (the importer's default): that account's taxonomy archive exposes them (**measured**, N2a) | **High** | O28: every block belongs only to `dr`. Case A at import; otherwise reassign the blocks to `dr`. An extra filtered channel (N2c) is temporary containment only. G6 checks block authorship and every author archive | ✅ O28 decided 19 Nov: blocks belong only to `dr`; safeguards G6 + G12 (§16.8) |
| R22 | Private mode does not protect the **Content API**: anyone with the public key can list and retrieve every published post during the migration (the 23 blocks, the 3 pages, any published article) | Low–Medium | The blocks and pages are approved public copy, served the same way after launch. Drafts are never exposed; test content is never imported. The key is not shown while private (P8) but may already be known. Optional: publish no article before H1 | ✋ O27 |
| R27 | The private `robots.txt` (`Disallow: /`, HTTP 200, `Cache-Control: public, max-age=3600`) stays cached after launch, so search engines are told to crawl nothing | Medium | Purge at H2; H3 requires the public robots.txt; re-check at +24 h; Search Console robots.txt report in Phase H | ✅ Planned |
| R26 | Cloudflare keeps serving cached copies of old public pages after private mode is on | Low | **Proxy off (I22): there is no Cloudflare cache in the path.** D2b still run unchanged (a missing `cf-cache-status` is a pass) | ✅ |
| R23 | Restoring the database while Ghost runs shows stale settings | Medium | `ghost stop` before and `ghost start` after (rehearsed) | ✅ |
| R24 | `mysqldump` PROCESS-privilege error goes unnoticed (exit code 0) | Medium | `--no-tablespaces`, run with `sudo`, and check `dump.err` is empty (C4) | ✅ |
| R25 | Staff access token for `ghost backup` exposed | Medium | Typed only at the prompt on the server; never in chat, files or the repository | ✅ Rule |
| R28 | Ghost 6.75's LLM features serve every block as Markdown at `/blog/{slug}.md` after launch (Phase A F11, measured locally: 23 of 23) | **High** | E12 off before H1 (tested: blocks then 404); §7.2 checks; G11 test; private mode covers it until H1 | ◐ **Mitigated:** LLM setting off (owner, 19 Nov); step 1 verified. Closes when all 23 block `.md` URLs return 404 after import (G11; §16.10) |
| R29 | `www.himandme.my`: certificate error over HTTPS; over HTTP the Nginx welcome page (I11, I13) | Medium | M4 steps N1–N3 (separate www certificate + 301 to apex), or O31 option C | ✅ Mitigated 18 Nov (M4 N1–N3; §15.5) |
| R30 | Member sign-up open on the live site; possible existing members' personal data | Medium | Count in I29; O18 decision before E2 ("Nobody") | ✅ Currently mitigated (19 Nov: 0 members, subscriptions Nobody; §16.1); O18 to confirm |
| R32 | SSH: root and password logins allowed; **no SSH key installed for any account**; **10,218 failed login attempts in 7 days**; port 22 open to all (I18, I20) | **High** | M2 (§14.4): break-glass VNC + key installed and proven first, then a drop-in disabling root and password login; fail2ban check (I32); owner confirms own logins (I34) | ✅ Mitigated 18 Nov (M2; §15.3) |
| R33 | 23 security updates pending (kernel, glibc, MySQL, perl, ca-certificates…); restart pending since 5 Nov; running kernel 6.8.0-138 (I1, I21) | **High** | M3 (§14.3): snapshot → `apt upgrade` → one reboot → checks | ✅ Mitigated 18 Nov (M3; §15.4) |
| R34 | Ghost mail `Direct` with outbound port 25 blocked, while staff device verification is on: **a login from any new browser or device cannot be completed**; resets and invites fail (I3, I26) | **High** | Keep the current Admin browser session; M1 SMTP via a provider before Phase D. Port 587 is only shown reachable; delivery and the second-browser verification must pass in M1 (§14.6) | ✅ Mitigated 18 Nov (M1, interim Gmail; see R37) |
| R35 | Nginx stock default site: welcome page for www and any unknown host over HTTP; unknown hosts and the bare IP over HTTPS reach Ghost with the apex certificate (I9, I13) | Low–Medium | M4 step N4 (catch-all: 444 on port 80, `ssl_reject_handshake` on 443), after N1–N3 | ✅ Mitigated 18 Nov (M4 N4; §15.5) |
| R36 | Automatic updates enabled but limited to `noble`, so **security updates are never installed automatically** (I21) | Medium | Add the `-security` origin (O35); reboots stay manual | ✅ **Mitigated** 20 Nov 2026 (M6 executed; first automatic runs 20 and 21 Nov installed security updates; MySQL excluded) (§16.11) |
| R37 | Ghost mail depends on an **interim Gmail SMTP** account (personal-account dependency, sending limits, no domain-aligned SPF/DKIM/DMARC for the site's sender identity) | Medium | Replacement provider as a future maintenance item; keep Gmail until every replacement test passes (§15.2) | ⏸ O34 deferred 19 Nov: Gmail kept for now (§16.9) |
| R38 | An older HSTS policy (`max-age=63072000; includeSubDomains; preload`, previously in `ssl-params.conf`) **may be cached** in browsers that received it; preload-list status unchecked | Low–Medium | Keep `max-age=300` during the N6 observation; no `includeSubDomains`/`preload` without validating every subdomain; check the preload status read-only (§15.5, §15.8) | ⏳ N6 |
| R39 | Staff-wide email 2FA setting in Ghost Admin is **off** (19 Nov). The config's `staffDeviceVerification: true` (new-device verification) is separate and was tested in M1 | Medium | Confirm how the two interact on Ghost 6.75, then decide; test with the original session open (§16.4) | ⏸ O38 deferred pending read-only investigation; both settings unchanged (§16.9) |
| R40 | Nginx `ssl-params.conf` permits **TLS 1.0/1.1** and **legacy ciphers** (I33) | Medium | **Protocols, done:** M5 (21 Nov 2026) restricted `ssl_protocols` to TLS 1.2/1.3 in `nginx.conf` and `ssl-params.conf`, verified (§16.11). **Ciphers, separate and optional:** the cipher suites were deliberately left unchanged (owner decision); a read-only cipher review, and any later cipher change, would be a separate decision | ◐ **Protocols fixed** 21 Nov 2026 (M5: TLS 1.2/1.3 only, verified); legacy ciphers unchanged by owner decision (§16.11) |
| R41 | **Eight accepted password logins** (6 on 17 Nov, 2 on 18 Nov) **not all confirmed** by the owner (I34). Not a confirmed breach | **High until explained** | Password login has been off since M2; read-only correlation and persistence checks (§16.2) | ✅ **Closed** 19 Nov (I34 resolved, §16.7) |
| R31 | No HSTS, Referrer-Policy, Permissions-Policy; X-Frame-Options only on `/ghost/` (I10) | Low–Medium | M4 step N5–N6 (snippet included in each HTTPS location; HSTS 300 s → 1 year; no preload) | ◐ Partly: N5 done 18 Nov; **N6 pending** (§15.5) |

---

## 11. Execution sequence and dependencies (summary)

```
Plan approved
  ┌─ Server maintenance track (own approvals): M1 mail → M2 SSH keys → M3 updates + reboot → M4 Nginx/www/headers
  │    (M1 + M4 before D; M2 + M3 recommended before C)
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
| AS1 | ✅ **Confirmed in Phase A** (Ubuntu 24.04.5, Ghost 6.75.0, MySQL 8.0.46, Node 22.23.4, Nginx 1.24.0, `/var/www/himandme`).  The server matches the stated stack (Ubuntu 24.04.5, Ghost 6.75.0, MySQL 8.0, Node 22, Nginx) and a standard Ghost-CLI layout under `/var/www/<site>` | I1–I6, I14 |
| AS2 | ✅ **Confirmed** (Ghost-CLI 1.34.1).  Ghost-CLI on the server behaves like 1.34.1 for `ghost backup` (staff token, zip content) | I2, C3 |
| AS3 | ✅ **Confirmed** (`auth_socket`).  MySQL root uses socket authentication, so backups need no password | I30 |
| AS4 | Ghost Admin is reachable and the owner has an Owner or Administrator login | Phase A |
| AS5 | The live site's Content API key may already be public (the old theme). It is never secret in any case | I27 (view page source) |
| AS6 | Ghost 6.75.0 behaviour measured locally (private mode, author archives, importer Owner rule) is the same in production. Same version; production mode instead of development; MySQL instead of SQLite | Phase F checks repeat the key measurements read-only |
| AS7 | This session still cannot reach himandme.my, so production checks are run by the owner (or here if network access is granted later) | — |
| AS8 | Cloudflare purge plus the response headers (`no-store`, `private`) are enough to stop edge copies of pages; D2b proves it on the real domain. robots.txt is the exception (cacheable for 1 hour), handled by D2b and H3 | D2b, H3 |

**Decisions needed (full list in the checklist, section 4):**
- **O1–O29** are all listed in the checklist (section 4): content, profile, business details, analytics, redirects, window, merge option. The ones added or changed since revision 1:
- **O27 (rewritten):** private mode protects the website but **not** the Content API. During the migration, anyone with the public key can retrieve the published blocks and pages. Accept this residual exposure of approved public copy (recommended), or state a stricter requirement (§3.6, R22).
- **O21 (clarified):** structured data. None, or `LocalBusiness` (recommended), or `MedicalBusiness`/a subtype **only** with confirmed healthcare-facility registration (§6.1).
- **New, O28:** block ownership, Case A (the doctor's account is the Owner) or Case B (an extra channel, or reassign the 23 blocks), after I31. *Decided 19 Nov 2026 (Update 6.4): the ownership rule "every `#blok` post belongs only to `dr`", with G6 and G12 (§16.8). The extra-channel option is now temporary containment only, not a resolution.*
- **Update 6.1 (18 Nov 2026):**
  - **Decided:** O31 = Option A; O36 approved (N4–N6, subject to the HSTS review).
  - **Executed:** O32 (M2) and O33 (M3).
  - **O34:** interim (Gmail working); long-term provider still open.
  - **O35:** open.
  - **N6:** owner decision after the observation review (§15).
- **New in revision 5 (Phase A server results):**
  - **O32:** approve the SSH key-only migration (M2, §14.4). Confirm VNC break-glass access, which device holds the key, and that a second copy exists.
  - **O33:** a maintenance window for the updates and reboot (M3, §14.3), about 2–5 minutes offline, after a Tencent snapshot.
  - **O34:** the mail provider for Ghost (M1, §14.6), plus approval of the SPF/DKIM DNS records it needs.
  - **O35:** enable automatic **security** updates (R36); reboots remain manual.
  - **O36:** approve the Nginx changes N4–N6 (catch-all and security headers, §14.5). N1–N3 come under O31.
  - **O31 (updated):** option A recommended (separate www certificate + redirect, §14.5 N1–N3).
- **New, O29:** confirm the architecture record is corrected to **23 blocks (12 + 8 + 3)**.

---

## 13. Consistency review (revisions 3–5)

Both documents were re-read after the revision 3 edits. Checked and aligned:

| Topic | Plan | Checklist |
|---|---|---|
| Blocks | 23 = 12 + 8 + 3, unchanged (§3.2) | V1, section 5, O29 |
| Private mode | Mandatory D1 → G-gate; D2b public-domain checks gate the import (pages, feeds and sitemaps 302; robots.txt 200 + `Disallow: /`; canonical redirect then private response); website only, not the API (§3.6, R1, R22, R26, R27, §9, §11) | Section 5, section 10 (phases D and H), V2 |
| Content API | Protects nothing in private mode; returns published blocks; O27 rewritten (§3.6, §7.2, R22, §12) | O27, V2 |
| Author archive | Slug in 4 places; Owner rule; every author checked (§3.7, R4, R21, §7.2) | G3, G10, O4, O28, section 8 |
| Backups | C1–C10, valid restore syntax, `ghost stop` rule (§8) | Section 9 (C1–C10) |
| Structured data | `LocalBusiness` recommended; no `MedicalBusiness` without evidence (§6, §6.1) | O21, S7 |
| Cloudflare | I24 adds Always Online and edge-TTL checks; R26 | I24 |
| Phase order | A → B → C (incl. C10) → D (D1, D2, D2b, …) → E → F → G → H (H1–H3) | Section 10 |
| Status | Phase A not started; nothing deployed | Header, section 10 |

Revision 4 re-check: the robots.txt rule (200, not 302) is the same in §3.6 (measurement table, D2b, H3), §6 S3, G6, R27, AS8 and the checklist.

**Update 6.7 (21 Nov 2026), documentation only:** adds §16.11 (M6 and M5 executed and verified, with the evidence) and the new runbook `docs/stage-7/MONTHLY-MAINTENANCE.md`. Updates R36, R40, O35, O37 and the M5/M6 rows.

**Update 6.6 (19 Nov 2026), documentation only:** adds §16.10 (O30 executed by the owner and step 1 verified by read-only requests; Phase A signed off). Updates R28, E12, O30 and the Phase A row in §9.

**Update 6.5 (19 Nov 2026), documentation only:** adds §16.9 (the owner's Phase A decision register, proposed O20 redirect mappings for verification, new maintenance steps M5/M6 approved in principle). Updates the status cells of R28, R36, R37, R39, R40 and E12. Nothing is executed.

**Update 6.4 (19 Nov 2026), documentation only:** adds §16.8 (O28 ownership rule; G6 extended; new G12; future enhancement FE1, multi-author attribution). Updates the R21 status, §1.4 and §3.7. Single-author attribution and the `dr` slug are unchanged.

**Update 6.3 (19 Nov 2026), documentation only:** adds §16.7 (I34 resolved; O39 done; R41 closed), with matching status cells in §2, §10 and §16. It also corrects the historical note in the header about 17 Nov. No other finding or decision changes.

**Update 6.2 (19 Nov 2026), documentation only:** adds §16 (the completed Phase A checks I18, I27–I29, I31–I34, E10, the LLM setting and staff 2FA; a consolidated report). It updates status cells in §2 and §10, and adds R39–R41 and decisions O37–O39. Historical sections are unchanged.

**Update 6.1 (18 Nov 2026), documentation only:** adds §15 (maintenance as executed), updates status cells in §2, §10 and §12, and adds R37, R38 and two notes in §14. Revision 6's text and decisions are otherwise unchanged; where the execution differed (www key EC-256 rather than RSA 2048), §15.6 records it.

**Revision 6 corrections:**
1. **§14.5 N2/N3:** the www certificate is now issued, then **installed** with `acme.sh --install-cert` to `/etc/nginx/ssl/www.himandme.my/{cert,fullchain,key}.pem`. N3 references exactly those paths. New §14.5a covers the steps, permissions, automatic renewal and deployment through the existing cron, checks for the first install and for renewals, proof that the apex is untouched (W0/V3), and rollback.
2. **§14.6, I26, R34:** port 587 is described as **reachable only**. STARTTLS, authentication and delivery are untested and must be proven in M1. M1 now ends only after a delivery test and a second-browser device-verification test.
3. **Re-checked:**
   - the checklist's N2/N3 wording matches the plan;
   - M4 keeps the apex certificate and acme.sh renewal;
   - M1–M4 each keep a separate approval;
   - Phases B–H remain unauthorised;
   - nothing was changed on the server or in Git (true when Revision 6 was written, 17 Nov 2026; the owner's 18 Nov maintenance is recorded in §15).

**Revision 5 reconciliation (Phase A server results):** corrected in this plan:
1. **Database name:** C4 and rollback level 3 now use the confirmed name `DB=himandme` (was a placeholder).
2. **Cloudflare:** R7, R8 and R9 are not applicable, and R26 is Low, because the Cloudflare proxy is confirmed off (I22). I23–I25 are not applicable. D2/H2 purges are no-ops and D2b treats a missing `cf-cache-status` as a pass.
3. **Mail:** R14 ("mail, Low") is superseded by R34 (High): Direct mail cannot be sent, and device verification depends on it.
4. **www:** D2b's www rows depended silently on a www fix. M4 or O31 option C is now an explicit prerequisite of Phase D.
5. **Assumptions:** AS1–AS3 are confirmed.
6. **I7:** reported as "1 error" because of a counting bug; it is 0.
7. **Headers:** §7.3 listed headers "ideally"; they now have exact values and the Nginx inheritance constraint (§14.5 N5).
8. **I20, I21:** the expected values ("keys only", "updates applied") were not met. They are now findings R32, R33 and R36, not passes.
9. **Separation:** server fixes are now a separate approval track (M1–M4), kept out of Phases B–H and out of GitHub.
10. **New read-only checks:** I32–I34.

No contradiction remains. Phase A first pass added G11, E12, R28–R31, O30 and O31 to the plan and the checklist alike. F4 (Cloudflare DNS-only, confirmed by I22 in revision 5) leaves the D2b procedure valid: a missing `cf-cache-status` counts as a pass. Two older notes were removed because they no longer applied:
- the phrase "the API is not a listing";
- "optionally in private mode", from revision 1.

---

## 14. Phase A results and the server maintenance track (M)

**Sources:**
- The owner's `phase-a-report.txt` (17 Nov 2026, 13:06 UTC) and `phase-a-investigation.txt` (13:32 UTC), both produced by read-only scripts.
- The public read-only checks.

**Nothing was changed on the server during the 17 Nov 2026 audit** (read-only); the results below are kept as a historical record. The owner's separate maintenance on 18 Nov 2026 is recorded in §15. Detailed analysis: `docs/stage-7/PHASE-A-SERVER-INVESTIGATION.md`.

### 14.1 Results per check (I1–I34)

> These are the **17 Nov 2026 audit results**, kept as evidence. Several were fixed by the maintenance on 18 Nov 2026: see §15.

| ID | Result | Status |
|---|---|---|
| I1 | Ubuntu 24.04.5 LTS; up 12 days. **Restart pending since 5 Nov 2026**: requested by `libc6`, `apparmor`, `linux-image-6.8.0-147-generic` and `linux-base`. Running kernel `6.8.0-138`; `6.8.0-147` is installed; `6.8.0-149` is pending | ⚠️ R33 |
| I2 | Ghost 6.75.0, Ghost-CLI 1.34.1, `running (production)`, systemd | ✅ |
| I3 | `url` https://himandme.my; Ghost on 127.0.0.1:2368; MySQL database **`himandme`**; mail transport **Direct**; `staffDeviceVerification: true` | ⚠️ R34 |
| I4 / I15 | `ghost doctor`: every check passes; Ghost connects to MySQL | ✅ |
| I5 | Node v22.23.4 (`/usr/bin/node`, NodeSource); 22.23.5 pending | ✅ |
| I6 | `ghost_himandme-my.service` enabled and active; runs as `ghost` (uid 999); `NODE_ENV=production` | ✅ |
| I7 | **0 errors** in 7 days (the first script counted journalctl's "-- No entries --" line as 1) | ✅ |
| I8 | Install folder `ubuntu:ubuntu` 775; `content/` `ghost:ghost`; no stray ownership | ✅ |
| I9 | `nginx -t` OK. **Stock `default` site still enabled** | ⚠️ R35 |
| I10 | Proxy to 127.0.0.1:2368. Upload limit 50 MB (HTTP) / 1 GB (HTTPS). No real-IP setting needed (nothing proxies in front). Each `location` sets only `X-Content-Type-Options`. `snippets/ssl-params.conf` is included (contents: I33) | ⚠️ R31 |
| I11 | Let's Encrypt (YR2), RSA 2048, **`himandme.my` only**, valid 5 Nov 2026 – 3 Feb 2027 | ⚠️ R29 |
| I12 | acme.sh v3.1.6 in `/etc/letsencrypt`; root cron 4×/day; webroot `/var/www/himandme/system/nginx-root`; reload command `nginx -s reload`; **next renewal 5 Jan 2027** | ✅ |
| I13 | `http://himandme.my` → 301 to https (issued by Ghost); `https://himandme.my` 200. `http://www` → **200 "Welcome to nginx!"**. `https://www` → **certificate error**. Unknown host over http → nginx welcome page; over https → **Ghost, with the apex certificate** | ⚠️ R29, R35 |
| I14 | MySQL active, 8.0.46-0ubuntu0.24.04.4 (security update to .5 pending) | ✅ |
| I16 | 49 GB free (14 % used); `content/` 18 MB; database 4.3 MB | ✅ |
| I17 | 3.6 GB RAM (2.2 GB available); 1.9 GB swap | ✅ |
| I18 | ufw active: deny incoming by default; 22, 80 and 443 allowed from anywhere (IPv4/IPv6). **Tencent security group not yet viewed** | 🔍 |
| I19 | 3306 and 2368 bound to 127.0.0.1 only; 22, 80 and 443 public | ✅ |
| I20 | **`PermitRootLogin yes` and `PasswordAuthentication yes`.** Set in `/etc/ssh/sshd_config` (lines 33 and 123) **and** `/etc/ssh/sshd_config.d/50-cloud-init.conf`. **No `authorized_keys` for root, `ubuntu` or `lighthouse`**, so every login today is by password. 7 days: **10,218 failed login attempts**, **5 accepted password logins for `ubuntu`**. `ssh.socket` active (socket activation). fail2ban installed, status unknown (I32) | ⚠️ R32 |
| I21 | **27 updates: 23 security, 4 other** (14.3). Automatic updates are enabled, but their allowed origins are only `o=Ubuntu,a=noble`, without `noble-security`. **So security updates are never installed automatically** (log: "No packages found that can be upgraded unattended") | ⚠️ R33, R36 |
| I22 | Both `himandme.my` and `www.himandme.my` resolve **directly to the server's own public address** (not a Cloudflare address). **The Cloudflare proxy is off (DNS-only).** Dashboard view optional | ✅ DNS-only |
| I23–I25 | Not applicable while the Cloudflare proxy is off | ✅ n/a |
| I26 | **Direct mail cannot be delivered:** outbound port **25 blocked**. Port **587 reachable** (TCP only; STARTTLS, authentication and delivery not tested). 0 mail errors logged so far | ⚠️ R34 |
| I27 | Public inventory done (Phase A findings). Drafts, routes and redirects need an Admin view | 🔍 |
| I28, I29, I31 | Admin views still needed (Network; member count and access; staff and Owner) | 🔍 |
| I30 | MySQL `root` uses `auth_socket`; `utf8mb4` / `utf8mb4_0900_ai_ci`; database `himandme` 4.3 MB | ✅ |
| **I32** | fail2ban: `sudo fail2ban-client status; sudo fail2ban-client status sshd` (read-only). Is the `sshd` jail active, and how many bans? | 🔍 new |
| **I33** | `sudo cat /etc/nginx/snippets/ssl-params.conf` (no secrets): it may contain `add_header` lines that are silently ignored (§14.5, step N5) | 🔍 new |
| **I34** | Owner confirms the 5 accepted password logins were theirs: `sudo journalctl -u ssh --since "7 days ago" --no-pager \| grep "Accepted password"` (times and source addresses) | 🔍 new |

**Corrections to earlier assumptions:** see §13.

### 14.2 Server maintenance track: separate from the website release

The server fixes are **not** part of the website release (Phases B–H) and use **no** GitHub branch, PR or theme file.
- **Own track:** they form a track **M1–M4**, each step with its **own written approval** (🛑) and its own rollback.
- **Approvals:** approving an M step does not approve any release phase, and the reverse is also true.

| Step | What | Fixes | Needs | Interruption | Dependency on the release |
|---|---|---|---|---|---|
| **M1** | SMTP mail for Ghost through a provider; **proven by a delivery test and a second-browser device-verification login** | R34 | O34 (provider account) | Ghost restart (~10 s) | **Before Phase D** (Admin logins from new devices need the emailed code) |
| **M2** | SSH key-only login | R32 | O32 | SSH reload; open sessions stay connected | Recommended before Phase C (backups are run over SSH) |
| **M3** | Security updates + reboot + automatic security updates | R33, R36 | O33, O35 | Reboot, ~2–5 min | **Before Phase C** (the C1 snapshot and backups should capture the patched system) |
| **M4** | Nginx: www certificate (issue + `--install-cert` + 443 block), redirect, catch-all, security headers. **The apex certificate and its renewal stay untouched** | R29, R35, R31 | O31, O36 | Nginx reloads only | **Before Phase D** (D2b's www rows need it, unless O31 = remove www) |

**Recommended order:** M1 → M2 → M3 → M4. M3 starts with its own Tencent snapshot. None of M1–M4 touches Ghost content, the theme or the database schema.

> **Update 6.1 (18 Nov 2026):** M1 ✅ (interim Gmail SMTP), M2 ✅, M3 ✅, M4 N1–N5 ✅, **N6 pending**. Details: §15.

### 14.3 Exact pending packages (apt cache of 17 Nov 2026, 02:06 +08:00)

**Security (23)**, all in `noble-updates` and `noble-security`:

| Package | Installed → available |
|---|---|
| `ca-certificates` | 20260816ubuntu0.24.04.1 → .2 |
| `libc-bin`, `libc-dev-bin`, `libc-devtools`, `libc6-dev`, `libc6`, `locales` | 2.39-0ubuntu8.9 → 8.12 |
| `libperl5.38t64`, `perl-base`, `perl-modules-5.38`, `perl` | 5.38.2-3.2ubuntu0.6 → 0.7 |
| `linux-firmware-amd-graphics` | 20240318.git3b128b60-0ubuntu3.4 → 3.5 |
| `linux-generic`, `linux-headers-generic`, `linux-image-generic`, `linux-libc-dev`, `linux-tools-common` | 6.8.0-147.147 → 6.8.0-149.149 (installs kernel 6.8.0-149) |
| `mysql-client-8.0`, `mysql-client-core-8.0`, `mysql-server-8.0`, `mysql-server-core-8.0`, `mysql-server` | 8.0.46-0ubuntu0.24.04.4 → .5 |
| `python3-pyasn1` | 0.4.8-4ubuntu0.3 → 0.4 |

**Other (4):**

| Package | Installed → available | Note |
|---|---|---|
| `distro-info`, `python3-distro-info` | 1.7build1 → 1.7ubuntu0.1 | — |
| `nodejs` (NodeSource) | 22.23.4 → **22.23.5** | Within Ghost 6.75.0's `^22.23.1` |
| `snapd` | 2.77.1 → 2.78 | — |

**Why the restart is pending:**
- `/var/run/reboot-required` dates from **5 Nov 2026, 16:27** (server set-up day), requested by `libc6`, `apparmor`, `linux-image-6.8.0-147-generic` and `linux-base`.
- The server still runs kernel **6.8.0-138**. 6.8.0-147 is installed, and the upgrade adds 6.8.0-149.
- `needrestart` reports the kernel as outdated (`KSTA 3`) and 7 services using replaced libraries: `cloud-final`, `dbus`, `getty@tty1`, `networkd-dispatcher`, `serial-getty@ttyS0`, `systemd-logind`, `unattended-upgrades`.
- **One reboot after the upgrade covers all of it.**

**Effects of the upgrade** (in M3, after its snapshot):
- MySQL restarts, so Ghost shows errors for a few seconds.
- libc and perl update in place.
- Node 22.23.5 takes effect at the next Ghost start, which the reboot provides.
- Ghost's service is enabled, so it starts on boot.

**Checks after the reboot:**
- `uname -r` shows `6.8.0-149-generic`;
- `ghost ls` shows running;
- `https://himandme.my/` returns 200;
- `sudo nginx -t` passes;
- `systemctl is-active mysql` shows active;
- `/var/run/reboot-required` is gone.

**R36 (automatic security updates):** add the security origin to `/etc/apt/apt.conf.d/50unattended-upgrades` (Ubuntu's default line is `"${distro_id}:${distro_codename}-security";`), or restore the packaged default file. Decision **O35**. Kernel updates still need a planned reboot; automatic reboot stays **off**.

### 14.4 SSH key-only migration (M2): prerequisites and sequence

**Current state:**
- **No account has an SSH key installed**; all access is by password, including the 5 logins this week.
- Root password login is allowed.
- 10,218 failed attempts in 7 days, about 1,460 a day: automated password guessing is under way.

**Prerequisites (all must be true before any SSH setting changes):**
1. **Break-glass access works:** the owner has opened the Tencent Lighthouse console's **VNC login** once and logged in as `ubuntu`. VNC goes through the console, not SSH, so it still works if SSH is misconfigured. Write down how to reach it.
2. **`ubuntu`'s own password is known.** It is still needed for `sudo` and for VNC after SSH passwords are turned off.
3. **A key pair exists on the owner's Windows computer**, created with:

   ```bash
   ssh-keygen -t ed25519
   ```

   Use a passphrase. The private key never leaves the computer and is never shared.
4. **The public key is installed for `ubuntu`:** `/home/ubuntu/.ssh` must be mode `700` and `authorized_keys` mode `600`, both owned by `ubuntu`. Today **no `authorized_keys` file exists for any user**, so this is the first step of M2 (a change, needing M2 approval). From Windows:

   ```bash
   type $env:USERPROFILE\.ssh\id_ed25519.pub | ssh ubuntu@<server> "umask 077; mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
   ```

5. **Key login proven without a password**, from a new window:

   ```bash
   ssh -o PreferredAuthentications=publickey -o PasswordAuthentication=no ubuntu@<server>
   ```

   Then `sudo -v` must succeed.
6. **A second copy of the key exists**, or a second authorised device, so the loss of one computer does not lock the owner out. VNC remains the last resort.
7. **Use one method only.** Tencent's console can also bind key pairs, and that may change SSH settings by itself. Do not use it during M2.

**Change sequence** (after the prerequisites, with the step-5 session kept open):
1. Create `/etc/ssh/sshd_config.d/00-himandme-hardening.conf` containing `PermitRootLogin no`, `PasswordAuthentication no`, `KbdInteractiveAuthentication no`, `PubkeyAuthentication yes`.
   - Why it wins: sshd keeps the **first** value it reads. `sshd_config` includes the drop-ins at line 12, before its own lines 33 and 123, and `00-…` is read before `50-cloud-init.conf`.
   - Leave the existing files unchanged; cloud-init may rewrite `50-cloud-init.conf`.
2. `sudo sshd -t` (no output = valid), then `sudo sshd -T | grep -Ei '^(permitrootlogin|passwordauthentication|kbdinteractiveauthentication) '` must show `no`, `no`, `no`.
3. `sudo systemctl reload ssh`. Open sessions are kept; `ssh.socket` and the port are untouched.
4. From a **second** window:
   - key login works;
   - `ssh -o PubkeyAuthentication=no -o PreferredAuthentications=password ubuntu@<server>` says **"Permission denied (publickey)"**;
   - `ssh root@<server>` is refused;
   - the Tencent VNC login still works.
5. **fail2ban:** after I32, confirm the `sshd` jail is enabled. With passwords off, it mostly reduces log noise.
6. **Rollback:** delete the drop-in and `sudo systemctl reload ssh`, from the open session or the VNC console.

**Accounts:**
- `lighthouse` (uid 1001) is Tencent's account. It has no key and is not in `sudo`. Leave it as it is; with passwords off, it cannot be logged into over SSH.
- `ghost` has the shell `/bin/sh` (Ghost-CLI default). No change.

### 14.5 Nginx and certificate sequence (M4)

**Constraints:**
- Do not edit Ghost-CLI's two files beyond one `include` line per location. Put new server blocks in **new** files (`ghost setup nginx/ssl` could regenerate the originals).
- **Keep the apex port-80 block and its `/.well-known/acme-challenge` location exactly as they are**, so the 5 Jan 2027 renewal keeps working.
- Before each step, copy the files it touches: `sudo cp -a /etc/nginx/sites-available ~/nginx-backup-$(date +%F)`.
- Every step is `sudo nginx -t`, then `sudo systemctl reload nginx` (no restart, no downtime). Rollback is to restore the copy, `nginx -t`, reload.

| Step | Change | Check after | Rollback |
|---|---|---|---|
| N1 | New file `himandme-www.conf`, port 80: `server_name www.himandme.my`; `root /var/www/himandme/system/nginx-root`; `location ^~ /.well-known/acme-challenge/ {}`; everything else `return 301 https://himandme.my$request_uri;` | `curl -sI http://www.himandme.my/x` → 301 to `https://himandme.my/x` (the welcome page is gone for www) | Remove the file, reload |
| N2 | **Issue** a separate certificate for `www.himandme.my` only (§14.5a, step W2). On failure, nothing is installed and Nginx is unchanged | `acme.sh --list` shows a `www.himandme.my` row; the apex row is unchanged | §14.5a, rollback R-a |
| N2b | **Install** it to the Nginx paths with `acme.sh --install-cert` (§14.5a, step W3): `/etc/nginx/ssl/www.himandme.my/cert.pem`, `fullchain.pem`, `key.pem`. Saves the paths and the reload command for every renewal | The three files exist; `key.pem` is mode 600, owned by root; the serials match (§14.5a, V1) | §14.5a, rollback R-b |
| N3 | New port-443 block in `himandme-www.conf`, referencing **exactly** `ssl_certificate /etc/nginx/ssl/www.himandme.my/fullchain.pem;` and `ssl_certificate_key /etc/nginx/ssl/www.himandme.my/key.pem;`, then `return 301 https://himandme.my$request_uri;` (§14.5a, step W4) | §14.5a, V2: www serves its own certificate and 301s to the apex; the apex is unchanged | §14.5a, rollback R-c |
| N4 | Catch-all: remove the **link** `sites-enabled/default` (keep the file). New `00-catch-all.conf`: `listen 80 default_server; listen [::]:80 default_server; server_name _; return 444;` and `listen 443 ssl default_server; listen [::]:443 ssl default_server; server_name _; ssl_reject_handshake on;` | Unknown host over http: connection closed. Unknown host or bare IP over https: handshake refused. Apex and www unchanged. ACME check: `curl -s http://himandme.my/.well-known/acme-challenge/x` still reaches the webroot (404 from nginx, not 301) | Restore the link, remove the file, reload |
| N5 | Security headers: first read I33. New snippet `snippets/himandme-security-headers.conf`: `Strict-Transport-Security "max-age=300" always`, `Referrer-Policy "strict-origin-when-cross-origin" always`, `Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(), usb=()" always`, `X-Frame-Options "SAMEORIGIN" always`. **Include it in every HTTPS `location`** that already has `add_header` (Nginx ignores server-level `add_header` in those). In `/ghost/`, avoid a duplicate `X-Frame-Options` | `curl -sI https://himandme.my/` and `/ghost/` show each header **once** | Remove the include lines, reload |
| N6 | After 7 clean days: HSTS `max-age=31536000`. `includeSubDomains` only when every subdomain is HTTPS. **No `preload`** | Header value | Lower the value (browsers keep the old one until it expires) |


### 14.5a www certificate: issue, install, renew (M4 steps N2, N2b, N3 in detail)

**Why `--install-cert` is needed:**
- `acme.sh --issue` only stores the certificate in acme.sh's own folder, `/etc/letsencrypt/www.himandme.my/`. Those files are acme.sh's working copies and are not meant to be read by Nginx.
- `acme.sh --install-cert` copies the certificate, chain and key to fixed **Nginx paths**. It also records those paths and a reload command in the domain's acme.sh settings, so **every later renewal copies the new files to the same paths and reloads Nginx automatically**.
- This step is never skipped, and N3 is never pointed at acme.sh's own folder.

**The apex certificate stays exactly as it is:**
- **Untouched:** its files in `/etc/letsencrypt/himandme.my/`, its settings (`himandme.my.conf`), its Nginx lines (written by Ghost-CLI) and its renewal (next 5 Jan 2027).
- **How:** every command below names **only** `-d www.himandme.my`. These are **never** run in M4: `--renew-all`, `--cron` by hand, `--force` on the apex, `--install-cert -d himandme.my`, and any edit or move inside `/etc/letsencrypt/himandme.my/`.
- **Fingerprint (W0, V3):** taken before and after M4 to prove the apex was not touched.

**Paths used** (`/etc/nginx/ssl/www.himandme.my/`):

| File | Content | Owner / mode |
|---|---|---|
| `cert.pem` | the www certificate (leaf only); used for checks | root / 644 |
| `fullchain.pem` | certificate + intermediate chain; **used by Nginx** (`ssl_certificate`) | root / 644 |
| `key.pem` | private key; **used by Nginx** (`ssl_certificate_key`) | **root / 600** |

Folder `/etc/nginx/ssl/www.himandme.my/`: root / 700. Nginx reads the key as root at reload.

**Steps (each after N1 is live, so `http://www.himandme.my/.well-known/acme-challenge/` is served from the webroot):**

| Step | Command (on the server) | Pass |
|---|---|---|
| **W0** Apex fingerprint (read-only) | `sudo sha256sum /etc/letsencrypt/himandme.my/himandme.my.conf /etc/letsencrypt/himandme.my/fullchain.cer > ~/m4-apex-before.txt; echo \| openssl s_client -connect 127.0.0.1:443 -servername himandme.my 2>/dev/null \| openssl x509 -noout -serial -enddate >> ~/m4-apex-before.txt` | File saved |
| **W1** Challenge path works for www | `echo ok-www \| sudo tee /var/www/himandme/system/nginx-root/.well-known/acme-challenge/m4-test >/dev/null; curl -s http://www.himandme.my/.well-known/acme-challenge/m4-test; sudo rm /var/www/himandme/system/nginx-root/.well-known/acme-challenge/m4-test` (create the `acme-challenge` folder first if it does not exist) | Prints `ok-www` |
| **W2** Issue (N2) | `sudo /etc/letsencrypt/acme.sh --issue --home /etc/letsencrypt -d www.himandme.my -w /var/www/himandme/system/nginx-root --keylength 2048` | "Cert success". `--keylength 2048` (RSA, like the apex) keeps the folder at `/etc/letsencrypt/www.himandme.my/` (an EC key would use a `_ecc` folder and need `--ecc` on every later command). No reload command here; it belongs to W3 |
| **W3** Install (N2b) | `sudo install -d -m 700 -o root -g root /etc/nginx/ssl/www.himandme.my` then `sudo /etc/letsencrypt/acme.sh --install-cert --home /etc/letsencrypt -d www.himandme.my --cert-file /etc/nginx/ssl/www.himandme.my/cert.pem --fullchain-file /etc/nginx/ssl/www.himandme.my/fullchain.pem --key-file /etc/nginx/ssl/www.himandme.my/key.pem --reloadcmd "systemctl reload nginx"` | Files copied; the reload runs and succeeds (Nginx does not use the files yet, so this reload changes nothing) |
| **W4** Use it (N3) | Add the port-443 server block below to `/etc/nginx/sites-available/himandme-www.conf` → `sudo nginx -t` → `sudo systemctl reload nginx` | `nginx -t` OK |

**The port-443 block (N3):**

```nginx
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name www.himandme.my;
    ssl_certificate     /etc/nginx/ssl/www.himandme.my/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/www.himandme.my/key.pem;
    include /etc/nginx/snippets/ssl-params.conf;   # same TLS settings as the apex
    return 301 https://himandme.my$request_uri;
}
```

**Verification: initial installation**

| Check | Command | Pass |
|---|---|---|
| V1 Files and permissions | `sudo ls -l /etc/nginx/ssl/www.himandme.my/; sudo stat -c '%a %U' /etc/nginx/ssl/www.himandme.my/key.pem` | 3 files; key `600 root`. If not 600, `sudo chmod 600` the key |
| V1 Settings saved for renewals | `sudo grep -E "^Le_(RealCertPath\|RealFullChainPath\|RealKeyPath\|ReloadCmd\|NextRenewTimeStr)=" /etc/letsencrypt/www.himandme.my/www.himandme.my.conf` | The three `Le_Real…` paths are exactly the paths above; `Le_ReloadCmd` is set (stored base64-encoded, as for the apex); a renewal date about 60 days ahead |
| V2 Served certificate | `echo \| openssl s_client -connect 127.0.0.1:443 -servername www.himandme.my 2>/dev/null \| openssl x509 -noout -subject -ext subjectAltName -serial -enddate` | `DNS:www.himandme.my`; serial **equal** to `sudo openssl x509 -in /etc/nginx/ssl/www.himandme.my/cert.pem -noout -serial` |
| V2 Redirect | `curl -sI https://www.himandme.my/abc` | `301`, `location: https://himandme.my/abc`, no certificate error |
| V3 Apex untouched | Repeat W0 into `~/m4-apex-after.txt`, then `diff ~/m4-apex-before.txt ~/m4-apex-after.txt` | **No difference** (same files, same serial, same expiry) |
| V3 Renewal list | `sudo /etc/letsencrypt/acme.sh --list --home /etc/letsencrypt` | Two rows: apex (renew 2027-01-05, unchanged) and www (its own date) |

**How renewal works afterwards (no new cron job):**
- The existing root cron (`acme.sh --cron --home /etc/letsencrypt`, 4 times a day) checks **every** certificate in `/etc/letsencrypt`, so it now includes www.
- When www is due (about 60 days after issue), acme.sh:
  1. renews it through the same webroot (N1 must stay in place);
  2. copies the new files to the three `Le_Real…` paths;
  3. runs `systemctl reload nginx`.
- The apex continues on its own schedule with its own settings.

**Verification: after a renewal**
- **Planned check** on the day after the www row's renewal date (from `acme.sh --list`):
  - V2 again: the served serial **changed** and still equals `cert.pem`'s serial;
  - the expiry moved forward;
  - V3 shows the apex unchanged, unless the apex's own renewal date has also passed;
  - `sudo grep -i www.himandme.my /etc/letsencrypt/acme.sh.log 2>/dev/null | tail` shows no error.
- **Optional end-to-end test during the M4 window**, if the owner wants proof before waiting 60 days: `sudo /etc/letsencrypt/acme.sh --renew --home /etc/letsencrypt -d www.himandme.my --force`.
  - This forces one real renewal of **www only**, then copies and reloads exactly as the cron would.
  - Then repeat V1–V3: the serial is new, and the apex is unchanged.
  - It uses one of Let's Encrypt's weekly certificates for this name; the limit is 5 per week.

**Rollback for a failed installation:**

| Failure point | Effect on the live site | Rollback |
|---|---|---|
| **R-a** W2 (issue) fails | None: Nginx is unchanged; http www still 301s (N1) | Fix the cause (usually W1) and retry, or abandon: `sudo /etc/letsencrypt/acme.sh --remove --home /etc/letsencrypt -d www.himandme.my` (removes www from renewals), then `sudo rm -r /etc/letsencrypt/www.himandme.my` (**only this folder; check the path**) |
| **R-b** W3 (install) fails, or V1 fails | None: Nginx does not reference the files yet | Fix and re-run W3 (it is safe to repeat), or abandon: R-a commands plus `sudo rm -r /etc/nginx/ssl/www.himandme.my` |
| **R-c** W4: `nginx -t` fails | None: **do not reload**; the old config keeps running | Remove the 443 block, `nginx -t` |
| **R-c** After the W4 reload, V2 or V3 fails | Only `https://www` is affected | Remove the 443 block → `nginx -t` → reload. If V3 shows the apex changed: stop; restore `/etc/nginx/sites-available` from the M4 backup copy, `nginx -t`, reload, then compare again |
| A later renewal fails to deploy | www keeps serving the previous certificate until it expires; the apex is unaffected | Read the acme.sh log; re-run W3 (`--install-cert`) by hand |

**Not needed:**
- **Cloudflare changes:** none. The proxy is off.
- **Plan steps D2/H2 (Cloudflare purges):** harmless no-ops. In D2b, a missing `cf-cache-status` counts as a pass.

### 14.6 Mail (M1): device verification depends on it

**Evidence:**
- `mail.transport: Direct`; outbound port 25 is **blocked**, so Direct mail cannot leave the server.
- **Port 587 is reachable:** a TCP connection to `smtp.gmail.com:587` opened. **This is all that was tested.**
  - **Not tested:** STARTTLS, authentication with a mail provider, or the actual delivery of an email.
  - That port 587 is reachable is a **necessary** condition for SMTP submission, not proof that it works.
  - **Successful delivery must be shown in M1**, with the chosen provider and Ghost itself (steps 4–6 below).
- `security.staffDeviceVerification: true`: Ghost emails a code at each staff login from a new browser or device.

**Consequence:**
- **A login from any new browser or device cannot be completed.** Password-reset and staff-invite emails fail the same way.
- 0 mail errors logged so far, so it has not been needed yet.

**Until M1 is done:**
- **do not log out** of the browser that is currently logged into Ghost Admin;
- **do not clear its cookies**;
- **do not start Phase D from another device.**

**M1 sequence (after O34):**
1. Create the provider account and a sending domain. This needs DNS records (SPF/DKIM) in Cloudflare: a **DNS change**, approved with M1.
2. **Reachability of the chosen provider (read-only):** `timeout 6 bash -c '</dev/tcp/<provider SMTP host>/587' && echo open`. If it is closed, use the provider's alternative port (465 or 2525) after the same test.
3. Set Ghost's mail config on the server with `ghost config` (SMTP host, port, `secure` as the provider requires, user, password). The credentials are typed only on the server and never in chat or the repository.
4. `ghost restart`.
5. **Delivery test (required):** send a staff invite or a password reset to the owner's own address.
   - **Pass:** it arrives in the inbox (check spam too), and Ghost's log (`ghost log`) shows no mail error.
   - **Fail:** a TLS or authentication error, or no email within 10 minutes. M1 is not done.
6. **Device-verification test (required):** while **keeping the original browser session open**, log in once from a **second browser** or private window.
   - **Pass:** the verification email arrives and the login completes.
   - Only after step 6 passes may the owner rely on logging in from new devices (for example in Phase D).
7. **Rollback:** restore the previous `mail` section (`Direct`), then `ghost restart`. The original browser session is still valid, so access is never lost.

**M1 is complete only when steps 5 and 6 have both passed.**

**Not recommended:** turning device verification off.

---

## 15. Server maintenance as executed: Update 6.1 (18 Nov 2026)

> **What this section is:** a record of the maintenance work the owner carried out on the production VPS on **18 November 2026**, under the M1–M4 track (§14.2), as **reported by the owner**.
> - It does not change any Revision 6 decision; where the execution differed from the Revision 6 procedure, the difference is recorded in §15.6.
> - No command in this section was run from this documentation session.
> - Credentials (the SSH private key, its passphrase, the SMTP password) are never recorded.

### 15.1 Status at a glance

| Step | Status (18 Nov 2026) | Risk |
|---|---|---|
| **M1** Mail | ✅ **Complete, with an interim provider** (Gmail SMTP). A replacement provider is a future maintenance item (§15.2) | R34 mitigated; R37 new |
| **M2** SSH | ✅ **Complete** | R32 mitigated |
| **M3** Updates + reboot | ✅ **Complete:** 27 upgraded, 7 newly installed, 0 removed, 2 phased updates deferred; rebooted (automatic security updates, O35: **not done**, still open) | R33 mitigated; R36 open |
| **M4** Nginx | ✅ **N1–N5 complete**; ⏳ **N6 pending** (HSTS observation, §15.5) | R29, R35 mitigated; R31 partly; R38 new |

### 15.2 M1: SMTP verification (complete, interim provider)

**Verified on 18 Nov 2026:**
- Ghost successfully delivered an email.
- The second-browser/device verification email arrived.
- The second-browser/device login verification succeeded.

So M1's two completion tests (§14.6, steps 5 and 6) both passed.

**Current configuration:** Gmail SMTP is working. **Gmail is temporary**, not the intended long-term provider (O34 stays open for the long-term choice).

**Future maintenance item (not started; needs its own approval):**
1. Select a replacement email provider.
2. Configure its SMTP settings in Ghost.
3. Configure the sender identity and domain authentication: **SPF, DKIM and DMARC** (DNS records, a DNS change).
4. Test Ghost staff-invitation and password-reset delivery.
5. Test the second-browser/device verification email and login.
6. **Keep the working Gmail SMTP configuration until every replacement test passes.**

### 15.3 M2: SSH hardening (complete)

**Completed on 18 Nov 2026:**
- Generated and installed an **Ed25519** public key.
- Tested a fresh key-only SSH connection successfully.
- Disabled root SSH login, password authentication and keyboard-interactive authentication; public-key authentication is on.
- Verified the effective configuration with `sshd -T`, and that SSH was active after the reload.

**Effective settings:** `PermitRootLogin no`, `PasswordAuthentication no`, `PubkeyAuthentication yes`, `KbdInteractiveAuthentication no`.

**Phase A audit items I32 and I34:** these remain **outstanding read-only audit items**.
- **I32:** the fail2ban `sshd` jail details were not reported.
- **I34:** the owner has not yet confirmed the five historical password logins. *(Resolved 19 Nov 2026: §16.7.)*

They were listed alongside M2 in §14.4, but they are **not M2 completion criteria**. Their being open does **not** mean M2 failed. M2's own checks passed: the fresh key-only login and the `sshd -T` values.

**Recovery:**
- The private key is protected by a passphrase.
- The owner keeps a backup copy on a secure USB drive.
- The **Tencent Cloud VNC console** remains the recovery route.

### 15.4 M3: Ubuntu updates and reboot (complete)

**Completed on 18 Nov 2026:**
- **Snapshot first:** Tencent Cloud system-disk snapshot **`himandme-pre-m3-updates-2026-11-18`**, taken before the updates.
- **Packages:** 27 upgraded, 7 newly installed, 0 removed, 2 phased updates deferred.
- **Reboot:** successful.

**Verified after the reboot:**

| Item | Version |
|---|---|
| Ubuntu | 24.04.5 LTS |
| Kernel | `6.8.0-149-generic` |
| Node.js | 22.23.5 |
| MySQL | 8.0.46 (Ubuntu package revision `…24.04.5`, reported as "8.0.46.5") |

**Active after the reboot:** SSH, Nginx, MySQL, Ghost (`ghost_himandme-my.service`), fail2ban. `nginx -t` passed.

**Not part of this completed task:** `apt autoremove` and any distribution upgrade.

### 15.5 M4: Nginx hardening (N1–N5 complete; N6 pending)

**Decisions recorded (18 Nov 2026):**
- **O31 = Option A:** a separate www certificate, with www redirected to the apex.
- **O36 = approved:** proceed with N4–N6, **subject to the HSTS review** (N6).

**N1: www HTTP redirect.**
- Created `himandme-www.conf`.
- `http://www.himandme.my` redirects to `https://himandme.my`.
- The apex HTTP server block and its ACME challenge configuration were preserved.
- DNS for `www` resolves to `129.226.93.8`.

**N2: separate www certificate.**
- Issued for `www.himandme.my` only, by Let's Encrypt.
- **ECDSA / EC-256** key (see §15.6).
- Valid from 18 Nov 2026 to **16 Feb 2027**.
- acme.sh renewal scheduled for **16 Jan 2027**.

**N2b: certificate installation.** Installed with `acme.sh --install-cert` and the reload command `systemctl reload nginx`. The existing root cron renewal process remains in place.

| File | Owner / mode |
|---|---|
| `/etc/nginx/ssl/www.himandme.my/` (folder) | root / 700 |
| `/etc/nginx/ssl/www.himandme.my/cert.pem` | root / 644 |
| `/etc/nginx/ssl/www.himandme.my/fullchain.pem` | root / 644 |
| `/etc/nginx/ssl/www.himandme.my/key.pem` | root / 600 |

**N3: www HTTPS redirect.**
- HTTPS www redirects to the apex over HTTPS. Both the HTTP and the HTTPS www redirects were verified.
- Apex HTTPS returns HTTP 200.
- **The original apex certificate's fingerprint and serial were unchanged:**

| Apex certificate | Value |
|---|---|
| Subject | `himandme.my` |
| Serial | `06695E5BCF4574FB421FBFF376F940009541` |
| Expiry | 3 Feb 2027 |
| SHA-256 fingerprint | `F7:04:58:18:1E:86:CE:4A:E0:37:DF:A4:AC:65:CD:A3:B0:5A:D7:3D:D3:3E:C7:C9:DD:E5:21:DF:AC:50:B9:10` |

**N4: default-server catch-all.**
- Removed the enabled stock default-site symlink; the original default configuration file is preserved.
- Created `00-catch-all.conf`.
- Unknown HTTP host names get Nginx **444** (connection closed).
- Unknown HTTPS host names get their **TLS handshake rejected**.
- The apex and www still work, and the ACME challenge paths are still reachable.

**N5: security response headers.**
- Created `/etc/nginx/snippets/himandme-security-headers.conf`, applied consistently to all **three apex HTTPS proxy locations**.
- Ghost's own upstream `X-Frame-Options` was hidden with `proxy_hide_header X-Frame-Options;` to remove the duplicate. The final check showed **exactly one** `X-Frame-Options: SAMEORIGIN` on the homepage and on Ghost Admin.
- `nginx -t` passed and the reload succeeded.

| Header | Verified value |
|---|---|
| `Strict-Transport-Security` | `max-age=300` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=(), usb=()` |
| `X-Frame-Options` | `SAMEORIGIN` (one copy) |
| `X-Content-Type-Options` | `nosniff` |

**N6: HSTS observation. PENDING, not complete.**
- **Current HSTS response:** `max-age=300`.
- **The previous policy:** `/etc/nginx/snippets/ssl-params.conf` previously contained `max-age=63072000; includeSubDomains; preload` (this answers I33 for the HSTS line).
- **That older policy may still be cached** in browsers that received it. **It is not claimed that any browser's HSTS state has been cleared** (see R38 and §15.8 B).
- **Observation period:** from **18 Nov 2026**; target review **around 25 Nov 2026**. Keep `max-age=300` throughout.
- **Review items (read-only):**
  - apex and www HTTPS availability;
  - certificate validity and both renewal configurations;
  - Nginx error log;
  - any unexpected host-name behaviour.
- **Rules:**
  - Do **not** reintroduce `includeSubDomains` or `preload` without separately validating every relevant subdomain and considering what the HSTS preload list implies.
  - After **seven clean days**, review whether a one-year policy (`max-age=31536000`) is appropriate. **It is not implemented automatically.** Raising it needs the owner's decision after the review.

### 15.6 Differences between the Revision 6 procedure and the execution

| Item | Revision 6 (§14.5a) | Executed | Effect |
|---|---|---|---|
| www key type | RSA 2048 (`--keylength 2048`), to keep acme.sh's folder name without `_ecc` | **ECDSA / EC-256** | Works with Nginx and renews through the same cron. acme.sh normally keeps an EC certificate's working copy in a folder ending `_ecc` (`/etc/letsencrypt/www.himandme.my_ecc/`), and manual acme.sh commands for it (`--renew`, `--remove`, `--install-cert`) then need **`--ecc`**. §14.5a's rollback commands R-a/R-b should be read with `--ecc` added. Nginx uses the installed copies in `/etc/nginx/ssl/www.himandme.my/` either way. *Recommend confirming the folder name read-only at the N6 review* |
| Headers | Snippet included in every HTTPS location that has `add_header` | Applied to the three apex HTTPS proxy locations | Matches. Whether the www HTTPS 301 response carries the headers was not reported (it only redirects) |

### 15.7 Final health check (18 Nov 2026)

| Check | Result |
|---|---|
| Nginx syntax | Passed |
| Nginx | Active |
| MySQL | Active |
| Ghost | Active |
| SSH | Active |
| Fail2ban | Active |
| Apex HTTPS | HTTP 200 |
| WWW HTTPS | HTTP 301 |
| Security headers | All present |
| Unknown HTTP host | Connection closed |
| Root filesystem | 15 % used, 49 GB available |

**Certificate renewal inventory:**

| Certificate | Renewal scheduled |
|---|---|
| `himandme.my` | 5 Jan 2027 |
| `www.himandme.my` | 16 Jan 2027 |

### 15.8 Items still open after the maintenance

**A. Read-only Phase A items** (views and read-only commands run by the owner; nothing changes):
1. **I32:** fail2ban `sshd` jail details (fail2ban itself is active).
2. **I34:** owner confirmation of the 5 historical password logins. *(Resolved 19 Nov 2026: §16.7.)*
3. **I33:** the rest of `ssl-params.conf` (only its HSTS line is known).
4. **Ghost Admin views:** Network, members, staff/Owner, integrations, the LLM setting.
5. **Tencent console view:** the security group.

**B. N6 observation review** (read-only checks, around **25 Nov 2026**, §15.5):
1. apex and www HTTPS availability;
2. certificate validity and both renewal configurations;
3. Nginx error log and unexpected host-name behaviour;
4. the acme.sh folder name for the EC-256 www certificate (§15.6);
5. whether `himandme.my` appears on the HSTS preload list.

On the old HSTS policy:
- On 17 Nov 2026 the public Phase A check saw **no** `Strict-Transport-Security` header on the homepage (PHASE-A-FINDINGS, "Other public results"). That is consistent with Nginx ignoring the snippet's server-level `add_header` inside locations that set their own headers.
- So the 2-year `includeSubDomains; preload` policy **may never have been delivered**. This is **not proven** for every path and date, so the cautious assumption in §15.5 stands.

**C. Future owner decisions** (not read-only checks; nothing here is authorised or started):
1. **N6:** whether to raise HSTS after the review. It stays `max-age=300` until then.
2. **O35:** automatic security updates (R36). Not done in M3.
3. **O34 (long-term mail provider):** a future owner decision (§15.2).
   - **Gmail SMTP stays unchanged** as the working temporary provider.
   - No provider migration is authorised or initiated.

### 15.9 Authorisation and the next authorised action

**Authorisation as of 18 Nov 2026:**
- **Completed:** M1–M3, and M4 N1–N5.
- **M4 N6:** pending observation, no change authorised. HSTS stays `max-age=300`.
- **Phases B–H remain unauthorised.** No production theme deployment, and no production theme, code or content change.
- **No further server changes are authorised:** none to the VPS, SMTP, certificates or Nginx, including no HSTS increase.

**Next authorised action:** **read-only** work only.
1. Finish the read-only Phase A items in **§15.8 A**: views and read-only commands run by the owner.
2. **Around 25 Nov 2026**, run the N6 observation review in **§15.8 B** (read-only).
3. Present the results so the owner can decide on N6, and separately on the other **§15.8 C** decisions and on Phase B.

> **Update 6.2 (19 Nov 2026):** the §15.8 A items have since been checked. Results, open findings and the current next steps are in **§16.5**.

The §15.8 C items are **decisions, not authorised work**. In particular, no mail-provider migration is authorised, and Gmail SMTP stays unchanged.

---

## 16. Phase A completion checks: Update 6.2 (19 Nov 2026), consolidated report

> **What this section is:** a record of the read-only Phase A checks the owner carried out after Update 6.1: Ghost Admin views, the Tencent console and three read-only server commands. **Results are as reported by the owner.**
> - **No production change was made during this audit:** no setting, toggle, file, firewall rule, DNS record or Nginx line was changed.
> - **No command was run from this documentation session.**
> - **Earlier evidence stands:** the 17 Nov audit (§14) and the 18 Nov maintenance record (§15) are unchanged history. Where a current observation differs from an earlier one, both are recorded.
> - **Phase A is not closed:** it stays open until these findings, and the decisions below, have been presented to the owner and the A-gate is decided.

### 16.1 Completed checks

| ID | Check | Current observation (owner, 19 Nov 2026) | Assessment |
|---|---|---|---|
| **I18** | Tencent firewall (inbound) | TCP **443**, **22**, **80**: allow, all IPv4. **ICMP**: allow, all IPv4. **No** public inbound rule for MySQL **3306** or Ghost **2368** | ✅ Matches the plan. Together with I19 (3306 and 2368 bound to 127.0.0.1) and ufw (I18, 17 Nov), the database and Ghost are not reachable from the internet. ICMP (ping) allowed: informational, low. Port 22 open to all IPv4 is acceptable with key-only SSH and fail2ban; restricting it to known addresses stays optional |
| **I27** (Admin part) | Drafts, scheduled, routes, redirects | **0** draft posts, **0** scheduled posts, **0** draft pages, **0** scheduled pages. `routes.yaml` is **Ghost's default** (`/{slug}/`, `/tag/{slug}/`, `/author/{slug}/`). `redirects.yaml` has **empty** 301 and 302 sections | ✅ Nothing unpublished to migrate or protect. Default routes are expected before the release (this theme's `routes.yaml` is only uploaded at D9). No existing redirects need preserving; O20's new entries start from empty |
| **I28** | Ghost Network | **OFF** | ✅ The pre-import condition (R2) holds today. It must be **re-checked at D3**, immediately before any import |
| **I29** | Membership | **0** members. Browsing: **Public**. Subscriptions: **Nobody**. New posts: **Public**. Comments: **Nobody** | ✅ No member personal data. E2 and E3 already look as planned. O18 stays for the owner to confirm formally. *Note: on 17 Nov the public site API reported `allow_external_signup: true` and loaded the Portal script (PHASE-A-FINDINGS F8). The Admin setting now reads "Nobody". When or why that changed was not established; both observations are kept* |
| **I31** | Staff | **Dr Imran** is the **only** staff account, role **Owner**, slug **`dr`** | ✅ **§3.7 Case A applies:** the doctor's account is the Owner, so imported blocks will belong to the doctor, and no extra filtered channel is needed (R21). The slug `dr` equals the `routes.yaml` placeholder (O4). O28 and O4 can be confirmed by the owner on this basis |
| **E10** | Custom integrations | **None** | ✅ Nothing to remove |
| **LLM setting** | "Enable structured data for LLMs and AI search engines" | **ON** | ⚠️ **R28 stays High.** Must be **off before H1** (O30). It is covered by private mode until then (§3.6). **Not changed** in this audit |
| **Staff 2FA** | Staff-wide email 2FA setting in Ghost Admin | **OFF** | ⚠️ **Security observation (R39), not a completed change.** Separately, the server config has `security.staffDeviceVerification: true` (I3), and its new-device email verification was tested working in M1. How that config value and the Admin setting interact on Ghost 6.75 should be confirmed before any change. **Not changed** in this audit |
| **I32** | fail2ban | Active; **one** jail (`sshd`). Total failed **262**, currently failed **3**, total banned **6**, currently banned **0** | ✅ Working as a rate-limiter. With password login disabled (M2), failed attempts can no longer succeed by guessing |
| **I33** | `ssl-params.conf` | Permits **TLS 1.0, 1.1, 1.2 and 1.3** and includes **legacy cipher suites** | ⚠️ **Finding (R40).** TLS 1.0 and 1.1 are deprecated. Remediation needs separate owner approval (O37); **nothing was changed** |
| **I34** | Accepted password logins | **Six** on **17 Nov** from `60.50.85.64`, **two** on **18 Nov** from `124.82.77.26`. **The owner cannot confirm all eight** | ⚠️ **Unresolved (R41). Not classified as a confirmed breach** (16.2) *(Update 6.3: **resolved**, §16.7)* |

### 16.2 I34: unresolved, and why it is not called a breach

> **Superseded (Update 6.3):** I34 was resolved on 19 Nov 2026 (§16.7). This section is kept as the record of the Update 6.2 state.

**Facts:**
- Eight password logins were accepted before password login was disabled in M2 (18 Nov):
  - **six on 17 Nov** from `60.50.85.64`;
  - **two on 18 Nov** from `124.82.77.26`.
- The owner cannot confirm that all eight were theirs.

**Context (not a conclusion):**
- On 17 Nov the owner ran two read-only audit scripts over SSH. The reports are timed 13:06 and 13:32 UTC.
- On 18 Nov the owner carried out M1–M4 over SSH, starting while password login was still enabled.
- So owner logins are expected on both days. Whether they account for all eight has not been established.
- The earlier figure, "5 accepted password logins in the 7 days to 17 Nov 13:32 UTC" (I20), covered a different time window, so the two counts are not directly comparable.

**Why it stays open:** an unconfirmed login cannot be closed on assumption, and it cannot be called a breach without evidence.

**Current protection:**
- Password and root logins have been **disabled since M2**.
- Only the owner's Ed25519 key is accepted.
- fail2ban is active.

**Suggested read-only next checks** (O39: the owner decides whether to run them; nothing changes):
1. **Match times to the owner's own activity:** list the eight logins with their times, then compare them with the owner's own records (when the scripts were run, when M1–M4 work started), and with the owner's home and mobile public addresses on those days.
2. **Session activity:**
   - `sudo journalctl _COMM=sudo --since "2026-11-17" --until "2026-11-19" --no-pager`: the commands run with sudo;
   - `last -F -i | head -30`: session start and end times.
3. **Signs of persistence:**
   - the keys in `~ubuntu/.ssh/authorized_keys` (fingerprints only; there should be exactly the owner's key);
   - user accounts with a login shell;
   - root's and the user's crontabs;
   - `systemctl list-unit-files --state=enabled`;
   - listening ports (compare with I19).

**Outcomes:**
- If every login and command is accounted for, I34 can be closed.
- If anything is unexplained, escalate to an owner decision: credential rotation, a fuller review, or a rebuild from the pre-M3 snapshot or a clean image.

**Privacy:** the two source addresses are recorded here because the owner supplied them for the audit. If they are the owner's own connection, they are personal data. Consider masking them (for example `60.50.x.x`) before this repository is shared beyond the owner.

### 16.3 Outstanding checks and security findings

| Item | Status | Next |
|---|---|---|
| **I34** unconfirmed logins | ✅ **Resolved** 19 Nov (§16.7) | None: O39 done |
| **I33 / R40** TLS 1.0/1.1 and legacy ciphers | ⚠️ Finding | Owner decision O37 (a new maintenance step; see 16.4) |
| **R39** staff-wide email 2FA off | ⚠️ Observation | Owner decision O38 |
| **R28** LLM setting on | ⚠️ High, unchanged | Owner decision O30 (off before H1) |
| **M4 N6** HSTS | ⏳ Pending | Read-only review **around 25 Nov 2026**; `max-age=300` until then (§15.5) |
| **R36 / O35** automatic security updates | Open | Owner decision |
| **O34** long-term mail provider | Open | Owner decision; Gmail stays unchanged |
| Phase A presentation | Pending | This report, for the owner's review |

### 16.4 Risks requiring owner decisions

| ID | Risk | Severity | Recommendation | Decision |
|---|---|---|---|---|
| **R41** | Eight password logins not all confirmed by the owner (I34) | **High until explained** | Run the read-only checks in 16.2; do not treat as a breach without evidence; escalate if anything is unexplained | ✅ **O39 done; R41 closed** (§16.7) |
| **R40** | Nginx accepts TLS 1.0/1.1 and legacy ciphers (I33) | Medium | A new maintenance step **M5**, after approval: set `ssl_protocols TLSv1.2 TLSv1.3;` and a modern cipher list (for example Mozilla's "intermediate" profile) in `ssl-params.conf`, which the apex and www blocks share. Then `nginx -t`, reload, and test apex and www. Copy the file first for rollback. Very old clients (pre-2014) would lose access | **O37** |
| **R39** | Staff-wide email 2FA off in Ghost Admin | Medium | First confirm how this setting relates to `staffDeviceVerification: true` on Ghost 6.75. If enabling it, test with the original session kept open (mail works since M1) | **O38** |
| **R28** | LLM setting on: blocks readable as `.md` after launch | **High** | Turn off before H1 (tested locally) | **O30** |
| R36 | Security updates not automatic | Medium | Add the `-security` origin | O35 |
| R37 | Interim Gmail SMTP | Medium | Replacement provider later; keep Gmail until tested | O34 |

### 16.5 Recommended next steps and approval gates

1. **Owner review of this report**, which is the Phase A presentation.
2. ~~I34 read-only checks~~ **Done 19 Nov 2026: I34 resolved (§16.7).**
3. **N6 HSTS review around 25 Nov 2026** (read-only), then the owner decides whether to raise HSTS.
4. **Owner decisions:**
   - **A:** O37 (TLS, a new M5 step), O38 (2FA), O30 (LLM, before H1), O35, O34, O18, O28 and O4.
   - **B:** the content inputs in the checklist, section 4.
5. **🛑 A-gate:** the owner accepts the Phase A findings. (The I34 condition is met: resolved, §16.7.)
6. **Only after a separate written approval:** Phase B (GitHub merge and release preparation). **Server changes** (M5 TLS, 2FA, LLM toggle, HSTS increase) each need **their own** approval, and none is authorised by this report.

### 16.6 Authorisation (unchanged)

- **Done:** M1–M3, and M4 N1–N5. **N6 pending**; HSTS stays `max-age=300`.
- **Not authorised:**
  - any server, Ghost, DNS, Nginx or firewall change;
  - the LLM and 2FA toggles, which stay as they are;
  - Phases B–H, and production theme deployment.
- **Phase A:** open.

### 16.7 I34 resolved: Update 6.3 (19 Nov 2026)

> **What this section is:** the result of the O39 read-only investigation, which the owner carried out on the production VPS after Update 6.2.
> - **No command was run from this documentation session, and no production change was made.**
> - **Sources:** owner-confirmed facts (what the owner recognises as their own activity) are kept separate from technical findings (what the read-only command output showed, as reported by the owner).

**Result:** ✅ **I34 is resolved.**
- All eight accepted password logins are the owner's own connections.
- No unexpected account, key, scheduled task or public listener was found.
- All eight investigated password logins were confirmed by the owner as authorised. The read-only checks found no evidence of unexplained access or persistence within the scope of this investigation. No evidence of a security breach was identified. R41 is closed, and O39 is done.

**A. Owner-confirmed facts**

| Item | Confirmed by the owner |
|---|---|
| SSH password logins | All **eight** were the owner's own connections: **six on 17 Nov 2026** from `60.50.85.64` and **two on 18 Nov 2026** from `124.82.77.26` |
| Key logins | The later successful ED25519 key logins matched the owner's key and originated from the owner's confirmed connection |
| `sudo` history | The Ghost service troubleshooting and configuration changes recorded on **17 Nov 2026** were the owner's own work. The recorded commands match the documented audits and maintenance |

**B. Technical findings (read-only command output, as reported by the owner)**

| Check | Finding |
|---|---|
| Interactive accounts | No unexpected interactive account |
| `/home/ubuntu/.ssh/authorized_keys` | Exactly **one** ED25519 key, fingerprint `SHA256:B1ia0qxNC+8QAAfc8XGVkkEtuyREnFr0ipULkHVuEmk` |
| Root crontab | The **acme.sh** renewal task and the **Tencent Stargate** task |
| Tencent agents | Stargate process `/usr/local/qcloud/stargate/bin/sgagent -d` running as root; `tat_agent.service` active. The Stargate directory and executable were inspected |
| Tencent origin | The owner verified against Tencent Cloud documentation that `/usr/local/qcloud/stargate` and its five-minute cron task are standard Tencent Cloud components. The owner did not recognise the agent at first; the documentation check established its Tencent origin |
| Public listeners | TCP **22**, **80**, **443** only |
| Local-only listeners | MySQL `127.0.0.1:3306`, Ghost `127.0.0.1:2368`, MySQL X Protocol `127.0.0.1:33060` |
| Conclusion | No unexpected public application listener |

**Notes:**
- **Do not remove or disable Stargate or TAT.** They are Tencent Cloud's monitoring and automation agents.
- **The 17 Nov activity:** the owner's `sudo` history shows the owner's own Ghost service troubleshooting and configuration changes on 17 Nov. That work was **separate from** the read-only Phase A audit scripts, which changed nothing. The plan's historical note is corrected to say so.
- **MySQL X Protocol** (`33060`) is bound to localhost only. It was not listed in I19 because that check filtered for specific ports. It is not exposed publicly, and nothing needs to change.

**Effect on status:**
- **I34:** ✅ resolved.
- **R41:** ✅ closed.
- **O39:** ✅ done.
- **Unchanged:**
  - every other open finding and decision (R28/O30, R39/O38, R40/O37, R36/O35, R37/O34, O18, O28, O4);
  - the N6 HSTS review (around 25 Nov 2026, `max-age=300`);
  - **Phase A stays open** until the owner reviews the findings and decides the A-gate;
  - **Phases B–H remain unauthorised.**

### 16.8 O28 block ownership rule and multi-author safeguards: Update 6.4 (19 Nov 2026)

> **Decision recorded:** the owner approved the O28 ownership rule and safeguards G6 and G12 on 19 Nov 2026. This is a **documentation-only** decision: no code, theme, route, Ghost or server change.

**Current design (unchanged by this update):**
- **One** Ghost author profile, Dr Imran, slug **`dr`**.
- Every article says **"Ditulis dan disemak oleh Dr. Imran"**.
- The author box and the credentials line (theme setting `doctor_credentials`) stay as they are.

**O28: the ownership rule.**
> **Every `#blok` post has `dr` as its only author.**

- **Why it is enough:**
  - The doctor's archive `/blog/penulis/dr/` is a filtered route that excludes blocks (tested, §3.7).
  - Any other author's archive uses Ghost's standard author route, which ignores filters but lists only that author's own posts.
  - So blocks can appear on an author page **only if a block lists that author** (N2a).
  - While the rule holds, **additional authors of any role can be added without changing `routes.yaml` or the theme.**
- **How the rule is met at launch:** Ghost gives authorless imported posts to the account that is Owner **at import time**. Dr Imran is the only staff account and the Owner (I31), and that is re-checked at D4.
- **How it could break** (none of these happens automatically when an author is added):
  1. An Editor, Administrator or the Owner adds another author to a block. Author and Contributor roles cannot edit other people's posts.
  2. The `dr` account is deleted: Ghost reassigns its posts to the current Owner.
  3. Blocks are re-imported while someone else is Owner.
  4. The `dr` slug is changed. It stays `dr`.
- **If it is ever broken:**
  1. **Primary recovery:** reassign the affected block so that `dr` is its **only** author. This is the only action that restores the O28 rule.
  2. **Exceptional temporary containment:** while ownership is being corrected, a filtered route for the other author's slug (the N2c pattern, tested) may be added to stop public exposure. **O28 remains unresolved until the block belongs exclusively to `dr`**, and G6 keeps failing until then. Remove the containment route afterwards, unless it is needed for another reason.
- **Operating rules:**
  - never add authors to a block;
  - give new writers the Author or Contributor role where possible;
  - re-run G6 after any staff change (new account, role or Owner change, deletion).

**Safeguards approved (built in Phase B; not built now):**

| ID | Safeguard | Type |
|---|---|---|
| **G6** (extended) | The production smoke test also checks: (a) through the public Content API, every `#blok` post has exactly one author, `dr`. **G6 fails if any block has any author other than `dr`, even when a containment route hides it**; (b) **every** author listed in `sitemap-authors.xml` with the existing archive inspector (all pages and RSS, no block). Runs in Phase F (private cookie), at H3 (anonymous) and after any staff change | Read-only |
| **G12** (new) | A local test: an additional author with the **Author** role and only real articles. Their archive, pagination and RSS list only their articles and never a block; the `dr` archive is unchanged | Local only |

**Noted, no action:** the public Content API (with the public key) can report the `dr` author's post count, and that count includes the 23 blocks. The theme never displays author post counts. This is the same category as O27.

**Future enhancement FE1: multi-author attribution (not in scope; nothing changes now).**
- **Today:** the article byline ("Ditulis dan disemak oleh …"), the author box and the `doctor_credentials` line assume a single medical author. They would show the doctor's credentials for any author.
- **When to revisit:** only if additional authors are introduced. At that point, design the distinction between the **article author** and the **medical reviewer** (for example, per-author credentials, or a separate reviewer line).
- **Until then:** the single-author attribution stays exactly as it is.

**Effect on status:**
- **Changed:** O28 ✅ decided. R21 is mitigated by the rule plus G6/G12. G12 is added to the Phase B list.
- **Unchanged:**
  - O4 (`dr` is kept as the slug, but O4 is not formally closed by this update);
  - all other open decisions (O30, O34, O35, O37, O38, O18 and the O1–O29 inputs);
  - N6;
  - Phase A stays open;
  - Phases B–H remain unauthorised.

### 16.9 Phase A owner decision register: Update 6.5 (19 Nov 2026)

> **What this section records:** the owner's Phase A decisions of 19 Nov 2026.
> - **Decisions are not execution.** Recording an approval here does **not** carry out any server or Ghost Admin change. Each approved change is done later as its own step, with its procedure, backup and verification.
> - **Phases B–H and production deployment remain unauthorised** until the owner approves Phase B in writing.

**Security and infrastructure**

| ID | Decision (owner, 19 Nov 2026) | Type | Status / next step |
|---|---|---|---|
| **O30** | **Turn the LLM setting OFF now.** The hidden blocks must not be exposed through Markdown (`.md`) addresses | Ghost Admin change | ✅ **Executed by the owner 19 Nov 2026; step 1 verified (§16.10).** The owner switches off Settings → General settings → Meta data → "Enable structured data for LLMs and AI search engines". **Read-only verification:** (1) **straight after the change:** `https://himandme.my/llms.txt` no longer returns the LLM index, and an existing post's `.md` address (for example `/coming-soon.md`, while that post is still published) no longer returns Markdown; (2) **after the blocks are imported (Phase F, and again at H3):** **every one of the 23 hidden-block addresses `/blog/{block-slug}.md` returns 404** (G11; tested locally: all 23 return 404 when the setting is off, §F11). R28 stays High until both checks pass |
| **O38** | **Staff-wide email 2FA: deferred pending a read-only investigation** of how it interacts with `security.staffDeviceVerification`. **Both settings stay unchanged** | Deferred (read-only investigation first) | ⏸ **Explicitly deferred.** Next: a read-only check of the Ghost 6.75 documentation (and, if needed, the local Ghost). The decision is taken after that. **No change** to the staff-wide 2FA setting or to `staffDeviceVerification` |
| **O37** | **Approve M5: TLS 1.2/1.3 only**, scheduled alongside or after the N6 review, subject to the implementation procedure and backup | Server change (Nginx) | ✅ **Approved in principle; not yet executed.** Next: prepare the M5 procedure for the owner's review (backup of `ssl-params.conf`, exact directives, `nginx -t`, reload, apex and www tests, rollback). Run only after the owner approves that procedure |
| **O35** | **Approve security-only automatic updates, reboots manual**; take a snapshot and verify the exact APT configuration before implementation | Server change (APT) | ✅ **Approved in principle; not yet executed** (new maintenance step **M6**). Next: (1) a read-only check of the current `/etc/apt/apt.conf.d/50unattended-upgrades` and `20auto-upgrades`; (2) the exact proposed change for review; (3) snapshot → change → verify (for example `unattended-upgrades --dry-run`). `Unattended-Upgrade::Automatic-Reboot` stays `false` |
| **O34** | **Keep Gmail temporarily**; choose a long-term provider later; preserve the working configuration | Deferred | ⏸ **Deferred.** Gmail SMTP stays unchanged. Replacement procedure as in §15.2 |

**Ghost and publishing**

| ID | Decision (owner, 19 Nov 2026) | Type | Status / next step |
|---|---|---|---|
| **O18** | **Confirmed:** no membership, subscriptions, comments or newsletters for the current website | Documentation decision + later Admin verification | ✅ **Decided.** The remaining Portal-button and newsletter settings are verified (look only) during the planned Admin audit at **E2/E3** |
| **O4** | **Keep `dr`** | Documentation decision | ✅ **Decided.** `routes.yaml` keeps `dr` (the G3 render check still runs); `doctor_author_slug` = `dr` at E8 |
| **O28** | **Confirmed:** the Update 6.4 rule, every `#blok` post has `dr` as its only author | Documentation decision | ✅ **Decided and confirmed** (§16.8) |
| **O26** | **Option A:** a separate PR for each stage; release version **1.0.0** | Decision for Phase B | ✅ **Decided** (G0a, G1). Carried out only in Phase B, after written approval |
| **O27** | **Accept** the documented Content API exposure during migration, **provided** the hidden blocks stay excluded from public listings and protected by the agreed safeguards | Documentation decision | ✅ **Accepted (conditional).** Conditions: private mode (§3.6), `routes.yaml` filtering, O28 rule, O30 (LLM off), G6, G11, G12 |
| **O29** | **Confirmed:** 23 internal content blocks (12 + 8 + 3) | Documentation decision | ✅ **Decided** |
| **O19** | **Unpublish** "Coming soon" (`/coming-soon/`) and "About" (`/about/`) | Ghost Admin change | ✅ **Approved; not yet executed.** Must be done no later than the D-window, before `routes.yaml` is uploaded (D9). Otherwise "Coming soon" would appear at `/blog/coming-soon/` |
| **O20** | **Approved (19 Nov 2026): the four mappings below**, after the owner verified them | Redirect file (uploaded at D10) | ✅ **Approved; not yet implemented.** `redirects.yaml` is prepared in the release (Phase B) and uploaded at D10. It is re-checked against the C10 URL list first |
| **O22** | **Cloudflare Web Analytics**, subject to checking the privacy and consent implications before implementation | Ghost Admin change (code injection) + privacy review | ✅ **Chosen, conditional; not implemented.** Before implementation: (1) a privacy and consent review (PDPA) of what the beacon collects; (2) an update to the Notis Privasi (O14) if needed; (3) confirm the setup method while the Cloudflare proxy is off (DNS-only, I22), for example Cloudflare's JavaScript beacon added through Ghost's code injection |

**O20: approved redirect mappings (verified and approved by the owner, 19 Nov 2026).** These are based **only** on the URLs observed publicly on 17 Nov 2026 (PHASE-A-FINDINGS §1; Admin I27: no other drafts or scheduled items; `redirects.yaml` currently empty). They are re-checked against the C10 URL list before they are finalised.

| Old URL (live today) | Proposed new URL | Type | Reason |
|---|---|---|---|
| `/` | (no redirect) | — | Becomes the new homepage |
| `/about/` | `/` | 301 | Starter page, unpublished (O19); no new equivalent page |
| `/coming-soon/` | `/` | 301 | Starter post, unpublished (O19) |
| `/tag/news/` | `/blog/` | 301 | Default tag address removed by the new routes; the new site has no "news" topic |
| `/author/dr/` | `/blog/penulis/dr/` | 301 | Same author, new archive address (§3.7) |

**Not proposed, unless the owner asks:** RSS variants (`/author/dr/rss/`, `/tag/news/rss/`) and the `.md` copies. They are not in the public inventory, and the `.md` copies stop existing once the LLM setting is off (O30).

**Content inputs:** O1–O3, O5–O17, O21 and O23–O25 are **deferred until before Phase D** by the owner's decision. They **do not block** the Phase A sign-off.

**Phase A findings:** the owner **accepts** the Phase A findings in §16, including the I34 resolution (§16.7), subject to this register.

**A-gate:** the plan's condition is "infrastructure audit accepted; owner inputs complete or explicitly deferred". With this register, every owner input is decided, accepted or explicitly deferred. **O38** (staff-wide 2FA) is **explicitly deferred** pending its read-only investigation, with both settings unchanged. **O20** is approved.
- **The A-gate is ready for the owner's sign-off once Update 6.5 is approved.**
- **Signing the A-gate does not authorise Phase B.** Phase B needs separate written approval.

**Still open after this update** (none blocks the A-gate):
- **Approved, awaiting execution or a procedure:** O30 (LLM off: owner action, then read-only verification); M5 (O37); M6 (O35); O19 (unpublish, by the D-window).
- **Deferred pending investigation:** O38 (staff-wide 2FA; both settings unchanged).
- **Approved, implemented later:** O20 redirects (prepared in Phase B, uploaded at D10).
- **Scheduled:** N6 (read-only review around 25 Nov 2026).
- **Deferred:** O34, plus the content inputs listed above.

### 16.10 O30 executed and Phase A signed off: Update 6.6 (19 Nov 2026)

**O30: the LLM setting is off.**
- **Executed:** the owner switched off "Enable structured data for LLMs and AI search engines" in Ghost Admin on 19 Nov 2026.
- **Verification step 1 ✅ passed** (19 Nov 2026), using anonymous read-only GET requests to the live site from this documentation session:

| Request | Result | Meaning |
|---|---|---|
| `/llms.txt`, `/llms-full.txt` | **302 → `/`** (the homepage, HTML) | The LLM index is no longer served |
| `/coming-soon.md`, `/about.md` | **302 →** the normal HTML page (`/coming-soon/`, `/about/`) | Posts and pages are no longer served as Markdown |
| Homepage response headers | **No** `Link: </llms.txt>` and **no** `X-Llms-Txt` header | LLM discovery is off |

- This matches the local Ghost 6.75 test of the setting switched off (§F11). There, a block's `.md` address redirected to `/404/`.
- **Verification step 2 ⏳ pending:** after the blocks are imported (Phase F, and again at H3), **every one of the 23 `/blog/{block-slug}.md` addresses must return 404** (G11).
- **R28** is mitigated by the setting. It closes only when step 2 passes.

**Phase A sign-off (A-gate).**
- **Signed off by the owner on 19 Nov 2026** ("go ahead phase A"), following the acceptance of the findings and the decision register (§16.9).
- **Phase A is complete.**

**Carried forward from Phase A** (none reopens it):

| Status | Items |
|---|---|
| Scheduled | **N6** HSTS review (read-only, around 25 Nov 2026) |
| Approved, procedure first | **M5** TLS 1.2/1.3 (O37); **M6** security-only automatic updates (O35) |
| Approved, executed later | **O19** unpublish the starter content (by the D-window); **O20** redirects (prepared in Phase B, uploaded at D10) |
| Pending a later phase | O30 verification step 2 (Phase F and H3) |
| Conditional | **O22** Cloudflare Web Analytics (privacy and consent review first) |
| Deferred | **O38** staff-wide 2FA (pending its read-only investigation; settings unchanged); **O34** long-term mail provider (Gmail kept); the launch-content inputs (until before Phase D) |

**Authorisation:**
- **Signing the A-gate does not authorise Phase B.**
- **Phases B–H and production theme deployment remain unauthorised** until the owner approves Phase B in writing.
- No further server or Ghost change is authorised except as each approved item's own procedure allows.

### 16.11 M5 and M6 executed: Update 6.7 (21 Nov 2026)

> **What this section records:** the owner carried out the approved maintenance steps M6 (19–21 Nov 2026) and M5 (21 Nov 2026) on the production VPS, following the reviewed procedures.
> - **Source:** command output pasted by the owner, checked step by step in this session. No command was run from this documentation session.
> - **Times:** server time is CST (UTC+8).
> - **Unchanged:** no Ghost, DNS, Cloudflare or content change, and no Phase B work. HSTS was not changed.

**M6: security-only automatic updates, MySQL excluded (O35).** ✅ **Done.**

| Step | Result |
|---|---|
| Pre-check | Ubuntu's `50unattended-upgrades` on this image allowed only `${distro_id}:${distro_codename}`, so the dry run reported `Allowed origins are: o=Ubuntu,a=noble`. That is why security updates had never installed automatically (R36). The mirror does serve `o=Ubuntu,a=noble-security`. No later file overrode the unattended-upgrades settings. `needrestart` loads `conf.d/*.conf`, and no explicit restart mode is configured, so Ubuntu 24.04's default applies: **affected services are restarted automatically** |
| Syntax checks | `apt-config -c …` showed the combined lists correctly; `perl -c` on the needrestart rule: `syntax OK` |
| Snapshot | `himandme-pre-m6-2026-11-19` (`lhsnap-hty2dne5`), status Normal, created 2026-11-20 01:00:44 console time |
| Installed (2026-11-20 01:36 CST) | `/etc/apt/apt.conf.d/52himandme-unattended-upgrades` (adds `${distro_id}:${distro_codename}-security`, blacklists `mysql-`, `Automatic-Reboot "false"`) and `/etc/needrestart/conf.d/50himandme-mysql.conf` (`$nrconf{override_rc}{qr(^mysql)} = 0;`); both `root:root`, mode 644 |
| Verification | `Allowed origins are: o=Ubuntu,a=noble, o=Ubuntu,a=noble-security` (no `noble-updates`); `Initial blacklist: mysql-`, pinned at priority −32768; `Automatic-Reboot "false"`; `needrestart` exit 0; kernel 6.8.0-149 current; both APT timers scheduled; ssh, nginx, mysql, ghost and fail2ban active; homepage 200 |
| First automatic runs | **20 Nov 06:38 CST:** `libgstreamer1.0-0`, `nginx`, `nginx-common` → "All upgrades installed". **21 Nov 06:39 CST:** `nginx`, `nginx-common`, `python3-jwt` → "All upgrades installed". nginx is now `1.24.0-2ubuntu7.21` |
| MySQL untouched | `mysql-server-8.0` still `8.0.46-0ubuntu0.24.04.5`; MySQL running continuously since 18 Nov 18:18:51 CST (the M3 reboot) |
| Reboot | None required, none performed |

**Known limits (as approved):**
- The blacklist matches package names beginning with `mysql-` only. MySQL-related packages with other names (for example `libmysqlclient*`) are not excluded.
- The needrestart rule (`override_rc` for `^mysql`) protects services whose names match it from **needrestart-triggered** automatic restarts after library updates. Because needrestart's default on Ubuntu 24.04 is to restart automatically, the rule is what keeps MySQL running through unattended runs. It does **not** prevent restarts through other mechanisms (package maintainer scripts, manual restarts, reboots).

**Monthly maintenance:** the approved routine (review pending upgrades, snapshot, verified database backup, a gated `apt upgrade`, checks, a reboot only if required) is in [`stage-7/MONTHLY-MAINTENANCE.md`](stage-7/MONTHLY-MAINTENANCE.md). **First run around 19 Dec 2026**, or sooner for a critical MySQL fix.

**M5: TLS 1.2 and 1.3 only (O37).** ✅ **Done** on 21 Nov 2026. The owner chose to run it before the N6 review; M5 does not touch HSTS, and N6 stays scheduled around 25 Nov.

| Step | Result |
|---|---|
| Pre-check | Exactly one `ssl_protocols` line each in `/etc/nginx/nginx.conf` (Ubuntu stock: `TLSv1 TLSv1.1 TLSv1.2 TLSv1.3; # Dropping SSLv3, ref: POODLE`) and `/etc/nginx/snippets/ssl-params.conf` (`TLSv1 TLSv1.1 TLSv1.2 TLSv1.3;`); no other file set it |
| Backup and baseline | `/home/ubuntu/m5/backup-20261121-163931` (a copy of `/etc/nginx`, checksums, `nginx -T`, certificates, headers). Baseline: TLS 1.0 and 1.1 **already refused** (`alert protocol version`; OpenSSL 3.0.13, security level 2), TLS 1.2 and 1.3 accepted, for apex and www |
| Change | Both lines set to `ssl_protocols TLSv1.2 TLSv1.3; # Him & Me M5` (`nginx.conf` line 33, `ssl-params.conf` line 1); `nginx -t` OK; graceful reload |
| Verification | Full `nginx -T` compared: **no change except `ssl_protocols`**. Certificates unchanged (apex serial `06695E5BCF4574FB421FBFF376F940009541`, to 3 Feb 2027; www serial `050264C8245DEE86167F7359E309EDD76ADD`, to 16 Feb 2027). Headers unchanged, all five present, HSTS still `max-age=300`. TLS 1.0/1.1 refused and 1.2/1.3 accepted, for apex and www. Unknown host refused (`alert number 112`). Apex 200, www 301 → `https://himandme.my/`. nginx, ghost and mysql active. Error log: only a `[notice]` from the 06:39 automatic nginx update |
| Ciphers | **Unchanged**, as the owner decided. The "legacy cipher suites" part of I33 remains; an optional read-only cipher review is available but not scheduled |
| Interruption | None |

- **Two test-command corrections during execution** (the commands only, never the change itself):
  1. the header check now matches the full name `strict-transport-security`;
  2. TLS 1.3 success is recognised by `New, TLSv1.3`.

  The baseline was re-recorded with the corrected commands before the change.
- **Operational note:** since `nginx.conf` is now edited, a future nginx update that ships a changed `nginx.conf` will be held back by the automatic updates and must be handled in the monthly maintenance (keep the installed file unless a change has been reviewed).

**Effect on status:**
- O35 ✅ executed; R36 ✅ mitigated.
- O37 ✅ executed; R40 ◐ protocols fixed (the ciphers stay as decided).

**Still open:**
- N6 (around 25 Nov 2026, read-only; HSTS stays `max-age=300` until the owner decides);
- O30 step 2 (after import);
- O19 and O20 (later);
- O22 (conditional);
- deferred O34, O38 and the content inputs.

**Phases B–H remain unauthorised.**
