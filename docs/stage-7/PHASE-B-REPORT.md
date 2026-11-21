# Stage 7 Phase B report: GitHub merge and release preparation

> **Status: B-gate approved by the owner on 21 Nov 2026. Phase B closed** (§9). Revision 2 addressed the B-gate review findings.
> Approved by the owner in writing on 21 Nov 2026 (Option A: one reviewable PR per stage).
> - **No production change was made.** Nothing was uploaded to or activated in Ghost Admin on himandme.my, and no command ran on the server.
> - The read-only smoke test was run **against local Ghost only**, never against himandme.my.
> - **Phase C is not started** and needs separate written approval.

## 1. GitHub merges (G0b)

Every PR was merged with a merge commit (no squash, no rebase), pinned to the reviewed head SHA, after `npm test` passed on its branch. The order followed the approved dependency chain.

| Order | PR | Branch → base | Merge commit |
|---|---|---|---|
| 1 | #1 | `stage-0-1` → `main` | `681421a` |
| 2 | #2 | `stage-2` → `main` (retargeted) | `e66d323` |
| 3 | #3 | `stage-3` → `main` (retargeted) | `661e37f` |
| 4 | #5 (new) | `stage-4` → `main` | `b148b1a` |
| 5 | #4 | `stage-5` → `main` (retargeted) | `08a0ee1` |
| 6 | #6 (new) | `stage-6` → `main` | `6b6e641` |
| 7 | #7 (new) | `stage-7-plan` → `main` | `17ae322` |

**Result:** `git diff stage-7-plan main` is empty; `main` = `17ae322`. No stage branch was changed, and `main` was not merged into any branch.

## 2. Release branch `stage-7-release` (from `main` `17ae322`)

| ID | Item | Result |
|---|---|---|
| G1 | Version 1.0.0 | ✅ `package.json` 1.0.0. **Tag `v1.0.0` not created yet**: it should point at the merge commit on `main`, so it is proposed for after the B-gate merge (§6) |
| G2 | File permissions | ✅ the zip script stages every file as 0644 (folders 0755), whatever the checkout's permissions. `check-release.mjs` checks every entry: files must be 0644, directory entries 0755, and any other entry type (such as a symlink) fails (corrected at the B-gate, §7) |
| G2 | Reproducible zip | ✅ release build without source maps; one timestamp for every entry (the last commit that changed a packaged file); `zip -X` with a sorted list. Two builds of the same commit gave the same SHA-256 |
| G3 | `routes.yaml` author slug | ✅ no change needed: `dr` is the production slug (O4). Only the header comment changed; `check-release.mjs` verifies the channel (`/blog/penulis/dr/`, `authors:dr+tag:-hash-blok`, `data: author.dr`) |
| G4 | Launch seed builder | ✅ `scripts/build-launch-seed.mjs` reads only `seed/blocks.mjs`. Allowlist: 23 block slugs, 3 page slugs, 3 internal tags. Denylist: test words and local hosts. No authors. Fixed dates and IDs (reproducible) |
| G5 | Placeholder scanner | ✅ `scripts/check-placeholders.mjs` (`--theme`, `--seed`; `scanText` reused by G6). Theme: 0 hits outside the allowlist below. Seed: 0 hits |
| G6 | Read-only smoke test | ✅ `test/prod/smoke.mjs`: GET only, host allowlist (`himandme.my`, `www.himandme.my`, `localhost`). Modes `--expect-private` (D2b), `--cookie` (Phase F), anonymous (H3). Includes the O28 check (every block owned only by `dr`, via the public Content API) and every author archive from `sitemap-authors.xml` (all pages and RSS) |
| G7 | README | ✅ "Production launch (Stage 7)" section and the new scripts in the Scripts table |
| G11 | LLM features | ✅ `test/stage7/llms-markdown.mjs` (local only) plus the `llms` group of the smoke test |
| O20 | Redirects | ✅ `redirects.yaml` (4 approved 301s) plus `test/stage7/redirects.mjs` (local only). Not uploaded anywhere but local Ghost (plan step D10) |
| — | Release gate | ✅ `npm run release` = `npm test` → zip → GScan the zip → seed → placeholder scan → `scripts/check-release.mjs` (routes, zip contents and modes, version, no source maps, `dist/SHA256SUMS`) |

