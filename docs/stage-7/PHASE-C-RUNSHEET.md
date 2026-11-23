# Stage 7 Phase C run sheet: production backup (C1–C10)

> **Status:** Phase C approved by the owner in writing on 23 Nov 2026. This sheet carries out plan §8.2 without changing it.
> - **What it changes:** nothing in Ghost, MySQL, Nginx, DNS or Cloudflare. It creates a snapshot (Tencent console), downloads files, and writes a new folder `~/backup/pre-launch-…` on the server. The restore test (C8) runs **only** on your own computer (WSL), never on production.
> - **Credentials:** the staff access token is typed **only** at the `ghost backup` prompt. No password, token or key goes into chat, GitHub or these files. The script output you send back contains only file names, counts, versions and public URLs.
> - **Scripts:** [`phase-c-backup.sh`](phase-c-backup.sh) (server) and [`phase-c-restore-test.sh`](phase-c-restore-test.sh) (WSL). Both stop with `STOP: …` on any failed check and were dry-run against stand-ins before use.
> - **Time:** about 60–90 minutes, plus a WSL install if you don't already have one.

**Do not click any Upload, Activate, Import or Delete button** in Ghost Admin during this phase. Only **Export/Download**.

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

Paste the token when asked. It writes `backup-from-v6.75.0-on-….zip` in that folder. The next step collects it.

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
- **C3:** collects the backup zip and checks its contents.
- **C4:** makes the MySQL dump with the approved command. The pass rule: exit 0, an empty error file, and "Dump completed".
- Records the reference counts and the collation used by C8.
- **C5:** archives `content/` (without the log files) and `/etc/nginx`, and checks that no private-key file is inside.
- **C10:** saves the public URL list, both in the folder and as `~/backup/old-urls.txt`, for D2b.
- Writes `SHA256SUMS`.

**Pass:** the last block starts with `PHASE C SERVER BACKUP OK`. **Send me the whole output.**

## C7 · Copies off the server (PowerShell)
1. Run the `scp -r …` command that the script printed at the end. It copies the whole folder to `%USERPROFILE%\himandme-backup\`.
2. Create an `admin` folder inside the copied `pre-launch-…` folder, and move the four C2/C6 downloads into it.

## C8 · Restore test (WSL on your computer, never production)
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
- Restores the dump into a temporary database `ghost_restore_test`.
- Compares the post and table counts with the server, then drops the test database.
- Checks that the archives open.
- **C2:** checks that the export is valid Ghost JSON and compares its count.
- **C6:** checks that the downloaded `routes.yaml` is byte-identical to the server copy, and that the theme zip opens.

**Pass:** `C8 RESTORE TEST PASSED`. **Send me the whole output.**

## C9 · Rollback readiness
This is confirmed from the evidence above. The rule (`ghost stop` before any database restore, `ghost start` after) was rehearsed in Phase B planning (plan §8.1). The four rollback levels in plan §8.4 then each have their input:

| Level | Input |
|---|---|
| 1 | the C6 files |
| 2 | private mode |
| 3 | the C4 dump and the C5 archive |
| 4 | the C1 snapshot |

## If a step fails
Stop, and send the `STOP:` line. Don't retry with changed commands. I'll propose the smallest safe correction. A failed server run leaves the `ghost backup` zip in place, so you won't need the token again.
