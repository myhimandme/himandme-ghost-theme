# Phase D – Day 0 readiness

> **Status (23 Nov 2026, Update 6.14):** preparation and documentation only. **Phase D is not authorised and has not started.** No production change has been made for Phase D: no theme upload or activation, no import, no routes or redirects, no settings, DNS, Cloudflare or Nginx change.
> - **Sources of truth:** `docs/STAGE-7-PLAN.md` (§3.6 cut-over sequence D0–H3, §5, §7, §8, §16.8), `docs/STAGE-7-CHECKLIST.md`, [`LAUNCH-PLAN-5-DAY.md`](LAUNCH-PLAN-5-DAY.md), [`PHASE-C-REPORT.md`](PHASE-C-REPORT.md).
> - **Nothing is waived.** Every item below stays open until it is done, or until the owner decides it explicitly in writing.

## Assessment: **NO-GO for Day 1** (as of 23 Nov 2026)

Day 1 cannot start yet, for these reasons:
1. **PR #10 is not merged.** The Phase C C-gate was approved on 23 Nov 2026. The snapshot `lhsnap-6jevw0v9`, old-snapshot deletion and BitLocker On are confirmed. Merging PR #10 is a separate decision.
2. **Phase D has no written approval.**
3. **Inputs still open:** approval of the meta and topic drafts (A5, A6, §7), the 10 launch articles (A9), and the dates (A10, §8). Business details, Maps link, privacy notice, logo, icons and credentials are ✅ (23 Nov).
4. **G12 is approved to build but not built yet** (T4; needed before the G-gate). Decisions O27, G12 and A13 are ✅ made.

None of these is a technical failure. They are approvals, inputs and decisions. When §6 is fully green, Day 1 is **GO**.

## 1. Can be completed now

These don't depend on the photoshoot or on missing owner inputs. None of them changes production.

