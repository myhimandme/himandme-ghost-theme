#!/usr/bin/env bash
# Stage 7 Phase C (C3 collect, C4, C5, C10 + reference data): production backup on the Him & Me VPS.
# Owner runs it as the `ubuntu` user AFTER `ghost backup` (C3). See docs/stage-7/PHASE-C-RUNSHEET.md.
#
# [WRITES BACKUP FILES] It only creates a NEW folder ~/backup/pre-launch-YYYYMMDD-HHMMSS and writes into it.
# It does not change Ghost, MySQL, Nginx, settings or content (the database is only read: mysqldump and
# SELECT queries). No password is typed or printed: MySQL root uses auth_socket (I30).
# It prints "PHASE C SERVER BACKUP OK" only when every check passes; otherwise "STOP: …".
set -u
umask 077
fail() { echo "STOP: $1"; echo "STOP: Phase C server backup FAILED. Do not continue; send this output."; exit 1; }

GHOST_DIR="${GHOST_DIR:-/var/www/himandme}"   # overridable only for a dry run of this script
ETC="${ETC:-/etc}"
DB=himandme
TS="$(date +%Y%m%d-%H%M%S)"
BK="$HOME/backup/pre-launch-$TS"

[ -d "$GHOST_DIR/content" ] || fail "$GHOST_DIR/content not found"
[ ! -e "$BK" ] || fail "$BK already exists"
mkdir -p "$BK" || fail "cannot create $BK"
chmod 700 "$HOME/backup" "$BK" || fail "cannot set permissions on the backup folder"
cd "$BK" || fail "cannot enter $BK"
echo "Backup folder: $BK"

# C3 (collect): the zip that `ghost backup` wrote into the Ghost folder in the previous step.
Z="$(ls -t "$GHOST_DIR"/backup-from-v*.zip 2>/dev/null | head -n 1)"
[ -n "$Z" ] || fail "no backup-from-v*.zip in $GHOST_DIR: run C3 (ghost backup) first"
[ -n "$(find "$Z" -mmin -180)" ] || fail "the newest ghost backup zip is older than 3 hours: $Z (run C3 again)"
cp -p "$Z" "$BK/" || fail "cannot copy $Z into $BK"   # the original is removed only after full success
ZB="$BK/$(basename "$Z")"
unzip -l "$ZB" > c3-ghost-backup-contents.txt 2>&1 || fail "the ghost backup zip cannot be read"
for want in '\.json' 'images/' 'themes/' 'settings/'; do
  grep -q "$want" c3-ghost-backup-contents.txt || fail "the ghost backup zip has no entry matching $want"
done
echo "C3 ghost backup collected: $(basename "$ZB")"

# C4: MySQL dump (approved form, plan §8.2 and the monthly runbook).
sudo mysqldump --single-transaction --no-tablespaces --default-character-set=utf8mb4 "$DB" > c4-ghost-himandme.sql 2> c4-ghost-himandme.sql.err
rc=$?
[ "$rc" -eq 0 ] || fail "mysqldump exited with status $rc (see $BK/c4-ghost-himandme.sql.err)"
[ -s c4-ghost-himandme.sql ] || fail "the dump is empty"
[ ! -s c4-ghost-himandme.sql.err ] || fail "mysqldump reported errors or warnings (see $BK/c4-ghost-himandme.sql.err)"
tail -n 1 c4-ghost-himandme.sql | grep -q "Dump completed" || fail "the dump does not end with 'Dump completed'"
grep -q "CREATE TABLE \`posts\`" c4-ghost-himandme.sql || fail "the dump has no posts table"
echo "C4 MySQL dump OK"

# Reference values for the C8 restore test and the C6 cross-check (read-only queries; values, not credentials).
sudo mysql -N -B "$DB" > c4-db-reference.txt 2>&1 <<'SQL' || fail "the reference queries failed (see c4-db-reference.txt)"
SELECT 'posts_rows', COUNT(*) FROM posts;
SELECT 'posts_by_type_status', type, status, COUNT(*) FROM posts GROUP BY type, status;
SELECT 'tables', COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE();
SELECT 'charset_collation', DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = DATABASE();
SELECT 'active_theme', value FROM settings WHERE `key` = 'active_theme';
SELECT 'is_private', value FROM settings WHERE `key` = 'is_private';
SELECT 'llms_enabled', value FROM settings WHERE `key` = 'llms_enabled';
SQL
grep -q '^posts_rows' c4-db-reference.txt || fail "no post count in c4-db-reference.txt"

