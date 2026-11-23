# Him & Me: accelerated launch execution plan (Phases D–H in five working days)

> **Status:** proposal for the owner's review, prepared during Phase C (23 Nov 2026). It **compresses the schedule only**. Every gate, check and rollback rule in `docs/STAGE-7-PLAN.md` (§3.6, §5, §7, §8, §9) stays as approved. Nothing here authorises Phase D: each gate still needs the owner's written approval.
> - **Day 1** = the first working day after the C-gate is approved **and** every launch blocker in §2 is supplied.
> - **Priorities:** homepage, Disfungsi Ereksi page, blog structure, privacy notice, the real doctor profile and the business details. Articles can follow after launch (§4).

## 1. Schedule

| Day | Phase | Work (plan reference) | Who | Gate / exit check |
|---|---|---|---|---|
| **0** (now, alongside Phase C) | Inputs | Supply the §2 blockers. I draft the meta texts (O15) and the 7 topic descriptions (O16) for approval. If approved, I build G12 locally (no production access) | Owner, me | All §2 items ✅ |
| **1** | **D + E** (one window, 2–3 h, private mode) | Check the zip SHA-256 `cb3d6f74…` before upload. D0 upload (not activated) → **D1 private ON** → D2 purge → **D2b anonymous checks against the C10 list** → D3 Network off → D4 Owner and slug → O19 unpublish "Coming soon" and "About" → **D5 import the launch seed** (exactly 23 blocks) → D6 tags, staff profile, navigation → **D7 activate** → D8 theme settings → **D9 routes** → **D10 redirects** (O20) → E1–E12 | Owner in Admin; me guiding live | 🛑 **D-gate:** each step's check passes before the next |
| **2** | **F** (still private) | Smoke test (G6) with the private-site cookie, run on your computer (WSL, from the repo ZIP; no secret leaves your machine): pages, `#blok` exclusion, every author archive, block ownership (O28), **O30 step 2** (block `.md` → 404 after the import), placeholders, headers. Then the §7.1 checks on desktop, a 390 px phone and with no JavaScript, the §7.3 security checks, and your visual review | Owner (run, look); me (read results, fix guidance) | 🛑 **F-gate:** every check green; screenshots reviewed |
| **3** | Buffer → **G** | Fix anything F found (Admin content edits only; any theme change goes back through a release PR). G12 result or waiver recorded. Go/no-go against the risk register, open items and rollback readiness | Owner | 🛑 **G-gate: written "launch approved"** |
| **4** | **H** (launch) | **H1 private OFF** → H2 purge → **H3** anonymous smoke test through https://himandme.my, `#blok` exclusion, placeholder scan, every C10 URL serves or redirects, public robots.txt → Lighthouse (mobile) → Search Console TXT record (owner, Cloudflare DNS) and sitemap submitted. **Any H3 failure: private mode back ON (rollback level 2)** | Owner; me (read-only checks) | Launch live |
| **5** | Post-launch | +24 h: robots.txt is still the public version (S3), anonymous smoke test again. First real article(s), if ready, using the §4 safeguards | Owner; me | **H-gate at +48 h** (day 6); re-check at 7 days |

**Faster path:** if Day 2 is clean, G and H can move to Day 3. **Slower path:** any failed gate stops the clock. The site stays private (or is rolled back) and never goes public half-migrated.

**Timing rule:** start the D window and H1 outside **06:00–07:30** (server time, UTC+8). The automatic security updates (M6) run around 06:38 and may restart Nginx.

## 2. Launch blockers: needed before Day 1

