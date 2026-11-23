# Stage 7 Phase C report: production backup (C1–C10)

> **Status: C1–C10 passed, 23 Nov 2026. Administrative closeout pending (§6). Awaiting the owner's C-gate review.** Phase C was approved by the owner in writing on 23 Nov 2026.
> - **No production change** to Ghost content or settings, MySQL, Nginx, DNS or Cloudflare.
> - **Production actions taken:**
>   - a Tencent snapshot was created; an old snapshot was deleted to free the quota;
>   - downloads from Ghost Admin;
>   - `ghost backup`;
>   - the read-only backup script, which wrote only `~/backup/pre-launch-…` folders.
> - **Who ran it:** the owner ran every production step. This documentation session checked the outputs, made one read-only check of the public sitemaps, and computed one checksum on its local Ghost copy.
> - **Procedure:** `PHASE-C-RUNSHEET.md` (Revision 4) with `phase-c-backup.sh` and `phase-c-restore-test.sh` (PR #10).

## 1. C1–C10

| # | Item | Result | Evidence |
|---|---|---|---|
| C1 | VPS snapshot | ✅ | `himandme-pre-launch-2026-11-23` created by the owner. **Snapshot ID: PENDING** (recorded in §6 once provided). To free the 2-snapshot quota, the owner was advised to delete the oldest, superseded snapshot `lhsnap-fzsuu5vx` (`himandme-pre-m3-updates-2026-11-18`, from before M3/M6/M5). `lhsnap-hty2dne5` (`himandme-pre-m6-2026-11-19`) is kept as the older fallback |
| C2 | Ghost content export | ✅ | Ghost 6.75 exports a single zip: `export.json`, `members.csv`, `post-analytics.csv`, `routes.yaml`, `redirects.yaml`, `themes/`. `export.json` is valid Ghost JSON with **2 posts/pages, equal to the database** |
| C3 | `ghost backup` | ✅ | `backup-from-v6.75.0-on-2026-11-23-16-25-44.zip`, copied into the backup folder and verified identical. **The original is kept** in `/var/www/himandme`. The token was typed only at the prompt |
| C4 | MySQL dump | ✅ | `c4-ghost-himandme.sql` (approved command): exit 0, empty error file, "Dump completed". Reference: 2 rows in `posts` (1 published page, 1 published post), 103 tables, `utf8mb4` / `utf8mb4_0900_ai_ci`, active theme `source`, `is_private` false, **`llms_enabled` false** (O30 still in place) |
| C5 | Content and Nginx | ✅ | `c5-content.tgz` (26 entries, no errors). `content/settings` is **empty** on the server (§3). `c5-nginx-etc.tgz` (23 entries) holds configuration only. **The www certificate's private key `ssl/www.himandme.my/key.pem` was correctly excluded**, with `cert.pem`, `fullchain.pem` and `dhparam.pem` (covered by C1). 4 symlinks were stored as links only; 3 key references recorded as paths only |
| C6 | Theme, routes, redirects | ✅ | Active theme `source.zip` (Admin → active theme ⋯ → Download) opens. `routes.yaml` and `redirects.yaml` come from the C2 export (valid format, **0 redirect rules**, which matches the server today) |
| C7 | Copies off the server | ✅ | `scp` to the owner's computer (`%USERPROFILE%\himandme-backup\pre-launch-20261123-163043`): **23/23 files match the server's SHA256SUMS**. BitLocker (whole drive, recovery key in the owner's Microsoft account) was turned on for the destination drive and was still encrypting at the time of the copy |
| C8 | Restore test | ✅ | In WSL Ubuntu 24.04 with MySQL 8.0, on the owner's computer only. `ghost_restore_test` was created by the run, restored **with no errors**: **posts 2 = server 2; tables 103 = server 103; active theme `source` = server**. Then dropped. One review item, resolved (§3) |
| C9 | Rollback readiness | ✅ | Every rollback level has its input (§2). The rule `ghost stop` before a database restore and `ghost start` after was rehearsed in planning (plan §8.1) |
| C10 | Public URL list | ✅ | All 5 sitemap requests returned HTTP 200 with real sitemaps; the index listed exactly the 4 sub-sitemaps. **7 URLs:** `/`, `/about/`, `/author/dr/`, `/coming-soon/`, `/rss/`, `/sitemap.xml`, `/tag/news/`. They match this session's independent read-only check and the 4 approved redirects (O20). Saved as `~/backup/old-urls.txt` for D2b |

## 2. Rollback inputs (plan §8.4)

| Level | Restores | Input now available |
|---|---|---|
| 1 | Previous theme, routes, redirects | `source.zip`; `routes.yaml` (Ghost defaults); `redirects.yaml` (0 rules) |
| 2 | Private mode back on | Ghost Admin |
| 3 | Database and files | `c4-ghost-himandme.sql` (restore proven in C8); `c5-content.tgz` |
| 4 | Whole server | Snapshot `himandme-pre-launch-2026-11-23`; older fallback `himandme-pre-m6-2026-11-19` |

## 3. Issues found during the run, and how they were resolved

1. **Run 1 stopped at C5.** The script required `content/settings/routes.yaml`, but that folder is empty on the server: no routes file was ever uploaded, so Ghost serves its built-in default routes. Nothing was missing from the backup; the script's assumption was wrong.
   - **Fixed in Revision 4 (`1d4b87f`):** every file that *is* in the folder must be archived, and an empty folder is noted.
   - **Run 2 passed.** The run 1 folder `~/backup/pre-launch-20261123-162609` is partial and can be deleted later.
2. **C8 review item: no server-side copy of `routes.yaml` to compare with.** The `ghost backup` zip has none either.
   - **Resolved:** the exported `routes.yaml` (SHA-256 `b2d675260a6071be426ac6a67ea60da9428f6169e03e25cb14cc2d7ed74381a1`) is **byte-identical** to Ghost 6.75.0's built-in `core/server/services/route-settings/default-routes.yaml` (same SHA-256), and its URL patterns match the live site.
3. **The C2 export format differs from the run sheet.** Ghost 6.75 exports a zip. Its contents were placed in `admin/` for the restore test, and the routes and redirects downloads it contains replaced the separate Labs downloads.

## 4. Remaining risks and follow-ups (none blocks the C-gate)

| # | Item | Proposed handling |
|---|---|---|
| 1 | `ghost backup` left a content export and a members CSV in `/var/www/himandme` (the kept zip) and in `content/data/`. They are not served by Nginx, but they are extra copies of personal data on the server | After the C-gate, with the owner's approval: remove the on-server copies (the encrypted off-server copy and the C4/C5 backups remain) |
| 2 | Off-server copies hold personal data (`members.csv`) and the database (password hashes, keys) | Keep them only on the BitLocker drive; confirm BitLocker shows "on" |
| 3 | The www certificate, its key and `dhparam.pem` are only in the C1 snapshot, not in the file backups (by design) | Acceptable: certificates can be reissued (M4 procedure) and DH parameters regenerated |
| 4 | Partial folder from run 1 on the server | Delete after the C-gate (optional) |
| 5 | C1 snapshot ID not yet recorded | Owner provides it; recorded in §6 |

## 5. Owner review needed for the C-gate
- The evidence above.
- PR #10 (Phase C scripts and docs, Revisions 1–4): approve its merge.
- The five-day launch plan (`LAUNCH-PLAN-5-DAY.md`) and its launch-blocker inputs.

**Phase D is not authorised.** It needs the owner's separate written approval after the C-gate.

## 6. Administrative closeout (record here; nothing below is assumed)

| Item | Status | Where it is recorded once confirmed |
|---|---|---|
| New snapshot ID (`himandme-pre-launch-2026-11-23`, starts with `lhsnap-`) | **PENDING: owner to provide** | This table; C1 row above; checklist C1; plan §16.14 |
| Deletion of `lhsnap-fzsuu5vx` (`himandme-pre-m3-updates-2026-11-18`) to free the quota | **PENDING: owner to confirm** whether it was deleted | This table; checklist C1 |
| BitLocker on the off-server copy drive: encryption complete and protection status **On** | **PENDING: owner to confirm** (it was still encrypting at the time of the copy) | This table; checklist C7; plan §16.14 |
| C-gate approval | **PENDING: owner** | Checklist §10, Phase C row |
| PR #10 (scripts, run sheet, this report, launch plan) | **Open, not merged** (head `77929e9` before Update 6.11; `main` = `23fc7f1`) | Checklist §10 |

Phase C is closed only when every row above is confirmed. No production backup or file is to be deleted as part of the closeout.
