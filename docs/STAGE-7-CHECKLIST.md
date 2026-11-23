# Stage 7 checklist: production readiness

> **Status: Revision 6 approved baseline (committed 17 Nov 2026) + Update 6.1 (18 Nov 2026).** Server maintenance recorded: **M1–M3 done; M4 N1–N5 done; N6 pending observation** (plan §15). Phase A (read-only) still in progress. **Phases B–H are not authorised.** No further server changes are authorised.
> **Update 6.2 (19 Nov 2026):** remaining Phase A checks recorded (plan §16). **Phase A stays open:** I34 is unresolved, and the findings await the owner's review. No production change was made.
> **Update 6.3 (19 Nov 2026):** **I34 resolved** (plan §16.7). Phase A **stays open** for the owner's review and the A-gate. No production change was made.
> **Update 6.4 (19 Nov 2026):** O28 decided (blocks belong only to `dr`); G6 extended; G12 added; FE1 (multi-author attribution) noted as a future enhancement (plan §16.8). Documentation only.
> **Update 6.5 (19 Nov 2026):** the owner's Phase A decisions are recorded (plan §16.9). Findings accepted. **The A-gate is ready for sign-off once this update is approved.** Decisions are not executed automatically. **Phase B is not authorised.**
> **Update 6.6 (19 Nov 2026):** **O30 done** (LLM setting off; step 1 verified) and **Phase A signed off by the owner** (plan §16.10). **Phase B is not authorised.**
> **Update 6.7 (21 Nov 2026):** **M6 and M5 done and verified** (plan §16.11). Monthly runbook: `docs/stage-7/MONTHLY-MAINTENANCE.md` (first run around 19 Dec 2026). N6 pending around 25 Nov. **Phase B is not authorised.**
> **Update 6.8 (21 Nov 2026):** **Phase B approved by the owner and carried out** (plan §16.12, report [`stage-7/PHASE-B-REPORT.md`](stage-7/PHASE-B-REPORT.md)): PRs #1–#7 merged into `main` (Option A); release branch `stage-7-release` built and tested; checksums recorded (G9). **Awaiting the B-gate.** No production change. **Phase C is not authorised.**
> **Update 6.8 Revision 2 (21 Nov 2026):** B-gate review findings addressed: the zip permission check now tells files (0644) from directory entries (0755); G12 recorded as **deferred** (an outstanding pre-launch item). Release rebuilt; checksums unchanged. **Awaiting final B-gate approval.** No production change. **Phase C is not authorised.**
> **Update 6.9 (21 Nov 2026):** **B-gate approved; Phase B closed** (plan §16.13). PR #8 merged into `main` as `d2a014e`. Tag `v1.0.0` on that commit (published by the owner, verified). No production change. **Phase C is not authorised.**
> **Update 6.10 (23 Nov 2026):** **Phase C approved by the owner and carried out:** C1–C10 passed (plan §16.14, report [`stage-7/PHASE-C-REPORT.md`](stage-7/PHASE-C-REPORT.md)). **Awaiting the C-gate.** No change to Ghost content or settings, MySQL, Nginx, DNS or Cloudflare. **Phase D is not authorised.**
> **Update 6.11 (23 Nov 2026):** Phase C closeout items recorded as **pending** (snapshot ID, BitLocker completion, old-snapshot deletion, C-gate, PR #10 merge). Doctor's photograph, biography and profile completion: **Deferred – awaiting photoshoot**; credentials pending confirmation. Day 0 readiness: [`stage-7/DAY-0-READINESS.md`](stage-7/DAY-0-READINESS.md). **Phase D is not authorised.**
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
| I: Infrastructure (§2) | 34 answered (incl. ⚠️ findings) | 0 | 0 | 0 |
| O: Owner inputs (section 4 below) | see rows | 0 | 39 items (some ✅ decided) | 0 |
| V: Revision 2–4 verifications (section 1a) | 8 | 0 | 0 | 0 |
| E: Production config (§5) | 2 | 3 | 6 | 1 |
| S: SEO (§6) | 1 | 6 | 7 | 0 |
| Phases A–H | **A signed off (19 Nov)** | 0 | 0 | 7 (B–H; each waits for the gate before it) |
| M: Server maintenance (section 8a) | M1, M2, M3, M5, M6 done; M4 N1–N5 done | N6 observation | O34 deferred | 0 |

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
| G0a | Merge option A (per-stage, recommended) or B (single release PR) chosen | ✅ **Option A** (separate PR per stage), decided 19 Nov (O26) | [x] |
| G0b | Merges carried out with merge commits; `git diff stage-6 main` is empty afterwards | ✅ Done 21 Nov: PRs #1, #2, #3, #5, #4, #6, #7 merged (merge commits); `main` = `17ae322`, equal to `stage-7-plan` | [x] |
| G1 | Version 1.0.0 and tag `v1.0.0` | ✅ Version **1.0.0** on `main`. Tag **`v1.0.0`** → `d2a014e65874b4624f5f6be72c7d14214c1ba7b2` (the PR #8 merge commit), published by the owner as GitHub release "1.0.0" on 21 Nov; verified with `git ls-remote` | [x] |
| G2 | Logo PNG permissions `0600` → `0644` | ✅ Done: the zip stages files 0644 and folders 0755. `check-release.mjs` checks files 0644 and directory entries 0755, and fails on other entry types (B-gate correction; fixtures Z1–Z8 pass). Zip reproducible, checksum unchanged | [x] |
| G3 | `routes.yaml` author slug `dr` → real slug (3 places) | ✅ No change needed: `dr` is the production slug (O4); channel verified by `check-release.mjs` | [x] |
| G4 | Launch seed builder (`seed/blocks.mjs` only, allowlist + denylist) | ✅ Built: `npm run seed:launch` (23 blocks, 3 pages, no authors) | [x] |
| G5 | Placeholder scanner | ✅ Built: `npm run placeholders`; theme and seed 0 hits outside the documented allowlist | [x] |
| G6 | Read-only production smoke test (modes: `--expect-private` for D2b, private cookie for F, anonymous for H3). **Plus (Update 6.4):** every `#blok` post has exactly one author, `dr`, and G6 **fails if any block has any other author, even when a containment route hides it**; every author archive in `sitemap-authors.xml` inspected; re-run after any staff change | ✅ Built: `test/prod/smoke.mjs` (GET only); exercised on local Ghost only | [x] |
| G12 | Local test: an additional author (Author role) with only real articles. Their archive, pagination and RSS show no block; `dr` archive unchanged (plan §16.8) | ⏸ **Deferred, not completed.** Outside the 21 Nov Phase B scope (G1–G7, G11). **Outstanding pre-launch item:** build and pass, or owner waiver, before the H-gate and before any second staff author is added; needs separate approval (Phase B report §8) | [ ] deferred |
| G7 | README "Production launch" section | ✅ Done | [x] |
| G11 | Test: every block `.md` URL is 404; no block in `llms.txt`/`llms-full.txt` (F11) | ✅ Built: `test/stage7/llms-markdown.mjs` (5/5 locally) + smoke test group `llms` | [x] |
| G8 | Local Stage 1–6 suites + guard + GScan (zip) all green on the release build | ✅ Green on the release zip (21 Nov): 32/23/12/39/21/16; GScan compatible, upload 0/0 | [x] |
| G9 | Zip and seed SHA-256 recorded here | ✅ zip `cb3d6f7441455cf2074ac5b55a9e9c801b6670dfa04eb249e255ba8f637835e1`; seed `db898cda59405955d1ad720f4f566ff3d50cb12486fcc7cdbbbf9c7aa8032eba`; routes `2f178dcb…`, redirects `aacd2f9c…` (full list in the Phase B report) | [x] |
| G10 | `npm run test:stage7` (author archive + private mode) green on the release build; the routes render step fails if any `dr` placeholder remains | ✅ Green on the release zip: 15/15, 12/12, plus LLM 5/5 and redirects 5/5 | [x] |

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
| I18 | UFW and Tencent security group: only SSH/80/443 | ✅ Tencent firewall: TCP 443/22/80 + ICMP allowed (all IPv4); no 3306 or 2368 (19 Nov) | [x] |
| I19 | 2368 and 3306 bound to localhost | ✅ | [x] |
| I20 | SSH: keys only, no root password login | ✅ resolved 18 Nov (M2: key-only, root off) | [x] |
| I21 | Security updates | ✅ applied 18 Nov (M3); automatic security updates enabled 20 Nov (M6, O35 done, MySQL excluded) | [x] |
| I22 | Cloudflare DNS records (view only). **Phase A:** no Cloudflare headers, and both names resolve to the server's own address: **DNS-only confirmed** (F4) | ✅ DNS-only (proxy off) | [x] |
| I23 | Cloudflare SSL Full (strict) | ✅ n/a | [x] |
| I24 | Always HTTPS on; Rocket Loader off; no Cache Everything or edge TTL on HTML, `/ghost/`, `/members/`, `/p/`; **Always Online off**; Cache Reserve noted | ✅ n/a | [x] |
| I25 | WAF not blocking Admin | ✅ n/a | [x] |
| I26 | Ghost mail for staff | ✅ resolved 18 Nov (M1, interim Gmail) | [x] |
| I27 | Inventory of current live content, theme, routes and redirects. **Phase A (public part done):** Ghost 6.75, theme Source, starter post `/coming-soon/`, page `/about/`, tag `news`, author `dr`; LLM features on; sign-up open. Drafts, routes and redirects need an Admin view | ✅ Public inventory (17 Nov) + Admin (19 Nov): 0 draft/scheduled posts and pages; routes = Ghost default; redirects 301/302 empty | [x] |
| I28 | Network status (must be off before import). **Phase A:** ActivityPub endpoints 403, so it looks inactive; confirm the toggle | ✅ Network **OFF** (Admin, 19 Nov); re-check at D3 | [x] |
| I29 | Membership access status. **Phase A:** sign-up **open** (F8, R30); member count needed | ✅ 0 members; browsing Public; subscriptions Nobody; new posts Public; comments Nobody (19 Nov). *17 Nov public API showed sign-up open (F8); change not dated* | [x] |
| I30 | MySQL root uses `auth_socket`; charset `utf8mb4`; database size (no secrets) | ✅ auth_socket, utf8mb4 | [x] |
| I32 | fail2ban `sshd` jail status (read-only) | ✅ fail2ban active, 1 jail (`sshd`): 262 total failed, 3 currently failed, 6 total banned, 0 currently banned (19 Nov) | [x] |
| I33 | `/etc/nginx/snippets/ssl-params.conf` contents (read-only) | ⚠️ Read (19 Nov): permits **TLS 1.0, 1.1, 1.2, 1.3** and **legacy ciphers** → R40; remediation needs approval (O37) | [x] |
| I34 | Owner confirms the accepted SSH password logins were theirs | ✅ **Resolved 19 Nov** (plan §16.7). *Owner-confirmed:* all 8 password logins (6 on 17 Nov from `60.50.85.64`, 2 on 18 Nov from `124.82.77.26`) are the owner's own; the later ED25519 key logins matched the owner's key and originated from the owner's confirmed connection; the 17 Nov `sudo` activity was the owner's. *Technical:* no unexpected interactive account; one ED25519 key (`SHA256:B1ia0qxNC+8QAAfc8XGVkkEtuyREnFr0ipULkHVuEmk`); root cron = acme.sh + Tencent Stargate (standard, verified against Tencent docs); public listeners only 22/80/443; 3306, 2368, 33060 on localhost. All eight investigated password logins were confirmed by the owner as authorised. The read-only checks found no evidence of unexplained access or persistence within the scope of this investigation. No evidence of a security breach was identified. | [x] |
| I31 | Which staff account is **Owner**; all staff slugs; no unknown accounts | ✅ Only **Dr Imran**, role **Owner**, slug `dr` (19 Nov) → §3.7 Case A | [x] |

## 4. Owner inputs (section O): nothing here will be invented

| ID | Needed from you | Used for | Status | Done |
|---|---|---|---|---|
| O1 | Doctor's profile photo (square, ≥ 400 px) | Byline, author box, homepage team card | ⏸ **Deferred – awaiting photoshoot** (owner, 23 Nov; no date set). Not completed, not approved, not waived; an outstanding launch dependency (`DAY-0-READINESS.md` §3) | [ ] |
| O2 | Final biography (≤ 250 characters; the local draft without dashes can be the starting point) | Author box, author page | ⏸ **Deferred – awaiting photoshoot** (owner, 23 Nov; no date set). Not completed, not approved, not waived; an outstanding launch dependency | [ ] |
| O3 | Exact credentials text (you stated "MD (UKM)"; please confirm the exact form) | `doctor_credentials` | ✋ **Pending owner confirmation** (23 Nov). Not part of the photoshoot deferral; the default "Doktor yang sah" must not go live | [ ] |
| O4 | Doctor's **production** staff slug (Admin → Staff → profile → Slug). Phase A: currently **`dr`**; keep it or choose another | `routes.yaml` (G3), `doctor_author_slug` | ✅ **Keep `dr`** (19 Nov) | [x] |
| O5 | Logo: confirm `logo-him-and-me.png` / `logo-mark.png` are final, or supply new files | Header, footer | ⏸ **Deferred to before Phase D** (owner, 19 Nov); does not block the A-gate | [ ] |
| O6 | Feature images (≥ 1600 px, ~16:7), alt text, captions and photo credits for each article | Articles | ⏸ **Deferred to before Phase D** (owner, 19 Nov); does not block the A-gate | [ ] |
| O7 | Final articles (text), each with verified references (replacing every `[Rujukan]`) | Blog | ⏸ **Deferred to before Phase D** (owner, 19 Nov); does not block the A-gate | [ ] |
| O8 | Business name and operator as it should appear (Notis Privasi names "Him & Me Wellness PLT") | Footer, legal | ⏸ **Deferred to before Phase D** (owner, 19 Nov); does not block the A-gate | [ ] |
| O9 | Address and Google Maps link (`address_short`, `google_maps_url`) | Footer, contact | ⏸ **Deferred to before Phase D** (owner, 19 Nov); does not block the A-gate | [ ] |
| O10 | WhatsApp number, default message and phone display | Every CTA | ⏸ **Deferred to before Phase D** (owner, 19 Nov); does not block the A-gate | [ ] |
| O11 | Booking: confirm the WhatsApp form is the booking method (no separate booking link) | CTAs | ⏸ **Deferred to before Phase D** (owner, 19 Nov); does not block the A-gate | [ ] |
| O12 | RM288 First Trial offer: still valid at launch? Any end date or terms? | Offer card and bar | ⏸ **Deferred to before Phase D** (owner, 19 Nov); does not block the A-gate | [ ] |
| O13 | Prices (consultation, shockwave, Kegel EMS) and whether to show them | ED page, homepage | ⏸ **Deferred to before Phase D** (owner, 19 Nov); does not block the A-gate | [ ] |
| O14 | Notis Privasi: confirm the current text is final (update it if analytics are added, O22) | `/notis-privasi/` | ⏸ **Deferred to before Phase D** (owner, 19 Nov); does not block the A-gate | [ ] |
| O15 | Homepage meta title and description; `/blog/` meta (the `jurnal` page) | SEO | ⏸ **Deferred to before Phase D** (owner, 19 Nov); does not block the A-gate | [ ] |
| O16 | Descriptions for the 7 category tags | Topic tiles and pages, SEO | ⏸ **Deferred to before Phase D** (owner, 19 Nov); does not block the A-gate | [ ] |
| O17 | Favicon / site icon (≥ 256 px square) and default social image (1200×630) | Browser, sharing | ⏸ **Deferred to before Phase D** (owner, 19 Nov); does not block the A-gate | [ ] |
| O18 | Confirm: no memberships, Portal, comments or newsletter | E2–E3 | ✅ **Confirmed** (19 Nov): no membership, subscriptions, comments or newsletters. Portal button + newsletter settings verified (look only) at E2/E3 | [x] |
| O19 | For each item already live on himandme.my: keep / replace / unpublish | Migration | ✅ **Approved** (19 Nov): unpublish "Coming soon" and "About". **Not yet executed**; due no later than the D-window, before D9 | [ ] |
| O20 | List of old URLs to redirect (or "none") | `redirects.yaml` | ✅ **Approved** (19 Nov): `/about/`→`/`, `/coming-soon/`→`/`, `/tag/news/`→`/blog/`, `/author/dr/`→`/blog/penulis/dr/` (301). Not yet implemented: prepared in Phase B, uploaded at D10 after re-checking against C10 | [x] |
| O21 | Structured business data: none, or **`LocalBusiness` (recommended)** with verified facts only. `MedicalBusiness` or a subtype only if you confirm the premises is registered or licensed as a healthcare facility. Also confirm whether "Him & Me Wellness PLT" may be used as `legalName` (registered and active) | SEO (plan §6.1) | ⏸ **Deferred to before Phase D** (owner, 19 Nov); does not block the A-gate | [ ] |
| O22 | Analytics: none / Cloudflare Web Analytics / GA4 | SEO, privacy | ◐ **Cloudflare Web Analytics** chosen (19 Nov), **subject to a privacy/consent review** (and O14 update if needed) before implementation; not implemented | [ ] |
| O23 | Launch with a minimum number of articles, or with none | Go/no-go | ⏸ **Deferred to before Phase D** (owner, 19 Nov); does not block the A-gate | [ ] |
| O24 | Days and hours: confirm "Isnin – Sabtu, 10 pagi – 6 petang · dengan temu janji sahaja" | Footer, ED page | ⏸ **Deferred to before Phase D** (owner, 19 Nov); does not block the A-gate | [ ] |
| O25 | Launch window (date and time). Private mode is **mandatory** during it (R1, plan §3.6) | Phase D | ⏸ **Deferred to before Phase D** (owner, 19 Nov); does not block the A-gate | [ ] |
| O26 | Merge option A or B (G0a), and the version number (G1) | Phase B | ✅ **Option A**, version **1.0.0** (19 Nov) | [x] |
| O27 | Private mode protects the website but **not** Ghost's Content API. During the migration, anyone with the public Content API key can retrieve the published blocks (and the 3 imported pages, and any published article). Accept this residual exposure of approved public copy (recommended), or state a stricter requirement (e.g. publish no article before H1) | Plan §3.6, R22 | ✅ **Accepted (conditional)** 19 Nov: blocks stay out of public listings and are protected by private mode, routes filtering, O28, O30, G6, G11, G12 | [x] |
| O28 | Block ownership | Plan §3.7, §16.8, R21 | ✅ **Decided 19 Nov (Update 6.4): every `#blok` post has `dr` as its only author.** Additional authors of any role need no route or theme change. Safeguards G6 + G12. **Confirmed by the owner 19 Nov (Update 6.5).** If broken: **reassign the block to `dr` only** (primary recovery). A filtered route (N2c) is only temporary containment; O28 stays unresolved, and G6 fails, until the block belongs exclusively to `dr` | [x] |
| O29 | Confirm the architecture record is corrected to 23 blocks (12 + 8 + 3) | V1 | ✅ **Confirmed** 23 blocks (19 Nov) | [x] |
| O30 | Turn off "Enable structured data for LLMs and AI search engines" before launch (recommended; required to keep blocks unreachable at `/blog/{slug}.md`). The cost is losing `llms.txt` and the article `.md` copies | E12, R28 | ✅ **Done 19 Nov** (owner). Step 1 verified: `/llms.txt` and `/llms-full.txt` → 302 `/`; `.md` → 302 to HTML; no LLM headers. Step 2 (all 23 block `.md` URLs → 404) after import (G11, Phase F and H3) | [x] |
| O31 | `www.himandme.my`: **A (recommended):** separate www certificate + 301 to the apex (M4 N1–N3); B: one certificate covering both names; C: remove the www DNS record. (Cloudflare redirect not possible while the proxy is off) | R29 | ✅ Decided 18 Nov: **Option A**; executed (N1–N3) | [x] |
| O32 | SSH key-only migration (M2): approve; confirm VNC break-glass, the key's device, and a second copy | R32 | ✅ Executed 18 Nov (M2) | [x] |
| O33 | Maintenance window for 27 updates + one reboot (M3), after a Tencent snapshot | R33 | ✅ Executed 18 Nov (M3; snapshot `himandme-pre-m3-updates-2026-11-18`) | [x] |
| O34 | Ghost mail provider (SMTP; port 587 is reachable, but delivery must be proven in M1) and its SPF/DKIM DNS records | R34 | ⏸ **Deferred** (19 Nov): Gmail kept temporarily; working config preserved; long-term provider later | [ ] |
| O35 | Enable automatic security updates (add the `-security` origin); reboots stay manual | R36 | ✅ **Executed 20 Nov 2026** (M6): security-only automatic updates, `mysql-` excluded, needrestart MySQL rule, reboots manual; first runs 20 and 21 Nov verified (plan §16.11) | [x] |
| O36 | Nginx catch-all and security headers (M4 N4–N6) | R31, R35 | ✅ Approved 18 Nov (subject to the HSTS review); N4–N5 done, N6 pending | [ ] |
| O37 | TLS hardening (M5): restrict protocols to TLS 1.2/1.3 in `nginx.conf` and `ssl-params.conf` (I33, R40). Cipher suites were **not** changed (owner decision); a cipher review remains a separate outstanding consideration | R40 | ✅ **Executed 21 Nov 2026** (M5): `ssl_protocols TLSv1.2 TLSv1.3;` in `nginx.conf` and `ssl-params.conf`; verified; ciphers unchanged (plan §16.11) | [x] |
| O38 | Staff-wide email 2FA in Ghost Admin (currently **off**); first confirm its interaction with `staffDeviceVerification` (R39) | R39 | ⏸ **Deferred** (19 Nov) pending a read-only investigation of its interaction with `staffDeviceVerification`; **both settings unchanged** | [ ] |
| O39 | I34 follow-up: read-only correlation and persistence checks (plan §16.2) | R41 | ✅ **Done 19 Nov:** I34 resolved, R41 closed (plan §16.7) | [x] |

## 4a. Future enhancements (not in scope)

| ID | Enhancement | Trigger | Status |
|---|---|---|---|
| FE1 | Multi-author attribution: separate the **article author** from the **medical reviewer** (for example, per-author credentials or a separate reviewer line) | Only if additional authors are introduced | Not started. The current single-author attribution ("Ditulis dan disemak oleh Dr. Imran", one profile, slug `dr`, the existing author box and credentials) stays unchanged (plan §16.8) |

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
| E10 | Unused integrations removed | ✅ No custom integrations (19 Nov) | [x] |
| E11 | Staff: real people only, 2FA (device verification is on, but it **depends on working mail: M1**) | 🔍 | [ ] |
| E12 | LLM setting off (Settings → General settings → Meta data) before H1 | ✅ Done 19 Nov (owner); step 1 verified; step 2 after import | [x] |

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
| S12 | Analytics decision | ◐ Cloudflare Web Analytics, subject to privacy/consent review (O22) | [ ] |
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
| M3 | Ubuntu updates + reboot (plan §14.3). **Executed 18 Nov 2026:** snapshot `himandme-pre-m3-updates-2026-11-18` → **27 upgraded, 7 newly installed, 0 removed, 2 phased updates deferred** → reboot → kernel 6.8.0-149, Node 22.23.5, MySQL 8.0.46.5; SSH, Nginx, MySQL, Ghost, fail2ban active. Automatic security updates (O35) were **not** done in M3; **completed later by M6 (20 Nov 2026)** | O33 ✅; O35 ✅ (completed by M6) | Reboot ~2–5 min | Phase C (recommended) | [x] | [x] |
| M4 | Nginx hardening. **Original Revision 6 procedure (plan §14.5–14.5a):** W0 apex fingerprint → N1 → W1 → N2 issue with **RSA 2048** → N2b `--install-cert` to `/etc/nginx/ssl/www.himandme.my/{cert,fullchain,key}.pem` → N3 → V1–V3 → N4 → N5 → N6. **Actual execution, 18 Nov 2026:** N1–N5 **complete**; the www certificate was issued as **ECDSA / EC-256** (not RSA) and installed via `--install-cert` to those paths (Update 6.1 below; plan §15.5–15.6). **The apex certificate is unchanged** (serial and SHA-256 fingerprint verified). **N6 pending** (HSTS `max-age=300`; review around 25 Nov) | O31 = Option A ✅; O36 approved (subject to the HSTS review) ✅; apex ACME location untouched | Nginx reloads only | Phase D (www rows of D2b) | [x] | [ ] (N6 pending) |
| M5 | TLS 1.2/1.3 only (O37, R40). **Executed 21 Nov 2026:** backup `/home/ubuntu/m5/backup-20261121-163931` → both `ssl_protocols` lines set to `TLSv1.2 TLSv1.3` → `nginx -t` + reload → verified: no other config change; certificates and headers (HSTS `max-age=300`) unchanged; TLS 1.0/1.1 refused, 1.2/1.3 accepted (apex and www); unknown host refused; apex 200, www 301. Ciphers unchanged | O37 ✅ | Nginx reload (none observed) | — | [x] | [x] |
| M6 | Security-only automatic updates, MySQL excluded, reboots manual (O35, R36). **Executed 20 Nov 2026 01:36 CST** after snapshot `himandme-pre-m6-2026-11-19`: `52himandme-unattended-upgrades` + `needrestart` `50himandme-mysql.conf` → verified (origins noble + noble-security; blacklist `mysql-`; no auto reboot). First automatic runs 20 and 21 Nov installed nginx, libgstreamer and python3-jwt security updates; MySQL untouched. Monthly runbook: `docs/stage-7/MONTHLY-MAINTENANCE.md` | O35 ✅ | none (config only) | — | [x] | [x] |

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
| **M5** | Done 21 Nov 2026 (plan §16.11) | [x] |
| **M6** | Done 20 Nov 2026; first automatic runs 20 and 21 Nov verified; monthly runbook `docs/stage-7/MONTHLY-MAINTENANCE.md`, first run around 19 Dec 2026 | [x] |
| Health 18 Nov | `nginx -t` OK; Nginx, MySQL, Ghost, SSH, fail2ban active; apex 200; www 301; headers present; unknown HTTP closed; disk 15 % used, 49 GB free; renewals: apex 5 Jan 2027, www 16 Jan 2027 | [x] |

**Next authorised action:** read-only only. Finish the open Phase A items (Admin/console views, I32, I33 rest, I34; *all done by 19 Nov, I34 resolved, plan §16.7*), then the N6 observation review around 25 Nov 2026, then the owner's decisions (plan §15.9).

## 9. Backup and rollback (§8)

| ID | Item | Status | Done |
|---|---|---|---|
| C1 | VPS snapshot | ✅ `himandme-pre-launch-2026-11-23` created by the owner (23 Nov). **Snapshot ID: PENDING (owner to provide).** Deleting `lhsnap-fzsuu5vx` (`himandme-pre-m3-updates-2026-11-18`) to free the quota was advised; **owner confirmation pending**. `lhsnap-hty2dne5` (`himandme-pre-m6-2026-11-19`) kept | [x] |
| C2 | Ghost JSON export | ✅ Export zip (Ghost 6.75 format); `export.json` valid, 2 posts/pages = database | [x] |
| C3 | `ghost backup` (staff token typed at the prompt only; zip contents listed) | ✅ Zip copied and verified; original kept in `/var/www/himandme` | [x] |
| C4 | MySQL dump: `DB=himandme` (confirmed) then `sudo mysqldump --single-transaction --no-tablespaces --default-character-set=utf8mb4 "$DB"`; exit 0, empty error file, "Dump completed" | ✅ Exit 0, empty error file, "Dump completed"; 2 posts, 103 tables, `utf8mb4_0900_ai_ci` | [x] |
| C5 | `content/` + Nginx confs | ✅ Content archived (`content/settings` empty: Ghost default routes); Nginx configuration only, private key correctly excluded | [x] |
| C6 | Current theme, routes, redirects downloaded | ✅ `source.zip`; `routes.yaml` = Ghost 6.75.0 default routes (SHA-256 verified); `redirects.yaml` 0 rules | [x] |
| C7 | Copies off the server | ✅ 23/23 files match the server checksums; owner's computer. **BitLocker:** turned on (whole drive) and still encrypting at the time of the copy; **completion and protection status On: PENDING owner confirmation** | [x] |
| C8 | Restore test off production: create `ghost_restore_test`, `sudo mysql ghost_restore_test < ghost-pre-launch.sql`, count posts and tables, drop it | ✅ WSL only: restored without errors; posts 2 = 2, tables 103 = 103, theme `source` = server; dropped. Routes review item resolved | [x] |
| C9 | Rollback rule: `ghost stop` before any database restore, `ghost start` after | ✅ rehearsed | [x] |
| C10 | List of every currently public URL saved (`old-urls.txt`), for D2b and O20 | ✅ 7 URLs (all sitemap requests HTTP 200); matches the independent check and O20 | [x] |

## 10. Phases and approval gates (§9)

| Phase | Gate | Status | Approved |
|---|---|---|---|
| Plan | Owner approves the plan's direction | ✅ 16 Nov 2026 | [x] |
| Revision 3 | Owner approves the plan | ✅ 17 Nov 2026 | [x] |
| Revision 4 | **Phase A authorised** (read-only: I1–I31, live-site inventory, owner inputs and decisions, review of findings and risk register). Excludes merges, releases, backups, database, DNS or Cloudflare changes, imports, publishing, theme activation and any production change | ✅ 17 Nov 2026 | [x] |
| Phase A findings | Presented to the owner; Phase B needs **separate written approval** | ✅ Presented and accepted (19 Nov); decisions recorded (plan §16.9) | [x] |
| A. Preparation and audit | 🛑 A-gate | ✅ **Signed off by the owner 19 Nov 2026** (plan §16.10). Carried forward: N6, M5, M6, O19, O20, O22, O30 step 2, deferred O34/O38/content inputs. **Phase B needs separate written approval** | [x] |
| B. GitHub merge and release prep | 🛑 B-gate | ✅ **B-gate approved by the owner 21 Nov 2026; Phase B closed** (plan §16.13). PR #8 merged (merge commit `d2a014e65874b4624f5f6be72c7d14214c1ba7b2`); `main` = that commit. Tag `v1.0.0` on that commit (G1, verified). G12 deferred (outstanding pre-launch item). **Phase C needs separate written approval** | [x] |
| C. Production backup | 🛑 C-gate | ✅ C1–C10 done 23 Nov 2026 (report `docs/stage-7/PHASE-C-REPORT.md`, plan §16.14). **Administrative closeout pending:** snapshot ID, BitLocker completion, C-gate approval, PR #10 merge (report §6). Day 0 readiness: `docs/stage-7/DAY-0-READINESS.md` | [ ] |
| D. Theme and content deployment (**private mode ON at D1; public-domain checks D2b before the import**) | 🛑 D-gate | ⛔ C-gate | [ ] |
| E. Production configuration | (with D) | ⛔ D | [ ] |
| F. Staging and functional testing | 🛑 F-gate | ⛔ E | [ ] |
| G. Final launch approval | 🛑 G-gate | ⛔ F-gate | [ ] |
| H. Public launch (**private mode OFF at H1**, purge, anonymous checks through the real domain) and post-launch checks | 🛑 H-gate (48 h sign-off) | ⛔ G-gate | [ ] |
