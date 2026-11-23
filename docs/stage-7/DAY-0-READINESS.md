# Phase D – Day 0 readiness

> **Status (23 Nov 2026, Update 6.13):** preparation and documentation only. **Phase D is not authorised and has not started.** No production change has been made for Phase D: no theme upload or activation, no import, no routes or redirects, no settings, DNS, Cloudflare or Nginx change.
> - **Sources of truth:** `docs/STAGE-7-PLAN.md` (§3.6 cut-over sequence D0–H3, §5, §7, §8, §16.8), `docs/STAGE-7-CHECKLIST.md`, [`LAUNCH-PLAN-5-DAY.md`](LAUNCH-PLAN-5-DAY.md), [`PHASE-C-REPORT.md`](PHASE-C-REPORT.md).
> - **Nothing is waived.** Every item below stays open until it is done, or until the owner decides it explicitly in writing.

## Assessment: **NO-GO for Day 1** (as of 23 Nov 2026)

Day 1 cannot start yet, for these reasons:
1. **Phase C is not closed:**
   - the C-gate is not approved;
   - PR #10 is not merged;
   - (the snapshot ID `lhsnap-6jevw0v9`, old-snapshot deletion and BitLocker On are now confirmed; only the C-gate and PR #10 remain for Phase C).
2. **Phase D has no written approval.**
3. **Owner inputs needed during the Day 1 window are missing:** business details, Maps link, privacy notice, logo, meta texts, topic descriptions, icons, article count, dates (§2).
4. **Decisions needed before the window are open:** O27, G12, and how Day 1 handles the deferred doctor's profile (§4).

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
| A1 | Business details | One confirmation that the doctor-reviewed details (5 Nov) are still correct at launch (listed after this table) | O8–O13, O24 |
| A2 | Google Maps link | The `google_maps_url` (not yet supplied) | O9 |
| A3 | Privacy notice | Approve the supplied BM + English Notis Privasi as final | O14 |
| A4 | Logo | Provide the final logo files, or confirm the current ones are final | O5 |
| A5 | Meta texts | Approve the homepage and `/blog/` meta titles and descriptions (drafts in §1.1 on request) | O15 |
| A6 | Topic descriptions | Approve the 7 descriptions (drafts in §1.2 on request) | O16 |
| A7 | Site icon | Square PNG, **at least 256 × 256 px** | O17 |
| A8 | Social sharing image | **1200 × 630 px** | O17 |
| A9 | Articles at launch | A number. **0 is allowed**; **1–3 is recommended** (with 0, the blog shows its empty states) | O23 |
| A10 | Dates | Day 1 and Day 4 dates and start times, **outside 06:00–07:30** (server time; automatic security updates run around 06:38) | O25 |
| A11 | Content API exposure during the private window | Accept (recommended) or state a stricter rule | O27 |
| A12 | G12 second-author test | **Approve building it** (local only), **or** waive it in writing with the restriction "no second staff author until G12 passes" | G12, plan §16.8 |
| A13 | Deferred doctor's profile and Day 1 | Decide whether Day 1 may run while the profile is deferred (§3) | — |
| A14 | Doctor's credentials | Confirm the exact text (stated earlier as "MD (UKM)"). **Pending owner confirmation.** The default "Doktor yang sah" must not go live | O3 |
| A15 | C-gate, and PR #10 | Approve the C-gate and the PR #10 merge | Checklist §10 |
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
- A missing photo shows the theme's placeholder image, and a visible placeholder is a rollback trigger. So the profile must be complete **before the G-gate (public launch)**, unless the owner decides otherwise in writing. **This document makes no such decision.**
- **Decision A13 (owner):** may Days 1–2 run in private mode with the profile still deferred, with D6/D8 profile steps and their checks completed after the photoshoot, before the G-gate? Or should Day 1 wait for the photoshoot? Neither option is assumed here.

## 4. Technical blockers and dependencies

| # | Item | Status | Needed before |
|---|---|---|---|
| T1 | New snapshot ID for `himandme-pre-launch-2026-11-23` | ✅ **`lhsnap-6jevw0v9`** (owner, 23 Nov) | Done |
| T2 | Deletion of the old snapshot `lhsnap-fzsuu5vx` (to free the quota) | ✅ **Confirmed by the owner (23 Nov)** | Done |
| T3 | BitLocker encryption complete and protection status **On** (the drive holding the off-server copies) | ✅ **Confirmed by the owner (23 Nov)** | Done |
| T4 | G12 second-author local test: built and passed, **or** an explicit written waiver with the restriction above | **Open** (A12) | G-gate (plan §16.8). Recommended: settled before Day 1 |
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
| S1 | C-gate approved by the owner | ☐ |
| S2 | PR #10 merged (Phase C scripts and record on `main`) | ☐ |
| S3 | Snapshot ID recorded (`lhsnap-6jevw0v9`); old-snapshot deletion; BitLocker On (T1–T3) | ☑ |
| S4 | Inputs needed in the window: A1–A10 and A14 | ☐ |
| S5 | Decisions A11 (O27), A12 (G12) and A13 (profile sequencing) | ☐ |
| S6 | Day 1 date and start time agreed, outside 06:00–07:30 | ☐ |
| S7 | Day 1 window sheet ready (§1.3); release checksums re-verified (§1.5) | ☐ |
| S8 | **Written approval of Phase D** | ☐ |

**Recommendation:** NO-GO until S1–S8 are all ticked. Then GO.

The deferred profile (§3) does not have to block Day 1 if the owner decides A13 accordingly. It does block the G-gate until it is completed, or until the owner decides otherwise in writing.
