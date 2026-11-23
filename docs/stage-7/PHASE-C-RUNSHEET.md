# Stage 7 Phase C run sheet: production backup (C1–C10)

> **Status:** Phase C approved by the owner in writing on 23 Nov 2026. This sheet carries out plan §8.2 without changing it.
> - **What it changes:** nothing in Ghost, MySQL, Nginx, DNS or Cloudflare. It creates a snapshot (Tencent console), downloads files, and writes a new folder `~/backup/pre-launch-…` on the server. The restore test (C8) runs **only** on your own computer (WSL), never on production.
> - **Credentials:** the staff access token is typed **only** at the `ghost backup` prompt. No password, token or key goes into chat, GitHub or these files. The script output you send back contains only file names, counts, versions and public URLs.
> - **Scripts:** [`phase-c-backup.sh`](phase-c-backup.sh) (server) and [`phase-c-restore-test.sh`](phase-c-restore-test.sh) (WSL). Both stop with `STOP: …` on any failed check and were dry-run against stand-ins before use.
> - **Revision 2 (23 Nov 2026):** stricter C10 sitemap checks, the original backup zip is kept, a content freeze, encrypted storage of the copies, strict WSL separation, an active-theme comparison and a redirects format check.
> - **Revision 3 (23 Nov 2026):** the restore test never touches an existing `ghost_restore_test` database. The Nginx archive holds configuration files only, never private-key material.
> - **Time:** about 60–90 minutes, plus a WSL install if you don't already have one.

**Do not click any Upload, Activate, Import or Delete button** in Ghost Admin during this phase. Only **Export/Download**.

**Content freeze for the backup window (from C1 until the server script prints `PHASE C SERVER BACKUP OK`):** don't publish, edit, schedule or unpublish anything, and don't upload images or change settings, in Ghost Admin. Ask anyone else with an Admin login to do the same. All the copies (snapshot, export, `ghost backup`, dump, archives, downloads) then describe the same state of the site. If something is changed during the window, start again from C1.

**Store the off-server copies encrypted.** They contain the whole database: staff password hashes, API keys and session secrets, and any personal data. Keep them only on an encrypted disk (BitLocker, or Windows Device Encryption on Windows Home), or inside an AES-256 encrypted 7-Zip archive whose password is kept outside chat, GitHub and email. Don't put them in an unencrypted cloud-sync folder, email them, or attach them anywhere.

## Before you start (on your Windows computer)
1. Save the two scripts from the chat into your **Downloads** folder.
2. In PowerShell: `mkdir $env:USERPROFILE\himandme-backup`

## C1 · VPS snapshot [CHANGES CLOUD STATE]
1. In the Tencent Cloud console, open the Lighthouse instance, then **Snapshots** → **Create snapshot**.
2. Name it `himandme-pre-launch-2026-11-23`.
3. Wait until its status is **Normal**, and note the snapshot ID.

## C2 · Ghost content export [download only]
In Ghost Admin, go to Settings → Advanced → **Import/Export** → **Export** (content and settings). A `.json` file downloads.

## C6 · Current theme, routes and redirects [download only]
- **Theme:** Settings → Design & branding → **Change theme**. On the **active** theme (Source), use ⋯ → **Download**.
- **Routes:** Settings → Advanced → Labs → Routes → **Download current routes**. Don't touch Upload.
- **Redirects:** Labs → Redirects → **Download current redirects**. Don't touch Upload.

You'll have four downloads (one `.json`, one theme `.zip`, `routes.yaml`, and `redirects.yaml` or `.json`). They are moved into the backup folder in C7.

## C3 · `ghost backup` (on the server)
1. Get your Staff access token: Ghost Admin → your avatar → **Your profile** → **Staff access token** → copy. Never paste it anywhere except the prompt.
2. In SSH:

```bash
cd /var/www/himandme && ghost backup
```

Paste the token when asked. It writes `backup-from-v6.75.0-on-….zip` in that folder. The next step **copies** it into the backup folder and verifies the copy. **The original stays in `/var/www/himandme`** as an extra on-server copy. It is never deleted by these scripts. Remove it later only on your own decision (it holds a full content export).

## C4, C5, C10 · Server backup script [WRITES BACKUP FILES]
From PowerShell, copy the script to the server:

```powershell
scp $env:USERPROFILE\Downloads\phase-c-backup.sh ubuntu@himandme.my:
```

Then in SSH:

```bash
bash ~/phase-c-backup.sh
```

