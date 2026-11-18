# Stage 7 checklist: production readiness

> **Status: Revision 6 approved baseline (committed 17 Nov 2026) + Update 6.1 (18 Nov 2026).** Server maintenance recorded: **M1–M3 done; M4 N1–N5 done; N6 pending observation** (plan §15). Phase A (read-only) still in progress. **Phases B–H are not authorised.** No further server changes are authorised.
> The direction and structure were approved on 16 Nov 2026. Revision 2 answered the 5 review points; revision 3 makes the final corrections (see the plan's revision tables and §13).
> Section numbers below (§) refer to that plan.

**Status labels:**
- ✅ **Ready**
- 🔍 **Requires verification**
- ✋ **Requires my input** (owner)
- ⛔ **Blocked**

**Completion:** `[x]` done · `[ ]` not done.

## Summary

| Area | ✅ | 🔍 | ✋ | ⛔ |
|---|---|---|---|---|
| G: GitHub and release (§1) | 9 | 0 | 2 | 3 |
| I: Infrastructure (§2) | 26 answered (incl. ⚠️ findings) | 8 | 0 | 0 |
| O: Owner inputs (section 4 below) | 0 | 0 | 36 | 0 |
| V: Revision 2–4 verifications (section 1a) | 8 | 0 | 0 | 0 |
| E: Production config (§5) | 2 | 3 | 6 | 1 |
| S: SEO (§6) | 1 | 6 | 7 | 0 |
| Phases A–H | A in progress | 0 | 0 | 7 (B–H; each waits for the gate before it) |
| M: Server maintenance (section 8a) | M1, M2, M3 done; M4 N1–N5 done | N6 observation | O34 long-term, O35 | 0 |

---

## 1. Planning deliverables (this stage)

- [x] ✅ PR and branch dependency report (§1)
- [x] ✅ Infrastructure audit checklist with read-only commands (§2)
- [x] ✅ Content migration and test-data exclusion strategy (§3)
- [x] ✅ Theme deployment procedure and rollback (§4)
- [x] ✅ Owner input checklist (section 4 below)
- [x] ✅ SEO audit (§6)
- [x] ✅ Functional and security test checklist, incl. `#blok` re-confirmation (§7)
- [x] ✅ Backup and rollback plan (§8)
- [x] ✅ Launch sequence A–H with approval checkpoints (§9)
- [x] ✅ Risk register (§10) and execution sequence (§11)
- [x] ✅ Owner approved the plan's direction and structure (16 Nov 2026)
- [x] ✅ Revision 2: the 5 review points answered (section 1a)
- [x] ✅ Revision 3: final corrections (Content API wording, restore syntax, structured data, public-domain private-mode checks, consistency review)
- [ ] ✋ **Owner approval of Phase A**

## 1a. Revision 2 verifications (local only; production untouched)

| ID | Review point | Evidence | Status | Done |
|---|---|---|---|---|
| V1 | Block count | `seed/blocks.mjs` holds **23**: 12 homepage (`blok-utama-*`), 8 ED (`blok-ed-*`), 3 shared (`blok-maklumat-hubungan`, `blok-penafian`, `blok-tawaran`). The 22 figure predates `blok-tawaran` (commit `f884fb2`, 5 Nov 2026, RM288 offer). Full slug table in plan §3.2. No block added or removed | ✅ | [x] |
| V2 | Private mode protects the **website** during the migration | `test/stage7/private-mode.mjs` **12/12** on Ghost 6.75.0: pages, archives, RSS, sitemaps and block URLs all hidden; robots `Disallow: /`; not cacheable; owner can review with the password. **It does not protect the Content API:** with the public key, one request listed all 23 published blocks (O27). Exact D1–H3 sequence in plan §3.6 | ✅ | [x] |
| V3 | Author archive with a real slug | `test/stage7/author-archive.mjs` **15/15**: exactly the genuine articles over all pages and RSS; no other archive route leaks; negative controls proved the leaks when `routes.yaml` isn't updated (46) and when a second staff account owns a block | ✅ | [x] |
| V4 | Backup and restore | Rehearsed on MySQL 8.0.46 + Ghost 6.75.0 (throw-away, deleted): `--no-tablespaces` needed for the Ghost DB user (error exits 0); `sudo` socket dump needs no password; restore requires `ghost stop`; full restore returned the exact previous state; theme and routes roll back independently. `ghost backup` (CLI 1.34.1 source): staff token required, no DB dump inside | ✅ | [x] |
| V6 | Restore-test syntax (C8) | Create the disposable database first, then `sudo mysql ghost_restore_test < ghost-pre-launch.sql`, count, drop. The same form (database named as an argument) was used in the V4 rehearsal | ✅ | [x] |
| V7 | Consistency review of both documents | Plan §13: no contradiction remains | ✅ | [x] |
| V8 | robots.txt in private mode | Measured (P4, now asserting the status): **HTTP 200**, not redirected, `text/plain`, `Disallow: /`, `Cache-Control: public, max-age=3600`. Pages, feeds and sitemaps: **302 to `/private/`** (P1–P3 assert it). D2b and H3 corrected; R27 added | ✅ | [x] |
| V5 | Regression after the checks | Stage 1 re-run: **32 passed, 0 failed**; local data restored (staff slug, routes, block authors, private mode off) | ✅ | [x] |

## 2. GitHub and release (§1)

| ID | Item | Status | Done |
|---|---|---|---|
| G0 | Branch chain is linear (`main` → `stage-0-1` → … → `stage-6`); no conflicts; `stage-6` holds all approved work | ✅ Verified | [x] |
| G0a | Merge option A (per-stage, recommended) or B (single release PR) chosen | ✋ | [ ] |
| G0b | Merges carried out with merge commits; `git diff stage-6 main` is empty afterwards | ⛔ needs G0a and approval | [ ] |
| G1 | Version 1.0.0 and tag `v1.0.0` | ✋ approve | [ ] |
| G2 | Logo PNG permissions `0600` → `0644` | ✅ ready | [ ] |
| G3 | `routes.yaml` author slug `dr` → real slug (3 places) | ⛔ O4 | [ ] |
| G4 | Launch seed builder (`seed/blocks.mjs` only, allowlist + denylist) | ✅ ready to build | [ ] |
| G5 | Placeholder scanner | ✅ ready to build | [ ] |
| G6 | Read-only production smoke test (modes: `--expect-private` for D2b, private cookie for F, anonymous for H3) | ✅ ready to build | [ ] |
| G7 | README "Production launch" section | ✅ ready | [ ] |
| G11 | Test: every block `.md` URL is 404; no block in `llms.txt`/`llms-full.txt` (F11) | ✅ ready to build (Phase B) | [ ] |
| G8 | Local Stage 1–6 suites + guard + GScan (zip) all green on the release build | ✅ last run green (32/23/12/39/21/16; GScan 0/0) | [ ] re-run on release |
| G9 | Zip and seed SHA-256 recorded here | ⛔ G1–G5 | [ ] |
| G10 | `npm run test:stage7` (author archive + private mode) green on the release build; the routes render step fails if any `dr` placeholder remains | ✅ test written, 15/15 + 12/12 | [ ] re-run on release |

## 3. Infrastructure (§2): all 🔍, read-only, run by the owner

| ID | Check | Status | Done |
|---|---|---|---|
| I1 | OS version, reboot pending | ✅ resolved 18 Nov (M3; kernel 6.8.0-149) | [x] |
| I2 | Ghost 6.75.0, `ghost ls` running, **Ghost-CLI version** | ✅ Ghost 6.75.0, CLI 1.34.1 | [x] |
| I3 | Config (filtered: **no secrets**): url, host, db client, mail | **Historical (17 Nov 2026):** ⚠️ database `himandme`; mail transport `Direct`; staff device verification enabled → R34. **Current (18 Nov 2026):** Gmail SMTP configured and successfully tested under M1, including staff email delivery and second-device verification (R34 mitigated). Staff device verification remains enabled. Gmail is an **interim** provider; migration to the long-term provider remains **pending** (O34) | [x] |
| I4 | `ghost doctor` | ✅ | [x] |
| I5 | Node 22 | ✅ Node.js **22.23.5** (upgraded in M3, 18 Nov 2026) | [x] |
| I6 | systemd unit active and enabled, user `ghost` | ✅ | [x] |
| I7 | No recurring errors in the journal | ✅ 0 errors | [x] |
| I8 | Ownership and permissions of the install and `content/` | ✅ | [x] |
| I9 | `nginx -t`, site confs | ✅ resolved 18 Nov (M4 N4) | [x] |
| I10 | Proxy, upload size, real IP, headers | ✅ Audited 17 Nov; headers fixed 18 Nov (M4 N5). The final HSTS value is tracked separately as **M4 N6 (pending)**, not here | [x] |
| I11 | TLS certificate valid, issuer noted. **Phase A:** Let's Encrypt (YR2), `himandme.my` only, valid 5 Nov 2026 – 3 Feb 2027 | ✅ apex unchanged; www certificate added 18 Nov (N2) | [x] |
| I12 | Certificate renewal works | ✅ acme.sh root cron. Scheduled renewals: `himandme.my` **5 Jan 2027**; `www.himandme.my` **16 Jan 2027** | [x] |
| I13 | HTTP→HTTPS and www/apex redirects; one canonical host. **Phase A:** http apex → 301 https; https apex 200; www fails (F3) | ✅ resolved 18 Nov (www → apex, HTTP and HTTPS) | [x] |
| I14 | MySQL 8.0 running | ✅ MySQL **8.0.46.5** (Ubuntu package revision …24.04.5, upgraded in M3, 18 Nov 2026); active | [x] |
| I15 | Ghost ↔ DB connectivity | ✅ | [x] |
| I16 | Disk space for backups | ✅ 49 GB free | [x] |
| I17 | Memory and swap | ✅ | [x] |
| I18 | UFW and Tencent security group: only SSH/80/443 | 🔍 ufw ✅; Tencent security group pending | [ ] |
| I19 | 2368 and 3306 bound to localhost | ✅ | [x] |
| I20 | SSH: keys only, no root password login | ✅ resolved 18 Nov (M2: key-only, root off) | [x] |
| I21 | Security updates | ✅ applied 18 Nov (M3); auto-security O35 open | [x] |
| I22 | Cloudflare DNS records (view only). **Phase A:** no Cloudflare headers, and both names resolve to the server's own address: **DNS-only confirmed** (F4) | ✅ DNS-only (proxy off) | [x] |
| I23 | Cloudflare SSL Full (strict) | ✅ n/a | [x] |
| I24 | Always HTTPS on; Rocket Loader off; no Cache Everything or edge TTL on HTML, `/ghost/`, `/members/`, `/p/`; **Always Online off**; Cache Reserve noted | ✅ n/a | [x] |
| I25 | WAF not blocking Admin | ✅ n/a | [x] |
| I26 | Ghost mail for staff | ✅ resolved 18 Nov (M1, interim Gmail) | [x] |
| I27 | Inventory of current live content, theme, routes and redirects. **Phase A (public part done):** Ghost 6.75, theme Source, starter post `/coming-soon/`, page `/about/`, tag `news`, author `dr`; LLM features on; sign-up open. Drafts, routes and redirects need an Admin view | 🔍 | [ ] |
| I28 | Network status (must be off before import). **Phase A:** ActivityPub endpoints 403, so it looks inactive; confirm the toggle | 🔍 | [ ] |
| I29 | Membership access status. **Phase A:** sign-up **open** (F8, R30); member count needed | 🔍 | [ ] |
| I30 | MySQL root uses `auth_socket`; charset `utf8mb4`; database size (no secrets) | ✅ auth_socket, utf8mb4 | [x] |
| I32 | fail2ban `sshd` jail status (read-only) | 🔍 **Outstanding Phase A audit item.** fail2ban is active (18 Nov), but the `sshd` jail details were not reported. Not an M2 completion criterion; its being open does **not** mean M2 failed | [ ] |
| I33 | `/etc/nginx/snippets/ssl-params.conf` contents (read-only) | ◐ HSTS line known (plan §15.5); rest not reported | [ ] |
| I34 | Owner confirms the 5 accepted SSH password logins were theirs | 🔍 **Outstanding Phase A audit item** (no confirmation yet). Not an M2 completion criterion; its being open does **not** mean M2 failed | [ ] |
| I31 | Which staff account is **Owner**; all staff slugs; no unknown accounts | 🔍 | [ ] |

## 4. Owner inputs (section O): nothing here will be invented

| ID | Needed from you | Used for | Status | Done |
|---|---|---|---|---|
| O1 | Doctor's profile photo (square, ≥ 400 px) | Byline, author box, homepage team card | ✋ | [ ] |
| O2 | Final biography (≤ 250 characters; the local draft without dashes can be the starting point) | Author box, author page | ✋ | [ ] |
| O3 | Exact credentials text (you stated "MD (UKM)"; please confirm the exact form) | `doctor_credentials` | ✋ | [ ] |
| O4 | Doctor's **production** staff slug (Admin → Staff → profile → Slug). Phase A: currently **`dr`**; keep it or choose another | `routes.yaml` (G3), `doctor_author_slug` | ✋ (blocks G3) | [ ] |
| O5 | Logo: confirm `logo-him-and-me.png` / `logo-mark.png` are final, or supply new files | Header, footer | ✋ | [ ] |
| O6 | Feature images (≥ 1600 px, ~16:7), alt text, captions and photo credits for each article | Articles | ✋ | [ ] |
| O7 | Final articles (text), each with verified references (replacing every `[Rujukan]`) | Blog | ✋ | [ ] |
| O8 | Business name and operator as it should appear (Notis Privasi names "Him & Me Wellness PLT") | Footer, legal | ✋ confirm | [ ] |
| O9 | Address and Google Maps link (`address_short`, `google_maps_url`) | Footer, contact | ✋ | [ ] |
| O10 | WhatsApp number, default message and phone display | Every CTA | ✋ confirm | [ ] |
| O11 | Booking: confirm the WhatsApp form is the booking method (no separate booking link) | CTAs | ✋ | [ ] |
| O12 | RM288 First Trial offer: still valid at launch? Any end date or terms? | Offer card and bar | ✋ | [ ] |
| O13 | Prices (consultation, shockwave, Kegel EMS) and whether to show them | ED page, homepage | ✋ confirm | [ ] |
| O14 | Notis Privasi: confirm the current text is final (update it if analytics are added, O22) | `/notis-privasi/` | ✋ | [ ] |
| O15 | Homepage meta title and description; `/blog/` meta (the `jurnal` page) | SEO | ✋ | [ ] |
| O16 | Descriptions for the 7 category tags | Topic tiles and pages, SEO | ✋ | [ ] |
| O17 | Favicon / site icon (≥ 256 px square) and default social image (1200×630) | Browser, sharing | ✋ | [ ] |
| O18 | Confirm: no memberships, Portal, comments or newsletter | E2–E3 | ✋ | [ ] |
| O19 | For each item already live on himandme.my: keep / replace / unpublish | Migration | ✋ (after I27) | [ ] |
| O20 | List of old URLs to redirect (or "none") | `redirects.yaml` | ✋ | [ ] |
| O21 | Structured business data: none, or **`LocalBusiness` (recommended)** with verified facts only. `MedicalBusiness` or a subtype only if you confirm the premises is registered or licensed as a healthcare facility. Also confirm whether "Him & Me Wellness PLT" may be used as `legalName` (registered and active) | SEO (plan §6.1) | ✋ | [ ] |
| O22 | Analytics: none / Cloudflare Web Analytics / GA4 | SEO, privacy | ✋ | [ ] |
| O23 | Launch with a minimum number of articles, or with none | Go/no-go | ✋ | [ ] |
| O24 | Days and hours: confirm "Isnin – Sabtu, 10 pagi – 6 petang · dengan temu janji sahaja" | Footer, ED page | ✋ confirm | [ ] |
| O25 | Launch window (date and time). Private mode is **mandatory** during it (R1, plan §3.6) | Phase D | ✋ | [ ] |
| O26 | Merge option A or B (G0a), and the version number (G1) | Phase B | ✋ | [ ] |
| O27 | Private mode protects the website but **not** Ghost's Content API. During the migration, anyone with the public Content API key can retrieve the published blocks (and the 3 imported pages, and any published article). Accept this residual exposure of approved public copy (recommended), or state a stricter requirement (e.g. publish no article before H1) | Plan §3.6, R22 | ✋ | [ ] |
| O28 | Block ownership: Case A (the doctor's account is the Owner), or Case B (extra filtered channel for the Owner's slug, or reassign the 23 blocks to the doctor) | Plan §3.7, R21 | ✋ (after I31) | [ ] |
| O29 | Confirm the architecture record is corrected to 23 blocks (12 + 8 + 3) | V1 | ✋ | [ ] |
| O30 | Turn off "Enable structured data for LLMs and AI search engines" before launch (recommended; required to keep blocks unreachable at `/blog/{slug}.md`). The cost is losing `llms.txt` and the article `.md` copies | E12, R28 | ✋ | [ ] |
| O31 | `www.himandme.my`: **A (recommended):** separate www certificate + 301 to the apex (M4 N1–N3); B: one certificate covering both names; C: remove the www DNS record. (Cloudflare redirect not possible while the proxy is off) | R29 | ✅ Decided 18 Nov: **Option A**; executed (N1–N3) | [x] |
| O32 | SSH key-only migration (M2): approve; confirm VNC break-glass, the key's device, and a second copy | R32 | ✅ Executed 18 Nov (M2) | [x] |
| O33 | Maintenance window for 27 updates + one reboot (M3), after a Tencent snapshot | R33 | ✅ Executed 18 Nov (M3; snapshot `himandme-pre-m3-updates-2026-11-18`) | [x] |
| O34 | Ghost mail provider (SMTP; port 587 is reachable, but delivery must be proven in M1) and its SPF/DKIM DNS records | R34 | ◐ Interim: Gmail SMTP working (18 Nov); long-term provider ✋ | [ ] |
| O35 | Enable automatic security updates (add the `-security` origin); reboots stay manual | R36 | ✋ Not reported as done in M3 | [ ] |
| O36 | Nginx catch-all and security headers (M4 N4–N6) | R31, R35 | ✅ Approved 18 Nov (subject to the HSTS review); N4–N5 done, N6 pending | [ ] |

## 5. Content and test-data exclusion (§3)

| Item | Status | Done |
|---|---|---|
| 23 blocks (12 homepage + 8 ED + 3 shared, reconciled in V1) + 3 pages approved; no open ❓ in `docs/CLINICAL-REVIEW.md` | ✅ | [x] |
| **Private mode ON before the import** (D1); Cloudflare purged (D2); stays on until the G-gate | ⛔ Phase D | [ ] |
| **D2b: anonymous checks through https://himandme.my**. **Pages, articles, feeds, sitemaps** (every C10 URL plus the fixed list): `302` to `/private/`, none `200`/`304`, no `cf-cache-status: HIT/STALE`. **robots.txt:** HTTP `200` (no redirect required) with `Disallow: /`, never the old public body. **http and www variants:** first hop `301`/`308` to `https://himandme.my/` (same path), then the private-mode response. **Cloudflare:** no cached old public content anywhere, including the incognito browser. **The import does not start until this passes** | ⛔ Phase D | [ ] |
| **H3: robots.txt is the public version** (`Sitemap:` line, no `Disallow: /`) after private mode is off and the cache purged; re-checked at +24 h (R27) | ⛔ Phase H | [ ] |
| Content API returns the published blocks during the window: expected, not a leak (O27) | ✋ O27 | [ ] |
| Block ownership rule applied (O28): every author archive clean | ⛔ Phase D/F | [ ] |
| E1–E3 article wording approved | ✅ | [x] |
| Dasar Editorial excluded (owner decision) | ✅ | [x] |
| Launch seed generated from `seed/blocks.mjs` only | ⛔ G4 | [ ] |
| Placeholder scan of theme + seed: 0 hits (only `[Akta 709]`/`[Act 709]` allowed) | ⛔ G5 | [ ] |
| Local DB, local exports, test fixtures, test articles, test images and the test staff account: **never transferred** | ✅ rule | [x] |
| Production post count = articles + 23 blocks | ⛔ Phase F | [ ] |
| Placeholder scan of rendered production pages: 0 hits | ⛔ Phase F/H | [ ] |
| No email address or "e-mel"/"email" in public HTML | ⛔ Phase F/H | [ ] |

## 6. Production configuration (§5)

| ID | Item | Status | Done |
|---|---|---|---|
| E1 | Network off | 🔍 | [ ] |
| E2 | Membership: Nobody | ✋ O18 | [ ] |
| E3 | Portal, comments, newsletters off | ✋ O18 | [ ] |
| E4 | Language `ms`, timezone Asia/Kuala_Lumpur | ✅ | [ ] |
| E5 | Title and meta | ✋ O15 | [ ] |
| E6 | Icon and social images | ✋ O17 | [ ] |
| E7 | Navigation (primary + 7 categories) | ✅ defined | [ ] |
| E8 | 14 theme settings confirmed | ✋ O3, O4, O9–O13, O24 | [ ] |
| E9 | Routes uploaded | ⛔ G3 | [ ] |
| E10 | Unused integrations removed | 🔍 | [ ] |
| E11 | Staff: real people only, 2FA (device verification is on, but it **depends on working mail: M1**) | 🔍 | [ ] |
| E12 | LLM setting off (Settings → General settings → Meta data) before H1 | ✋ O30 | [ ] |

## 7. SEO (§6)

| ID | Item | Status | Done |
|---|---|---|---|
| S1 | Sitemap correct, no `blok-` | 🔍 | [ ] |
| S2 | `/jurnal/` redirect in sitemap: accepted | ✅ | [x] |
| S3 | robots.txt is the public version after launch, not the cached private `Disallow: /` (H3, +24 h) | 🔍 | [ ] |
| S4 | Canonical host | 🔍 | [ ] |
| S5 | Meta titles and descriptions | ✋ | [ ] |
| S6 | Default OG image | ✋ | [ ] |
| S7 | Structured business data | ✋ O21 | [ ] |
| S8 | Author profile complete | ✋ | [ ] |
| S9 | No broken internal links | 🔍 | [ ] |
| S10 | Old-URL redirects | ✋ O20 | [ ] |
| S11 | Search Console (DNS TXT) + sitemap submitted | ✋ | [ ] |
| S12 | Analytics decision | ✋ O22 | [ ] |
| S13 | Lighthouse (mobile) | 🔍 | [ ] |
| S14 | Private mode off at launch | 🔍 | [ ] |

## 8. Tests (§7)

| Item | Status | Done |
|---|---|---|
| Local suites Stage 1–6, guard, GScan on the release build | ✅ ready | [ ] |
| Read-only production smoke test | ⛔ G6 | [ ] |
| Functional checklist 7.1 (desktop + 390 px phone + no JS) | ⛔ Phase F | [ ] |
| `#blok` exclusion 7.2 on production, including **every** author in `sitemap-authors.xml` (private cookie in F, anonymous in H) | ⛔ Phase F/H | [ ] |
| Security checks 7.3 | ⛔ Phase F | [ ] |
| Destructive suites never pointed at production | ✅ enforced (localhost only) | [x] |

## 8a. Server maintenance track M (plan §14): separate from the website release; each step needs its own approval

| ID | Step | Prerequisites | Interruption | Must precede | Approved | Done |
|---|---|---|---|---|---|---|
| M1 | **Original Revision 6 plan:** Ghost SMTP via a chosen provider (provider port reachability → `ghost config` → restart → delivery test → second-browser device-verification login, with the original session kept open). **Actual completion, 18 Nov 2026:** **interim Gmail SMTP**; both required tests passed (delivery ✅; second-browser verification email and login ✅). See Update 6.1 below and plan §15.2 | Originally O34 (provider choice) + DNS approval (SPF/DKIM). These belonged to the provider-selection plan and were **not needed** for the interim Gmail completion. **O34 stays open only for the future replacement provider**; Gmail stays unchanged until every replacement test passes; no migration started | Ghost restart ~10 s | Phase D | [x] | [x] |
| M2 | SSH key-only (planned sequence in plan §14.4). **Executed 18 Nov 2026:** Ed25519 key installed (before M2, no account had a key) → fresh key-only login tested → root login, password login and keyboard-interactive login off; public-key login on → effective values verified with `sshd -T` → SSH active after reload. Recovery: passphrase-protected key, USB backup, Tencent VNC | O32 ✅. (I32 and I34 are separate **outstanding Phase A audit items**, not M2 prerequisites that failed) | SSH reload; sessions kept | Phase C (recommended) | [x] | [x] |
| M3 | Ubuntu updates + reboot (plan §14.3). **Executed 18 Nov 2026:** snapshot `himandme-pre-m3-updates-2026-11-18` → **27 upgraded, 7 newly installed, 0 removed, 2 phased updates deferred** → reboot → kernel 6.8.0-149, Node 22.23.5, MySQL 8.0.46.5; SSH, Nginx, MySQL, Ghost, fail2ban active. **Automatic security updates (O35) not done**, still open | O33 ✅; O35 open | Reboot ~2–5 min | Phase C (recommended) | [x] | [x] |
| M4 | Nginx hardening. **Original Revision 6 procedure (plan §14.5–14.5a):** W0 apex fingerprint → N1 → W1 → N2 issue with **RSA 2048** → N2b `--install-cert` to `/etc/nginx/ssl/www.himandme.my/{cert,fullchain,key}.pem` → N3 → V1–V3 → N4 → N5 → N6. **Actual execution, 18 Nov 2026:** N1–N5 **complete**; the www certificate was issued as **ECDSA / EC-256** (not RSA) and installed via `--install-cert` to those paths (Update 6.1 below; plan §15.5–15.6). **The apex certificate is unchanged** (serial and SHA-256 fingerprint verified). **N6 pending** (HSTS `max-age=300`; review around 25 Nov) | O31 = Option A ✅; O36 approved (subject to the HSTS review) ✅; apex ACME location untouched | Nginx reloads only | Phase D (www rows of D2b) | [x] | [ ] (N6 pending) |

**Update 6.1, executed 18 Nov 2026 (plan §15):**

| Item | Result | Done |
|---|---|---|
| M1 | Delivery ✅, second-browser verification email ✅, second-browser login ✅. **Interim Gmail SMTP**; replacement provider = future item (SPF/DKIM/DMARC; keep Gmail until replacement tests pass) | [x] |
| M2 | Ed25519 key, key-only login tested; `PermitRootLogin no`, `PasswordAuthentication no`, `PubkeyAuthentication yes`, `KbdInteractiveAuthentication no` (`sshd -T`); recovery = passphrase-protected key + USB backup + Tencent VNC | [x] |
| M3 | Snapshot `himandme-pre-m3-updates-2026-11-18`; 27 upgraded, 7 new, 0 removed, 2 phased deferred; reboot OK; Ubuntu 24.04.5, kernel 6.8.0-149, Node 22.23.5, MySQL 8.0.46 (…24.04.5); SSH, Nginx, MySQL, Ghost, fail2ban active | [x] |
| M4 N1 | `himandme-www.conf`: http www → https apex; apex HTTP + ACME preserved | [x] |
| M4 N2 / N2b | www certificate (Let's Encrypt, **EC-256**, to 16 Feb 2027, renew 16 Jan 2027) installed via `--install-cert` to `/etc/nginx/ssl/www.himandme.my/` (folder 700, key 600, certs 644), reload `systemctl reload nginx` | [x] |
| M4 N3 | https www → https apex; apex 200; **apex serial and SHA-256 fingerprint unchanged** | [x] |
| M4 N4 | Stock default link removed (file kept); `00-catch-all.conf`: unknown HTTP 444, unknown HTTPS handshake rejected; ACME paths reachable | [x] |
| M4 N5 | Headers snippet on the 3 apex HTTPS locations; HSTS `max-age=300`, Referrer-Policy, Permissions-Policy, one X-Frame-Options (`proxy_hide_header`), nosniff | [x] |
| **M4 N6** | **Pending:** observe from 18 Nov, review ~25 Nov; keep `max-age=300`; no `includeSubDomains`/`preload` without validating every subdomain; one-year HSTS only by owner decision after review | [ ] |
| Health 18 Nov | `nginx -t` OK; Nginx, MySQL, Ghost, SSH, fail2ban active; apex 200; www 301; headers present; unknown HTTP closed; disk 15 % used, 49 GB free; renewals: apex 5 Jan 2027, www 16 Jan 2027 | [x] |

**Next authorised action:** read-only only. Finish the open Phase A items (Admin/console views, I32, I33 rest, I34), then the N6 observation review around 25 Nov 2026, then the owner's decisions (plan §15.9).

## 9. Backup and rollback (§8)

| ID | Item | Status | Done |
|---|---|---|---|
| C1 | VPS snapshot | ⛔ B-gate | [ ] |
| C2 | Ghost JSON export | ⛔ B-gate | [ ] |
| C3 | `ghost backup` (staff token typed at the prompt only; zip contents listed) | ⛔ B-gate | [ ] |
| C4 | MySQL dump: `DB=himandme` (confirmed) then `sudo mysqldump --single-transaction --no-tablespaces --default-character-set=utf8mb4 "$DB"`; exit 0, empty error file, "Dump completed" | ⛔ B-gate | [ ] |
| C5 | `content/` + Nginx confs | ⛔ B-gate | [ ] |
| C6 | Current theme, routes, redirects downloaded | ⛔ B-gate | [ ] |
| C7 | Copies off the server | ⛔ B-gate | [ ] |
| C8 | Restore test off production: create `ghost_restore_test`, `sudo mysql ghost_restore_test < ghost-pre-launch.sql`, count posts and tables, drop it | ⛔ B-gate | [ ] |
| C9 | Rollback rule: `ghost stop` before any database restore, `ghost start` after | ✅ rehearsed | [x] |
| C10 | List of every currently public URL saved (`old-urls.txt`), for D2b and O20 | ⛔ B-gate | [ ] |

## 10. Phases and approval gates (§9)

| Phase | Gate | Status | Approved |
|---|---|---|---|
| Plan | Owner approves the plan's direction | ✅ 16 Nov 2026 | [x] |
| Revision 3 | Owner approves the plan | ✅ 17 Nov 2026 | [x] |
| Revision 4 | **Phase A authorised** (read-only: I1–I31, live-site inventory, owner inputs and decisions, review of findings and risk register). Excludes merges, releases, backups, database, DNS or Cloudflare changes, imports, publishing, theme activation and any production change | ✅ 17 Nov 2026 | [x] |
| Phase A findings | Presented to the owner; Phase B needs **separate written approval** | ✋ | [ ] |
| A. Preparation and audit | 🛑 A-gate | ▶ **in progress** (authorised 17 Nov 2026; server results reconciled; maintenance M1–M3 + M4 N1–N5 recorded 18 Nov; open: Admin/console views, I32–I34, N6 review) | [ ] |
| B. GitHub merge and release prep | 🛑 B-gate | ⛔ A-gate | [ ] |
| C. Production backup | 🛑 C-gate | ⛔ B-gate | [ ] |
| D. Theme and content deployment (**private mode ON at D1; public-domain checks D2b before the import**) | 🛑 D-gate | ⛔ C-gate | [ ] |
| E. Production configuration | (with D) | ⛔ D | [ ] |
| F. Staging and functional testing | 🛑 F-gate | ⛔ E | [ ] |
| G. Final launch approval | 🛑 G-gate | ⛔ F-gate | [ ] |
| H. Public launch (**private mode OFF at H1**, purge, anonymous checks through the real domain) and post-launch checks | 🛑 H-gate (48 h sign-off) | ⛔ G-gate | [ ] |