| # | Item | What is needed | Notes |
|---|---|---|---|
| 1 | **O1** doctor's photo | Square, ≥ 400 px | Byline, author box, homepage team card |
| 2 | **O2** biography | ≤ 250 characters | Author box and page |
| 3 | **O3** credentials | The exact text (for example "MD (UKM)") | Replaces the default "Doktor yang sah" |
| 4 | **O8–O13, O24** business details | **One confirmation** that the doctor-reviewed details of 5 Nov are still current at launch (see the list after this table), **plus the Google Maps link** (`google_maps_url`, not yet supplied) | A wrong price or number is a rollback trigger (§8.3) |
| 5 | **O14** Notis Privasi | Confirm that the supplied BM and English text (5 Nov) is final | No analytics at launch, so no change is needed (O22) |
| 6 | **O5** logo | Confirm that the current files are final | — |
| 7 | **O15** meta titles and descriptions | Homepage and `/blog/` | I draft, you approve |
| 8 | **O16** topic descriptions | 7 short texts | I draft, you approve |
| 9 | **O17** icons | Site icon ≥ 256 px square; social image 1200×630 | Owner supplies or approves |
| 10 | **O23** articles at launch | A number (0 is allowed) | With 0, the blog pages show their empty states. **Recommended: 1–3 reviewed articles** |
| 11 | **O25** window | Date and start time of Day 1 (and Day 4) | Outside 06:00–07:30 |
| 12 | **O27** Content API exposure during the private window | Accept (recommended) or a stricter rule | Plan §3.6 |
| 13 | **G12** second-author test | **Approve building it** (recommended: local only, done by Day 3) **or** waive it in writing, with the condition "no second staff author until G12 passes" | Must be settled by the G-gate; not silently dropped |
| 14 | **C-gate** | Phase C evidence approved | — |

The 5 Nov details to confirm for item 4:
- **Operator:** Him & Me Wellness PLT.
- **Address:** 1-3, Eight Setiawangsa, Jalan Setiawangsa 13, Taman Setiawangsa, 54200 Kuala Lumpur.
- **Phone and WhatsApp:** 011-5791 2606, WhatsApp 601157912606. The WhatsApp form is the booking method.
- **Offer:** First Trial RM288, with any end date.
- **Prices:** consultation RM150 (free with First Trial), Shockwave RM450, Kegel EMS RM350.
- **Hours:** Isnin – Sabtu, 10 pagi – 6 petang, by appointment only.

## 3. Outstanding items: none waived, each placed

| Item | Status now | Where it is handled | Blocks launch? |
|---|---|---|---|
| **N6** HSTS review | Pending; review due around 25 Nov (`max-age=300` now) | Its own server-maintenance approval, **never inside the D window**. Review in the Day 0–2 range. Keeping 300 is safe for launch | No, but the decision must be recorded before the G-gate |
| **G12** | Deferred | §2 item 13 | **Yes, until built or waived** |
| **O19** "Coming soon" / "About" | Approved, not executed | D window, before D9 (Day 1) | Done in D |
| **O20** redirects | Ready (Phase B); the C10 list confirms the same 4 old URLs | D10 (Day 1) | Done in D |
| **O22** analytics | Cloudflare Web Analytics chosen, subject to a privacy/consent review | **After launch:** review, update O14 if needed, then implement | No (launch without analytics) |
| **O30 step 2** | Step 1 done 19 Nov | F (Day 2) and H3 (Day 4): block `.md` → 404 after the import | **Must pass in F** |
| **O34** mail provider | Gmail SMTP working (M1) as an interim | **After launch, within 30 days:** long-term provider plus SPF/DKIM | No. Risk: dependence on the Gmail account and its limits |
| **O38** staff 2FA | Deferred pending the read-only investigation (R39) | **After launch, within 14 days.** Device verification by email is already active | No. Must be decided, not dropped |
| **O21** structured business data | Open | Launch with none; decide after launch | No |
| **O35 / M5 / M6** | ✅ Done (20–21 Nov) | Monthly maintenance; first run around 19 Dec | No |
| **O37** cipher review | Separate outstanding consideration | After launch | No |
| **O6 / O7** articles | Owner content | Progressive after launch (§4) | No (see O23) |

## 4. Publishing articles after launch (existing safeguards, unchanged)

For each article, before **Publish**:
- **Author:** `dr` only.
- **Content:** real references (no `[Rujukan]`), a real feature image with alt text and a caption, no test text.
- **Tags:** one of the 7 topics. Never the internal `#blok` tags.

After publishing: run the anonymous smoke test again. It must pass the placeholder, `#blok` and author-archive checks. Any failure: **unpublish (don't delete)**, then fix.

## 5. Rollback (unchanged, plan §8.3–8.4)

| Level | What | Time |
|---|---|---|
| 1 | Previous theme, routes and redirects (C6) | Minutes |
| 2 | Private mode back ON | 1 minute |
| 3 | Database dump plus content archive (C4/C5) | ~30 minutes |
| 4 | VPS snapshot (C1) | 30–60 minutes |

**Triggers:** the site is down for more than 5 minutes, a block is visible, test content or a placeholder is visible, Admin is inaccessible, or a wrong price or number is shown.