# C5: content folder (logs excluded: not needed to restore, and they change while being read) and Nginx configuration.
sudo tar czf c5-content.tgz --exclude=content/logs -C "$GHOST_DIR" content 2> c5-content.err || fail "tar of content failed (see c5-content.err)"
sudo tar czf c5-nginx-etc.tgz -C "$ETC" nginx 2> c5-nginx.err || fail "tar of /etc/nginx failed (see c5-nginx.err)"
sudo chown "$(id -un):$(id -gn)" c5-content.tgz c5-nginx-etc.tgz || fail "cannot take ownership of the archives"
chmod 600 c5-content.tgz c5-nginx-etc.tgz
tar tzf c5-content.tgz > c5-content-list.txt || fail "c5-content.tgz cannot be read"
grep -q '^content/settings/routes.yaml$' c5-content-list.txt || fail "content/settings/routes.yaml missing from c5-content.tgz"
grep -q '^content/themes/' c5-content-list.txt || fail "content/themes missing from c5-content.tgz"
tar tzf c5-nginx-etc.tgz > c5-nginx-list.txt || fail "c5-nginx-etc.tgz cannot be read"
grep -q '^nginx/sites-available/himandme' c5-nginx-list.txt || fail "the himandme site configuration is missing from c5-nginx-etc.tgz"
if grep -qiE '\.key$|privkey' c5-nginx-list.txt; then fail "a private-key file is inside /etc/nginx; stop and send the file names only"; fi
echo "C5 content and Nginx archives OK ($(wc -l < c5-content-list.txt) and $(wc -l < c5-nginx-list.txt) entries)"

# C10: every currently public URL (old site, still public), plan §8.2.
{ for s in posts pages tags authors; do curl -s "${SITE:-https://himandme.my}/sitemap-$s.xml"; done | grep -o '<loc>[^<]*' | sed 's/<loc>//'
  printf '%s\n' https://himandme.my/ https://himandme.my/rss/ https://himandme.my/sitemap.xml; } | sort -u > c10-old-urls.txt
[ "$(wc -l < c10-old-urls.txt)" -ge 4 ] || fail "c10-old-urls.txt has fewer than 4 URLs"
cp c10-old-urls.txt "$HOME/backup/old-urls.txt" || fail "cannot write ~/backup/old-urls.txt (used by D2b)"
echo "C10 public URL list: $(wc -l < c10-old-urls.txt) URLs"

# Versions (no secrets).
{ echo "date: $(date -Is)"; echo "host: $(hostname)"; echo "kernel: $(uname -r)"
  echo "mysql: $(mysql --version)"; echo "node: $(node -v 2>&1)"
  ( cd "$GHOST_DIR" && ghost version 2>&1 ) | sed 's/^/ghost: /'; } > versions.txt

# Checksums of everything in the folder.
sha256sum -- * > SHA256SUMS || fail "cannot write SHA256SUMS"
sha256sum -c --quiet SHA256SUMS || fail "checksum self-check failed"

echo
echo "Files:"; ls -la "$BK"
echo
echo "Reference values (needed for C8):"; cat c4-db-reference.txt
echo
echo "C10 URLs:"; cat c10-old-urls.txt
echo
cmp -s "$Z" "$ZB" && rm -f "$Z" || fail "cannot remove the original ghost backup zip after copying it"
echo "PHASE C SERVER BACKUP OK: $BK"
echo
echo "Next (C7), in PowerShell on your computer:"
echo "  mkdir \$env:USERPROFILE\\himandme-backup"
echo "  scp -r $(id -un)@himandme.my:backup/pre-launch-$TS \$env:USERPROFILE\\himandme-backup\\"