**Placeholder allowlist (theme files).** Each item is intentional and documented in the scanner:
- `partials/home/team.hbs`: "[Nama Penuh]", "[Peranan]". This fallback shows only while the theme setting `doctor_author_slug` is empty; production sets it to `dr` (E8).
- `package.json`: "Doktor yang sah" is the default of `doctor_credentials`; production sets the verified value (E8, O3).
- `package.json`: the `author.email` field (the address and its key). GScan requires it, and Ghost never serves `package.json`.

## 3. Test results (all on the release zip, SHA-256 `cb3d6f74…`, uploaded to local Ghost 6.75.0)

| Suite | Result |
|---|---|
| `npm test` (build, content-block guard, GScan) | ✅ passed; GScan: compatible with Ghost 6.x |
| GScan on the zip (`npm run gscan:zip`) | ✅ compatible; local upload: 0 errors, 0 warnings |
| Stage 1 (routing, content blocks) | ✅ 32 passed, 0 failed (3 info) |
| Stage 2 (site chrome) | ✅ 23 passed, 0 failed |
| Stage 3 (homepage) | ✅ 12 passed, 0 failed |
| Stage 4 (Disfungsi Ereksi page) | ✅ 39 passed, 0 failed |
| Stage 5 (blog) | ✅ 21 passed, 0 failed |
| Stage 6 (article page) | ✅ 16 passed, 0 failed |
| Stage 7 author archive (G10) | ✅ 15 passed, 0 failed, restored |
| Stage 7 private mode (G10) | ✅ 12 passed, 0 failed, restored |
| Stage 7 LLM features (G11) | ✅ 5 passed (C1, L1 23/23 → 404, L2, L3, L4), restored |
| Stage 7 redirects (O20) | ✅ 5 passed (R1–R5), restored |
| Placeholder scan (theme + seed) | ✅ 0 hits outside the allowlist |
| Release checks | ✅ all passed (Revision 2: 119 of 119 entries parsed; files 0644 ×119; directory entries 0755 ×0, see §7) |
| Zip permission check fixtures (`test/release/zip-modes.mjs`, Revision 2) | ✅ 8 passed (Z1–Z8) |

**Smoke test, exercised on local Ghost only** (to prove the script, not the site):
- Anonymous mode: 18 passed. One expected failure: T1 found the local test articles ("Gambar ujian" images on `/blog/`). That is the check working; production must not contain them.
- The `llms` group with the LLM setting temporarily off: L1 23/23 → 404, L2 302. Setting restored.
- `--expect-private` with private mode temporarily on: P1, P2 passed. Restored.
- `--cookie` with a local private-site password: pages, blocks, author archives and O28 passed. Ghost turns RSS off while private, so the script accepts a 404 for RSS in this mode. The local password and private mode were restored.
- Not testable locally: security headers, and the http/www redirects (both come from production Nginx), so they were skipped and reported as skipped. The `local-host` placeholder pattern is ignored only on localhost, where the site URL itself is local.

## 4. Release checksums (SHA-256)

| File | SHA-256 |
|---|---|
| `dist/himandme-ghost-theme.zip` (119 files, 1.0.0) | `cb3d6f7441455cf2074ac5b55a9e9c801b6670dfa04eb249e255ba8f637835e1` |
| `dist/launch-seed.json` (23 blocks, 3 pages, no authors) | `db898cda59405955d1ad720f4f566ff3d50cb12486fcc7cdbbbf9c7aa8032eba` |
| `routes.yaml` | `2f178dcbaabd2d14a81f0c1c989628cc4208d74d9274d24a7d35e72713d3f032` |
| `redirects.yaml` | `aacd2f9c16e2b2766b5c085ade07642ef25ad4532c4334513f122822c88910f9` |

Built from commit `34bbee3` with Node 22 and Info-ZIP `zip -X`. The zip timestamp is the last commit that changed a packaged file, so later docs-only commits (such as this report) do not change the checksum. Rebuild with `npm run release` and compare with `dist/SHA256SUMS` before any upload in Phase D.

## 5. Security checks

- Secret scan of the full Phase B diff: no password, token, key, cookie value or server IP added. The test scripts read the local login from `GHOST_ADMIN_EMAIL` / `GHOST_ADMIN_PASSWORD` only.
- The smoke test sends only GET requests and refuses any other host. The private-site cookie is read from `SMOKE_COOKIE` and never written anywhere.
- The zip holds no tests, docs, seed, scripts, `node_modules`, `dist`, source maps or dotfiles (checked by `check-release.mjs`).

## 6. For the owner's B-gate decision