It does the following, in order:
- **C3:** copies the backup zip (the original is kept), checks that the copy is identical, and checks its contents.
- **C4:** makes the MySQL dump with the approved command. The pass rule: exit 0, an empty error file, and "Dump completed".
- Records the reference counts and the collation used by C8.
- **C5:** archives `content/` (without the log files) and the **Nginx configuration only**:
  - Only configuration paths are archived: `nginx.conf`, the standard parameter files, `sites-available`, `sites-enabled`, `snippets`, `conf.d` and `modules-*`.
  - A file is skipped if it isn't plain text, has a key- or certificate-style name, contains a PEM private-key block, or is the file named by any `ssl_certificate_key` / `ssl_password_file` directive. Relative paths count too.
  - Symlinks (such as the `sites-enabled` links, or any link to `/etc/letsencrypt`) are stored as links only. Their targets are never copied.
  - The finished archive is extracted to a scratch folder and scanned again. Any private-key block stops the script.
  - The certificates and keys themselves are **not** backed up here: they live in `/etc/letsencrypt` and are covered by the C1 snapshot.
  - Skipped files are listed **by name only**, for review.
- **C10:** fetches the sitemap index and all four sitemaps (posts, pages, tags, authors). **Every request must succeed with HTTP 200 and a real sitemap, and the index must list exactly those four. Otherwise the script stops.** The list holds every URL from the four sitemaps plus the homepage, `/rss/` and `/sitemap.xml`. It is saved in the folder and as `~/backup/old-urls.txt` for D2b. The fetched sitemaps are kept as evidence.
- Writes `SHA256SUMS`.

**Pass:** the last block starts with `PHASE C SERVER BACKUP OK`. **Send me the whole output.**

## C7 · Copies off the server (PowerShell)
1. Run the `scp -r …` command that the script printed at the end. It copies the whole folder to `%USERPROFILE%\himandme-backup\`.
2. Create an `admin` folder inside the copied `pre-launch-…` folder, and move the four C2/C6 downloads into it.

## C8 · Restore test (WSL on your computer, never production)

**Strict separation from production:**
- The test runs only inside WSL on your computer, against the **copied** files. The script refuses to run anywhere else.
- Don't SSH to the server from the WSL window, and don't copy any server credential, key or token into WSL.
- The test database `ghost_restore_test` is local to WSL and is dropped at the end.
- Never run `phase-c-restore-test.sh`, or any `mysql` command from this section, on the server.
1. **Only if you have no WSL Ubuntu yet:** in PowerShell **as Administrator**, run `wsl --install -d Ubuntu-24.04`. Restart if asked, then create the Linux user when prompted.
2. In the Ubuntu window:

```bash
sudo apt update && sudo apt install -y mysql-server-8.0 unzip python3
```
```bash
sudo service mysql start
```
```bash
cp "$(wslpath "$(powershell.exe -NoProfile -Command '$env:USERPROFILE' | tr -d '\r')")/Downloads/phase-c-restore-test.sh" ~/ && bash ~/phase-c-restore-test.sh
```

The test does the following, in order:
- **C7:** checks every copied file against the server checksums.
- **Collision protection:** if a database named `ghost_restore_test` already exists in WSL, the test **stops without touching it** (no drop, no overwrite, no restore). Otherwise it creates that database and restores the dump into it. The database this run created is always dropped at the end, also when the restore or a later check fails.
- Compares the post and table counts with the server, then drops the test database.
- Checks that the archives open.
- **C2:** checks that the export is valid Ghost JSON and compares its count.
- Compares the restored **active theme** with the one recorded on the server.
- **C6:** checks that the downloaded `routes.yaml` is byte-identical to the server copy, that the redirects file is in a valid Ghost format (it is only read, never changed), and that the theme zip opens.

**Result:**
- **Pass:** `C8 RESTORE TEST PASSED`.
- **Review needed:** `C8 RESTORE COMPLETED, REVIEW REQUIRED`. The restore worked, but something needs a decision, for example the C2 export count differs from the database. This is **not** a pass until we have reviewed it.
- **Fail:** any `STOP:` line.

**Send me the whole output.** When it has passed, you may remove the WSL distribution (`wsl --unregister Ubuntu-24.04`). That deletes the Linux copy only, not your Windows backup folder.

## C9 · Rollback readiness
This is confirmed from the evidence above. The rule (`ghost stop` before any database restore, `ghost start` after) was rehearsed in Phase B planning (plan §8.1). The four rollback levels in plan §8.4 then each have their input:

| Level | Input |
|---|---|
| 1 | the C6 files |
| 2 | private mode |
| 3 | the C4 dump and the C5 archive |
| 4 | the C1 snapshot |

## If a step fails
Stop, and send the `STOP:` line. Don't retry with changed commands. I'll propose the smallest safe correction. The `ghost backup` zip always stays in `/var/www/himandme`, so a rerun of the server script needs no token.

**Script tests:** `bash test/phase-c/scripts.test.sh` runs both scripts offline against stand-ins (no production access). Revision 3: 45 checks, all passing. They include the existing-database protection and hostile Nginx key files: keys under configuration-style names, with no extension, binary keys, keys named by a relative `ssl_certificate_key`, and symlinks to a key and to a key directory.
