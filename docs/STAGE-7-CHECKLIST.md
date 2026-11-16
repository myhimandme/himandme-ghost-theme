# Stage 7 checklist: production readiness

> **Status: planning complete, implementation NOT started (16 Nov 2026).** Awaiting the owner's approval of `docs/STAGE-7-PLAN.md`.
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
| G: GitHub and release (§1) | 7 | 0 | 2 | 3 |
| I: Infrastructure (§2) | 0 | 29 | 0 | 0 |
| O: Owner inputs (section 4 below) | 0 | 0 | 26 | 0 |
| E: Production config (§5) | 2 | 3 | 5 | 1 |
| S: SEO (§6) | 1 | 6 | 7 | 0 |
| Phases A–H | 0 | 0 | 0 | 8 (each waits for the gate before it) |

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
- [ ] ✋ **Owner approval of this plan**

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
| G6 | Read-only production smoke test | ✅ ready to build | [ ] |
| G7 | README "Production launch" section | ✅ ready | [ ] |
| G8 | Local Stage 1–6 suites + guard + GScan (zip) all green on the release build | ✅ last run green (32/23/12/39/21/16; GScan 0/0) | [ ] re-run on release |
| G9 | Zip and seed SHA-256 recorded here | ⛔ G1–G5 | [ ] |

## 3. Infrastructure (§2): all 🔍, read-only, run by the owner

| ID | Check | Status | Done |
|---|---|---|---|
| I1 | OS version, reboot pending | 🔍 | [ ] |
| I2 | Ghost 6.75.0, `ghost ls` running | 🔍 | [ ] |
| I3 | Config (filtered: **no secrets**): url, host, db client, mail | 🔍 | [ ] |
| I4 | `ghost doctor` | 🔍 | [ ] |
| I5 | Node 22 | 🔍 | [ ] |
| I6 | systemd unit active and enabled, user `ghost` | 🔍 | [ ] |
| I7 | No recurring errors in the journal | 🔍 | [ ] |
| I8 | Ownership and permissions of the install and `content/` | 🔍 | [ ] |
| I9 | `nginx -t`, site confs | 🔍 | [ ] |
| I10 | Proxy, upload size, real IP, headers | 🔍 | [ ] |
| I11 | TLS certificate valid, issuer noted | 🔍 | [ ] |
| I12 | Certificate renewal works | 🔍 | [ ] |
| I13 | HTTP→HTTPS and www/apex redirects; one canonical host | 🔍 | [ ] |
| I14 | MySQL 8.0 running | 🔍 | [ ] |
| I15 | Ghost ↔ DB connectivity | 🔍 | [ ] |
| I16 | Disk space for backups | 🔍 | [ ] |
| I17 | Memory and swap | 🔍 | [ ] |
| I18 | UFW and Tencent security group: only SSH/80/443 | 🔍 | [ ] |
| I19 | 2368 and 3306 bound to localhost | 🔍 | [ ] |
| I20 | SSH: keys only, no root password login | 🔍 | [ ] |
| I21 | Security updates | 🔍 | [ ] |
| I22 | Cloudflare DNS records (view only) | 🔍 | [ ] |
| I23 | Cloudflare SSL Full (strict) | 🔍 | [ ] |
| I24 | Always HTTPS on; Rocket Loader off; no cache on `/ghost/`, `/members/`, `/p/` | 🔍 | [ ] |
| I25 | WAF not blocking Admin | 🔍 | [ ] |
| I26 | Ghost mail for staff | 🔍 | [ ] |
| I27 | Inventory of current live content, theme, routes and redirects | 🔍 | [ ] |
| I28 | Network status (must be off before import) | 🔍 | [ ] |
| I29 | Membership access status | 🔍 | [ ] |

## 4. Owner inputs (section O): nothing here will be invented

