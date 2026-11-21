# Him & Me VPS: monthly maintenance runbook (M6)

> **Status:** approved by the owner, 19 Nov 2026 (Stage 7 M6, `docs/STAGE-7-PLAN.md` §16.11).
> - **Frequency:** monthly (first run around 19 Dec 2026), or sooner if a critical MySQL security fix is published.
> - **Why it is needed:** automatic updates install Ubuntu **security** updates only and **exclude MySQL** (`mysql-*` packages); reboots are never automatic. This routine applies MySQL and all other pending updates, and any reboot, under supervision.
> - **Labels:** [READ-ONLY] inspects only · [REFRESHES LOCAL PACKAGE LISTS] updates APT's local package indexes only, installs nothing · [WRITES BACKUP FILES] home folder only · [CHANGES SERVER] modifies the server · [CHANGES CLOUD STATE] Tencent console.
> - **Credentials:** none appear in this runbook. Never paste passwords or keys into chat or into this repository.

## 1. Check what is pending [REFRESHES LOCAL PACKAGE LISTS]

`sudo apt update` refreshes (writes) APT's local package lists; it **does not install** anything. The other three commands are read-only.

```bash
sudo apt update
```
```bash
apt list --upgradable 2>/dev/null
```
```bash
sudo needrestart -b -r l
```
```bash
ls /var/run/reboot-required 2>/dev/null
```

**Review the `apt list --upgradable` output before going on.** `sudo apt upgrade` (step 4) installs **every** eligible pending upgrade from **all** configured sources: MySQL, but also unrelated Ubuntu packages (security or not) and **NodeSource `nodejs`**. It is **not** limited to MySQL or to security updates.
- **Node.js:** any `nodejs` upgrade must stay on version 22 (Ghost 6.75.0 needs `^22.23.1`).
- **nginx:** since M5 edited `/etc/nginx/nginx.conf`, an nginx update that ships a changed `nginx.conf` is held back by the automatic updates and appears here. `apt upgrade` will then ask about the configuration file: **keep the installed version** (the M5 edit) unless a change has been reviewed.
- **If anything looks unexpected,** stop and decide before continuing.

## 2. Snapshot [CHANGES CLOUD STATE]

In the Tencent Cloud console, create a system-disk snapshot named `himandme-monthly-YYYY-MM`. Wait until its status is **Normal**.

## 3. Database backup [WRITES BACKUP FILES]

Paste and run as **one block**. It prints `BACKUP OK` only when every check passes. On any failure it prints `STOP`: then **do not continue to step 4**, even if a `LAST_BACKUP_OK` file is present (the marker is written just before its final read-back check, so a failure at that last check can leave it behind). Step 4 independently re-validates the marker and the dump it names before any upgrade.

```bash
bash -c '
umask 077;
fail() {
  echo "STOP: $1";
  echo "STOP: BACKUP FAILED. Do NOT run sudo apt upgrade.";
  exit 1;
};
BK="$HOME/backup";
rm -f "$BK/LAST_BACKUP_OK" || fail "cannot remove the previous success marker $BK/LAST_BACKUP_OK";
[ ! -e "$BK/LAST_BACKUP_OK" ] || fail "the previous success marker still exists";
mkdir -p "$BK" || fail "cannot create $BK";
chmod 700 "$BK" || fail "cannot set permissions on $BK";
{ [ -d "$BK" ] && [ -w "$BK" ]; } || fail "$BK is not a writable directory";
[ "$(stat -c %a "$BK")" = "700" ] || fail "$BK permissions are not 700";
F="$BK/ghost-himandme-$(date +%Y%m%d-%H%M%S).sql";
[ ! -e "$F" ] || fail "$F already exists";
sudo mysqldump --single-transaction --no-tablespaces --default-character-set=utf8mb4 himandme > "$F" 2> "$F.err";
rc=$?;
chmod 600 "$F" "$F.err" || fail "cannot set permissions on the dump files";
[ "$rc" -eq 0 ] || fail "mysqldump exited with status $rc (see $F.err)";
[ -s "$F" ] || fail "dump file is missing or empty";
[ ! -s "$F.err" ] || fail "mysqldump reported errors or warnings (see $F.err)";
tail -n 1 "$F" | grep -q "Dump completed" || fail "dump does not end with the Dump completed marker";
SIZE_LINE="$(du -h -- "$F")" || fail "cannot determine the dump file size";
SIZE="${SIZE_LINE%%[[:space:]]*}";
[ -n "$SIZE" ] || fail "dump file size is empty";
printf "%s\n" "$F" > "$BK/LAST_BACKUP_OK" || fail "cannot write the success marker";
[ "$(cat "$BK/LAST_BACKUP_OK")" = "$F" ] || fail "success marker content does not match the dump file";
echo "BACKUP OK: $F ($SIZE)";
'
```
**Continue only if the last line printed is `BACKUP OK: …`.**

## 4. Apply all reviewed pending upgrades [CHANGES SERVER]

MySQL (and possibly other services) restarts briefly. Paste and run as **one block**; `sudo apt upgrade` runs only if the backup marker is under 2 hours old **and** the dump it names is present and complete.

```bash
bash -c '
stop() {
  echo "STOP: $1";
  echo "STOP: Do NOT run sudo apt upgrade.";
  exit 1;
};
BK="$HOME/backup";
M="$BK/LAST_BACKUP_OK";
[ -f "$M" ] || stop "no success marker at $M";
[ -n "$(find "$M" -mmin -120)" ] || stop "success marker is older than 2 hours";
D="$(head -n 1 "$M")" || stop "cannot read the success marker";
[ -n "$D" ] || stop "success marker does not contain a dump path";
case "$D" in "$BK"/ghost-himandme-*.sql) ;; *) stop "marker path is not a backup in $BK: $D";; esac;
[ -f "$D" ] || stop "referenced dump does not exist: $D";
[ -s "$D" ] || stop "referenced dump is empty: $D";
tail -n 1 "$D" | grep -q "Dump completed" || stop "referenced dump does not end with the Dump completed marker: $D";
echo "Backup verified: $D";
sudo apt upgrade;
'
```

## 5. Check [READ-ONLY]

```bash
systemctl is-active ssh nginx mysql ghost_himandme-my fail2ban
```
```bash
curl -sI https://himandme.my/ | head -1
```
```bash
node -v
```
```bash
sudo needrestart -b -r l
```
```bash
ls /var/run/reboot-required 2>/dev/null
```

## 6. Reboot only if required [CHANGES SERVER]

If `/var/run/reboot-required` exists, run `sudo reboot`, reconnect, and repeat step 5. Also check that `uname -r` shows the new kernel and `ghost ls` shows running.

## 7. Record

Note the date, the packages upgraded, the snapshot name, the backup file name and the check results in the Stage 7 maintenance record.
