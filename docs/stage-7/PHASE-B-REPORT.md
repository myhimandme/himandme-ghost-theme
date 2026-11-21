# Stage 7 Phase B report: GitHub merge and release preparation

> **Status: Phase B work complete, awaiting the owner's B-gate review (21 Nov 2026).**
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
| G2 | File permissions | ✅ the zip script stages every file as 0644 (folders 0755), whatever the checkout's permissions; `check-release.mjs` verifies every entry |
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
| Release checks | ✅ all passed |

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
3. **G12 (local second-author test) is not built.** Update 6.4 planned it for Phase B, but it was not in the Phase B scope of the 21 Nov approval. The existing author-archive test already covers a second staff user (N2a–N2c), and the smoke test inspects every author archive. Build G12 only if you ask for it.
4. **Carried forward, unchanged:** N6 (HSTS review around 25 Nov), O19, O22, O30 step 2, and the deferred O34/O38 content inputs.
5. **Phase C (production backup) is not started** and needs separate written approval.