| ID | Needed from you | Used for | Status | Done |
|---|---|---|---|---|
| O1 | Doctor's profile photo (square, ≥ 400 px) | Byline, author box, homepage team card | ✋ | [ ] |
| O2 | Final biography (≤ 250 characters; the local draft without dashes can be the starting point) | Author box, author page | ✋ | [ ] |
| O3 | Exact credentials text (you stated "MD (UKM)"; please confirm the exact form) | `doctor_credentials` | ✋ | [ ] |
| O4 | Doctor's **production** staff slug (Admin → Staff → profile → Slug) | `routes.yaml` (G3), `doctor_author_slug` | ✋ (blocks G3) | [ ] |
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
| O21 | Structured business data (`MedicalBusiness`/`LocalBusiness`): yes or no | SEO | ✋ | [ ] |
| O22 | Analytics: none / Cloudflare Web Analytics / GA4 | SEO, privacy | ✋ | [ ] |
| O23 | Launch with a minimum number of articles, or with none | Go/no-go | ✋ | [ ] |
| O24 | Days and hours: confirm "Isnin – Sabtu, 10 pagi – 6 petang · dengan temu janji sahaja" | Footer, ED page | ✋ confirm | [ ] |
| O25 | Launch window (date and time) and whether private mode is used during it (R1) | Phase D | ✋ | [ ] |
| O26 | Merge option A or B (G0a), and the version number (G1) | Phase B | ✋ | [ ] |

## 5. Content and test-data exclusion (§3)

| Item | Status | Done |
|---|---|---|
| 23 blocks + 3 pages approved; no open ❓ in `docs/CLINICAL-REVIEW.md` | ✅ | [x] |
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
| E11 | Staff: real people only, 2FA | 🔍 | [ ] |

## 7. SEO (§6)

| ID | Item | Status | Done |
|---|---|---|---|
| S1 | Sitemap correct, no `blok-` | 🔍 | [ ] |
| S2 | `/jurnal/` redirect in sitemap: accepted | ✅ | [x] |
| S3 | robots.txt not blocking | 🔍 | [ ] |
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
| `#blok` exclusion 7.2 on production | ⛔ Phase F | [ ] |
| Security checks 7.3 | ⛔ Phase F | [ ] |
| Destructive suites never pointed at production | ✅ enforced (localhost only) | [x] |

## 9. Backup and rollback (§8)

| ID | Item | Status | Done |
|---|---|---|---|
| C1 | VPS snapshot | ⛔ B-gate | [ ] |
| C2 | Ghost JSON export | ⛔ B-gate | [ ] |
| C3 | `ghost backup` | ⛔ B-gate | [ ] |
| C4 | MySQL dump | ⛔ B-gate | [ ] |
| C5 | `content/` + Nginx confs | ⛔ B-gate | [ ] |
| C6 | Current theme, routes, redirects downloaded | ⛔ B-gate | [ ] |
| C7 | Copies off the server | ⛔ B-gate | [ ] |
| C8 | Restore tested locally | ⛔ B-gate | [ ] |

## 10. Phases and approval gates (§9)

| Phase | Gate | Status | Approved |
|---|---|---|---|
| Plan | Owner approves this plan | ✋ | [ ] |
| A. Preparation and audit | 🛑 A-gate | ⛔ plan approval | [ ] |
| B. GitHub merge and release prep | 🛑 B-gate | ⛔ A-gate | [ ] |
| C. Production backup | 🛑 C-gate | ⛔ B-gate | [ ] |
| D. Theme and content deployment | 🛑 D-gate | ⛔ C-gate | [ ] |
| E. Production configuration | (with D) | ⛔ D | [ ] |
| F. Staging and functional testing | 🛑 F-gate | ⛔ E | [ ] |
| G. Final launch approval | 🛑 G-gate | ⛔ F-gate | [ ] |
| H. Public launch and post-launch checks | 🛑 H-gate (48 h sign-off) | ⛔ G-gate | [ ] |