| # | Task | Who | Notes |
|---|---|---|---|
| 1.1 | Draft the homepage and `/blog/` meta titles and descriptions (O15) **for the owner's approval** | Me, on request | Drafts only. Uses only already-approved copy; no new clinical claims |
| 1.2 | Draft the 7 topic descriptions (O16) **for approval**: `disfungsi-ereksi`, `hormon-testosteron`, `kesihatan-pelvis`, `seks-hubungan`, `kesihatan-mental`, `gaya-hidup`, `panduan` | Me, on request | Same rule as 1.1 |
| 1.3 | Prepare the Day 1 window sheet (D0–D10 and E1–E12, with each step's check) and the Day 2 test sheet (F: G6 cookie mode, §7.1–7.3) from plan §3.6, §5 and §7 | Me | Documentation only. The procedure is unchanged |
| 1.4 | Prepare the Day 2 smoke-test environment on the owner's computer: Node.js in the existing WSL Ubuntu (`sudo apt install -y nodejs`), plus a copy of the repository (GitHub → Code → Download ZIP) | Owner (optional, now) | The smoke test (G6) needs no packages. It sends only GET requests, and its cookie never leaves the computer |
| 1.5 | Re-verify the release files before D0: `sha256sum -c dist/SHA256SUMS` (zip `cb3d6f74…`, seed `db898cda…`) | Me | Read-only |
| 1.6 | Phase C records: snapshot ID `lhsnap-6jevw0v9`, old-snapshot deletion, BitLocker On | Owner | ✅ All confirmed 23 Nov |

## 2. Awaiting owner input or approval

| # | Item | What is needed | Plan ref |
|---|---|---|---|
| A1 | Business details | ✅ **Confirmed by the owner (23 Nov)**: the 5 Nov details below, unchanged. No end date or extra terms were stated for the First Trial offer | O8–O13, O24 |
| A2 | Google Maps link | ✅ Supplied (23 Nov): `https://maps.app.goo.gl/D7z4WBSEvZTS9Eyw8`. Set as theme setting `google_maps_url` at D8 | O9 |
| A3 | Privacy notice | ✅ **Approved by the owner (23 Nov)**: the BM + English Notis Privasi as supplied | O14 |
| A4 | Logo | ✅ **Confirmed final (23 Nov)**: the current theme files | O5 |
| A5 | Meta texts | Drafts in §7 (23 Nov). **Awaiting approval.** Applied in Ghost Admin at E5 (homepage: General → Meta data; `/blog/`: the `jurnal` page's meta), not in the repository, so the release files are unchanged | O15 |
| A6 | Topic descriptions | Drafts in §7 (23 Nov). **Awaiting approval** (clinical wording to be checked by the doctor). Entered in Ghost Admin at D6 (tags) | O16 |
| A7 | Site icon | ✅ Received (23 Nov): logo mark, PNG, **256 × 256**, transparent background. Uploaded at E6 | O17 |
| A8 | Social sharing image | ✅ **Replaced by the owner (23 Nov)**: 1200 × 630, WebP, logo + "Kesihatan Lelaki, Keutamaan Kami.", without the ✦ mark of the first version (SHA-256 begins `a4aef2d76197e304`). Uploaded at E6 | O17 |
| A9 | Articles at launch | **10** (owner, 23 Nov). **Open:** each needs the final text, verified references (no `[Rujukan]`), a feature image (≥ 1600 px, about 16:7) with alt text and caption, author `dr` only, and one topic. **Owner to confirm the 10 are written and reviewed, and supply them.** They are entered in Ghost Admin while private (Days 2–3) and checked in F | O7, O6, O23 |
| A10 | Dates | **Open: proposal in §8 awaiting the owner's choice.** Outside 06:00–07:30 | O25 |
| A11 | Content API exposure during the private window | ✅ **Accepted by the owner (23 Nov)** (recommended option) | O27 |
| A12 | G12 second-author test | ✅ **Option A approved (23 Nov): build and run it** (local only). Not yet built; T4 | G12, plan §16.8 |
| A13 | Deferred doctor's profile | ✅ **Owner decision (23 Nov): the site may go public with the photo placeholder and without a biography** until the photoshoot. Scope in §3 | — |
| A14 | Doctor's credentials | ✅ **Confirmed by the owner (23 Nov): "MD (UKM)"**. Set as `doctor_credentials` at D8 | O3 |
| A15 | PR #10 | Approve the PR #10 merge (the C-gate itself was approved 23 Nov 2026) | Checklist §10 |
| A16 | Phase D | Separate written approval | Plan §9 |
| A17 | On-server personal-data copies | Approve or decline removing the extra copies left by `ghost backup` (`/var/www/himandme/backup-from-…zip` and `content/data/`). Not required for Day 1 | Phase C report §4 |

The 5 Nov details to confirm for A1:
- **Operator:** Him & Me Wellness PLT.
- **Address:** 1-3, Eight Setiawangsa, Jalan Setiawangsa 13, Taman Setiawangsa, 54200 Kuala Lumpur.
- **Phone and WhatsApp:** 011-5791 2606, WhatsApp 601157912606. The WhatsApp form is the booking method.
- **Offer:** First Trial RM288, with any end date.
- **Prices:** consultation RM150 (free with First Trial), Shockwave RM450, Kegel EMS RM350.
- **Hours:** Isnin – Sabtu, 10 pagi – 6 petang, by appointment only.

## 3. Deferred until after the photoshoot (owner decision, 23 Nov 2026)

| Item | Status | Used for |
|---|---|---|
| Doctor's photograph (square, ≥ 400 px) | **Deferred – awaiting photoshoot** | Byline, author box, homepage team card |
| Doctor's biography (≤ 250 characters) | **Deferred – awaiting photoshoot** | Author box, author page |
| Doctor's profile completion (staff profile in Ghost: photo, bio) | **Deferred – awaiting photoshoot** | D6, D8 check, S8 |

- **No photoshoot date has been set.** None is assumed.
- These items are **not completed, not approved and not waived.** They remain **outstanding launch dependencies**.
- They are tracked here, and are not raised as daily Day 0 actions while the photoshoot is being arranged.
- **Where they bite in the plan:**
  - **D6:** staff profile.
  - **D8:** the homepage team card must show the doctor, not a placeholder.
  - **F/H3:** the placeholder scans.
  - **§8.3 rollback trigger:** a visible placeholder.
- **Owner decision A13 (23 Nov 2026, in writing):** "it's ok to still have placeholder when the site go public … it's just a small business, audiences will understand." **Recorded scope (narrow):**
  - **Accepted at launch:** the theme's neutral patterned graphic in place of the doctor's **photo** (homepage team card, article byline and author box, author page), and **no biography** (the theme simply omits it).
  - **Not accepted, unchanged:** any text placeholder, such as `[Nama Penuh]`, `[Peranan]`, `[Rujukan]` or test content. These appear only if `doctor_author_slug` is unset or wrong, so D8 must still show the doctor's real name with "MD (UKM)". The placeholder scans (G5, G6) and rollback trigger §8.3 still apply to them.
  - **§8.3 "placeholder visible" trigger:** it does not fire for the photo graphic described above. It still fires for every text placeholder and all test content.
  - **The photo, biography and profile completion stay outstanding** (deferred, awaiting photoshoot). They are added after the photoshoot, with the placeholder and author-archive checks run again. **Nothing else is waived.**

## 4. Technical blockers and dependencies

| # | Item | Status | Needed before |
|---|---|---|---|
| T1 | New snapshot ID for `himandme-pre-launch-2026-11-23` | ✅ **`lhsnap-6jevw0v9`** (owner, 23 Nov) | Done |
| T2 | Deletion of the old snapshot `lhsnap-fzsuu5vx` (to free the quota) | ✅ **Confirmed by the owner (23 Nov)** | Done |
| T3 | BitLocker encryption complete and protection status **On** (the drive holding the off-server copies) | ✅ **Confirmed by the owner (23 Nov)** | Done |
| T4 | G12 second-author local test | **Approved to build (Option A, 23 Nov); not yet built.** Must pass before the G-gate | G-gate |
| T5 | N6 HSTS observation and review (`max-age=300` now; review due around 25 Nov). Its own maintenance approval; **never inside the D window** | **Pending** | Decision recorded before the G-gate. Not a Day 1 blocker |
| T6 | O28 block ownership: every `#blok` post owned only by `dr` | Enforced at import (D5) and verified by G6 in F and H3 | F-gate |
| T7 | O30 step 2: block `.md` addresses return 404 after the import | Step 1 ✅ (19 Nov; `llms_enabled` still false in C4). Step 2 runs in F (G6 `llms` group) and H3 | F-gate |
| T8 | G6 smoke test (`--expect-private` for D2b, cookie for F, anonymous for H3) | Built ✅ (Phase B). Needs the Day 2 environment (§1.4) | D2b / F |
| T9 | G11 LLM test | Built ✅, 5/5 locally; re-verified by G6 on production | F |
| T10 | O19: unpublish "Coming soon" and "About" | Approved, **not executed** | During the D window, before D9 |
| T11 | O20: 4 redirects | Ready (`redirects.yaml`); re-checked against C10 ✅ (the same 4 URLs) | D10 |
| T12 | Release files unchanged (zip `cb3d6f74…`, tag `v1.0.0` → `d2a014e`) | ✅ Verified 23 Nov | Re-checked at D0 |
| T13 | O34 long-term mail provider | Deferred (Gmail SMTP works) | After launch, within 30 days |
| T14 | O38 staff 2FA investigation | Deferred | After launch, within 14 days |
| T15 | O21 structured data; O22 analytics; O37 cipher review | Open, post-launch | After launch |

## 5. Already satisfied (for reference)

| Area | Done |
|---|---|
| Phases | A signed off; B closed (`v1.0.0`) |
| Phase C | C1–C10 passed, with closeout pending (T1–T3) |
| Server maintenance | M1–M3, M4 N1–N5, M5, M6 (O35) |
| www | Redirects to the apex (D2b prerequisite) |
| O30 step 1 | Done |
| Release tooling | G1–G7, G11 |

## 6. Phase D start conditions (all must be true before Day 1 begins)

| # | Condition | Status |
|---|---|---|
| S1 | C-gate approved by the owner | ☑ 23 Nov 2026 |
| S2 | PR #10 merged (Phase C scripts and record on `main`) | ☐ |
| S3 | Snapshot ID recorded (`lhsnap-6jevw0v9`); old-snapshot deletion; BitLocker On (T1–T3) | ☑ |
| S4 | Inputs needed in the window: A1–A10 and A14 | ☐ A1–A4, A7, A8, A14 ✅; **open:** A5, A6 (approval of drafts), A9 (the 10 articles), A10 (dates) |
| S5 | Decisions A11 (O27), A12 (G12) and A13 (profile) | ☑ All decided 23 Nov (G12 still to be built: T4) |
| S6 | Day 1 date and start time agreed, outside 06:00–07:30 | ☐ |
| S7 | Day 1 window sheet ready (§1.3); release checksums re-verified (§1.5) | ☐ |
| S8 | **Written approval of Phase D** | ☐ |

**Recommendation:** NO-GO until S1–S8 are all ticked. Then GO.

The deferred profile (§3) does not have to block Day 1 if the owner decides A13 accordingly. It does block the G-gate until it is completed, or until the owner decides otherwise in writing.

## 7. Drafts for approval (A5, A6), 23 Nov 2026

These use only already-approved copy, make no treatment or outcome claims, and contain no dashes. They're applied in Ghost Admin, not in the repository, so the release zip and seed checksums don't change.

**A5 · Meta texts** (Google shows about 60 characters of a title and about 155 of a description)

| Page | Field | Draft | Length |
|---|---|---|---|
| Homepage (Settings → General → Meta data) | Title | Him & Me Mens Health Setiawangsa \| Kesihatan Lelaki | 51 |
| | Description | Penilaian dan rawatan disfungsi ereksi secara sulit di Setiawangsa, Kuala Lumpur. Konsultasi doktor, Shockwave Therapy dan Kegel EMS. | 133 |
| `/blog/` (page `jurnal` → meta) | Title | Jurnal Kesihatan Lelaki \| Him & Me | 34 |
| | Description | Artikel pendidikan tentang kesihatan lelaki: disfungsi ereksi, hormon, kesihatan pelvis, hubungan dan gaya hidup, ditulis dalam bahasa yang mudah. | 146 |

The ED page and Notis Privasi already have approved meta texts in the launch seed (unchanged).

**A6 · Topic descriptions** (tag description in Ghost Admin; shown on the topic tiles and pages)

| Topic (slug) | Draft |
|---|---|
| `disfungsi-ereksi` | Punca, cara penilaian dan pilihan rawatan disfungsi ereksi, diterangkan dengan jelas dan tanpa rasa malu. |
| `hormon-testosteron` | Peranan testosteron dan hormon lain dalam tenaga, mood dan kesihatan seksual lelaki. |
| `kesihatan-pelvis` | Otot lantai pelvis, kawalan pundi kencing dan fungsi seksual: apa yang perlu diketahui dan cara menjaganya. |
| `seks-hubungan` | Keintiman, komunikasi dengan pasangan dan kesihatan seksual dalam hubungan jangka panjang. |
| `kesihatan-mental` | Tekanan, kebimbangan dan kesannya terhadap kesihatan lelaki, termasuk kesihatan seksual. |
| `gaya-hidup` | Tidur, pemakanan, senaman dan tabiat harian yang menyokong kesihatan lelaki. |
| `panduan` | Panduan praktikal langkah demi langkah, termasuk apa yang dijangka semasa konsultasi dan rawatan. |

## 8. Proposed dates (A10), awaiting the owner's choice

**What the days are:**
- **Day 1:** about 2–3 hours at the computer, logged into Ghost Admin, while I guide step by step. The site goes **private** and the new theme and content are installed.
- **Days 2–3:** checking everything privately, and entering the 10 articles.
- **Day 4:** the site goes **public**.

| | Proposal |
|---|---|
| N6 HSTS review (separate, short, not part of Phase D) | Wed 25 Nov |
| **Day 1** (private setup) | **Thu 26 Nov, 10:00** |
| Day 2 (testing, articles) | Fri 27 Nov |
| Day 3 (buffer, go/no-go) | Sat 28 Nov |
| **Day 4** (public launch) | **Mon 30 Nov, 10:00**: a clinic day, so WhatsApp enquiries can be answered |

The proposal depends on the 10 articles being ready by Day 2, and on the merge of PR #10, the G12 result and written approval of Phase D before Day 1.