1. **Review PR `stage-7-release` → `main`.** It is open and **not merged**. Merging it is part of the B-gate approval.
2. **Tag `v1.0.0`:** proposed on the merge commit of that PR, after approval (G1).
3. **G12 (local second-author test) is deferred, not completed.** See §8.
4. **Carried forward, unchanged:** N6 (HSTS review around 25 Nov), O19, O22, O30 step 2, and the deferred O34/O38 content inputs.
5. **Phase C (production backup) is not started** and needs separate written approval.

## 7. B-gate review correction: zip permission check (Revision 2, 21 Nov 2026)

**Finding:** `check-release.mjs` required every zip entry to be `-rw-r--r--` (0644). A directory entry (0755) would have failed, and the check could not tell directories from files.

**Correction (`scripts/check-release.mjs`):**
- Entries are read from `zipinfo`. An entry is a **directory** if its Unix mode starts with `d` or its name ends in `/`, a **file** if the mode starts with `-`, and anything else (such as a symlink, `l`) counts as **other**.
- Rules: files must be exactly `-rw-r--r--` (0644) and directories exactly `drwxr-xr-x` (0755). Any other entry type fails.
- The number of parsed entries must equal the "number of entries" in the `zipinfo` header, so an unparsed line cannot slip past the check.
- The parser (`zipEntries`) and the rule (`badModes`) are exported and tested on their own.

**New test `test/release/zip-modes.mjs`:** builds small fixture zips with the real `zip` and `zipinfo` in a temporary folder, then deletes them. All 8 checks passed:
- Z1: directory entries are recognised.
- Z2: every entry is parsed.
- Z3: files 0644 with directories 0755 pass.
- Z4: a directory that is not 0755 fails.
- Z5: a 0600 file fails (the old logo case).
- Z6: a 0755 file fails.
- Z7: a symlink fails.
- Z8: a zip with no directory entries passes.

Run it with `node test/release/zip-modes.mjs`. It is not added to `npm run release`: that would change `package.json`, which is a packaged file, and so the zip checksum.

**Rebuild and evidence:**
- `dist/` was deleted and `npm run release` ran from scratch: exit 0, every check passed.
- The release zip is built with `zip -D`, so it has **no directory entries**. The check reports 119 of 119 entries parsed, files 0644 ×119, directories 0755 ×0, and no other entry types. Directories in the staging folder are still set to 0755.
- A second rebuild was **byte-identical** (`cmp`), and `sha256sum -c dist/SHA256SUMS` passed for all four files.

**Checksums and earlier results:** no packaged file changed. The correction touches `scripts/` and `test/` only, and those are neither packaged nor part of the zip timestamp. So the §4 checksums are **unchanged and still valid**. The §3 local suite results were produced on the same zip bytes (`cb3d6f74…`), so they also remain valid; they were not re-run.

## 8. G12: deferred, an outstanding pre-launch consideration

- **Status:** **deferred, not completed.** G12 was approved in Update 6.4 (plan §16.8) for Phase B. The owner's 21 Nov Phase B approval listed only G1–G7 and G11, so G12 was not built, to keep within the approved scope. It was not quietly added and is not counted as done.
- **What G12 is:** a local test with an additional staff user (Author role) who writes only real articles. Their archive, pagination and RSS must show no block, and the `dr` archive must stay unchanged.
- **Partial cover today (not a substitute):** the author-archive test (N2a–N2c) covers a second staff user who authors a block, and G6 inspects every author archive listed in `sitemap-authors.xml` and fails if any block has an author other than `dr` (O28).
- **Why it still matters:** it is the safeguard for adding any second staff author, which the launch plan does not include (single-author attribution; FE1 is a future enhancement).
- **Outstanding:** G12 must be built and passed, or explicitly waived by the owner, **before launch (by the H-gate) and before any second staff author is added**. It needs the owner's separate approval to build.

## 9. Closure (21 Nov 2026)

- **B-gate approved** by the owner.
- **PR #8 merged** with a merge commit, pinned to the reviewed head `26086eb`. Merge commit: `d2a014e65874b4624f5f6be72c7d14214c1ba7b2`. Parents `17ae322` and `26086eb`; its tree is identical to the reviewed head.
- **`main`** = `d2a014e65874b4624f5f6be72c7d14214c1ba7b2`.
- **Rebuilt from the merge commit:** `npm run release` passed, and all four checksums in §4 verified.
- **Tag `v1.0.0`:** annotated, on `d2a014e65874b4624f5f6be72c7d14214c1ba7b2`. **Push pending:** this session cannot push tags (HTTP 403), so the owner pushes it.
- **Not started:** Phase C. No production change was made.
